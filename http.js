const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');
const api = require('./server');

const PORT = 8080;
const WEB_DIR = path.join(__dirname, 'web');
const RESOURCE_DIR = path.join(__dirname, 'resource');
// 对外访问基地址（三坐标报告需返回绝对地址给解析服务使用）
const PUBLIC_BASE = 'http://192.168.40.127:8080';
// 三坐标 PDF 解析服务
const CMM_PARSE_API = 'http://192.168.40.127:4310/api/parse-url';
// 表面面型（PV）图片解析服务
const PV_PARSE_API = 'http://192.168.40.127:4310/api/parse-pv';

// MIME 类型映射
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.bmp': 'image/bmp',
  '.webp': 'image/webp',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.pdf': 'application/pdf'
};

// 解析 multipart/form-data 上传
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const ct = req.headers['content-type'] || '';
    const m = ct.match(/boundary=(.+)/);
    if (!m) return reject(new Error('缺少 boundary'));
    const boundary = '--' + m[1].trim();
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      const files = [];
      let start = 0;
      while (true) {
        const idx = body.indexOf(boundary, start);
        if (idx === -1) break;
        start = idx + boundary.length + 2; // \r\n
        const endIdx = body.indexOf(boundary, start);
        if (endIdx === -1) break;
        const part = body.slice(start, endIdx - 2); // -2 去掉 \r\n
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd === -1) { start = endIdx + boundary.length + 2; continue; }
        const headers = part.slice(0, headerEnd).toString('utf8');
        const fileStart = headerEnd + 4;
        const content = part.slice(fileStart);
        const dispMatch = headers.match(/filename="([^"]*)"/i);
        if (dispMatch) {
          files.push({ filename: dispMatch[1], content, headers });
        }
        start = endIdx + boundary.length + 2;
      }
      resolve(files);
    });
    req.on('error', reject);
  });
}

// HTTP 服务：托管前端静态文件 + resource 资源 + 图片上传接口
const server = http.createServer(async (req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);

  // POST /api/upload 图片上传
  if (req.method === 'POST' && urlPath === '/api/upload') {
    try {
      const files = await parseMultipart(req);
      if (!files.length) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: false, message: '未接收到文件' }));
      }
      // 保存第一个文件
      const f = files[0];
      const ext = path.extname(f.filename) || '.png';
      const safeExt = ext.toLowerCase();
      // 白名单限制
      if (!['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.tif', '.tiff'].includes(safeExt)) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: false, message: '不支持的图片格式' }));
      }
      const maxSize = 100 * 1024 * 1024; // 100MB（TIF 扫描图通常较大）
      if (f.content.length > maxSize) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: false, message: '图片超过 100MB' }));
      }
      if (!fs.existsSync(RESOURCE_DIR)) fs.mkdirSync(RESOURCE_DIR, { recursive: true });
      const ts = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const hash = crypto.randomBytes(6).toString('hex');
      const savedName = `img_${ts}_${hash}${safeExt}`;
      const savedPath = path.join(RESOURCE_DIR, savedName);
      fs.writeFileSync(savedPath, f.content);
      const url = `/resource/${savedName}`;
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ success: true, data: { url, filename: savedName, size: f.content.length } }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ success: false, message: '上传失败: ' + e.message }));
    }
  }

  // POST /api/upload-pdf 三坐标报告上传（仅 PDF，返回绝对地址）
  if (req.method === 'POST' && urlPath === '/api/upload-pdf') {
    try {
      const files = await parseMultipart(req);
      if (!files.length) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: false, message: '未接收到文件' }));
      }
      const f = files[0];
      const safeExt = (path.extname(f.filename) || '').toLowerCase();
      if (safeExt !== '.pdf') {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: false, message: '仅支持 PDF 文件' }));
      }
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (f.content.length > maxSize) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: false, message: 'PDF 超过 50MB' }));
      }
      if (!fs.existsSync(RESOURCE_DIR)) fs.mkdirSync(RESOURCE_DIR, { recursive: true });
      const ts = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const hash = crypto.randomBytes(6).toString('hex');
      const savedName = `cmm_${ts}_${hash}.pdf`;
      fs.writeFileSync(path.join(RESOURCE_DIR, savedName), f.content);
      // 返回可以直接给解析服务使用的绝对地址
      const url = `${PUBLIC_BASE}/resource/${savedName}`;
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ success: true, data: { url, filename: savedName, size: f.content.length } }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ success: false, message: '上传失败: ' + e.message }));
    }
  }

  // GET /api/parse-cmm?path=...  代理调用三坐标解析服务（规避浏览器跨域）
  if (req.method === 'GET' && urlPath === '/api/parse-cmm') {
    try {
      const q = new URL(req.url, 'http://localhost');
      const p = q.searchParams.get('path');
      if (!p) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: false, message: '缺少 path 参数' }));
      }
      const target = `${CMM_PARSE_API}?path=${encodeURIComponent(p)}`;
      const r = await fetch(target);
      const text = await r.text();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(text);
    } catch (e) {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ success: false, message: '解析服务调用失败: ' + e.message }));
    }
  }

  // GET /api/parse-pv?url=...  代理调用表面面型图片解析服务（规避浏览器跨域）
  if (req.method === 'GET' && urlPath === '/api/parse-pv') {
    try {
      const q = new URL(req.url, 'http://localhost');
      const u = q.searchParams.get('url');
      if (!u) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: false, message: '缺少 url 参数' }));
      }
      const target = `${PV_PARSE_API}?url=${encodeURIComponent(u)}`;
      const r = await fetch(target);
      const text = await r.text();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(text);
    } catch (e) {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ success: false, message: '面型解析服务调用失败: ' + e.message }));
    }
  }

  // /resource/* 静态图片资源
  if (urlPath.startsWith('/resource/')) {
    const rel = urlPath.replace(/^\/resource\//, '');
    const filePath = path.join(RESOURCE_DIR, rel);
    // 防目录穿越
    const real = path.resolve(filePath);
    if (!real.startsWith(path.resolve(RESOURCE_DIR))) {
      res.writeHead(403); return res.end('Forbidden');
    }
    if (!fs.existsSync(real) || !fs.statSync(real).isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }
    const ext = path.extname(real).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=3600'
    });
    return fs.createReadStream(real).pipe(res);
  }

  // 托管前端静态文件
  let file = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = path.join(WEB_DIR, file);

  // 防止目录穿越
  if (!filePath.startsWith(WEB_DIR)) {
    res.writeHead(403); return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

// 单据/基础资料创建、修改时需写入的操作人字段（值统一取当前登录用户名）
const OPERATOR_FIELDS = {
  createInspection: ['create_by', 'inspector'],
  updateInspectionDetail: ['update_by'],
  createAssemble: ['create_by', 'operator'],
  updateAssembleDetail: ['update_by'],
  createInspectItem: ['create_by'],
  updateInspectItem: ['update_by'],
  createInspectRule: ['create_by'],
  updateInspectRule: ['update_by'],
  createMaterial: ['create_by'],
  updateMaterial: ['update_by'],
  createArrivalOrder: ['create_by'],
  updateArrivalOrder: ['update_by'],
  createSupplier: ['create_by'],
  updateSupplier: ['update_by'],
  createBom: ['create_by'],
  updateBomDetail: ['update_by'],
  importInspectItems: ['create_by'],
  importInspectRules: ['create_by'],
  importMaterials: ['create_by'],
  importBom: ['create_by'],
  createCustomReport: ['create_by'],
  updateCustomReport: ['update_by'],
  applyMultiBomEcn: ['update_by'],
  createUser: ['create_by'],
  updateUser: ['update_by']
};

// WebSocket 服务：业务接口
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('客户端已连接');

  ws.on('message', async (msg) => {
    const text = msg.toString().trim();
    console.log('收到消息:', text);

    let msgId = null;
    let payload;
    try {
      payload = JSON.parse(text);
      msgId = payload._id;
    } catch {
      ws.send(JSON.stringify({ success: false, message: '消息格式错误' }));
      return;
    }

    const { action, token } = payload;
    let data = payload.data;
    let result;
    const startTime = Date.now();
    let logUser = null;

    try {
      // 除登录外，所有接口必须先登录才能调用
      const session = api.getSession(token);
      if (action !== 'login' && !session) {
        result = { success: false, code: 'UNAUTHORIZED', message: '登录已失效，请重新登录' };
      } else {
        logUser = session?.username || null;
        // 创建/修改的操作人统一取当前登录用户，不采用前端传入值
        if (session && OPERATOR_FIELDS[action]) {
          const patch = {};
          for (const field of OPERATOR_FIELDS[action]) patch[field] = session.username;
          data = { ...(data || {}), ...patch };
        }

        switch (action) {
        case 'login':
          result = await api.login(data || {});
          break;
        case 'logout':
          result = await api.logout(token);
          break;
        case 'checkSession': {
          const session = api.getSession(token);
          result = session
            ? { success: true, data: { username: session.username, realname: session.realname } }
            : { success: false, message: '登录已失效，请重新登录' };
          break;
        }
        // 扫描条码：先查重，再校验格式及物料，全部通过返回成功
        case 'scan': {
          const barcode = String(data || '').trim();
          const batchResult = await api.checkBatch(barcode);
          if (!batchResult.success) { result = batchResult; break; }
          const materialResult = await api.queryMaterial(barcode);
          if (!materialResult.success) { result = materialResult; break; }
          result = { success: true, data: materialResult.data };
          break;
        }
        case 'getInspectItems':
          result = await api.getInspectItems(String(data || '').trim());
          break;
        case 'createInspection':
          result = await api.createInspection(data || {});
          break;
        case 'queryInspectionList':
          result = await api.queryInspectionList(data || {});
          break;
        case 'getInspectionDetail':
          result = await api.getInspectionDetail(String(data || '').trim());
          break;
        case 'updateInspectionDetail':
          result = await api.updateInspectionDetail(data || {});
          break;
        case 'queryInspectItems':
          result = await api.queryInspectItems(data || {});
          break;
        case 'createInspectItem':
          result = await api.createInspectItem(data || {});
          break;
        case 'importInspectItems':
          result = await api.importInspectItems(data || {});
          break;
        case 'importInspectRules':
          result = await api.importInspectRules(data || {});
          break;
        case 'importMaterials':
          result = await api.importMaterials(data || {});
          break;
        case 'importBom':
          result = await api.importBom(data || {});
          break;
        case 'getBarcodeRule':
          result = await api.getBarcodeRule();
          break;
        case 'updateBarcodeRule':
          result = await api.updateBarcodeRule(data || {});
          break;
        case 'recordSnSerial':
          result = await api.recordSnSerial(data || {});
          break;
        case 'querySnArchive':
          result = await api.querySnArchive(data || {});
          break;
        case 'getSerialMap':
          result = await api.getSerialMap(data || []);
          break;
        case 'deleteInspectionRecords':
          result = await api.deleteInspectionRecords(data || {});
          break;
        case 'deleteAssembleRecords':
          result = await api.deleteAssembleRecords(data || {});
          break;
        case 'queryAssembleHistory':
          result = await api.queryAssembleHistory(data || {});
          break;
        case 'getAssembleHistoryVersion':
          result = await api.getAssembleHistoryVersion(data || {});
          break;
        case 'queryBomVersions':
          result = await api.queryBomVersions(String(data || '').trim());
          break;
        case 'checkMainMaterial':
          result = await api.checkMainMaterial(data || '');
          break;
        case 'checkComponentBom': {
          const parentId = String(data?.[0] || data?.parent_material_id || '').trim();
          const compId = String(data?.[1] || data?.component_material_id || '').trim();
          const bv = (Array.isArray(data) ? data[2] : data?.bom_version) ?? null;
          result = await api.checkComponentBom(parentId, compId, bv);
          break;
        }
        case 'queryMaterials':
          result = await api.queryMaterials(data || {});
          break;
        case 'createMaterial':
          result = await api.createMaterial(data || {});
          break;
        case 'updateMaterial':
          result = await api.updateMaterial(data || {});
          break;
        case 'queryArrivalOrders':
          result = await api.queryArrivalOrders(data || {});
          break;
        case 'createArrivalOrder':
          result = await api.createArrivalOrder(data || {});
          break;
        case 'updateArrivalOrder':
          result = await api.updateArrivalOrder(data || {});
          break;
        case 'deleteArrivalOrders':
          result = await api.deleteArrivalOrders(data || {});
          break;
        case 'querySuppliers':
          result = await api.querySuppliers(data || {});
          break;
        case 'createSupplier':
          result = await api.createSupplier(data || {});
          break;
        case 'updateSupplier':
          result = await api.updateSupplier(data || {});
          break;
        case 'updateInspectItem':
          result = await api.updateInspectItem(data || {});
          break;
        case 'getRuleCodes':
          result = await api.getRuleCodes();
          break;
        case 'queryInspectRules':
          result = await api.queryInspectRules(data || {});
          break;
        case 'getInspectRuleDetail':
          result = await api.getInspectRuleDetail(data || {});
          break;
        case 'updateInspectRule':
          result = await api.updateInspectRule(data || {});
          break;
        case 'createInspectRule':
          result = await api.createInspectRule(data || {});
          break;
        case 'queryBomParentList':
          result = await api.queryBomParentList(data || {});
          break;
        case 'getBomDetail':
          result = await api.getBomDetail(data?.parent_material_id || data);
          break;
        case 'updateBomDetail':
          result = await api.updateBomDetail(data || {});
          break;
        case 'applyMultiBomEcn':
          result = await api.applyMultiBomEcn(data || {});
          break;
        case 'queryBomHistory':
          result = await api.queryBomHistory(data || {});
          break;
        case 'getBomHistoryVersion':
          result = await api.getBomHistoryVersion(data || {});
          break;
        case 'createBom':
          result = await api.createBom(data || {});
          break;
        case 'createAssemble':
          result = await api.createAssemble(data || {});
          break;
        case 'queryAssembleList':
          result = await api.queryAssembleList(data || {});
          break;
        case 'getAssembleDetail':
          result = await api.getAssembleDetail(String(data || '').trim());
          break;
        case 'updateAssembleDetail':
          result = await api.updateAssembleDetail(data || {});
          break;
        case 'queryInspectionHistory':
          result = await api.queryInspectionHistory(data || {});
          break;
        case 'getInspectionHistoryVersion':
          result = await api.getInspectionHistoryVersion(data || {});
          break;
        case 'queryApiLogs':
          result = await api.queryApiLogs(data || {});
          break;
        case 'queryYieldAnalysis':
          result = await api.queryYieldAnalysis(data || {});
          break;
        case 'queryYieldReport':
          result = await api.queryYieldReport(data || {});
          break;
        case 'queryYieldDetailReport':
          result = await api.queryYieldDetailReport(data || {});
          break;
        case 'queryStockMovementReport':
          result = await api.queryStockMovementReport(data || {});
          break;
        case 'queryStockMovementMaterials':
          result = await api.queryStockMovementMaterials();
          break;
        case 'queryInspectionExecutionReport':
          result = await api.queryInspectionExecutionReport(data || {});
          break;
        case 'querySupplierYieldReport':
          result = await api.querySupplierYieldReport(data || {});
          break;
        case 'queryYieldItemDetail':
          result = await api.queryYieldItemDetail(data || {});
          break;
        case 'getAssembleAnalysis':
          result = await api.getAssembleAnalysis(data || {});
          break;
        case 'searchMainSn':
          result = await api.searchMainSn(data || {});
          break;
        case 'queryCustomReports':
          result = await api.queryCustomReports(data || {});
          break;
        case 'createCustomReport':
          result = await api.createCustomReport(data || {});
          break;
        case 'getCustomReportData':
          result = await api.getCustomReportData(data || {});
          break;
        case 'deleteCustomReports':
          result = await api.deleteCustomReports(data || {});
          break;
        case 'updateCustomReport':
          result = await api.updateCustomReport(data || {});
          break;
        case 'parseSqlColumns':
          result = await api.parseSqlColumns(data || {});
          break;
        case 'queryUsers':
          result = await api.queryUsers(data || {});
          break;
        case 'createUser':
          result = await api.createUser(data || {});
          break;
        case 'updateUser':
          result = await api.updateUser(data || {});
          break;
        case 'deleteUser':
          result = await api.deleteUser(data || {});
          break;
        case 'queryPermissions':
          result = await api.queryPermissions(data || {});
          break;
        case 'updatePermission':
          result = await api.updatePermission(data || {});
          break;
        case 'getUserPermissions':
          result = await api.getUserPermissions(String(data?.username || data || '').trim());
          break;
        // 校验主件SN：查重 → 条码解析 → 主件BOM查询
        case 'scanMainSn': {
          const sn = String(data || '').trim();
          // 1. 主件SN查重
          const chkAsm = await api.checkAssemble(sn);
          if (!chkAsm.success) { result = chkAsm; break; }
          // 2. 条码解析（复用 queryMaterial 做格式校验+物料查询）
          const matRes = await api.queryMaterial(sn);
          if (!matRes.success) { result = matRes; break; }
          // 3. 主件BOM查询
          const bomRes = await api.checkMainMaterial(matRes.data.material_id);
          if (!bomRes.success) { result = bomRes; break; }
          // 全部通过，返回物料信息+BOM元件列表
          result = {
            success: true,
            data: {
              main_sn: sn,
              material_id: matRes.data.material_id,
              material_name: matRes.data.material_name,
              material_spec: matRes.data.material_spec,
              components: bomRes.data.components
            }
          };
          break;
        }
        // 校验元件SN：查重 → 条码解析 → 元件BOM验证
        case 'scanComponentSn': {
          const sn = String(data.sn || '').trim();
          const parentMaterialId = String(data.parent_material_id || '').trim();
          // 1. 元件SN查重（可选 exclude_record_id：编辑本单时排除自身明细）
          const chkComp = await api.checkComponentSn(sn, data.exclude_record_id || null);
          if (!chkComp.success) { result = chkComp; break; }
          // 2. 条码解析（格式校验+物料查询）
          const matRes = await api.queryMaterial(sn);
          if (!matRes.success) { result = matRes; break; }
          // 3. 检验记录校验（无检验记录的元件不允许装配）
          const chkInsp = await api.checkComponentInspection(sn);
          if (!chkInsp.success) { result = chkInsp; break; }
          // 4. 元件BOM验证（优先用 data.bom_version，空值走当前生效版本）
          const bomRes = await api.checkComponentBom(parentMaterialId, matRes.data.material_id, data.bom_version || null);
          if (!bomRes.success) { result = bomRes; break; }
          // 全部通过，返回元件物料信息
          result = {
            success: true,
            data: {
              component_sn: sn,
              material_id: matRes.data.material_id,
              material_name: matRes.data.material_name,
              material_spec: matRes.data.material_spec,
              parent_material_id: parentMaterialId,
              quantity: bomRes.data.quantity
            }
          };
          break;
        }
        default:
          result = { success: false, message: `未知接口: ${action}` };
        }
      }
    } catch (err) {
      console.error('处理失败:', err);
      result = { success: false, message: `服务器错误: ${err.message}` };
    }

    // 统一写接口调用日志（公共函数定义在 server.js）
    await api.writeApiLog(action, logUser, data, result, Date.now() - startTime);

    // 回传 _id 以便前端匹配响应
    if (msgId !== null && msgId !== undefined) result._id = msgId;
    ws.send(JSON.stringify(result));
  });

  ws.on('close', () => console.log('客户端已断开'));
});

server.listen(PORT, () => {
  console.log(`服务已启动: http://192.168.40.127:${PORT}`);
});
