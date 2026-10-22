const db = require('./db');
const crypto = require('crypto');

// ========== 接口调用日志 ==========
// 公共日志函数：记录用户、接口名、入参、出参、调用时间、耗时
function safeStr(v, max = 8000) {
  try {
    const s = typeof v === 'string' ? v : JSON.stringify(v);
    return s.length > max ? s.slice(0, max) : s;
  } catch { return String(v).slice(0, max); }
}

async function writeApiLog(action, username, input, output, costMs) {
  // 登录接口从返回结果中取用户名（登录前无 session）
  if (!username && action === 'login' && output && output.success && output.data) {
    username = output.data.username || null;
  }
  try {
    await db.query(
      'INSERT INTO api_log (username, action, input_params, output_params, call_time, cost_ms) VALUES (?, ?, ?, ?, NOW(), ?)',
      [username, action, safeStr(input, 8000), safeStr(output, 8000), costMs]
    );
  } catch (e) {
    console.error('写接口日志失败:', e.message);
  }
}

// ========== 接口调用日志查询 ==========
// 入参: { username, action, input_params, output_params, start_time, end_time, page, page_size }
// 字符串字段模糊匹配，时间范围按 call_time 过滤
async function queryApiLogs(data = {}) {
  const { where, params } = buildConditions({
    username: ['username', 'like'],
    action: ['action', 'like'],
    input_params: ['input_params', 'like'],
    output_params: ['output_params', 'like']
  }, data);

  const conditions = where ? [where.replace(/^ WHERE /, '')] : [];
  const allParams = [...params];
  if (data.start_time) { conditions.push('call_time >= ?'); allParams.push(data.start_time); }
  if (data.end_time) { conditions.push('call_time <= ?'); allParams.push(data.end_time); }
  const finalWhere = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';

  return {
    success: true,
    data: await pagedQuery({
      baseSql: 'SELECT id, username, action, input_params, output_params, call_time, cost_ms FROM api_log',
      countSql: 'SELECT COUNT(*) AS total FROM api_log',
      where: finalWhere,
      params: allParams,
      orderBy: 'id DESC',
      data
    })
  };
}

// ========== 登录会话管理 ==========
// token -> { username, realname, login_time }
const sessions = new Map();

// 登录：校验用户名密码，成功后返回 token
async function login(data = {}) {
  const username = String(data.username ?? '').trim();
  const password = String(data.password ?? '');
  if (!username || !password) {
    return { success: false, message: '请输入用户名和密码' };
  }

  const row = await db.findOne('user', { username });
  if (!row || String(row.password) !== password) {
    return { success: false, message: '用户名或密码错误' };
  }

  const token = crypto.randomUUID();
  sessions.set(token, {
    username: row.username,
    realname: row.realname,
    login_time: new Date().toISOString()
  });

  return {
    success: true,
    data: { token, username: row.username, realname: row.realname }
  };
}

// 校验 token，返回当前登录用户，未登录返回 null
function getSession(token) {
  return sessions.get(String(token || '')) || null;
}

// 退出登录：销毁会话
function logout(token) {
  sessions.delete(String(token || ''));
  return { success: true };
}

// 接口1：物料条码查询
// 入参: "物料号#8位数字#4位数字"
async function queryMaterial(barcode) {
  // 格式校验：用 # 隔开的三段，第二段 8 位数字，第三段 4 位数字
  const parts = barcode.split('#');
  if (parts.length !== 3 || !/^\d{8}$/.test(parts[1]) || !/^\d{4}$/.test(parts[2])) {
    return { success: false, message: `条码不符合格式: ${barcode}` };
  }

  const materialId = parts[0];
  const row = await db.findOne('material', { material_id: materialId });
  if (!row) {
    return { success: false, message: `物料不存在: ${materialId}` };
  }
  return {
    success: true,
    data: {
      material_id: row.material_id,
      material_name: row.material_name,
      material_spec: row.material_spec,
      inspect_category: row.inspect_category
    }
  };
}

// 接口2：批次是否已检验
// 入参: 批次号字符串
async function checkBatch(batchNo) {
  const row = await db.findOne('inspection_record', { batch_no: batchNo });
  if (row) {
    return { success: false, message: `该条码已经检验过了: ${batchNo}` };
  }
  return { success: true, data: { batch_no: batchNo } };
}

// 将检验规则入参（数组或分隔字符串）统一拆分为规则编码数组
function splitRules(v) {
  if (Array.isArray(v)) return v.map(s => String(s).trim()).filter(Boolean);
  return String(v ?? '').split(/[,，;；\s]+/).map(s => s.trim()).filter(Boolean);
}

// 校验标准区间格式："最小值,最大值"（两个数字用逗号隔开）
// 空值返回 { value: null }；合法返回归一化的 "min,max"；不合法返回 { error }
function parseStdRange(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return { value: null };
  const parts = s.split(',');
  if (parts.length !== 2) return { error: '标准区间必须为「最小值,最大值」格式（两个数字用逗号隔开）' };
  const min = Number(parts[0].trim());
  const max = Number(parts[1].trim());
  if (isNaN(min) || isNaN(max)) return { error: '标准区间的最小值/最大值必须为数字' };
  if (min > max) return { error: '标准区间的最小值不能大于最大值' };
  return { value: `${min},${max}` };
}

// 接口3：根据物料号获取检验项目
// 入参: 物料号字符串
// 流程: material.inspect_category(可多个规则) -> inspection_rule_item(rule_code/rule_id) -> item_id, item_name
async function getInspectItems(materialId) {
  const material = await db.findOne('material', { material_id: materialId });
  if (!material || !material.inspect_category) {
    return { success: true, data: [] };
  }
  const ruleCodes = splitRules(material.inspect_category);
  if (ruleCodes.length === 0) {
    return { success: true, data: [] };
  }
  const placeholders = ruleCodes.map(() => '?').join(',');
  const rows = await db.query(
    `SELECT r.item_id, r.item_name, i.item_type, r.standard_value, r.standard_range,
            rr.rule_code, rr.rule_name
     FROM inspection_rule_item r
     LEFT JOIN inspection_item i ON i.item_id = r.item_id
     LEFT JOIN inspection_rule rr ON rr.id = r.rule_id
     WHERE r.rule_code IN (${placeholders})
     ORDER BY r.rule_code, r.seq`,
    ruleCodes
  );
  // 同一检验项目出现在多个规则中时只带出一次
  const seen = new Set();
  const items = [];
  for (const row of rows) {
    if (seen.has(row.item_id)) continue;
    seen.add(row.item_id);
    items.push(row);
  }
  return { success: true, data: items };
}

// 整单结论判定：存在不合格明细即判不合格；无明细判不合格
// 未录入（is_pass 为 NULL）的明细不参与判定
// createInspection 与 updateInspectionDetail 共用此口径，保证新增 / 修改判定一致
function judgeResult(items) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return 0;
  return list.some(it => it.is_pass !== null && it.is_pass !== undefined && Number(it.is_pass) === 0) ? 0 : 1;
}

// 检验单是否完成：明细全部有录入值（测量值或说明非空）→ 1，否则 0
// 无明细视为未完成
async function calcInspectionComplete(conn, recordId) {
  const [rows] = await conn.execute(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN (measured_val IS NOT NULL AND TRIM(measured_val) != '')
                       OR (measured_text IS NOT NULL AND TRIM(measured_text) != '') THEN 1 ELSE 0 END) AS filled
     FROM inspection_record_detail WHERE record_id = ?`,
    [recordId]
  );
  const total = Number(rows[0].total) || 0;
  const filled = Number(rows[0].filled) || 0;
  return total > 0 && filled === total ? 1 : 0;
}

// 明细是否已录入：测量值或说明任一非空
function hasMeasured(item) {
  const v = item.measured_val;
  if (v !== null && v !== undefined && String(v).trim() !== '') return true;
  const t = item.measured_text;
  return t !== null && t !== undefined && String(t).trim() !== '';
}

// 接口4：生成检验单
// 入参 data:
// {
//   material_id, batch_no, rule_code, inspect_date, inspector, remark,
//   items: [{ item_id, item_name, measured_val, measured_text, is_pass, remark }]
// }
// 整单结论由明细判定，不采用入参 result
// 事务写入 inspection_record + inspection_record_detail
async function createInspection(data) {
  const { material_id, batch_no, rule_code, inspect_date, inspector, create_by, remark, items = [] } = data;

  // 未录入的项目写 NULL 判定（不参与整单结论），已录入的按入参 is_pass
  const normalized = items.map(it => ({
    ...it,
    is_pass: hasMeasured(it) ? (it.is_pass ?? 1) : null
  }));
  const finalResult = judgeResult(normalized);

  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();

    const [recordResult] = await conn.execute(
      'INSERT INTO inspection_record (material_id, batch_no, rule_code, inspect_date, inspector, create_by, result, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [material_id, batch_no, rule_code || null, inspect_date || new Date(), inspector, create_by || null, finalResult, remark || null]
    );
    const recordId = recordResult.insertId;

    for (const item of normalized) {
      await conn.execute(
        'INSERT INTO inspection_record_detail (record_id, item_id, item_name, measured_val, measured_text, is_pass, remark) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [recordId, item.item_id, item.item_name || null, item.measured_val ?? null, item.measured_text || null, item.is_pass, item.remark || null]
      );
    }

    // 是否完成：全部项目均有录入值
    const isComplete = await calcInspectionComplete(conn, recordId);
    await conn.execute('UPDATE inspection_record SET is_complete = ? WHERE id = ?', [isComplete, recordId]);

    await conn.commit();
    return { success: true, data: { record_id: recordId, batch_no, result: finalResult, is_complete: isComplete } };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// 接口5：查询检验单列表
// 入参 data（全部可选，组合筛选）:
// {
//   material_id, batch_no, inspector, rule_code,   // 模糊匹配
//   date_start, date_end,                          // 检验日期范围
//   page, page_size                                // 分页，默认 1 / 20
// }
async function queryInspectionList(data) {
  const { material_id, batch_no, inspector, rule_code, date_start, date_end, is_complete } = data;
  const page = Math.max(1, Number(data.page) || 1);
  const pageSize = Math.min(200, Math.max(1, Number(data.page_size) || 20));

  let sql = `SELECT r.id, r.material_id, m.material_name, m.material_spec,
                    r.batch_no, r.rule_code, r.inspect_date, r.inspector,
                    r.result, r.is_complete, r.remark, r.created_time,
                    (SELECT COUNT(*) FROM inspection_record_detail d
                      WHERE d.record_id = r.id
                        AND ((d.measured_val IS NOT NULL AND TRIM(d.measured_val) != '')
                          OR (d.measured_text IS NOT NULL AND TRIM(d.measured_text) != ''))) AS scanned_qty,
                    (SELECT COUNT(*) FROM inspection_record_detail d WHERE d.record_id = r.id) AS required_qty
             FROM inspection_record r
             LEFT JOIN material m ON m.material_id = r.material_id`;
  let countSql = 'SELECT COUNT(*) AS total FROM inspection_record r';
  const conditions = [];
  const params = [];

  if (material_id) { conditions.push('r.material_id LIKE ?'); params.push(`%${material_id}%`); }
  if (batch_no) { conditions.push('r.batch_no LIKE ?'); params.push(`%${batch_no}%`); }
  if (inspector) { conditions.push('r.inspector LIKE ?'); params.push(`%${inspector}%`); }
  if (rule_code) { conditions.push('r.rule_code LIKE ?'); params.push(`%${rule_code}%`); }
  if (is_complete !== undefined && is_complete !== null && is_complete !== '') {
    conditions.push('r.is_complete = ?'); params.push(Number(is_complete));
  }
  if (date_start) { conditions.push('r.inspect_date >= ?'); params.push(date_start); }
  if (date_end) {
    // 只传日期（yyyy-mm-dd）时补足到当天 23:59:59，避免漏掉当天有时分的记录
    const end = String(date_end);
    conditions.push('r.inspect_date <= ?');
    params.push(end.length === 10 ? `${end} 23:59:59` : end);
  }

  if (conditions.length > 0) {
    const where = ' WHERE ' + conditions.join(' AND ');
    sql += where;
    countSql += where;
  }

  sql += ' ORDER BY r.created_time DESC LIMIT ? OFFSET ?';

  const [rows] = await db.pool.query(sql, [...params, pageSize, (page - 1) * pageSize]);
  const [countRows] = await db.pool.query(countSql, params);

  return {
    success: true,
    data: {
      total: countRows[0].total,
      page,
      page_size: pageSize,
      list: rows
    }
  };
}

// 接口6：查询检验单明细
// 入参: SN号（batch_no），返回单头（联 material 带出物料名称）+ 明细列表
async function getInspectionDetail(sn) {
  const [records] = await db.pool.query(
    `SELECT r.id, r.material_id, m.material_name, m.material_spec,
            r.batch_no, r.rule_code, r.inspect_date, r.inspector, r.create_by,
            r.result, r.is_complete, r.remark, r.created_time, r.update_by, r.update_time,
            (SELECT COUNT(*) FROM inspection_record_detail d
              WHERE d.record_id = r.id
                AND ((d.measured_val IS NOT NULL AND TRIM(d.measured_val) != '')
                  OR (d.measured_text IS NOT NULL AND TRIM(d.measured_text) != ''))) AS scanned_qty,
            (SELECT COUNT(*) FROM inspection_record_detail d WHERE d.record_id = r.id) AS required_qty
     FROM inspection_record r
     LEFT JOIN material m ON m.material_id = r.material_id
     WHERE r.batch_no = ?`,
    [sn]
  );
  if (records.length === 0) {
    return { success: false, message: `检验单不存在: ${sn}` };
  }
  const details = await db.query(
    `SELECT d.id, d.item_id, d.item_name, d.measured_val, d.measured_text, d.is_pass, d.remark,
            ri.standard_value, ri.standard_range, ii.item_type
     FROM inspection_record_detail d
     LEFT JOIN inspection_record r ON r.id = d.record_id
     LEFT JOIN inspection_rule_item ri ON ri.item_id = d.item_id AND FIND_IN_SET(ri.rule_code, r.rule_code)
     LEFT JOIN inspection_item ii ON ii.item_id = d.item_id
     WHERE d.record_id = ?
     ORDER BY d.id`,
    [records[0].id]
  );
  return { success: true, data: { record: records[0], details } };
}

// 接口29：修改检验单明细（单身数据）
// 入参: { batch_no, update_by, items: [{ id, measured_val, measured_text, is_pass, remark }] }
// 按明细 id 更新对应单身；同时重算单头结论（全部单项合格=1，否则=0），并记录更新人员/更新时间
async function updateInspectionDetail(data) {
  const { batch_no, update_by, items = [] } = data;
  if (!batch_no) {
    return { success: false, message: '缺少检验单号' };
  }
  const [records] = await db.pool.query('SELECT id FROM inspection_record WHERE batch_no = ?', [batch_no]);
  if (records.length === 0) {
    return { success: false, message: `检验单不存在: ${batch_no}` };
  }
  const recordId = records[0].id;

  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();

    // === 历史：把修改前的单身明细逐行存入历史表（平铺结构，与装配历史一致） ===
    const [beforeDetails] = await conn.execute(
      `SELECT id, item_id, item_name, measured_val, measured_text, is_pass, remark, created_time
       FROM inspection_record_detail WHERE record_id = ? ORDER BY id`, [recordId]
    );
    const [maxVerRow] = await conn.execute(
      'SELECT COALESCE(MAX(version_no), 0) AS max_v FROM inspection_record_history WHERE record_id = ?',
      [recordId]
    );
    const nextVersion = (maxVerRow[0].max_v || 0) + 1;
    for (const d of beforeDetails) {
      await conn.execute(
        `INSERT INTO inspection_record_history
           (record_id, version_no, detail_id, item_id, item_name, measured_val, measured_text, is_pass, origin_created_time, remark, change_by, change_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [recordId, nextVersion, d.id, d.item_id, d.item_name, d.measured_val, d.measured_text,
         d.is_pass, d.created_time, d.remark, update_by || null]
      );
    }
    // 修改前无明细也写一条版本标记，保证版本链完整
    if (beforeDetails.length === 0) {
      await conn.execute(
        `INSERT INTO inspection_record_history (record_id, version_no, detail_id, change_by, change_time)
         VALUES (?, ?, NULL, ?, NOW())`,
        [recordId, nextVersion, update_by || null]
      );
    }

    for (const it of items) {
      if (!it.id) continue;
      // 未录入的项目 is_pass 存 NULL（未判定）
      const pass = hasMeasured(it) ? (it.is_pass === null || it.is_pass === undefined ? 1 : it.is_pass) : null;
      await conn.execute(
        'UPDATE inspection_record_detail SET measured_val=?, measured_text=?, is_pass=?, remark=? WHERE id=? AND record_id=?',
        [
          it.measured_val === undefined || it.measured_val === '' ? null : it.measured_val,
          it.measured_text || null,
          pass,
          it.remark || null,
          it.id,
          recordId
        ]
      );
    }

    // 重算单头结论：与 judgeResult 同一口径——未录入(IS NULL)不参与，存在不合格即不合格
    const [rows] = await conn.execute(
      `SELECT COUNT(*) AS total, COALESCE(SUM(is_pass = 0), 0) AS fail
       FROM inspection_record_detail WHERE record_id = ?`,
      [recordId]
    );
    const result = rows[0].total > 0 && Number(rows[0].fail) === 0 ? 1 : 0;
    const isComplete = await calcInspectionComplete(conn, recordId);

    await conn.execute(
      'UPDATE inspection_record SET result=?, is_complete=?, update_by=?, update_time=NOW() WHERE id=?',
      [result, isComplete, update_by || null, recordId]
    );

    await conn.commit();
    return { success: true, data: { record_id: recordId, result, is_complete: isComplete, version: nextVersion } };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// 通用分页查询：拼接筛选条件与分页参数并执行
// filterDefs: { 入参字段名: [SQL列名, 'like' | 'eq'] }
function buildConditions(filterDefs, data) {
  const conditions = [];
  const params = [];
  for (const [field, [column, mode]] of Object.entries(filterDefs)) {
    const v = data[field];
    if (v === undefined || v === null || String(v).trim() === '') continue;
    if (mode === 'like') {
      conditions.push(`${column} LIKE ?`);
      params.push(`%${String(v).trim()}%`);
    } else {
      conditions.push(`${column} = ?`);
      params.push(v);
    }
  }
  return { where: conditions.length ? ' WHERE ' + conditions.join(' AND ') : '', params };
}

async function pagedQuery({ baseSql, countSql, where, params, orderBy, data, groupBy }) {
  const page = Math.max(1, Number(data.page) || 1);
  const pageSize = Math.min(200, Math.max(1, Number(data.page_size) || 20));
  const gb = groupBy ? ` GROUP BY ${groupBy}` : '';
  const [rows] = await db.pool.query(
    `${baseSql}${where}${gb} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    [...params, pageSize, (page - 1) * pageSize]
  );
  const [countRows] = await db.pool.query(`${countSql}${where}`, params);
  return { total: countRows[0].total, page, page_size: pageSize, list: rows };
}

// 接口6：查询检验项目（inspection_item 基础资料）
// 入参: { item_id, item_name, item_type, is_active, page, page_size } 前三项模糊，is_active 精确
async function queryInspectItems(data) {
  const { where, params } = buildConditions({
    item_id: ['item_id', 'like'],
    item_name: ['item_name', 'like'],
    item_type: ['item_type', 'like'],
    is_active: ['is_active', 'eq']
  }, data);
  return {
    success: true,
    data: await pagedQuery({
      baseSql: 'SELECT item_id, item_name, item_type, is_active, create_by, created_time, update_by, update_time FROM inspection_item',
      countSql: 'SELECT COUNT(*) AS total FROM inspection_item',
      where, params, orderBy: 'item_id', data
    })
  };
}

// 接口7：查询物料（material）
// 入参: { material_id, material_name, material_spec, inspect_category, is_active, page, page_size } 前四项模糊，is_active 精确
async function queryMaterials(data) {
  const { where, params } = buildConditions({
    material_id: ['material_id', 'like'],
    material_name: ['material_name', 'like'],
    material_spec: ['material_spec', 'like'],
    inspect_category: ['inspect_category', 'like'],
    is_active: ['is_active', 'eq']
  }, data);
  return {
    success: true,
    data: await pagedQuery({
      baseSql: 'SELECT material_id, material_name, material_spec, inspect_category, is_active, create_by, created_time, update_by, update_time FROM material',
      countSql: 'SELECT COUNT(*) AS total FROM material',
      where, params, orderBy: 'material_id', data
    })
  };
}

// 接口8：查询检验规则列表（按单头 inspection_rule 聚合）
// 入参: { rule_code, rule_name, page, page_size } 均模糊
async function queryRules(data = {}) {
  const { where, params } = buildConditions({
    rule_code: ['rr.rule_code', 'like'],
    rule_name: ['rr.rule_name', 'like']
  }, data);
  return {
    success: true,
    data: await pagedQuery({
      baseSql: `SELECT rr.id, rr.rule_code, rr.rule_name, rr.remark, rr.is_active,
                       rr.create_by, rr.created_time, rr.update_by, rr.update_time,
                       COUNT(ri.id) AS item_count
                FROM inspection_rule rr LEFT JOIN inspection_rule_item ri ON ri.rule_id = rr.id`,
      countSql: 'SELECT COUNT(DISTINCT rr.id) AS total FROM inspection_rule rr',
      where, params, orderBy: 'rr.rule_code', data,
      groupBy: 'rr.id, rr.rule_code, rr.rule_name, rr.remark, rr.is_active, rr.create_by, rr.created_time, rr.update_by, rr.update_time'
    })
  };
}

// 接口8.1：查询单个检验规则详情（单头 + 单身）
// 入参: { id } 或 { rule_code }
async function getInspectRuleDetail(data = {}) {
  const key = data.id ? { id: data.id } : { rule_code: data.rule_code };
  const header = await db.findOne('inspection_rule', key);
  if (!header) return { success: false, message: '检验规则不存在' };
  const items = await db.query(
    `SELECT ri.id, ri.item_id, ri.item_name, ri.standard_value, ri.standard_range, ri.seq,
            ri.create_by, ri.created_time, ri.update_by, ri.update_time,
            ii.item_type
     FROM inspection_rule_item ri
     LEFT JOIN inspection_item ii ON ii.item_id = ri.item_id
     WHERE ri.rule_id = ?
     ORDER BY ri.seq`,
    [header.id]
  );
  return { success: true, data: { header, items } };
}

// 接口8.2：更新检验规则（单头 + 单身全量覆盖，事务内先删后插）
// 入参: { id, rule_name?, remark?, is_active?, items: [{ id?, item_id, item_name, standard_value?, standard_range?, seq? }] }
async function updateInspectRule(data) {
  const { id, rule_name, remark, is_active, update_by, items = [] } = data;
  if (!id) return { success: false, message: '缺少规则 id' };
  const header = await db.findOne('inspection_rule', { id });
  if (!header) return { success: false, message: '检验规则不存在' };

  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();

    // 更新单头
    const headSets = [];
    const headParams = [];
    if (rule_name !== undefined) { headSets.push('rule_name = ?'); headParams.push(rule_name); }
    if (remark !== undefined) { headSets.push('remark = ?'); headParams.push(remark); }
    if (is_active !== undefined) { headSets.push('is_active = ?'); headParams.push(Number(is_active)); }
    // 只要有修改动作，就记录更新人与更新时间
    headSets.push('update_by = ?'); headParams.push(update_by || null);
    headSets.push('update_time = NOW()');
    headParams.push(id);
    await conn.execute(`UPDATE inspection_rule SET ${headSets.join(', ')} WHERE id = ?`, headParams);

    // 校验标准区间
    for (const it of items) {
      if (it.standard_range) {
        const v = parseStdRange(it.standard_range);
        if (v.error) throw new Error(`项目 ${it.item_id}: ${v.error}`);
      }
    }

    // 单身差量更新：按 id 存在则更新，不存在则新增；本次清单中缺失的删除
    const [exist] = await conn.execute('SELECT id FROM inspection_rule_item WHERE rule_id = ?', [id]);
    const existIds = new Set(exist.map(r => r.id));
    const keepIds = new Set();

    for (const it of items) {
      const seq = Number(it.seq) || 0;
      if (it.id && existIds.has(Number(it.id))) {
        keepIds.add(Number(it.id));
        await conn.execute(
          `UPDATE inspection_rule_item SET item_id=?, item_name=?, standard_value=?, standard_range=?, seq=?, update_by=?, update_time=NOW() WHERE id=?`,
          [it.item_id, it.item_name || null, it.standard_value || null, it.standard_range || null, seq, update_by || null, it.id]
        );
      } else {
        await conn.execute(
          `INSERT INTO inspection_rule_item (rule_id, rule_code, item_id, item_name, standard_value, standard_range, seq, create_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, header.rule_code, it.item_id, it.item_name || null, it.standard_value || null, it.standard_range || null, seq, update_by || null]
        );
      }
    }
    for (const eid of existIds) {
      if (!keepIds.has(eid)) await conn.execute('DELETE FROM inspection_rule_item WHERE id = ?', [eid]);
    }

    await conn.commit();
    return { success: true, data: { id, rule_code: header.rule_code, item_count: items.length } };
  } catch (err) {
    await conn.rollback();
    return { success: false, message: err.message };
  } finally { conn.release(); }
}

// 接口：BOM主件列表（按主件聚合，一个主件一行）
async function queryBomParentList(data) {
  const { where, params } = buildConditions({
    parent_material_id: ['m.material_id', 'like'],
    parent_material_name: ['m.material_name', 'like']
  }, data);
  return {
    success: true,
    data: await pagedQuery({
      baseSql: `SELECT m.material_id AS parent_material_id, m.material_name AS parent_material_name,
                       m.material_spec AS parent_material_spec,
                       MIN(b.created_time) AS created_time,
                       (SELECT b2.create_by FROM bom b2 WHERE b2.parent_material_id = m.material_id ORDER BY b2.id LIMIT 1) AS create_by,
                       MAX(b.update_by) AS update_by, MAX(b.update_time) AS update_time,
                       COALESCE(h.cur_ver, 0) + 1 AS current_version
                FROM bom b
                LEFT JOIN material m ON m.material_id = b.parent_material_id
                LEFT JOIN (
                  SELECT parent_material_id, MAX(version_no) AS cur_ver
                  FROM bom_history
                  GROUP BY parent_material_id
                ) h ON h.parent_material_id = b.parent_material_id`,
      countSql: `SELECT COUNT(DISTINCT parent_material_id) AS total FROM bom b`,
      where, params, orderBy: 'm.material_id', data, groupBy: 'm.material_id, m.material_name, m.material_spec, h.cur_ver'
    })
  };
}

// 接口：BOM明细（单个主件的所有元件）
async function getBomDetail(parentMaterialId) {
  if (!parentMaterialId) return { success: false, message: '缺少 parent_material_id' };
  const parent = await db.query(
    `SELECT material_id, material_name, material_spec FROM material WHERE material_id = ?`,
    [parentMaterialId]
  );
  const items = await db.query(
    `SELECT b.id, b.component_material, cm.material_name AS component_material_name,
            cm.material_spec AS component_material_spec, b.quantity, b.created_time
     FROM bom b
     LEFT JOIN material cm ON cm.material_id = b.component_material
     WHERE b.parent_material_id = ?
     ORDER BY b.id`,
    [parentMaterialId]
  );
  const [verRow] = await db.query(
    `SELECT COALESCE(MAX(version_no), 0) + 1 AS current_version FROM bom_history WHERE parent_material_id = ?`,
    [parentMaterialId]
  );
  return {
    success: true,
    data: {
      parent: parent[0] || { material_id: parentMaterialId, material_name: '-', material_spec: '-' },
      items,
      current_version: (verRow && verRow.current_version) || 0
    }
  };
}

// 接口：更新BOM明细（事务内：先写 bom_history 归档 → 差量更新）
async function updateBomDetail(data) {
  const { parent_material_id, items, update_by } = data;
  if (!parent_material_id) return { success: false, message: '缺少 parent_material_id' };
  if (!items || !Array.isArray(items)) return { success: false, message: '缺少 items 数组' };

  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();

    // === 1. 读取修改前 bom 数据（带 created_time 用于历史归档） ===
    const [existing] = await conn.query(
      'SELECT id, component_material, quantity, created_time FROM bom WHERE parent_material_id = ? ORDER BY id',
      [parent_material_id]
    );

    // === 2. 归档修改前数据到 bom_history ===
    const [maxVerRow] = await conn.query(
      'SELECT COALESCE(MAX(version_no), 0) AS max_v FROM bom_history WHERE parent_material_id = ?',
      [parent_material_id]
    );
    const nextVersion = (maxVerRow[0].max_v || 0) + 1;
    for (const r of existing) {
      await conn.query(
        `INSERT INTO bom_history
           (parent_material_id, version_no, bom_id, component_material, quantity, origin_created_time, change_by, change_time, remark)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NULL)`,
        [parent_material_id, nextVersion, r.id, r.component_material, r.quantity, r.created_time, update_by || null]
      );
    }
    // 即使修改前无明细，也写一条版本标记，保证版本链完整
    if (existing.length === 0) {
      await conn.query(
        `INSERT INTO bom_history
           (parent_material_id, version_no, bom_id, component_material, quantity, change_by, change_time, remark)
         VALUES (?, ?, NULL, '', 1, ?, NOW(), '空版本标记')`,
        [parent_material_id, nextVersion, update_by || null]
      );
    }

    // === 3. 差量更新 bom ===
    const oldMap = new Map();
    existing.forEach(r => oldMap.set(r.component_material, { id: r.id, quantity: r.quantity }));
    const newMap = new Map();
    items.forEach(it => {
      if (it.component_material && !newMap.has(it.component_material)) {
        newMap.set(it.component_material, Number(it.quantity) || 1);
      }
    });
    // 删：旧有新无
    for (const [comp] of oldMap) {
      if (!newMap.has(comp)) {
        await conn.query('DELETE FROM bom WHERE id = ?', [oldMap.get(comp).id]);
      }
    }
    // 插/改：新有
    for (const [comp, qty] of newMap) {
      if (oldMap.has(comp)) {
        if (Number(oldMap.get(comp).quantity) !== Number(qty)) {
          await conn.query('UPDATE bom SET quantity = ? WHERE id = ?', [qty, oldMap.get(comp).id]);
        }
      } else {
        await conn.query(
          'INSERT INTO bom (parent_material_id, component_material, quantity, create_by, update_by, update_time) VALUES (?, ?, ?, ?, ?, NOW())',
          [parent_material_id, comp, qty, update_by || null, update_by || null]
        );
      }
    }
    // 记录本主件 BOM 本次修改的更新人与更新时间
    await conn.query(
      'UPDATE bom SET update_by = ?, update_time = NOW() WHERE parent_material_id = ?',
      [update_by || null, parent_material_id]
    );

    await conn.commit();
    return { success: true, data: { parent_material_id, count: items.length, version: nextVersion } };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// 接口：查询 BOM 的历史版本列表（按版本聚合）
// 入参: { parent_material_id }
async function queryBomHistory(data) {
  const { parent_material_id } = data || {};
  if (!parent_material_id) return { success: false, message: '缺少 parent_material_id' };
  const [list] = await db.pool.query(
    `SELECT version_no, change_by, change_time, COUNT(*) AS detail_count
     FROM bom_history WHERE parent_material_id = ?
     GROUP BY version_no, change_by, change_time
     ORDER BY version_no DESC`,
    [parent_material_id]
  );
  // 过滤空版本标记：把 bom_id IS NULL 且 component_material='' 的行不算 detail_count
  const refined = list.map(v => {
    const realCount = Math.max(0, v.detail_count - 0); // 先不特殊减，后面再做查询过滤
    return { ...v, detail_count: realCount };
  });
  // 重新精确计算每个版本的有效条数（排除空标记行）
  for (const v of refined) {
    const [cnt] = await db.pool.query(
      `SELECT COUNT(*) AS c FROM bom_history
       WHERE parent_material_id = ? AND version_no = ? AND bom_id IS NOT NULL`,
      [parent_material_id, v.version_no]
    );
    v.detail_count = cnt[0].c;
  }
  return { success: true, data: { parent_material_id, list: refined } };
}

// 接口：查看指定版本的 BOM 历史明细
// 入参: { parent_material_id, version_no }
async function getBomHistoryVersion(data) {
  const { parent_material_id, version_no } = data || {};
  if (!parent_material_id || !version_no) return { success: false, message: '缺少参数' };
  const [rows] = await db.pool.query(
    `SELECT h.id, h.parent_material_id, h.version_no, h.bom_id, h.component_material,
            h.quantity, h.origin_created_time, h.change_by, h.change_time, h.remark,
            m.material_name AS component_material_name, m.material_spec AS component_material_spec
     FROM bom_history h
     LEFT JOIN material m ON m.material_id = h.component_material
     WHERE h.parent_material_id = ? AND h.version_no = ? AND h.bom_id IS NOT NULL
     ORDER BY h.id`,
    [parent_material_id, version_no]
  );
  if (!rows.length) return { success: false, message: '历史版本不存在' };
  return {
    success: true,
    data: {
      parent_material_id,
      version_no,
      change_by: rows[0].change_by,
      change_time: rows[0].change_time,
      details: rows
    }
  };
}

// 接口10：检查主件SN是否已完成装配
// 入参: 主件SN字符串，查 assemble_record 中 main_sn=? 且 status=30
async function checkAssemble(mainSn) {
  const rows = await db.query(
    'SELECT id FROM assemble_record WHERE main_sn = ? AND status = 30',
    [mainSn]
  );
  if (rows.length > 0) {
    return { success: false, message: `该SN已经完成装配: ${mainSn}` };
  }
  return { success: true, data: { main_sn: mainSn } };
}

// 接口11：校验物料是否为主件并返回BOM元件列表
// 入参: 物料号字符串，查 bom 表中 parent_material_id=? 的所有元件
async function checkMainMaterial(materialId) {
  const rows = await db.query(
    `SELECT b.component_material, m.material_name AS component_material_name,
            b.quantity, b.id
     FROM bom b
     LEFT JOIN material m ON m.material_id = b.component_material
     WHERE b.parent_material_id = ?
     ORDER BY b.id`,
    [materialId]
  );
  if (rows.length === 0) {
    return { success: false, message: `该物料不是主件: ${materialId}` };
  }
  return { success: true, data: { parent_material_id: materialId, components: rows } };
}

// 接口12：元件SN查重
// 入参: 元件SN字符串，查 assemble_record_detail 关联 assemble_record(status=30)
async function checkComponentSn(componentSn, excludeRecordId) {
  let sql = `SELECT d.id FROM assemble_record_detail d
     INNER JOIN assemble_record r ON r.id = d.record_id
     WHERE d.component_sn = ? AND r.status = 30`;
  const params = [componentSn];
  if (excludeRecordId) {
    sql += ' AND r.id != ?';
    params.push(excludeRecordId);
  }
  const rows = await db.query(sql, params);
  if (rows.length > 0) {
    return { success: false, message: `该元件已经被装配了: ${componentSn}` };
  }
  return { success: true, data: { component_sn: componentSn } };
}

// 接口13：元件BOM验证
// 入参: 主件料号, 元件料号，查 bom 表验证两者是否存在父子关系
async function checkComponentBom(parentMaterialId, componentMaterialId) {
  const rows = await db.query(
    'SELECT id, quantity FROM bom WHERE parent_material_id = ? AND component_material = ?',
    [parentMaterialId, componentMaterialId]
  );
  if (rows.length === 0) {
    return { success: false, message: `该物料不是另一个物料的元件: ${componentMaterialId}` };
  }
  return { success: true, data: { parent_material_id: parentMaterialId, component_material_id: componentMaterialId, quantity: rows[0].quantity } };
}

// 接口38：元件检验记录校验
// 入参: 元件SN，查 inspection_record.batch_no；无检验记录则不允许装配
async function checkComponentInspection(componentSn) {
  const rows = await db.query(
    'SELECT id, result FROM inspection_record WHERE batch_no = ? LIMIT 1',
    [componentSn]
  );
  if (rows.length === 0) {
    return { success: false, message: `该元件没有检验记录，不允许装配: ${componentSn}` };
  }
  return { success: true, data: { component_sn: componentSn, inspection_id: rows[0].id, result: rows[0].result } };
}

// 接口14：装配单提交（仅提交，无暂存）
// 入参 data:
// {
//   main_sn, main_material_id, operator, remark,
//   components: [{ component_sn, component_material_id }]
// }
// status 固定写入 30（已提交）
// 事务写入 assemble_record（单头）+ assemble_record_detail（单身）
async function createAssemble(data) {
  const { main_sn, main_material_id, operator, create_by, remark, components = [] } = data;
  const status = 30;

  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();

    // 取当前主件的 BOM 最新版本号（空历史=v1，有历史=MAX+1）
    const [verRows] = await conn.execute(
      'SELECT COALESCE(MAX(version_no), 0) + 1 AS bom_version FROM bom_history WHERE parent_material_id = ?',
      [main_material_id]
    );
    const bomVersion = verRows[0].bom_version || 0;

    const [recordResult] = await conn.execute(
      'INSERT INTO assemble_record (main_sn, main_material_id, bom_version, status, assemble_date, operator, create_by, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [main_sn, main_material_id, bomVersion, status, new Date(), operator || null, create_by || null, remark || null]
    );
    const recordId = recordResult.insertId;

    for (const c of components) {
      const sn = (c.component_sn || '').trim();
      await conn.execute(
        'INSERT INTO assemble_record_detail (record_id, component_sn, component_material_id) VALUES (?, ?, ?)',
        [recordId, sn || null, c.component_material_id]
      );
    }

    // 判定装配完成状态并写回单头
    const isComplete = await calcAssembleComplete(conn, recordId, main_material_id);
    await conn.execute('UPDATE assemble_record SET is_complete = ? WHERE id = ?', [isComplete, recordId]);

    await conn.commit();
    return { success: true, data: { record_id: recordId, main_sn, status, is_complete: isComplete } };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// 判定装配是否完成：主件 BOM 中每个元件的应扫数量均被「已扫（SN非空）」明细覆盖 → 1，否则 0
// BOM 未配置（无元件要求）时视为完成
async function calcAssembleComplete(conn, recordId, mainMaterialId) {
  const [bom] = await conn.execute(
    'SELECT component_material, quantity FROM bom WHERE parent_material_id = ?',
    [mainMaterialId]
  );
  if (bom.length === 0) return 1;
  const [details] = await conn.execute(
    `SELECT component_material_id, COUNT(*) AS cnt FROM assemble_record_detail
     WHERE record_id = ? AND component_sn IS NOT NULL AND component_sn != ''
     GROUP BY component_material_id`,
    [recordId]
  );
  const cntMap = {};
  details.forEach(d => { cntMap[d.component_material_id] = d.cnt; });
  for (const b of bom) {
    if ((cntMap[b.component_material] || 0) < b.quantity) return 0;
  }
  return 1;
}

// 接口15：查询装配单列表
// 入参 data（全部可选，组合筛选）:
// {
//   main_sn, main_material_id, operator, status,    // 前三项模糊，status 精确
//   date_start, date_end,                            // 装配日期范围
//   page, page_size                                  // 分页
// }
async function queryAssembleList(data) {
  const { main_sn, main_material_id, operator, status, date_start, date_end, is_complete } = data;
  const page = Math.max(1, Number(data.page) || 1);
  const pageSize = Math.min(200, Math.max(1, Number(data.page_size) || 20));

  let sql = `SELECT r.id, r.main_sn, r.main_material_id, r.bom_version, m.material_name AS main_material_name,
                    r.status, r.is_complete, r.assemble_date, r.operator, r.remark, r.created_time,
                    (SELECT COUNT(*) FROM assemble_record_detail d WHERE d.record_id = r.id AND d.component_sn IS NOT NULL AND d.component_sn != '') AS scanned_qty,
                    (SELECT COALESCE(CAST(SUM(b.quantity) AS UNSIGNED), 0) FROM bom b WHERE b.parent_material_id = r.main_material_id) AS required_qty
             FROM assemble_record r
             LEFT JOIN material m ON m.material_id = r.main_material_id`;
  let countSql = 'SELECT COUNT(*) AS total FROM assemble_record r';
  const conditions = [];
  const params = [];

  if (main_sn) { conditions.push('r.main_sn LIKE ?'); params.push(`%${main_sn}%`); }
  if (main_material_id) { conditions.push('r.main_material_id LIKE ?'); params.push(`%${main_material_id}%`); }
  if (operator) { conditions.push('r.operator LIKE ?'); params.push(`%${operator}%`); }
  if (status !== undefined && status !== null && status !== '') { conditions.push('r.status = ?'); params.push(Number(status)); }
  if (is_complete !== undefined && is_complete !== null && is_complete !== '') { conditions.push('r.is_complete = ?'); params.push(Number(is_complete)); }
  if (date_start) { conditions.push('r.assemble_date >= ?'); params.push(date_start); }
  if (date_end) {
    const end = String(date_end);
    conditions.push('r.assemble_date <= ?');
    params.push(end.length === 10 ? `${end} 23:59:59` : end);
  }

  if (conditions.length > 0) {
    const where = ' WHERE ' + conditions.join(' AND ');
    sql += where;
    countSql += where;
  }

  sql += ' ORDER BY r.created_time DESC LIMIT ? OFFSET ?';

  const [rows] = await db.pool.query(sql, [...params, pageSize, (page - 1) * pageSize]);
  const [countRows] = await db.pool.query(countSql, params);

  return {
    success: true,
    data: {
      total: countRows[0].total,
      page,
      page_size: pageSize,
      list: rows
    }
  };
}

// 接口16：查询装配单明细
// 入参: 主件SN（main_sn），返回单头（联 material 带出物料名称）+ 元件明细列表
async function getAssembleDetail(mainSn) {
  const [records] = await db.pool.query(
    `SELECT r.id, r.main_sn, r.main_material_id, r.bom_version, m.material_name, m.material_spec,
            r.status, r.is_complete, r.assemble_date, r.operator, r.create_by, r.remark, r.created_time, r.update_by, r.update_time,
            (SELECT COUNT(*) FROM assemble_record_detail d WHERE d.record_id = r.id AND d.component_sn IS NOT NULL AND d.component_sn != '') AS scanned_qty,
            (SELECT COALESCE(CAST(SUM(b.quantity) AS UNSIGNED), 0) FROM bom b WHERE b.parent_material_id = r.main_material_id) AS required_qty
     FROM assemble_record r
     LEFT JOIN material m ON m.material_id = r.main_material_id
     WHERE r.main_sn = ?`,
    [mainSn]
  );
  if (records.length === 0) {
    return { success: false, message: `装配单不存在: ${mainSn}` };
  }
  const details = await db.query(
    'SELECT id, component_sn, component_material_id, created_time FROM assemble_record_detail WHERE record_id = ? ORDER BY id',
    [records[0].id]
  );
  // 主件的 BOM 元件清单（供修改场景参考：显示元件名称、校验应扫数量）
  const bom = await db.query(
    `SELECT b.component_material, m.material_name AS component_material_name, b.quantity
     FROM bom b
     LEFT JOIN material m ON m.material_id = b.component_material
     WHERE b.parent_material_id = ?
     ORDER BY b.id`,
    [records[0].main_material_id]
  );
  return { success: true, data: { record: records[0], details, bom } };
}

// 接口30：修改装配单明细（支持新增扫描元件 / 删除已扫元件）
// 入参: { main_sn, update_by, components: [{ component_sn, component_material_id }] }
// 按「整单元件清单」做差量更新：清单中不存在的旧元件删除，新出现的元件插入；保留未变动的元件（保留原 created_time）
// 同时记录更新人员 / 更新时间
async function updateAssembleDetail(data) {
  const { main_sn, update_by, components = [] } = data;
  if (!main_sn) {
    return { success: false, message: '缺少主件SN' };
  }
  const [records] = await db.pool.query('SELECT id, main_material_id FROM assemble_record WHERE main_sn = ?', [main_sn]);
  if (records.length === 0) {
    return { success: false, message: `装配单不存在: ${main_sn}` };
  }
  const recordId = records[0].id;
  const mainMaterialId = records[0].main_material_id;

  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();

    // === 历史：把修改前的单身明细逐行存入历史表（平铺结构，非快照JSON） ===
    const [beforeDetails] = await conn.execute(
      'SELECT id, component_sn, component_material_id, created_time FROM assemble_record_detail WHERE record_id = ?', [recordId]
    );
    const [maxVerRow] = await conn.execute(
      'SELECT COALESCE(MAX(version_no), 0) AS max_v FROM assemble_record_history WHERE record_id = ?',
      [recordId]
    );
    const nextVersion = (maxVerRow[0].max_v || 0) + 1;
    for (const d of beforeDetails) {
      await conn.execute(
        `INSERT INTO assemble_record_history
           (record_id, version_no, detail_id, component_sn, component_material_id, origin_created_time, change_by, change_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [recordId, nextVersion, d.id, d.component_sn, d.component_material_id, d.created_time, update_by || null]
      );
    }
    // 即使修改前无明细，也写入一条版本标记（component_sn 置空串），保证版本链完整
    if (beforeDetails.length === 0) {
      await conn.execute(
        `INSERT INTO assemble_record_history
           (record_id, version_no, detail_id, component_sn, component_material_id, change_by, change_time)
         VALUES (?, ?, NULL, '', NULL, ?, NOW())`,
        [recordId, nextVersion, update_by || null]
      );
    }

    // === 槽位差量更新 ===
    // components 为整单槽位清单：component_sn 非空=已扫槽位，空=未扫槽位
    // 已扫行按 SN 匹配保留（保留原 created_time）；未匹配的已扫行删除；新增 SN 插入；
    // 未扫槽位行全部重建（不含扫描信息，重建无损）
    const filled = components
      .map(c => ({ sn: (c.component_sn || '').trim(), mid: c.component_material_id }))
      .filter(c => c.sn);
    const unfilled = components.filter(c => !(c.component_sn || '').trim());

    const [existRows] = await conn.execute(
      'SELECT id, component_sn FROM assemble_record_detail WHERE record_id = ?',
      [recordId]
    );
    const newSnSet = new Set(filled.map(c => c.sn));
    const keepSnSet = new Set();

    // 删除：未扫槽位行 + 已不在新清单中的已扫行；保留仍存在的已扫行
    for (const e of existRows) {
      if (e.component_sn && newSnSet.has(e.component_sn)) {
        keepSnSet.add(e.component_sn);
      } else {
        await conn.execute('DELETE FROM assemble_record_detail WHERE id = ?', [e.id]);
      }
    }
    // 插入：新扫描的元件
    for (const c of filled) {
      if (!keepSnSet.has(c.sn)) {
        await conn.execute(
          'INSERT INTO assemble_record_detail (record_id, component_sn, component_material_id) VALUES (?, ?, ?)',
          [recordId, c.sn, c.mid || null]
        );
      }
    }
    // 插入：未扫槽位
    for (const c of unfilled) {
      await conn.execute(
        'INSERT INTO assemble_record_detail (record_id, component_sn, component_material_id) VALUES (?, NULL, ?)',
        [recordId, c.component_material_id || null]
      );
    }

    // 重算装配完成状态，连同更新人/时间写回单头
    const isComplete = await calcAssembleComplete(conn, recordId, mainMaterialId);
    await conn.execute(
      'UPDATE assemble_record SET update_by=?, update_time=NOW(), is_complete=? WHERE id=?',
      [update_by || null, isComplete, recordId]
    );

    await conn.commit();
    return { success: true, data: { record_id: recordId, count: components.length, version: nextVersion, is_complete: isComplete } };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// 接口36：查询装配记录的历史版本列表（按版本聚合）
// 入参: { main_sn }  或 { record_id }
async function queryAssembleHistory(data) {
  let rid = data?.record_id;
  if (!rid && data?.main_sn) {
    const [rows] = await db.pool.query('SELECT id FROM assemble_record WHERE main_sn = ?', [data.main_sn]);
    if (!rows.length) return { success: false, message: '装配单不存在' };
    rid = rows[0].id;
  }
  if (!rid) return { success: false, message: '缺少 record_id / main_sn' };
  const [list] = await db.pool.query(
    `SELECT version_no, change_by, change_time, COUNT(*) AS detail_count
     FROM assemble_record_history WHERE record_id = ?
     GROUP BY version_no, change_by, change_time
     ORDER BY version_no DESC`,
    [rid]
  );
  return { success: true, data: { record_id: rid, list } };
}

// 接口37：查看指定版本的历史明细（修改前的单身明细，平铺行）
// 入参: { record_id, version_no }
async function getAssembleHistoryVersion(data) {
  const { record_id, version_no } = data || {};
  if (!record_id || !version_no) return { success: false, message: '缺少参数' };
  const [rows] = await db.pool.query(
    `SELECT id, record_id, version_no, detail_id, component_sn, component_material_id,
            origin_created_time, change_by, change_time, remark
     FROM assemble_record_history WHERE record_id = ? AND version_no = ?
     ORDER BY id`,
    [record_id, version_no]
  );
  if (!rows.length) return { success: false, message: '历史版本不存在' };
  // 过滤版本标记空行（detail_id IS NULL 的行仅用于维持版本链）
  const details = rows.filter(r => r.detail_id != null);
  return {
    success: true,
    data: {
      record_id,
      version_no,
      change_by: rows[0].change_by,
      change_time: rows[0].change_time,
      details
    }
  };
}

// 接口39：查询检验记录的历史版本列表（按版本聚合）
// 入参: { batch_no } 或 { record_id }
async function queryInspectionHistory(data) {
  let rid = data?.record_id;
  if (!rid && data?.batch_no) {
    const [rows] = await db.pool.query('SELECT id FROM inspection_record WHERE batch_no = ?', [data.batch_no]);
    if (!rows.length) return { success: false, message: '检验单不存在' };
    rid = rows[0].id;
  }
  if (!rid) return { success: false, message: '缺少 record_id / batch_no' };
  const [list] = await db.pool.query(
    `SELECT version_no, change_by, change_time, COUNT(*) AS detail_count
     FROM inspection_record_history WHERE record_id = ?
     GROUP BY version_no, change_by, change_time
     ORDER BY version_no DESC`,
    [rid]
  );
  return { success: true, data: { record_id: rid, list } };
}

// 接口40：查看指定版本的历史明细（修改前的单身明细，平铺行）
// 入参: { record_id, version_no }
async function getInspectionHistoryVersion(data) {
  const { record_id, version_no } = data || {};
  if (!record_id || !version_no) return { success: false, message: '缺少参数' };
  const [rows] = await db.pool.query(
    `SELECT id, record_id, version_no, detail_id, item_id, item_name, measured_val, measured_text,
            is_pass, origin_created_time, remark, change_by, change_time
     FROM inspection_record_history WHERE record_id = ? AND version_no = ?
     ORDER BY id`,
    [record_id, version_no]
  );
  if (!rows.length) return { success: false, message: '历史版本不存在' };
  const details = rows.filter(r => r.detail_id != null);
  return {
    success: true,
    data: {
      record_id,
      version_no,
      change_by: rows[0].change_by,
      change_time: rows[0].change_time,
      details
    }
  };
}

// 接口17：新增检验项目
// 入参: { item_id, item_name, item_type(text/number), is_active(1/0) }
async function createInspectItem(data) {
  const { item_id, item_name, item_type, is_active = 1, create_by } = data;
  try {
    await db.insert('inspection_item', {
      item_id,
      item_name,
      item_type: item_type || null,
      is_active,
      create_by: create_by || null
    });
    return { success: true, data: { item_id } };
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return { success: false, message: `检验项目编号已存在: ${item_id}` };
    }
    throw err;
  }
}

async function updateInspectItem(data) {
  const { item_id, item_name, item_type, is_active, update_by } = data;
  if (!item_id) return { success: false, message: '缺少 item_id' };
  const exist = await db.query('SELECT item_id FROM inspection_item WHERE item_id = ?', [item_id]);
  if (!exist.length) return { success: false, message: `检验项目不存在: ${item_id}` };
  const sets = []; const params = [];
  if (item_name !== undefined) { sets.push('item_name = ?'); params.push(item_name); }
  if (item_type !== undefined) { sets.push('item_type = ?'); params.push(item_type || null); }
  if (is_active !== undefined) { sets.push('is_active = ?'); params.push(Number(is_active)); }
  if (!sets.length) return { success: false, message: '没有需要更新的字段' };
  sets.push('update_by = ?'); params.push(update_by || null);
  sets.push('update_time = NOW()');
  params.push(item_id);
  await db.pool.query(`UPDATE inspection_item SET ${sets.join(', ')} WHERE item_id = ?`, params);
  return { success: true, data: { item_id } };
}

// 接口18：新增检验规则
// 入参: { rule_code, rule_desc, items: [{ item_id, item_name, seq, standard_value?, standard_range? }] }
// standard_range 格式："最小值,最大值"（两个数字用逗号隔开）
// 校验 rule_code 唯一性、标准区间格式，事务内先插 inspection_rule 单头再插单身
async function createInspectRule(data) {
  const { rule_code, rule_desc, create_by, items = [] } = data;
  if (!rule_code) {
    return { success: false, message: '规则编码不能为空' };
  }
  // 检查 rule_code 是否已存在（单头表唯一键）
  const exist = await db.query('SELECT id FROM inspection_rule WHERE rule_code = ?', [rule_code]);
  if (exist.length > 0) {
    return { success: false, message: `检验规则编号已存在: ${rule_code}` };
  }
  if (items.length === 0) {
    return { success: false, message: '请至少添加一个检验项目' };
  }
  // 校验每个项目的标准区间格式
  for (const item of items) {
    const r = parseStdRange(item.standard_range);
    if (r.error) {
      return { success: false, message: `检验项目 ${item.item_id}：${r.error}` };
    }
    item.standard_range = r.value;
    item.standard_value = item.standard_value === undefined || item.standard_value === null || String(item.standard_value).trim() === '' ? null : String(item.standard_value).trim();
  }
  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();
    const [headRes] = await conn.execute(
      'INSERT INTO inspection_rule (rule_code, rule_name, create_by) VALUES (?, ?, ?)',
      [rule_code, rule_desc || null, create_by || null]
    );
    const ruleId = headRes.insertId;
    for (const item of items) {
      await conn.execute(
        'INSERT INTO inspection_rule_item (rule_id, rule_code, item_id, item_name, standard_value, standard_range, seq, create_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [ruleId, rule_code, item.item_id, item.item_name || null, item.standard_value, item.standard_range, Number(item.seq) || 0, create_by || null]
      );
    }
    await conn.commit();
    return { success: true, data: { id: ruleId, rule_code, count: items.length } };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// 接口19：新增物料
// 入参: { material_id, material_name, material_spec?, inspect_category?, is_active(1/0) }
// inspect_category 支持数组或分隔字符串，可关联多个检验规则
async function createMaterial(data) {
  const { material_id, material_name, material_spec, inspect_category, is_active = 1, create_by } = data;
  try {
    await db.insert('material', {
      material_id,
      material_name,
      material_spec: material_spec || null,
      inspect_category: splitRules(inspect_category).join(',') || null,
      is_active,
      create_by: create_by || null
    });
    return { success: true, data: { material_id } };
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return { success: false, message: `物料编号已存在: ${material_id}` };
    }
    throw err;
  }
}

async function updateMaterial(data) {
  const { material_id, material_name, material_spec, inspect_category, is_active, update_by } = data;
  if (!material_id) return { success: false, message: '缺少 material_id' };
  const exist = await db.query('SELECT material_id FROM material WHERE material_id = ?', [material_id]);
  if (!exist.length) return { success: false, message: `物料不存在: ${material_id}` };
  const sets = []; const params = [];
  if (material_name !== undefined) { sets.push('material_name = ?'); params.push(material_name); }
  if (material_spec !== undefined) { sets.push('material_spec = ?'); params.push(material_spec || null); }
  if (inspect_category !== undefined) { sets.push('inspect_category = ?'); params.push(splitRules(inspect_category).join(',') || null); }
  if (is_active !== undefined) { sets.push('is_active = ?'); params.push(Number(is_active)); }
  if (!sets.length) return { success: false, message: '没有需要更新的字段' };
  sets.push('update_by = ?'); params.push(update_by || null);
  sets.push('update_time = NOW()');
  params.push(material_id);
  await db.pool.query(`UPDATE material SET ${sets.join(', ')} WHERE material_id = ?`, params);
  return { success: true, data: { material_id } };
}

// 接口20：获取检验规则列表（rule_code + rule_desc），供物料多选关联
async function getRuleCodes() {
  // 返回检验规则的编码与名称（规则说明），供物料多选关联使用
  const rows = await db.query(
    `SELECT id, rule_code, rule_name FROM inspection_rule ORDER BY rule_code`
  );
  return { success: true, data: rows };
}

// 接口21：新增 BOM
// 入参: { parent_material_id, items: [{ component_material, quantity }] }
// 校验主件料号在 material 表存在；校验每个元件料号在 material 表存在；
// 校验 (parent_material_id, component_material) 组合在 bom 表中不重复；事务批量插入
async function createBom(data) {
  const { parent_material_id, items = [], create_by } = data;
  if (!parent_material_id) {
    return { success: false, message: '主件料号不能为空' };
  }
  if (items.length === 0) {
    return { success: false, message: '请至少添加一个元件' };
  }
  // 校验主件料号存在
  const parent = await db.findOne('material', { material_id: parent_material_id });
  if (!parent) {
    return { success: false, message: `主件料号不存在: ${parent_material_id}` };
  }
  // 校验元件料号存在 + 组合不重复
  for (const item of items) {
    const comp = await db.findOne('material', { material_id: item.component_material });
    if (!comp) {
      return { success: false, message: `元件料号不存在: ${item.component_material}` };
    }
    const dup = await db.query(
      'SELECT id FROM bom WHERE parent_material_id = ? AND component_material = ?',
      [parent_material_id, item.component_material]
    );
    if (dup.length > 0) {
      return { success: false, message: `该元件已存在于主件BOM中: ${item.component_material}` };
    }
  }
  // 校验元件料号在本次提交中不重复
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item.component_material)) {
      return { success: false, message: `元件料号重复: ${item.component_material}` };
    }
    seen.add(item.component_material);
  }
  // 事务批量插入
  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const item of items) {
      await conn.execute(
        'INSERT INTO bom (parent_material_id, component_material, quantity, create_by, created_time) VALUES (?, ?, ?, ?, ?)',
        [parent_material_id, item.component_material, Number(item.quantity) || 0, create_by || null, new Date()]
      );
    }
    await conn.commit();
    return { success: true, data: { parent_material_id, count: items.length } };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// 接口22：批量导入检验项目（Excel）
// 入参: { fileData } base64 编码的 Excel 文件内容
// Excel 表头约定: 项目编号 | 项目名称 | 录入类型 | 状态
// 录入类型支持: 文本/数值 或 text/number（默认文本）；状态支持: 启用/停用 或 1/0（默认启用）
// 全部行校验通过才事务批量插入；任一行有错则不导入，返回错误明细
async function importInspectItems(data) {
  const XLSX = require('xlsx');
  const { fileData, create_by } = data;
  if (!fileData) {
    return { success: false, message: '未接收到文件数据' };
  }

  let rows;
  try {
    const workbook = XLSX.read(Buffer.from(fileData, 'base64'), { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  } catch (err) {
    return { success: false, message: `Excel 解析失败: ${err.message}` };
  }
  if (rows.length === 0) {
    return { success: false, message: 'Excel 中没有数据行' };
  }

  // 逐行校验
  const errors = [];
  const seen = new Set();
  const validRows = [];
  rows.forEach((r, i) => {
    const rowNo = i + 2; // Excel 行号（含表头）
    const item_id = String(r['项目编号'] || '').trim();
    const item_name = String(r['项目名称'] || '').trim();
    const rawType = String(r['录入类型'] || '').trim();
    const rawActive = String(r['状态'] || '').trim();

    if (!item_id) { errors.push({ row: rowNo, message: '项目编号不能为空' }); return; }
    if (!item_name) { errors.push({ row: rowNo, message: `项目名称不能为空（${item_id}）` }); return; }
    if (seen.has(item_id)) { errors.push({ row: rowNo, message: `项目编号在 Excel 内重复: ${item_id}` }); return; }
    seen.add(item_id);

    let item_type = 'text';
    if (rawType === '数值' || rawType.toLowerCase() === 'number') item_type = 'number';

    let is_active = 1;
    if (rawActive === '停用' || rawActive === '0') is_active = 0;

    validRows.push({ item_id, item_name, item_type, is_active });
  });

  // 数据库唯一性校验
  for (const r of validRows) {
    const exist = await db.findOne('inspection_item', { item_id: r.item_id });
    if (exist) {
      errors.push({ row: '-', message: `项目编号已存在: ${r.item_id}` });
    }
  }

  if (errors.length > 0) {
    return { success: false, message: `校验失败，共 ${errors.length} 处错误`, errors };
  }

  // 事务批量插入
  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const r of validRows) {
      await conn.execute(
        'INSERT INTO inspection_item (item_id, item_name, item_type, is_active, create_by) VALUES (?, ?, ?, ?, ?)',
        [r.item_id, r.item_name, r.item_type, r.is_active, create_by || null]
      );
    }
    await conn.commit();
    return { success: true, data: { count: validRows.length } };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// 接口23：批量导入检验规则（Excel）
// 入参: { fileData } base64 编码的 Excel 文件内容
// Excel 表头约定: 规则编号 | 规则说明 | 项目编号 | 标准值 | 标准区间
// 标准值/标准区间为项目级字段（每行独立）；标准区间格式："最小值,最大值"（两个数字用逗号隔开）
// 同一规则编号的多行归为一条规则，行序即 seq（每条规则内从 1 开始自动编号）
// 规则说明为规则级字段：同一规则取第一个非空说明；出现多个不同非空说明时报错
// 校验：规则编号/项目编号必填、标准区间格式、项目编号必须存在于 inspection_item、
//       Excel 内同一规则下项目不重复、数据库中规则编号不存在（整条规则新增）
// 全部校验通过才事务批量插入；任一行有错则不导入，返回错误明细
async function importInspectRules(data) {
  const XLSX = require('xlsx');
  const { fileData, create_by } = data;
  if (!fileData) {
    return { success: false, message: '未接收到文件数据' };
  }

  let rows;
  try {
    const workbook = XLSX.read(Buffer.from(fileData, 'base64'), { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  } catch (err) {
    return { success: false, message: `Excel 解析失败: ${err.message}` };
  }
  if (rows.length === 0) {
    return { success: false, message: 'Excel 中没有数据行' };
  }

  // 逐行校验并按规则分组
  const errors = [];
  const rules = new Map(); // rule_code -> { rule_desc, items: [{ item_id, standard_value, standard_range, row }] }
  rows.forEach((r, i) => {
    const rowNo = i + 2; // Excel 行号（含表头）
    const rule_code = String(r['规则编号'] || '').trim();
    const rule_desc = String(r['规则说明'] ?? '').trim();
    const item_id = String(r['项目编号'] || '').trim();
    const standard_value = String(r['标准值'] ?? '').trim();
    const rangeCheck = parseStdRange(r['标准区间']);

    if (!rule_code) { errors.push({ row: rowNo, message: '规则编号不能为空' }); return; }
    if (!item_id) { errors.push({ row: rowNo, message: `项目编号不能为空（规则 ${rule_code}）` }); return; }
    if (rangeCheck.error) { errors.push({ row: rowNo, message: `${rangeCheck.error}（${item_id}）` }); return; }
    if (!rules.has(rule_code)) rules.set(rule_code, { rule_desc: null, items: [] });
    const rule = rules.get(rule_code);
    // 规则说明：取第一个非空值；出现不同的非空说明视为数据错误
    if (rule_desc) {
      if (rule.rule_desc === null) rule.rule_desc = rule_desc;
      else if (rule.rule_desc !== rule_desc) {
        errors.push({ row: rowNo, message: `同一规则的规则说明不一致: ${rule_code}` });
        return;
      }
    }
    if (rule.items.some(it => it.item_id === item_id)) {
      errors.push({ row: rowNo, message: `同一规则下检验项目重复: ${rule_code} / ${item_id}` });
      return;
    }
    rule.items.push({ item_id, standard_value: standard_value || null, standard_range: rangeCheck.value, row: rowNo });
  });

  // 校验项目编号存在于 inspection_item，并带出项目名称
  const itemCache = new Map();
  for (const [rule_code, rule] of rules) {
    for (const it of rule.items) {
      let item = itemCache.get(it.item_id);
      if (item === undefined) {
        item = await db.findOne('inspection_item', { item_id: it.item_id }) || null;
        itemCache.set(it.item_id, item);
      }
      if (!item) {
        errors.push({ row: it.row, message: `检验项目不存在: ${it.item_id}（规则 ${rule_code}）` });
      }
    }
  }

  // 校验规则编号在单头表中不存在
  for (const rule_code of rules.keys()) {
    const exist = await db.query('SELECT id FROM inspection_rule WHERE rule_code = ?', [rule_code]);
    if (exist.length > 0) {
      errors.push({ row: '-', message: `检验规则编号已存在: ${rule_code}` });
    }
  }

  if (errors.length > 0) {
    return { success: false, message: `校验失败，共 ${errors.length} 处错误`, errors };
  }

  // 事务批量插入：每个规则先插单头 inspection_rule，再插单身 inspection_rule_item
  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const [rule_code, rule] of rules) {
      const [headRes] = await conn.execute(
        'INSERT INTO inspection_rule (rule_code, rule_name, create_by) VALUES (?, ?, ?)',
        [rule_code, rule.rule_desc || null, create_by || null]
      );
      const ruleId = headRes.insertId;
      let seq = 1;
      for (const it of rule.items) {
        const item = itemCache.get(it.item_id);
        await conn.execute(
          'INSERT INTO inspection_rule_item (rule_id, rule_code, rule_desc, standard_value, standard_range, item_id, item_name, seq, create_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [ruleId, rule_code, rule.rule_desc || null, it.standard_value, it.standard_range, it.item_id, item.item_name || null, seq++, create_by || null]
        );
      }
    }
    await conn.commit();
    return { success: true, data: { count: rules.size } };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// 接口24：批量导入物料（Excel）
// 入参: { fileData } base64 编码的 Excel 文件内容
// Excel 表头约定: 物料编号 | 物料名称 | 规格 | 检验大类 | 状态
// 状态支持: 启用/停用 或 1/0（默认启用）；规格/检验大类可留空
// 校验：编号/名称必填、Excel 内编号不重复、数据库中编号不存在（整批新增）
// 全部校验通过才事务批量插入；任一行有错则不导入，返回错误明细
async function importMaterials(data) {
  const XLSX = require('xlsx');
  const { fileData, create_by } = data;
  if (!fileData) {
    return { success: false, message: '未接收到文件数据' };
  }

  let rows;
  try {
    const workbook = XLSX.read(Buffer.from(fileData, 'base64'), { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  } catch (err) {
    return { success: false, message: `Excel 解析失败: ${err.message}` };
  }
  if (rows.length === 0) {
    return { success: false, message: 'Excel 中没有数据行' };
  }

  // 逐行校验
  const errors = [];
  const seen = new Set();
  const validRows = [];
  rows.forEach((r, i) => {
    const rowNo = i + 2; // Excel 行号（含表头）
    const material_id = String(r['物料编号'] || '').trim();
    const material_name = String(r['物料名称'] || '').trim();
    const material_spec = String(r['规格'] ?? '').trim();
    const inspect_category = splitRules(String(r['检验大类'] ?? '')).join(',');
    const rawActive = String(r['状态'] ?? '').trim();

    if (!material_id) { errors.push({ row: rowNo, message: '物料编号不能为空' }); return; }
    if (!material_name) { errors.push({ row: rowNo, message: `物料名称不能为空（${material_id}）` }); return; }
    if (seen.has(material_id)) { errors.push({ row: rowNo, message: `物料编号在 Excel 内重复: ${material_id}` }); return; }
    seen.add(material_id);

    let is_active = 1;
    if (rawActive === '停用' || rawActive === '0') is_active = 0;

    validRows.push({ material_id, material_name, material_spec, inspect_category, is_active });
  });

  // 数据库唯一性校验
  for (const r of validRows) {
    const exist = await db.findOne('material', { material_id: r.material_id });
    if (exist) {
      errors.push({ row: '-', message: `物料编号已存在: ${r.material_id}` });
    }
  }

  if (errors.length > 0) {
    return { success: false, message: `校验失败，共 ${errors.length} 处错误`, errors };
  }

  // 事务批量插入
  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const r of validRows) {
      await conn.execute(
        'INSERT INTO material (material_id, material_name, material_spec, inspect_category, is_active, create_by) VALUES (?, ?, ?, ?, ?, ?)',
        [r.material_id, r.material_name, r.material_spec || null, r.inspect_category || null, r.is_active, create_by || null]
      );
    }
    await conn.commit();
    return { success: true, data: { count: validRows.length } };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// 接口25：获取条码格式（全局唯一一条，id=1，不存在时自动初始化默认值）
// 元素固定：二维码、料号、日期、流水
async function getBarcodeRule() {
  let rows = await db.find('barcode_rule', { id: 1 });
  if (!rows.length) {
    await db.insert('barcode_rule', {
      id: 1,
      label_width: 60, label_height: 40,
      qr_size: 30, qr_x: 3, qr_y: 5,
      mid_x: 36, mid_y: 6, mid_font: 10,
      date_x: 36, date_y: 16, date_font: 10,
      serial_x: 36, serial_y: 26, serial_font: 10
    });
    rows = await db.find('barcode_rule', { id: 1 });
  }
  return { success: true, data: rows[0] };
}

// 接口26：更新条码格式（仅调整各元素的位置与尺寸，单位：mm，字号 pt）
async function updateBarcodeRule(data) {
  const fields = ['label_width', 'label_height', 'qr_size', 'qr_x', 'qr_y',
    'mid_x', 'mid_y', 'mid_font', 'date_x', 'date_y', 'date_font',
    'serial_x', 'serial_y', 'serial_font'];
  const values = {};
  for (const k of fields) {
    const v = Number(data[k]);
    if (!Number.isFinite(v) || v < 0) {
      return { success: false, message: `参数不合法: ${k}` };
    }
    values[k] = Math.round(v);
  }
  if (values.label_width < 10 || values.label_height < 10) {
    return { success: false, message: '标签尺寸过小' };
  }
  if (values.qr_size < 5) {
    return { success: false, message: '二维码尺寸过小' };
  }
  await getBarcodeRule(); // 确保记录存在
  await db.update('barcode_rule', values, { id: 1 });
  const rows = await db.find('barcode_rule', { id: 1 });
  return { success: true, data: rows[0] };
}

// 接口31：记录条码打印流水（sn_serial）
// 前端调起打印后调用，写入条码档案表
// 入参: { sn, material_id, sn_date, serial_no }
async function recordSnSerial(data) {
  const { sn, material_id, sn_date, serial_no } = data || {};
  if (!sn || !material_id || !sn_date) {
    return { success: false, message: '缺少必要参数：sn / material_id / sn_date' };
  }
  // 防重复：同 sn 已存在则直接返回成功（不重复写入）
  const exist = await db.findOne('sn_serial', { sn });
  if (exist) {
    return { success: true, data: exist, message: '条码已存在，跳过' };
  }
  const id = await db.insert('sn_serial', {
    sn, material_id, sn_date, serial_no: Number(serial_no) || 0,
    created_time: new Date()
  });
  return { success: true, data: { id, sn } };
}

// 接口32：条码档案查询（sn_serial + material 名称，多维度模糊）
// 入参: { material_id?, sn?, sn_date_start?, sn_date_end?, page, page_size }
async function querySnArchive(data) {
  const f = data || {};
  const page = Number(f.page) || 1;
  const pageSize = Number(f.page_size) || 20;
  const where = [];
  const params = [];
  if (f.material_id) { where.push('s.material_id LIKE ?'); params.push('%' + f.material_id + '%'); }
  if (f.material_name) { where.push('m.material_name LIKE ?'); params.push('%' + f.material_name + '%'); }
  if (f.sn) { where.push('s.sn LIKE ?'); params.push('%' + f.sn + '%'); }
  if (f.sn_date_start) { where.push('s.sn_date >= ?'); params.push(f.sn_date_start); }
  if (f.sn_date_end) { where.push('s.sn_date <= ?'); params.push(f.sn_date_end); }
  const w = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const [{ total }] = await db.query(
    `SELECT COUNT(*) AS total FROM sn_serial s LEFT JOIN material m ON m.material_id = s.material_id ${w}`, params
  );
  const rows = await db.query(
    `SELECT s.*, m.material_name FROM sn_serial s
     LEFT JOIN material m ON m.material_id = s.material_id
     ${w} ORDER BY s.id DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, (page - 1) * pageSize]
  );
  return { success: true, data: { list: rows, total } };
}

// 接口33：批量查 (material_id, sn_date) 组合的最新流水号
// 入参: [{material_id, sn_date}, ...]  为空则返回全局全量
// 返回: { "material_id#sn_date": maxSerialNo }
async function getSerialMap(data) {
  const items = Array.isArray(data) ? data : [];
  let rows;
  if (items.length === 0) {
    rows = await db.query(
      'SELECT material_id, sn_date, MAX(serial_no) AS max_no FROM sn_serial GROUP BY material_id, sn_date'
    );
  } else {
    // 构造 OR 条件：(material_id=? AND sn_date=?) OR ...
    const clauses = [];
    const params = [];
    items.forEach(it => {
      if (it.material_id && it.sn_date) {
        clauses.push('(material_id = ? AND sn_date = ?)');
        params.push(it.material_id, it.sn_date);
      }
    });
    if (!clauses.length) return { success: true, data: {} };
    rows = await db.query(
      `SELECT material_id, sn_date, MAX(serial_no) AS max_no FROM sn_serial
       WHERE ${clauses.join(' OR ')} GROUP BY material_id, sn_date`,
      params
    );
  }
  const map = {};
  rows.forEach(r => { map[`${r.material_id}#${r.sn_date}`] = Number(r.max_no) || 0; });
  return { success: true, data: map };
}

// 接口34：批量删除检验记录（先删明细，再删单头）
// 入参: { ids: [1,2,3] }  单条也支持：{ id: 5 }
async function deleteInspectionRecords(data) {
  let ids = [];
  if (Array.isArray(data?.ids)) ids = data.ids;
  else if (data?.id != null) ids = [data.id];
  if (!ids.length) return { success: false, message: '未指定要删除的记录' };
  const ph = ids.map(() => '?').join(',');
  const exist = await db.query(`SELECT id FROM inspection_record WHERE id IN (${ph})`, ids);
  if (!exist.length) return { success: false, message: '未找到对应记录' };
  const realIds = exist.map(r => r.id);
  const ph2 = realIds.map(() => '?').join(',');
  await db.query(`DELETE FROM inspection_record_detail WHERE record_id IN (${ph2})`, realIds);
  await db.query(`DELETE FROM inspection_record WHERE id IN (${ph2})`, realIds);
  return { success: true, data: { deleted: realIds.length } };
}

// 接口35：批量删除装配记录（先删明细，再删单头；不删元件对应的检验记录）
// 入参: { ids: [...] }  单条也支持：{ id: 5 }
async function deleteAssembleRecords(data) {
  let ids = [];
  if (Array.isArray(data?.ids)) ids = data.ids;
  else if (data?.id != null) ids = [data.id];
  if (!ids.length) return { success: false, message: '未指定要删除的记录' };
  const ph = ids.map(() => '?').join(',');
  const exist = await db.query(`SELECT id FROM assemble_record WHERE id IN (${ph})`, ids);
  if (!exist.length) return { success: false, message: '未找到对应记录' };
  const realIds = exist.map(r => r.id);
  const ph2 = realIds.map(() => '?').join(',');
  await db.query(`DELETE FROM assemble_record_detail WHERE record_id IN (${ph2})`, realIds);
  await db.query(`DELETE FROM assemble_record WHERE id IN (${ph2})`, realIds);
  return { success: true, data: { deleted: realIds.length } };
}

// 接口27：批量导入 BOM（Excel）
// Excel 列：主件料号、元件料号、用量
// 校验：主件/元件料号必填且不相同、用量为正数、Excel 内 (主件+元件) 组合不重复、
//       两个料号在 material 表均存在、(主件+元件) 组合在 bom 表不重复；全部通过才事务插入
async function importBom(data) {
  const XLSX = require('xlsx');
  const { fileData, create_by } = data;
  if (!fileData) {
    return { success: false, message: '未接收到文件数据' };
  }

  let rows;
  try {
    const workbook = XLSX.read(Buffer.from(fileData, 'base64'), { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  } catch (err) {
    return { success: false, message: `Excel 解析失败: ${err.message}` };
  }
  if (rows.length === 0) {
    return { success: false, message: 'Excel 中没有数据行' };
  }

  // 逐行校验
  const errors = [];
  const seen = new Set();
  const validRows = [];
  rows.forEach((r, i) => {
    const rowNo = i + 2; // Excel 行号（含表头）
    const parent_material_id = String(r['主件料号'] || '').trim();
    const component_material = String(r['元件料号'] || '').trim();
    const rawQty = String(r['用量'] ?? '').trim();

    if (!parent_material_id) { errors.push({ row: rowNo, message: '主件料号不能为空' }); return; }
    if (!component_material) { errors.push({ row: rowNo, message: `元件料号不能为空（主件 ${parent_material_id}）` }); return; }
    if (parent_material_id === component_material) { errors.push({ row: rowNo, message: `主件与元件料号不能相同: ${parent_material_id}` }); return; }

    const quantity = Number(rawQty);
    if (rawQty === '' || !Number.isFinite(quantity) || quantity <= 0) {
      errors.push({ row: rowNo, message: `用量必须为正数: ${parent_material_id}-${component_material}` }); return;
    }

    const combo = parent_material_id + '|' + component_material;
    if (seen.has(combo)) {
      errors.push({ row: rowNo, message: `同一主件下的元件在 Excel 内重复: ${parent_material_id}-${component_material}` }); return;
    }
    seen.add(combo);

    validRows.push({ parent_material_id, component_material, quantity });
  });

  // 料号存在性校验（同一料号只查一次）
  const materialExist = new Map();
  for (const r of validRows) {
    for (const mid of [r.parent_material_id, r.component_material]) {
      if (!materialExist.has(mid)) {
        const exist = await db.findOne('material', { material_id: mid });
        materialExist.set(mid, !!exist);
      }
    }
  }
  for (const r of validRows) {
    if (!materialExist.get(r.parent_material_id)) {
      errors.push({ row: '-', message: `主件料号不存在: ${r.parent_material_id}` });
    }
    if (!materialExist.get(r.component_material)) {
      errors.push({ row: '-', message: `元件料号不存在: ${r.component_material}` });
    }
  }

  // BOM 组合重复校验
  for (const r of validRows) {
    const exist = await db.findOne('bom', { parent_material_id: r.parent_material_id, component_material: r.component_material });
    if (exist) {
      errors.push({ row: '-', message: `该元件已存在于主件BOM中: ${r.parent_material_id} - ${r.component_material}` });
    }
  }

  if (errors.length > 0) {
    return { success: false, message: `校验失败，共 ${errors.length} 处错误`, errors };
  }

  // 事务批量插入
  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const r of validRows) {
      await conn.execute(
        'INSERT INTO bom (parent_material_id, component_material, quantity, create_by, created_time) VALUES (?, ?, ?, ?, NOW())',
        [r.parent_material_id, r.component_material, r.quantity, create_by || null]
      );
    }
    await conn.commit();
    return { success: true, data: { count: validRows.length } };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  login,
  getSession,
  logout,
  queryMaterial,
  checkBatch,
  getInspectItems,
  createInspection,
  queryInspectionList,
  getInspectionDetail,
  updateInspectionDetail,
  queryInspectItems,
  queryMaterials,
  queryInspectRules: queryRules,
  getInspectRuleDetail,
  updateInspectRule,
  queryBomParentList,
  getBomDetail,
  updateBomDetail,
  queryBomHistory,
  getBomHistoryVersion,
  checkAssemble,
  checkMainMaterial,
  checkComponentSn,
  checkComponentBom,
  checkComponentInspection,
  createAssemble,
  queryAssembleList,
  getAssembleDetail,
  updateAssembleDetail,
  createInspectItem,
  updateInspectItem,
  createInspectRule,
  createMaterial,
  updateMaterial,
  getRuleCodes,
  createBom,
  importInspectItems,
  importInspectRules,
  importMaterials,
  importBom,
  getBarcodeRule,
  updateBarcodeRule,
  recordSnSerial,
  querySnArchive,
  getSerialMap,
  deleteInspectionRecords,
  deleteAssembleRecords,
  queryAssembleHistory,
  getAssembleHistoryVersion,
  queryInspectionHistory,
  getInspectionHistoryVersion,
  writeApiLog,
  queryApiLogs
};
