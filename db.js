const mysql = require('mysql2/promise');

// 创建连接池
const pool = mysql.createPool({
  host: '192.168.40.118',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'qmes',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true  // 日期以字符串返回，避免时区转换导致日期偏移
});

/**
 * 通用查询
 * @param {string} sql SQL 语句
 * @param {Array} params 参数
 */
async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/**
 * 新增
 * @param {string} table 表名
 * @param {object} data 字段键值对
 * @returns {Promise<number>} 新增记录的 id
 */
async function insert(table, data) {
  const keys = Object.keys(data);
  // undefined 转为 null，避免参数绑定报错（缺失字段由数据库约束处理）
  const values = keys.map(k => (data[k] === undefined ? null : data[k]));
  const sql = `INSERT INTO \`${table}\` (${keys.map(k => `\`${k}\``).join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;
  const [result] = await pool.execute(sql, values);
  return result.insertId;
}

/**
 * 查询（支持条件、分页、排序）
 * @param {string} table 表名
 * @param {object} options { where, fields, orderBy, limit, offset }
 * @example find('user', { where: { name: '张三' }, limit: 10 })
 */
async function find(table, options = {}) {
  const { where = {}, fields = '*', orderBy = '', limit, offset } = options;

  const fieldsStr = Array.isArray(fields) ? fields.map(f => `\`${f}\``).join(', ') : fields;
  let sql = `SELECT ${fieldsStr} FROM \`${table}\``;
  const params = [];

  const keys = Object.keys(where);
  if (keys.length > 0) {
    sql += ' WHERE ' + keys.map(k => `\`${k}\` = ?`).join(' AND ');
    params.push(...keys.map(k => where[k]));
  }

  if (orderBy) sql += ` ORDER BY ${orderBy}`;
  if (limit !== undefined) {
    sql += ' LIMIT ?';
    params.push(Number(limit));
    if (offset !== undefined) {
      sql += ' OFFSET ?';
      params.push(Number(offset));
    }
  }

  return query(sql, params);
}

/**
 * 查询单条
 */
async function findOne(table, where = {}) {
  const rows = await find(table, { where, limit: 1 });
  return rows[0] || null;
}

/**
 * 更新
 * @param {string} table 表名
 * @param {object} data 要更新的字段
 * @param {object} where 条件
 * @returns {Promise<number>} 受影响行数
 */
async function update(table, data, where) {
  const dataKeys = Object.keys(data);
  const whereKeys = Object.keys(where);
  const sql = `UPDATE \`${table}\` SET ${dataKeys.map(k => `\`${k}\` = ?`).join(', ')}` +
    (whereKeys.length ? ` WHERE ${whereKeys.map(k => `\`${k}\` = ?`).join(' AND ')}` : '');
  const params = [...dataKeys.map(k => data[k]), ...whereKeys.map(k => where[k])];
  const [result] = await pool.execute(sql, params);
  return result.affectedRows;
}

/**
 * 删除
 * @param {string} table 表名
 * @param {object} where 条件（必须，防止误删全表）
 * @returns {Promise<number>} 受影响行数
 */
async function remove(table, where) {
  const keys = Object.keys(where);
  if (keys.length === 0) {
    throw new Error('remove 必须提供 where 条件，不允许全表删除');
  }
  const sql = `DELETE FROM \`${table}\` WHERE ${keys.map(k => `\`${k}\` = ?`).join(' AND ')}`;
  const [result] = await pool.execute(sql, keys.map(k => where[k]));
  return result.affectedRows;
}

module.exports = { pool, query, insert, find, findOne, update, remove };
