/* QMES 系统架构图 — 数据模型 + 渲染 + 交互
   数据来源：http.js / server.js / web/js/components.js / information_schema */
(function () {
  'use strict';

  /* ---------------- 业务链 ---------------- */
  var BIZ = {
    auth:     { label: '登录鉴权',   color: '#4f46e5' },
    scan:     { label: '扫码检验',   color: '#1565c0' },
    record:   { label: '记录查询',   color: '#7c3aed' },
    assemble: { label: '扫码装配',   color: '#0d9488' },
    base:     { label: '基础资料',   color: '#d97706' },
    imports:  { label: 'Excel 导入', color: '#059669' },
    barcode:  { label: '条码管理',   color: '#db2777' }
  };

  /* ---------------- 51 个业务接口（module.exports 顺序） ---------------- */
  var IFACES = [
    { no: 1,  name: 'login',             line: 'L9',    desc: '校验 user 表用户名密码，签发内存 token' },
    { no: 2,  name: 'getSession',        line: 'L35',   desc: '内存会话查询（http.js 鉴权与 checkSession 使用）' },
    { no: 3,  name: 'logout',            line: 'L40',   desc: '销毁服务端会话 token' },
    { no: 4,  name: 'queryMaterial',     line: 'L47',   desc: '条码格式校验 + 物料查询' },
    { no: 5,  name: 'checkBatch',        line: 'L72',   desc: '批次/条码是否已检验（查重）' },
    { no: 6,  name: 'getInspectItems',   line: 'L103',  desc: '按物料多规则带出检验项目与标准（item_id 去重）' },
    { no: 7,  name: 'createInspection',  line: 'L174',  desc: '事务写检验单（单头 + 明细，写 create_by/inspector）' },
    { no: 8,  name: 'queryInspectionList', line: 'L222', desc: '检验单列表（组合筛选 + 分页 + 录入进度）' },
    { no: 9,  name: 'getInspectionDetail', line: 'L280', desc: '检验单明细（含审计字段与录入进度）' },
    { no: 10, name: 'updateInspectionDetail', line: 'L314', desc: '事务：归档历史版本 + 重写明细 + 重算结论/完成度' },
    { no: 11, name: 'queryInspectItems', line: 'L431',  desc: '检验项目基础资料查询（分页）' },
    { no: 12, name: 'queryMaterials',    line: 'L450',  desc: '物料查询（分页）' },
    { no: 13, name: 'queryInspectRules', line: 'L470',  desc: '检验规则单头列表（按规则聚合 + 项目数）' },
    { no: 14, name: 'getInspectRuleDetail', line: 'L491', desc: '规则单头 + 明细（联项目带出录入类型）' },
    { no: 15, name: 'updateInspectRule', line: 'L509',  desc: '事务更新规则单头 + 明细差量更新' },
    { no: 16, name: 'queryBomParentList', line: 'L573', desc: 'BOM 列表（按主件聚合分页 + 当前版本号）' },
    { no: 17, name: 'getBomDetail',      line: 'L601',  desc: 'BOM 主件头 + 元件明细 + 当前版本号' },
    { no: 18, name: 'updateBomDetail',   line: 'L631',  desc: '事务：归档 bom_history + 差量更新 + 审计字段' },
    { no: 19, name: 'queryBomHistory',   line: 'L716',  desc: 'BOM 历史版本列表' },
    { no: 20, name: 'getBomHistoryVersion', line: 'L745', desc: '指定版本的修改前 BOM 明细（联物料）' },
    { no: 21, name: 'checkAssemble',     line: 'L773',  desc: '主件 SN 是否已完成装配（scanMainSn 内部调用）' },
    { no: 22, name: 'checkMainMaterial', line: 'L786',  desc: '校验是否为主件 + 返回 BOM 元件清单' },
    { no: 23, name: 'checkComponentSn',  line: 'L804',  desc: '元件 SN 查重（支持排除本单明细）' },
    { no: 24, name: 'checkComponentBom', line: 'L822',  desc: '元件 BOM 匹配验证' },
    { no: 25, name: 'checkComponentInspection', line: 'L835', desc: '元件 SN 是否存在检验记录（无则拦截）' },
    { no: 26, name: 'createAssemble',    line: 'L854',  desc: '事务写装配单（BOM 槽位全量展开，status=30）' },
    { no: 27, name: 'queryAssembleList', line: 'L926',  desc: '装配单列表（分页 + 装配进度）' },
    { no: 28, name: 'getAssembleDetail', line: 'L977',  desc: '装配单明细（槽位结构 + 审计字段）' },
    { no: 29, name: 'updateAssembleDetail', line: 'L1011', desc: '事务：归档历史 + 槽位差量更新 + 重算完成度' },
    { no: 30, name: 'createInspectItem', line: 'L1207', desc: '新增检验项目（校验编号唯一）' },
    { no: 31, name: 'updateInspectItem', line: 'L1226', desc: '更新检验项目（写 update_by/update_time）' },
    { no: 32, name: 'createInspectRule', line: 'L1247', desc: '新增检验规则（含标准值 / 标准区间）' },
    { no: 33, name: 'createMaterial',    line: 'L1296', desc: '新增物料（校验料号唯一，支持多规则）' },
    { no: 34, name: 'updateMaterial',    line: 'L1316', desc: '更新物料（写 update_by/update_time）' },
    { no: 35, name: 'getRuleCodes',      line: 'L1335', desc: '规则列表（rule_code + rule_name）' },
    { no: 36, name: 'createBom',         line: 'L1347', desc: '新增 BOM（校验料号存在与组合唯一）' },
    { no: 37, name: 'importInspectItems', line: 'L1407', desc: '批量导入检验项目（整批校验 + 事务）' },
    { no: 38, name: 'importInspectRules', line: 'L1492', desc: '批量导入检验规则（整批校验 + 事务）' },
    { no: 39, name: 'importMaterials',   line: 'L1604', desc: '批量导入物料（整批校验 + 事务）' },
    { no: 40, name: 'importBom',         line: 'L1838', desc: '批量导入 BOM（整批校验 + 事务）' },
    { no: 41, name: 'getBarcodeRule',    line: 'L1680', desc: '获取条码格式（全局唯一，id=1）' },
    { no: 42, name: 'updateBarcodeRule', line: 'L1697', desc: '更新条码格式' },
    { no: 43, name: 'recordSnSerial',    line: 'L1724', desc: '条码写入 sn_serial 档案（防重复跳过）' },
    { no: 44, name: 'querySnArchive',    line: 'L1743', desc: '条码档案多维模糊查询（联物料名称）' },
    { no: 45, name: 'getSerialMap',      line: 'L1771', desc: '物料+日期 → 当前最大流水号' },
    { no: 46, name: 'deleteInspectionRecords', line: 'L1802', desc: '按 id 批量删除检验单（含明细，事务）' },
    { no: 47, name: 'deleteAssembleRecords', line: 'L1819', desc: '按 id 批量删除装配单（含明细，事务）' },
    { no: 48, name: 'queryAssembleHistory', line: 'L1114', desc: '装配单历史版本列表' },
    { no: 49, name: 'getAssembleHistoryVersion', line: 'L1134', desc: '指定版本的修改前装配明细' },
    { no: 50, name: 'queryInspectionHistory', line: 'L1161', desc: '检验单历史版本列表' },
    { no: 51, name: 'getInspectionHistoryVersion', line: 'L1181', desc: '指定版本的修改前检验明细' }
  ];

  /* ---------------- 47 个消息分支 ---------------- */
  var BRANCHES = [
    { n: 1,  action: 'login',              input: '{ username, password }', biz: 'auth',    composite: false, ifaces: ['login'],                                                  senders: ['app（根实例）'] },
    { n: 2,  action: 'logout',             input: '忽略',                  biz: 'auth',    composite: false, ifaces: ['logout'],                                                 senders: ['app（根实例）'] },
    { n: 3,  action: 'checkSession',       input: '忽略',                  biz: 'auth',    composite: false, ifaces: ['getSession'],                                             senders: ['app（根实例）'] },
    { n: 4,  action: 'scan',               input: '条码字符串',            biz: 'scan',     composite: true,  ifaces: ['checkBatch', 'queryMaterial'],                            senders: ['page-scan'] },
    { n: 5,  action: 'getInspectItems',    input: '物料号',                biz: 'scan',     composite: false, ifaces: ['getInspectItems'],                                        senders: ['page-scan'] },
    { n: 6,  action: 'createInspection',   input: '对象',                  biz: 'scan',     composite: false, ifaces: ['createInspection'],                                      senders: ['page-scan'] },
    { n: 7,  action: 'queryInspectionList',input: '对象',                  biz: 'record',   composite: false, ifaces: ['queryInspectionList'],                                    senders: ['page-records'] },
    { n: 8,  action: 'getInspectionDetail',input: 'SN 字符串',             biz: 'record',   composite: false, ifaces: ['getInspectionDetail'],                                    senders: ['page-record-detail'] },
    { n: 9,  action: 'updateInspectionDetail', input: '对象',              biz: 'record',   composite: false, ifaces: ['updateInspectionDetail'],                                 senders: ['page-record-detail'] },
    { n: 10, action: 'deleteInspectionRecords', input: '{ ids }',          biz: 'record',   composite: false, ifaces: ['deleteInspectionRecords'],                                senders: ['page-records'] },
    { n: 11, action: 'queryInspectionHistory', input: '{ batch_no }',      biz: 'record',   composite: false, ifaces: ['queryInspectionHistory'],                                 senders: ['page-record-detail'] },
    { n: 12, action: 'getInspectionHistoryVersion', input: '{ record_id, version_no }', biz: 'record', composite: false, ifaces: ['getInspectionHistoryVersion'],                 senders: ['page-record-detail'] },
    { n: 13, action: 'queryAssembleList',  input: '对象',                  biz: 'record',   composite: false, ifaces: ['queryAssembleList'],                                    senders: ['page-assemble-records'] },
    { n: 14, action: 'getAssembleDetail',  input: 'SN 字符串',             biz: 'record',   composite: false, ifaces: ['getAssembleDetail'],                                    senders: ['page-assemble-detail'] },
    { n: 15, action: 'updateAssembleDetail', input: '对象',                biz: 'record',   composite: false, ifaces: ['updateAssembleDetail'],                                   senders: ['page-assemble-detail'] },
    { n: 16, action: 'deleteAssembleRecords', input: '{ ids }',            biz: 'record',   composite: false, ifaces: ['deleteAssembleRecords'],                                  senders: ['page-assemble-records'] },
    { n: 17, action: 'queryAssembleHistory', input: '{ main_sn }',         biz: 'record',   composite: false, ifaces: ['queryAssembleHistory'],                                   senders: ['page-assemble-detail'] },
    { n: 18, action: 'getAssembleHistoryVersion', input: '{ record_id, version_no }', biz: 'record', composite: false, ifaces: ['getAssembleHistoryVersion'],                     senders: ['page-assemble-detail'] },
    { n: 19, action: 'createAssemble',     input: '对象',                  biz: 'assemble', composite: false, ifaces: ['createAssemble'],                                       senders: ['page-assemble'] },
    { n: 20, action: 'scanMainSn',         input: 'SN 字符串',             biz: 'assemble', composite: true,  ifaces: ['checkAssemble', 'queryMaterial', 'checkMainMaterial'],     senders: ['page-assemble'] },
    { n: 21, action: 'scanComponentSn',    input: '{ sn, parent_material_id }', biz: 'assemble', composite: true, ifaces: ['checkComponentSn', 'queryMaterial', 'checkComponentInspection', 'checkComponentBom'], senders: ['page-assemble', 'page-assemble-detail'] },
    { n: 22, action: 'queryInspectItems',  input: '对象',                  biz: 'base',     composite: false, ifaces: ['queryInspectItems'],                                      senders: ['page-inspect-item', 'page-rule-add'] },
    { n: 23, action: 'createInspectItem',  input: '对象',                  biz: 'base',     composite: false, ifaces: ['createInspectItem'],                                      senders: ['page-item-add'] },
    { n: 24, action: 'updateInspectItem',  input: '对象',                  biz: 'base',     composite: false, ifaces: ['updateInspectItem'],                                      senders: ['page-inspect-item'] },
    { n: 25, action: 'queryMaterials',     input: '对象',                  biz: 'base',     composite: false, ifaces: ['queryMaterials'],                                        senders: ['page-material', 'page-bom-detail', 'page-bom-add', 'page-barcode-print'] },
    { n: 26, action: 'createMaterial',     input: '对象',                  biz: 'base',     composite: false, ifaces: ['createMaterial'],                                        senders: ['page-material-add'] },
    { n: 27, action: 'updateMaterial',     input: '对象',                  biz: 'base',     composite: false, ifaces: ['updateMaterial'],                                        senders: ['page-material'] },
    { n: 28, action: 'getRuleCodes',       input: '忽略',                  biz: 'base',     composite: false, ifaces: ['getRuleCodes'],                                          senders: ['page-material', 'page-material-add'] },
    { n: 29, action: 'queryInspectRules',  input: '对象',                  biz: 'base',     composite: false, ifaces: ['queryInspectRules'],                                      senders: ['page-rule'] },
    { n: 30, action: 'getInspectRuleDetail', input: 'id 或 rule_code',     biz: 'base',     composite: false, ifaces: ['getInspectRuleDetail'],                                   senders: ['page-rule-detail'] },
    { n: 31, action: 'updateInspectRule',  input: '对象',                  biz: 'base',     composite: false, ifaces: ['updateInspectRule'],                                      senders: ['page-rule-detail'] },
    { n: 32, action: 'createInspectRule',  input: '对象',                  biz: 'base',     composite: false, ifaces: ['createInspectRule'],                                      senders: ['page-rule-add'] },
    { n: 33, action: 'queryBomParentList', input: '对象',                  biz: 'base',     composite: false, ifaces: ['queryBomParentList'],                                     senders: ['page-bom'] },
    { n: 34, action: 'getBomDetail',       input: '{ parent_material_id }', biz: 'base',    composite: false, ifaces: ['getBomDetail'],                                          senders: ['page-bom-detail'] },
    { n: 35, action: 'updateBomDetail',    input: '对象',                  biz: 'base',     composite: false, ifaces: ['updateBomDetail'],                                       senders: ['page-bom-detail'] },
    { n: 36, action: 'queryBomHistory',    input: '{ parent_material_id }', biz: 'base',    composite: false, ifaces: ['queryBomHistory'],                                       senders: ['page-bom-detail'] },
    { n: 37, action: 'getBomHistoryVersion', input: '{ parent_material_id, version_no }', biz: 'base', composite: false, ifaces: ['getBomHistoryVersion'],                        senders: ['page-bom-detail'] },
    { n: 38, action: 'createBom',          input: '对象',                  biz: 'base',     composite: false, ifaces: ['createBom'],                                             senders: ['page-bom-add'] },
    { n: 39, action: 'importInspectItems', input: '{ fileData }',          biz: 'imports',  composite: false, ifaces: ['importInspectItems'],                                     senders: ['page-inspect-item'] },
    { n: 40, action: 'importInspectRules', input: '{ fileData }',          biz: 'imports',  composite: false, ifaces: ['importInspectRules'],                                     senders: ['page-rule'] },
    { n: 41, action: 'importMaterials',    input: '{ fileData }',          biz: 'imports',  composite: false, ifaces: ['importMaterials'],                                        senders: ['page-material'] },
    { n: 42, action: 'importBom',          input: '{ fileData }',          biz: 'imports',  composite: false, ifaces: ['importBom'],                                              senders: ['page-bom'] },
    { n: 43, action: 'getBarcodeRule',     input: '忽略',                  biz: 'barcode',  composite: false, ifaces: ['getBarcodeRule'],                                       senders: ['page-barcode-format', 'page-barcode-print'] },
    { n: 44, action: 'updateBarcodeRule',  input: '对象',                  biz: 'barcode',  composite: false, ifaces: ['updateBarcodeRule'],                                     senders: ['page-barcode-format'] },
    { n: 45, action: 'recordSnSerial',     input: '对象',                  biz: 'barcode',  composite: false, ifaces: ['recordSnSerial'],                                        senders: ['page-barcode-print'] },
    { n: 46, action: 'querySnArchive',     input: '对象',                  biz: 'barcode',  composite: false, ifaces: ['querySnArchive'],                                        senders: ['page-barcode-archive'] },
    { n: 47, action: 'getSerialMap',       input: '[{ material_id, sn_date }]', biz: 'barcode', composite: false, ifaces: ['getSerialMap'],                                       senders: ['page-barcode-print'] }
  ];

  /* ---------------- 24 个前端组件（含 app.js 根实例） ---------------- */
  var COMPONENTS = [
    { name: 'app（根实例）',          line: 'app.js L130', sends: [['login', 'L156'], ['logout', 'L172'], ['checkSession', 'L184']],   note: '登录页/退出/会话恢复；token 注入每次请求；未登录仅渲染登录卡片' },
    { name: 'page-guide',            line: 'L2',    sends: [],                                                                        note: '操作指导（无页签时的默认面板，纯展示）' },
    { name: 'page-placeholder',      line: 'L31',   sends: [],                                                                        note: '通用占位页工厂' },
    { name: 'page-scan',             line: 'L50',   sends: [['scan', 'L73'], ['getInspectItems', 'L84'], ['createInspection', 'L113']], note: '扫码检验（自动判定；提交成功后清空界面）' },
    { name: 'page-records',          line: 'L239',  sends: [['queryInspectionList', 'L259'], ['deleteInspectionRecords', 'L276']],     note: '检验记录查询（批量删除 + 完成状态/进度）' },
    { name: 'page-record-detail',    line: 'L351',  sends: [['getInspectionDetail', 'L384'], ['updateInspectionDetail', 'L406'], ['queryInspectionHistory', 'L436'], ['getInspectionHistoryVersion', 'L442']], note: '检验单明细（修改单身 + 历史版本弹层）' },
    { name: 'vue-pager',             line: 'L584',  sends: [],                                                                        note: '通用分页控件（只 emit 事件，不发消息）' },
    { name: 'page-base-data',        line: 'L611',  sends: [['action（动态）', '配置驱动'], ['importAction（动态）', '配置驱动']],      note: '基础资料通用页：查询 / 导入由配置驱动' },
    { name: 'page-inspect-item',     line: 'L714',  sends: [['queryInspectItems', 'L726'], ['importInspectItems', 'L739'], ['updateInspectItem', 'L748']], note: '检验项目列表（行内修改 + 导入）' },
    { name: 'page-item-add',         line: 'L826',  sends: [['createInspectItem', 'L844']],                                          note: '新增检验项目' },
    { name: 'page-material',         line: 'L897',  sends: [['getRuleCodes', 'L910'], ['queryMaterials', 'L914'], ['importMaterials', 'L932'], ['updateMaterial', 'L952']], note: '物料列表（行内修改 + 导入 + 规则多选）' },
    { name: 'page-material-add',     line: 'L1057', sends: [['getRuleCodes', 'L1070'], ['createMaterial', 'L1081']],                  note: '新增物料（含检验规则下拉多选）' },
    { name: 'page-rule',             line: 'L1172', sends: [['queryInspectRules', 'L1184'], ['importInspectRules', 'L1199']],         note: '检验规则列表（默认全量 + 导入，无删除）' },
    { name: 'page-rule-add',         line: 'L1253', sends: [['queryInspectItems', 'L1271'], ['createInspectRule', 'L1330']],          note: '新增检验规则（含标准值 / 标准区间）' },
    { name: 'page-rule-detail',      line: 'L1413', sends: [['getInspectRuleDetail', 'L1427'], ['updateInspectRule', 'L1440']],       note: '检验规则详情（单头 + 明细行内编辑）' },
    { name: 'page-bom',              line: 'L1561', sends: [['queryBomParentList', 'L1572'], ['importBom', 'L1584']],                 note: 'BOM 列表（按主件聚合 + 导入）' },
    { name: 'page-bom-detail',       line: 'L1633', sends: [['getBomDetail', 'L1656'], ['updateBomDetail', 'L1687'], ['queryMaterials', 'L1697'], ['queryBomHistory', 'L1713'], ['getBomHistoryVersion', 'L1720']], note: 'BOM 明细（元件行内编辑 + 历史版本）' },
    { name: 'page-bom-add',          line: 'L1842', sends: [['queryMaterials', 'L1857'], ['createBom', 'L1902']],                     note: '新增 BOM' },
    { name: 'page-assemble',         line: 'L1970', sends: [['scanMainSn', 'L1994'], ['scanComponentSn', 'L2030'], ['createAssemble', 'L2063']], note: '扫码装配（BOM 槽位全量展开）' },
    { name: 'page-assemble-records', line: 'L2154', sends: [['queryAssembleList', 'L2174'], ['deleteAssembleRecords', 'L2191']],      note: '装配记录查询（批量删除）' },
    { name: 'page-assemble-detail',  line: 'L2265', sends: [['getAssembleDetail', 'L2333'], ['scanComponentSn', 'L2380'], ['updateAssembleDetail', 'L2406'], ['queryAssembleHistory', 'L2437'], ['getAssembleHistoryVersion', 'L2444']], note: '装配单明细（修改/补扫 + 历史版本）' },
    { name: 'page-barcode-format',   line: 'L2588', sends: [['getBarcodeRule', 'L2600'], ['updateBarcodeRule', 'L2611']],             note: '条码格式维护（全局唯一）' },
    { name: 'page-barcode-print',    line: 'L2690', sends: [['queryMaterials', 'L2710'], ['getSerialMap', 'L2721'], ['getBarcodeRule', 'L2734'], ['recordSnSerial', 'L2805']], note: '条码批量打印（数量列 + 流水推进 + 写档案）' },
    { name: 'page-barcode-archive',  line: 'L2889', sends: [['querySnArchive', 'L2903']],                                             note: '条码档案多维模糊查询' }
  ];

  /* ---------------- 15 张数据库表 ---------------- */
  var TABLES = [
    { name: 'user', comment: '用户表（登录认证）', fields: [
      ['username', 'varchar(255)', 0], ['password', 'varchar(255)', 0], ['realname', 'varchar(255)', 0] ] },
    { name: 'material', comment: '物料主数据表（含审计字段）', fields: [
      ['material_id', 'varchar(20)', 1], ['material_name', 'varchar(100)', 0], ['material_spec', 'varchar(100)', 0],
      ['inspect_category', 'varchar(200)', 0], ['is_active', 'tinyint', 0], ['create_by', 'varchar(50)', 0],
      ['update_by', 'varchar(50)', 0], ['created_time', 'datetime', 0], ['update_time', 'datetime', 0] ] },
    { name: 'bom', comment: '物料 BOM 关系表（含审计字段）', fields: [
      ['id', 'bigint', 1], ['parent_material_id', 'varchar(20)', 0], ['component_material', 'varchar(20)', 0],
      ['quantity', 'decimal(18,4)', 0], ['created_time', 'datetime', 0], ['create_by', 'varchar(50)', 0],
      ['update_by', 'varchar(50)', 0], ['update_time', 'datetime', 0] ] },
    { name: 'bom_history', comment: 'BOM 变更历史表（版本归档）', fields: [
      ['id', 'bigint', 1], ['parent_material_id', 'varchar(20)', 0], ['version_no', 'int', 0], ['bom_id', 'bigint', 0],
      ['component_material', 'varchar(20)', 0], ['quantity', 'decimal(18,4)', 0], ['origin_created_time', 'datetime', 0],
      ['change_by', 'varchar(50)', 0], ['change_time', 'datetime', 0], ['remark', 'varchar(200)', 0] ] },
    { name: 'inspection_item', comment: '检验项目表（含审计字段）', fields: [
      ['item_id', 'varchar(20)', 1], ['item_name', 'varchar(50)', 0], ['item_type', 'varchar(20)', 0],
      ['is_active', 'tinyint', 0], ['created_time', 'datetime', 0], ['update_time', 'datetime', 0],
      ['create_by', 'varchar(50)', 0], ['update_by', 'varchar(50)', 0] ] },
    { name: 'inspection_rule', comment: '检验规则单头表（含审计字段）', fields: [
      ['id', 'bigint', 1], ['rule_code', 'varchar(20)', 0], ['rule_name', 'varchar(100)', 0], ['remark', 'varchar(255)', 0],
      ['is_active', 'tinyint', 0], ['created_time', 'datetime', 0], ['update_time', 'datetime', 0],
      ['create_by', 'varchar(50)', 0], ['update_by', 'varchar(50)', 0] ] },
    { name: 'inspection_rule_item', comment: '检验规则-检验项目明细表', fields: [
      ['id', 'bigint', 1], ['rule_id', 'bigint', 0], ['rule_code', 'varchar(20)', 0], ['rule_desc', 'varchar(200)', 0],
      ['standard_value', 'varchar(200)', 0], ['standard_range', 'varchar(50)', 0],
      ['item_id', 'varchar(20)', 0], ['item_name', 'varchar(50)', 0], ['seq', 'int', 0], ['created_time', 'datetime', 0],
      ['create_by', 'varchar(50)', 0], ['update_by', 'varchar(50)', 0], ['update_time', 'datetime', 0] ] },
    { name: 'inspection_record', comment: '检验记录表（单头，含审计字段）', fields: [
      ['id', 'bigint', 1], ['material_id', 'varchar(20)', 0], ['batch_no', 'varchar(50)', 0], ['rule_code', 'varchar(200)', 0],
      ['inspect_date', 'datetime', 0], ['inspector', 'varchar(50)', 0], ['create_by', 'varchar(50)', 0], ['result', 'tinyint', 0],
      ['remark', 'varchar(255)', 0], ['update_by', 'varchar(50)', 0], ['update_time', 'datetime', 0],
      ['created_time', 'datetime', 0], ['status', 'varchar(255)', 0], ['is_complete', 'tinyint', 0] ] },
    { name: 'inspection_record_detail', comment: '检验结果明细表', fields: [
      ['id', 'bigint', 1], ['record_id', 'bigint', 0], ['item_id', 'varchar(20)', 0], ['item_name', 'varchar(50)', 0],
      ['measured_val', 'varchar(200)', 0], ['measured_text', 'varchar(100)', 0], ['is_pass', 'tinyint', 0],
      ['remark', 'varchar(255)', 0], ['created_time', 'datetime', 0] ] },
    { name: 'inspection_record_history', comment: '检验单变更历史表', fields: [
      ['id', 'bigint', 1], ['record_id', 'bigint', 0], ['version_no', 'int', 0], ['detail_id', 'bigint', 0],
      ['item_id', 'varchar(20)', 0], ['item_name', 'varchar(50)', 0], ['measured_val', 'varchar(200)', 0],
      ['measured_text', 'varchar(100)', 0], ['is_pass', 'tinyint', 0], ['origin_created_time', 'datetime', 0],
      ['remark', 'varchar(255)', 0], ['change_by', 'varchar(50)', 0], ['change_time', 'datetime', 0] ] },
    { name: 'assemble_record', comment: '装配记录单头（含审计字段）', fields: [
      ['id', 'bigint', 1], ['main_sn', 'varchar(50)', 0], ['main_material_id', 'varchar(20)', 0], ['bom_version', 'int', 0],
      ['status', 'tinyint', 0], ['assemble_date', 'date', 0], ['operator', 'varchar(20)', 0], ['create_by', 'varchar(50)', 0],
      ['remark', 'varchar(200)', 0], ['update_by', 'varchar(50)', 0], ['update_time', 'datetime', 0],
      ['created_time', 'datetime', 0], ['is_complete', 'tinyint', 0] ] },
    { name: 'assemble_record_detail', comment: '装配记录单身（BOM 槽位全量展开）', fields: [
      ['id', 'bigint', 1], ['record_id', 'bigint', 0], ['component_sn', 'varchar(50)', 0], ['component_material_id', 'varchar(20)', 0], ['created_time', 'datetime', 0] ] },
    { name: 'assemble_record_history', comment: '装配单变更历史表', fields: [
      ['id', 'bigint', 1], ['record_id', 'bigint', 0], ['version_no', 'int', 0], ['detail_id', 'bigint', 0],
      ['component_sn', 'varchar(50)', 0], ['component_material_id', 'varchar(20)', 0], ['origin_created_time', 'datetime', 0],
      ['change_by', 'varchar(50)', 0], ['change_time', 'datetime', 0], ['remark', 'varchar(200)', 0] ] },
    { name: 'barcode_rule', comment: '条码格式表（全局唯一 id=1）', fields: [
      ['id', 'int', 1], ['label_width', 'int', 0], ['label_height', 'int', 0], ['qr_size', 'int', 0], ['qr_x', 'int', 0], ['qr_y', 'int', 0],
      ['mid_x', 'int', 0], ['mid_y', 'int', 0], ['mid_font', 'int', 0], ['date_x', 'int', 0], ['date_y', 'int', 0], ['date_font', 'int', 0],
      ['serial_x', 'int', 0], ['serial_y', 'int', 0], ['serial_font', 'int', 0], ['updated_time', 'datetime', 0] ] },
    { name: 'sn_serial', comment: '条码流水/档案表', fields: [
      ['id', 'bigint', 1], ['sn', 'varchar(50)', 0], ['material_id', 'varchar(20)', 0], ['sn_date', 'date', 0],
      ['serial_no', 'int', 0], ['created_time', 'datetime', 0] ] }
  ];

  /* ---------------- 索引 ---------------- */
  var IFACE_BY_NAME = {}; IFACES.forEach(function (i) { IFACE_BY_NAME[i.name] = i; });
  var BRANCH_BY_ACTION = {}; BRANCHES.forEach(function (b) { BRANCH_BY_ACTION[b.action] = b; });
  var COMP_BY_NAME = {}; COMPONENTS.forEach(function (c) { COMP_BY_NAME[c.name] = c; });

  /* ---------------- 状态 ---------------- */
  var state = { biz: 'all', q: '', lock: null, hover: null };   /* lock / hover = {type, name} */

  /* ---------------- DOM 引用表 ---------------- */
  var els = { branches: {}, ifaces: {}, comps: {}, tables: {}, branchRows: {}, ifaceRows: {}, compCards: {}, matrixIfaces: {} };

  /* ---------------- 工具 ---------------- */
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function bizColor(k) { return BIZ[k] ? BIZ[k].color : '#98a2b3'; }

  function compBiz(c) {
    var s = {}; c.sends.forEach(function (sd) { var b = BRANCH_BY_ACTION[sd[0]]; if (b) s[b.biz] = 1; });
    return Object.keys(s);
  }
  function matchBiz(bizList) { return state.biz === 'all' || bizList.indexOf(state.biz) >= 0; }
  function matchQ() {
    var q = state.q.trim().toLowerCase();
    if (!q) return function () { return true; };
    return function (text) { return String(text).toLowerCase().indexOf(q) >= 0; };
  }

  /* ---------------- 关联计算 ---------------- */
  function relations(sel) {
    var r = { branches: {}, ifaces: {}, comps: {}, tables: {} };
    if (!sel) return r;
    if (sel.type === 'branch') {
      var b = BRANCH_BY_ACTION[sel.name]; if (!b) return r;
      r.branches[b.action] = 1;
      b.ifaces.forEach(function (i) { r.ifaces[i] = 1; });
      b.senders.forEach(function (c) { r.comps[c] = 1; });
    } else if (sel.type === 'iface') {
      r.ifaces[sel.name] = 1;
      BRANCHES.forEach(function (b) { if (b.ifaces.indexOf(sel.name) >= 0) { r.branches[b.action] = 1; b.senders.forEach(function (c) { r.comps[c] = 1; }); } });
    } else if (sel.type === 'comp') {
      var c = COMP_BY_NAME[sel.name]; if (!c) return r;
      r.comps[c.name] = 1;
      c.sends.forEach(function (sd) {
        var b = BRANCH_BY_ACTION[sd[0]]; if (!b) return;
        r.branches[b.action] = 1;
        b.ifaces.forEach(function (i) { r.ifaces[i] = 1; });
      });
    } else if (sel.type === 'table') {
      r.tables[sel.name] = 1;
    }
    return r;
  }

  /* ---------------- 渲染：五层架构 ---------------- */
  function renderLayers() {
    var host = document.getElementById('layers'); host.innerHTML = '';
    els.branches = {}; els.ifaces = {}; els.comps = {}; els.tables = {};

    /* 层1 前端 SPA */
    var b1 = band('前端 SPA', 'web/ · Vue 2.7（CDN，无构建）', '#7c3aed', '23 个组件 + app.js');
    COMPONENTS.forEach(function (c) {
      var chip = el('span', 'chip', c.name);
      chip.title = c.note + '（' + c.line + '）';
      chip.addEventListener('click', function () { lock('comp', c.name); });
      chip.__node = { type: 'comp', name: c.name };
      els.comps[c.name] = chip; b1.chips.appendChild(chip);
    });

    /* 层2 http.js 47 分支 */
    var b2 = band('消息路由层', 'http.js · WebSocket switch(action) + 登录鉴权', '#1565c0', '47 个 action 分支');
    BRANCHES.forEach(function (b) {
      var chip = el('span', 'chip', b.action + (b.composite ? ' ★' : ''));
      chip.style.borderLeft = '3px solid ' + bizColor(b.biz);
      if (b.composite) chip.classList.add('feat');
      chip.title = '分支 ' + b.n + ' · ' + BIZ[b.biz].label + (b.composite ? ' · 复合分支' : '');
      chip.addEventListener('click', function () { lock('branch', b.action); });
      chip.__node = { type: 'branch', name: b.action };
      els.branches[b.action] = chip; b2.chips.appendChild(chip);
    });
    host.appendChild(b1.el); host.appendChild(b2.el);

    /* 层3 server.js 51 接口 */
    var b3 = band('业务层', 'server.js · 51 个导出接口', '#0d9488', '51 个接口 + 8 个内部辅助函数');
    IFACES.forEach(function (i) {
      var chip = el('span', 'chip', i.name);
      chip.title = '接口 ' + i.no + '（' + i.line + '）：' + i.desc;
      chip.addEventListener('click', function () { lock('iface', i.name); });
      chip.__node = { type: 'iface', name: i.name };
      els.ifaces[i.name] = chip; b3.chips.appendChild(chip);
    });

    /* 层4 db.js */
    var b4 = band('数据访问层', 'db.js · 连接池 + 通用方法', '#475467', '1 个模块');
    ['pool', 'query', 'insert', 'find', 'findOne', 'update', 'remove'].forEach(function (m) {
      var chip = el('span', 'chip', m); chip.addEventListener('click', function () { lock('db', m); }); b4.chips.appendChild(chip);
    });

    /* 层5 MySQL */
    var b5 = band('数据库', 'MySQL · qmes 库', '#db2777', '15 张表');
    TABLES.forEach(function (t) {
      var chip = el('span', 'chip', t.name);
      chip.title = t.comment;
      chip.addEventListener('click', function () { lock('table', t.name); });
      chip.__node = { type: 'table', name: t.name };
      els.tables[t.name] = chip; b5.chips.appendChild(chip);
    });

    host.appendChild(b3.el); host.appendChild(b4.el); host.appendChild(b5.el);
  }

  function band(title, sub, color, right) {
    var wrap = el('div', 'band'); wrap.style.borderLeftColor = color;
    var left = el('div', 'bl');
    left.appendChild(el('b', null, title));
    left.appendChild(el('i', null, sub));
    if (right) left.appendChild(el('i', null, right));
    var chips = el('div', 'chips');
    wrap.appendChild(left); wrap.appendChild(chips);
    return { el: wrap, chips: chips };
  }

  /* ---------------- 渲染：分支矩阵 ---------------- */
  function renderMatrix() {
    var tb = document.getElementById('matrix-body'); tb.innerHTML = ''; els.branchRows = {}; els.matrixIfaces = {};

    BRANCHES.forEach(function (b) {
      var tr = el('tr');
      tr.appendChild(el('td', 'code', String(b.n)));

      var tdBiz = el('td'); var pill = el('span', 'pill', BIZ[b.biz].label);
      pill.style.background = bizColor(b.biz) + '1a'; pill.style.color = bizColor(b.biz);
      tdBiz.appendChild(pill); tr.appendChild(tdBiz);

      var tdA = el('td'); var aEl = el('span', 'code', b.action);
      aEl.style.fontWeight = '700';
      aEl.style.cursor = 'pointer';
      aEl.addEventListener('click', function () { lock('branch', b.action); });
      tdA.appendChild(aEl);
      if (b.composite) { var st = el('span', 'badge-star', '★复合'); tdA.appendChild(st); }
      tr.appendChild(tdA);

      tr.appendChild(el('td', 'code', b.input));

      var tdI = el('td');
      b.ifaces.forEach(function (n, idx) {
        if (idx > 0) tdI.appendChild(el('span', 'arrow', ' → '));
        var ic = el('span', 'iface-chip', n);
        ic.addEventListener('click', function () { lock('iface', n); });
        ic.__node = { type: 'iface', name: n };
        els.matrixIfaces[b.action + '|' + n] = ic;
        tdI.appendChild(ic);
      });
      tr.appendChild(tdI);

      var tdS = el('td'); var sm = el('span', 'code', b.senders.length ? b.senders.join('、') : '—');
      if (!b.senders.length) sm.style.color = '#98a2b3';
      tdS.appendChild(sm); tr.appendChild(tdS);

      tr.__node = { type: 'branch', name: b.action };
      els.branchRows[b.action] = tr;
      tb.appendChild(tr);
    });
  }

  /* ---------------- 渲染：接口反向索引 ---------------- */
  function renderIfaces() {
    var tb = document.getElementById('ifaces-body'); tb.innerHTML = ''; els.ifaceRows = {};

    IFACES.forEach(function (i) {
      var tr = el('tr');
      tr.appendChild(el('td', 'code', String(i.no)));
      var tdN = el('td'); var n = el('span', 'code', i.name); n.style.fontWeight = '700'; n.style.cursor = 'pointer';
      n.addEventListener('click', function () { lock('iface', i.name); });
      tdN.appendChild(n); tr.appendChild(tdN);
      tr.appendChild(el('td', 'code', i.line));
      tr.appendChild(el('td', null, i.desc));

      var tdA = el('td');
      var acts = BRANCHES.filter(function (b) { return b.ifaces.indexOf(i.name) >= 0; });
      if (!acts.length) { var d = el('span', null, '—'); d.style.color = '#98a2b3'; tdA.appendChild(d); }
      acts.forEach(function (b) {
        var c = el('span', 'iface-chip', b.action);
        if (b.composite) c.classList.add('beam');
        c.addEventListener('click', function () { lock('branch', b.action); });
        tdA.appendChild(c);
      });
      tr.appendChild(tdA);

      tr.__node = { type: 'iface', name: i.name };
      els.ifaceRows[i.name] = tr;
      tb.appendChild(tr);
    });
  }

  /* ---------------- 渲染：组件卡片 ---------------- */
  function renderComponents() {
    var host = document.getElementById('comp-grid'); host.innerHTML = ''; els.compCards = {};

    COMPONENTS.forEach(function (c) {
      var card = el('div', 'ccard' + (c.sends.length ? '' : ' off'));
      var head = el('div', 'chead');
      head.appendChild(el('span', 'caret', '▶'));
      head.appendChild(el('span', 'nm', c.name));
      head.appendChild(el('span', 'ln', c.line));
      head.appendChild(el('span', 'cnt', c.sends.length + ' 条'));
      if (c.sends.length) head.addEventListener('click', function () { card.classList.toggle('open'); });
      card.appendChild(head);

      var body = el('div', 'cbody');
      if (!c.sends.length) {
        var p = el('div', 'cnote', '不发起任何 WebSocket 消息');
        body.appendChild(p);
      } else {
        c.sends.forEach(function (sd) {
          var line = el('div', 'sendline');
          line.appendChild(el('span', 'ar', '→'));
          var at = el('span', 'at', sd[0] + '()');
          var b = BRANCH_BY_ACTION[sd[0]];
          if (b) {
            at.addEventListener('click', function (e) { e.stopPropagation(); lock('branch', b.action); });
            at.title = '跳到分支：' + b.action;
          } else {
            at.style.cursor = 'default';
          }
          line.appendChild(at);
          if (b) { var pl = el('span', 'pill', BIZ[b.biz].label); pl.style.background = bizColor(b.biz) + '1a'; pl.style.color = bizColor(b.biz); line.appendChild(pl); }
          line.appendChild(el('span', 'sl', 'components.js ' + sd[1]));
          body.appendChild(line);
        });
      }
      card.appendChild(body);
      card.__node = { type: 'comp', name: c.name };
      els.compCards[c.name] = card;
      host.appendChild(card);
    });
  }

  /* ---------------- 渲染：数据库表 ---------------- */
  function renderTables() {
    var host = document.getElementById('db-grid'); host.innerHTML = '';
    TABLES.forEach(function (t) {
      var card = el('div', 'tcard');
      var head = el('div', 'thead');
      head.appendChild(el('span', 'tn', t.name));
      head.appendChild(el('span', 'tc', t.comment));
      head.appendChild(el('span', 'caret', '▶'));
      head.addEventListener('click', function () { card.classList.toggle('open'); });
      card.appendChild(head);

      var body = el('div', 'tbody');
      t.fields.forEach(function (f) {
        var row = el('div', 'frow');
        var nm = el('span', 'fname' + (f[2] ? ' pk' : ''), f[0] + (f[2] ? '  PK' : ''));
        row.appendChild(nm);
        row.appendChild(el('span', 'ftype', f[1]));
        body.appendChild(row);
      });
      card.appendChild(body);
      host.appendChild(card);
    });
  }

  /* ---------------- 选中 + 高亮 ---------------- */
  function lock(type, name) {
    if (type === 'db') { state.lock = { type: 'db', name: name }; paint(); showDetail(state.lock); return; }
    var same = state.lock && state.lock.type === type && state.lock.name === name;
    state.lock = same ? null : { type: type, name: name };
    paint();
    if (state.lock) {
      showDetail(state.lock);
      if (type === 'branch' && els.branchRows[name]) els.branchRows[name].scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (type === 'iface' && els.ifaceRows[name]) els.ifaceRows[name].scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (type === 'comp' && els.compCards[name]) { els.compCards[name].classList.add('open'); els.compCards[name].scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    } else {
      hideDetail();
    }
  }

  function paint() {
    var active = state.lock || state.hover;
    var rel = relations(active), has = !!active;
    function cls(type, name, bizList, text) {
      var c = [];
      var isSel = !!(state.lock && state.lock.type === type && state.lock.name === name);
      var isRel = (type === 'branch' ? rel.branches : type === 'iface' ? rel.ifaces : type === 'comp' ? rel.comps : rel.tables)[name];
      if (isSel) c.push('sel');
      else if (isRel) c.push('rel');
      else if (has) c.push('dim');
      if (bizList && !matchBiz(bizList)) c.push('dim');
      if (text != null && !matchQ()(text)) c.push('dim');
      return c.join(' ');
    }
    function apply(elem, add) {
      if (!elem) return;
      var base = elem.getAttribute('data-base');
      if (base === null) {
        base = elem.className.replace(/\b(sel|rel|dim)\b/g, '').replace(/\s+/g, ' ').trim();
        elem.setAttribute('data-base', base);
      }
      elem.className = (base + ' ' + add).trim();
    }

    Object.keys(els.branches).forEach(function (a) { var b = BRANCH_BY_ACTION[a]; apply(els.branches[a], cls('branch', a, [b.biz], a)); });
    Object.keys(els.ifaces).forEach(function (n) { var i = IFACE_BY_NAME[n]; apply(els.ifaces[n], cls('iface', n, null, n + ' ' + i.desc)); });
    Object.keys(els.comps).forEach(function (n) { var c = COMP_BY_NAME[n]; apply(els.comps[n], cls('comp', n, compBiz(c), n + ' ' + c.note)); });
    Object.keys(els.tables).forEach(function (n) { apply(els.tables[n], cls('table', n, null, n)); });

    BRANCHES.forEach(function (b) { var tr = els.branchRows[b.action]; if (tr) apply(tr, cls('branch', b.action, [b.biz], b.action + ' ' + b.senders.join(' ')) + ' row'); });
    IFACES.forEach(function (i) { var tr = els.ifaceRows[i.name]; if (tr) apply(tr, cls('iface', i.name, null, i.name + ' ' + i.desc) + ' row'); });
    COMPONENTS.forEach(function (c) { var cd = els.compCards[c.name]; if (cd) apply(cd, cls('comp', c.name, compBiz(c), c.name + ' ' + c.note)); });
    Object.keys(els.matrixIfaces).forEach(function (k) {
      var parts = k.split('|'), action = parts[0], iname = parts[1];
      var b = BRANCH_BY_ACTION[action];
      var c = [];
      if (active && active.type === 'iface' && active.name === iname) c.push('beam');
      if (b && !matchBiz([b.biz])) c.push('dim');
      apply(els.matrixIfaces[k], c.join(' '));
    });
  }

  /* ---------------- 详情面板 ---------------- */
  function showDetail(sel) {
    var d = document.getElementById('detail');
    var flow = [], kv = [], title = '', sub = '';

    if (sel.type === 'branch') {
      var b = BRANCH_BY_ACTION[sel.name];
      title = '分支 ' + b.n + ' · ' + b.action + (b.composite ? ' ★ 复合分支' : '');
      sub = BIZ[b.biz].label + ' · guard 入参：' + b.input;
      b.senders.forEach(function (c) { flow.push(['c', c]); });
      flow.push(['a', b.action]);
      b.ifaces.forEach(function (n) { flow.push(['i', n]); });
      kv.push(['接口数', b.ifaces.length]);
      kv.push(['发起组件', b.senders.length ? b.senders.join('、') : '无（前端未直接调用）']);
    } else if (sel.type === 'iface') {
      var i = IFACE_BY_NAME[sel.name];
      title = '接口 ' + i.no + ' · ' + i.name + '()';
      sub = 'server.js ' + i.line + ' · ' + i.desc;
      flow.push(['i', i.name]);
      var users = BRANCHES.filter(function (b) { return b.ifaces.indexOf(i.name) >= 0; });
      users.forEach(function (b) { flow.push(['a', b.action]); });
      kv.push(['被引用次数', users.length]);
      kv.push(['所属分支', users.map(function (b) { return b.action; }).join('、') || '—']);
    } else if (sel.type === 'comp') {
      var c = COMP_BY_NAME[sel.name];
      title = '组件 · ' + c.name;
      sub = 'components.js ' + c.line + ' · ' + c.note;
      flow.push(['c', c.name]);
      c.sends.forEach(function (sd) { if (BRANCH_BY_ACTION[sd[0]]) flow.push(['a', sd[0]]); });
      kv.push(['发起消息数', c.sends.length]);
      kv.push(['业务链', compBiz(c).map(function (k) { return BIZ[k].label; }).join('、') || '—']);
    } else if (sel.type === 'db') {
      title = '数据访问层 · db.js';
      sub = '连接池 + 通用方法（' + sel.name + '）';
      flow.push(['i', sel.name]);
      kv.push(['方法', 'pool / query / insert / find / findOne / update / remove']);
    } else if (sel.type === 'table') {
      var t = TABLES.filter(function (x) { return x.name === sel.name; })[0];
      title = '数据表 · ' + t.name;
      sub = t.comment;
      kv.push(['字段数', t.fields.length]);
      kv.push(['主键', (t.fields.filter(function (f) { return f[2]; }).map(function (f) { return f[0]; })[0]) || '—']);
    }

    var h = '<div class="dt">' + title + '</div><div class="dsub">' + sub + '</div><div class="flow">';
    flow.forEach(function (f, idx) {
      if (idx > 0) h += '<span class="arrow">→</span>';
      var k = f[0] === 'c' ? 'c' : f[0] === 'a' ? 'a' : 'node';
      h += '<span class="node ' + (f[0] === 'i' ? '' : k) + '">' + esc(f[1]) + '</span>';
    });
    h += '</div>';
    if (kv.length) {
      h += '<div class="kv">';
      kv.forEach(function (p) { h += '<span>' + p[0] + '：<b>' + esc(p[1]) + '</b></span>'; });
      h += '</div>';
    }
    d.innerHTML = h; d.classList.add('on');
  }
  function hideDetail() { var d = document.getElementById('detail'); d.classList.remove('on'); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ---------------- 工具栏 ---------------- */
  function renderFilters() {
    var host = document.getElementById('filters');
    var all = el('button', 'fbtn on', '全部 (47)');
    all.addEventListener('click', function () { setBiz('all'); });
    host.appendChild(all);
    Object.keys(BIZ).forEach(function (k) {
      var cnt = BRANCHES.filter(function (b) { return b.biz === k; }).length;
      var b = el('button', 'fbtn', BIZ[k].label + ' (' + cnt + ')');
      b.style.borderColor = bizColor(k) + '55';
      b.addEventListener('click', function () { setBiz(k); });
      b.dataset.biz = k;
      host.appendChild(b);
    });
  }
  function setBiz(k) {
    state.biz = k;
    var btns = document.querySelectorAll('#filters .fbtn');
    for (var i = 0; i < btns.length; i++) {
      var isAll = btns[i].dataset.biz === undefined;
      var on = (k === 'all' && isAll) || btns[i].dataset.biz === k;
      btns[i].classList.toggle('on', on);
      btns[i].style.background = on && btns[i].dataset.biz ? bizColor(btns[i].dataset.biz) : '';
      btns[i].style.borderColor = on && btns[i].dataset.biz ? bizColor(btns[i].dataset.biz) : (btns[i].dataset.biz ? bizColor(btns[i].dataset.biz) + '55' : '');
      btns[i].style.color = on && btns[i].dataset.biz ? '#fff' : '';
    }
    paint();
  }

  /* ---------------- 启动 ---------------- */
  function init() {
    renderFilters();
    renderLayers();
    renderMatrix();
    renderIfaces();
    renderComponents();
    renderTables();
    paint();

    document.getElementById('q').addEventListener('input', function (e) { state.q = e.target.value; paint(); });
    document.getElementById('reset').addEventListener('click', function () {
      state.q = ''; document.getElementById('q').value = '';
      setBiz('all'); state.lock = null; state.hover = null; hideDetail(); paint();
    });

    /* 悬停高亮（事件委托，避免逐元素绑定） */
    function nodeOf(t) { while (t && t !== document.body) { if (t.__node) return t.__node; t = t.parentNode; } return null; }
    document.addEventListener('mouseover', function (e) {
      var n = nodeOf(e.target);
      if (n && n.type !== 'db') { state.hover = n; paint(); }
    });
    document.addEventListener('mouseout', function (e) {
      if (state.hover) { state.hover = null; paint(); }
    });
  }

  /* 数据挂载：供扁平版页面（arch-flat.html）复用同一份数据模型 */
  window.QMES_DIAGRAM_DATA = { BIZ: BIZ, IFACES: IFACES, BRANCHES: BRANCHES, COMPONENTS: COMPONENTS, TABLES: TABLES };

  /* 仅旧版纵深页面（存在 #matrix-body 容器）执行本文件自带渲染 */
  if (document.getElementById('matrix-body')) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})();
