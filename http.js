const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const api = require('./server');

const PORT = 8080;
const WEB_DIR = path.join(__dirname, 'web');

// MIME 类型映射
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// HTTP 服务：仅用于托管前端静态文件
const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(WEB_DIR, urlPath);

  // 防止目录穿越
  if (!filePath.startsWith(WEB_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
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
  createBom: ['create_by'],
  updateBomDetail: ['update_by'],
  importInspectItems: ['create_by'],
  importInspectRules: ['create_by'],
  importMaterials: ['create_by'],
  importBom: ['create_by'],
  createCustomReport: ['create_by'],
  updateCustomReport: ['update_by'],
  applyMultiBomEcn: ['update_by']
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
  console.log(`服务已启动: http://192.168.40.118:${PORT}`);
});
