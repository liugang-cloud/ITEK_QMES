/* QMES 架构图 · 扁平版（左右分栏）渲染逻辑
   数据复用 diagram.js 挂载的 window.QMES_DIAGRAM_DATA
   改造为 window.renderArchFlat() 可重复调用，供 Vue 组件挂载时使用 */
window.renderArchFlat = function () {
  'use strict';

  var D = window.QMES_DIAGRAM_DATA;
  if (!D) return;
  var BIZ = D.BIZ, IFACES = D.IFACES, BRANCHES = D.BRANCHES, COMPONENTS = D.COMPONENTS, TABLES = D.TABLES;

  var BRANCH_BY_ACTION = {}, IFACE_BY_NAME = {}, COMP_BY_NAME = {}, TABLE_BY_NAME = {};
  BRANCHES.forEach(function (b) { BRANCH_BY_ACTION[b.action] = b; });
  IFACES.forEach(function (i) { IFACE_BY_NAME[i.name] = i; });
  COMPONENTS.forEach(function (c) { COMP_BY_NAME[c.name] = c; });
  TABLES.forEach(function (t) { TABLE_BY_NAME[t.name] = t; });

  var chipMap = {}; /* key: type:name → chip 元素 */
  var sel = null;   /* 点击选中的 { type, name } */
  var hoverNode = null; /* 悬停预览的 { type, name } */

  /* ---------------- 分组聚合：每层 chips 按业务域分行 ---------------- */
  var COMP_GROUPS = [
    { label: '框架/通用', items: ['app（根实例）', 'page-guide', 'page-placeholder', 'vue-pager', 'page-base-data'] },
    { label: '扫码检验', items: ['page-scan'] },
    { label: '检验记录', items: ['page-records', 'page-record-detail'] },
    { label: '扫码装配', items: ['page-assemble', 'page-assemble-records', 'page-assemble-detail'] },
    { label: '基础资料', items: ['page-inspect-item', 'page-item-add', 'page-material', 'page-material-add', 'page-rule', 'page-rule-add', 'page-rule-detail'] },
    { label: 'BOM', items: ['page-bom', 'page-bom-detail', 'page-bom-add'] },
    { label: '条码管理', items: ['page-barcode-format', 'page-barcode-print', 'page-barcode-archive'] }
  ];
  var IFACE_GROUPS = [
    { label: '登录鉴权', items: ['login', 'getSession', 'logout'] },
    { label: '扫码检验', items: ['queryMaterial', 'checkBatch', 'getInspectItems', 'createInspection'] },
    { label: '检验记录', items: ['queryInspectionList', 'getInspectionDetail', 'updateInspectionDetail', 'deleteInspectionRecords', 'queryInspectionHistory', 'getInspectionHistoryVersion'] },
    { label: '项目/规则', items: ['queryInspectItems', 'queryInspectRules', 'getInspectRuleDetail', 'updateInspectRule', 'createInspectItem', 'updateInspectItem', 'createInspectRule', 'getRuleCodes'] },
    { label: '物料', items: ['queryMaterials', 'createMaterial', 'updateMaterial'] },
    { label: 'BOM', items: ['queryBomParentList', 'getBomDetail', 'updateBomDetail', 'queryBomHistory', 'getBomHistoryVersion', 'createBom'] },
    { label: '扫码装配', items: ['checkAssemble', 'checkMainMaterial', 'checkComponentSn', 'checkComponentBom', 'checkComponentInspection', 'createAssemble', 'queryAssembleList', 'getAssembleDetail', 'updateAssembleDetail', 'deleteAssembleRecords', 'queryAssembleHistory', 'getAssembleHistoryVersion'] },
    { label: 'Excel 导入', items: ['importInspectItems', 'importInspectRules', 'importMaterials', 'importBom'] },
    { label: '条码管理', items: ['getBarcodeRule', 'updateBarcodeRule', 'recordSnSerial', 'querySnArchive', 'getSerialMap'] }
  ];
  var TABLE_GROUPS = [
    { label: '用户', items: ['user'] },
    { label: '物料/BOM', items: ['material', 'bom', 'bom_history'] },
    { label: '检验', items: ['inspection_item', 'inspection_rule', 'inspection_rule_item', 'inspection_record', 'inspection_record_detail', 'inspection_record_history'] },
    { label: '装配', items: ['assemble_record', 'assemble_record_detail', 'assemble_record_history'] },
    { label: '条码', items: ['barcode_rule', 'sn_serial'] }
  ];
  /* 分支层按业务链分组（与图例同序） */
  var BRANCH_GROUPS = Object.keys(BIZ).map(function (k) {
    return { label: BIZ[k].label, items: BRANCHES.filter(function (b) { return b.biz === k; }).map(function (b) { return b.action; }) };
  });

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }
  function esc(s) { return String(s); }
  function bizColor(k) { return (BIZ[k] && BIZ[k].color) || '#98a2b3'; }

  /* 组件业务链色：取首个可识别 send 的业务链 */
  function compBizKey(c) {
    for (var i = 0; i < c.sends.length; i++) {
      var b = BRANCH_BY_ACTION[c.sends[i][0]];
      if (b) return b.biz;
    }
    return null;
  }

  /* ---------------- 左侧五层 ---------------- */
  function band(title, sub, color, cnt) {
    var b = el('div', 'band'); b.style.borderLeftColor = color;
    var bl = el('div', 'bl');
    bl.appendChild(el('b', null, title));
    bl.appendChild(el('i', null, sub));
    bl.appendChild(el('span', 'cnt', cnt));
    b.appendChild(bl);
    var chips = el('div', 'chips'); b.appendChild(chips);
    return { el: b, chips: chips };
  }

  function addChip(chips, type, name, label, colorKey, feat) {
    var chip = el('span', 'chip' + (feat ? ' feat' : ''), label);
    if (colorKey) chip.style.borderLeft = '3px solid ' + bizColor(colorKey);
    chip.addEventListener('click', function () { select(type, name, true); });
    chip.addEventListener('mouseenter', function () { hoverNode = { type: type, name: name }; paint(); });
    chip.addEventListener('mouseleave', function () { hoverNode = null; paint(); });
    chipMap[type + ':' + name] = chip;
    chips.appendChild(chip);
    return chip;
  }

  /* 按分组定义分行渲染 chips；未落入任何组的项兜底进「其他」行 */
  function renderGroups(chipsHost, groups, allItems, renderItem) {
    var placed = {};
    groups.forEach(function (g) {
      var row = el('div', 'grow');
      row.appendChild(el('span', 'glabel', g.label));
      g.items.forEach(function (name) {
        if (!allItems[name] || placed[name]) return;
        placed[name] = 1;
        renderItem(row, allItems[name]);
      });
      if (row.children.length > 1) chipsHost.appendChild(row);
    });
    var rest = Object.keys(allItems).filter(function (n) { return !placed[n]; });
    if (rest.length) {
      var row = el('div', 'grow');
      row.appendChild(el('span', 'glabel', '其他'));
      rest.forEach(function (n) { renderItem(row, allItems[n]); });
      chipsHost.appendChild(row);
    }
  }

  function renderLegend() {
    var host = document.getElementById('legend');
    Object.keys(BIZ).forEach(function (k) {
      var i = el('i');
      var sw = el('span', 'sw'); sw.style.background = BIZ[k].color;
      i.appendChild(sw);
      i.appendChild(document.createTextNode(BIZ[k].label));
      host.appendChild(i);
    });
    var tip = el('i');
    var sw = el('span', 'sw'); sw.style.background = 'linear-gradient(135deg,#fff7e6,#ffeecc)'; sw.style.border = '1px solid #e0a030';
    tip.appendChild(sw);
    tip.appendChild(document.createTextNode('复合分支（一个 action 串多个接口）'));
    host.appendChild(tip);
  }

  function renderLayers() {
    var host = document.getElementById('layers');

    var b1 = band('① 前端组件层', 'web/ · Vue 2.7（CDN，无构建）', '#7c3aed', COMPONENTS.length + ' 个组件 + app.js');
    renderGroups(b1.chips, COMP_GROUPS, COMP_BY_NAME, function (row, c) {
      addChip(row, 'comp', c.name, c.name, compBizKey(c), false);
    });
    host.appendChild(b1.el);

    var b2 = band('② 消息路由层', 'http.js · WebSocket switch(action) + 登录鉴权', '#1565c0', BRANCHES.length + ' 个 action 分支');
    renderGroups(b2.chips, BRANCH_GROUPS, BRANCH_BY_ACTION, function (row, b) {
      addChip(row, 'branch', b.action, b.action + (b.composite ? ' ★' : ''), b.biz, b.composite);
    });
    host.appendChild(b2.el);

    var b3 = band('③ 业务接口层', 'server.js · ' + IFACES.length + ' 个导出接口', '#0d9488', IFACES.length + ' 个接口 + 8 个内部辅助函数');
    renderGroups(b3.chips, IFACE_GROUPS, IFACE_BY_NAME, function (row, i) {
      addChip(row, 'iface', i.name, i.name, null, false);
    });
    host.appendChild(b3.el);

    var b4 = band('④ 数据访问层', 'db.js · MySQL 连接池 + 通用方法', '#475467', '1 个模块');
    var dbRow = el('div', 'grow');
    addChip(dbRow, 'db', 'db.js', 'db.js', null, false);
    b4.chips.appendChild(dbRow);
    host.appendChild(b4.el);

    var b5 = band('⑤ 数据库层', 'MySQL · qmes 库', '#db2777', TABLES.length + ' 张表');
    renderGroups(b5.chips, TABLE_GROUPS, TABLE_BY_NAME, function (row, t) {
      addChip(row, 'table', t.name, t.name, null, false);
    });
    host.appendChild(b5.el);
  }

  /* ---------------- 关联与高亮 ---------------- */
  function relatedOf(type, name) {
    var rel = { comp: {}, branch: {}, iface: {}, table: {}, db: {} };
    if (type === 'branch') {
      var b = BRANCH_BY_ACTION[name];
      rel.branch[name] = 1;
      b.ifaces.forEach(function (i) { rel.iface[i] = 1; });
      b.senders.forEach(function (c) { rel.comp[c] = 1; });
    } else if (type === 'iface') {
      rel.iface[name] = 1;
      BRANCHES.forEach(function (b) {
        if (b.ifaces.indexOf(name) >= 0) {
          rel.branch[b.action] = 1;
          b.senders.forEach(function (c) { rel.comp[c] = 1; });
        }
      });
    } else if (type === 'comp') {
      rel.comp[name] = 1;
      (COMP_BY_NAME[name].sends || []).forEach(function (sd) {
        if (BRANCH_BY_ACTION[sd[0]]) {
          rel.branch[sd[0]] = 1;
          BRANCH_BY_ACTION[sd[0]].ifaces.forEach(function (i) { rel.iface[i] = 1; });
        }
      });
    } else if (type === 'db') {
      rel.db[name] = 1;
    } else if (type === 'table') {
      rel.table[name] = 1; rel.db['db.js'] = 1;
    }
    return rel;
  }

  /* 高亮焦点：悬停优先于选中；sel 类仅由点击选中决定 */
  function paint() {
    var focus = hoverNode || sel;
    var rel = focus ? relatedOf(focus.type, focus.name) : null;
    Object.keys(chipMap).forEach(function (k) {
      var chip = chipMap[k];
      var parts = k.split(':');
      var type = parts[0], name = parts.slice(1).join(':');
      chip.classList.remove('sel', 'rel', 'dim');
      if (sel && type === sel.type && name === sel.name) { chip.classList.add('sel'); return; }
      if (!focus) return;
      if (rel && rel[type] && rel[type][name]) chip.classList.add('rel');
      else chip.classList.add('dim');
    });
  }

  /* ---------------- 右侧详情 ---------------- */
  function lk(type, name, label, cls) {
    var e = el('span', 'lk' + (cls ? ' ' + cls : ''), label || name);
    e.addEventListener('click', function () { select(type, name, true); });
    return e;
  }
  function kv(k, v, isCode) {
    var row = el('div', 'kv-line');
    row.appendChild(el('span', 'k', k));
    row.appendChild(el('span', 'v' + (isCode ? ' code' : ''), v));
    return row;
  }
  function group(title) {
    var g = el('div', 'kv-group');
    g.appendChild(el('div', 'kg-t', title));
    return g;
  }

  /* ---------------- 关联链路：组件 → action → 接口 ----------------
     复合分支（一个消息调多个接口）计为一条链路，接口在行内依次展示 */
  function chainsOf(type, name) {
    var chains = [];
    if (type === 'comp') {
      (COMP_BY_NAME[name].sends || []).forEach(function (sd) {
        var b = BRANCH_BY_ACTION[sd[0]];
        if (!b) return;
        chains.push({ comps: [name], action: b.action, ifaces: b.ifaces.slice() });
      });
    } else if (type === 'branch') {
      var br = BRANCH_BY_ACTION[name];
      chains.push({ comps: br.senders.slice(), action: br.action, ifaces: br.ifaces.slice() });
    } else if (type === 'iface') {
      BRANCHES.forEach(function (b) {
        if (b.ifaces.indexOf(name) >= 0) chains.push({ comps: b.senders.slice(), action: b.action, ifaces: b.ifaces.slice() });
      });
    }
    return chains;
  }

  function chainRow(ch) {
    var row = el('div', 'chain');
    if (ch.comps.length === 0) row.appendChild(el('span', 'chain-none', '—'));
    ch.comps.forEach(function (cm, idx) {
      if (idx > 0) row.appendChild(el('span', 'arr', '+'));
      row.appendChild(lk('comp', cm, cm, 'c'));
    });
    row.appendChild(el('span', 'arr', '→'));
    row.appendChild(lk('branch', ch.action, ch.action, 'a'));
    row.appendChild(el('span', 'arr', '→'));
    ch.ifaces.forEach(function (i, idx) {
      if (idx > 0) row.appendChild(el('span', 'arr', '·'));
      row.appendChild(lk('iface', i));
    });
    return row;
  }

  /* 在基本信息下方插入关联链路分组（多条全部列出） */
  function appendChains(c, type, name) {
    var chains = chainsOf(type, name);
    if (chains.length === 0) return;
    var g = group('关联链路（' + chains.length + '）');
    chains.forEach(function (ch) { g.appendChild(chainRow(ch)); });
    c.appendChild(g);
  }

  function showDetail(type, name) {
    document.getElementById('detail-empty').style.display = 'none';
    document.getElementById('detail-body').style.display = 'block';
    var t = document.getElementById('d-title');
    var s = document.getElementById('d-sub');
    var c = document.getElementById('d-content');
    c.innerHTML = '';
    t.textContent = ''; s.textContent = '';

    if (type === 'branch') {
      var b = BRANCH_BY_ACTION[name];
      t.textContent = 'action · ' + b.action;
      s.textContent = '消息路由层 · http.js · 分支 #' + b.n;
      var g1 = group('基本信息');
      g1.appendChild(kv('业务链', ''));
      var pill = el('span', 'pill', BIZ[b.biz].label); pill.style.background = bizColor(b.biz);
      g1.lastChild.querySelector('.v').appendChild(pill);
      g1.appendChild(kv('入参', b.input, true));
      g1.appendChild(kv('复合分支', b.composite ? '是（一个 action 串多个接口）' : '否'));
      if (b.composite) g1.appendChild(kv('★ 标记', '左侧层带中以橙色 chip 显示'));
      c.appendChild(g1);
      appendChains(c, type, name);

    } else if (type === 'iface') {
      var i = IFACE_BY_NAME[name];
      t.textContent = '接口 #' + i.no + ' · ' + i.name;
      s.textContent = '业务接口层 · server.js ' + i.line;
      var g4 = group('基本信息');
      g4.appendChild(kv('编号', '#' + i.no + '（module.exports 导出顺序）'));
      g4.appendChild(kv('行号', i.line, true));
      g4.appendChild(kv('作用', i.desc));
      c.appendChild(g4);
      appendChains(c, type, name);

    } else if (type === 'comp') {
      var cm = COMP_BY_NAME[name];
      t.textContent = '组件 · ' + cm.name;
      s.textContent = '前端组件层 · components.js / app.js ' + cm.line;
      var g6 = group('基本信息');
      g6.appendChild(kv('位置', cm.line, true));
      g6.appendChild(kv('说明', cm.note || '—'));
      var bk = compBizKey(cm);
      if (bk) {
        g6.appendChild(kv('业务链', ''));
        var p2 = el('span', 'pill', BIZ[bk].label); p2.style.background = bizColor(bk);
        g6.lastChild.querySelector('.v').appendChild(p2);
      }
      c.appendChild(g6);
      appendChains(c, type, name);
      var g7 = group('发起的消息（' + cm.sends.length + '）');
      if (cm.sends.length === 0) g7.appendChild(el('div', 'kv-line', '不发起任何请求'));
      cm.sends.forEach(function (sd) {
        if (BRANCH_BY_ACTION[sd[0]]) g7.appendChild(lk('branch', sd[0], sd[0] + '  ' + sd[1], 'a'));
        else g7.appendChild(el('div', 'kv-line', sd[0] + '（' + sd[1] + '）'));
      });
      c.appendChild(g7);

    } else if (type === 'db') {
      t.textContent = '模块 · db.js';
      s.textContent = '数据访问层 · MySQL 连接池 + 通用方法';
      var g8 = group('基本信息');
      g8.appendChild(kv('职责', 'MySQL 连接池（dateStrings: true，避免时区转换导致日期显示错误）'));
      g8.appendChild(kv('方法', 'pool / query / insert / find / findOne / update / remove', true));
      c.appendChild(g8);
      var g9 = group('覆盖的数据表（' + TABLES.length + '）');
      TABLES.forEach(function (tb) { g9.appendChild(lk('table', tb.name)); });
      c.appendChild(g9);

    } else if (type === 'table') {
      var tb = TABLE_BY_NAME[name];
      t.textContent = '数据表 · ' + tb.name;
      s.textContent = '数据库层 · qmes 库';
      var gA = group('基本信息');
      gA.appendChild(kv('说明', tb.comment));
      gA.appendChild(kv('字段数', String(tb.fields.length)));
      var pk = tb.fields.filter(function (f) { return f[2]; }).map(function (f) { return f[0]; })[0];
      gA.appendChild(kv('主键', pk || '—', true));
      c.appendChild(gA);
      var gB = group('字段（' + tb.fields.length + '）');
      var tab = el('table', 'ftab');
      var trh = el('tr');
      trh.appendChild(el('th', null, '字段'));
      trh.appendChild(el('th', null, '类型'));
      tab.appendChild(trh);
      tb.fields.forEach(function (f) {
        var tr = el('tr');
        var td1 = el('td', null, f[0] + (f[2] ? ' 🔑' : ''));
        if (f[2]) td1.classList.add('pk');
        tr.appendChild(td1);
        tr.appendChild(el('td', null, f[1]));
        tab.appendChild(tr);
      });
      gB.appendChild(tab);
      c.appendChild(gB);
    }
  }

  function select(type, name, scroll) {
    sel = { type: type, name: name };
    paint();
    showDetail(type, name);
    if (scroll) {
      var chip = chipMap[type + ':' + name];
      if (chip && chip.scrollIntoView) chip.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  /* 清除选中：恢复高亮与详情面板初始提示 */
  function clearSel() {
    if (!sel) return;
    sel = null;
    paint();
    document.getElementById('detail-empty').style.display = 'block';
    document.getElementById('detail-body').style.display = 'none';
  }

  /* 点击空白处（非 chip / 详情链接 / 详情面板）清除选中状态 —— 去重绑定 */
  if (window.__archFlatDocClick) document.removeEventListener('click', window.__archFlatDocClick);
  window.__archFlatDocClick = function (e) {
    var t = e.target;
    while (t && t !== document) {
      if (t.classList && (t.classList.contains('chip') || t.classList.contains('lk') || t.classList.contains('detail'))) return;
      t = t.parentNode;
    }
    clearSel();
  };
  document.addEventListener('click', window.__archFlatDocClick);

  /* ---------------- 启动 ---------------- */
  renderLegend();
  renderLayers();
};
