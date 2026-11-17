// ========== 业务链路总览（默认首页） ==========

Vue.component('page-guide', {
  data() {
    return {
      flow: [
        { t: '基础资料准备', s: '项目 / 规则 / 物料 / BOM' },
        { t: '条码打印', s: '流水生成 + 档案归档' },
        { t: '扫码检验', s: '项目录入 + 自动判定' },
        { t: '扫码装配', s: 'BOM 槽位逐项校验' },
        { t: '记录追溯', s: '查询 / 修改 / 历史版本' }
      ],
      links: [
        {
          no: '01', title: '基础资料准备', tag: '前置数据', color: '#d97706',
          desc: '按「检验项目 → 检验规则 → 物料 → BOM」的依赖顺序维护，是检验判定与装配校验的数据来源。',
          steps: [
            { t: '检验项目', d: '编号/名称/录入类型' },
            { t: '检验规则', d: '绑定项目+标准值' },
            { t: '物料', d: '绑定多条检验规则' },
            { t: 'BOM', d: '主件+元件+用量' }
          ],
          notes: [
            '检验规则的标准区间以「最小值,最大值」存储，扫码检验时据此自动判定单项是否合格',
            '物料可绑定多条检验规则，扫码时一次性带出全部规则下的项目并按项目 ID 去重',
            'BOM 按元件用量展开为槽位，用量为 N 则生成 N 个待扫槽位',
            '所有编号与组合均校验全局唯一，重复时返回明确错误'
          ]
        },
        {
          no: '02', title: '条码生成与打印', tag: '条码管理', color: '#db2777',
          desc: '在物料列表行内选择日期与流水号，按数量批量打印，打印成功后自动归档。',
          steps: [
            { t: '选物料+日期', d: '取当前最大流水号' },
            { t: '设打印数量', d: '1 ~ 500 个' },
            { t: '生成连续条码', d: '四位流水自动补零' },
            { t: '打印并归档', d: '写入条码档案' }
          ],
          notes: [
            '流水号始终为当前最大值 + 1，切换日期后自动重新计算',
            '打印成功后写入条码档案，同一条码重复打印自动跳过且不报错',
            '单次打印上限 500 个，避免浏览器渲染过多二维码卡顿',
            '标签样式默认为30*40mm，可自定义尺寸以及文本位置和大小'
          ]
        },
        {
          no: '03', title: '扫码检验', tag: '检验管理', color: '#1565c0',
          desc: '扫描条码完成校验、项目录入与自动判定，提交生成检验单。',
          steps: [
            { t: '扫条码', d: '格式+物料+查重' },
            { t: '带出项目', d: '按绑定规则聚合去重' },
            { t: '录入判定', d: '自动判定可人工覆盖' },
            { t: '提交成单', d: '有不合格即整单不合格' }
          ],
          notes: [
            '条码格式由全局唯一的条码规则校验，已检验的条码直接拦截',
            '数值型项目强制数字格式校验，文本型项目不做输入限制',
            '所有项目均为合格时，整单结论为合格；否则为不合格',
            '未完成检验的，可在修改界面继续录入'
          ]
        },
        {
          no: '04', title: '扫码装配', tag: '检验管理', color: '#0d9488',
          desc: '扫主件 SN 带出 BOM 槽位，逐个扫描元件完成装配并生成装配单。',
          steps: [
            { t: '扫主件 SN', d: '查重+是否主件' },
            { t: '带出槽位', d: '按 BOM 用量全量展开' },
            { t: '扫元件 SN', d: '查重+BOM匹配+检验记录' },
            { t: '提交装配', d: '槽位全满即完成' }
          ],
          notes: [
            '元件 SN 必须已存在检验记录，无检验记录直接拦截并提示',
            '存在查重、BOM 匹配、应扫数量上限三类校验',
            '未完成装配的，可在修改界面继续装配',
            '已扫数量 = SN 非空的槽位数，应扫数量 = BOM 元件用量合计'
          ]
        },
        {
          no: '05', title: '记录查询与追溯', tag: '记录管理', color: '#7c3aed',
          desc: '检验记录与装配记录的查询、明细修改、历史版本追溯与批量删除。',
          steps: [
            { t: '组合筛选', d: '分页查询' },
            { t: '明细修改', d: '仅单身可改' },
            { t: '历史版本', d: '按版本号追溯' },
            { t: '批量删除', d: '勾选后删除' }
          ],
          notes: [
            '修改时自动重算整单结论与完成度，并写入更新人、更新时间',
            '每次修改前将明细归档至历史表，版本号自动递增',
            '进度显示为「已录入/应录入」，如 1/29',
            '删除按钮仅在勾选记录后出现，与查询按钮并列'
          ]
        },
        {
          no: '06', title: 'Excel 批量导入', tag: '数据初始化', color: '#059669',
          desc: '检验项目、检验规则、物料、BOM 四类基础资料支持 Excel 批量导入。',
          steps: [
            { t: '准备文件', d: '按模板列填写' },
            { t: '上传校验', d: '整批逐行检查' },
            { t: '事务写入', d: '全部通过才入库' },
            { t: '刷新列表', d: '回到第 1 页' }
          ],
          notes: [
            '检验项目：项目编号、项目名称、录入类型、状态',
            '检验规则：规则编号、规则说明、项目编号、标准值、标准区间',
            '物料：物料编号、物料名称、规格、检验大类、状态',
            'BOM：主件料号、元件料号、用量'
          ]
        }
      ]
    };
  },
  template: `
    <div>
      <div class="page-title">业务链路总览</div>

      <div class="guide-card flow-card">
        <div class="flow-main">
          <div class="flow-node" v-for="f in flow" :key="f.t">
            <div class="fn-t">{{ f.t }}</div>
            <div class="fn-s">{{ f.s }}</div>
          </div>
        </div>
        
      </div>

      <div class="link-grid">
        <div class="guide-card link-card" v-for="lk in links" :key="lk.no">
          <div class="link-head">
            <span class="link-no" :style="{ background: lk.color }">{{ lk.no }}</span>
            <span class="link-title">{{ lk.title }}</span>
            <span class="link-tag">{{ lk.tag }}</span>
          </div>
          <div class="link-desc">{{ lk.desc }}</div>
          <div class="link-steps">
            <div class="link-step" v-for="(s, i) in lk.steps" :key="i">
              <div class="ls-t">{{ s.t }}</div>
              <div class="ls-d">{{ s.d }}</div>
            </div>
          </div>
          <ul class="link-notes">
            <li v-for="(n, i) in lk.notes" :key="i">{{ n }}</li>
          </ul>
        </div>
      </div>
    </div>
  `
});

// ========== 占位页面 ==========
Vue.component('page-placeholder', {
  props: ['title'],
  template: `
    <div>
      <div class="page-title">{{ title }}</div>
      <div class="panel">该功能开发中，敬请期待。</div>
    </div>
  `
});

// 通用占位包装
function placeholder(title) {
  return {
    props: ['ws'],
    template: `<page-placeholder title="${title}"></page-placeholder>`
  };
}

// ========== 扫码检验 ==========
Vue.component('page-scan', {
  props: ['ws'],
  data() {
    return {
      barcode: '',
      material: null,
      items: [],
      process_result: '接收',
      message: '',
      msgType: '',
      // 到货单绑定（非必填）
      arrival_order: null,
      arrivalModalOpen: false,
      arrivalLoading: false,
      arrivalQuery: { date_start: '', date_end: '', supplier_id: '' },
      arrivalList: [],
      arrivalTotal: 0,
      arrivalPage: 1,
      arrivalPageSize: 10,
      suppliers: [],
      // 预览弹窗
      previewOpen: false,
      previewUrls: [],
      previewIndex: 0,
      // 三坐标报告 PDF
      cmmUploading: false,
      cmmReportUrl: ''
    };
  },
  computed: {
    filledCount() {
      return this.items.filter(it => this.isFilled(it)).length;
    }
  },
  methods: {
    async onScan() {
      this.message = '';
      this.barcode = (this.barcode || '').trim();
      if (!this.barcode) return;

      // 1. 扫描校验（查重 + 格式 + 物料）
      const scanRes = await this.ws.send('scan', this.barcode);
      if (!scanRes.success) {
        this.material = null;
        this.items = [];
        this.arrival_order = null;
        this.msgType = 'err';
        this.message = scanRes.message;
        return;
      }
      this.material = scanRes.data;
      this.arrival_order = null;

      // 2. 获取检验项目
      const itemsRes = await this.ws.send('getInspectItems', this.material.material_id);
      // 新加载的项目默认「未判定」（横线），不计入自动判定，也不参与整单结论
      this.items = (itemsRes.data || []).map(it => ({ ...it, measured_val: '', measured_text: '', image_url: '', is_pass: null, judged: false, entry_time: null, attachments: [] }));
      this.msgType = 'ok';
      this.message = `物料：${this.material.material_name}，共 ${this.items.length} 个检验项目`;
    },
    async submit() {
      // 数值型项目的测量值必须是数字（文本型项目不限）
      const badNum = this.items.filter(it => this.numInvalid(it));
      if (badNum.length) {
        this.msgType = 'err';
        this.message = `以下项目需填写数字：${badNum.map(it => it.item_name).join('、')}`;
        return;
      }

      // 不再强制所有项目填写：未录入的项目按「未判定」提交，计入未完成进度

      const data = {
        material_id: this.material.material_id,
        batch_no: this.barcode,
        rule_code: this.material.inspect_category || null,
        result: 1,
        process_result: this.process_result || '接收',
        arrival_order_id: this.arrival_order ? this.arrival_order.id : null,
        cmm_report_url: this.cmmReportUrl || null,
        items: this.items.map(it => ({
          item_id: it.item_id,
          item_name: it.item_name,
          measured_val: it.measured_val || null,
          measured_text: it.measured_text || null,
          image_url: it.image_url || null,
          is_pass: it.is_pass === null || it.is_pass === undefined ? null : it.is_pass,
          entry_time: it.entry_time || null,
          attachments: (it.attachments || []).slice()
        }))
      };
      const res = await this.ws.send('createInspection', data);
      if (res.success) {
        this.msgType = 'ok';
        const p = `${this.filledCount}/${this.items.length}`;
        this.message = `检验单提交成功，单号：${res.data.record_id}，录入进度 ${p}（${res.data.is_complete == 1 ? '已完成' : '未完成'}）`;
        // 提交成功后清空扫码区，便于连续检验下一件
        this.barcode = '';
        this.material = null;
        this.items = [];
        this.arrival_order = null;
        this.cmmReportUrl = '';
      } else {
        this.msgType = 'err';
        this.message = res.message;
      }
    },
    // 明细是否已录入：测量值、说明或图片任一非空
    isFilled(it) {
      const v = it.measured_val;
      if (v !== null && v !== undefined && String(v).trim() !== '') return true;
      const t = it.measured_text;
      if (t !== null && t !== undefined && String(t).trim() !== '') return true;
      return !!(it.image_url && String(it.image_url).trim() !== '');
    },
    // 标准/区间展示：标准值与标准区间（min,max -> min~max）可同时存在
    stdText(it) {
      const parts = [];
      if (it.standard_value !== null && it.standard_value !== undefined && it.standard_value !== '') parts.push(String(it.standard_value));
      if (it.standard_range) parts.push(String(it.standard_range).split(',').join(' ~ '));
      return parts.length ? parts.join(' (') + (parts.length > 1 ? ')' : '') : '-';
    },
    // 是否为数值型录入项目
    isNumberItem(it) { return it.item_type === 'number'; },
    // 是否为图片型录入项目
    isImageItem(it) { return it.item_type === 'image'; },
    // 项目类型展示
    typeText(it) {
      return it.item_type === 'number' ? '数值' : it.item_type === 'text' ? '文本' : it.item_type === 'image' ? '图片' : '-';
    },
    previewImage(url) { if (url) window.open(url, '_blank'); },
    // 图片类型项目上传检验图片
    async uploadItemImage(it, e) {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      e.target.value = '';
      const fd = new FormData();
      fd.append('file', f);
      try {
        const resp = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await resp.json();
        if (!data.success) { alert(data.message || '上传失败'); return; }
        it.image_url = data.data.url;
        it.entry_time = this.formatTime(new Date());
        this.message = '';
      } catch (err) {
        alert('上传失败：' + err.message);
      }
    },
    removeItemImage(it) {
      it.image_url = '';
      if (!this.isFilled(it)) it.entry_time = null;
    },
    // 上传三坐标报告 PDF → 拿到绝对地址 → 调用解析接口 → 把 table 数据匹配到检验项目
    async uploadCmmReport(e) {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      e.target.value = '';
      if (!/\.pdf$/i.test(f.name)) { alert('请选择 PDF 文件'); return; }
      if (!this.material) { alert('请先扫描条码加载检验项目'); return; }
      this.cmmUploading = true;
      try {
        const fd = new FormData();
        fd.append('file', f);
        const resp = await fetch('/api/upload-pdf', { method: 'POST', body: fd });
        const data = await resp.json();
        if (!data.success) { alert(data.message || '上传失败'); return; }
        const absUrl = data.data.url;
        this.cmmReportUrl = absUrl;
        console.log('[三坐标报告] 上传成功，文件地址：', absUrl);

        const presp = await fetch('/api/parse-cmm?path=' + encodeURIComponent(absUrl));
        const parsed = await presp.json();
        // 只取 table 数据
        const rows = (parsed && parsed.table && Array.isArray(parsed.table.rows)) ? parsed.table.rows : [];
        console.log('[三坐标报告] table 数据：', rows);
        if (!rows.length) {
          this.msgType = 'err';
          this.message = '解析结果中没有表格数据';
          return;
        }
        this.matchCmmRows(rows);
      } catch (err) {
        console.error('[三坐标报告] 处理失败：', err);
        alert('三坐标报告处理失败：' + err.message);
      } finally {
        this.cmmUploading = false;
      }
    },
    // 按名称匹配：characteristic 包含检验项目名称即视为同一项，写入 measurement
    matchCmmRows(rows) {
      let matched = 0;
      const miss = [];
      this.items.forEach(it => {
        const name = String(it.item_name || '').trim();
        if (!name) return;
        const hit = rows.find(r => {
          const ch = String((r && r.characteristic) || '');
          return ch && ch.includes(name);
        });
        const val = hit ? hit.measurement : null;
        if (val !== null && val !== undefined && String(val).trim() !== '') {
          it.measured_val = String(val);
          this.onItemInput(it);
          this.autoJudge(it);
          matched++;
        } else {
          miss.push(name);
        }
      });
      this.msgType = miss.length ? 'err' : 'ok';
      this.message = `三坐标报告已匹配 ${matched}/${this.items.length} 项` +
        (miss.length ? `，未匹配：${miss.join('、')}` : '');
      console.log('[三坐标报告] 匹配完成：成功', matched, '项，未匹配', miss);
    },
    // 是否合法数字：不接受空串、纯空白、十六进制、科学计数法等
    isNum(v) {
      return /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(String(v).trim());
    },
    // 数值型项目：已填写但不是数字 → 非法（文本型项目不做限制）
    numInvalid(it) {
      if (!this.isNumberItem(it)) return false;
      const v = it.measured_val;
      if (v === '' || v === null || v === undefined) return false;
      return !this.isNum(v);
    },
    // 根据标准区间自动判定：实测值在 [min, max] 内为合格，否则不合格；用户手动选择后取消自动标记
    autoJudge(it) {
      if (!it.standard_range) return;
      const v = String(it.measured_val === null || it.measured_val === undefined ? '' : it.measured_val).trim();
      if (!this.isNum(v)) return;
      const parts = String(it.standard_range).split(',');
      if (parts.length !== 2) return;
      const min = Number(parts[0]);
      const max = Number(parts[1]);
      if (isNaN(min) || isNaN(max)) return;
      const num = Number(v);
      it.is_pass = (num >= min && num <= max) ? 1 : 0;
      it.judged = true;
    },
    // 格式化时间为 YYYY-MM-DD HH:mm:ss（供后端 datetime 字段接收）
    formatTime(d) {
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    },
    // 合格勾选框三态循环：合格(勾上) → 不合格(不勾) → 未判定(横线)
    cyclePass(it) {
      if (it.is_pass === 1) it.is_pass = 0;
      else if (it.is_pass === 0) it.is_pass = null;
      else it.is_pass = 1;
      it.judged = false;
    },
    passText(it) {
      if (it.is_pass === 1) return '合格';
      if (it.is_pass === 0) return '不合格';
      return '未判定';
    },
    passColor(it) {
      if (it.is_pass === 1) return '#059669';
      if (it.is_pass === 0) return '#dc2626';
      return '#909399';
    },
    // 三态勾选框外观：勾上(蓝底白勾) / 空白(白底) / 横线(白底短横)
    passBoxStyle(it) {
      const on = it.is_pass === 1;
      return {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '14px',
        height: '14px',
        boxSizing: 'border-box',
        border: on ? '1px solid #1565c0' : '1px solid #c0c4cc',
        borderRadius: '2px',
        background: on ? '#1565c0' : '#fff',
        color: on ? '#fff' : '#606266',
        flexShrink: 0,
        verticalAlign: 'middle'
      };
    },
    // 明细录入值时记录录入时间：首次录入打时间戳，清空则清除
    onItemInput(it) {
      if (this.isFilled(it)) {
        if (!it.entry_time) it.entry_time = this.formatTime(new Date());
      } else {
        it.entry_time = null;
      }
    },
    // 明细行附件（多图）上传
    async uploadItemAttach(it, e) {
      const files = Array.from(e.target.files || []);
      e.target.value = '';
      if (!it.attachments) it.attachments = [];
      for (const f of files) {
        // 图片类型校验：MIME 为 image/* 或扩展名为常见图片格式（部分系统 TIF 无 MIME）
        const okExt = /\.(png|jpe?g|gif|bmp|webp|tiff?)$/i.test(f.name);
        if (!/^image\//.test(f.type) && !okExt) { alert('只支持图片文件'); continue; }
        const fd = new FormData(); fd.append('file', f);
        try {
          const resp = await fetch('/api/upload', { method: 'POST', body: fd });
          const d = await resp.json();
          if (d.success) {
            it.attachments.push(d.data.url);
            // 表面1面型 / 表面2面型：上传后调用面型解析接口并在控制台输出结果
            const itemName = String(it.item_name || '');
            if (itemName.includes('表面1面型') || itemName.includes('表面2面型')) {
              this.parseSurfacePv(d.data.url, it);
            }
          } else alert(d.message || '上传失败');
        } catch (err) { alert('上传失败：' + err.message); }
      }
    },
    // 调用表面面型解析接口（走本机代理规避跨域），结果打印到控制台并把 valueText 写入测量值
    async parseSurfacePv(relUrl, it) {
      try {
        const absUrl = /^https?:\/\//i.test(relUrl) ? relUrl : (window.location.origin + relUrl);
        console.log('[面型解析] 图片地址：', absUrl);
        const resp = await fetch('/api/parse-pv?url=' + encodeURIComponent(absUrl));
        const data = await resp.json();
        console.log('[面型解析] 返回结果：', data);
        const vt = (data && data.valueText !== undefined && data.valueText !== null)
          ? data.valueText
          : (data && data.data ? data.data.valueText : undefined);
        if (it && vt !== undefined && vt !== null && String(vt).trim() !== '') {
          it.measured_val = String(vt);
        }
      } catch (err) {
        console.error('[面型解析] 调用失败：', err);
      }
    },
    // 浏览器无法直接渲染 TIF/TIFF，单独用文件标签展示
    isTifUrl(url) { return /\.tiff?$/i.test(String(url || '')); },
    // 附件缩略文字（取文件名尾部）
    attachLabel(url) {
      const name = String(url || '').split('/').pop();
      return name.length > 12 ? name.slice(0, 12) + '…' : name;
    },
    removeItemAttach(it, idx) { it.attachments && it.attachments.splice(idx, 1); },
    // ===== 到货单绑定（开窗查询） =====
    async loadSuppliers() {
      const res = await this.ws.send('querySuppliers', { page: 1, page_size: 500 });
      if (res.success) this.suppliers = res.data.list;
    },
    openArrivalModal() {
      if (!this.material) return;
      // 物料固定为当前扫码物料，不提供修改入口
      this.arrivalQuery = { date_start: '', date_end: '', supplier_id: '' };
      this.arrivalPage = 1;
      this.arrivalModalOpen = true;
      this.loadArrivalList();
    },
    closeArrivalModal() { this.arrivalModalOpen = false; },
    async loadArrivalList() {
      if (!this.material) return;
      this.arrivalLoading = true;
      const res = await this.ws.send('queryArrivalOrders', {
        material_id: this.material.material_id,
        arrival_date_start: this.arrivalQuery.date_start,
        arrival_date_end: this.arrivalQuery.date_end,
        supplier_id: this.arrivalQuery.supplier_id,
        page: this.arrivalPage,
        page_size: this.arrivalPageSize
      });
      this.arrivalLoading = false;
      if (res.success) {
        this.arrivalList = res.data.list;
        this.arrivalTotal = res.data.total;
      } else {
        this.arrivalList = [];
        this.arrivalTotal = 0;
      }
    },
    searchArrival() { this.arrivalPage = 1; this.loadArrivalList(); },
    onArrivalPage(p) { this.arrivalPage = p; this.loadArrivalList(); },
    chooseArrival(row) {
      this.arrival_order = row;
      this.arrivalModalOpen = false;
    },
    clearArrival() { this.arrival_order = null; },
    openPreview(urls, idx) {
      this.previewUrls = urls.slice();
      this.previewIndex = Math.max(0, Math.min(idx, urls.length - 1));
      this.previewOpen = true;
    },
    closePreview() { this.previewOpen = false; },
    prevImg() { if (this.previewIndex > 0) this.previewIndex--; },
    nextImg() { if (this.previewIndex < this.previewUrls.length - 1) this.previewIndex++; }
  },
  mounted() { this.loadSuppliers(); },
  template: `
    <div>
      <div class="page-title">扫码检验</div>
      <div class="panel">
        <div class="form-row">
          <label>条码：</label>
          <input v-model="barcode" placeholder="请输入或扫描条码（格式：料号#8位数字#4位数字）" @keyup.enter="onScan">
          <button @click="onScan">扫描</button>
        </div>

        <div v-if="message" :class="['tip', msgType]">{{ message }}</div>

        <!-- 物料信息：始终展示 -->
        <div style="margin-top:16px;">
          <div class="form-row"><label>料号：</label>{{ material ? material.material_id : '-' }}</div>
          <div class="form-row"><label>物料名称：</label>{{ material ? material.material_name : '-' }}</div>
          <div class="form-row"><label>规格：</label>{{ material ? material.material_spec : '-' }}</div>
          <div class="form-row" v-if="material"><label>处理结果：</label>
            <select v-model="process_result">
              <option value="接收">接收</option>
              <option value="拒绝">拒绝</option>
            </select>
          </div>
          <div class="form-row" v-if="material">
            <label>到货单：</label>
            <template v-if="arrival_order">
              <span style="color:#1565c0;">
                {{ String(arrival_order.arrival_date).slice(0, 10) }} / {{ arrival_order.supplier_name || '-' }} / 数量 {{ arrival_order.quantity }}
              </span>
              <button class="mini" style="margin-left:8px;" @click="openArrivalModal">重新选择</button>
              <button class="mini" style="margin-left:6px;background:#909399;" @click="clearArrival">清除</button>
            </template>
            <template v-else>
              <span style="color:#909399;">未选择（非必填）</span>
              <button class="mini" style="margin-left:8px;" @click="openArrivalModal">选择到货单</button>
            </template>
          </div>
          <div class="form-row">
            <label>三坐标报告：</label>
            <input ref="cmmFile" type="file" accept=".pdf,application/pdf" style="display:none" @change="uploadCmmReport">
            <button class="mini" style="background:#1e88e5;color:#fff;"
                    :disabled="cmmUploading" @click="$refs.cmmFile.click()">
              {{ cmmUploading ? '上传解析中...' : '三坐标报告' }}
            </button>
            <a v-if="cmmReportUrl" :href="cmmReportUrl" target="_blank"
               style="margin-left:8px;font-size:12px;word-break:break-all;">{{ cmmReportUrl }}</a>
          </div>
        </div>

        <!-- 检验项目：始终展示 -->
        <div style="margin-top:16px;">
          <h3 v-if="items.length" style="margin-bottom:8px;font-size:14px;color:#1565c0;">
            检验项目
            <span style="font-weight:400;color:#909399;font-size:13px;">（已录入 {{ filledCount }} / 应录入 {{ items.length }}）</span>
          </h3>
          <table>
            <thead>
              <tr><th>项目编号</th><th>项目名称</th><th>类型</th><th>标准/区间</th><th>测量值</th><th>说明</th><th>是否合格</th><th>录入时间</th><th>附件</th></tr>
            </thead>
            <tbody>
              <tr v-for="it in items" :key="it.item_id">
                <td>{{ it.item_id }}</td>
                <td>{{ it.item_name }}</td>
                <td>{{ typeText(it) }}</td>
                <td>{{ stdText(it) }}</td>
                <td>
                  <!-- 图片类型：上传检验图片 -->
                  <div v-if="isImageItem(it)">
                    <input :ref="'scan-file-' + it.item_id" type="file" accept="image/*" style="display:none" @change="uploadItemImage(it, $event)">
                    <template v-if="it.image_url">
                      <img :src="it.image_url" @click="previewImage(it.image_url)"
                        style="width:48px;height:48px;object-fit:cover;border:1px solid #e5e7eb;border-radius:4px;cursor:pointer;vertical-align:middle;"
                        title="点击预览">
                      <div style="margin-top:4px;">
                        <a href="javascript:;" @click="previewImage(it.image_url)" style="font-size:12px;word-break:break-all;">{{ it.image_url }}</a>
                      </div>
                      <div style="margin-top:4px;">
                        <button class="mini" @click="$refs['scan-file-' + it.item_id][0].click()">换图</button>
                        <button class="mini" style="margin-left:4px;background:#909399;color:#fff;" @click="removeItemImage(it)">删除</button>
                      </div>
                    </template>
                    <button v-else class="mini" @click="$refs['scan-file-' + it.item_id][0].click()" style="background:#1e88e5;color:#fff;">上传图片</button>
                  </div>
                  <!-- 其他类型：录入测量值 -->
                  <template v-else>
                    <input v-model="it.measured_val"
                           :style="numInvalid(it) ? 'border-color:#dd4b4b;background:#fff5f5;' : ''"
                           style="width:120px;" @input="autoJudge(it); onItemInput(it)">
                    <div v-if="numInvalid(it)" style="color:#dd4b4b;font-size:12px;">请填写数字</div>
                  </template>
                </td>
                <td><input v-model="it.measured_text" style="width:120px;" @input="onItemInput(it)"></td>
                <td>
                  <span style="display:inline-flex;align-items:center;gap:5px;cursor:pointer;white-space:nowrap;user-select:none;"
                        @click="cyclePass(it)">
                    <!-- 三态勾选框：勾上=合格，空白=不合格，横线=未判定；状态完全由 Vue 渲染，点击即时刷新 -->
                    <span :style="passBoxStyle(it)">
                      <span v-if="it.is_pass === 1" style="font-size:11px;line-height:1;">✓</span>
                      <span v-else-if="it.is_pass === null || it.is_pass === undefined" style="font-size:11px;line-height:1;">–</span>
                    </span>
                    <span :style="{color: passColor(it), fontWeight: 600, fontSize: '12px'}">{{ passText(it) }}</span>
                  </span>
                  <span v-if="it.judged" class="auto-tag">自动</span>
                </td>
                <td style="color:#909399;font-size:12px;white-space:nowrap;">{{ it.entry_time ? String(it.entry_time).slice(0,19).replace('T',' ') : '-' }}</td>
                <td style="min-width:110px;">
                  <input :ref="'attach-' + it.item_id" type="file" accept="image/*,.tif,.tiff" multiple style="display:none" @change="uploadItemAttach(it, $event)">
                  <button class="mini" style="background:#1e88e5;color:#fff;white-space:nowrap;" @click="$refs['attach-' + it.item_id][0].click()">+ 上传</button>
                  <div v-if="it.attachments && it.attachments.length" style="margin-top:4px;display:flex;align-items:center;gap:3px;overflow:hidden;">
                    <template v-for="(url, idx) in it.attachments.slice(0,3)" :key="idx">
                      <div style="position:relative;">
                        <!-- TIFF 浏览器不能渲染，用文件标签替代缩略图 -->
                        <a v-if="isTifUrl(url)" :href="url" target="_blank" title="点击打开"
                           style="display:block;height:28px;line-height:26px;padding:0 4px;box-sizing:border-box;border:1px solid #e5e7eb;border-radius:3px;font-size:10px;color:#1565c0;background:#f5f9ff;max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">TIF</a>
                        <img v-else :src="url" @click="openPreview(it.attachments, idx)"
                             style="height:28px;width:28px;object-fit:cover;border:1px solid #e5e7eb;border-radius:3px;cursor:pointer;display:block;"
                             title="点击预览">
                        <span @click.stop="removeItemAttach(it, idx)" title="删除"
                              style="position:absolute;top:-5px;right:-5px;width:14px;height:14px;background:#dc2626;color:#fff;border-radius:50%;font-size:10px;line-height:14px;text-align:center;cursor:pointer;display:block;">×</span>
                      </div>
                    </template>
                    <span v-if="it.attachments.length > 3" style="color:#909399;font-size:11px;">+{{ it.attachments.length - 3 }}</span>
                  </div>
                  <span v-else style="color:#c0c4cc;font-size:11px;">无</span>
                </td>
              </tr>
              <tr v-if="!items.length">
                <td colspan="9" style="text-align:center;color:#909399;">请先扫描条码加载检验项目</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top:14px;">
            <button @click="submit" :disabled="!material">提交检验单</button>
          </div>
        </div>
      </div>

      <!-- 到货单开窗查询 -->
      <div v-if="arrivalModalOpen" @click.self="closeArrivalModal"
           style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9998;display:flex;align-items:center;justify-content:center;">
        <div style="background:#fff;border-radius:8px;width:780px;max-width:94vw;max-height:84vh;display:flex;flex-direction:column;box-shadow:0 12px 40px rgba(0,0,0,.25);">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #ebeef5;">
            <span style="font-weight:600;font-size:15px;">选择到货单</span>
            <button @click="closeArrivalModal" style="background:none;border:none;font-size:18px;cursor:pointer;color:#909399;padding:0 4px;">×</button>
          </div>
          <div style="padding:12px 16px;border-bottom:1px solid #ebeef5;">
            <div class="form-row" style="margin-bottom:6px;">
              <label>物料号：</label>
              <input :value="material ? material.material_id : ''" disabled style="width:160px;background:#f5f7fa;color:#606266;">
              <span style="color:#909399;font-size:12px;margin-left:8px;">（固定为当前扫码物料，不可更改）</span>
            </div>
            <div class="form-row">
              <label>到货日期：</label>
              <input type="date" v-model="arrivalQuery.date_start" style="width:140px;">
              <span style="margin:0 4px;">至</span>
              <input type="date" v-model="arrivalQuery.date_end" style="width:140px;">
              <label style="margin-left:12px;">供应商：</label>
              <select v-model="arrivalQuery.supplier_id" style="width:150px;">
                <option value="">全部</option>
                <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.supplier_name }}</option>
              </select>
              <button @click="searchArrival" style="margin-left:10px;">查询</button>
            </div>
          </div>
          <div style="padding:8px 16px;overflow:auto;">
            <table>
              <thead><tr>
                <th>到货日期</th><th>物料号</th><th>供应商</th><th>数量</th><th>录入人</th><th style="width:70px;">操作</th>
              </tr></thead>
              <tbody>
                <tr v-for="r in arrivalList" :key="r.id">
                  <td>{{ String(r.arrival_date).slice(0, 10) }}</td>
                  <td>{{ r.material_id }}</td>
                  <td>{{ r.supplier_name || '-' }}</td>
                  <td style="text-align:right;">{{ Number(r.quantity) }}</td>
                  <td>{{ r.recorder }}</td>
                  <td><button class="mini" :disabled="arrival_order && arrival_order.id === r.id"
                              @click="chooseArrival(r)">{{ arrival_order && arrival_order.id === r.id ? '已选' : '选择' }}</button></td>
                </tr>
                <tr v-if="!arrivalLoading && !arrivalList.length">
                  <td colspan="6" style="text-align:center;color:#909399;">该物料暂无到货单</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style="padding:8px 16px 12px;border-top:1px solid #ebeef5;">
            <vue-pager :page="arrivalPage" :page-size="arrivalPageSize" :total="arrivalTotal"
                       @change="onArrivalPage"></vue-pager>
          </div>
        </div>
      </div>

      <!-- 图片预览弹窗 -->
      <div v-if="previewOpen" @click.self="closePreview"
           style="position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9999;display:flex;align-items:center;justify-content:center;">
        <button @click="closePreview" title="关闭(Esc)"
                style="position:absolute;top:16px;right:16px;width:36px;height:36px;background:rgba(255,255,255,.15);border:none;color:#fff;border-radius:50%;cursor:pointer;font-size:20px;line-height:36px;">×</button>
        <button v-if="previewUrls.length > 1" @click="prevImg" :disabled="previewIndex === 0" title="上一张"
                style="position:absolute;left:24px;top:50%;transform:translateY(-50%);width:44px;height:44px;background:rgba(255,255,255,.15);border:none;color:#fff;border-radius:50%;cursor:pointer;font-size:22px;"
                :disabled="previewIndex === 0">‹</button>
        <img :src="previewUrls[previewIndex]" @click.stop
             style="max-width:88vw;max-height:82vh;object-fit:contain;border-radius:6px;box-shadow:0 10px 40px rgba(0,0,0,.5);" />
        <button v-if="previewUrls.length > 1" @click="nextImg" :disabled="previewIndex >= previewUrls.length - 1" title="下一张"
                style="position:absolute;right:24px;top:50%;transform:translateY(-50%);width:44px;height:44px;background:rgba(255,255,255,.15);border:none;color:#fff;border-radius:50%;cursor:pointer;font-size:22px;">›</button>
        <div v-if="previewUrls.length > 1" style="position:absolute;bottom:20px;color:#fff;font-size:13px;opacity:.9;">
          {{ previewIndex + 1 }} / {{ previewUrls.length }}
        </div>
      </div>
    </div>
  `
});

// ========== 检验记录查询 ==========
Vue.component('page-records', {
  props: ['ws', 'nav'],
  data() {
    return {
      filters: { material_id: '', batch_no: '', inspector: '', rule_code: '', is_complete: '', date_start: '', date_end: '' },
      page: 1,
      pageSize: 10,
      total: 0,
      list: [],
      selectedIds: []
    };
  },
  computed: {
    allChecked: {
      get() { return this.list.length > 0 && this.list.every(r => this.selectedIds.includes(r.id)); },
      set(v) { this.selectedIds = v ? this.list.map(r => r.id) : []; }
    }
  },
  methods: {
    async search() {
      const res = await this.ws.send('queryInspectionList', { ...this.filters, page: this.page, page_size: this.pageSize });
      if (res.success) {
        this.list = res.data.list;
        this.total = res.data.total;
        this.selectedIds = [];
      }
    },
    doSearch() {
      if (this.filters.batch_no) this.filters.batch_no = this.filters.batch_no.trim();
      this.page = 1; this.search();
    },
    onPageChange(p) { this.page = p; this.search(); },
    onPageSizeChange(s) { this.pageSize = s; this.page = 1; this.search(); },
    async batchDelete() {
      if (!this.selectedIds.length) return;
      const ok = confirm(`确认删除选中的 ${this.selectedIds.length} 条检验记录？此操作不可恢复。`);
      if (!ok) return;
      const res = await this.ws.send('deleteInspectionRecords', { ids: this.selectedIds });
      if (res.success) {
        alert(`已删除 ${res.data.deleted} 条记录`);
        await this.search();
      } else {
        alert('删除失败：' + res.message);
      }
    }
  },
  mounted() { this.search(); },
  activated() {
    // keep-alive 重新激活：保留筛选条件，仅按原条件刷新数据（首次激活不重复查询）
    if (this._actOnce) this.search(); else this._actOnce = true;
  },
  template: `
    <div>
      <div class="page-title">检验记录查询</div>
      <div class="panel">
        <div class="form-row">
          <label>料号：</label><input v-model="filters.material_id" placeholder="模糊查询" @keyup.enter="doSearch">
        </div>
        <div class="form-row">
          <label>条码/批次：</label><input v-model="filters.batch_no" placeholder="模糊查询" @keyup.enter="doSearch">
        </div>
        <div class="form-row">
          <label>检验员：</label><input v-model="filters.inspector" placeholder="模糊查询" @keyup.enter="doSearch">
        </div>
        <div class="form-row">
          <label>检验大类：</label><input v-model="filters.rule_code" placeholder="模糊查询" @keyup.enter="doSearch">
        </div>
        <div class="form-row">
          <label>是否完成：</label>
          <select v-model="filters.is_complete">
            <option value="">全部</option>
            <option value="1">已完成</option>
            <option value="0">未完成</option>
          </select>
        </div>
        <div class="form-row">
          <label>检验日期：</label>
          <input type="date" v-model="filters.date_start"> 至
          <input type="date" v-model="filters.date_end">
        </div>
        <button @click="doSearch">查询</button>
        <button v-if="$root.hasFuncPerm('func-inspection-delete') && selectedIds.length > 0" class="danger" @click="batchDelete">批量删除（已选 {{ selectedIds.length }} 条）</button>
      </div>

      <div class="panel" style="margin-top:16px;">
        <table>
          <thead>
            <tr>
              <th style="width:36px;"><input type="checkbox" v-model="allChecked" @click.stop></th>
              <th>料号</th><th>物料名称</th><th>规格</th><th>SN号</th><th>检验日期</th><th>检验员</th><th>检验结果</th><th>处理结果</th><th>是否完成</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td @click.stop><input type="checkbox" v-model="selectedIds" :value="r.id"></td>
              <td>{{ r.material_id }}</td>
              <td>{{ r.material_name }}</td>
              <td>{{ r.material_spec || '-' }}</td>
              <td><a href="javascript:;" @click="nav('page-record-detail', { sn: r.batch_no })" style="color:#1e88e5;text-decoration:none;">{{ r.batch_no }}</a></td>
              <td>{{ r.inspect_date ? r.inspect_date.slice(0,10) : '-' }}</td>
              <td>{{ r.inspector || '-' }}</td>
              <td :style="{fontWeight:600}">{{ r.result == 1 ? '合格' : '不合格' }}（{{ r.pass_count || 0 }}/{{ r.required_qty || 0 }}）</td>
              <td>
                <span :style="{fontWeight:600,padding:'2px 8px',borderRadius:'4px',fontSize:'12px',
                  background: r.process_result === '拒绝' ? '#fff5f5' : '#f0fdf4',
                  color: r.process_result === '拒绝' ? '#dc2626' : '#059669'}">
                  {{ r.process_result || '接收' }}
                </span>
              </td>
              <td :style="{color: r.is_complete == 1 ? '#059669' : '#d97706', fontWeight: 600}">{{ r.is_complete == 1 ? '已完成' : '未完成' }}（{{ r.scanned_qty || 0 }}/{{ r.required_qty || 0 }}）</td>
            </tr>
            <tr v-if="!list.length"><td colspan="10" style="text-align:center;color:#909399;">暂无数据</td></tr>
          </tbody>
        </table>
        <vue-pager :page="page" :page-size="pageSize" :total="total"
                   @change="onPageChange" @size-change="onPageSizeChange"></vue-pager>
        <div style="margin-top:8px;color:#909399;">点击SN号查看明细</div>
      </div>
    </div>
  `
});

// ========== 检验单明细 ==========
Vue.component('page-record-detail', {
  props: ['ws', 'nav', 'params', 'origin'],
  data() {
    return {
      record: null,
      details: [],
      message: '',
      msgType: '',
      msgTarget: 'top',   // top-页面顶部 / panel-明细面板内
      editing: false,
      saving: false,
      // 历史版本弹层
      historyOpen: false,
      historyList: [],
      historyLoading: false,
      historyVersion: null,
      historyLoadingVersion: false,
      // 附件/预览弹窗
      previewOpen: false,
      previewUrls: [],
      previewIndex: 0,
      // 到货单绑定（查看/修改共用）
      arrivalModalOpen: false,
      arrivalLoading: false,
      arrivalQuery: { date_start: '', date_end: '', supplier_id: '' },
      arrivalList: [],
      arrivalTotal: 0,
      arrivalPage: 1,
      arrivalPageSize: 10,
      suppliers: []
    };
  },
  computed: {
    // 已录入项目数：测量值或说明任一非空
    filledCount() {
      return this.details.filter(d => this.isFilled(d)).length;
    }
  },
  methods: {
    isFilled(d) {
      const v = d.measured_val;
      if (v !== null && v !== undefined && String(v).trim() !== '') return true;
      const t = d.measured_text;
      if (t !== null && t !== undefined && String(t).trim() !== '') return true;
      return !!(d.image_url && String(d.image_url).trim() !== '');
    },
    isImageItem(d) { return d.item_type === 'image'; },
    previewImage(url) { if (url) window.open(url, '_blank'); },
    // 浏览器无法直接渲染 TIF/TIFF，单独用文件标签展示
    isTifUrl(url) { return /\.tiff?$/i.test(String(url || '')); },
    // 图片类型项目：上传/更换检验图片
    async uploadImage(d, e) {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      e.target.value = '';
      const fd = new FormData();
      fd.append('file', f);
      try {
        const resp = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await resp.json();
        if (!data.success) { alert(data.message || '上传失败'); return; }
        d.image_url = data.data.url;
        d.entry_time = this.formatTime(new Date());
      } catch (err) {
        alert('上传失败：' + err.message);
      }
    },
    removeImage(d) {
      d.image_url = '';
      if (!this.isFilled(d)) d.entry_time = null;
    },
    // 明细行附件上传（编辑模式）
    async uploadDetailAttach(d, e) {
      const files = Array.from(e.target.files || []);
      e.target.value = '';
      if (!d.attachments) d.attachments = [];
      for (const f of files) {
        // 图片类型校验：MIME 为 image/* 或扩展名为常见图片格式（部分系统 TIF 无 MIME）
        const okExt = /\.(png|jpe?g|gif|bmp|webp|tiff?)$/i.test(f.name);
        if (!/^image\//.test(f.type) && !okExt) { alert('只支持图片文件'); continue; }
        const fd = new FormData(); fd.append('file', f);
        try {
          const resp = await fetch('/api/upload', { method: 'POST', body: fd });
          const d2 = await resp.json();
          if (d2.success) d.attachments.push(d2.data.url);
          else alert(d2.message || '上传失败');
        } catch (err) { alert('上传失败：' + err.message); }
      }
    },
    removeDetailAttach(d, idx) { d.attachments && d.attachments.splice(idx, 1); },
    openPreview(urls, idx) {
      this.previewUrls = urls.slice();
      this.previewIndex = Math.max(0, Math.min(idx, urls.length - 1));
      this.previewOpen = true;
    },
    closePreview() { this.previewOpen = false; },
    prevImg() { if (this.previewIndex > 0) this.previewIndex--; },
    nextImg() { if (this.previewIndex < this.previewUrls.length - 1) this.previewIndex++; },
    // ===== 到货单绑定（开窗查询） =====
    async loadSuppliers() {
      const res = await this.ws.send('querySuppliers', { page: 1, page_size: 500 });
      if (res.success) this.suppliers = res.data.list;
    },
    openArrivalModal() {
      if (!this.record) return;
      this.arrivalQuery = { date_start: '', date_end: '', supplier_id: '' };
      this.arrivalPage = 1;
      this.arrivalModalOpen = true;
      this.loadArrivalList();
    },
    closeArrivalModal() { this.arrivalModalOpen = false; },
    async loadArrivalList() {
      if (!this.record) return;
      this.arrivalLoading = true;
      const res = await this.ws.send('queryArrivalOrders', {
        material_id: this.record.material_id,
        arrival_date_start: this.arrivalQuery.date_start,
        arrival_date_end: this.arrivalQuery.date_end,
        supplier_id: this.arrivalQuery.supplier_id,
        page: this.arrivalPage,
        page_size: this.arrivalPageSize
      });
      this.arrivalLoading = false;
      if (res.success) {
        this.arrivalList = res.data.list;
        this.arrivalTotal = res.data.total;
      } else {
        this.arrivalList = [];
        this.arrivalTotal = 0;
      }
    },
    searchArrival() { this.arrivalPage = 1; this.loadArrivalList(); },
    onArrivalPage(p) { this.arrivalPage = p; this.loadArrivalList(); },
    chooseArrival(row) {
      this.record.arrival_order_id = row.id;
      this.record.arrival_order_date = row.arrival_date;
      this.record.arrival_supplier_name = row.supplier_name;
      this.record.arrival_quantity = row.quantity;
      this.arrivalModalOpen = false;
    },
    clearArrival() {
      this.record.arrival_order_id = null;
      this.record.arrival_order_date = null;
      this.record.arrival_supplier_name = null;
      this.record.arrival_quantity = null;
    },
    isNum(v) {
      return /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(String(v).trim());
    },
    numInvalid(d) {
      if (d.item_type !== 'number') return false;
      const v = d.measured_val;
      if (v === '' || v === null || v === undefined) return false;
      return !this.isNum(v);
    },
    autoJudge(d) {
      if (!d.standard_range) return;
      const v = String(d.measured_val === null || d.measured_val === undefined ? '' : d.measured_val).trim();
      if (!this.isNum(v)) return;
      const parts = String(d.standard_range).split(',');
      if (parts.length !== 2) return;
      const min = Number(parts[0]);
      const max = Number(parts[1]);
      if (isNaN(min) || isNaN(max)) return;
      const num = Number(v);
      d.is_pass = (num >= min && num <= max) ? 1 : 0;
      d.judged = true;
    },
    // 格式化时间为 YYYY-MM-DD HH:mm:ss
    formatTime(d) {
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    },
    // 编辑明细时记录录入时间：首次录入打时间戳，清空则清除
    onItemInput(d) {
      if (this.isFilled(d)) {
        if (!d.entry_time) d.entry_time = this.formatTime(new Date());
      } else {
        d.entry_time = null;
      }
    },
    async load() {
      const res = await this.ws.send('getInspectionDetail', this.params.sn);
      if (res.success) {
        this.record = res.data.record;
        this.details = res.data.details;
      } else {
        this.msgTarget = 'top';
        this.message = res.message;
        this.msgType = 'err';
      }
    },
    startEdit() {
      this.editing = true;
      this.message = '';
      this.msgTarget = 'panel';
    },
    async cancelEdit() {
      this.editing = false;
      this.message = '';
      await this.load(); // 重新加载，丢弃未保存的修改
    },
    async save() {
      this.saving = true;
      const res = await this.ws.send('updateInspectionDetail', {
        batch_no: this.record.batch_no,
        process_result: this.record.process_result,
        arrival_order_id: this.record.arrival_order_id === null || this.record.arrival_order_id === undefined
          ? null : Number(this.record.arrival_order_id),
        items: this.details.map(d => ({
          id: d.id,
          measured_val: d.measured_val === '' || d.measured_val === null || d.measured_val === undefined ? null : d.measured_val,
          measured_text: d.measured_text || null,
          image_url: d.image_url || null,
          is_pass: d.is_pass === null || d.is_pass === undefined ? null : Number(d.is_pass),
          remark: d.remark || null,
          entry_time: d.entry_time || null,
          attachments: (d.attachments || []).slice()
        }))
      });
      this.saving = false;
      this.msgTarget = 'panel';
      if (res.success) {
        this.editing = false;
        await this.load();
        this.msgType = 'ok';
        this.message = `保存成功（${res.data.is_complete == 1 ? '已完成' : '未完成'} ${this.record ? this.record.scanned_qty : ''}/${this.record ? this.record.required_qty : ''}，结论：${res.data.result == 1 ? '合格' : '不合格'}）`;
      } else {
        this.msgType = 'err';
        this.message = res.message;
      }
    },
    back() { this.nav('page-records'); },
    // 打开历史版本弹层
    async openHistory() {
      if (!this.record) return;
      this.historyOpen = true;
      this.historyLoading = true;
      this.historyVersion = null;
      const res = await this.ws.send('queryInspectionHistory', { batch_no: this.record.batch_no });
      this.historyLoading = false;
      this.historyList = res.success ? res.data.list : [];
    },
    async loadHistoryVersion(v) {
      this.historyLoadingVersion = true;
      const res = await this.ws.send('getInspectionHistoryVersion', { record_id: this.record.id, version_no: v });
      this.historyLoadingVersion = false;
      if (res.success) this.historyVersion = res.data;
      else alert(res.message);
    }
  },
  watch: {
    // 其他页面（如条码档案）复用本页签打开不同 SN 时，重新加载数据
    'params.sn'(v) { if (v) this.load(); }
  },
  mounted() { this.loadSuppliers(); this.load(); },
  template: `
    <div>
      <div class="page-title">检验单明细</div>

      <div v-if="message && msgTarget === 'top'" :class="['tip', msgType]">{{ message }}</div>

      <template v-if="record">
        <!-- 单头信息 -->
        <div class="panel">
          <div class="form-row"><label>单据ID：</label>{{ record.id }}</div>
          <div class="form-row"><label>料号：</label>{{ record.material_id }}</div>
          <div class="form-row"><label>物料名称：</label>{{ record.material_name || '-' }}</div>
          <div class="form-row"><label>规格：</label>{{ record.material_spec || '-' }}</div>
          <div class="form-row"><label>SN号/批次：</label>{{ record.batch_no }}</div>
          <div class="form-row"><label>检验大类：</label>{{ record.rule_code || '-' }}</div>
          <div class="form-row"><label>检验日期：</label>{{ record.inspect_date ? record.inspect_date.slice(0,10) : '-' }}</div>
          <div class="form-row"><label>检验员：</label>{{ record.inspector || '-' }}</div>
          <div class="form-row"><label>创建人：</label>{{ record.create_by || '-' }}</div>
          <div class="form-row"><label>结果：</label>{{ record.result == 1 ? '合格' : '不合格' }}</div>
          <div class="form-row"><label>处理结果：</label>
            <span v-if="!editing" :style="{fontWeight:600,padding:'2px 8px',borderRadius:'4px',fontSize:'12px',
              background: record.process_result === '拒绝' ? '#fff5f5' : '#f0fdf4',
              color: record.process_result === '拒绝' ? '#dc2626' : '#059669'}">
              {{ record.process_result || '接收' }}
            </span>
            <select v-else v-model="record.process_result">
              <option value="接收">接收</option>
              <option value="拒绝">拒绝</option>
            </select>
          </div>
          <div class="form-row"><label>到货单：</label>
            <template v-if="record.arrival_order_id">
              <span style="color:#1565c0;">
                {{ record.arrival_order_date ? String(record.arrival_order_date).slice(0, 10) : '-' }} /
                {{ record.arrival_supplier_name || '-' }} / 数量 {{ Number(record.arrival_quantity) }}
              </span>
            </template>
            <span v-else style="color:#909399;">未绑定</span>
            <template v-if="editing">
              <button class="mini" style="margin-left:8px;" @click="openArrivalModal">选择到货单</button>
              <button v-if="record.arrival_order_id" class="mini" style="margin-left:6px;background:#909399;" @click="clearArrival">解除绑定</button>
            </template>
          </div>
          <div class="form-row"><label>三坐标报告：</label>
            <a v-if="record.cmm_report_url" :href="record.cmm_report_url" target="_blank"
               style="color:#1565c0;word-break:break-all;">{{ record.cmm_report_url }}</a>
            <span v-else style="color:#909399;">未上传</span>
          </div>
          <div class="form-row"><label>是否完成：</label><span :style="{color: record.is_complete == 1 ? '#059669' : '#d97706', fontWeight: 600}">{{ record.is_complete == 1 ? '已完成' : '未完成' }}（{{ record.scanned_qty || 0 }}/{{ record.required_qty || 0 }}）</span></div>
          <div class="form-row"><label>创建时间：</label>{{ record.created_time ? String(record.created_time).slice(0,19).replace('T',' ') : '-' }}</div>
        </div>

        <!-- 明细列表 -->
        <div class="panel" style="margin-top:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <h3 style="margin:0;font-size:14px;color:#1565c0;">
              检验明细
              <span style="font-weight:400;color:#909399;font-size:13px;">（已录入 {{ filledCount }} / 应录入 {{ details.length }}）</span>
            </h3>
            <span>
              <button @click="back">返回列表</button>
              <button v-if="!editing" @click="openHistory">历史版本</button>
              <button v-if="$root.hasFuncPerm('func-inspection-edit') && !editing" @click="startEdit">修改</button>
              <template v-else>
                <button @click="save" :disabled="saving">{{ saving ? '保存中…' : '保存' }}</button>
                <button @click="cancelEdit" :disabled="saving" style="margin-left:8px;background:#909399;">取消</button>
              </template>
            </span>
          </div>
          <div v-if="message && msgTarget === 'panel'" :class="['tip', msgType]" style="margin-bottom:8px;">{{ message }}</div>
          <table>
            <thead>
              <tr><th>项目编号</th><th>项目名称</th><th>标准值/区间</th><th>测量值</th><th>说明</th><th>是否合格</th><th>备注</th><th>录入时间</th><th>附件</th></tr>
            </thead>
            <tbody>
              <tr v-for="d in details" :key="d.id">
                <td>{{ d.item_id }}</td>
                <td>{{ d.item_name || '-' }}</td>
                <td style="color:#606266;">
                  <span v-if="d.standard_range">{{ d.standard_range.replace(',', ' ~ ') }}</span>
                  <span v-else-if="d.standard_value">{{ d.standard_value }}</span>
                  <span v-else style="color:#c0c4cc;">-</span>
                </td>
                <td v-if="isImageItem(d)">
                  <!-- 图片项目：查看模式显示缩略图 + 地址；编辑模式支持上传/更换/删除 -->
                  <div v-if="!editing">
                    <template v-if="d.image_url">
                      <img :src="d.image_url" @click="previewImage(d.image_url)"
                        style="width:48px;height:48px;object-fit:cover;border:1px solid #e5e7eb;border-radius:4px;cursor:pointer;vertical-align:middle;"
                        title="点击预览">
                      <a href="javascript:;" @click="previewImage(d.image_url)" style="margin-left:4px;font-size:12px;word-break:break-all;">{{ d.image_url }}</a>
                    </template>
                    <span v-else style="color:#c0c4cc;">-</span>
                  </div>
                  <div v-else>
                    <input :ref="'rec-file-' + d.id" type="file" accept="image/*" style="display:none" @change="uploadImage(d, $event)">
                    <template v-if="d.image_url">
                      <img :src="d.image_url" @click="previewImage(d.image_url)"
                        style="width:48px;height:48px;object-fit:cover;border:1px solid #e5e7eb;border-radius:4px;cursor:pointer;vertical-align:middle;"
                        title="点击预览">
                      <div style="margin-top:4px;">
                        <a href="javascript:;" @click="previewImage(d.image_url)" style="font-size:12px;word-break:break-all;">{{ d.image_url }}</a>
                      </div>
                      <div style="margin-top:4px;">
                        <button class="mini" @click="$refs['rec-file-' + d.id][0].click()">换图</button>
                        <button class="mini" style="margin-left:4px;background:#909399;color:#fff;" @click="removeImage(d)">删除</button>
                      </div>
                    </template>
                    <button v-else class="mini" @click="$refs['rec-file-' + d.id][0].click()" style="background:#1e88e5;color:#fff;">上传图片</button>
                  </div>
                </td>
                <td v-else-if="!editing">{{ d.measured_val ?? '-' }}</td>
                <td v-else>
                  <input v-model="d.measured_val"
                         :style="numInvalid(d) ? 'border-color:#dd4b4b;background:#fff5f5;width:110px;' : 'width:110px;'"
                         @input="autoJudge(d); onItemInput(d)">
                  <div v-if="numInvalid(d)" style="color:#dd4b4b;font-size:12px;">请填写数字</div>
                </td>
                <td v-if="!editing">{{ d.measured_text || '-' }}</td>
                <td v-else><input v-model="d.measured_text" style="width:110px;" @input="onItemInput(d)"></td>
                <td v-if="!editing">{{ d.is_pass == 1 ? '合格' : d.is_pass == 0 ? '不合格' : '未判定' }}</td>
                <td v-else>
                  <select v-model.number="d.is_pass" @change="d.judged = false">
                    <option :value="1">合格</option>
                    <option :value="0">不合格</option>
                    <option :value="null">未判定</option>
                  </select>
                  <span v-if="d.judged" class="auto-tag">自动</span>
                </td>
                <td v-if="!editing">{{ d.remark || '-' }}</td>
                <td v-else><input v-model="d.remark" style="width:110px;"></td>
                <td style="color:#909399;font-size:12px;white-space:nowrap;">{{ d.entry_time ? String(d.entry_time).slice(0,19).replace('T',' ') : '-' }}</td>
                <td style="min-width:110px;">
                  <template v-if="d.attachments && d.attachments.length">
                    <template v-for="(url, idx) in d.attachments.slice(0,3)" :key="idx">
                      <div style="display:inline-block;position:relative;margin-right:2px;">
                        <!-- TIFF 浏览器不能渲染，用文件标签替代缩略图 -->
                        <a v-if="isTifUrl(url)" :href="url" target="_blank" title="点击打开"
                           style="display:block;height:28px;line-height:26px;padding:0 4px;box-sizing:border-box;border:1px solid #e5e7eb;border-radius:3px;font-size:10px;color:#1565c0;background:#f5f9ff;">TIF</a>
                        <img v-else :src="url" @click="openPreview(d.attachments, idx)"
                             style="height:28px;width:28px;object-fit:cover;border:1px solid #e5e7eb;border-radius:3px;cursor:pointer;display:block;"
                             title="点击预览">
                        <span v-if="editing" @click.stop="removeDetailAttach(d, idx)" title="删除"
                              style="position:absolute;top:-5px;right:-5px;width:14px;height:14px;background:#dc2626;color:#fff;border-radius:50%;font-size:10px;line-height:14px;text-align:center;cursor:pointer;display:block;">×</span>
                      </div>
                    </template>
                    <span v-if="d.attachments.length > 3" style="color:#909399;font-size:11px;">+{{ d.attachments.length - 3 }}</span>
                  </template>
                  <template v-else-if="!editing">
                    <span style="color:#c0c4cc;">-</span>
                  </template>
                  <template v-else>
                    <span style="color:#c0c4cc;font-size:11px;">无</span>
                  </template>
                  <template v-if="editing">
                    <input :ref="'rec-attach-' + d.id" type="file" accept="image/*,.tif,.tiff" multiple style="display:none" @change="uploadDetailAttach(d, $event)">
                    <button class="mini" style="background:#1e88e5;color:#fff;margin-top:3px;white-space:nowrap;" @click="$refs['rec-attach-' + d.id][0].click()">+ 上传</button>
                  </template>
                </td>
              </tr>
              <tr v-if="!details.length"><td colspan="9" style="text-align:center;color:#909399;">暂无明细数据</td></tr>
            </tbody>
          </table>
        </div>

      </template>

      <!-- 到货单开窗查询 -->
      <div v-if="arrivalModalOpen" @click.self="closeArrivalModal"
           style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9998;display:flex;align-items:center;justify-content:center;">
        <div style="background:#fff;border-radius:8px;width:780px;max-width:94vw;max-height:84vh;display:flex;flex-direction:column;box-shadow:0 12px 40px rgba(0,0,0,.25);">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #ebeef5;">
            <span style="font-weight:600;font-size:15px;">选择到货单</span>
            <button @click="closeArrivalModal" style="background:none;border:none;font-size:18px;cursor:pointer;color:#909399;padding:0 4px;">×</button>
          </div>
          <div style="padding:12px 16px;border-bottom:1px solid #ebeef5;">
            <div class="form-row" style="margin-bottom:6px;">
              <label>物料号：</label>
              <input :value="record ? record.material_id : ''" disabled style="width:160px;background:#f5f7fa;color:#606266;">
              <span style="color:#909399;font-size:12px;margin-left:8px;">（固定为当前检验单物料，不可更改）</span>
            </div>
            <div class="form-row">
              <label>到货日期：</label>
              <input type="date" v-model="arrivalQuery.date_start" style="width:140px;">
              <span style="margin:0 4px;">至</span>
              <input type="date" v-model="arrivalQuery.date_end" style="width:140px;">
              <label style="margin-left:12px;">供应商：</label>
              <select v-model="arrivalQuery.supplier_id" style="width:150px;">
                <option value="">全部</option>
                <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.supplier_name }}</option>
              </select>
              <button @click="searchArrival" style="margin-left:10px;">查询</button>
            </div>
          </div>
          <div style="padding:8px 16px;overflow:auto;">
            <table>
              <thead><tr>
                <th>到货日期</th><th>物料号</th><th>供应商</th><th>数量</th><th>录入人</th><th style="width:70px;">操作</th>
              </tr></thead>
              <tbody>
                <tr v-for="r in arrivalList" :key="r.id">
                  <td>{{ String(r.arrival_date).slice(0, 10) }}</td>
                  <td>{{ r.material_id }}</td>
                  <td>{{ r.supplier_name || '-' }}</td>
                  <td style="text-align:right;">{{ Number(r.quantity) }}</td>
                  <td>{{ r.recorder }}</td>
                  <td><button class="mini" :disabled="record && record.arrival_order_id === r.id"
                              @click="chooseArrival(r)">{{ record && record.arrival_order_id === r.id ? '已选' : '选择' }}</button></td>
                </tr>
                <tr v-if="!arrivalLoading && !arrivalList.length">
                  <td colspan="6" style="text-align:center;color:#909399;">该物料暂无到货单</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style="padding:8px 16px 12px;border-top:1px solid #ebeef5;">
            <vue-pager :page="arrivalPage" :page-size="arrivalPageSize" :total="arrivalTotal"
                       @change="onArrivalPage"></vue-pager>
          </div>
        </div>
      </div>

      <!-- 历史版本弹层 -->
      <div v-if="historyOpen" :style="{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.4)',zIndex:999}" @click.self="historyOpen = false">
        <div :style="{position:'absolute',top:'5%',left:'10%',right:'10%',bottom:'10%',background:'#fff',borderRadius:'4px',display:'flex',flexDirection:'column'}" @click.stop>
          <div :style="{padding:'12px 16px',borderBottom:'1px solid #e4e7ed',display:'flex',justifyContent:'space-between',alignItems:'center'}">
            <h3 style="margin:0;font-size:15px;">检验单历史版本 — {{ record ? record.batch_no : '' }}</h3>
            <button @click="historyOpen = false" class="mini" style="background:#909399;">关闭</button>
          </div>
          <div :style="{flex:1,display:'flex',overflow:'hidden'}">
            <!-- 左侧：版本列表 -->
            <div :style="{width:'260px',borderRight:'1px solid #e4e7ed',overflowY:'auto',background:'#fafafa'}">
              <div v-if="historyLoading" style="padding:16px;text-align:center;color:#909399;">加载中…</div>
              <div v-else-if="!historyList.length" style="padding:16px;color:#909399;font-size:13px;">暂无修改历史<br><span style="color:#c0c4cc;font-size:12px;">（首次修改后自动产生 v1 版本）</span></div>
              <div v-for="v in historyList" :key="v.version_no"
                   @click="loadHistoryVersion(v.version_no)"
                   :style="{padding:'10px 12px',borderBottom:'1px solid #ebeef5',cursor:'pointer',fontSize:'13px',background:historyVersion && historyVersion.version_no === v.version_no ? '#ecf5ff' : '',borderLeft: historyVersion && historyVersion.version_no === v.version_no ? '3px solid #409eff' : '3px solid transparent'}">
                <div><b>v{{ v.version_no }}</b> <span style="color:#909399;">（{{ v.detail_count }} 条项目）</span></div>
                <div style="color:#606266;margin-top:2px;">变更时间：{{ v.change_time ? String(v.change_time).slice(0,19).replace('T',' ') : '' }}</div>
                <div style="color:#909399;margin-top:2px;">修改人：{{ v.change_by || '-' }}</div>
              </div>
            </div>
            <!-- 右侧：历史明细 -->
            <div :style="{flex:1,overflowY:'auto',padding:'16px'}" v-if="historyVersion">
              <div style="margin-bottom:12px;color:#606266;font-size:13px;">
                版本 <b>v{{ historyVersion.version_no }}</b>（修改前明细） &nbsp; 变更时间 {{ historyVersion.change_time ? String(historyVersion.change_time).slice(0,19).replace('T',' ') : '-' }} &nbsp; 修改人 {{ historyVersion.change_by || '-' }}
              </div>
              <table style="margin-bottom:16px;">
                <thead><tr><th>序号</th><th>项目编号</th><th>项目名称</th><th>测量值</th><th>图片</th><th>说明</th><th>是否合格</th><th>备注</th><th>附件</th></tr></thead>
                <tbody>
                  <tr v-for="(d, i) in historyVersion.details" :key="d.id || i">
                    <td>{{ i + 1 }}</td>
                    <td>{{ d.item_id }}</td>
                    <td>{{ d.item_name || '-' }}</td>
                    <td>{{ d.measured_val ?? '-' }}</td>
                    <td>
                      <template v-if="d.image_url">
                        <img :src="d.image_url" @click="previewImage(d.image_url)"
                          style="width:40px;height:40px;object-fit:cover;border:1px solid #e5e7eb;border-radius:4px;cursor:pointer;vertical-align:middle;"
                          title="点击预览">
                        <a href="javascript:;" @click="previewImage(d.image_url)" style="margin-left:4px;font-size:12px;word-break:break-all;">{{ d.image_url }}</a>
                      </template>
                      <span v-else style="color:#c0c4cc;">-</span>
                    </td>
                    <td>{{ d.measured_text || '-' }}</td>
                    <td>{{ d.is_pass == 1 ? '合格' : d.is_pass == 0 ? '不合格' : '未判定' }}</td>
                    <td>{{ d.remark || '-' }}</td>
                    <td>
                      <template v-if="d.attachments && d.attachments.length">
                        <template v-for="(url, idx) in d.attachments.slice(0,3)" :key="idx">
                          <a v-if="isTifUrl(url)" :href="url" target="_blank" title="点击打开"
                             style="display:inline-block;height:24px;line-height:22px;padding:0 4px;box-sizing:border-box;border:1px solid #e5e7eb;border-radius:3px;font-size:10px;color:#1565c0;background:#f5f9ff;margin-right:2px;">TIF</a>
                          <img v-else :src="url" @click="openPreview(d.attachments, idx)"
                               style="height:24px;width:24px;object-fit:cover;border:1px solid #e5e7eb;border-radius:3px;cursor:pointer;margin-right:2px;"
                               title="点击预览">
                        </template>
                        <span v-if="d.attachments.length > 3" style="color:#909399;font-size:11px;">+{{ d.attachments.length - 3 }}</span>
                      </template>
                      <span v-else style="color:#c0c4cc;">-</span>
                    </td>
                  </tr>
                  <tr v-if="!historyVersion.details.length"><td colspan="9" style="text-align:center;color:#909399;">该版本修改前无明细</td></tr>
                </tbody>
              </table>
            </div>
            <div v-else :style="{flex:1,padding:'24px',color:'#909399',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}">
              <span v-if="historyLoadingVersion">加载明细中…</span>
              <span v-else>请在左侧选择版本查看修改前明细</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 图片预览弹窗 -->
      <div v-if="previewOpen" @click.self="closePreview"
           style="position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:10000;display:flex;align-items:center;justify-content:center;">
        <button @click="closePreview" title="关闭"
                style="position:absolute;top:16px;right:16px;width:36px;height:36px;background:rgba(255,255,255,.15);border:none;color:#fff;border-radius:50%;cursor:pointer;font-size:20px;line-height:36px;">×</button>
        <button v-if="previewUrls.length > 1" @click="prevImg" :disabled="previewIndex === 0" title="上一张"
                style="position:absolute;left:24px;top:50%;transform:translateY(-50%);width:44px;height:44px;background:rgba(255,255,255,.15);border:none;color:#fff;border-radius:50%;cursor:pointer;font-size:22px;">‹</button>
        <a v-if="isTifUrl(previewUrls[previewIndex])" :href="previewUrls[previewIndex]" target="_blank" @click.stop
           style="color:#fff;font-size:15px;text-decoration:underline;">浏览器无法预览 TIF，点击在新窗口打开</a>
        <img v-else :src="previewUrls[previewIndex]" @click.stop
             style="max-width:88vw;max-height:82vh;object-fit:contain;border-radius:6px;box-shadow:0 10px 40px rgba(0,0,0,.5);" />
        <button v-if="previewUrls.length > 1" @click="nextImg" :disabled="previewIndex >= previewUrls.length - 1" title="下一张"
                style="position:absolute;right:24px;top:50%;transform:translateY(-50%);width:44px;height:44px;background:rgba(255,255,255,.15);border:none;color:#fff;border-radius:50%;cursor:pointer;font-size:22px;">›</button>
        <div v-if="previewUrls.length > 1" style="position:absolute;bottom:20px;color:#fff;font-size:13px;opacity:.9;">
          {{ previewIndex + 1 }} / {{ previewUrls.length }}
        </div>
      </div>
    </div>
  `
});

// ========== 装配单明细 ==========
// filters: [{ key, label, placeholder? }]，columns: [{ key, label, type? }]
// type: date-只显示日期部分；active-启用/停用；num-去掉小数尾零

// ========== 通用分页控件 ==========
// props: page/pageSize/total；事件: change(页码)、size-change(每页条数)
Vue.component('vue-pager', {
  props: ['page', 'pageSize', 'total'],
  computed: {
    totalPages() { return Math.max(1, Math.ceil((this.total || 0) / this.pageSize)); }
  },
  methods: {
    go(p) {
      if (p >= 1 && p <= this.totalPages && p !== this.page) this.$emit('change', p);
    },
    changeSize(e) { this.$emit('size-change', Number(e.target.value)); }
  },
  template: `
    <div class="pager">
      <button @click="go(page - 1)" :disabled="page <= 1">上一页</button>
      <span>第 {{ page }} / {{ totalPages }} 页</span>
      <button @click="go(page + 1)" :disabled="page >= totalPages">下一页</button>
      <select :value="pageSize" @change="changeSize">
        <option :value="10">10条/页</option>
        <option :value="20">20条/页</option>
        <option :value="50">50条/页</option>
        <option :value="200">200条/页</option>
      </select>
      <span>共 {{ total }} 条</span>
    </div>
  `
});

Vue.component('page-base-data', {
  props: ['ws', 'nav', 'title', 'action', 'filters', 'columns', 'addPage', 'importAction'],
  data() {
    const query = {};
    this.filters.forEach(f => { query[f.key] = ''; });
    return { query, page: 1, pageSize: 20, total: 0, list: [], importMsg: '', importMsgType: '', importErrors: [] };
  },
  methods: {
    fmt(col, row) {
      const v = row[col.key];
      if (col.type === 'date') return v ? String(v).slice(0, 10) : '-';
      if (col.type === 'active') return v == 1 ? '启用' : '停用';
      if (col.type === 'num') return v === null || v === undefined ? '-' : Number(v);
      return v === null || v === undefined || v === '' ? '-' : v;
    },
    async search() {
      const res = await this.ws.send(this.action, { ...this.query, page: this.page, page_size: this.pageSize });
      if (res.success) {
        this.list = res.data.list;
        this.total = res.data.total;
      }
    },
    doSearch() { this.page = 1; this.search(); },
    onPageChange(p) { this.page = p; this.search(); },
    onPageSizeChange(s) { this.pageSize = s; this.page = 1; this.search(); },
    triggerImport() {
      this.$refs.importFile.value = '';
      this.$refs.importFile.click();
    },
    async onImportFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.importMsg = '';
      this.importErrors = [];
      // 读取文件为 base64（去掉 data:...;base64, 前缀）
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const base64 = String(dataUrl).split(',')[1];
      const res = await this.ws.send(this.importAction, { fileData: base64 });
      if (res.success) {
        this.importMsgType = 'ok';
        this.importMsg = `导入成功，共导入 ${res.data.count} 条数据`;
        this.doSearch();
      } else {
        this.importMsgType = 'err';
        this.importMsg = res.message;
        this.importErrors = res.errors || [];
      }
    }
  },
  mounted() { this.search(); },
  template: `
    <div>
      <div class="page-title">{{ title }}</div>
      <div class="panel">
        <div class="form-row" v-for="f in filters" :key="f.key">
          <label>{{ f.label }}：</label>
          <input v-model="query[f.key]" :placeholder="f.placeholder || '模糊查询'" @keyup.enter="doSearch">
        </div>
        <button @click="doSearch">查询</button>
        <button v-if="addPage" @click="nav(addPage)">新增</button>
        <button v-if="importAction" @click="triggerImport">导入</button>
        <input ref="importFile" type="file" accept=".xlsx,.xls" style="display:none" @change="onImportFile">
        <div v-if="importMsg" :class="['tip', importMsgType]" style="margin-top:12px;">
          <div>{{ importMsg }}</div>
          <div v-for="(e, i) in importErrors" :key="i" style="font-size:13px;">第 {{ e.row }} 行：{{ e.message }}</div>
        </div>
      </div>

      <div class="panel" style="margin-top:16px;">
        <table>
          <thead>
            <tr><th v-for="c in columns" :key="c.key">{{ c.label }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in list" :key="i">
              <td v-for="c in columns" :key="c.key">{{ fmt(c, r) }}</td>
            </tr>
            <tr v-if="!list.length"><td :colspan="columns.length" style="text-align:center;color:#909399;">暂无数据</td></tr>
          </tbody>
        </table>
        <vue-pager :page="page" :page-size="pageSize" :total="total"
                   @change="onPageChange" @size-change="onPageSizeChange"></vue-pager>
      </div>
    </div>
  `
});

// 用配置生成基础资料页面组件
function baseDataPage(cfg) {
  return {
    props: ['ws', 'nav'],
    data() { return { cfg }; },
    template: `<page-base-data :ws="ws" :nav="nav" :title="cfg.title" :action="cfg.action"
                               :filters="cfg.filters" :columns="cfg.columns" :add-page="cfg.addPage"
                               :import-action="cfg.importAction"></page-base-data>`
  };
}

Vue.component('page-inspect-item', {
  props: ['ws', 'nav'],
  data() {
    return {
      query: { item_id: '', item_name: '', item_type: '' },
      page: 1, pageSize: 20, total: 0, list: [],
      editing: false, saving: false, message: '', msgType: '',
      importMsg: '', importMsgType: '', importErrors: []
    };
  },
  methods: {
    async search() {
      const res = await this.ws.send('queryInspectItems', { ...this.query, page: this.page, page_size: this.pageSize });
      if (res.success) { this.list = res.data.list; this.total = res.data.total; }
    },
    doSearch() { this.page = 1; this.editing = false; this.search(); },
    onPageChange(p) { this.page = p; this.editing = false; this.search(); },
    onPageSizeChange(s) { this.pageSize = s; this.page = 1; this.editing = false; this.search(); },
    fmtActive(v) { return v == 1 ? '启用' : '停用'; },
    fmtDate(v) { return v ? String(v).slice(0, 10) : '-'; },
    triggerImport() { this.$refs.importFI.click(); },
    async onImportFile(e) {
      const f = e.target.files[0]; if (!f) return;
      this.importMsg = ''; this.importErrors = [];
      const url = await new Promise((r, rej) => { const rd = new FileReader(); rd.onload = () => r(rd.result); rd.onerror = rej; rd.readAsDataURL(f); });
      const res = await this.ws.send('importInspectItems', { fileData: String(url).split(',')[1] });
      if (res.success) { this.importMsgType = 'ok'; this.importMsg = `导入成功 ${res.data.count} 条`; this.doSearch(); }
      else { this.importMsgType = 'err'; this.importMsg = res.message; this.importErrors = res.errors || []; }
    },
    startEdit() { this.editing = true; this.message = ''; },
    cancelEdit() { this.editing = false; this.message = ''; this.search(); },
    async save() {
      this.saving = true; let ok = 0, fail = 0, msgs = [];
      for (const row of this.list) {
        const res = await this.ws.send('updateInspectItem', {
          item_id: row.item_id,
          item_name: row.item_name,
          item_type: row.item_type || null,
          is_active: Number(row.is_active)
        });
        if (res.success) ok++; else { fail++; msgs.push(`${row.item_id}: ${res.message}`); }
      }
      this.saving = false;
      this.msgType = fail ? 'err' : 'ok';
      this.message = fail ? `保存 ${ok} 条成功，${fail} 条失败（${msgs.join('；')}）` : `保存成功 ${ok} 条`;
      if (!fail) { this.editing = false; this.search(); }
    }
  },
  mounted() { this.search(); },
  activated() {
    // keep-alive 重新激活：保留筛选条件，仅按原条件刷新数据（首次激活不重复查询）
    if (this._actOnce) this.search(); else this._actOnce = true;
  },
  template: `
    <div>
      <div class="page-title">检验项目</div>
      <div class="panel">
        <div class="form-row">
          <label>项目编号：</label><input v-model="query.item_id" @keyup.enter="doSearch" placeholder="模糊">
          <label style="margin-left:12px;">项目名称：</label><input v-model="query.item_name" @keyup.enter="doSearch" placeholder="模糊">
          <label style="margin-left:12px;">录入类型：</label>
          <select v-model="query.item_type" @change="doSearch">
            <option value="">全部</option><option value="number">数值</option><option value="text">文本</option><option value="image">图片</option>
          </select>
        </div>
        <button @click="doSearch">查询</button>
        <button v-if="$root.hasFuncPerm('func-inspect-item-add')" @click="nav('page-item-add')">新增</button>
        <button v-if="$root.hasFuncPerm('func-inspect-item-import')" @click="triggerImport">导入</button>
        <button v-if="$root.hasFuncPerm('func-inspect-item-edit') && !editing" @click="startEdit" style="margin-left:8px;">修改</button>
        <template v-else>
          <button @click="save" :disabled="saving" style="margin-left:8px;">{{ saving ? '保存中…' : '保存' }}</button>
          <button @click="cancelEdit" :disabled="saving" style="background:#909399;">取消</button>
        </template>
        <input ref="importFI" type="file" accept=".xlsx,.xls" style="display:none" @change="onImportFile">
        <div v-if="message" :class="['tip', msgType]" style="margin-top:12px;">{{ message }}</div>
        <div v-if="importMsg" :class="['tip', importMsgType]" style="margin-top:8px;">
          <div>{{ importMsg }}</div>
          <div v-for="(e,i) in importErrors" :key="i" style="font-size:13px;">第 {{ e.row }} 行：{{ e.message }}</div>
        </div>
      </div>
      <div class="panel" style="margin-top:16px;">
        <table>
          <thead><tr>
            <th>项目编号</th><th>项目名称</th><th>录入类型</th><th>状态</th><th>创建人</th><th>创建时间</th>
          </tr></thead>
          <tbody>
            <tr v-for="r in list" :key="r.item_id">
              <td>{{ r.item_id }}</td>
              <td v-if="!editing">{{ r.item_name }}</td>
              <td v-else><input v-model="r.item_name" style="width:120px;"></td>
              <td v-if="!editing">{{ r.item_type || '-' }}</td>
              <td v-else>
                <select v-model="r.item_type">
                  <option value="">未设置</option><option value="text">文本</option><option value="number">数值</option><option value="image">图片</option>
                </select>
              </td>
              <td v-if="!editing">{{ fmtActive(r.is_active) }}</td>
              <td v-else>
                <select v-model.number="r.is_active">
                  <option :value="1">启用</option><option :value="0">停用</option>
                </select>
              </td>
              <td>{{ r.create_by || '-' }}</td>
              <td>{{ fmtDate(r.created_time) }}</td>
            </tr>
            <tr v-if="!list.length"><td colspan="6" style="text-align:center;color:#909399;">暂无数据</td></tr>
          </tbody>
        </table>
        <vue-pager :page="page" :page-size="pageSize" :total="total"
                   @change="onPageChange" @size-change="onPageSizeChange"></vue-pager>
      </div>
    </div>
  `
});

// ========== 新增检验项目 ==========
Vue.component('page-item-add', {
  props: ['ws', 'nav'],
  data() {
    return {
      form: { item_id: '', item_name: '', item_type: 'text', is_active: 1 },
      message: '',
      msgType: ''
    };
  },
  methods: {
    async submit() {
      this.message = '';
      const f = this.form;
      if (!f.item_id.trim() || !f.item_name.trim()) {
        this.msgType = 'err';
        this.message = '项目编号、项目名称为必填项';
        return;
      }
      const res = await this.ws.send('createInspectItem', {
        item_id: f.item_id.trim(),
        item_name: f.item_name.trim(),
        item_type: f.item_type,
        is_active: Number(f.is_active)
      });
      if (!res.success) {
        this.msgType = 'err';
        this.message = res.message;
        return;
      }
      this.msgType = 'ok';
      this.message = `检验项目已新增：${f.item_id}`;
      setTimeout(() => this.nav('page-inspect-item'), 1200);
    },
    back() { this.nav('page-inspect-item'); }
  },
  template: `
    <div>
      <div class="page-title">新增检验项目</div>
      <div class="panel">
        <div class="form-row">
          <label>项目编号：</label>
          <input v-model="form.item_id" placeholder="必填，如 IT03">
        </div>
        <div class="form-row">
          <label>项目名称：</label>
          <input v-model="form.item_name" placeholder="必填">
        </div>
        <div class="form-row">
          <label>录入类型：</label>
          <select v-model="form.item_type">
            <option value="text">文本</option>
            <option value="number">数值</option>
            <option value="image">图片</option>
          </select>
        </div>
        <div class="form-row">
          <label>状态：</label>
          <select v-model.number="form.is_active">
            <option :value="1">启用</option>
            <option :value="0">停用</option>
          </select>
        </div>
        <div v-if="message" :class="['tip', msgType]">{{ message }}</div>
        <div style="margin-top:8px;">
          <button @click="submit">保存</button>
          <button @click="back">返回</button>
        </div>
      </div>
    </div>
  `
});

Vue.component('page-material', {
  props: ['ws', 'nav'],
  data() {
    return {
      query: { material_id: '', material_name: '', material_spec: '', inspect_category: '' },
      page: 1, pageSize: 20, total: 0, list: [],
      editing: false, saving: false, message: '', msgType: '',
      ruleOptions: [], openRow: -1,
      // 检验大类多选筛选
      selectedCats: [], catOpen: false,
      importMsg: '', importMsgType: '', importErrors: []
    };
  },
  methods: {
    async loadRuleOptions() {
      const res = await this.ws.send('getRuleCodes');
      if (res.success) this.ruleOptions = res.data;
    },
    async search() {
      const res = await this.ws.send('queryMaterials', {
        ...this.query,
        inspect_categories: this.selectedCats.slice(),
        page: this.page, page_size: this.pageSize
      });
      if (res.success) {
        this.list = res.data.list;
        this.total = res.data.total;
        // 每行加一个编辑态用的数组（从逗号串解析）
        this.list.forEach(r => { r.inspectArr = (r.inspect_category || '').split(',').filter(Boolean); });
      }
    },
    toggleCat(code) {
      const idx = this.selectedCats.indexOf(code);
      if (idx === -1) this.selectedCats.push(code);
      else this.selectedCats.splice(idx, 1);
    },
    removeCat(code) {
      const idx = this.selectedCats.indexOf(code);
      if (idx !== -1) this.selectedCats.splice(idx, 1);
    },
    catLabel(code) {
      const o = this.ruleOptions.find(x => x.rule_code === code);
      return o ? `${code}(${o.rule_name})` : code;
    },
    doSearch() { this.page = 1; this.editing = false; this.search(); },
    onPageChange(p) { this.page = p; this.editing = false; this.search(); },
    onPageSizeChange(s) { this.pageSize = s; this.page = 1; this.editing = false; this.search(); },
    fmtActive(v) { return v == 1 ? '启用' : '停用'; },
    fmtDate(v) { return v ? String(v).slice(0, 10) : '-'; },
    triggerImport() { this.$refs.importFM.click(); },
    async onImportFile(e) {
      const f = e.target.files[0]; if (!f) return;
      this.importMsg = ''; this.importErrors = [];
      const url = await new Promise((r, rej) => { const rd = new FileReader(); rd.onload = () => r(rd.result); rd.onerror = rej; rd.readAsDataURL(f); });
      const res = await this.ws.send('importMaterials', { fileData: String(url).split(',')[1] });
      if (res.success) { this.importMsgType = 'ok'; this.importMsg = `导入成功 ${res.data.count} 条`; this.doSearch(); }
      else { this.importMsgType = 'err'; this.importMsg = res.message; this.importErrors = res.errors || []; }
    },
    startEdit() { this.editing = true; this.message = ''; this.loadRuleOptions(); },
    cancelEdit() { this.editing = false; this.openRow = -1; this.message = ''; this.search(); },
    toggleRowRule(row, code) {
      const idx = row.inspectArr.indexOf(code);
      if (idx === -1) row.inspectArr.push(code);
      else row.inspectArr.splice(idx, 1);
    },
    removeRowRule(row, code, ev) {
      if (ev) ev.stopPropagation();
      const idx = row.inspectArr.indexOf(code);
      if (idx !== -1) row.inspectArr.splice(idx, 1);
    },
    toggleRowOpen(i) { this.openRow = (this.openRow === i) ? -1 : i; },
    async save() {
      this.saving = true; let ok = 0, fail = 0, msgs = [];
      for (const row of this.list) {
        const res = await this.ws.send('updateMaterial', {
          material_id: row.material_id,
          material_name: row.material_name,
          material_spec: row.material_spec || null,
          inspect_category: row.inspectArr && row.inspectArr.length ? row.inspectArr.join(',') : null,
          is_active: Number(row.is_active)
        });
        if (res.success) ok++; else { fail++; msgs.push(`${row.material_id}: ${res.message}`); }
      }
      this.saving = false;
      this.msgType = fail ? 'err' : 'ok';
      this.message = fail ? `保存 ${ok} 条成功，${fail} 条失败（${msgs.join('；')}）` : `保存成功 ${ok} 条`;
      if (!fail) { this.editing = false; this.search(); }
    }
  },
  mounted() {
    this.search();
    this.loadRuleOptions();
    this.docClick = (e) => {
      if (this.openRow >= 0 && !e.target.closest('.rule-picker-wrap')) this.openRow = -1;
      if (this.catOpen && !e.target.closest('.cat-picker-wrap')) this.catOpen = false;
    };
    document.addEventListener('click', this.docClick);
  },
  beforeDestroy() { document.removeEventListener('click', this.docClick); },
  activated() {
    // keep-alive 重新激活：保留筛选条件，仅按原条件刷新数据（首次激活不重复查询）
    if (this._actOnce) this.search(); else this._actOnce = true;
  },
  template: `
    <div>
      <div class="page-title">物料数据</div>
      <div class="panel">
        <div class="form-row">
          <label>料号：</label><input v-model="query.material_id" @keyup.enter="doSearch" placeholder="模糊">
          <label style="margin-left:12px;">物料名称：</label><input v-model="query.material_name" @keyup.enter="doSearch" placeholder="模糊">
          <label style="margin-left:12px;">规格：</label><input v-model="query.material_spec" @keyup.enter="doSearch" placeholder="模糊">
          <label style="margin-left:12px;">检验规则：</label>
          <div class="cat-picker-wrap" style="position:relative;display:inline-block;min-width:240px;vertical-align:middle;">
            <div @click.stop="catOpen = !catOpen"
                 style="border:1px solid #dcdfe6;border-radius:4px;min-height:32px;padding:2px 6px;background:#fff;cursor:pointer;display:flex;flex-wrap:wrap;gap:4px;align-items:center;">
              <span v-if="!selectedCats.length" style="color:#c0c4cc;">全部（可多选）</span>
              <span v-for="c in selectedCats" :key="c"
                    style="background:#ecf5ff;color:#409eff;border:1px solid #d9ecff;border-radius:3px;padding:0 4px;font-size:12px;line-height:20px;">
                {{ catLabel(c) }}<i style="cursor:pointer;margin-left:4px;" @click.stop="removeCat(c)">×</i>
              </span>
            </div>
            <div v-if="catOpen"
                 style="position:absolute;z-index:20;top:100%;left:0;margin-top:4px;background:#fff;border:1px solid #e4e7ed;border-radius:4px;box-shadow:0 2px 12px rgba(0,0,0,.12);max-height:260px;overflow:auto;min-width:100%;">
              <div v-for="o in ruleOptions" :key="o.rule_code"
                   @click.stop="toggleCat(o.rule_code)"
                   style="padding:6px 10px;cursor:pointer;white-space:nowrap;"
                   :style="{ background: selectedCats.includes(o.rule_code) ? '#ecf5ff' : '#fff' }">
                <span style="display:inline-block;width:14px;color:#409eff;">{{ selectedCats.includes(o.rule_code) ? '✓' : '' }}</span>
                {{ o.rule_code }} - {{ o.rule_name }}
              </div>
              <div v-if="!ruleOptions.length" style="padding:8px 10px;color:#909399;">暂无检验规则</div>
            </div>
          </div>
        </div>
        <button @click="doSearch">查询</button>
        <button v-if="$root.hasFuncPerm('func-material-add')" @click="nav('page-material-add')">新增</button>
        <button v-if="$root.hasFuncPerm('func-material-import')" @click="triggerImport">导入</button>
        <button v-if="$root.hasFuncPerm('func-material-edit') && !editing" @click="startEdit" style="margin-left:8px;">修改</button>
        <template v-else>
          <button @click="save" :disabled="saving" style="margin-left:8px;">{{ saving ? '保存中…' : '保存' }}</button>
          <button @click="cancelEdit" :disabled="saving" style="background:#909399;">取消</button>
        </template>
        <input ref="importFM" type="file" accept=".xlsx,.xls" style="display:none" @change="onImportFile">
        <div v-if="message" :class="['tip', msgType]" style="margin-top:12px;">{{ message }}</div>
        <div v-if="importMsg" :class="['tip', importMsgType]" style="margin-top:8px;">
          <div>{{ importMsg }}</div>
          <div v-for="(e,i) in importErrors" :key="i" style="font-size:13px;">第 {{ e.row }} 行：{{ e.message }}</div>
        </div>
      </div>
      <div class="panel" style="margin-top:16px;">
        <table>
          <thead><tr>
            <th>料号</th><th>物料名称</th><th>规格</th><th>检验规则</th><th>状态</th><th>创建人</th><th>创建时间</th>
          </tr></thead>
          <tbody>
            <tr v-for="(r, i) in list" :key="r.material_id">
              <td>{{ r.material_id }}</td>
              <td v-if="!editing">{{ r.material_name }}</td>
              <td v-else><input v-model="r.material_name" style="width:130px;"></td>
              <td v-if="!editing">{{ r.material_spec || '-' }}</td>
              <td v-else><input v-model="r.material_spec" style="width:110px;" placeholder="规格"></td>
              <td v-if="!editing">{{ r.inspect_category || '-' }}</td>
              <td v-else class="rule-picker-wrap" style="position:relative;">
                <div @click.stop="toggleRowOpen(i)" :style="{minWidth:'180px',cursor:'pointer',border:'1px solid #dcdfe6',borderRadius:'4px',padding:'4px 8px',minHeight:'26px',background:'#fff',display:'flex',flexWrap:'wrap',gap:'4px'}">
                  <template v-if="r.inspectArr && r.inspectArr.length">
                    <span v-for="code in r.inspectArr" :key="code"
                          :style="{background:'#ecf5ff',color:'#409eff',borderRadius:'3px',padding:'1px 6px',fontSize:'12px',display:'inline-flex',alignItems:'center',gap:'4px'}">
                      {{ ruleOptions.find(o => o.rule_code === code)?.rule_name || code }}
                      <span style="cursor:pointer;color:#909399;font-size:13px;" @click.stop="removeRowRule(r, code, $event)">×</span>
                    </span>
                  </template>
                  <span v-else style="color:#c0c4cc;font-size:13px;">点击选择检验规则</span>
                </div>
                <div v-if="openRow === i" @click.stop
                     :style="{position:'absolute',top:'100%',left:0,right:0,marginTop:'4px',background:'#fff',border:'1px solid #dcdfe6',borderRadius:'4px',boxShadow:'0 2px 8px rgba(0,0,0,.12)',zIndex:200,maxHeight:'240px',overflowY:'auto'}">
                  <div v-if="!ruleOptions.length" style="padding:8px;color:#909399;font-size:13px;text-align:center;">暂无检验规则，请先创建</div>
                  <div v-for="opt in ruleOptions" :key="opt.rule_code"
                       @click.stop="toggleRowRule(r, opt.rule_code)"
                       :style="{padding:'6px 10px',cursor:'pointer',fontSize:'13px',display:'flex',alignItems:'center',gap:'6px',background: r.inspectArr.includes(opt.rule_code) ? '#ecf5ff' : 'transparent'}"
                       @mouseenter="($event.target.style.background = r.inspectArr.includes(opt.rule_code) ? '#ecf5ff' : '#f5f7fa')"
                       @mouseleave="($event.target.style.background = r.inspectArr.includes(opt.rule_code) ? '#ecf5ff' : 'transparent')">
                    <input type="checkbox" :checked="r.inspectArr.includes(opt.rule_code)" style="pointer-events:none;">
                    <span>{{ opt.rule_code }}</span>
                    <span style="color:#909399;margin-left:4px;">{{ opt.rule_name || '' }}</span>
                  </div>
                </div>
              </td>
              <td v-if="!editing">{{ fmtActive(r.is_active) }}</td>
              <td v-else>
                <select v-model.number="r.is_active">
                  <option :value="1">启用</option><option :value="0">停用</option>
                </select>
              </td>
              <td>{{ r.create_by || '-' }}</td>
              <td>{{ fmtDate(r.created_time) }}</td>
            </tr>
            <tr v-if="!list.length"><td colspan="7" style="text-align:center;color:#909399;">暂无数据</td></tr>
          </tbody>
        </table>
        <vue-pager :page="page" :page-size="pageSize" :total="total"
                   @change="onPageChange" @size-change="onPageSizeChange"></vue-pager>
      </div>
    </div>
  `
});

// ========== 新增物料 ==========
Vue.component('page-material-add', {
  props: ['ws', 'nav'],
  data() {
    return {
      form: { material_id: '', material_name: '', material_spec: '', inspect_category: [], is_active: 1 },
      ruleCodes: [],
      ruleOpen: false,
      message: '',
      msgType: ''
    };
  },
  methods: {
    async loadRuleCodes() {
      const res = await this.ws.send('getRuleCodes');
      if (res.success) this.ruleCodes = res.data;
    },
    async submit() {
      this.message = '';
      const f = this.form;
      if (!f.material_id.trim() || !f.material_name.trim()) {
        this.msgType = 'err';
        this.message = '料号、物料名称为必填项';
        return;
      }
      const res = await this.ws.send('createMaterial', {
        material_id: f.material_id.trim(),
        material_name: f.material_name.trim(),
        material_spec: f.material_spec.trim() || null,
        inspect_category: f.inspect_category.length ? f.inspect_category : null,
        is_active: Number(f.is_active)
      });
      if (!res.success) {
        this.msgType = 'err';
        this.message = res.message;
        return;
      }
      this.msgType = 'ok';
      this.message = `物料已新增：${f.material_id}`;
      setTimeout(() => this.nav('page-material'), 1200);
    },
    toggleRule(code) {
      const idx = this.form.inspect_category.indexOf(code);
      if (idx === -1) this.form.inspect_category.push(code);
      else this.form.inspect_category.splice(idx, 1);
    },
    removeRule(code) {
      const idx = this.form.inspect_category.indexOf(code);
      if (idx !== -1) this.form.inspect_category.splice(idx, 1);
    },
    back() { this.nav('page-material'); }
  },
  mounted() {
    this.loadRuleCodes();
    // 点击组件外部收起下拉面板
    this.docClick = (e) => { if (this.$el && !this.$el.contains(e.target)) this.ruleOpen = false; };
    document.addEventListener('click', this.docClick);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.docClick);
  },
  template: `
    <div>
      <div class="page-title">新增物料</div>
      <div class="panel">
        <div class="form-row">
          <label>料号：</label>
          <input v-model="form.material_id" placeholder="必填，如 LENS-003">
        </div>
        <div class="form-row">
          <label>物料名称：</label>
          <input v-model="form.material_name" placeholder="必填">
        </div>
        <div class="form-row">
          <label>规格：</label>
          <input v-model="form.material_spec" placeholder="选填">
        </div>
        <div class="form-row" style="align-items:flex-start;">
          <label style="padding-top:9px;">检验规则：</label>
          <div class="ms-wrap">
            <div class="ms-input" @click="ruleOpen = !ruleOpen">
              <span v-if="!form.inspect_category.length" class="ms-ph">请选择检验规则（可多选）</span>
              <span v-for="c in form.inspect_category" :key="c" class="ms-tag">
                {{ c }}<i class="ms-tag-x" @click.stop="removeRule(c)">&times;</i>
              </span>
              <span class="ms-arrow" :class="{ open: ruleOpen }">&#9662;</span>
            </div>
            <div v-show="ruleOpen" class="ms-panel">
              <div v-for="r in ruleCodes" :key="r.rule_code"
                   class="ms-item" :class="{ active: form.inspect_category.includes(r.rule_code) }"
                   @click="toggleRule(r.rule_code)">
                <span class="ms-code">{{ r.rule_code }}</span>
                <span class="ms-name">{{ r.rule_desc || '—' }}</span>
                <span class="ms-check">&#10003;</span>
              </div>
              <div v-if="!ruleCodes.length" class="ms-empty">暂无可选检验规则</div>
            </div>
          </div>
        </div>
        <div class="form-row">
          <label>状态：</label>
          <select v-model.number="form.is_active">
            <option :value="1">启用</option>
            <option :value="0">停用</option>
          </select>
        </div>
        <div v-if="message" :class="['tip', msgType]">{{ message }}</div>
        <div style="margin-top:8px;">
          <button @click="submit">保存</button>
          <button @click="back">返回</button>
        </div>
      </div>
    </div>
  `
});

// ========== 供应商管理 ==========
Vue.component('page-supplier', {
  props: ['ws', 'nav'],
  data() {
    return {
      query: { supplier_name: '' },
      page: 1, pageSize: 20, total: 0, list: [],
      editing: false, saving: false, message: '', msgType: '',
      adding: false, addSaving: false,
      addForm: { supplier_name: '' },
      addMsg: '', addMsgType: ''
    };
  },
  methods: {
    async search() {
      const res = await this.ws.send('querySuppliers', {
        ...this.query,
        page: this.page, page_size: this.pageSize
      });
      if (res.success) {
        this.list = res.data.list;
        this.total = res.data.total;
      } else {
        this.msgType = 'err';
        this.message = res.message;
      }
    },
    doSearch() { this.page = 1; this.editing = false; this.message = ''; this.search(); },
    onPageChange(p) { this.page = p; this.editing = false; this.search(); },
    onPageSizeChange(s) { this.pageSize = s; this.page = 1; this.editing = false; this.search(); },
    fmtDateTime(v) { return v ? String(v).slice(0, 19).replace('T', ' ') : '-'; },
    startAdd() { this.adding = true; this.addMsg = ''; this.addForm = { supplier_name: '' }; },
    cancelAdd() { this.adding = false; this.addMsg = ''; },
    async saveAdd() {
      const name = String(this.addForm.supplier_name || '').trim();
      if (!name) { this.addMsgType = 'err'; this.addMsg = '请输入供应商名称'; return; }
      this.addSaving = true;
      const res = await this.ws.send('createSupplier', { supplier_name: name });
      this.addSaving = false;
      if (!res.success) { this.addMsgType = 'err'; this.addMsg = res.message; return; }
      this.adding = false;
      this.msgType = 'ok';
      this.message = `供应商已新增（ID ${res.data.id}）`;
      this.doSearch();
    },
    startEdit() { this.editing = true; this.message = ''; },
    cancelEdit() { this.editing = false; this.message = ''; this.search(); },
    async save() {
      for (const r of this.list) {
        if (!String(r.supplier_name || '').trim()) {
          this.msgType = 'err'; this.message = `ID ${r.id} 的供应商名称不能为空`; return;
        }
      }
      this.saving = true; let ok = 0, fail = 0; const msgs = [];
      for (const r of this.list) {
        const res = await this.ws.send('updateSupplier', {
          id: r.id,
          supplier_name: String(r.supplier_name).trim()
        });
        if (res.success) ok++; else { fail++; msgs.push(`ID ${r.id}: ${res.message}`); }
      }
      this.saving = false;
      this.msgType = fail ? 'err' : 'ok';
      this.message = fail ? `保存 ${ok} 条成功，${fail} 条失败（${msgs.join('；')}）` : `保存成功 ${ok} 条`;
      if (!fail) { this.editing = false; this.search(); }
    }
  },
  mounted() { this.search(); },
  template: `
    <div>
      <div class="page-title">供应商管理</div>
      <div class="panel">
        <div class="form-row">
          <label>供应商名称：</label>
          <input v-model="query.supplier_name" @keyup.enter="doSearch" placeholder="模糊" style="width:220px;">
        </div>
        <button @click="doSearch">查询</button>
        <button v-if="$root.hasFuncPerm('func-supplier-add') && !adding" @click="startAdd" style="margin-left:8px;">新增</button>
        <button v-if="$root.hasFuncPerm('func-supplier-edit') && !editing" @click="startEdit" style="margin-left:8px;">修改</button>
        <template v-if="editing">
          <button @click="save" :disabled="saving" style="margin-left:8px;">{{ saving ? '保存中…' : '保存' }}</button>
          <button @click="cancelEdit" :disabled="saving" style="background:#909399;">取消</button>
        </template>
        <div v-if="message" :class="['tip', msgType]" style="margin-top:12px;">{{ message }}</div>
      </div>

      <div v-if="adding" class="panel" style="margin-top:16px;">
        <div style="font-weight:600;margin-bottom:10px;">新增供应商</div>
        <div class="form-row">
          <label>供应商名称：</label>
          <input v-model="addForm.supplier_name" placeholder="必填" style="width:260px;" @keyup.enter="saveAdd">
          <span style="color:#909399;font-size:12px;margin-left:10px;">ID 由系统自动按流水生成</span>
        </div>
        <button @click="saveAdd" :disabled="addSaving">{{ addSaving ? '保存中…' : '保存' }}</button>
        <button @click="cancelAdd" :disabled="addSaving" style="background:#909399;margin-left:8px;">取消</button>
        <div v-if="addMsg" :class="['tip', addMsgType]" style="margin-top:12px;">{{ addMsg }}</div>
      </div>

      <div class="panel" style="margin-top:16px;">
        <table>
          <thead><tr>
            <th>供应商ID</th><th>供应商名称</th><th>创建人</th><th>创建时间</th><th>修改人</th><th>修改时间</th>
          </tr></thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td>{{ r.id }}</td>
              <td v-if="!editing">{{ r.supplier_name }}</td>
              <td v-else><input v-model="r.supplier_name" style="width:220px;"></td>
              <td>{{ r.create_by || '-' }}</td>
              <td>{{ fmtDateTime(r.created_time) }}</td>
              <td>{{ r.update_by || '-' }}</td>
              <td>{{ fmtDateTime(r.update_time) }}</td>
            </tr>
            <tr v-if="!list.length"><td colspan="6" style="text-align:center;color:#909399;">暂无数据</td></tr>
          </tbody>
        </table>
        <vue-pager :page="page" :page-size="pageSize" :total="total"
                   @change="onPageChange" @size-change="onPageSizeChange"></vue-pager>
      </div>
    </div>
  `
});

// ========== 到货单 ==========
Vue.component('page-arrival-order', {
  props: ['ws', 'nav'],
  data() {
    return {
      query: { arrival_date_start: '', arrival_date_end: '', material_id: '', recorder: '' },
      page: 1, pageSize: 20, total: 0, list: [],
      editing: false, saving: false, message: '', msgType: '',
      adding: false, addSaving: false,
      suppliers: [],
      addForm: { arrival_date: '', material_id: '', supplier_id: '', quantity: '', recorder: '' },
      addMsg: '', addMsgType: '',
      selectedIds: []
    };
  },
  computed: {
    allChecked: {
      get() { return this.list.length > 0 && this.list.every(r => this.selectedIds.includes(r.id)); },
      set(v) { this.selectedIds = v ? this.list.map(r => r.id) : []; }
    }
  },
  methods: {
    // 供应商下拉数据（新增/修改绑定用）
    async loadSuppliers() {
      const res = await this.ws.send('querySuppliers', { page: 1, page_size: 500 });
      if (res.success) this.suppliers = res.data.list;
    },
    async search() {
      const res = await this.ws.send('queryArrivalOrders', {
        ...this.query,
        page: this.page, page_size: this.pageSize
      });
      if (res.success) {
        this.list = res.data.list;
        this.total = res.data.total;
        this.selectedIds = [];
        // 日期输入框需要 YYYY-MM-DD 格式
        this.list.forEach(r => { r.arrival_date = r.arrival_date ? String(r.arrival_date).slice(0, 10) : ''; });
      } else {
        this.msgType = 'err';
        this.message = res.message;
      }
    },
    doSearch() { this.page = 1; this.editing = false; this.message = ''; this.search(); },
    onPageChange(p) { this.page = p; this.editing = false; this.search(); },
    onPageSizeChange(s) { this.pageSize = s; this.page = 1; this.editing = false; this.search(); },
    fmtDate(v) { return v ? String(v).slice(0, 10) : '-'; },
    fmtDateTime(v) { return v ? String(v).slice(0, 19).replace('T', ' ') : '-'; },
    // 数量去掉多余的 0（DECIMAL 返回 120.500 之类的字符串）
    fmtQty(v) {
      if (v === null || v === undefined || v === '') return '-';
      const n = Number(v);
      return Number.isFinite(n) ? String(n) : String(v);
    },
    startAdd() {
      this.adding = true;
      this.addMsg = '';
      const u = this.$root.currentUser || {};
      const d = new Date();
      const today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      this.addForm = {
        arrival_date: today,
        material_id: '',
        supplier_id: '',
        quantity: '',
        recorder: u.realname || u.username || ''
      };
    },
    cancelAdd() { this.adding = false; this.addMsg = ''; },
    async saveAdd() {
      const f = this.addForm;
      if (!f.arrival_date) { this.addMsgType = 'err'; this.addMsg = '请选择到货日期'; return; }
      if (!f.material_id.trim()) { this.addMsgType = 'err'; this.addMsg = '请输入物料号'; return; }
      if (!f.supplier_id) { this.addMsgType = 'err'; this.addMsg = '请选择供应商'; return; }
      if (!Number(f.quantity) || Number(f.quantity) <= 0) { this.addMsgType = 'err'; this.addMsg = '数量必须为大于 0 的数字'; return; }
      if (!f.recorder.trim()) { this.addMsgType = 'err'; this.addMsg = '请输入录入人'; return; }
      this.addSaving = true;
      const res = await this.ws.send('createArrivalOrder', {
        arrival_date: f.arrival_date,
        material_id: f.material_id.trim(),
        supplier_id: Number(f.supplier_id),
        quantity: Number(f.quantity),
        recorder: f.recorder.trim()
      });
      this.addSaving = false;
      if (!res.success) { this.addMsgType = 'err'; this.addMsg = res.message; return; }
      this.adding = false;
      this.msgType = 'ok';
      this.message = `到货单已新增（${f.material_id.trim()}）`;
      this.doSearch();
    },
    startEdit() { this.editing = true; this.message = ''; },
    async batchDelete() {
      if (!this.selectedIds.length) return;
      const ok = confirm(`确认删除选中的 ${this.selectedIds.length} 条到货单？此操作不可恢复。`);
      if (!ok) return;
      const res = await this.ws.send('deleteArrivalOrders', { ids: this.selectedIds });
      if (res.success) {
        alert(`已删除 ${res.data.deleted} 条记录`);
        this.editing = false;
        this.doSearch();
      } else {
        alert('删除失败：' + res.message);
      }
    },
    cancelEdit() { this.editing = false; this.message = ''; this.search(); },
    async save() {
      // 逐行校验
      for (const r of this.list) {
        if (!r.arrival_date) { this.msgType = 'err'; this.message = '存在未填写到货日期的行'; return; }
        if (!String(r.material_id || '').trim()) { this.msgType = 'err'; this.message = '存在未填写物料号的行'; return; }
        if (!r.supplier_id) { this.msgType = 'err'; this.message = '存在未绑定供应商的行'; return; }
        if (!Number(r.quantity) || Number(r.quantity) <= 0) { this.msgType = 'err'; this.message = '数量必须为大于 0 的数字'; return; }
        if (!String(r.recorder || '').trim()) { this.msgType = 'err'; this.message = '存在未填写录入人的行'; return; }
      }
      this.saving = true; let ok = 0, fail = 0; const msgs = [];
      for (const r of this.list) {
        const res = await this.ws.send('updateArrivalOrder', {
          id: r.id,
          arrival_date: r.arrival_date,
          material_id: String(r.material_id).trim(),
          supplier_id: Number(r.supplier_id),
          quantity: Number(r.quantity),
          recorder: String(r.recorder).trim()
        });
        if (res.success) ok++; else { fail++; msgs.push(`ID ${r.id}: ${res.message}`); }
      }
      this.saving = false;
      this.msgType = fail ? 'err' : 'ok';
      this.message = fail ? `保存 ${ok} 条成功，${fail} 条失败（${msgs.join('；')}）` : `保存成功 ${ok} 条`;
      if (!fail) { this.editing = false; this.search(); }
    }
  },
  mounted() { this.loadSuppliers(); this.search(); },
  template: `
    <div>
      <div class="page-title">到货单</div>
      <div class="panel">
        <div class="form-row">
          <label>到货日期：</label>
          <input type="date" v-model="query.arrival_date_start">
          <span style="margin:0 4px;">至</span>
          <input type="date" v-model="query.arrival_date_end">
          <label style="margin-left:12px;">物料号：</label>
          <input v-model="query.material_id" @keyup.enter="doSearch" placeholder="模糊">
          <label style="margin-left:12px;">录入人：</label>
          <input v-model="query.recorder" @keyup.enter="doSearch" placeholder="模糊">
        </div>
        <button @click="doSearch">查询</button>
        <button v-if="$root.hasFuncPerm('func-arrival-order-add') && !adding" @click="startAdd" style="margin-left:8px;">新增</button>
        <button v-if="$root.hasFuncPerm('func-arrival-order-edit') && !editing" @click="startEdit" style="margin-left:8px;">修改</button>
        <button v-if="$root.hasFuncPerm('func-arrival-order-delete') && selectedIds.length > 0" class="danger" @click="batchDelete" style="margin-left:8px;">批量删除（已选 {{ selectedIds.length }} 条）</button>
        <template v-if="editing">
          <button @click="save" :disabled="saving" style="margin-left:8px;">{{ saving ? '保存中…' : '保存' }}</button>
          <button @click="cancelEdit" :disabled="saving" style="background:#909399;">取消</button>
        </template>
        <div v-if="message" :class="['tip', msgType]" style="margin-top:12px;">{{ message }}</div>
      </div>

      <div v-if="adding" class="panel" style="margin-top:16px;">
        <div style="font-weight:600;margin-bottom:10px;">新增到货单</div>
        <div class="form-row">
          <label>到货日期：</label>
          <input type="date" v-model="addForm.arrival_date">
          <label style="margin-left:12px;">物料号：</label>
          <input v-model="addForm.material_id" placeholder="必填，需为已存在的物料">
          <label style="margin-left:12px;">供应商：</label>
          <select v-model="addForm.supplier_id" style="width:180px;">
            <option value="">请选择供应商</option>
            <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.supplier_name }}</option>
          </select>
          <label style="margin-left:12px;">数量：</label>
          <input type="number" v-model="addForm.quantity" placeholder="必填，大于 0" style="width:140px;">
          <label style="margin-left:12px;">录入人：</label>
          <input v-model="addForm.recorder" placeholder="必填" style="width:120px;">
        </div>
        <button @click="saveAdd" :disabled="addSaving">{{ addSaving ? '保存中…' : '保存' }}</button>
        <button @click="cancelAdd" :disabled="addSaving" style="background:#909399;margin-left:8px;">取消</button>
        <div v-if="addMsg" :class="['tip', addMsgType]" style="margin-top:12px;">{{ addMsg }}</div>
      </div>

      <div class="panel" style="margin-top:16px;">
        <table>
          <thead><tr>
            <th style="width:36px;"><input type="checkbox" v-model="allChecked"></th>
            <th>到货日期</th><th>物料号</th><th>物料名称</th><th>规格</th><th>供应商</th><th>数量</th><th>录入人</th>
            <th>创建人</th><th>创建时间</th><th>修改人</th><th>修改时间</th>
          </tr></thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td @click.stop><input type="checkbox" v-model="selectedIds" :value="r.id"></td>
              <td v-if="!editing">{{ fmtDate(r.arrival_date) }}</td>
              <td v-else><input type="date" v-model="r.arrival_date"></td>
              <td v-if="!editing">{{ r.material_id }}</td>
              <td v-else><input v-model="r.material_id" style="width:120px;"></td>
              <td>{{ r.material_name || '-' }}</td>
              <td>{{ r.material_spec || '-' }}</td>
              <td v-if="!editing">{{ r.supplier_name || '-' }}</td>
              <td v-else>
                <select v-model="r.supplier_id" style="width:150px;">
                  <option :value="null">请选择供应商</option>
                  <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.supplier_name }}</option>
                </select>
              </td>
              <td v-if="!editing" style="text-align:right;">{{ fmtQty(r.quantity) }}</td>
              <td v-else><input type="number" v-model="r.quantity" style="width:100px;"></td>
              <td v-if="!editing">{{ r.recorder }}</td>
              <td v-else><input v-model="r.recorder" style="width:100px;"></td>
              <td>{{ r.create_by || '-' }}</td>
              <td>{{ fmtDateTime(r.created_time) }}</td>
              <td>{{ r.update_by || '-' }}</td>
              <td>{{ fmtDateTime(r.update_time) }}</td>
            </tr>
            <tr v-if="!list.length"><td colspan="12" style="text-align:center;color:#909399;">暂无数据</td></tr>
          </tbody>
        </table>
        <vue-pager :page="page" :page-size="pageSize" :total="total"
                   @change="onPageChange" @size-change="onPageSizeChange"></vue-pager>
      </div>
    </div>
  `
});

Vue.component('page-rule', {
  props: ['ws', 'nav'],
  data() {
    return {
      query: { rule_code: '', rule_name: '' },
      page: 1, pageSize: 20, total: 0, list: [],
      importMsg: '', importMsgType: '', importErrors: []
    };
  },
  methods: {
    fmtDate(v) { return v ? String(v).slice(0, 10) : '-'; },
    async search() {
      const res = await this.ws.send('queryInspectRules', { ...this.query, page: this.page, page_size: this.pageSize });
      if (res.success) { this.list = res.data.list; this.total = res.data.total; }
    },
    doSearch() { this.page = 1; this.search(); },
    onPageChange(p) { this.page = p; this.search(); },
    onPageSizeChange(s) { this.pageSize = s; this.page = 1; this.search(); },
    triggerImport() { this.$refs.importFile.value = ''; this.$refs.importFile.click(); },
    async onImportFile(e) {
      const file = e.target.files[0]; if (!file) return;
      this.importMsg = ''; this.importErrors = [];
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const base64 = String(dataUrl).split(',')[1];
      const res = await this.ws.send('importInspectRules', { fileData: base64 });
      if (res.success) {
        this.importMsgType = 'ok'; this.importMsg = `导入成功，共导入 ${res.data.count} 条数据`;
        this.doSearch();
      } else { this.importMsgType = 'err'; this.importMsg = res.message; this.importErrors = res.errors || []; }
    },
    openDetail(r) { this.nav('page-rule-detail', { id: r.id, rule_code: r.rule_code }); }
  },
  template: `
    <div>
      <div class="page-title">检验规则</div>
      <div class="panel">
        <div class="form-row">
          <label>规则编码：</label><input v-model="query.rule_code" placeholder="模糊查询" @keyup.enter="doSearch">
          <label style="margin-left:12px;">规则名称：</label><input v-model="query.rule_name" placeholder="模糊查询" @keyup.enter="doSearch">
        </div>
        <button @click="doSearch">查询</button>
        <button v-if="$root.hasFuncPerm('func-rule-add')" @click="nav('page-rule-add')">新增</button>
        <button v-if="$root.hasFuncPerm('func-rule-import')" @click="triggerImport">导入</button>
        <input ref="importFile" type="file" accept=".xlsx,.xls" style="display:none" @change="onImportFile">
        <div v-if="importMsg" :class="['tip', importMsgType]" style="margin-top:12px;">
          <div>{{ importMsg }}</div>
          <div v-for="(e, i) in importErrors" :key="i" style="font-size:13px;">第 {{ e.row }} 行：{{ e.message }}</div>
        </div>
      </div>

      <div class="panel" style="margin-top:16px;">
        <table>
          <thead>
            <tr>
              <th>规则编码</th><th>规则名称</th><th>项目数</th><th>状态</th><th>创建人</th><th>创建时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in list" :key="r.id" class="clickable" @click="openDetail(r)">
              <td>{{ r.rule_code }}</td>
              <td>{{ r.rule_name || '-' }}</td>
              <td>{{ r.item_count }}</td>
              <td>{{ r.is_active == 1 ? '启用' : '停用' }}</td>
              <td>{{ r.create_by || '-' }}</td>
              <td>{{ fmtDate(r.created_time) }}</td>
            </tr>
            <tr v-if="!list.length"><td colspan="6" style="text-align:center;color:#909399;">暂无数据</td></tr>
          </tbody>
        </table>
        <vue-pager :page="page" :page-size="pageSize" :total="total"
                   @change="onPageChange" @size-change="onPageSizeChange"></vue-pager>
      </div>
    </div>
  `,
  mounted() { this.search(); },
  activated() {
    // keep-alive 重新激活：保留筛选条件，仅按原条件刷新数据（首次激活不重复查询）
    if (this._actOnce) this.search(); else this._actOnce = true;
  }
});

// ========== 新增检验规则 ==========
Vue.component('page-rule-add', {
  props: ['ws', 'nav'],
  data() {
    return {
      ruleCode: '',
      ruleDesc: '',     // 检验规则说明
      items: [],        // 已选检验项目列表 [{ item_id, item_name, item_type, seq, standard_value, standard_range, image_url }]
      itemOptions: [],  // 检验项目下拉选项（来自 inspection_item 表）
      selItemId: '',    // 当前选择的检验项目
      itemKeyword: '',  // 项目搜索关键词
      showItemList: false, // 搜索下拉展开
      selSeq: 1,        // 当前输入的顺序
      selStdVal: '',    // 当前输入的标准值
      selStdRange: '',  // 当前输入的标准区间（最小值,最大值）
      selImageUrl: '',  // 当前上传的标准图片地址（图片类型项目）
      uploading: false,
      message: '',
      msgType: ''
    };
  },
  computed: {
    // 当前选择的检验项目（用于判断是否为图片类型）
    selItem() {
      return this.itemOptions.find(o => o.item_id === this.selItemId) || null;
    },
    selItemType() {
      return this.selItem ? this.selItem.item_type : '';
    },
    // 过滤后的检验项目（排除已选 + 关键词匹配）
    filteredItemOptions() {
      const kw = (this.itemKeyword || '').trim().toLowerCase();
      const selIds = new Set(this.items.map(i => i.item_id));
      return this.itemOptions.filter(o => {
        if (selIds.has(o.item_id)) return false;
        if (!kw) return true;
        return o.item_id.toLowerCase().includes(kw) || (o.item_name || '').toLowerCase().includes(kw);
      });
    }
  },
  methods: {
    pickItem(o) {
      this.selItemId = o.item_id;
      this.itemKeyword = o.item_id + ' - ' + o.item_name;
      this.showItemList = false;
    },
    clickItemInput() {
      this.showItemList = true;
    },
    onItemInput() {
      // 用户改了搜索词，清空选中
      this.selItemId = '';
      this.showItemList = true;
    },
    previewImage(url) { if (url) window.open(url, '_blank'); },
    isImageType(it) { return it.item_type === 'image'; },
    // 上传标准图片到服务器 resource 目录，返回访问地址
    async uploadFile(file) {
      const fd = new FormData();
      fd.append('file', file);
      const resp = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await resp.json();
      if (!data.success) throw new Error(data.message || '上传失败');
      return data.data.url;
    },
    async onSelFile(e) {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      e.target.value = '';
      this.uploading = true;
      try {
        this.selImageUrl = await this.uploadFile(f);
        this.message = ''; 
      } catch (err) {
        this.msgType = 'err'; this.message = '图片上传失败：' + err.message;
      } finally { this.uploading = false; }
    },
    async loadItems() {
      const res = await this.ws.send('queryInspectItems', { is_active: 1, page_size: 1000 });
      if (res.success) this.itemOptions = res.data.list;
    },
    // 标准区间前端预检："最小值,最大值"（两个数字用逗号隔开），合法返回归一化字符串
    checkRange(raw) {
      const s = String(raw || '').trim();
      if (!s) return { value: null };
      const p = s.split(',');
      if (p.length !== 2) return { error: '标准区间必须为「最小值,最大值」格式（两个数字用逗号隔开）' };
      const min = Number(p[0].trim()), max = Number(p[1].trim());
      if (isNaN(min) || isNaN(max)) return { error: '标准区间的最小值/最大值必须为数字' };
      if (min > max) return { error: '标准区间的最小值不能大于最大值' };
      return { value: `${min},${max}` };
    },
    addItem() {
      if (!this.selItemId) {
        this.msgType = 'err'; this.message = '请选择检验项目';
        return;
      }
      // 已存在则提示
      if (this.items.some(i => i.item_id === this.selItemId)) {
        this.msgType = 'err'; this.message = '该检验项目已添加';
        return;
      }
      const opt = this.itemOptions.find(o => o.item_id === this.selItemId);
      const itemType = opt ? opt.item_type : '';
      if (itemType === 'image') {
        // 图片类型：必须上传标准图片，图片地址写入数据库
        if (!this.selImageUrl) {
          this.msgType = 'err'; this.message = '图片类型项目请先上传标准图片';
          return;
        }
        this.items.push({
          item_id: this.selItemId,
          item_name: opt ? opt.item_name : '',
          item_type: itemType,
          seq: this.selSeq,
          standard_value: null,
          standard_range: null,
          image_url: this.selImageUrl
        });
        this.selImageUrl = '';
      } else {
        const range = this.checkRange(this.selStdRange);
        if (range.error) {
          this.msgType = 'err'; this.message = range.error;
          return;
        }
        this.items.push({
          item_id: this.selItemId,
          item_name: opt ? opt.item_name : '',
          item_type: itemType || null,
          seq: this.selSeq,
          standard_value: String(this.selStdVal).trim() || null,
          standard_range: range.value,
          image_url: null
        });
        this.selStdVal = '';
        this.selStdRange = '';
      }
      this.selItemId = '';
      this.selSeq = this.items.length + 1;
      this.message = '';
    },
    removeItem(i) {
      this.items.splice(i, 1);
      // 重新编号
      this.items.forEach((it, idx) => { it.seq = idx + 1; });
      this.selSeq = this.items.length + 1;
    },
    async submit() {
      this.message = '';
      if (!this.ruleCode.trim()) {
        this.msgType = 'err'; this.message = '规则编码不能为空';
        return;
      }
      if (this.items.length === 0) {
        this.msgType = 'err'; this.message = '请至少添加一个检验项目';
        return;
      }
      const res = await this.ws.send('createInspectRule', {
        rule_code: this.ruleCode.trim(),
        rule_desc: this.ruleDesc.trim() || null,
        items: this.items.map((it, idx) => ({
          item_id: it.item_id,
          item_name: it.item_name,
          seq: idx + 1,
          standard_value: it.standard_value,
          standard_range: it.standard_range,
          image_url: it.image_url || null
        }))
      });
      if (!res.success) {
        this.msgType = 'err'; this.message = res.message;
        return;
      }
      this.msgType = 'ok';
      this.message = `检验规则已新增：${this.ruleCode}（${res.data.count} 项）`;
      setTimeout(() => this.nav('page-rule'), 1200);
    },
    back() { this.nav('page-rule'); }
  },
  mounted() { this.loadItems(); },
  template: `
    <div>
      <div class="page-title">新增检验规则</div>
      <div class="panel">
        <div class="form-row">
          <label>规则编码：</label>
          <input v-model="ruleCode" placeholder="必填，如 RULE_TEST">
        </div>
        <div class="form-row">
          <label>规则说明：</label>
          <input v-model="ruleDesc" placeholder="选填，检验规则说明">
        </div>
      </div>

      <div class="panel" style="margin-top:16px;">
        <h3 style="margin-bottom:8px;font-size:14px;color:#1565c0;">添加检验项目</h3>
        <div class="form-row">
          <label>检验项目：</label>
          <div style="position:relative;display:inline-block;">
            <input
              v-model="itemKeyword"
              @focus="clickItemInput"
              @input="onItemInput"
              placeholder="输入品号/品名搜索"
              style="width:240px;">
            <button class="mini" type="button"
              @click="showItemList = !showItemList"
              style="margin-left:4px;">▼</button>
            <div v-if="showItemList"
              style="position:absolute;top:34px;left:0;width:360px;max-height:260px;overflow:auto;border:1px solid #e5e7eb;background:#fff;z-index:100;box-shadow:0 4px 12px rgba(0,0,0,.08);border-radius:4px;">
              <div v-if="filteredItemOptions.length === 0" style="padding:10px;color:#909399;text-align:center;">无匹配项目</div>
              <div v-for="o in filteredItemOptions" :key="o.item_id"
                @click="pickItem(o)"
                style="padding:8px 12px;cursor:pointer;border-bottom:1px solid #f3f4f6;font-size:13px;"
                :style="{ background: selItemId === o.item_id ? '#e8f0fe' : '#fff' }"
                @mouseenter="$event.currentTarget.style.background='#f0f4ff'"
                @mouseleave="() => $event.currentTarget.style.background = (selItemId === o.item_id ? '#e8f0fe' : '#fff')">
                <div style="font-weight:600;color:#1e88e5;">{{ o.item_id }}</div>
                <div style="color:#606266;font-size:12px;">{{ o.item_name }} <span v-if="o.item_type" style="color:#909399;">({{ o.item_type }})</span></div>
              </div>
            </div>
          </div>
          <label style="margin-left:12px;">顺序：</label>
          <input v-model.number="selSeq" type="number" style="width:60px;" placeholder="序号">
          <button @click="addItem">添加</button>
        </div>
        <div class="form-row">
          <label>标准值：</label>
          <template v-if="selItemType === 'image'">
            <input ref="selFile" type="file" accept="image/*" style="display:none" @change="onSelFile">
            <button class="mini" @click="$refs.selFile.click()" :disabled="uploading" style="background:#1e88e5;color:#fff;">
              {{ uploading ? '上传中…' : (selImageUrl ? '重新上传' : '上传图片') }}
            </button>
            <template v-if="selImageUrl">
              <img :src="selImageUrl" @click="previewImage(selImageUrl)"
                style="width:48px;height:48px;object-fit:cover;border:1px solid #e5e7eb;border-radius:4px;cursor:pointer;margin-left:8px;vertical-align:middle;"
                title="点击预览">
              <a href="javascript:;" @click="previewImage(selImageUrl)" style="margin-left:6px;font-size:12px;">{{ selImageUrl }}</a>
              <button class="mini" style="margin-left:6px;background:#909399;color:#fff;" @click="selImageUrl = ''">移除</button>
            </template>
            <span v-else style="margin-left:8px;color:#909399;font-size:12px;">未上传</span>
          </template>
          <template v-else>
            <input v-model="selStdVal" style="width:140px;" placeholder="选填，如 10.5">
            <label style="margin-left:12px;">标准区间：</label>
            <input v-model="selStdRange" style="width:140px;" placeholder="选填，最小值,最大值 如 5,10">
          </template>
        </div>

        <table style="margin-top:12px;">
          <thead>
            <tr><th>序号</th><th>项目编号</th><th>项目名称</th><th>录入类型</th><th>标准值</th><th>标准区间</th><th>操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="(it, i) in items" :key="i">
              <td>{{ i + 1 }}</td>
              <td>{{ it.item_id }}</td>
              <td>{{ it.item_name }}</td>
              <td>{{ isImageType(it) ? '图片' : (it.item_type || '-') }}</td>
              <td>
                <template v-if="isImageType(it)">
                  <template v-if="it.image_url">
                    <img :src="it.image_url" @click="previewImage(it.image_url)"
                      style="width:40px;height:40px;object-fit:cover;border:1px solid #e5e7eb;border-radius:4px;cursor:pointer;vertical-align:middle;"
                      title="点击预览">
                    <a href="javascript:;" @click="previewImage(it.image_url)" style="margin-left:6px;font-size:12px;">{{ it.image_url }}</a>
                  </template>
                  <span v-else style="color:#909399;">未上传</span>
                </template>
                <span v-else>{{ it.standard_value ?? '-' }}</span>
              </td>
              <td>{{ isImageType(it) ? '-' : (it.standard_range ? it.standard_range.split(',').join(' ~ ') : '-') }}</td>
              <td><a href="javascript:;" class="del-link" @click="removeItem(i)">删除</a></td>
            </tr>
            <tr v-if="!items.length"><td colspan="7" style="text-align:center;color:#909399;">暂无检验项目</td></tr>
          </tbody>
        </table>
      </div>

      <div class="panel" style="margin-top:16px;">
        <div v-if="message" :class="['tip', msgType]">{{ message }}</div>
        <button @click="submit">保存</button>
        <button @click="back">返回</button>
      </div>
    </div>
  `
});

// ========== 检验规则详情 ==========
Vue.component('page-rule-detail', {
  props: ['ws', 'nav', 'params'],
  data() {
    return {
      header: null,
      items: [],
      itemTypeMap: {},   // 项目编号 -> 录入类型（用于手工录入编号时识别图片类型）
      message: '', msgType: '', msgTarget: 'top',
      editing: false, saving: false
    };
  },
  methods: {
    fmtDate(v) { return v ? String(v).slice(0, 10) : '-'; },
    async loadItemTypes() {
      const res = await this.ws.send('queryInspectItems', { page_size: 500 });
      if (res.success) {
        const map = {};
        res.data.list.forEach(o => { map[o.item_id] = o.item_type; });
        this.itemTypeMap = map;
      }
    },
    onItemIdChange(it) {
      const t = this.itemTypeMap[String(it.item_id || '').trim()];
      if (t) it.item_type = t;
    },
    async load() {
      const key = this.params.id ? { id: this.params.id } : { rule_code: this.params.rule_code };
      const res = await this.ws.send('getInspectRuleDetail', key);
      if (res.success) { this.header = res.data.header; this.items = res.data.items; }
      else { this.msgTarget = 'top'; this.msgType = 'err'; this.message = res.message; }
    },
    startEdit() { this.editing = true; this.message = ''; this.msgTarget = 'panel'; },
    async cancelEdit() { this.editing = false; await this.load(); this.message = ''; },
    addRow() {
      this.items.push({ item_id: '', item_name: '', standard_value: '', standard_range: '', image_url: '', seq: this.items.length + 1, item_type: null });
    },
    removeRow(i) { this.items.splice(i, 1); },
    // 上传图片（HTTP multipart，不走 WebSocket）
    async uploadImage(i, e) {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      e.target.value = '';
      const fd = new FormData();
      fd.append('file', f);
      try {
        const resp = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await resp.json();
        if (!data.success) { alert(data.message); return; }
        this.items[i].image_url = data.data.url;
        this.message = '图片上传成功'; this.msgType = 'ok'; this.msgTarget = 'panel';
      } catch (err) {
        alert('上传失败：' + err.message);
      }
    },
    removeImage(i) { this.items[i].image_url = ''; },
    previewImage(url) { if (url) window.open(url, '_blank'); },
    isImageType(it) { return it.item_type === 'image'; },
    async save() {
      if (!this.header) return;
      this.saving = true;
      const res = await this.ws.send('updateInspectRule', {
        id: this.header.id,
        rule_name: this.header.rule_name,
        is_active: this.header.is_active,
        items: this.items.map((it, i) => ({
          id: it.id,
          item_id: it.item_id,
          item_name: it.item_name,
          standard_value: this.isImageType(it) ? null : (it.standard_value || null),
          standard_range: this.isImageType(it) ? null : (it.standard_range || null),
          image_url: it.image_url || null,
          seq: it.seq !== undefined && it.seq !== '' ? Number(it.seq) : i + 1
        }))
      });
      this.saving = false;
      this.msgTarget = 'panel';
      if (res.success) { this.editing = false; await this.load(); this.msgType = 'ok'; this.message = '保存成功'; }
      else { this.msgType = 'err'; this.message = res.message; }
    },
    back() { this.nav('page-rule'); }
  },
  mounted() { this.load(); this.loadItemTypes(); },
  template: `
    <div>
      <div class="page-title">检验规则详情</div>

      <div v-if="message && msgTarget === 'top'" :class="['tip', msgType]">{{ message }}</div>

      <template v-if="header">
        <!-- 单头 -->
        <div class="panel">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <h3 style="margin:0;font-size:14px;color:#1565c0;">基本信息</h3>
            <span>
              <button @click="back">返回列表</button>
              <button v-if="$root.hasFuncPerm('func-rule-edit') && !editing" @click="startEdit" style="margin-left:8px;">修改</button>
            </span>
          </div>
          <div class="form-row">
            <label>规则编码：</label>
            <span v-if="!editing">{{ header.rule_code }}</span>
            <span v-else style="color:#909399;">{{ header.rule_code }}（不可修改）</span>
          </div>
          <div class="form-row">
            <label>规则名称：</label>
            <span v-if="!editing">{{ header.rule_name || '-' }}</span>
            <input v-else v-model="header.rule_name" placeholder="规则名称">
          </div>
          <div class="form-row">
            <label>状态：</label>
            <span v-if="!editing">{{ header.is_active == 1 ? '启用' : '停用' }}</span>
            <select v-else v-model.number="header.is_active">
              <option :value="1">启用</option><option :value="0">停用</option>
            </select>
          </div>
          <div class="form-row"><label>创建人：</label>{{ header.create_by || '-' }}</div>
          <div class="form-row"><label>创建时间：</label>{{ fmtDate(header.created_time) }}</div>
        </div>

        <!-- 单身 -->
        <div class="panel" style="margin-top:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <h3 style="margin:0;font-size:14px;color:#1565c0;">
              检验项目（{{ items.length }} 项）
            </h3>
            <span v-if="editing">
              <button @click="addRow">新增项目</button>
              <button @click="save" :disabled="saving" style="margin-left:8px;">{{ saving ? '保存中…' : '保存' }}</button>
              <button @click="cancelEdit" style="margin-left:8px;background:#909399;">取消</button>
            </span>
          </div>
          <div v-if="message && msgTarget === 'panel'" :class="['tip', msgType]" style="margin-bottom:8px;">{{ message }}</div>

          <table>
            <thead>
              <tr>
                <th>顺序</th><th>项目编号</th><th>项目名称</th><th>录入类型</th><th>标准值</th><th>标准区间</th>
                <th v-if="editing">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(it, i) in items" :key="it.id || ('new-' + i)">
                <td v-if="!editing">{{ it.seq }}</td>
                <td v-else><input type="number" v-model.number="it.seq" style="width:60px;"></td>

                <td v-if="!editing">{{ it.item_id }}</td>
                <td v-else>
                  <input v-model="it.item_id" placeholder="项目编号" style="width:110px;" @change="onItemIdChange(it)">
                </td>

                <td v-if="!editing">{{ it.item_name || '-' }}</td>
                <td v-else>
                  <input v-model="it.item_name" placeholder="项目名称" style="width:110px;">
                </td>

                <td>
                  <span v-if="it.item_type === 'image'" style="color:#0d9488;font-weight:600;">图片</span>
                  <span v-else>{{ it.item_type || '-' }}</span>
                </td>

                <!-- 标准值：图片类型在此上传/预览，非图片类型录入标准值 -->
                <td v-if="isImageType(it)">
                  <!-- 非编辑模式：缩略图 + 图片地址链接，点击预览 -->
                  <div v-if="!editing">
                    <template v-if="it.image_url">
                      <img :src="it.image_url" @click="previewImage(it.image_url)"
                        style="width:56px;height:56px;object-fit:cover;border:1px solid #e5e7eb;border-radius:4px;cursor:pointer;vertical-align:middle;"
                        title="点击预览">
                      <a href="javascript:;" @click="previewImage(it.image_url)" style="margin-left:6px;font-size:12px;word-break:break-all;">{{ it.image_url }}</a>
                    </template>
                    <span v-else style="color:#909399;">未上传</span>
                  </div>
                  <!-- 编辑模式：上传按钮 + 缩略图 + 换图/移除 -->
                  <div v-else>
                    <input :ref="'file-' + i" type="file" accept="image/*" style="display:none" @change="uploadImage(i, $event)">
                    <template v-if="it.image_url">
                      <img :src="it.image_url" @click="previewImage(it.image_url)"
                        style="width:56px;height:56px;object-fit:cover;border:1px solid #e5e7eb;border-radius:4px;cursor:pointer;vertical-align:middle;"
                        title="点击预览">
                      <a href="javascript:;" @click="previewImage(it.image_url)" style="margin-left:6px;font-size:12px;word-break:break-all;">{{ it.image_url }}</a>
                      <div style="margin-top:4px;">
                        <button class="mini" @click="$refs['file-' + i][0].click()">换图</button>
                        <button class="mini" style="margin-left:4px;background:#909399;color:#fff;" @click="removeImage(i)">移除</button>
                      </div>
                    </template>
                    <button v-else class="mini" @click="$refs['file-' + i][0].click()" style="background:#1e88e5;color:#fff;">上传图片</button>
                  </div>
                </td>
                <td v-else>
                  <span v-if="!editing">{{ it.standard_value ?? '-' }}</span>
                  <input v-else v-model="it.standard_value" placeholder="标准值" style="width:90px;">
                </td>

                <!-- 标准区间：图片类型不适用 -->
                <td v-if="!isImageType(it)">
                  <span v-if="!editing">{{ it.standard_range || '-' }}</span>
                  <input v-else v-model="it.standard_range" placeholder="min,max" style="width:110px;">
                </td>
                <td v-else style="color:#909399;text-align:center;">—</td>

                <td v-if="editing">
                  <button style="background:#dd4b4b;padding:2px 10px;" @click="removeRow(i)">删除</button>
                </td>
              </tr>
              <tr v-if="!items.length">
                <td :colspan="editing ? 7 : 6" style="text-align:center;color:#909399;">该规则暂无检验项目</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  `
});

Vue.component('page-bom', {
  props: ['ws', 'nav'],
  data() {
    return {
      query: { parent_material_id: '', parent_material_name: '', component_material: '', component_name: '' },
      page: 1, pageSize: 20, total: 0, list: [],
      importMsg: '', importMsgType: '', importErrors: []
    };
  },
  methods: {
    async search() {
      const res = await this.ws.send('queryBomParentList', { ...this.query, page: this.page, page_size: this.pageSize });
      if (res.success) { this.list = res.data.list; this.total = res.data.total; }
    },
    doSearch() { this.page = 1; this.search(); },
    onPageChange(p) { this.page = p; this.search(); },
    onPageSizeChange(s) { this.pageSize = s; this.page = 1; this.search(); },
    fmtDate(v) { return v ? String(v).slice(0, 10) : '-'; },
    triggerImport() { this.$refs.importFB.click(); },
    async onImportFile(e) {
      const f = e.target.files[0]; if (!f) return;
      this.importMsg = ''; this.importErrors = [];
      const url = await new Promise((r, rej) => { const rd = new FileReader(); rd.onload = () => r(rd.result); rd.onerror = rej; rd.readAsDataURL(f); });
      const res = await this.ws.send('importBom', { fileData: String(url).split(',')[1] });
      if (res.success) { this.importMsgType = 'ok'; this.importMsg = `导入成功 ${res.data.count} 条`; this.doSearch(); }
      else { this.importMsgType = 'err'; this.importMsg = res.message; this.importErrors = res.errors || []; }
    },
    openDetail(r) { this.nav('page-bom-detail', { parent_material_id: r.parent_material_id }); }
  },
  mounted() { this.search(); },
  activated() {
    // keep-alive 重新激活：保留筛选条件，仅按原条件刷新数据（首次激活不重复查询）
    if (this._actOnce) this.search(); else this._actOnce = true;
  },
  template: `
    <div>
      <div class="page-title">BOM数据</div>
      <div class="panel">
        <div class="form-row">
          <label>主件料号：</label><input v-model="query.parent_material_id" @keyup.enter="doSearch" placeholder="模糊">
          <label style="margin-left:12px;">主件名称：</label><input v-model="query.parent_material_name" @keyup.enter="doSearch" placeholder="模糊">
        </div>
        <div class="form-row" style="margin-top:8px;">
          <label>元件料号：</label><input v-model="query.component_material" @keyup.enter="doSearch" placeholder="查找包含该元件的主件">
          <label style="margin-left:12px;">元件名称：</label><input v-model="query.component_name" @keyup.enter="doSearch" placeholder="查找包含该元件的主件">
        </div>
        <button @click="doSearch">查询</button>
        <button v-if="$root.hasFuncPerm('func-bom-add')" @click="nav('page-bom-add')">新增BOM</button>
        <button v-if="$root.hasFuncPerm('func-bom-ecn')" @click="nav('page-bom-ecn')">多主件ECN</button>
        <button v-if="$root.hasFuncPerm('func-bom-import')" @click="triggerImport">导入</button>
        <input ref="importFB" type="file" accept=".xlsx,.xls" style="display:none" @change="onImportFile">
        <div v-if="importMsg" :class="['tip', importMsgType]" style="margin-top:12px;">
          <div>{{ importMsg }}</div>
          <div v-for="(e,i) in importErrors" :key="i" style="font-size:13px;">第 {{ e.row }} 行：{{ e.message }}</div>
        </div>
      </div>
      <div class="panel" style="margin-top:16px;">
        <table>
          <thead><tr>
            <th>主件料号</th><th>主件名称</th><th>规格</th><th>当前版本</th><th>创建人</th><th>创建日期</th>
          </tr></thead>
          <tbody>
            <tr v-for="r in list" :key="r.parent_material_id">
              <td><a href="javascript:;" @click="openDetail(r)" style="color:#1e88e5;text-decoration:none;">{{ r.parent_material_id }}</a></td>
              <td>{{ r.parent_material_name || '-' }}</td>
              <td>{{ r.parent_material_spec || '-' }}</td>
              <td><span v-if="r.current_version > 0" style="color:#409eff;font-weight:600;">v{{ r.current_version }}</span><span v-else style="color:#c0c4cc;">-</span></td>
              <td>{{ r.create_by || '-' }}</td>
              <td>{{ fmtDate(r.created_time) }}</td>
            </tr>
            <tr v-if="!list.length"><td colspan="6" style="text-align:center;color:#909399;">暂无数据</td></tr>
          </tbody>
        </table>
        <vue-pager :page="page" :page-size="pageSize" :total="total"
                   @change="onPageChange" @size-change="onPageSizeChange"></vue-pager>
      </div>
    </div>
  `
});

// ========== BOM明细 ==========
Vue.component('page-bom-detail', {
  props: ['ws', 'nav', 'params'],
  data() {
    return {
      parentMaterialId: '',
      parent: null, items: [],
      loading: true, editing: false, saving: false, message: '', msgType: '',
      currentVersion: 0,
      // 历史版本弹层
      historyOpen: false,
      historyList: [],
      historyLoading: false,
      historyVersion: null,
      historyLoadingVersion: false
    };
  },
  created() {
    this.parentMaterialId = (this.params && this.params.parent_material_id) || '';
  },
  methods: {
    async load() {
      if (!this.parentMaterialId) return;
      this.loading = true;
      const res = await this.ws.send('getBomDetail', { parent_material_id: this.parentMaterialId });
      this.loading = false;
      if (res.success) {
        this.parent = res.data.parent;
        this.items = res.data.items.map(it => ({
          ...it,
          component_material_edit: it.component_material,
          quantity_edit: Number(it.quantity) || 1
        }));
        this.currentVersion = res.data.current_version || 0;
      } else { this.msgType = 'err'; this.message = res.message; }
    },
    startEdit() { this.editing = true; this.message = ''; },
    cancelEdit() { this.editing = false; this.message = ''; this.load(); },
    addRow() {
      this.items.push({
        id: 0, component_material_edit: '', quantity_edit: 1,
        component_material_name: '', component_material_spec: ''
      });
    },
    removeRow(i) { this.items.splice(i, 1); },
    async save() {
      const cleaned = [];
      for (const it of this.items) {
        const cid = (it.component_material_edit || '').trim();
        const qty = Number(it.quantity_edit);
        if (!cid) continue;
        if (!qty || qty < 1) { this.msgType = 'err'; this.message = `元件 ${cid} 用量必须 ≥ 1`; return; }
        cleaned.push({ component_material: cid, quantity: qty });
      }
      this.saving = true;
      const res = await this.ws.send('updateBomDetail', {
        parent_material_id: this.parentMaterialId, items: cleaned
      });
      this.saving = false;
      if (res.success) { this.msgType = 'ok'; this.message = `保存成功（已归档到 v${res.data.version}）`; this.editing = false; this.load(); }
      else { this.msgType = 'err'; this.message = res.message; }
    },
    async searchMat(i) {
      const kw = (this.items[i].component_material_edit || '').trim();
      if (!kw) return;
      const res = await this.ws.send('queryMaterials', { material_id: kw, page: 1, page_size: 5 });
      if (res.success && res.data.list.length) {
        const m = res.data.list[0];
        this.items[i].component_material_edit = m.material_id;
        this.items[i].component_material_name = m.material_name;
        this.items[i].component_material_spec = m.material_spec || '';
      }
    },
    back() { this.nav('page-bom'); },
    fmtDate(v) { return v ? String(v).slice(0, 10) : '-'; },
    // 打开历史版本弹层
    async openHistory() {
      if (!this.parentMaterialId) return;
      this.historyOpen = true;
      this.historyLoading = true;
      this.historyVersion = null;
      const res = await this.ws.send('queryBomHistory', { parent_material_id: this.parentMaterialId });
      this.historyLoading = false;
      if (res.success) this.historyList = res.data.list;
      else this.historyList = [];
    },
    async loadHistoryVersion(v) {
      this.historyLoadingVersion = true;
      const res = await this.ws.send('getBomHistoryVersion', { parent_material_id: this.parentMaterialId, version_no: v });
      this.historyLoadingVersion = false;
      if (res.success) {
        this.historyVersion = res.data;
      } else {
        alert(res.message);
      }
    }
  },
  mounted() { this.load(); },
  template: `
    <div>
      <div class="page-title">BOM明细 — {{ parent ? parent.material_id : parentMaterialId }}</div>
      <div class="panel" v-if="parent">
        <div class="form-row" style="align-items:center;gap:28px;flex-wrap:wrap;">
          <div style="flex:0 0 auto;">
            <strong style="color:#606266;">主件料号：</strong><span style="color:#1f2d3d;font-weight:600;">{{ parent.material_id }}</span>
          </div>
          <div style="flex:0 0 auto;">
            <strong style="color:#606266;">名称：</strong><span>{{ parent.material_name || '-' }}</span>
          </div>
          <div style="flex:0 0 auto;">
            <strong style="color:#606266;">规格：</strong><span>{{ parent.material_spec || '-' }}</span>
          </div>
          <div style="flex:0 0 auto;">
            <strong style="color:#606266;">当前版本：</strong>
            <span v-if="currentVersion > 0" style="color:#409eff;font-weight:600;">v{{ currentVersion }}</span>
            <span v-else style="color:#c0c4cc;">未修改过</span>
          </div>
          <div style="flex:1;text-align:right;margin-left:auto;">
            <button @click="back">返回列表</button>
            <button v-if="!editing" @click="openHistory" style="margin-left:8px;">历史版本</button>
            <button v-if="$root.hasFuncPerm('func-bom-edit') && !editing" @click="startEdit" style="margin-left:8px;">修改</button>
            <template v-else>
              <button @click="save" :disabled="saving" style="margin-left:8px;">{{ saving ? '保存中…' : '保存' }}</button>
              <button @click="cancelEdit" :disabled="saving" style="background:#909399;">取消</button>
              <button @click="addRow" style="background:#67c23a;">+ 新增元件</button>
            </template>
          </div>
        </div>
      </div>
      <div v-if="message" :class="['tip', msgType]" style="margin:12px 0;">{{ message }}</div>
      <div v-if="loading" class="panel" style="text-align:center;color:#909399;">加载中…</div>
      <div v-else class="panel" style="margin-top:16px;">
        <table>
          <thead><tr>
            <th>元件料号</th><th>元件名称</th><th>规格</th><th>用量</th><th v-if="editing">操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="(it, i) in items" :key="it.id || ('n' + i)">
              <td v-if="!editing">{{ it.component_material }}</td>
              <td v-else>
                <input v-model="it.component_material_edit" @blur="searchMat(i)" @keyup.enter="searchMat(i)"
                       style="width:140px;" placeholder="元件料号">
              </td>
              <td>{{ it.component_material_name || '-' }}</td>
              <td>{{ it.component_material_spec || '-' }}</td>
              <td v-if="!editing">{{ it.quantity }}</td>
              <td v-else>
                <input v-model.number="it.quantity_edit" type="number" min="1" style="width:60px;">
              </td>
              <td v-if="editing">
                <a class="del-link" href="javascript:;" @click="removeRow(i)">删除</a>
              </td>
            </tr>
            <tr v-if="!items.length"><td :colspan="editing ? 5 : 4" style="text-align:center;color:#909399;">该主件暂无BOM元件</td></tr>
          </tbody>
        </table>
      </div>

      <!-- 历史版本弹层 -->
      <div v-if="historyOpen" :style="{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.4)',zIndex:999}" @click.self="historyOpen = false">
        <div :style="{position:'absolute',top:'5%',left:'10%',right:'10%',bottom:'10%',background:'#fff',borderRadius:'4px',display:'flex',flexDirection:'column'}" @click.stop>
          <div :style="{padding:'12px 16px',borderBottom:'1px solid #e4e7ed',display:'flex',justifyContent:'space-between',alignItems:'center'}">
            <h3 style="margin:0;font-size:15px;">BOM 历史版本 — {{ parentMaterialId }}</h3>
            <button @click="historyOpen = false" class="mini" style="background:#909399;">关闭</button>
          </div>
          <div :style="{flex:1,display:'flex',overflow:'hidden'}">
            <!-- 左侧：版本列表 -->
            <div :style="{width:'260px',borderRight:'1px solid #e4e7ed',overflowY:'auto',background:'#fafafa'}">
              <div v-if="historyLoading" style="padding:16px;text-align:center;color:#909399;">加载中…</div>
              <div v-else-if="!historyList.length" style="padding:16px;color:#909399;font-size:13px;">暂无修改历史<br><span style="color:#c0c4cc;font-size:12px;">（首次修改后自动产生 v1 版本）</span></div>
              <div v-for="v in historyList" :key="v.version_no"
                   @click="loadHistoryVersion(v.version_no)"
                   :style="{padding:'10px 12px',borderBottom:'1px solid #ebeef5',cursor:'pointer',fontSize:'13px',background:historyVersion && historyVersion.version_no === v.version_no ? '#ecf5ff' : '',borderLeft: historyVersion && historyVersion.version_no === v.version_no ? '3px solid #409eff' : '3px solid transparent'}">
                <div><b>v{{ v.version_no }}</b> <span style="color:#909399;">（{{ v.detail_count }} 条元件）</span></div>
                <div style="color:#606266;margin-top:2px;">变更时间：{{ v.change_time ? String(v.change_time).slice(0,19).replace('T',' ') : '' }}</div>
                <div style="color:#909399;margin-top:2px;">修改人：{{ v.change_by || '-' }}</div>
              </div>
            </div>
            <!-- 右侧：历史明细 -->
            <div :style="{flex:1,overflowY:'auto',padding:'16px'}" v-if="historyVersion">
              <div style="margin-bottom:12px;color:#606266;font-size:13px;">
                版本 <b>v{{ historyVersion.version_no }}</b>（修改前明细） &nbsp; 变更时间 {{ historyVersion.change_time ? String(historyVersion.change_time).slice(0,19).replace('T',' ') : '-' }} &nbsp; 修改人 {{ historyVersion.change_by || '-' }}
              </div>
              <table style="margin-bottom:16px;">
                <thead><tr><th>序号</th><th>元件料号</th><th>元件名称</th><th>规格</th><th>用量</th><th>原创建时间</th></tr></thead>
                <tbody>
                  <tr v-for="(d, i) in historyVersion.details" :key="d.id || i">
                    <td>{{ i + 1 }}</td>
                    <td>{{ d.component_material }}</td>
                    <td>{{ d.component_material_name || '-' }}</td>
                    <td>{{ d.component_material_spec || '-' }}</td>
                    <td>{{ d.quantity }}</td>
                    <td>{{ d.origin_created_time ? String(d.origin_created_time).slice(0,19).replace('T',' ') : '-' }}</td>
                  </tr>
                  <tr v-if="!historyVersion.details.length"><td colspan="6" style="text-align:center;color:#909399;">该版本修改前无元件</td></tr>
                </tbody>
              </table>
            </div>
            <div v-else :style="{flex:1,padding:'24px',color:'#909399',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}">
              <span v-if="historyLoadingVersion">加载明细中…</span>
              <span v-else>请在左侧选择版本查看修改前明细</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
});

// ========== 新增 BOM ==========
Vue.component('page-bom-add', {
  props: ['ws', 'nav'],
  data() {
    return {
      parentMaterialId: '',
      items: [],          // 已选元件列表 [{ component_material, material_name, quantity }]
      materialOptions: [], // 物料下拉选项（来自 material 表）
      selComponent: '',   // 当前选择的元件料号
      selQty: 1,          // 当前输入的用量
      message: '',
      msgType: ''
    };
  },
  methods: {
    async loadMaterials() {
      const res = await this.ws.send('queryMaterials', { is_active: 1, page_size: 200 });
      if (res.success) this.materialOptions = res.data.list;
    },
    addItem() {
      if (!this.selComponent) {
        this.msgType = 'err'; this.message = '请选择元件料号';
        return;
      }
      if (this.items.some(i => i.component_material === this.selComponent)) {
        this.msgType = 'err'; this.message = '该元件已添加';
        return;
      }
      if (this.selComponent === this.parentMaterialId.trim()) {
        this.msgType = 'err'; this.message = '元件料号不能与主件料号相同';
        return;
      }
      const opt = this.materialOptions.find(o => o.material_id === this.selComponent);
      this.items.push({
        component_material: this.selComponent,
        material_name: opt ? opt.material_name : '',
        quantity: this.selQty
      });
      this.selComponent = '';
      this.selQty = 1;
      this.message = '';
    },
    removeItem(i) {
      this.items.splice(i, 1);
    },
    async submit() {
      this.message = '';
      if (!this.parentMaterialId.trim()) {
        this.msgType = 'err'; this.message = '主件料号不能为空';
        return;
      }
      if (this.items.length === 0) {
        this.msgType = 'err'; this.message = '请至少添加一个元件';
        return;
      }
      // 用量必须为正数
      const badQty = this.items.find(it => !it.quantity || isNaN(Number(it.quantity)) || Number(it.quantity) <= 0);
      if (badQty) {
        this.msgType = 'err'; this.message = `用量必须为正数: ${badQty.component_material}`;
        return;
      }
      const res = await this.ws.send('createBom', {
        parent_material_id: this.parentMaterialId.trim(),
        items: this.items.map(it => ({ component_material: it.component_material, quantity: Number(it.quantity) }))
      });
      if (!res.success) {
        this.msgType = 'err'; this.message = res.message;
        return;
      }
      this.msgType = 'ok';
      this.message = `BOM已新增：${this.parentMaterialId}（${res.data.count} 个元件）`;
      setTimeout(() => this.nav('page-bom'), 1200);
    },
    back() { this.nav('page-bom'); }
  },
  mounted() { this.loadMaterials(); },
  template: `
    <div>
      <div class="page-title">新增 BOM</div>
      <div class="panel">
        <div class="form-row">
          <label>主件料号：</label>
          <select v-model="parentMaterialId">
            <option value="">请选择</option>
            <option v-for="m in materialOptions" :key="m.material_id" :value="m.material_id">{{ m.material_id }} - {{ m.material_name }}</option>
          </select>
        </div>
      </div>

      <div class="panel" style="margin-top:16px;">
        <h3 style="margin-bottom:8px;font-size:14px;color:#1565c0;">添加元件</h3>
        <div class="form-row">
          <label>元件料号：</label>
          <select v-model="selComponent">
            <option value="">请选择</option>
            <option v-for="m in materialOptions" :key="m.material_id" :value="m.material_id">{{ m.material_id }} - {{ m.material_name }}</option>
          </select>
          <label style="margin-left:12px;">用量：</label>
          <input v-model.number="selQty" type="number" style="width:80px;" placeholder="数量">
          <button @click="addItem">添加</button>
        </div>

        <table style="margin-top:12px;">
          <thead>
            <tr><th>序号</th><th>元件料号</th><th>元件名称</th><th>用量</th><th>操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="(it, i) in items" :key="i">
              <td>{{ i + 1 }}</td>
              <td>{{ it.component_material }}</td>
              <td>{{ it.material_name }}</td>
              <td>{{ it.quantity }}</td>
              <td><a href="javascript:;" class="del-link" @click="removeItem(i)">删除</a></td>
            </tr>
            <tr v-if="!items.length"><td colspan="5" style="text-align:center;color:#909399;">暂无元件</td></tr>
          </tbody>
        </table>
      </div>

      <div class="panel" style="margin-top:16px;">
        <div v-if="message" :class="['tip', msgType]">{{ message }}</div>
        <button @click="submit">保存</button>
        <button @click="back">返回</button>
      </div>
    </div>
  `
});

// ========== 扫码装配 ==========
Vue.component('page-assemble', {
  props: ['ws'],
  data() {
    return {
      mainSn: '',
      componentSn: '',
      mainInfo: null,   // 主件信息 + BOM元件清单
      slots: [],        // BOM 按用量展开的槽位：{ component_material, component_material_name, component_sn('' = 未扫) }
      message: '',
      msgType: '',
      msgTarget: 'main'     // 消息显示位置：main-主件扫码框下 / component-元件扫码框下
    };
  },
  computed: {
    filledCount() {
      return this.slots.filter(s => s.component_sn).length;
    }
  },
  methods: {
    async onScanMain() {
      this.message = '';
      this.msgTarget = 'main';
      this.mainSn = (this.mainSn || '').trim();
      if (!this.mainSn) return;
      const res = await this.ws.send('scanMainSn', this.mainSn);
      if (!res.success) {
        this.mainInfo = null;
        this.slots = [];
        this.msgType = 'err';
        this.message = res.message;
        return;
      }
      this.mainInfo = res.data;
      // BOM 按用量展开为槽位行
      const slots = [];
      (res.data.components || []).forEach(c => {
        for (let i = 0; i < Number(c.quantity); i++) {
          slots.push({
            component_material: c.component_material,
            component_material_name: c.component_material_name,
            component_sn: '',
            scan_time: null
          });
        }
      });
      this.slots = slots;
      this.msgType = 'ok';
      this.message = `主件：${this.mainInfo.material_name}，应扫元件 ${slots.length} 个`;
    },
    async onScanComponent() {
      this.message = '';
      this.msgTarget = 'component';
      this.componentSn = (this.componentSn || '').trim();
      if (!this.componentSn || !this.mainInfo) return;
      const sn = this.componentSn;
      // 本单槽位内查重
      if (this.slots.some(s => s.component_sn === sn)) {
        this.msgType = 'err';
        this.message = `该元件已在本单中：${sn}`;
        return;
      }
      const res = await this.ws.send('scanComponentSn', {
        sn: sn,
        parent_material_id: this.mainInfo.material_id
      });
      if (!res.success) {
        this.msgType = 'err';
        this.message = res.message;
        return;
      }
      // 匹配该料号的第一个空槽位写入
      const slot = this.slots.find(s => s.component_material === res.data.material_id && !s.component_sn);
      if (!slot) {
        const need = this.slots.filter(s => s.component_material === res.data.material_id).length;
        this.msgType = 'err';
        this.message = `该元件已扫描够数：${res.data.material_name}（需 ${need} 个）`;
        return;
      }
      slot.component_sn = sn;
      slot.scan_time = this.formatTime(new Date());
      this.componentSn = '';
      this.msgType = 'ok';
      this.message = `已扫描 ${this.filledCount}/${this.slots.length}：${res.data.material_name}`;
    },
    // 格式化时间为 YYYY-MM-DD HH:mm:ss
    formatTime(d) {
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    },
    // 清除槽位中的元件SN（可重新扫描）
    clearSlot(i) {
      this.msgTarget = 'component';
      const sn = this.slots[i].component_sn;
      if (!sn) return;
      this.slots[i].component_sn = '';
      this.slots[i].scan_time = null;
      this.msgType = 'ok';
      this.message = `已清除：${sn}`;
    },
    async submit() {
      this.msgTarget = 'component';
      const res = await this.ws.send('createAssemble', {
        main_sn: this.mainInfo.main_sn,
        main_material_id: this.mainInfo.material_id,
        status: 30,
        components: this.slots.map(s => ({
          component_sn: s.component_sn,
          component_material_id: s.component_material,
          scan_time: s.scan_time || null
        }))
      });
      if (res.success) {
        this.msgType = 'ok';
        this.message = `装配单提交成功，单号：${res.data.record_id}，进度 ${this.filledCount}/${this.slots.length}（${res.data.is_complete == 1 ? '已完成' : '未完成'}）`;
        this.mainSn = '';
        this.componentSn = '';
        this.mainInfo = null;
        this.slots = [];
      } else {
        this.msgType = 'err';
        this.message = res.message;
      }
    }
  },
  template: `
    <div>
      <div class="page-title">扫码装配</div>
      <div class="panel">
        <div class="form-row">
          <label>主件SN：</label>
          <input v-model="mainSn" placeholder="扫描主件条码" @keyup.enter="onScanMain">
          <button @click="onScanMain">扫描</button>
        </div>

        <div v-if="message && msgTarget === 'main'" :class="['tip', msgType]">{{ message }}</div>

        <!-- 主件信息：始终展示 -->
        <div style="margin-top:16px;">
          <div class="form-row"><label>料号：</label>{{ mainInfo ? mainInfo.material_id : '-' }}</div>
          <div class="form-row"><label>物料名称：</label>{{ mainInfo ? mainInfo.material_name : '-' }}</div>
          <div class="form-row"><label>规格：</label>{{ mainInfo ? mainInfo.material_spec : '-' }}</div>
        </div>

        <!-- 元件扫描：始终展示 -->
        <div style="margin-top:16px;">
          <div class="form-row">
            <label>元件SN：</label>
            <input v-model="componentSn" placeholder="扫描元件条码" @keyup.enter="onScanComponent" :disabled="!mainInfo">
            <button @click="onScanComponent" :disabled="!mainInfo">扫描</button>
          </div>
          <div v-if="message && msgTarget === 'component'" :class="['tip', msgType]">{{ message }}</div>
        </div>

        <!-- BOM元件清单（槽位）：应扫/未扫一目了然 -->
        <div style="margin-top:16px;">
          <h3 style="margin-bottom:8px;font-size:14px;color:#1565c0;">
            BOM元件清单
            <span v-if="mainInfo" style="font-weight:400;color:#909399;font-size:13px;">（已扫 {{ filledCount }} / 应扫 {{ slots.length }}）</span>
          </h3>
          <table>
            <thead>
              <tr><th>序号</th><th>元件料号</th><th>元件名称</th><th>元件SN</th><th>扫描时间</th><th>状态</th><th>操作</th></tr>
            </thead>
            <tbody>
              <tr v-for="(s, i) in slots" :key="i">
                <td>{{ i + 1 }}</td>
                <td>{{ s.component_material }}</td>
                <td>{{ s.component_material_name }}</td>
                <td :style="{color: s.component_sn ? '#059669' : '#c0c4cc'}">{{ s.component_sn || '（未扫）' }}</td>
                <td style="color:#909399;font-size:12px;white-space:nowrap;">{{ s.scan_time ? String(s.scan_time).slice(0,19).replace('T',' ') : '-' }}</td>
                <td>
                  <span v-if="s.component_sn" style="color:#059669;font-weight:600;">已扫</span>
                  <span v-else style="color:#d97706;">未扫</span>
                </td>
                <td><a v-if="s.component_sn" href="javascript:;" class="del-link" @click="clearSlot(i)">清除</a></td>
              </tr>
              <tr v-if="!mainInfo">
                <td colspan="7" style="text-align:center;color:#909399;">请先扫描主件SN加载BOM清单</td>
              </tr>
              <tr v-else-if="!slots.length">
                <td colspan="7" style="text-align:center;color:#909399;">该主件无BOM元件</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top:14px;">
            <button @click="submit" :disabled="!mainInfo || filledCount === 0">提交</button>
          </div>
        </div>
      </div>
    </div>
  `
});

// ========== 装配记录查询 ==========
Vue.component('page-assemble-records', {
  props: ['ws', 'nav'],
  data() {
    return {
      filters: { main_sn: '', main_material_id: '', operator: '', is_complete: '', date_start: '', date_end: '', component_sn: '', component_material: '' },
      page: 1,
      pageSize: 10,
      total: 0,
      list: [],
      selectedIds: []
    };
  },
  computed: {
    allChecked: {
      get() { return this.list.length > 0 && this.list.every(r => this.selectedIds.includes(r.id)); },
      set(v) { this.selectedIds = v ? this.list.map(r => r.id) : []; }
    }
  },
  methods: {
    async search() {
      const res = await this.ws.send('queryAssembleList', { ...this.filters, page: this.page, page_size: this.pageSize });
      if (res.success) {
        this.list = res.data.list;
        this.total = res.data.total;
        this.selectedIds = [];
      }
    },
    doSearch() {
      if (this.filters.main_sn) this.filters.main_sn = this.filters.main_sn.trim();
      this.page = 1; this.search();
    },
    onPageChange(p) { this.page = p; this.search(); },
    onPageSizeChange(s) { this.pageSize = s; this.page = 1; this.search(); },
    async batchDelete() {
      if (!this.selectedIds.length) return;
      const ok = confirm(`确认删除选中的 ${this.selectedIds.length} 条装配记录？此操作不可恢复。`);
      if (!ok) return;
      const res = await this.ws.send('deleteAssembleRecords', { ids: this.selectedIds });
      if (res.success) {
        alert(`已删除 ${res.data.deleted} 条记录`);
        await this.search();
      } else {
        alert('删除失败：' + res.message);
      }
    }
  },
  mounted() { this.search(); },
  activated() {
    // keep-alive 重新激活：保留筛选条件，仅按原条件刷新数据（首次激活不重复查询）
    if (this._actOnce) this.search(); else this._actOnce = true;
  },
  template: `
    <div>
      <div class="page-title">装配记录查询</div>
      <div class="panel">
        <div class="form-row"><label>主件SN：</label><input v-model="filters.main_sn" placeholder="模糊查询" @keyup.enter="doSearch"></div>
        <div class="form-row"><label>主件料号：</label><input v-model="filters.main_material_id" placeholder="模糊查询" @keyup.enter="doSearch"></div>
        <div class="form-row"><label>元件SN：</label><input v-model="filters.component_sn" placeholder="查找包含该元件的装配单" @keyup.enter="doSearch"></div>
        <div class="form-row"><label>元件料号：</label><input v-model="filters.component_material" placeholder="查找包含该元件的装配单" @keyup.enter="doSearch"></div>
        <div class="form-row"><label>操作员：</label><input v-model="filters.operator" placeholder="模糊查询" @keyup.enter="doSearch"></div>
        <div class="form-row">
          <label>是否完成：</label>
          <select v-model="filters.is_complete">
            <option value="">全部</option>
            <option value="1">已完成</option>
            <option value="0">未完成</option>
          </select>
        </div>
        <div class="form-row">
          <label>装配日期：</label>
          <input type="date" v-model="filters.date_start"> 至
          <input type="date" v-model="filters.date_end">
        </div>
        <button @click="doSearch">查询</button>
        <button v-if="$root.hasFuncPerm('func-assemble-delete') && selectedIds.length > 0" class="danger" @click="batchDelete">批量删除（已选 {{ selectedIds.length }} 条）</button>
      </div>

      <div class="panel" style="margin-top:16px;">
        <table>
          <thead>
            <tr>
              <th style="width:36px;"><input type="checkbox" v-model="allChecked" @click.stop></th>
              <th>主件SN</th><th>主件料号</th><th>物料名称</th><th>主件规格</th><th>BOM版本</th><th>是否完成</th><th>装配日期</th><th>操作员</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td @click.stop><input type="checkbox" v-model="selectedIds" :value="r.id"></td>
              <td><a href="javascript:;" @click="nav('page-assemble-detail', { sn: r.main_sn })" style="color:#1e88e5;text-decoration:none;">{{ r.main_sn }}</a></td>
              <td>{{ r.main_material_id }}</td>
              <td>{{ r.main_material_name || '-' }}</td>
              <td>{{ r.main_material_spec || '-' }}</td>
              <td><span v-if="r.bom_version > 0" style="color:#409eff;font-weight:600;">v{{ r.bom_version }}</span><span v-else style="color:#c0c4cc;">-</span></td>
              <td :style="{color: r.is_complete == 1 ? '#059669' : '#d97706', fontWeight: 600}">{{ r.is_complete == 1 ? '已完成' : '未完成' }}（{{ r.scanned_qty || 0 }}/{{ r.required_qty || 0 }}）</td>
              <td>{{ r.assemble_date ? String(r.assemble_date).slice(0,10) : '-' }}</td>
              <td>{{ r.operator || '-' }}</td>
            </tr>
            <tr v-if="!list.length"><td colspan="9" style="text-align:center;color:#909399;">暂无数据</td></tr>
          </tbody>
        </table>
        <vue-pager :page="page" :page-size="pageSize" :total="total"
                   @change="onPageChange" @size-change="onPageSizeChange"></vue-pager>
        <div style="margin-top:8px;color:#909399;">点击主件SN查看明细</div>
      </div>
    </div>
  `
});

// ========== 装配单明细 ==========
Vue.component('page-assemble-detail', {
  props: ['ws', 'nav', 'params', 'origin'],
  data() {
    return {
      record: null,
      bom: [],
      bomVersions: [],     // 该主件可用的 BOM 版本号列表
      slots: [],           // 槽位：{ id, component_material_id, material_name, component_sn('' = 未扫), created_time }
      componentSn: '',
      message: '',
      msgType: '',
      msgTarget: 'top',   // top-页面顶部 / component-扫码框下
      editing: false,
      saving: false,
      // 历史版本弹层
      historyOpen: false,
      historyList: [],
      historyLoading: false,
      historyVersion: null,  // 当前查看的版本明细
      historyLoadingVersion: false
    };
  },
  computed: {
    // 各元件料号对应的 BOM 信息（名称 / 应扫数量）
    bomMap() {
      const m = {};
      this.bom.forEach(c => { m[c.component_material] = c; });
      return m;
    },
    filledCount() {
      return this.slots.filter(s => s.component_sn).length;
    }
  },
  methods: {
    // 由 BOM 展开槽位 + 已扫明细回填，组装成「应扫/已扫」槽位视图
    buildSlots(detList) {
      const slots = [];
      this.bom.forEach(b => {
        for (let i = 0; i < Number(b.quantity); i++) {
          slots.push({
            id: null,
            component_material_id: b.component_material,
            material_name: b.component_material_name || '',
            material_spec: b.component_material_spec || '',
            component_sn: '',
            created_time: null,
            scan_time: null
          });
        }
      });
      (detList || []).forEach(d => {
        if (!d.component_sn) return; // 库里的未扫槽位行，视图槽位已存在
        const slot = slots.find(s => s.component_material_id === d.component_material_id && !s.component_sn);
        if (slot) {
          slot.id = d.id;
          slot.component_sn = d.component_sn;
          slot.created_time = d.created_time;
          slot.scan_time = d.scan_time;
        } else {
          // 超出当前 BOM 用量的已扫行（BOM 后续被改过），追加展示
          slots.push({
            id: d.id,
            component_material_id: d.component_material_id,
            material_name: (this.bomMap[d.component_material_id] || {}).component_material_name || '',
            material_spec: (this.bomMap[d.component_material_id] || {}).component_material_spec || '',
            component_sn: d.component_sn,
            created_time: d.created_time,
            scan_time: d.scan_time
          });
        }
      });
      this.slots = slots;
    },
    async load() {
      const res = await this.ws.send('getAssembleDetail', this.params.sn);
      if (res.success) {
        this.record = res.data.record;
        this.bom = res.data.bom || [];
        this.bomVersions = res.data.bom_versions || [];
        this.buildSlots(res.data.details);
      } else {
        this.msgTarget = 'top';
        this.message = res.message;
        this.msgType = 'err';
      }
    },
    // 切换 BOM 版本：拉新 BOM → 重排槽位 → 已扫 SN 自动匹配到新槽位
    async onChangeBomVersion(v) {
      console.log('[DEBUG onChangeBomVersion] v=', v, 'typeof=', typeof v, 'record.bom_version=', this.record.bom_version, 'bomVersions=', this.bomVersions, 'editing=', this.editing);
      if (!this.editing) return;
      const version = Number(v);
      console.log('[DEBUG onChangeBomVersion] version=', version, 'typeof=', typeof version);
      const res = await this.ws.send('checkMainMaterial', { mid: this.record.main_material_id, bom_version: version });
      if (!res.success) {
        this.msgTarget = 'top';
        this.msgType = 'err';
        this.message = res.message;
        return;
      }
      // 暂存已扫 SN（槽位会重建，但 SN 要保留）
      const filledSnList = this.slots.filter(s => s.component_sn).map(s => ({
        component_sn: s.component_sn,
        component_material_id: s.component_material_id,
        created_time: s.created_time,
        scan_time: s.scan_time
      }));
      // 更新 bom → 重建槽位 → 自动填回 SN
      this.bom = res.data.components || [];
      this.record.bom_version = version;
      this.buildSlotsWithFill(filledSnList);
    },
    // 在新 BOM 上展开槽位 + 回填已扫 SN（旧 SN 如对应元件在新 BOM 里则填入，否则单独追加显示）
    buildSlotsWithFill(filledSnList) {
      const slots = [];
      const newBomMap = {};
      this.bom.forEach(b => { newBomMap[b.component_material] = true; });
      this.bom.forEach(b => {
        for (let i = 0; i < Number(b.quantity); i++) {
          slots.push({
            id: null,
            component_material_id: b.component_material,
            material_name: b.component_material_name || '',
            material_spec: b.component_material_spec || '',
            component_sn: '',
            created_time: null,
            scan_time: null
          });
        }
      });
      // 只把能填进新 BOM 空槽的 SN 保留；其余归入 dropped
      const dropped = [];
      (filledSnList || []).forEach(d => {
        const slot = slots.find(s => s.component_material_id === d.component_material_id && !s.component_sn);
        if (slot) {
          slot.component_sn = d.component_sn;
          slot.created_time = d.created_time;
          slot.scan_time = d.scan_time;
        } else if (newBomMap[d.component_material_id]) {
          // 料号在新 BOM 里但槽满了（BOM 缩量）
          dropped.push({ ...d, reason: '新BOM用量减少，无剩余槽位' });
        } else {
          // 旧 SN 的料号在新 BOM 里完全没了（BOM 删掉了这个元件）
          dropped.push({ ...d, reason: '新BOM中已无此元件' });
        }
      });
      this.slots = slots;
      // 提示被抛弃的 SN —— 它们直接从 slots 中移除，保存时不会提交
      if (dropped.length > 0) {
        const ids = dropped.map(u => u.component_sn + '（' + u.reason + '）').join('\n  · ');
        this.message = '已切换 BOM 版本，以下已扫 SN 因新 BOM 不再需要而被自动抛弃：\n  · ' + ids;
        this.msgType = 'warn';
      } else {
        this.message = `已切换到 BOM v${this.record.bom_version}，槽位已重排`;
        this.msgType = 'ok';
      }
    },
    startEdit() {
      this.editing = true;
      this.componentSn = '';
      this.message = '';
      this.msgTarget = 'component';
    },
    async cancelEdit() {
      this.editing = false;
      this.componentSn = '';
      this.message = '';
      await this.load(); // 重新加载，丢弃未保存的改动
    },
    // 清除槽位SN（保存前可重新扫描）
    clearSlot(i) {
      const s = this.slots[i];
      if (!s.component_sn) return;
      const sn = s.component_sn;
      s.component_sn = '';
      s.id = null;
      s.created_time = null;
      s.scan_time = null;
      this.msgTarget = 'component';
      this.msgType = 'ok';
      this.message = `已清除：${sn}`;
    },
    // 格式化时间为 YYYY-MM-DD HH:mm:ss
    formatTime(d) {
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    },
    // 扫描元件：匹配该料号的第一个未扫槽位写入（查重排除本单）
    async onScanComponent() {
      this.componentSn = (this.componentSn || '').trim();
      const sn = this.componentSn;
      if (!sn) return;
      this.msgTarget = 'component';
      this.message = '';
      if (this.slots.some(s => s.component_sn === sn)) {
        this.msgType = 'err';
        this.message = `该元件已在清单中：${sn}`;
        return;
      }
      const res = await this.ws.send('scanComponentSn', {
        sn: sn,
        parent_material_id: this.record.main_material_id,
        exclude_record_id: this.record.id
      });
      if (!res.success) {
        this.msgType = 'err';
        this.message = res.message;
        return;
      }
      const mid = res.data.material_id;
      const slot = this.slots.find(s => s.component_material_id === mid && !s.component_sn);
      if (!slot) {
        const need = this.bomMap[mid] ? Number(this.bomMap[mid].quantity) : 0;
        this.msgType = 'err';
        this.message = `该元件已扫描够数：${res.data.material_name}（需 ${need} 个）`;
        return;
      }
      slot.component_sn = sn;
      slot.scan_time = this.formatTime(new Date());
      slot.id = null; // 保存时由后端决定保留/新建
      this.componentSn = '';
      this.msgType = 'ok';
      this.message = `已扫描 ${this.filledCount}/${this.slots.length}：${res.data.material_name}`;
    },
    async save() {
      console.log('[DEBUG save] record.bom_version=', this.record.bom_version, 'typeof=', typeof this.record.bom_version, 'slots.length=', this.slots.length);
      this.saving = true;
      const res = await this.ws.send('updateAssembleDetail', {
        main_sn: this.record.main_sn,
        bom_version: this.record.bom_version,
        // 传完整槽位清单（含空）；buildSlotsWithFill 已把流浪 SN 从 slots 中移除
        components: this.slots.map(s => ({
          component_sn: s.component_sn || '',
          component_material_id: s.component_material_id,
          scan_time: s.scan_time || null
        }))
      });
      this.saving = false;
      this.msgTarget = 'component';
      if (res.success) {
        this.editing = false;
        this.componentSn = '';
        await this.load();
        this.msgType = 'ok';
        this.message = `保存成功（${res.data.is_complete == 1 ? '已完成' : '未完成'} ${this.record ? this.record.scanned_qty : ''}/${this.record ? this.record.required_qty : ''}）`;
      } else {
        this.msgType = 'err';
        this.message = res.message;
      }
    },
    openRecord(s) {
      if (this.editing || !s.component_sn) return;
      this.nav('page-record-detail', { sn: s.component_sn });
    },
    back() { this.nav('page-assemble-records'); },
    // 打开历史版本弹层
    async openHistory() {
      if (!this.record) return;
      this.historyOpen = true;
      this.historyLoading = true;
      this.historyVersion = null;
      const res = await this.ws.send('queryAssembleHistory', { main_sn: this.record.main_sn });
      this.historyLoading = false;
      if (res.success) this.historyList = res.data.list;
      else this.historyList = [];
    },
    async loadHistoryVersion(v) {
      this.historyLoadingVersion = true;
      const res = await this.ws.send('getAssembleHistoryVersion', { record_id: this.record.id, version_no: v });
      this.historyLoadingVersion = false;
      if (res.success) {
        this.historyVersion = res.data;
      } else {
        alert(res.message);
      }
    }
  },
  watch: {
    // 其他页面（如条码档案）复用本页签打开不同主件 SN 时，重新加载数据
    'params.sn'(v) { if (v) this.load(); }
  },
  mounted() { this.load(); },
  template: `
    <div>
      <div class="page-title">装配单明细</div>

      <div v-if="message && msgTarget === 'top'" :class="['tip', msgType]">{{ message }}</div>

      <template v-if="record">
        <!-- 单头信息 -->
        <div class="panel">
          <div class="form-row"><label>单据ID：</label>{{ record.id }}</div>
          <div class="form-row"><label>主件SN：</label>{{ record.main_sn }}</div>
          <div class="form-row"><label>主件料号：</label>{{ record.main_material_id }}</div>
          <div class="form-row"><label>BOM版本：</label>
            <template v-if="!editing">
              <span v-if="record.bom_version > 0" style="color:#409eff;font-weight:600;">v{{ record.bom_version }}</span>
              <span v-else style="color:#c0c4cc;">-</span>
            </template>
            <template v-else>
              <select v-model.number="record.bom_version" @change="onChangeBomVersion(record.bom_version)">
                <option v-for="v in bomVersions" :key="v" :value="v">v{{ v }}</option>
              </select>
            </template>
          </div>
          <div class="form-row"><label>物料名称：</label>{{ record.material_name || '-' }}</div>
          <div class="form-row"><label>规格：</label>{{ record.material_spec || '-' }}</div>
          <div class="form-row"><label>是否完成：</label><span :style="{color: record.is_complete == 1 ? '#059669' : '#d97706', fontWeight: 600}">{{ record.is_complete == 1 ? '已完成' : '未完成' }}（{{ record.scanned_qty || 0 }}/{{ record.required_qty || 0 }}）</span></div>
          <div class="form-row"><label>装配日期：</label>{{ record.assemble_date ? String(record.assemble_date).slice(0,10) : '-' }}</div>
          <div class="form-row"><label>操作员：</label>{{ record.operator || '-' }}</div>
          <div class="form-row"><label>创建人：</label>{{ record.create_by || '-' }}</div>
          <div class="form-row"><label>备注：</label>{{ record.remark || '-' }}</div>
          <div class="form-row"><label>创建时间：</label>{{ record.created_time ? String(record.created_time).slice(0,19).replace('T',' ') : '-' }}</div>
        </div>

        <!-- 元件明细列表 -->
        <div class="panel" style="margin-top:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <h3 style="margin:0;font-size:14px;color:#1565c0;">
              元件明细
              <span style="font-weight:400;color:#909399;font-size:13px;">
                （已扫 {{ filledCount }} / 应扫 {{ slots.length }}）
              </span>
            </h3>
            <span>
              <button @click="back">返回列表</button>
              <button v-if="!editing" @click="openHistory">历史版本</button>
              <button v-if="$root.hasFuncPerm('func-assemble-edit') && !editing" @click="startEdit">修改</button>
              <template v-else>
                <button @click="save" :disabled="saving">{{ saving ? '保存中…' : '保存' }}</button>
                <button @click="cancelEdit" :disabled="saving" style="margin-left:8px;background:#909399;">取消</button>
              </template>
            </span>
          </div>

          <!-- 编辑态：扫描元件匹配未扫槽位 -->
          <div v-if="editing" class="form-row" style="margin-bottom:8px;">
            <label>扫描元件：</label>
            <input v-model="componentSn" placeholder="扫描元件条码后回车" @keyup.enter="onScanComponent">
            <button @click="onScanComponent">扫描</button>
          </div>
          <div v-if="message && msgTarget === 'component'" :class="['tip', msgType]" style="margin-bottom:8px;">{{ message }}</div>

          <table>
            <thead>
              <tr>
                <th>序号</th><th>元件料号</th><th>元件名称</th><th>元件规格</th><th>元件SN</th><th>扫描时间</th><th>状态</th>
                <th v-if="editing">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s, i) in slots" :key="i">
                <td>{{ i + 1 }}</td>
                <td>{{ s.component_material_id }}</td>
                <td>{{ s.material_name || '-' }}</td>
                <td>{{ s.material_spec || '-' }}</td>
                <td :style="{color: s.component_sn ? '#059669' : '#c0c4cc', whiteSpace: 'nowrap'}">
                  <a v-if="s.component_sn && !editing" href="javascript:;" @click="openRecord(s)" style="color:#059669;text-decoration:none;">{{ s.component_sn }}</a>
                  <span v-else>{{ s.component_sn || '（未扫）' }}</span>
                </td>
                <td style="color:#909399;font-size:12px;white-space:nowrap;">{{ s.scan_time ? String(s.scan_time).slice(0,19).replace('T',' ') : '-' }}</td>
                <td>
                  <span v-if="s.component_sn" style="color:#059669;font-weight:600;">已扫</span>
                  <span v-else style="color:#d97706;">未扫</span>
                </td>
                <td v-if="editing">
                  <button v-if="s.component_sn" style="background:#dd4b4b;padding:2px 10px;" @click.stop="clearSlot(i)">清除</button>
                </td>
              </tr>
              <tr v-if="!slots.length"><td :colspan="editing ? 8 : 7" style="text-align:center;color:#909399;">该主件无BOM元件</td></tr>
            </tbody>
          </table>
          <div v-if="!editing" style="margin-top:12px;color:#909399;">点击元件SN查看该元件的检验明细</div>
          <div v-if="editing" style="margin-top:12px;color:#909399;">清除后可重新扫描元件SN填入未扫槽位，保存时生效。</div>
        </div>

      </template>

      <!-- 历史版本弹层 -->
      <div v-if="historyOpen" :style="{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.4)',zIndex:999}" @click.self="historyOpen = false">
        <div :style="{position:'absolute',top:'5%',left:'10%',right:'10%',bottom:'10%',background:'#fff',borderRadius:'4px',display:'flex',flexDirection:'column'}" @click.stop>
          <div :style="{padding:'12px 16px',borderBottom:'1px solid #e4e7ed',display:'flex',justifyContent:'space-between',alignItems:'center'}">
            <h3 style="margin:0;font-size:15px;">装配单历史版本 — {{ record ? record.main_sn : '' }}</h3>
            <button @click="historyOpen = false" class="mini" style="background:#909399;">关闭</button>
          </div>
          <div :style="{flex:1,display:'flex',overflow:'hidden'}">
            <!-- 左侧：版本列表 -->
            <div :style="{width:'260px',borderRight:'1px solid #e4e7ed',overflowY:'auto',background:'#fafafa'}">
              <div v-if="historyLoading" style="padding:16px;text-align:center;color:#909399;">加载中…</div>
              <div v-else-if="!historyList.length" style="padding:16px;color:#909399;font-size:13px;">暂无修改历史<br><span style="color:#c0c4cc;font-size:12px;">（首次修改后自动产生 v1 版本）</span></div>
              <div v-for="v in historyList" :key="v.version_no"
                   @click="loadHistoryVersion(v.version_no)"
                   :style="{padding:'10px 12px',borderBottom:'1px solid #ebeef5',cursor:'pointer',fontSize:'13px',background:historyVersion && historyVersion.version_no === v.version_no ? '#ecf5ff' : '',borderLeft: historyVersion && historyVersion.version_no === v.version_no ? '3px solid #409eff' : '3px solid transparent'}">
                <div><b>v{{ v.version_no }}</b> <span style="color:#909399;">（{{ v.detail_count }} 条元件）</span></div>
                <div style="color:#606266;margin-top:2px;">变更时间：{{ v.change_time ? String(v.change_time).slice(0,19).replace('T',' ') : '' }}</div>
                <div style="color:#909399;margin-top:2px;">修改人：{{ v.change_by || '-' }}</div>
              </div>
            </div>
            <!-- 右侧：历史明细 -->
            <div :style="{flex:1,overflowY:'auto',padding:'16px'}" v-if="historyVersion">
              <div style="margin-bottom:12px;color:#606266;font-size:13px;">
                版本 <b>v{{ historyVersion.version_no }}</b>（修改前明细） &nbsp; 变更时间 {{ historyVersion.change_time ? String(historyVersion.change_time).slice(0,19).replace('T',' ') : '-' }} &nbsp; 修改人 {{ historyVersion.change_by || '-' }}
              </div>
              <table style="margin-bottom:16px;">
                <thead><tr><th>序号</th><th>元件SN</th><th>元件料号</th><th>元件名称</th><th>原创建时间</th></tr></thead>
                <tbody>
                  <tr v-for="(d, i) in historyVersion.details" :key="d.id || i">
                    <td>{{ i + 1 }}</td>
                    <td :style="{color: d.component_sn ? 'inherit' : '#c0c4cc'}">{{ d.component_sn || '（未扫）' }}</td>
                    <td>{{ d.component_material_id }}</td>
                    <td>{{ (bomMap[d.component_material_id] || {}).component_material_name || '-' }}</td>
                    <td>{{ d.origin_created_time ? String(d.origin_created_time).slice(0,19).replace('T',' ') : '-' }}</td>
                  </tr>
                  <tr v-if="!historyVersion.details.length"><td colspan="5" style="text-align:center;color:#909399;">该版本修改前无元件</td></tr>
                </tbody>
              </table>
            </div>
            <div v-else :style="{flex:1,padding:'24px',color:'#909399',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}">
              <span v-if="historyLoadingVersion">加载明细中…</span>
              <span v-else>请在左侧选择版本查看修改前明细</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
});

// ========== 条码格式维护（全局唯一配置，仅调整元素位置与尺寸） ==========
Vue.component('page-barcode-format', {
  props: ['ws'],
  data() {
    return {
      form: null,   // 条码格式配置
      qrUrl: '',    // 预览用二维码
      message: '',
      msgType: ''
    };
  },
  methods: {
    async load() {
      const res = await this.ws.send('getBarcodeRule', {});
      if (res.success) this.form = { ...res.data };
    },
    genQr() {
      const qr = qrcode(0, 'M');
      qr.addData('DEMO#20261010#0001');
      qr.make();
      this.qrUrl = qr.createDataURL(4, 0);
    },
    async save() {
      this.message = '';
      const res = await this.ws.send('updateBarcodeRule', this.form);
      if (!res.success) {
        this.msgType = 'err'; this.message = res.message;
        return;
      }
      this.msgType = 'ok'; this.message = '保存成功';
      this.form = { ...res.data };
      setTimeout(() => { this.message = ''; }, 1200);
    }
  },
  mounted() { this.genQr(); this.load(); },
  template: `
    <div>
      <div class="page-title">条码格式</div>
      <template v-if="form">
        <div class="panel">
          <h3 style="margin-bottom:12px;font-size:14px;color:#1565c0;">标签尺寸（mm）</h3>
          <div class="form-row">
            <label>宽度：</label>
            <input v-model.number="form.label_width" type="number" style="width:100px;">
            <label style="margin-left:16px;width:auto;">高度：</label>
            <input v-model.number="form.label_height" type="number" style="width:100px;">
          </div>
        </div>

        <div class="panel" style="margin-top:16px;">
          <h3 style="margin-bottom:12px;font-size:14px;color:#1565c0;">元素位置与尺寸（位置单位 mm，字号单位 pt）</h3>
          <table style="width:auto;">
            <thead>
              <tr><th>元素</th><th>X</th><th>Y</th><th>尺寸</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>二维码</td>
                <td><input v-model.number="form.qr_x" type="number" style="width:80px;"></td>
                <td><input v-model.number="form.qr_y" type="number" style="width:80px;"></td>
                <td><input v-model.number="form.qr_size" type="number" style="width:80px;"> mm</td>
              </tr>
              <tr>
                <td>料号</td>
                <td><input v-model.number="form.mid_x" type="number" style="width:80px;"></td>
                <td><input v-model.number="form.mid_y" type="number" style="width:80px;"></td>
                <td><input v-model.number="form.mid_font" type="number" style="width:80px;"> pt</td>
              </tr>
              <tr>
                <td>日期</td>
                <td><input v-model.number="form.date_x" type="number" style="width:80px;"></td>
                <td><input v-model.number="form.date_y" type="number" style="width:80px;"></td>
                <td><input v-model.number="form.date_font" type="number" style="width:80px;"> pt</td>
              </tr>
              <tr>
                <td>流水</td>
                <td><input v-model.number="form.serial_x" type="number" style="width:80px;"></td>
                <td><input v-model.number="form.serial_y" type="number" style="width:80px;"></td>
                <td><input v-model.number="form.serial_font" type="number" style="width:80px;"> pt</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="panel" style="margin-top:16px;">
          <h3 style="margin-bottom:12px;font-size:14px;color:#1565c0;">实时预览</h3>
          <div :style="{ width: form.label_width + 'mm', height: form.label_height + 'mm', position: 'relative', border: '1px solid #999', background: '#fff' }">
            <img v-if="qrUrl" :src="qrUrl" :style="{ position: 'absolute', left: form.qr_x + 'mm', top: form.qr_y + 'mm', width: form.qr_size + 'mm', height: form.qr_size + 'mm' }">
            <div :style="{ position: 'absolute', left: form.mid_x + 'mm', top: form.mid_y + 'mm', fontSize: form.mid_font + 'pt' }">LENS-001</div>
            <div :style="{ position: 'absolute', left: form.date_x + 'mm', top: form.date_y + 'mm', fontSize: form.date_font + 'pt' }">20261010</div>
            <div :style="{ position: 'absolute', left: form.serial_x + 'mm', top: form.serial_y + 'mm', fontSize: form.serial_font + 'pt' }">0001</div>
          </div>
          <div v-if="message" :class="['tip', msgType]">{{ message }}</div>
          <div style="margin-top:12px;">
            <button v-if="$root.hasFuncPerm('func-barcode-format-edit')" @click="save">保存</button>
          </div>
        </div>
      </template>
    </div>
  `
});

// ========== 条码打印 ==========
Vue.component('page-barcode-print', {
  props: ['ws'],
  data() {
    return {
      filters: { material_id: '', material_name: '' },
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
      rule: null,       // 条码格式配置（全局唯一）
      message: '',
      msgType: ''
    };
  },
  methods: {
    async search() {
      this.page = 1;
      await this.load();
    },
    async load() {
      const res = await this.ws.send('queryMaterials', {
        ...this.filters,
        is_active: 1,
        page: this.page,
        page_size: this.pageSize
      });
      if (res.success) {
        const today = new Date().toISOString().slice(0, 10);
        const materials = res.data.list.map(m => ({ ...m, sn_date: today, serial: '0001', print_qty: 1 }));
        // 批量查 (material_id, sn_date) 最新流水
        const pairs = materials.map(m => ({ material_id: m.material_id, sn_date: m.sn_date }));
        const sm = await this.ws.send('getSerialMap', pairs);
        if (sm.success && sm.data) {
          materials.forEach(m => {
            const key = `${m.material_id}#${m.sn_date}`;
            const next = (Number(sm.data[key]) || 0) + 1;
            m.serial = String(next).padStart(4, '0');
          });
        }
        this.list = materials;
        this.total = res.data.total;
      }
    },
    async loadRule() {
      const res = await this.ws.send('getBarcodeRule', {});
      if (res.success) this.rule = res.data;
    },
    // 打印：按「打印数量」批量生成条码，流水依次递增，全部写入档案
    printRow(m) {
      if (!this.rule) {
        this.msgType = 'err'; this.message = '条码格式未加载';
        return;
      }
      if (!m.sn_date) {
        this.msgType = 'err'; this.message = `请选择日期（${m.material_id}）`;
        return;
      }
      const serial = Number(m.serial);
      if (!Number.isFinite(serial) || serial < 1) {
        this.msgType = 'err'; this.message = `请填写流水号（${m.material_id}）`;
        return;
      }
      let qty = parseInt(m.print_qty, 10);
      if (!Number.isFinite(qty) || qty < 1) qty = 1;
      if (qty > 500) {
        this.msgType = 'err'; this.message = '单次打印数量不能超过 500';
        return;
      }
      const r = this.rule;
      const datePart = m.sn_date.replace(/-/g, '');
      // 从当前流水起依次生成 qty 个条码
      const sns = [];
      const labels = [];
      for (let i = 0; i < qty; i++) {
        const cur = serial + i;
        const serialPart = String(cur).padStart(4, '0');
        const sn = `${m.material_id}#${datePart}#${serialPart}`;
        sns.push({ sn, serial_no: cur });
        const q = qrcode(0, 'M');
        q.addData(sn);
        q.make();
        const qrUrl = q.createDataURL(4, 0);
        labels.push(`
        <div style="width:${r.label_width}mm;height:${r.label_height}mm;border:1px solid #ccc;position:relative;background:#fff;${i < qty - 1 ? 'page-break-after:always;' : ''}">
          <img src="${qrUrl}" style="position:absolute;left:${r.qr_x}mm;top:${r.qr_y}mm;width:${r.qr_size}mm;height:${r.qr_size}mm;">
          <div style="position:absolute;left:${r.mid_x}mm;top:${r.mid_y}mm;font-size:${r.mid_font}pt;">${m.material_id}</div>
          <div style="position:absolute;left:${r.date_x}mm;top:${r.date_y}mm;font-size:${r.date_font}pt;">${datePart}</div>
          <div style="position:absolute;left:${r.serial_x}mm;top:${r.serial_y}mm;font-size:${r.serial_font}pt;">${serialPart}</div>
        </div>`);
      }
      // 在打印窗口内等待图片加载完成后再调起打印，避免二维码偶发空白
      const w = window.open('', '_blank');
      w.document.write(`
        <html>
          <head><title>条码打印（${qty} 张）</title>
            <style>
              body { margin: 0; padding: 20px; }
              @media print {
                body { padding: 0; }
                @page { size: auto; margin: 5mm; }
              }
            </style>
          </head>
          <body>${labels.join('')}
            <script>
              window.onload = function () {
                setTimeout(function () { window.focus(); window.print(); }, 100);
              };
            <\/script>
          </body>
        </html>
      `);
      w.document.close();
      // 批量写入条码档案表（防重复，已存在则跳过）
      Promise.all(sns.map(x =>
        this.ws.send('recordSnSerial', {
          sn: x.sn, material_id: m.material_id, sn_date: m.sn_date, serial_no: x.serial_no
        }).catch(() => null)
      )).then(results => {
        // 打印已调起：流水推进到 起始+数量，供下一批使用
        m.serial = String(serial + qty).padStart(4, '0');
        const dupCount = results.filter(x => x && x.success && x.message).length;
        const failCount = results.filter(x => !x || !x.success).length;
        this.msgType = failCount ? 'err' : 'ok';
        let msg = `已调起打印 ${qty} 张：${sns[0].sn} ~ ${sns[sns.length - 1].sn}`;
        if (dupCount) msg += `（${dupCount} 张已存在档案，跳过写入）`;
        if (failCount) msg = `打印已调起，但 ${failCount} 张档案写入失败，请检查`;
        this.message = msg;
      });
    },
    // 流水号补齐4位显示
    padSerial(v) {
      const n = Number(v);
      if (!Number.isFinite(n) || n < 1) return '0001';
      return String(n).padStart(4, '0');
    },
    // 打印数量修正：非正整数或超上限时回退到合法值
    fixQty(m) {
      let q = parseInt(m.print_qty, 10);
      if (!Number.isFinite(q) || q < 1) q = 1;
      if (q > 500) q = 500;
      m.print_qty = q;
    },
    // 日期变更后：重新按「物料+日期」查库取最大流水，流水自动置为 max+1
    async onDateChange(m) {
      if (!m.sn_date) { m.serial = '0001'; return; }
      const sm = await this.ws.send('getSerialMap', [{ material_id: m.material_id, sn_date: m.sn_date }]);
      const key = `${m.material_id}#${m.sn_date}`;
      const max = (sm.success && sm.data) ? (Number(sm.data[key]) || 0) : 0;
      m.serial = String(max + 1).padStart(4, '0');
      this.msgType = 'ok';
      this.message = '';
    },
    // 分页：翻页 / 切换每页条数
    onPageChange(p) { this.page = p; this.load(); },
    onPageSizeChange(size) { this.pageSize = size; this.page = 1; this.load(); }
  },
  mounted() {
    this.load();
    this.loadRule();
  },
  template: `
    <div>
      <div class="page-title">条码打印</div>
      <div v-if="message" :class="['tip', msgType]">{{ message }}</div>

      <div class="panel">
        <div class="form-row">
          <label>料号：</label>
          <input v-model="filters.material_id" placeholder="模糊查询" @keyup.enter="search">
          <label style="margin-left:16px;width:auto;">物料名称：</label>
          <input v-model="filters.material_name" placeholder="模糊查询" @keyup.enter="search">
          <button @click="search">查询</button>
        </div>
        <table style="margin-top:10px;">
          <thead>
            <tr><th>料号</th><th>物料名称</th><th>规格</th><th>日期</th><th>流水</th><th>打印数量</th><th>操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="m in list" :key="m.material_id">
              <td>{{ m.material_id }}</td>
              <td>{{ m.material_name }}</td>
              <td>{{ m.material_spec || '-' }}</td>
              <td><input type="date" v-model="m.sn_date" style="width:150px;" @change="onDateChange(m)"></td>
              <td><input v-model="m.serial" style="width:90px;" @blur="m.serial = padSerial(m.serial)"></td>
              <td><input type="number" v-model.number="m.print_qty" min="1" max="500" style="width:70px;" @blur="fixQty(m)"></td>
              <td><button v-if="$root.hasFuncPerm('func-barcode-print')" class="mini" @click="printRow(m)">打印</button></td>
            </tr>
            <tr v-if="!list.length"><td colspan="7" style="text-align:center;color:#909399;">暂无数据</td></tr>
          </tbody>
        </table>
        <vue-pager :page="page" :page-size="pageSize" :total="total"
                   @change="onPageChange" @size-change="onPageSizeChange"></vue-pager>
      </div>
    </div>
  `
});

// ========== 条码档案 ==========
Vue.component('page-barcode-archive', {
  props: ['ws', 'nav'],
  data() {
    return {
      filters: { material_id: '', material_name: '', sn: '', sn_date_start: '', sn_date_end: '' },
      list: [],
      total: 0,
      page: 1,
      pageSize: 20,
      rule: null   // 条码格式配置（全局唯一）
    };
  },
  methods: {
    async search() { this.page = 1; await this.load(); },
    async load() {
      const res = await this.ws.send('querySnArchive', { ...this.filters, page: this.page, page_size: this.pageSize });
      if (res.success) {
        this.list = res.data.list;
        this.total = res.data.total;
      }
    },
    doSearch() {
      const f = this.filters;
      if (f.material_id) f.material_id = f.material_id.trim();
      if (f.material_name) f.material_name = f.material_name.trim();
      if (f.sn) f.sn = f.sn.trim();
      this.search();
    },
    onPageChange(p) { this.page = p; this.load(); },
    onPageSizeChange(s) { this.pageSize = s; this.page = 1; this.load(); },
    openInspection(sn) { this.nav('page-record-detail', { sn }); },
    openAssemble(mainSn) { this.nav('page-assemble-detail', { sn: mainSn }); },
    async loadRule() {
      const res = await this.ws.send('getBarcodeRule', {});
      if (res.success) this.rule = res.data;
    },
    // 打印当前行的条码（使用档案中已有的 SN，不新增流水）
    printRow(r) {
      if (!this.rule) { alert('条码格式未加载，请稍后重试'); return; }
      const parts = String(r.sn || '').split('#');
      if (parts.length < 3) { alert('条码格式不正确，无法打印'); return; }
      const mid = parts[0];
      const datePart = parts[1];
      const serialPart = parts[2];
      const rule = this.rule;
      const q = qrcode(0, 'M');
      q.addData(r.sn);
      q.make();
      const qrUrl = q.createDataURL(4, 0);
      const label = `
        <div style="width:${rule.label_width}mm;height:${rule.label_height}mm;border:1px solid #ccc;position:relative;background:#fff;">
          <img src="${qrUrl}" style="position:absolute;left:${rule.qr_x}mm;top:${rule.qr_y}mm;width:${rule.qr_size}mm;height:${rule.qr_size}mm;">
          <div style="position:absolute;left:${rule.mid_x}mm;top:${rule.mid_y}mm;font-size:${rule.mid_font}pt;">${mid}</div>
          <div style="position:absolute;left:${rule.date_x}mm;top:${rule.date_y}mm;font-size:${rule.date_font}pt;">${datePart}</div>
          <div style="position:absolute;left:${rule.serial_x}mm;top:${rule.serial_y}mm;font-size:${rule.serial_font}pt;">${serialPart}</div>
        </div>`;
      const w = window.open('', '_blank');
      w.document.write(`
        <html>
          <head><title>条码打印（${r.sn}）</title>
            <style>
              body { margin: 0; padding: 20px; }
              @media print {
                body { padding: 0; }
                @page { size: auto; margin: 5mm; }
              }
            </style>
          </head>
          <body>${label}
            <script>
              window.onload = function () {
                setTimeout(function () { window.focus(); window.print(); }, 100);
              };
            <\/script>
          </body>
        </html>
      `);
      w.document.close();
    }
  },
  mounted() { this.load(); this.loadRule(); },
  template: `
    <div>
      <div class="page-title">条码档案</div>

      <div class="panel">
        <div class="form-row">
          <label>料号：</label><input v-model="filters.material_id" placeholder="模糊查询" @keyup.enter="doSearch">
          <label style="margin-left:16px;width:auto;">物料名称：</label><input v-model="filters.material_name" placeholder="模糊查询" @keyup.enter="doSearch">
        </div>
        <div class="form-row">
          <label>条码：</label><input v-model="filters.sn" placeholder="模糊查询（完整或片段）" @keyup.enter="doSearch">
        </div>
        <div class="form-row">
          <label>打印日期：</label>
          <input type="date" v-model="filters.sn_date_start"> 至
          <input type="date" v-model="filters.sn_date_end">
          <button @click="doSearch" style="margin-left:16px;">查询</button>
        </div>
        <table style="margin-top:10px;">
          <thead>
            <tr><th>ID</th><th>条码 SN</th><th>料号</th><th>物料名称</th><th>类型</th><th>检验否</th><th>装配否</th><th>日期</th><th>流水号</th><th>写入时间</th><th>操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td>{{ r.id }}</td>
              <td>{{ r.sn }}</td>
              <td>{{ r.material_id }}</td>
              <td>{{ r.material_name || '-' }}</td>
              <td>{{ r.part_type || '-' }}</td>
              <td>
                <a v-if="r.has_inspection == 1" class="link" style="color:#409eff;cursor:pointer;" @click="openInspection(r.sn)">是</a>
                <span v-else>否</span>
              </td>
              <td>
                <a v-if="r.has_assembly == 1" class="link" style="color:#409eff;cursor:pointer;" @click="openAssemble(r.assembly_main_sn || r.sn)">是</a>
                <span v-else>否</span>
              </td>
              <td>{{ r.sn_date }}</td>
              <td>{{ String(r.serial_no).padStart(4, '0') }}</td>
              <td>{{ r.created_time }}</td>
              <td><button class="mini" @click="printRow(r)">打印</button></td>
            </tr>
            <tr v-if="!list.length"><td colspan="11" style="text-align:center;color:#909399;">暂无数据</td></tr>
          </tbody>
        </table>
        <vue-pager :page="page" :page-size="pageSize" :total="total"
                   @change="onPageChange" @size-change="onPageSizeChange"></vue-pager>
      </div>
    </div>
  `
});

// ========== 日志管理 ==========
Vue.component('page-api-log', {
  props: ['ws'],
  data() {
    return {
      filters: { username: '', action: '', input_params: '', output_params: '', start_time: '', end_time: '' },
      list: [],
      total: 0,
      page: 1,
      pageSize: 20,
      detail: null
    };
  },
  methods: {
    async load() {
      const res = await this.ws.send('queryApiLogs', { ...this.filters, page: this.page, page_size: this.pageSize });
      if (res.success) { this.list = res.data.list; this.total = res.data.total; }
    },
    doSearch() { this.page = 1; this.load(); },
    reset() {
      this.filters = { username: '', action: '', input_params: '', output_params: '', start_time: '', end_time: '' };
      this.page = 1; this.load();
    },
    onPageChange(p) { this.page = p; this.load(); },
    onPageSizeChange(s) { this.pageSize = s; this.page = 1; this.load(); },
    fmtTime(v) { return v ? String(v).replace('T', ' ').slice(0, 19) : '-'; },
    shortText(v, len) {
      const s = String(v == null ? '' : v);
      return s.length > len ? s.slice(0, len) + '…' : s;
    },
    openDetail(row) { this.detail = row; },
    closeDetail() { this.detail = null; }
  },
  mounted() { this.load(); },
  template: `
    <div>
      <div class="page-title">日志管理</div>
      <div class="panel">
        <div class="form-row">
          <label>用户名：</label><input v-model="filters.username" placeholder="模糊" @keyup.enter="doSearch">
          <label style="margin-left:12px;">接口名：</label><input v-model="filters.action" placeholder="模糊" @keyup.enter="doSearch">
        </div>
        <div class="form-row" style="margin-top:8px;">
          <label>入参关键字：</label><input v-model="filters.input_params" placeholder="模糊" @keyup.enter="doSearch">
          <label style="margin-left:12px;">出参关键字：</label><input v-model="filters.output_params" placeholder="模糊" @keyup.enter="doSearch">
        </div>
        <div class="form-row" style="margin-top:8px;">
          <label>调用时间：</label>
          <input type="datetime-local" v-model="filters.start_time"> 至
          <input type="datetime-local" v-model="filters.end_time">
          <button @click="doSearch" style="margin-left:12px;">查询</button>
          <button @click="reset" style="margin-left:8px;background:#909399;">重置</button>
        </div>
      </div>
      <div class="panel" style="margin-top:16px;">
        <table style="table-layout:fixed;width:100%;">
          <thead><tr>
            <th style="width:60px;">ID</th>
            <th style="width:100px;">用户名</th>
            <th style="width:150px;">接口名</th>
            <th style="width:22%;">入参</th>
            <th style="width:22%;">出参</th>
            <th style="width:160px;">调用时间</th>
            <th style="width:80px;">耗时</th>
            <th style="width:80px;">操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td>{{ r.id }}</td>
              <td>{{ r.username || '-' }}</td>
              <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" :title="r.action">{{ r.action }}</td>
              <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" :title="r.input_params">{{ shortText(r.input_params, 60) }}</td>
              <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" :title="r.output_params">{{ shortText(r.output_params, 60) }}</td>
              <td>{{ fmtTime(r.call_time) }}</td>
              <td>{{ r.cost_ms }}</td>
              <td style="white-space:nowrap;"><button class="mini" @click="openDetail(r)">详情</button></td>
            </tr>
            <tr v-if="!list.length"><td colspan="8" style="text-align:center;color:#909399;">暂无数据</td></tr>
          </tbody>
        </table>
        <vue-pager :page="page" :page-size="pageSize" :total="total"
                   @change="onPageChange" @size-change="onPageSizeChange"></vue-pager>
      </div>

      <div v-if="detail" class="modal-mask" @click.self="closeDetail">
        <div class="modal" style="max-width:900px;">
          <div class="modal-title">日志详情 #{{ detail.id }}
            <span style="float:right;cursor:pointer;" @click="closeDetail">×</span>
          </div>
          <div class="modal-body">
            <table style="width:100%;font-size:13px;">
              <tr><td style="width:90px;color:#666;">用户名：</td><td>{{ detail.username || '-' }}</td></tr>
              <tr><td style="color:#666;">接口名：</td><td>{{ detail.action }}</td></tr>
              <tr><td style="color:#666;">调用时间：</td><td>{{ fmtTime(detail.call_time) }}</td></tr>
              <tr><td style="color:#666;">耗时：</td><td>{{ detail.cost_ms }} ms</td></tr>
              <tr><td style="color:#666;vertical-align:top;">入参：</td><td><pre style="white-space:pre-wrap;word-break:break-all;background:#f5f7fa;padding:10px;border-radius:4px;max-height:200px;overflow:auto;margin:0;">{{ detail.input_params }}</pre></td></tr>
              <tr><td style="color:#666;vertical-align:top;">出参：</td><td><pre style="white-space:pre-wrap;word-break:break-all;background:#f5f7fa;padding:10px;border-radius:4px;max-height:300px;overflow:auto;margin:0;">{{ detail.output_params }}</pre></td></tr>
            </table>
          </div>
          <div class="modal-footer">
            <button @click="closeDetail">关闭</button>
          </div>
        </div>
      </div>
    </div>
  `
});

// ========== 系统架构 ==========
// 复用 qmes-architecture/assets 下的 diagram.js（数据）与 flat.js（渲染）
// flat.js 已改造为 window.renderArchFlat()，组件挂载时动态加载并调用
Vue.component('page-arch', {
  props: ['ws'],
  data() {
    return { loaded: false };
  },
  mounted() {
    this.init();
  },
  methods: {
    loadScript(src) {
      return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src; s.onload = resolve; s.onerror = reject;
        document.body.appendChild(s);
      });
    },
    async init() {
      try {
        // 1. 数据模型（只加载一次）
        if (!window.QMES_DIAGRAM_DATA) {
          await this.loadScript('js/diagram.js?v=20261024r');
        }
        // 2. 渲染逻辑（只加载一次，定义 window.renderArchFlat）
        if (typeof window.renderArchFlat !== 'function') {
          await this.loadScript('js/flat.js?v=20261024r');
        }
        // 3. 渲染到当前组件容器
        if (typeof window.renderArchFlat === 'function') {
          // 先清空容器，避免重复渲染叠加
          const layers = document.getElementById('layers');
          const legend = document.getElementById('legend');
          if (layers) layers.innerHTML = '';
          if (legend) legend.innerHTML = '';
          window.renderArchFlat();
          this.loaded = true;
        }
      } catch (e) {
        console.error('架构图加载失败:', e);
      }
    }
  },
  template: `
    <div class="arch-wrap">
      <div class="page-title">系统架构</div>
      <div class="layout">
        <div>
          <div class="legend" id="legend"></div>
          <div class="layers" id="layers"></div>
        </div>
        <div class="detail" id="detail">
          <div class="empty" id="detail-empty">点击左侧任意模块<br>在此查看详情</div>
          <div id="detail-body" style="display:none">
            <div class="dh"><div class="dt" id="d-title"></div><div class="ds" id="d-sub"></div></div>
            <div class="dbody" id="d-content"></div>
          </div>
        </div>
      </div>
    </div>
  `
});

// ========== 良率分析 ==========
// 跨组件实例的查询状态缓存：从良率明细返回时恢复上次查询条件与结果
let _yieldAnalysisCache = null;

Vue.component('page-yield-analysis', {
  props: ['ws', 'nav'],
  data() {
    const c = _yieldAnalysisCache;
    return {
      materials: [],
      material_id: c ? c.material_id : '',
      materialKeyword: c ? (c.materialKeyword || '') : '',
      materialFocused: false,
      date_start: c ? c.date_start : this.defaultStart(),
      date_end: c ? c.date_end : this.defaultEnd(),
      loading: false,
      header: c ? c.header : null,
      items: c ? c.items : []
    };
  },
  computed: {
    filteredMaterials() {
      const kw = (this.materialKeyword || '').trim().toLowerCase();
      if (!kw) return this.materials.slice(0, 80);
      return this.materials.filter(m =>
        (m.material_id || '').toLowerCase().indexOf(kw) >= 0 ||
        (m.material_name || '').toLowerCase().indexOf(kw) >= 0 ||
        (m.material_spec || '').toLowerCase().indexOf(kw) >= 0
      ).slice(0, 80);
    },
    selectedMaterial() {
      if (!this.material_id) return null;
      return this.materials.find(m => m.material_id === this.material_id) || null;
    }
  },
  mounted() {
    this.loadMaterials();
    document.addEventListener('click', this.onDocClick);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.onDocClick);
  },
  methods: {
    defaultStart() {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return d.toISOString().slice(0, 10);
    },
    defaultEnd() {
      return new Date().toISOString().slice(0, 10);
    },
    async loadMaterials() {
      const res = await this.ws.send('queryMaterials', { page_size: 500, is_active: 1 });
      if (res.success && res.data && res.data.list) {
        this.materials = res.data.list;
      }
    },
    onDocClick(e) {
      const wrap = this.$refs.materialSelector;
      if (wrap && !wrap.contains(e.target)) this.materialFocused = false;
    },
    selectMaterial(m) {
      this.material_id = m.material_id;
      this.materialKeyword = '';
      this.materialFocused = false;
    },
    clearMaterial() {
      this.material_id = '';
      this.materialKeyword = '';
      this.$nextTick(() => { this.$refs.materialInput && this.$refs.materialInput.focus(); });
    },
    inputFocus() {
      this.materialFocused = true;
      if (this.material_id && !this.materialKeyword) {
        const m = this.selectedMaterial;
        this.materialKeyword = m ? m.material_id + ' - ' + m.material_name : '';
      }
    },
    onKeywordInput() {
      if (this.material_id && this.materialKeyword !== (this.selectedMaterial ? this.selectedMaterial.material_id + ' - ' + this.selectedMaterial.material_name : '')) {
        this.material_id = '';
      }
    },
    async query() {
      if (!this.material_id) { alert('请选择物料（输入料号或名称后选择一项）'); return; }
      if (!this.date_start || !this.date_end) { alert('请选择时间范围'); return; }
      this.loading = true;
      const res = await this.ws.send('queryYieldAnalysis', {
        material_id: this.material_id,
        date_start: this.date_start,
        date_end: this.date_end
      });
      this.loading = false;
      if (!res.success) {
        alert(res.message || '查询失败');
        return;
      }
      this.header = res.data.header;
      this.items = res.data.items;
      // 缓存查询条件与结果，返回时自动恢复
      _yieldAnalysisCache = {
        material_id: this.material_id,
        materialKeyword: this.materialKeyword,
        date_start: this.date_start,
        date_end: this.date_end,
        header: this.header,
        items: this.items
      };
    },
    reset() {
      this.material_id = '';
      this.materialKeyword = '';
      this.date_start = this.defaultStart();
      this.date_end = this.defaultEnd();
      this.header = null;
      this.items = [];
      _yieldAnalysisCache = null;
    },
    yieldColor(pct) {
      if (pct >= 95) return '#059669';
      if (pct >= 80) return '#d97706';
      return '#dc2626';
    },
    yieldBarStyle(pct) {
      return { width: Math.max(pct, 2) + '%', background: this.yieldColor(pct) };
    },
    // 点击柱子 → 打开该检验项目的明细数据
    openItemDetail(it) {
      if (!this.header) return;
      this.nav('page-yield-detail', {
        material_id: this.header.material_id,
        material_name: this.header.material_name,
        date_start: this.date_start,
        date_end: this.date_end,
        item_id: it.item_id,
        item_name: it.item_name
      });
    }
  },
  template: `
    <div class="yield-page">
      <div class="page-title">良率分析</div>

      <!-- 查询条件 -->
      <div class="yield-search">
        <label>物料：</label>
        <div class="yield-mat-select" ref="materialSelector">
          <div class="yield-mat-input-row">
            <input ref="materialInput" type="text"
                   class="yield-mat-input"
                   v-model="materialKeyword"
                   :placeholder="selectedMaterial ? selectedMaterial.material_id + ' - ' + selectedMaterial.material_name : '输入料号或名称搜索...'"
                   @focus="inputFocus"
                   @input="onKeywordInput"
                   @keydown.enter.prevent="materialFocused = false">
            <span v-if="material_id" class="yield-mat-clear" @click="clearMaterial">×</span>
          </div>
          <div v-if="materialFocused && filteredMaterials.length" class="yield-mat-dropdown">
            <div v-for="m in filteredMaterials" :key="m.material_id"
                 class="yield-mat-option"
                 :class="{ sel: m.material_id === material_id }"
                 @mousedown.prevent="selectMaterial(m)">
              <div class="yield-mat-opt-id">{{ m.material_id }}</div>
              <div class="yield-mat-opt-name">{{ m.material_name }}<span v-if="m.material_spec" class="yield-mat-opt-spec"> · {{ m.material_spec }}</span></div>
            </div>
          </div>
          <div v-else-if="materialFocused && materialKeyword && !filteredMaterials.length" class="yield-mat-dropdown yield-mat-empty">
            没有匹配的物料
          </div>
        </div>
        <label>开始日期：</label>
        <input type="date" v-model="date_start">
        <label>结束日期：</label>
        <input type="date" v-model="date_end">
        <button @click="query" :disabled="loading">{{ loading ? '查询中...' : '查询' }}</button>
        <button @click="reset">重置</button>
      </div>

      <template v-if="header">
        <div class="yield-header">
          <div class="yh-card">
            <div class="yh-label">物料号</div>
            <div class="yh-value">{{ header.material_id }}</div>
          </div>
          <div class="yh-card">
            <div class="yh-label">物料名称</div>
            <div class="yh-value">{{ header.material_name }}</div>
          </div>
          <div class="yh-card">
            <div class="yh-label">规格</div>
            <div class="yh-value">{{ header.material_spec || '-' }}</div>
          </div>
          <div class="yh-card">
            <div class="yh-label">检验单数量</div>
            <div class="yh-value big">{{ header.record_count }}</div>
          </div>
          <div class="yh-card">
            <div class="yh-label">拒收数量</div>
            <div class="yh-value big" style="color:#dc2626;">{{ header.reject_count }}</div>
          </div>
          <div class="yh-card">
            <div class="yh-label">平均良率</div>
            <div class="yh-value big" :style="{color: yieldColor(header.avg_yield)}">{{ header.avg_yield }}%</div>
          </div>
        </div>

        <div class="yield-section">
          <div class="yield-section-title">检验项目分析</div>
          <table class="yield-table" v-if="items.length">
            <thead>
              <tr>
                <th style="width:120px;">检验项目编号</th>
                <th style="width:160px;">项目名称</th>
                <th style="width:120px;">标准值</th>
                <th style="width:140px;">标准区间</th>
                <th style="width:90px;">检验数量</th>
                <th style="width:90px;">合格数量</th>
                <th style="width:90px;">良率</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(it, idx) in items" :key="idx">
                <td>{{ it.item_id }}</td>
                <td>{{ it.item_name }}</td>
                <td>{{ it.standard_value || '-' }}</td>
                <td>{{ it.standard_range ? '[' + it.standard_range.split(',').join(', ') + ']' : '-' }}</td>
                <td style="text-align:center;">{{ it.check_count }}</td>
                <td style="text-align:center;">{{ it.pass_count }}</td>
                <td style="text-align:center;font-weight:600;" :style="{color: yieldColor(it.pass_rate)}">{{ it.pass_rate }}%</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="yield-empty">该条件下暂无检验数据</div>
        </div>

        <div class="yield-section">
          <div class="yield-section-title">良率分布图</div>
          <div class="yield-chart" v-if="items.length">
            <div class="yield-chart-bar" v-for="(it, idx) in items" :key="idx"
                 style="cursor:pointer;"
                 :title="'点击查看 ' + it.item_name + ' 的明细数据'"
                 @click="openItemDetail(it)">
              <div class="yield-chart-info">
                <div class="yield-chart-name" :title="it.item_name">{{ it.item_name }}</div>
                <div class="yield-chart-sub">{{ it.item_id }}</div>
              </div>
              <div class="yield-chart-bar-body">
                <div class="yield-chart-bar-fill" :style="yieldBarStyle(it.pass_rate)"></div>
              </div>
              <div class="yield-chart-pct" :style="{color: yieldColor(it.pass_rate)}">{{ it.pass_rate }}%</div>
              <div class="yield-chart-count">{{ it.pass_count }}/{{ it.check_count }}</div>
            </div>
          </div>
          <div v-else class="yield-empty">该条件下暂无检验数据</div>
        </div>
      </template>

      <div v-else-if="!loading" class="yield-intro">
        <div style="font-size:16px;font-weight:600;margin-bottom:10px;">良率分析报表</div>
        <div style="color:#667085;line-height:1.8;">
          请选择物料和时间范围后点击"查询"，将展示：<br>
          • 汇总信息：检验单数量、平均良率<br>
          • 检验项目明细：每个检验项目的标准、检验数量、合格数量、良率<br>
          • 良率分布图：直观展示各检验项目的良率情况
        </div>
      </div>
    </div>
  `
});

// ========== 良率报表（表格形式） ==========
Vue.component('page-yield-report', {
  props: ['ws', 'nav'],
  data() {
    return {
      materials: [],
      material_ids: [],
      materialKeyword: '',
      materialFocused: false,
      date_start: this.defaultStart(),
      date_end: this.defaultEnd(),
      loading: false,
      groups: [],
      skipped: 0
    };
  },
  computed: {
    // 关键词匹配的物料全集（不截断）
    matchedMaterials() {
      const kw = (this.materialKeyword || '').trim().toLowerCase();
      if (!kw) return this.materials;
      return this.materials.filter(m =>
        (m.material_id || '').toLowerCase().indexOf(kw) >= 0 ||
        (m.material_name || '').toLowerCase().indexOf(kw) >= 0 ||
        (m.material_spec || '').toLowerCase().indexOf(kw) >= 0
      );
    },
    filteredMaterials() {
      return this.matchedMaterials.slice(0, 80);
    },
    allMatchedSelected() {
      const list = this.matchedMaterials;
      return list.length > 0 && list.every(m => this.material_ids.indexOf(m.material_id) >= 0);
    },
    selectedMaterials() {
      return this.material_ids.map(id => {
        const m = this.materials.find(x => x.material_id === id);
        return m || { material_id: id, material_name: '', material_spec: '' };
      });
    },
    totalDurationRecords() {
      return this.groups.reduce((sum, g) => sum + (g.header.duration_record_count || 0), 0);
    }
  },
  mounted() {
    this.loadMaterials();
    document.addEventListener('click', this.onDocClick);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.onDocClick);
  },
  methods: {
    defaultStart() {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return d.toISOString().slice(0, 10);
    },
    defaultEnd() {
      return new Date().toISOString().slice(0, 10);
    },
    async loadMaterials() {
      const res = await this.ws.send('queryMaterials', { page_size: 500, is_active: 1 });
      if (res.success && res.data && res.data.list) {
        this.materials = res.data.list;
      }
    },
    onDocClick(e) {
      const wrap = this.$refs.materialSelector;
      if (wrap && !wrap.contains(e.target)) this.materialFocused = false;
    },
    toggleMaterial(m) {
      const idx = this.material_ids.indexOf(m.material_id);
      if (idx >= 0) {
        this.material_ids.splice(idx, 1);
      } else {
        this.material_ids.push(m.material_id);
      }
      this.materialKeyword = '';
      this.materialFocused = true;
      this.$nextTick(() => { this.$refs.materialInput && this.$refs.materialInput.focus(); });
    },
    clearMaterials() {
      this.material_ids = [];
      this.materialKeyword = '';
      this.$nextTick(() => { this.$refs.materialInput && this.$refs.materialInput.focus(); });
    },
    // 全选 / 取消全选（作用于当前关键词匹配的全部物料）
    toggleSelectAll() {
      const list = this.matchedMaterials;
      if (!list.length) return;
      const ids = list.map(m => m.material_id);
      if (this.allMatchedSelected) {
        this.material_ids = this.material_ids.filter(id => ids.indexOf(id) < 0);
      } else {
        ids.forEach(id => { if (this.material_ids.indexOf(id) < 0) this.material_ids.push(id); });
      }
      this.materialKeyword = '';
      this.materialFocused = true;
      this.$nextTick(() => { this.$refs.materialInput && this.$refs.materialInput.focus(); });
    },
    inputFocus() {
      this.materialFocused = true;
    },
    async query() {
      if (!this.material_ids.length) { alert('请选择物料（可多选）'); return; }
      if (!this.date_start || !this.date_end) { alert('请选择时间范围'); return; }
      this.loading = true;
      const res = await this.ws.send('queryYieldReport', {
        material_ids: this.material_ids.slice(),
        date_start: this.date_start,
        date_end: this.date_end
      });
      this.loading = false;
      if (!res.success) {
        alert(res.message || '查询失败');
        return;
      }
      this.groups = res.data.groups || [];
      this.skipped = res.data.skipped || 0;
    },
    reset() {
      this.material_ids = [];
      this.materialKeyword = '';
      this.date_start = this.defaultStart();
      this.date_end = this.defaultEnd();
      this.groups = [];
      this.skipped = 0;
    },
    yieldColor(pct) {
      if (pct >= 95) return '#059669';
      if (pct >= 80) return '#d97706';
      return '#dc2626';
    },
    fmtRange(range) {
      if (!range) return '-';
      return '[' + range.split(',').join(', ') + ']';
    },
    // 秒数 -> 可读时长
    fmtDuration(sec) {
      if (sec === null || sec === undefined) return '-';
      const s = Number(sec);
      if (s < 60) return s + ' 秒';
      const m = Math.floor(s / 60);
      const rs = s % 60;
      if (m < 60) return rs ? (m + ' 分 ' + rs + ' 秒') : (m + ' 分');
      const h = Math.floor(m / 60);
      const rm = m % 60;
      return rm ? (h + ' 时 ' + rm + ' 分') : (h + ' 时');
    }
  },
  template: `
    <div class="yield-page">
      <div class="page-title">良率报表</div>

      <!-- 查询条件（与良率分析一致，物料支持多选） -->
      <div class="yield-search">
        <label>物料：</label>
        <div class="yield-mat-select" ref="materialSelector" style="min-width:300px;">
          <div class="yield-mat-input-row" style="flex-wrap:nowrap;overflow:hidden;">
            <span v-if="material_ids.length"
                  :title="selectedMaterials.map(m => m.material_id + (m.material_name ? ' ' + m.material_name : '')).join(' / ')"
                  style="flex:0 1 auto;max-width:180px;display:inline-flex;align-items:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:#e8f0fe;color:#1a56a8;border:1px solid #c7d9f7;border-radius:4px;padding:4px 6px;font-size:12px;line-height:16px;margin-right:4px;">
              <span style="overflow:hidden;text-overflow:ellipsis;">已选 {{ material_ids.length }} 项：{{ material_ids.join('、') }}</span>
              <span style="margin-left:4px;cursor:pointer;font-weight:600;flex:0 0 auto;" @click.stop="clearMaterials" title="清空已选物料">×</span>
            </span>
            <input ref="materialInput" type="text"
                   class="yield-mat-input"
                   style="flex:1 1 80px;min-width:80px;width:auto;"
                   v-model="materialKeyword"
                   placeholder="输入料号或名称搜索，可多选"
                   @focus="inputFocus"
                   @keydown.enter.prevent="materialFocused = false">
          </div>
          <div v-if="materialFocused && filteredMaterials.length" class="yield-mat-dropdown">
            <div class="yield-mat-option" style="border-bottom:1px solid #ebeef5;"
                 @mousedown.prevent="toggleSelectAll">
              <div class="yield-mat-opt-id" style="color:#1a56a8;font-weight:600;">
                <span style="display:inline-block;width:14px;">{{ allMatchedSelected ? '✓' : '' }}</span>
                {{ allMatchedSelected ? '取消全选' : '全选' }}（当前匹配 {{ matchedMaterials.length }} 项）
              </div>
            </div>
            <div v-for="m in filteredMaterials" :key="m.material_id"
                 class="yield-mat-option"
                 :class="{ sel: material_ids.indexOf(m.material_id) >= 0 }"
                 @mousedown.prevent="toggleMaterial(m)">
              <div class="yield-mat-opt-id">
                <span style="display:inline-block;width:14px;">{{ material_ids.indexOf(m.material_id) >= 0 ? '✓' : '' }}</span>{{ m.material_id }}
              </div>
              <div class="yield-mat-opt-name">{{ m.material_name }}<span v-if="m.material_spec" class="yield-mat-opt-spec"> · {{ m.material_spec }}</span></div>
            </div>
          </div>
          <div v-else-if="materialFocused && materialKeyword && !filteredMaterials.length" class="yield-mat-dropdown yield-mat-empty">
            没有匹配的物料
          </div>
        </div>
        <label>开始日期：</label>
        <input type="date" v-model="date_start">
        <label>结束日期：</label>
        <input type="date" v-model="date_end">
        <button @click="query" :disabled="loading">{{ loading ? '查询中...' : '查询' }}</button>
        <button @click="reset">重置</button>
      </div>

      <div v-if="groups.length" class="yield-section">
        <div class="yield-section-title">良率报表明细（共 {{ groups.length }} 个物料<span v-if="skipped" style="color:#909399;font-weight:400;">，已过滤 {{ skipped }} 个无数据物料</span>）</div>
        <div style="overflow-x:auto;">
          <table class="yield-table" style="white-space:nowrap;">
            <thead>
              <tr>
                <th>物料</th><th>品名</th><th>规格</th><th>检验数量</th><th>拒收数量</th><th>平均良率</th><th>平均时长</th>
                <th>检验项目编号</th><th>项目名称</th><th>标准值</th><th>标准区间</th><th>合格数量</th><th>良率</th>
              </tr>
            </thead>
            <tbody v-for="(g, gi) in groups" :key="gi">
              <tr v-for="(it, idx) in g.items" :key="idx">
                <template v-if="idx === 0">
                  <td :rowspan="g.items.length" style="font-weight:600;">{{ g.header.material_id }}</td>
                  <td :rowspan="g.items.length">{{ g.header.material_name }}</td>
                  <td :rowspan="g.items.length">{{ g.header.material_spec || '-' }}</td>
                  <td :rowspan="g.items.length" style="text-align:center;">{{ g.header.record_count }}</td>
                  <td :rowspan="g.items.length" style="text-align:center;">{{ g.header.reject_count }}</td>
                  <td :rowspan="g.items.length" style="text-align:center;font-weight:600;" :style="{color: yieldColor(g.header.avg_yield)}">{{ g.header.avg_yield }}%</td>
                  <td :rowspan="g.items.length" style="text-align:center;">{{ fmtDuration(g.header.avg_duration_sec) }}</td>
                </template>
                <td>{{ it.item_id }}</td>
                <td>{{ it.item_name }}</td>
                <td>{{ it.standard_value || '-' }}</td>
                <td>{{ fmtRange(it.standard_range) }}</td>
                <td style="text-align:center;">{{ it.pass_count }}</td>
                <td style="text-align:center;font-weight:600;" :style="{color: yieldColor(it.pass_rate)}">{{ it.pass_rate }}%</td>
              </tr>
              <tr v-if="!g.items.length">
                <td style="font-weight:600;">{{ g.header.material_id }}</td>
                <td>{{ g.header.material_name }}</td>
                <td>{{ g.header.material_spec || '-' }}</td>
                <td style="text-align:center;">{{ g.header.record_count }}</td>
                <td style="text-align:center;">{{ g.header.reject_count }}</td>
                <td style="text-align:center;">{{ g.header.avg_yield }}%</td>
                <td style="text-align:center;">{{ fmtDuration(g.header.avg_duration_sec) }}</td>
                <td colspan="6" style="text-align:center;color:#909399;">该条件下暂无检验项目数据</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="margin-top:8px;color:#98a2b3;font-size:12px;">
          平均时长说明：每张检验单取其明细 entry_time 的最大值与最小值之差作为检验时长，再对所有检验单取平均（所选物料本期有效检验单共 {{ totalDurationRecords }} 张）。
        </div>
      </div>

      <div v-else-if="!loading" class="yield-intro">
        <div style="font-size:16px;font-weight:600;margin-bottom:10px;">良率报表</div>
        <div style="color:#667085;line-height:1.8;">
          请选择物料（支持多选）和时间范围后点击"查询"，以表格形式展示：<br>
          • 物料信息、检验数量、拒收数量、平均良率、平均时长<br>
          • 检验项目编号、项目名称、标准值、标准区间、合格数量、良率
        </div>
      </div>
    </div>
  `
});

// ========== 良率明细报表（每张检验单横向展开检验项目值） ==========
Vue.component('page-yield-detail-report', {
  props: ['ws', 'nav'],
  data() {
    return {
      materials: [],
      material_ids: [],
      materialKeyword: '',
      materialFocused: false,
      date_start: this.defaultStart(),
      date_end: this.defaultEnd(),
      loading: false,
      groups: [],
      skipped: 0
    };
  },
  computed: {
    // 关键词匹配的物料全集（不截断）
    matchedMaterials() {
      const kw = (this.materialKeyword || '').trim().toLowerCase();
      if (!kw) return this.materials;
      return this.materials.filter(m =>
        (m.material_id || '').toLowerCase().indexOf(kw) >= 0 ||
        (m.material_name || '').toLowerCase().indexOf(kw) >= 0 ||
        (m.material_spec || '').toLowerCase().indexOf(kw) >= 0
      );
    },
    filteredMaterials() {
      return this.matchedMaterials.slice(0, 80);
    },
    allMatchedSelected() {
      const list = this.matchedMaterials;
      return list.length > 0 && list.every(m => this.material_ids.indexOf(m.material_id) >= 0);
    },
    selectedMaterials() {
      return this.material_ids.map(id => {
        const m = this.materials.find(x => x.material_id === id);
        return m || { material_id: id, material_name: '', material_spec: '' };
      });
    },
    totalDurationRecords() {
      return this.groups.reduce((sum, g) => sum + (g.header.duration_record_count || 0), 0);
    }
  },
  mounted() {
    this.loadMaterials().then(() => { this.query(); });
    document.addEventListener('click', this.onDocClick);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.onDocClick);
  },
  methods: {
    defaultStart() {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return d.toISOString().slice(0, 10);
    },
    defaultEnd() {
      return new Date().toISOString().slice(0, 10);
    },
    async loadMaterials() {
      const res = await this.ws.send('queryMaterials', { page_size: 500, is_active: 1 });
      if (res.success && res.data && res.data.list) {
        this.materials = res.data.list;
      }
    },
    onDocClick(e) {
      const wrap = this.$refs.materialSelector;
      if (wrap && !wrap.contains(e.target)) this.materialFocused = false;
    },
    toggleMaterial(m) {
      const idx = this.material_ids.indexOf(m.material_id);
      if (idx >= 0) {
        this.material_ids.splice(idx, 1);
      } else {
        this.material_ids.push(m.material_id);
      }
      this.materialKeyword = '';
      this.materialFocused = true;
      this.$nextTick(() => { this.$refs.materialInput && this.$refs.materialInput.focus(); });
    },
    clearMaterials() {
      this.material_ids = [];
      this.materialKeyword = '';
      this.$nextTick(() => { this.$refs.materialInput && this.$refs.materialInput.focus(); });
    },
    // 全选 / 取消全选（作用于当前关键词匹配的全部物料）
    toggleSelectAll() {
      const list = this.matchedMaterials;
      if (!list.length) return;
      const ids = list.map(m => m.material_id);
      if (this.allMatchedSelected) {
        this.material_ids = this.material_ids.filter(id => ids.indexOf(id) < 0);
      } else {
        ids.forEach(id => { if (this.material_ids.indexOf(id) < 0) this.material_ids.push(id); });
      }
      this.materialKeyword = '';
      this.materialFocused = true;
      this.$nextTick(() => { this.$refs.materialInput && this.$refs.materialInput.focus(); });
    },
    inputFocus() {
      this.materialFocused = true;
    },
    async query() {
      if (!this.date_start || !this.date_end) { alert('请选择时间范围'); return; }
      this.loading = true;
      const res = await this.ws.send('queryYieldDetailReport', {
        material_ids: this.material_ids.slice(),
        date_start: this.date_start,
        date_end: this.date_end
      });
      this.loading = false;
      if (!res.success) {
        alert(res.message || '查询失败');
        return;
      }
      this.groups = res.data.groups || [];
      this.skipped = res.data.skipped || 0;
    },
    reset() {
      this.material_ids = [];
      this.materialKeyword = '';
      this.date_start = this.defaultStart();
      this.date_end = this.defaultEnd();
      this.groups = [];
      this.skipped = 0;
    },
    yieldColor(pct) {
      if (pct >= 95) return '#059669';
      if (pct >= 80) return '#d97706';
      return '#dc2626';
    },
    fmtRange(range) {
      if (!range) return '-';
      return '[' + range.split(',').join(', ') + ']';
    },
    // 秒数 -> 可读时长
    fmtDuration(sec) {
      if (sec === null || sec === undefined) return '-';
      const s = Number(sec);
      if (s < 60) return s + ' 秒';
      const m = Math.floor(s / 60);
      const rs = s % 60;
      if (m < 60) return rs ? (m + ' 分 ' + rs + ' 秒') : (m + ' 分');
      const h = Math.floor(m / 60);
      const rm = m % 60;
      return rm ? (h + ' 时 ' + rm + ' 分') : (h + ' 时');
    },
    // 单元格展示：优先测量值，其次说明文字，图片型显示「图片」
    cellText(c) {
      if (!c) return '-';
      if (c.val) return c.val;
      if (c.text) return c.text;
      if (c.img) return '图片';
      return '-';
    },
    preview(url) { if (url) window.open(url, '_blank'); }
  },
  template: `
    <div class="yield-page">
      <div class="page-title">良率明细报表</div>

      <!-- 查询条件（与良率报表一致，物料支持多选） -->
      <div class="yield-search">
        <label>物料：</label>
        <div class="yield-mat-select" ref="materialSelector" style="min-width:300px;">
          <div class="yield-mat-input-row" style="flex-wrap:nowrap;overflow:hidden;">
            <span v-if="material_ids.length"
                  :title="selectedMaterials.map(m => m.material_id + (m.material_name ? ' ' + m.material_name : '')).join(' / ')"
                  style="flex:0 1 auto;max-width:180px;display:inline-flex;align-items:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:#e8f0fe;color:#1a56a8;border:1px solid #c7d9f7;border-radius:4px;padding:4px 6px;font-size:12px;line-height:16px;margin-right:4px;">
              <span style="overflow:hidden;text-overflow:ellipsis;">已选 {{ material_ids.length }} 项：{{ material_ids.join('、') }}</span>
              <span style="margin-left:4px;cursor:pointer;font-weight:600;flex:0 0 auto;" @click.stop="clearMaterials" title="清空已选物料">×</span>
            </span>
            <input ref="materialInput" type="text"
                   class="yield-mat-input"
                   style="flex:1 1 80px;min-width:80px;width:auto;"
                   v-model="materialKeyword"
                   placeholder="输入料号或名称搜索，可多选"
                   @focus="inputFocus"
                   @keydown.enter.prevent="materialFocused = false">
          </div>
          <div v-if="materialFocused && filteredMaterials.length" class="yield-mat-dropdown">
            <div class="yield-mat-option" style="border-bottom:1px solid #ebeef5;"
                 @mousedown.prevent="toggleSelectAll">
              <div class="yield-mat-opt-id" style="color:#1a56a8;font-weight:600;">
                <span style="display:inline-block;width:14px;">{{ allMatchedSelected ? '✓' : '' }}</span>
                {{ allMatchedSelected ? '取消全选' : '全选' }}（当前匹配 {{ matchedMaterials.length }} 项）
              </div>
            </div>
            <div v-for="m in filteredMaterials" :key="m.material_id"
                 class="yield-mat-option"
                 :class="{ sel: material_ids.indexOf(m.material_id) >= 0 }"
                 @mousedown.prevent="toggleMaterial(m)">
              <div class="yield-mat-opt-id">
                <span style="display:inline-block;width:14px;">{{ material_ids.indexOf(m.material_id) >= 0 ? '✓' : '' }}</span>{{ m.material_id }}
              </div>
              <div class="yield-mat-opt-name">{{ m.material_name }}<span v-if="m.material_spec" class="yield-mat-opt-spec"> · {{ m.material_spec }}</span></div>
            </div>
          </div>
          <div v-else-if="materialFocused && materialKeyword && !filteredMaterials.length" class="yield-mat-dropdown yield-mat-empty">
            没有匹配的物料
          </div>
        </div>
        <label>开始日期：</label>
        <input type="date" v-model="date_start">
        <label>结束日期：</label>
        <input type="date" v-model="date_end">
        <button @click="query" :disabled="loading">{{ loading ? '查询中...' : '查询' }}</button>
        <button @click="reset">重置</button>
      </div>

      <div v-if="groups.length">
        <div class="yield-section-title" style="margin-bottom:10px;">
          良率明细报表（共 {{ groups.length }} 个物料<span v-if="skipped" style="color:#909399;font-weight:400;">，已过滤 {{ skipped }} 个无数据物料</span>）
        </div>

        <div v-for="(g, gi) in groups" :key="gi" class="yield-section" style="margin-bottom:16px;">
          <div class="yield-section-title" style="background:#f5f8fc;padding:6px 10px;border-radius:4px;">
            {{ g.header.material_id }} · {{ g.header.material_name }}
            <span style="color:#909399;font-weight:400;">（检验单 {{ g.records.length }} 张，右侧按检验日期先后横向展开）</span>
          </div>
          <div style="overflow-x:auto;">
            <table class="yield-table" style="white-space:nowrap;">
              <thead>
                <tr>
                  <th>物料</th><th>品名</th><th>规格</th><th>检验数量</th><th>拒收数量</th><th>平均良率</th><th>平均时长</th>
                  <th>检验项目编号</th><th>项目名称</th><th>标准值</th><th>标准区间</th><th>合格数量</th><th>良率</th>
                  <th v-for="(r, ri) in g.records" :key="ri"
                      :title="'SN：' + r.batch_no"
                      style="text-align:center;min-width:88px;white-space:nowrap;cursor:default;">
                    {{ String(r.inspect_date || '').slice(0, 10) }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(it, idx) in g.items" :key="idx">
                  <template v-if="idx === 0">
                    <td :rowspan="g.items.length" style="font-weight:600;">{{ g.header.material_id }}</td>
                    <td :rowspan="g.items.length">{{ g.header.material_name }}</td>
                    <td :rowspan="g.items.length">{{ g.header.material_spec || '-' }}</td>
                    <td :rowspan="g.items.length" style="text-align:center;">{{ g.header.record_count }}</td>
                    <td :rowspan="g.items.length" style="text-align:center;">{{ g.header.reject_count }}</td>
                    <td :rowspan="g.items.length" style="text-align:center;font-weight:600;" :style="{color: yieldColor(g.header.avg_yield)}">{{ g.header.avg_yield }}%</td>
                    <td :rowspan="g.items.length" style="text-align:center;">{{ fmtDuration(g.header.avg_duration_sec) }}</td>
                  </template>
                  <td>{{ it.item_id }}</td>
                  <td>{{ it.item_name }}</td>
                  <td>{{ it.standard_value || '-' }}</td>
                  <td>{{ fmtRange(it.standard_range) }}</td>
                  <td style="text-align:center;">{{ it.pass_count }}</td>
                  <td style="text-align:center;font-weight:600;" :style="{color: yieldColor(it.pass_rate)}">{{ it.pass_rate }}%</td>
                  <td v-for="(c, ci) in it.values" :key="ci" style="text-align:center;">
                    <a v-if="c.img && !c.val && !c.text" href="javascript:;" @click="preview(c.img)" style="font-size:12px;">图片</a>
                    <span v-else>{{ cellText(c) }}</span>
                  </td>
                </tr>
                <tr v-if="!g.items.length">
                  <td style="font-weight:600;">{{ g.header.material_id }}</td>
                  <td>{{ g.header.material_name }}</td>
                  <td>{{ g.header.material_spec || '-' }}</td>
                  <td style="text-align:center;">{{ g.header.record_count }}</td>
                  <td style="text-align:center;">{{ g.header.reject_count }}</td>
                  <td style="text-align:center;">{{ g.header.avg_yield }}%</td>
                  <td style="text-align:center;">{{ fmtDuration(g.header.avg_duration_sec) }}</td>
                  <td :colspan="6 + g.records.length" style="text-align:center;color:#909399;">该条件下暂无检验项目数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="yield-intro">
        <div style="font-size:16px;font-weight:600;margin-bottom:10px;">良率明细报表</div>
        <div style="color:#667085;line-height:1.8;">
          请选择物料（支持多选）和时间范围后点击"查询"：<br>
          • 左侧保留良率报表的汇总列（检验数量、拒收数量、平均良率、平均时长及项目良率）<br>
          • 右侧按每一张检验单横向新增一列，单元格为该检验单对应检验项目的测量值
        </div>
      </div>
    </div>
  `
});

// ========== 库存异动报表 ==========
// 物料筛选：多选下拉（带全选），下拉选项只含有入库数据的物料，未选择=查全部
Vue.component('page-stock-movement-report', {
  props: ['ws'],
  data() {
    return {
      query: { date_start: '', date_end: '' },
      materials: [],          // 下拉候选：仅有入库数据的物料
      material_ids: [],
      materialKeyword: '',
      materialFocused: false,
      page: 1, pageSize: 20, total: 0, list: [],
      loading: false, message: '', msgType: ''
    };
  },
  computed: {
    // 关键词匹配的物料全集（不截断）
    matchedMaterials() {
      const kw = (this.materialKeyword || '').trim().toLowerCase();
      if (!kw) return this.materials;
      return this.materials.filter(m =>
        (m.material_id || '').toLowerCase().indexOf(kw) >= 0 ||
        (m.material_name || '').toLowerCase().indexOf(kw) >= 0 ||
        (m.material_spec || '').toLowerCase().indexOf(kw) >= 0
      );
    },
    filteredMaterials() {
      return this.matchedMaterials.slice(0, 80);
    },
    allMatchedSelected() {
      const list = this.matchedMaterials;
      return list.length > 0 && list.every(m => this.material_ids.indexOf(m.material_id) >= 0);
    },
    selectedMaterials() {
      return this.material_ids.map(id => {
        const m = this.materials.find(x => x.material_id === id);
        return m || { material_id: id, material_name: '', material_spec: '' };
      });
    }
  },
  methods: {
    today() { return new Date().toISOString().slice(0, 10); },
    async loadStockMaterials() {
      const res = await this.ws.send('queryStockMovementMaterials');
      if (res.success && res.data && res.data.list) {
        this.materials = res.data.list;
      }
    },
    onDocClick(e) {
      const wrap = this.$refs.materialSelector;
      if (wrap && !wrap.contains(e.target)) this.materialFocused = false;
    },
    toggleMaterial(m) {
      const idx = this.material_ids.indexOf(m.material_id);
      if (idx >= 0) {
        this.material_ids.splice(idx, 1);
      } else {
        this.material_ids.push(m.material_id);
      }
      this.materialKeyword = '';
      this.materialFocused = true;
      this.$nextTick(() => { this.$refs.materialInput && this.$refs.materialInput.focus(); });
    },
    clearMaterials() {
      this.material_ids = [];
      this.materialKeyword = '';
      this.$nextTick(() => { this.$refs.materialInput && this.$refs.materialInput.focus(); });
    },
    // 全选 / 取消全选（作用于当前关键词匹配的全部物料）
    toggleSelectAll() {
      const list = this.matchedMaterials;
      if (!list.length) return;
      const ids = list.map(m => m.material_id);
      if (this.allMatchedSelected) {
        this.material_ids = this.material_ids.filter(id => ids.indexOf(id) < 0);
      } else {
        ids.forEach(id => { if (this.material_ids.indexOf(id) < 0) this.material_ids.push(id); });
      }
      this.materialKeyword = '';
      this.materialFocused = true;
      this.$nextTick(() => { this.$refs.materialInput && this.$refs.materialInput.focus(); });
    },
    inputFocus() {
      this.materialFocused = true;
    },
    async search() {
      this.loading = true; this.message = '';
      const res = await this.ws.send('queryStockMovementReport', {
        date_start: this.query.date_start,
        date_end: this.query.date_end,
        material_ids: this.material_ids.slice(),
        page: this.page, page_size: this.pageSize
      });
      this.loading = false;
      if (res.success) {
        this.list = res.data.list;
        this.total = res.data.total;
      } else {
        this.msgType = 'err'; this.message = res.message;
      }
    },
    doSearch() { this.page = 1; this.search(); },
    onPageChange(p) { this.page = p; this.search(); },
    onPageSizeChange(s) { this.pageSize = s; this.page = 1; this.search(); },
    clsRemaining(v) { if (v <= 0) return '#dc2626'; if (v < 5) return '#d97706'; return '#059669'; },
    clsPending(v) { return v > 0 ? '#d97706' : '#909399'; }
  },
  mounted() {
    const d = new Date();
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    this.query.date_start = first.toISOString().slice(0, 10);
    this.query.date_end = this.today();
    this.loadStockMaterials();
    document.addEventListener('click', this.onDocClick);
    this.search();
  },
  beforeDestroy() {
    document.removeEventListener('click', this.onDocClick);
  },
  template: `
    <div class="yield-page">
      <div class="page-title">库存异动报表</div>

      <div class="panel">
        <div class="form-row" style="display:flex;align-items:center;flex-wrap:wrap;gap:0;">
          <label>入库日期：</label>
          <input type="date" v-model="query.date_start" style="width:140px;">
          <span style="margin:0 4px;">至</span>
          <input type="date" v-model="query.date_end" style="width:140px;">
          <label style="margin-left:12px;">物料：</label>
          <div class="yield-mat-select" ref="materialSelector" style="min-width:300px;">
            <div class="yield-mat-input-row" style="flex-wrap:nowrap;overflow:hidden;">
              <span v-if="material_ids.length"
                    :title="selectedMaterials.map(m => m.material_id + (m.material_name ? ' ' + m.material_name : '')).join(' / ')"
                    style="flex:0 1 auto;max-width:180px;display:inline-flex;align-items:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:#e8f0fe;color:#1a56a8;border:1px solid #c7d9f7;border-radius:4px;padding:4px 6px;font-size:12px;line-height:16px;margin-right:4px;">
                <span style="overflow:hidden;text-overflow:ellipsis;">已选 {{ material_ids.length }} 项：{{ material_ids.join('、') }}</span>
                <span style="margin-left:4px;cursor:pointer;font-weight:600;flex:0 0 auto;" @click.stop="clearMaterials" title="清空已选物料">×</span>
              </span>
              <input ref="materialInput" type="text"
                     class="yield-mat-input"
                     style="flex:1 1 80px;min-width:80px;width:auto;"
                     v-model="materialKeyword"
                     placeholder="输入料号或名称搜索，可多选；不选=全部"
                     @focus="inputFocus"
                     @keydown.enter.prevent="materialFocused = false">
            </div>
            <div v-if="materialFocused && filteredMaterials.length" class="yield-mat-dropdown">
              <div class="yield-mat-option" style="border-bottom:1px solid #ebeef5;"
                   @mousedown.prevent="toggleSelectAll">
                <div class="yield-mat-opt-id" style="color:#1a56a8;font-weight:600;">
                  <span style="display:inline-block;width:14px;">{{ allMatchedSelected ? '✓' : '' }}</span>
                  {{ allMatchedSelected ? '取消全选' : '全选' }}（当前匹配 {{ matchedMaterials.length }} 项）
                </div>
              </div>
              <div v-for="m in filteredMaterials" :key="m.material_id"
                   class="yield-mat-option"
                   :class="{ sel: material_ids.indexOf(m.material_id) >= 0 }"
                   @mousedown.prevent="toggleMaterial(m)">
                <div class="yield-mat-opt-id">
                  <span style="display:inline-block;width:14px;">{{ material_ids.indexOf(m.material_id) >= 0 ? '✓' : '' }}</span>{{ m.material_id }}
                </div>
                <div class="yield-mat-opt-name">{{ m.material_name }}<span v-if="m.material_spec" class="yield-mat-opt-spec"> · {{ m.material_spec }}</span></div>
              </div>
            </div>
            <div v-else-if="materialFocused && materialKeyword && !filteredMaterials.length" class="yield-mat-dropdown yield-mat-empty">
              没有匹配的物料
            </div>
          </div>
          <button style="margin-left:16px;" @click="doSearch">查询</button>
        </div>
        <div v-if="message" :class="['tip', msgType]" style="margin-top:10px;">{{ message }}</div>
      </div>

      <div class="panel" style="margin-top:16px;">
        <table>
          <thead>
            <tr>
              <th style="width:140px;">品号</th>
              <th style="width:130px;">品名</th>
              <th style="width:140px;">规格型号</th>
              <th style="width:80px;text-align:right;">数量</th>
              <th style="width:140px;">厂家名称</th>
              <th style="width:110px;">物料入库时间</th>
              <th style="width:90px;text-align:right;">已检测数量</th>
              <th style="width:90px;text-align:right;">待检测数量</th>
              <th style="width:90px;text-align:right;">已装配</th>
              <th style="width:90px;text-align:right;">剩余库存</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in list" :key="r.material_id">
              <td>{{ r.material_id }}</td>
              <td>{{ r.material_name }}</td>
              <td>{{ r.material_spec || '-' }}</td>
              <td style="text-align:right;">{{ r.in_qty }}</td>
              <td>{{ r.supplier_name || '-' }}</td>
              <td>{{ r.last_arrival_date || '-' }}</td>
              <td style="text-align:right;">{{ r.checked_qty }}</td>
              <td style="text-align:right;" :style="{color: clsPending(r.pending_qty), fontWeight: r.pending_qty > 0 ? 600 : 400}">
                {{ r.pending_qty }}
              </td>
              <td style="text-align:right;">{{ r.assembled_qty }}</td>
              <td style="text-align:right;font-weight:600;" :style="{color: clsRemaining(r.remaining_qty)}">
                {{ r.remaining_qty }}
              </td>
            </tr>
            <tr v-if="!loading && !list.length">
              <td colspan="10" style="text-align:center;color:#909399;">暂无数据</td>
            </tr>
            <tr v-if="loading">
              <td colspan="10" style="text-align:center;color:#909399;">加载中…</td>
            </tr>
          </tbody>
        </table>
        <vue-pager :page="page" :page-size="pageSize" :total="total"
                   @change="onPageChange" @size-change="onPageSizeChange"></vue-pager>
      </div>

    </div>
  `
});

// ========== 检验执行报表 ==========
Vue.component('page-inspection-execution-report', {
  props: ['ws'],
  data() {
    return {
      query: { date_start: '', date_end: '', keyword: '', supplier_id: '', is_complete: '' },
      suppliers: [],
      page: 1, pageSize: 20, total: 0, list: [],
      loading: false, message: '', msgType: ''
    };
  },
  methods: {
    today() { return new Date().toISOString().slice(0, 10); },
    async loadSuppliers() {
      const res = await this.ws.send('querySuppliers', { page: 1, page_size: 500 });
      if (res.success && res.data && res.data.list) this.suppliers = res.data.list;
    },
    async search() {
      this.loading = true; this.message = '';
      const res = await this.ws.send('queryInspectionExecutionReport', {
        date_start: this.query.date_start,
        date_end: this.query.date_end,
        keyword: this.query.keyword.trim(),
        supplier_id: this.query.supplier_id || null,
        is_complete: this.query.is_complete === '' ? null : this.query.is_complete,
        page: this.page, page_size: this.pageSize
      });
      this.loading = false;
      if (res.success) {
        this.list = res.data.list;
        this.total = res.data.total;
      } else {
        this.msgType = 'err'; this.message = res.message;
      }
    },
    doSearch() { this.page = 1; this.search(); },
    onPageChange(p) { this.page = p; this.search(); },
    onPageSizeChange(s) { this.pageSize = s; this.page = 1; this.search(); },
    yieldColor(v) {
      if (v >= 95) return '#059669';
      if (v >= 85) return '#1d4ed8';
      if (v >= 70) return '#d97706';
      return '#dc2626';
    },
    resultText(r) {
      if (r === 1) return { text: '合格', color: '#059669' };
      if (r === 2) return { text: '不合格', color: '#dc2626' };
      return { text: '待定', color: '#909399' };
    },
    // 计算当前到货单分组在表格中占用的行数（用于 rowspan）
    rowspanCount(idx) {
      const curId = this.list[idx].arrival_order_id;
      let cnt = 1;
      for (let k = idx + 1; k < this.list.length && this.list[k].arrival_order_id === curId; k++) cnt++;
      return cnt;
    }
  },
  mounted() {
    const d = new Date();
    const first = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    this.query.date_start = first.toISOString().slice(0, 10);
    this.query.date_end = this.today();
    this.loadSuppliers();
    this.search();
  },
  template: `
    <div class="yield-page">
      <div class="page-title">检验执行报表</div>

      <div class="panel">
        <div class="form-row" style="display:flex;align-items:center;flex-wrap:wrap;gap:0;">
          <label>到货日期：</label>
          <input type="date" v-model="query.date_start" style="width:140px;">
          <span style="margin:0 4px;">至</span>
          <input type="date" v-model="query.date_end" style="width:140px;">
          <label style="margin-left:12px;">供应商：</label>
          <select v-model="query.supplier_id" style="width:140px;">
            <option value="">全部</option>
            <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.supplier_name }}</option>
          </select>
          <label style="margin-left:12px;">状态：</label>
          <select v-model="query.is_complete" style="width:110px;">
            <option value="">全部</option>
            <option value="0">待完成</option>
            <option value="1">已完成</option>
          </select>
          <label style="margin-left:12px;">关键词：</label>
          <input v-model="query.keyword" placeholder="品号 / 品名 / SN号" style="width:180px;" @keyup.enter="doSearch">
          <button style="margin-left:16px;" @click="doSearch">查询</button>
        </div>
        <div v-if="message" :class="['tip', msgType]" style="margin-top:10px;">{{ message }}</div>
      </div>

      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="!list.length" class="empty">暂无数据</div>
      <table v-else class="tbl" cellspacing="0" cellpadding="0" border="1" style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#f7f8fa;">
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:100px;text-align:center;">到货日期</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:130px;text-align:center;">供应商</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:120px;text-align:center;">品号</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:100px;text-align:center;">品名</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:160px;text-align:center;">规格型号</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:70px;text-align:center;">数量</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:90px;text-align:center;">已检验</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:90px;text-align:center;">待检验</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:100px;text-align:center;">检验周期</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:130px;text-align:center;">检验日期</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:170px;text-align:center;">SN号/批次</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:85px;text-align:center;">合格/总项</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:70px;text-align:center;">良率</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in list" :key="row.inspection_id" :class="{ 'row-alt': idx % 2 }">
            <!-- 到货单维度列：只在分组第一行显示，视觉上合并行 -->
            <template v-if="row.same_arrival_start">
              <td :rowspan="rowspanCount(idx)"
                  style="padding:6px 8px;border:#e5e7eb 1px solid;background:#fafbfc;vertical-align:middle;text-align:center;">{{ row.arrival_date }}</td>
              <td :rowspan="rowspanCount(idx)"
                  style="padding:6px 8px;border:#e5e7eb 1px solid;background:#fafbfc;vertical-align:middle;font-weight:600;">{{ row.supplier_name }}</td>
              <td :rowspan="rowspanCount(idx)"
                  style="padding:6px 8px;border:#e5e7eb 1px solid;background:#fafbfc;vertical-align:middle;">{{ row.material_id }}</td>
              <td :rowspan="rowspanCount(idx)"
                  style="padding:6px 8px;border:#e5e7eb 1px solid;background:#fafbfc;vertical-align:middle;">{{ row.material_name }}</td>
              <td :rowspan="rowspanCount(idx)"
                  style="padding:6px 8px;border:#e5e7eb 1px solid;background:#fafbfc;vertical-align:middle;">{{ row.material_spec }}</td>
              <td :rowspan="rowspanCount(idx)"
                  style="padding:6px 8px;border:#e5e7eb 1px solid;background:#fafbfc;vertical-align:middle;text-align:center;">{{ row.arrival_qty }}</td>
              <td :rowspan="rowspanCount(idx)"
                  style="padding:6px 8px;border:#e5e7eb 1px solid;background:#fafbfc;vertical-align:middle;text-align:center;color:#1d4ed8;font-weight:600;">{{ row.inspected_count }}</td>
              <td :rowspan="rowspanCount(idx)"
                  style="padding:6px 8px;border:#e5e7eb 1px solid;background:#fafbfc;vertical-align:middle;text-align:center;color:#d97706;font-weight:600;">{{ row.pending_count }}</td>
              <td :rowspan="rowspanCount(idx)"
                  style="padding:6px 8px;border:#e5e7eb 1px solid;background:#fafbfc;vertical-align:middle;text-align:center;font-weight:600;">{{ row.inspect_cycle }}{{ row.inspect_cycle !== '' ? ' 天' : '' }}</td>
            </template>
            <!-- 检验单维度列：每行都显示，样式与左侧合并行一致 -->
            <td style="padding:6px 8px;border:#e5e7eb 1px solid;background:#fafbfc;text-align:center;">{{ row.inspect_date }}</td>
            <td style="padding:6px 8px;border:#e5e7eb 1px solid;background:#fafbfc;text-align:center;font-family:monospace;">{{ row.batch_no }}</td>
            <td style="padding:6px 8px;border:#e5e7eb 1px solid;background:#fafbfc;text-align:center;">
              <span :style="{ color: row.pass_count === row.total_count ? '#059669' : '#dc2626', fontWeight: 600 }">
                {{ row.pass_count }}
              </span> / {{ row.total_count }}
            </td>
            <td style="padding:6px 8px;border:#e5e7eb 1px solid;background:#fafbfc;text-align:center;font-weight:600;"
                :style="{ color: yieldColor(row.yield_rate) }">
              {{ row.total_count ? row.yield_rate + '%' : '-' }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pager">
        <button :disabled="page <= 1" @click="onPageChange(1)">首页</button>
        <button :disabled="page <= 1" @click="onPageChange(page - 1)">上一页</button>
        <span style="margin:0 10px;">第 {{ page }} / {{ Math.ceil(total / pageSize) }} 页，共 {{ total }} 条</span>
        <button :disabled="page >= Math.ceil(total / pageSize)" @click="onPageChange(page + 1)">下一页</button>
        <button :disabled="page >= Math.ceil(total / pageSize)" @click="onPageChange(Math.ceil(total / pageSize))">末页</button>
        <select :value="pageSize" @change="onPageSizeChange(Number($event.target.value))" style="margin-left:10px;">
          <option :value="20">20 条/页</option>
          <option :value="50">50 条/页</option>
          <option :value="100">100 条/页</option>
        </select>
      </div>
    </div>
  `
});

// ========== 供应商良率报表 ==========
Vue.component('page-supplier-yield-report', {
  props: ['ws', 'nav'],
  data() {
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    return {
      suppliers: [],
      query: {
        date_start: first.toISOString().slice(0, 10),
        date_end: today.toISOString().slice(0, 10),
        supplier_id: null,
        keyword: ''
      },
      list: [],
      total: 0,
      page: 1,
      page_size: 50,
      loading: false,
      message: '',
      msgType: 'info'
    };
  },
  computed: {
    totalPages() { return Math.max(1, Math.ceil(this.total / this.page_size)); }
  },
  mounted() {
    this.loadSuppliers();
    this.search();
  },
  template: `
    <div class="yield-page">
      <div class="page-title">供应商良率报表</div>

      <div class="panel">
        <div class="form-row" style="display:flex;align-items:center;flex-wrap:wrap;gap:0;">
          <label>到货日期：</label>
          <input type="date" v-model="query.date_start" style="width:140px;">
          <span style="margin:0 4px;">至</span>
          <input type="date" v-model="query.date_end" style="width:140px;">
          <label style="margin-left:12px;">供应商：</label>
          <select v-model="query.supplier_id" style="width:160px;">
            <option :value="null">全部</option>
            <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.supplier_name }}</option>
          </select>
          <label style="margin-left:12px;">关键词：</label>
          <input v-model="query.keyword" placeholder="品号 / 品名 / 供应商" style="width:180px;" @keyup.enter="search">
          <button style="margin-left:16px;" @click="search">查询</button>
        </div>
        <div v-if="message" :class="['tip', msgType]" style="margin-top:10px;">{{ message }}</div>
      </div>

      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="!list.length" class="empty">暂无数据</div>
      <table v-else class="tbl" cellspacing="0" cellpadding="0" border="1" style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#f7f8fa;">
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:60px;text-align:center;">序号</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:130px;text-align:center;">供应商</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:120px;text-align:center;">品号</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:100px;text-align:center;">品名</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:180px;text-align:center;">规格型号</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:80px;text-align:center;">到货数量</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:80px;text-align:center;">检验数量</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:80px;text-align:center;">合格项</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:80px;text-align:center;">总项</th>
            <th style="padding:8px 6px;border:#e5e7eb 1px solid;min-width:80px;text-align:center;">良率</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(row, idx) in list" :key="row.supplier_id + '-' + row.material_id">
            <!-- 供应商首行：合并供应商列 -->
            <tr v-if="isSupplierFirst(idx)" :class="{ 'row-alt': idx % 2 }">
              <td :rowspan="supplierRowspan(idx)"
                  style="padding:6px;border:#e5e7eb 1px solid;background:#fafbfc;vertical-align:middle;text-align:center;font-weight:500;">{{ supplierSeq(idx) }}</td>
              <td :rowspan="supplierRowspan(idx)"
                  style="padding:6px;border:#e5e7eb 1px solid;background:#fafbfc;vertical-align:middle;font-weight:600;">{{ row.supplier_name }}</td>
              <td style="padding:6px;border:#e5e7eb 1px solid;background:#fafbfc;text-align:center;">{{ row.material_id }}</td>
              <td style="padding:6px;border:#e5e7eb 1px solid;background:#fafbfc;text-align:center;">{{ row.material_name }}</td>
              <td style="padding:6px;border:#e5e7eb 1px solid;background:#fafbfc;">{{ row.material_spec }}</td>
              <td style="padding:6px;border:#e5e7eb 1px solid;background:#fafbfc;text-align:center;">{{ row.arrival_qty }}</td>
              <td style="padding:6px;border:#e5e7eb 1px solid;background:#fafbfc;text-align:center;">{{ row.inspect_count }}</td>
              <td style="padding:6px;border:#e5e7eb 1px solid;background:#fafbfc;text-align:center;color:#059669;">{{ row.pass_count }}</td>
              <td style="padding:6px;border:#e5e7eb 1px solid;background:#fafbfc;text-align:center;">{{ row.total_count }}</td>
              <td style="padding:6px;border:#e5e7eb 1px solid;background:#fafbfc;text-align:center;font-weight:700;"
                  :style="{ color: yieldColor(row.weighted_yield) }">{{ row.weighted_yield }}%</td>
            </tr>
            <!-- 供应商后续行 -->
            <tr v-else :class="{ 'row-alt': idx % 2 }">
              <td style="padding:6px;border:#e5e7eb 1px solid;background:#fafbfc;text-align:center;">{{ row.material_id }}</td>
              <td style="padding:6px;border:#e5e7eb 1px solid;background:#fafbfc;text-align:center;">{{ row.material_name }}</td>
              <td style="padding:6px;border:#e5e7eb 1px solid;background:#fafbfc;">{{ row.material_spec }}</td>
              <td style="padding:6px;border:#e5e7eb 1px solid;background:#fafbfc;text-align:center;">{{ row.arrival_qty }}</td>
              <td style="padding:6px;border:#e5e7eb 1px solid;background:#fafbfc;text-align:center;">{{ row.inspect_count }}</td>
              <td style="padding:6px;border:#e5e7eb 1px solid;background:#fafbfc;text-align:center;color:#059669;">{{ row.pass_count }}</td>
              <td style="padding:6px;border:#e5e7eb 1px solid;background:#fafbfc;text-align:center;">{{ row.total_count }}</td>
              <td style="padding:6px;border:#e5e7eb 1px solid;background:#fafbfc;text-align:center;font-weight:700;"
                  :style="{ color: yieldColor(row.weighted_yield) }">{{ row.weighted_yield }}%</td>
            </tr>
          </template>
        </tbody>
      </table>

      <div v-if="list.length" class="pagination" style="margin-top:14px;text-align:right;">
        <span style="margin-right:12px;color:#666;">共 {{ total }} 条</span>
        <button :disabled="page <= 1" @click="goPage(1)">首页</button>
        <button :disabled="page <= 1" @click="goPage(page - 1)">上一页</button>
        <span style="margin:0 10px;">{{ page }} / {{ totalPages }}</span>
        <button :disabled="page >= totalPages" @click="goPage(page + 1)">下一页</button>
        <button :disabled="page >= totalPages" @click="goPage(totalPages)">末页</button>
      </div>
    </div>
  `,
  methods: {
    async loadSuppliers() {
      const res = await this.ws.send('querySuppliers', { page: 1, page_size: 500 });
      if (res.success) this.suppliers = res.data?.list || [];
    },
    isSupplierFirst(idx) {
      if (idx === 0) return true;
      return this.list[idx].supplier_id !== this.list[idx - 1].supplier_id;
    },
    supplierRowspan(idx) {
      // 从 idx 开始数连续相同 supplier_id 的行数
      const sid = this.list[idx].supplier_id;
      let cnt = 1;
      for (let i = idx + 1; i < this.list.length; i++) {
        if (this.list[i].supplier_id === sid) cnt++; else break;
      }
      return cnt;
    },
    supplierSeq(idx) {
      // 供应商序号（全局连续，按供应商分组内首次出现计数）
      let seq = 0;
      for (let i = 0; i <= idx; i++) {
        if (i === 0 || this.list[i].supplier_id !== this.list[i - 1].supplier_id) seq++;
      }
      return seq;
    },
    yieldColor(y) {
      if (y >= 95) return '#059669';
      if (y >= 85) return '#1d4ed8';
      if (y >= 70) return '#d97706';
      return '#dc2626';
    },
    async search() {
      this.page = 1;
      await this.doSearch();
    },
    async doSearch() {
      this.loading = true;
      this.message = '';
      const res = await this.ws.send('querySupplierYieldReport', {
        date_start: this.query.date_start,
        date_end: this.query.date_end,
        supplier_id: this.query.supplier_id || null,
        keyword: this.query.keyword,
        page: this.page,
        page_size: this.page_size
      });
      this.loading = false;
      if (!res.success) {
        this.msgType = 'error';
        this.message = res.message || '查询失败';
        this.list = [];
        this.total = 0;
        return;
      }
      this.list = res.data?.list || [];
      this.total = res.data?.total || 0;
    },
    goPage(p) {
      if (p < 1 || p > this.totalPages) return;
      this.page = p;
      this.doSearch();
    }
  }
});

// ========== 良率分析 - 检验项目明细 ==========
Vue.component('page-yield-detail', {
  props: ['ws', 'nav', 'params'],
  data() {
    return {
      loading: false,
      message: '',
      messageType: '',
      rows: [],
      total: 0,
      passCount: 0,
      page: 1,
      pageSize: 30,
      itemName: ''
    };
  },
  computed: {
    passRate() {
      return this.total ? Number(((this.passCount / this.total) * 100).toFixed(2)) : 0;
    }
  },
  mounted() { this.load(); },
  methods: {
    async load() {
      const p = this.params || {};
      if (!p.material_id || !p.date_start || !p.date_end || !p.item_id) {
        this.message = '缺少查询参数，请从良率分析页点击柱状图进入';
        this.messageType = 'err';
        return;
      }
      this.loading = true;
      this.message = '';
      const res = await this.ws.send('queryYieldItemDetail', {
        material_id: p.material_id,
        date_start: p.date_start,
        date_end: p.date_end,
        item_id: p.item_id,
        page: this.page,
        page_size: this.pageSize
      });
      this.loading = false;
      if (!res.success) {
        this.message = res.message || '查询失败';
        this.messageType = 'err';
        return;
      }
      this.rows = res.data.list || [];
      this.total = res.data.total;
      this.passCount = res.data.pass_count;
      this.itemName = res.data.item_name || p.item_name || '';
    },
    onPageChange(p) { this.page = p; this.load(); },
    onSizeChange(size) { this.pageSize = size; this.page = 1; this.load(); },
    measured(r) {
      const v = r.measured_val;
      if (v !== null && v !== undefined && String(v).trim() !== '') return v;
      const t = r.measured_text;
      if (t !== null && t !== undefined && String(t).trim() !== '') return t;
      return '-';
    },
    standardRange(v) {
      if (!v) return '-';
      return '[' + String(v).split(',').join(', ') + ']';
    },
    yieldColor(pct) {
      if (pct >= 95) return '#059669';
      if (pct >= 80) return '#d97706';
      return '#dc2626';
    },
    openRecord(sn) { this.nav('page-record-detail', { sn }); },
    back() { this.nav('page-yield-analysis'); }
  },
  template: `
    <div class="yield-page">
      <div class="page-title">检验项目明细</div>

      <div class="yield-search" style="justify-content:space-between;">
        <button @click="back">返回良率分析</button>
      </div>

      <div v-if="message" class="yield-empty" :style="{color: messageType === 'err' ? '#dc2626' : '#059669'}">{{ message }}</div>

      <template v-if="!message">
        <div class="yield-header">
          <div class="yh-card">
            <div class="yh-label">物料</div>
            <div class="yh-value">{{ params.material_id }}<span v-if="params.material_name"> · {{ params.material_name }}</span></div>
          </div>
          <div class="yh-card">
            <div class="yh-label">检验项目</div>
            <div class="yh-value">{{ itemName || params.item_id }}</div>
          </div>
          <div class="yh-card">
            <div class="yh-label">时间范围</div>
            <div class="yh-value">{{ params.date_start }} ~ {{ params.date_end }}</div>
          </div>
          <div class="yh-card">
            <div class="yh-label">检验数量</div>
            <div class="yh-value big">{{ total }}</div>
          </div>
          <div class="yh-card">
            <div class="yh-label">合格数量</div>
            <div class="yh-value big" style="color:#059669;">{{ passCount }}</div>
          </div>
          <div class="yh-card">
            <div class="yh-label">良率</div>
            <div class="yh-value big" :style="{color: yieldColor(passRate)}">{{ passRate }}%</div>
          </div>
        </div>

        <div class="yield-section">
          <div class="yield-section-title">测量记录</div>
          <table class="yield-table" v-if="rows.length">
            <thead>
              <tr>
                <th style="width:230px;">SN（检验单号）</th>
                <th style="width:170px;">检验时间</th>
                <th style="width:150px;">测量值</th>
                <th style="width:120px;">标准值</th>
                <th style="width:150px;">标准区间</th>
                <th style="width:80px;">判定</th>
                <th style="width:110px;">检验员</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in rows" :key="r.id">
                <td><a href="javascript:;" @click="openRecord(r.sn)" style="color:#1e88e5;text-decoration:none;">{{ r.sn }}</a></td>
                <td>{{ r.inspect_date }}</td>
                <td style="font-weight:600;">{{ measured(r) }}</td>
                <td>{{ r.standard_value || '-' }}</td>
                <td>{{ standardRange(r.standard_range) }}</td>
                <td style="text-align:center;font-weight:600;" :style="{color: r.is_pass === 1 ? '#059669' : '#dc2626'}">{{ r.is_pass === 1 ? '合格' : '不合格' }}</td>
                <td>{{ r.inspector || '-' }}</td>
                <td>{{ r.remark || '-' }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else-if="!loading" class="yield-empty">该条件下暂无测量记录</div>
          <div v-if="loading" class="yield-empty">加载中...</div>
          <vue-pager :page="page" :pageSize="pageSize" :total="total"
                     @change="onPageChange" @size-change="onSizeChange" style="margin-top:14px;"></vue-pager>
        </div>
      </template>
    </div>
  `
});

// ========== 装配分析 ==========
Vue.component('page-assemble-analysis', {
  props: ['ws'],
  data() {
    return {
      main_sn: '',
      loading: false,
      header: null,
      versions: [],
      rows: [],
      change_summary: null,
      // SN 搜索下拉
      snList: [],
      snDropdown: false,
      snLoading: false,
      snTimer: null,
      focused: false
    };
  },
  mounted() {
    // 点击组件外部时关闭下拉
    this._clickOutsideHandler = (e) => {
      if (!this.$el.contains(e.target)) { this.snDropdown = false; }
    };
    document.addEventListener('click', this._clickOutsideHandler);
  },
  beforeDestroy() {
    document.removeEventListener('click', this._clickOutsideHandler);
    if (this.snTimer) clearTimeout(this.snTimer);
  },
  methods: {
    async query() {
      if (!this.main_sn) { alert('请输入装配单主件SN'); return; }
      this.loading = true;
      const res = await this.ws.send('getAssembleAnalysis', { main_sn: this.main_sn.trim() });
      this.loading = false;
      if (!res.success) { alert(res.message || '查询失败'); return; }
      this.header = res.data.header;
      this.versions = res.data.versions;
      this.rows = res.data.rows;
      this.change_summary = res.data.change_summary;
    },
    clearAll() {
      this.main_sn = '';
      this.header = null;
      this.versions = [];
      this.rows = [];
      this.change_summary = null;
      this.snList = [];
      this.snDropdown = false;
    },
    // SN 输入防抖
    onSnInput() {
      if (this.snTimer) clearTimeout(this.snTimer);
      this.snTimer = setTimeout(() => this.loadSnList(), 250);
    },
    async loadSnList() {
      this.snLoading = true;
      try {
        const res = await this.ws.send('searchMainSn', { keyword: this.main_sn.trim() });
        if (res.success) {
          this.snList = res.data || [];
          this.snDropdown = true;
        }
      } finally {
        this.snLoading = false;
      }
    },
    async showSnDropdown() {
      if (!this.snList.length) await this.loadSnList();
      this.snDropdown = true;
    },
    selectSn(sn) {
      this.main_sn = sn;
      this.snDropdown = false;
      this.query();
    },
    onSnFocus() {
      this.focused = true;
      this.showSnDropdown();
    },
    onSnBlur() {
      this.focused = false;
      // 延迟关闭，给 click 选中留时间
      setTimeout(() => { if (!this.focused) this.snDropdown = false; }, 150);
    },
    cellClass(ct) {
      return {
        'ana-same': ct === 'same',
        'ana-add': ct === 'add',
        'ana-remove': ct === 'remove',
        'ana-replace': ct === 'replace',
        'ana-none': ct === 'none'
      };
    },
    cellBg(ct) {
      switch (ct) {
        case 'add': return '#ecfdf5';       // 极浅绿底
        case 'remove': return '#fef2f2';    // 极浅红底
        case 'replace': return '#eff6ff';   // 极浅蓝底
        default: return '';
      }
    },
    cellColor(ct) {
      switch (ct) {
        case 'add': return '#047857';       // 深绿文字
        case 'remove': return '#dc2626';    // 深红文字
        case 'replace': return '#1d4ed8';   // 深蓝文字
        default: return '#1d2939';
      }
    }
  },
  template: `
    <div class="yield-page">
      <div class="page-title">装配分析</div>

      <!-- 查询条件 -->
      <div class="yield-search">
        <label>主件SN：</label>
        <div style="position:relative;display:inline-block;width:320px;">
          <input class="yield-mat-input" v-model="main_sn" placeholder="输入或选择装配单主件SN"
                 style="width:320px;padding-right:26px;"
                 @input="onSnInput" @focus="onSnFocus" @blur="onSnBlur"
                 @keyup.enter="selectSn(snList[0]?.main_sn || main_sn)">
          <span v-if="snLoading" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);color:#98a2b3;font-size:12px;">加载中...</span>
          <!-- 下拉列表 -->
          <div v-if="snDropdown"
               style="position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1px solid #d0d5dd;border-radius:8px;box-shadow:0 8px 24px rgba(16,24,40,.08);max-height:320px;overflow-y:auto;z-index:50;">
            <div v-if="!snList.length && !snLoading" style="padding:14px;color:#98a2b3;font-size:13px;text-align:center;">无匹配结果</div>
            <div v-for="(s, idx) in snList" :key="idx"
                 @mousedown.prevent="selectSn(s.main_sn)"
                 style="padding:10px 12px;cursor:pointer;border-bottom:1px solid #f2f4f7;transition:background .15s;"
                 @mouseenter="e => e.currentTarget.style.background = '#f9fafb'"
                 @mouseleave="e => e.currentTarget.style.background = ''">
              <div style="font-size:14px;font-weight:600;color:#1d2939;">{{ s.main_sn }}</div>
              <div style="font-size:12px;color:#667085;margin-top:2px;">
                <span v-if="s.material_name">{{ s.material_name }}</span>
                <span v-if="s.material_id || s.main_material_id" style="color:#98a2b3;margin-left:6px;">({{ s.main_material_id || s.material_id }})</span>
                <span v-if="s.assemble_date" style="color:#98a2b3;margin-left:8px;">{{ String(s.assemble_date).slice(0,10) }}</span>
                <span style="margin-left:6px;padding:1px 6px;border-radius:10px;font-size:11px;"
                      :style="{ background: s.is_complete == 1 ? '#dcfce7' : '#fef3c7', color: s.is_complete == 1 ? '#166534' : '#92400e' }">
                  {{ s.is_complete == 1 ? '已完成' : '未完成' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <button @click="query" :disabled="loading">{{ loading ? '查询中...' : '查询' }}</button>
        <button @click="clearAll">重置</button>
      </div>

      <template v-if="header">
        <!-- 装配单信息 -->
        <div class="yield-header">
          <div class="yh-card"><div class="yh-label">主件SN</div><div class="yh-value">{{ header.main_sn }}</div></div>
          <div class="yh-card"><div class="yh-label">主件料号</div><div class="yh-value">{{ header.main_material_id }}</div></div>
          <div class="yh-card"><div class="yh-label">主件品名</div><div class="yh-value">{{ header.main_material_name || '-' }}</div></div>
          <div class="yh-card"><div class="yh-label">主件规格</div><div class="yh-value">{{ header.main_material_spec || '-' }}</div></div>
          <div class="yh-card"><div class="yh-label">BOM版本</div><div class="yh-value">v{{ header.bom_version }}</div></div>
          <div class="yh-card"><div class="yh-label">装配日期</div><div class="yh-value">{{ header.assemble_date || '-' }}</div></div>
          <div class="yh-card"><div class="yh-label">操作员</div><div class="yh-value">{{ header.operator || '-' }}</div></div>
          <div class="yh-card"><div class="yh-label">装配状态</div>
            <div class="yh-value" :style="{color: header.is_complete == 1 ? '#059669' : '#d97706'}">
              {{ header.is_complete == 1 ? '已完成' : '未完成' }}
              <span style="font-size:12px;color:#667085;font-weight:400;">（{{ header.scanned_qty || 0 }}/{{ header.total_slots || 0 }}）</span>
            </div>
          </div>
          <div class="yh-card"><div class="yh-label">历史版本数</div><div class="yh-value">{{ header.history_count }}</div></div>
          <div class="yh-card"><div class="yh-label">最近修改人</div><div class="yh-value">{{ header.update_by || '-' }}</div></div>
          <div class="yh-card"><div class="yh-label">最近修改时间</div><div class="yh-value">{{ header.update_time ? String(header.update_time).slice(0,19).replace('T',' ') : '-' }}</div></div>
        </div>

        <!-- 变更统计 -->
        <div class="yield-header" v-if="change_summary" style="margin-top:14px;grid-template-columns:repeat(3,1fr);">
          <div class="yh-card"><div class="yh-label">新扫</div><div class="yh-value big" style="color:#10b981;">{{ change_summary.add }}</div></div>
          <div class="yh-card"><div class="yh-label">拆卸</div><div class="yh-value big" style="color:#ef4444;">{{ change_summary.remove }}</div></div>
          <div class="yh-card"><div class="yh-label">替换</div><div class="yh-value big" style="color:#1e88e5;">{{ change_summary.replace }}</div></div>
        </div>

        <!-- 变更矩阵 -->
        <div class="yield-section">
          <div class="yield-section-title">
            变更记录矩阵
            <span style="margin-left:12px;display:inline-flex;gap:14px;font-weight:400;font-size:12px;color:#667085;">
              <span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#10b981;border:1px solid #10b981;margin-right:4px;vertical-align:-1px;"></i>新扫</span>
              <span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#ef4444;border:1px solid #ef4444;margin-right:4px;vertical-align:-1px;"></i>拆卸</span>
              <span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#1e88e5;border:1px solid #1e88e5;margin-right:4px;vertical-align:-1px;"></i>替换</span>
            </span>
          </div>
          <div style="overflow-x:auto;">
            <table class="ana-table">
              <thead>
                <tr>
                  <th class="pin">元件料号</th>
                  <th class="pin">元件品名</th>
                  <th class="pin">元件规格</th>
                  <th v-for="v in versions" :key="v.version_no" class="ana-th-ver" :class="{'ana-th-current': v.is_current}">
                    <div style="font-weight:600;">{{ v.label }}</div>
                    <div style="font-size:11px;color:#667085;margin-top:2px;">{{ v.date }}</div>
                    <div style="font-size:11px;color:#909399;">{{ v.time }}</div>
                    <div style="font-size:10px;color:#909399;margin-top:1px;">{{ v.change_by }}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, ri) in rows" :key="ri">
                  <td class="pin">{{ r.component_material_id }}</td>
                  <td class="pin">{{ r.component_material_name || '-' }}</td>
                  <td class="pin">{{ r.component_material_spec || '-' }}</td>
                  <td v-for="c in r.cells" :key="c.version_no"
                      :class="['ana-cell', cellClass(c.change_type)]"
                      :style="{ background: cellBg(c.change_type), color: cellColor(c.change_type) }"
                      :title="c.sn || ''">
                    <template v-if="c.change_type === 'none'"><span class="ana-cell-none">—</span></template>
                    <template v-else-if="c.sn"><div class="ana-cell-sn">{{ c.sn }}</div></template>
                  </td>
                </tr>
                <tr v-if="!rows.length"><td :colspan="3 + versions.length" style="text-align:center;color:#909399;padding:20px;">暂无元件数据</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <div v-else-if="!loading" class="yield-intro">
        <div style="font-size:16px;font-weight:600;margin-bottom:10px;">装配分析报表</div>
        <div style="color:#667085;line-height:1.8;">
          输入装配单主件SN后点击"查询"，将展示：<br>
          • 装配单主件信息（料号、品名、规格、BOM版本、完成状态等）<br>
          • 变更记录矩阵：每行一个元件，每列一个版本<br>
          • 颜色标识：<span style="color:#10b981;font-weight:600;">绿色=新扫</span>　<span style="color:#1e88e5;font-weight:600;">蓝色=替换</span>　<span style="color:#ef4444;font-weight:600;">红色=拆卸</span>
        </div>
      </div>
    </div>
  `
});

// ========== 自定义报表列表 ==========
Vue.component('page-custom-report', {
  props: ['ws', 'nav'],
  data() {
    return {
      filters: { report_code: '', report_name: '' },
      list: [],
      total: 0,
      page: 1,
      pageSize: 20,
      selectedIds: [],
      modal: { open: false, mode: 'add', id: null },
      form: { report_code: '', report_name: '', sql_text: '', filterFields: [] },
      sqlColumns: [],
      parsing: false,
      saving: false,
      msg: '',
      msgType: ''
    };
  },
  computed: {
    allChecked: {
      get() { return this.list.length > 0 && this.list.every(r => this.selectedIds.includes(r.id)); },
      set(v) { this.selectedIds = v ? this.list.map(r => r.id) : []; }
    }
  },
  methods: {
    async load() {
      const res = await this.ws.send('queryCustomReports', { ...this.filters, page: this.page, page_size: this.pageSize });
      if (res.success) { this.list = res.data.list; this.total = res.data.total; this.selectedIds = []; }
    },
    doSearch() { this.page = 1; this.load(); },
    reset() {
      this.filters = { report_code: '', report_name: '' };
      this.page = 1;
      this.load();
    },
    onPageChange(p) { this.page = p; this.load(); },
    onPageSizeChange(s) { this.pageSize = s; this.page = 1; this.load(); },
    fmtTime(v) { return v ? String(v).replace('T', ' ').slice(0, 19) : '-'; },
    openAdd() {
      this.modal = { open: true, mode: 'add', id: null };
      this.form = { report_code: '', report_name: '', sql_text: '', filterFields: [] };
      this.sqlColumns = [];
      this.msg = '';
    },
    openEdit(row) {
      this.modal = { open: true, mode: 'edit', id: row.id };
      this.form = {
        report_code: row.report_code,
        report_name: row.report_name,
        sql_text: row.sql_text,
        filterFields: this.parseFilterFields(row.filter_fields)
      };
      this.sqlColumns = [];
      this.msg = '';
    },
    // 解析后端返回的 filter_fields（JSON 字符串或数组）
    parseFilterFields(raw) {
      if (!raw) return [];
      try {
        const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return Array.isArray(arr) ? arr : [];
      } catch { return []; }
    },
    // 解析 SQL 字段：调用后端取列名
    async parseColumns() {
      if (!this.form.sql_text.trim()) { this.msg = '请先填写 SQL'; this.msgType = 'error'; return; }
      this.parsing = true;
      this.msg = '';
      const res = await this.ws.send('parseSqlColumns', { sql_text: this.form.sql_text });
      this.parsing = false;
      if (!res.success) { this.msg = res.message || '解析失败'; this.msgType = 'error'; this.sqlColumns = []; return; }
      this.sqlColumns = res.data.columns || [];
      // 已选条件中若有字段不在新列名里，自动剔除
      const colSet = new Set(this.sqlColumns);
      this.form.filterFields = this.form.filterFields.filter(f => colSet.has(f.field));
      this.msg = `解析成功，共 ${this.sqlColumns.length} 个字段，请在下方选择查询条件`;
      this.msgType = 'success';
    },
    // 切换某列是否作为查询条件
    toggleFilter(col) {
      const idx = this.form.filterFields.findIndex(f => f.field === col);
      if (idx >= 0) {
        this.form.filterFields.splice(idx, 1);
      } else {
        this.form.filterFields.push({ field: col, label: col, op: 'like' });
      }
    },
    isFilterSelected(col) {
      return this.form.filterFields.some(f => f.field === col);
    },
    closeModal() { this.modal.open = false; },
    async save() {
      if (this.saving) return;
      this.msg = '';
      this.msgType = '';
      if (this.modal.mode === 'add') {
        if (!this.form.report_code.trim()) { this.msg = '请填写报表编号'; this.msgType = 'error'; return; }
      }
      if (!this.form.report_name.trim()) { this.msg = '请填写报表名称'; this.msgType = 'error'; return; }
      if (!this.form.sql_text.trim()) { this.msg = '请填写 SQL'; this.msgType = 'error'; return; }
      this.saving = true;
      let res;
      if (this.modal.mode === 'add') {
        res = await this.ws.send('createCustomReport', {
          report_code: this.form.report_code.trim(),
          report_name: this.form.report_name.trim(),
          sql_text: this.form.sql_text,
          filter_fields: this.form.filterFields
        });
      } else {
        res = await this.ws.send('updateCustomReport', {
          id: this.modal.id,
          report_name: this.form.report_name.trim(),
          sql_text: this.form.sql_text,
          filter_fields: this.form.filterFields
        });
      }
      this.saving = false;
      if (!res.success) { this.msg = res.message || '保存失败'; this.msgType = 'error'; return; }
      this.msg = '保存成功';
      this.msgType = 'success';
      this.modal.open = false;
      this.load();
    },
    async batchDelete() {
      if (!this.selectedIds.length) return;
      const ok = confirm(`确认删除选中的 ${this.selectedIds.length} 个自定义报表？此操作不可恢复。`);
      if (!ok) return;
      const res = await this.ws.send('deleteCustomReports', { ids: this.selectedIds });
      if (res.success) {
        alert(`已删除 ${res.data.deleted} 个报表`);
        this.load();
      } else {
        alert('删除失败：' + res.message);
      }
    },
    openViewer(row) { this.nav('page-custom-report-viewer', { id: row.id }); }
  },
  mounted() { this.load(); },
  template: `
    <div>
      <div class="page-title">自定义报表</div>
      <div class="panel">
        <div class="form-row">
          <label>报表编号：</label><input v-model="filters.report_code" placeholder="模糊" @keyup.enter="doSearch">
          <label style="margin-left:12px;">报表名称：</label><input v-model="filters.report_name" placeholder="模糊" @keyup.enter="doSearch">
          <button @click="doSearch" style="margin-left:12px;">查询</button>
          <button @click="reset" style="margin-left:8px;background:#909399;">重置</button>
          <button v-if="$root.hasFuncPerm('func-custom-report-add')" @click="openAdd" style="margin-left:8px;background:#10b981;">+ 新增</button>
          <button v-if="$root.hasFuncPerm('func-custom-report-delete') && selectedIds.length > 0" class="danger" style="margin-left:8px;" @click="batchDelete">批量删除（已选 {{ selectedIds.length }} 个）</button>
        </div>
      </div>
      <div class="panel" style="margin-top:16px;">
        <table style="table-layout:fixed;width:100%;">
          <thead><tr>
            <th style="width:40px;"><input type="checkbox" v-model="allChecked" @click.stop></th>
            <th style="width:60px;">ID</th>
            <th style="width:18%;">报表编号</th>
            <th style="width:30%;">报表名称</th>
            <th style="width:12%;">创建人</th>
            <th style="width:20%;">创建时间</th>
            <th style="width:90px;">操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td @click.stop><input type="checkbox" v-model="selectedIds" :value="r.id"></td>
              <td>{{ r.id }}</td>
              <td style="white-space:nowrap;">{{ r.report_code }}</td>
              <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" :title="r.report_name">
                <a href="javascript:;" @click="openViewer(r)" style="color:#1e88e5;text-decoration:none;">{{ r.report_name }}</a>
              </td>
              <td style="white-space:nowrap;">{{ r.create_by || '-' }}</td>
              <td style="white-space:nowrap;">{{ fmtTime(r.created_time) }}</td>
              <td style="white-space:nowrap;"><button v-if="$root.hasFuncPerm('func-custom-report-edit')" class="mini" @click="openEdit(r)">修改</button></td>
            </tr>
            <tr v-if="!list.length"><td colspan="7" style="text-align:center;color:#909399;">暂无数据</td></tr>
          </tbody>
        </table>
        <vue-pager :page="page" :page-size="pageSize" :total="total"
                   @change="onPageChange" @size-change="onPageSizeChange"></vue-pager>
      </div>

      <div v-if="modal.open" class="modal-mask" @click.self="closeModal">
        <div class="modal" style="max-width:820px;">
          <div class="modal-title">{{ modal.mode === 'add' ? '新增' : '修改' }}自定义报表
            <span style="float:right;cursor:pointer;" @click="closeModal">×</span>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <label style="width:90px;">报表编号：</label>
              <input v-model="form.report_code" :disabled="modal.mode === 'edit'" placeholder="唯一编号"
                     :style="{flex:1, background: modal.mode === 'edit' ? '#f5f7fa' : '', color: modal.mode === 'edit' ? '#909399' : ''}">
            </div>
            <div class="form-row" style="margin-top:10px;">
              <label style="width:90px;">报表名称：</label>
              <input v-model="form.report_name" placeholder="报表名称" style="flex:1;">
            </div>
            <div class="form-row" style="margin-top:10px;align-items:flex-start;">
              <label style="width:90px;line-height:30px;">SQL：</label>
              <textarea v-model="form.sql_text" rows="8" placeholder="仅支持 SELECT 查询语句"
                        style="flex:1;font-family:Consolas,monospace;font-size:13px;"></textarea>
            </div>
            <div class="form-row" style="margin-top:10px;">
              <label style="width:90px;"></label>
              <button @click="parseColumns" :disabled="parsing" style="background:#3b82f6;">
                {{ parsing ? '解析中...' : '解析查询字段' }}
              </button>
              <span style="margin-left:10px;color:#909399;font-size:12px;">填写 SQL 后点击解析，选择可作为查询条件的字段</span>
            </div>

            <!-- 查询条件选择 -->
            <div v-if="sqlColumns.length" style="margin-top:12px;border:1px solid #ebeef5;border-radius:4px;padding:10px;">
              <div style="font-size:13px;font-weight:600;color:#1565c0;margin-bottom:8px;">选择查询条件字段（已选 {{ form.filterFields.length }} 个）</div>
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                <div v-for="col in sqlColumns" :key="col"
                     :style="{display:'flex',alignItems:'center',gap:'4px',padding:'4px 8px',border:'1px solid #dcdfe6',borderRadius:'4px',background: isFilterSelected(col) ? '#ecf5ff' : '#fff'}">
                  <input type="checkbox" :checked="isFilterSelected(col)" @change="toggleFilter(col)">
                  <span style="font-size:13px;">{{ col }}</span>
                </div>
              </div>
              <!-- 已选条件的操作符与标签配置 -->
              <div v-if="form.filterFields.length" style="margin-top:10px;">
                <div style="font-size:12px;color:#606266;margin-bottom:6px;">已选条件的匹配方式与显示名称：</div>
                <div v-for="f in form.filterFields" :key="f.field" style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                  <span style="font-size:13px;width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" :title="f.field">{{ f.field }}</span>
                  <select v-model="f.op" style="width:110px;">
                    <option value="like">模糊匹配</option>
                    <option value="eq">等于</option>
                    <option value="gt">大于</option>
                    <option value="lt">小于</option>
                    <option value="between">区间</option>
                  </select>
                  <input v-model="f.label" placeholder="显示名称" style="width:140px;" :title="'条件显示名称'">
                </div>
              </div>
            </div>

            <div v-if="msg" :style="{marginTop:'10px', fontSize:'13px', color: msgType === 'error' ? '#dc2626' : '#10b981'}">{{ msg }}</div>
          </div>
          <div class="modal-footer">
            <button @click="closeModal" style="background:#909399;">取消</button>
            <button @click="save" :disabled="saving" style="margin-left:8px;">{{ saving ? '保存中...' : '保存' }}</button>
          </div>
        </div>
      </div>
    </div>
  `
});

// ========== 自定义报表数据展示 ==========
Vue.component('page-custom-report-viewer', {
  props: ['ws', 'nav', 'params'],
  data() {
    return {
      report: { report_code: '', report_name: '', columns: [], rows: [], filter_fields: [] },
      filterValues: {},   // { field: value }  between 类型存 { field: [v1, v2] }
      loading: false,
      errMsg: '',
      exporting: false
    };
  },
  watch: {
    'params.id'() { this.load(); }
  },
  methods: {
    async load() {
      if (!this.params || !this.params.id) { this.errMsg = '缺少报表ID'; return; }
      this.loading = true;
      this.errMsg = '';
      const res = await this.ws.send('getCustomReportData', { id: this.params.id });
      this.loading = false;
      if (!res.success) { this.errMsg = res.message || '加载失败'; return; }
      this.report = res.data;
      // 初始化筛选值
      const fv = {};
      (res.data.filter_fields || []).forEach(f => {
        fv[f.field] = f.op === 'between' ? ['', ''] : '';
      });
      this.filterValues = fv;
    },
    // 按条件查询
    async doQuery() {
      if (!this.params || !this.params.id) return;
      // 组装 filters：between 传数组，其余传单值；空值不提交
      const filters = {};
      (this.report.filter_fields || []).forEach(f => {
        const v = this.filterValues[f.field];
        if (f.op === 'between') {
          const [a, b] = Array.isArray(v) ? v : ['', ''];
          if ((a !== undefined && a !== '') || (b !== undefined && b !== '')) {
            filters[f.field] = [a, b];
          }
        } else {
          if (v !== undefined && v !== null && v !== '') filters[f.field] = v;
        }
      });
      this.loading = true;
      this.errMsg = '';
      const res = await this.ws.send('getCustomReportData', { id: this.params.id, filters });
      this.loading = false;
      if (!res.success) { this.errMsg = res.message || '查询失败'; return; }
      this.report = { ...this.report, columns: res.data.columns, rows: res.data.rows };
    },
    resetFilters() {
      const fv = {};
      (this.report.filter_fields || []).forEach(f => {
        fv[f.field] = f.op === 'between' ? ['', ''] : '';
      });
      this.filterValues = fv;
      this.load();
    },
    fmt(v) {
      if (v === null || v === undefined) return '';
      if (v instanceof Date) return v.toLocaleString();
      return String(v);
    },
    exportExcel() {
      if (this.exporting || !this.report.columns.length) return;
      this.exporting = true;
      try {
        // 用 aoa_to_sheet 保证列顺序与表头一致
        const aoa = [this.report.columns.slice()];
        this.report.rows.forEach(row => {
          aoa.push(this.report.columns.map(c => this.fmt(row[c])));
        });
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        // 自适应列宽（按每列最长字符数估算）
        const colWidths = this.report.columns.map((c, ci) => {
          let max = String(c).length;
          aoa.slice(1).forEach(r => { const len = String(r[ci] == null ? '' : r[ci]).length; if (len > max) max = len; });
          return { wch: Math.min(Math.max(max + 2, 10), 60) };
        });
        ws['!cols'] = colWidths;
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '报表数据');
        const fname = `${this.report.report_name || '报表数据'}_${this.report.report_code || ''}.xlsx`;
        XLSX.writeFile(wb, fname);
      } catch (e) {
        alert('导出失败：' + (e.message || e));
      } finally {
        this.exporting = false;
      }
    }
  },
  mounted() { this.load(); },
  template: `
    <div>
      <div class="page-title">
        报表数据：{{ report.report_name }}
        <span style="font-size:13px;color:#667085;font-weight:400;margin-left:10px;">（{{ report.report_code }}）</span>
      </div>
      <div v-if="loading" class="panel" style="text-align:center;color:#909399;padding:30px;">加载中...</div>
      <div v-else-if="errMsg" class="panel" style="color:#dc2626;padding:20px;">{{ errMsg }}</div>
      <template v-else>
        <!-- 查询条件 -->
        <div v-if="report.filter_fields && report.filter_fields.length" class="panel" style="margin-bottom:16px;">
          <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;">
            <div v-for="f in report.filter_fields" :key="f.field" style="display:flex;flex-direction:column;gap:4px;">
              <label style="font-size:12px;color:#606266;">{{ f.label || f.field }}</label>
              <template v-if="f.op === 'between'">
                <div style="display:flex;align-items:center;gap:4px;">
                  <input v-model="filterValues[f.field][0]" placeholder="起始" style="width:130px;" @keyup.enter="doQuery">
                  <span style="color:#909399;">~</span>
                  <input v-model="filterValues[f.field][1]" placeholder="结束" style="width:130px;" @keyup.enter="doQuery">
                </div>
              </template>
              <template v-else>
                <input v-model="filterValues[f.field]" :placeholder="'请输入' + (f.label || f.field)" style="width:180px;" @keyup.enter="doQuery">
              </template>
            </div>
            <div style="display:flex;gap:8px;">
              <button @click="doQuery" style="background:#3b82f6;">查询</button>
              <button @click="resetFilters" style="background:#909399;">重置</button>
            </div>
          </div>
        </div>
        <div class="panel" style="overflow-x:auto;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <div style="color:#667085;font-size:13px;">共 {{ report.rows.length }} 行（最多展示 1000 行）</div>
            <button @click="exportExcel" :disabled="exporting || !report.rows.length" style="background:#10b981;">
              {{ exporting ? '导出中...' : '导出 Excel' }}
            </button>
          </div>
          <table v-if="report.columns.length" style="width:100%;font-size:13px;white-space:nowrap;">
            <thead><tr>
              <th v-for="(c, i) in report.columns" :key="i" style="background:#f5f7fa;">{{ c }}</th>
            </tr></thead>
            <tbody>
              <tr v-for="(row, ri) in report.rows" :key="ri">
                <td v-for="(c, ci) in report.columns" :key="ci">{{ fmt(row[c]) }}</td>
              </tr>
              <tr v-if="!report.rows.length"><td :colspan="report.columns.length" style="text-align:center;color:#909399;">暂无数据</td></tr>
            </tbody>
          </table>
          <div v-else style="text-align:center;color:#909399;padding:20px;">无数据</div>
        </div>
      </template>
    </div>
  `
});

// ========== 多主件ECN（工程变更通知） ==========
Vue.component('page-bom-ecn', {
  props: ['ws', 'nav'],
  data() {
    return {
      materialOptions: [],
      // 左侧 ECN 内容：元件（可搜索下拉）
      selComponent: '',
      componentKeyword: '',
      componentFocused: false,
      selType: 'disable',   // disable=失效 / add=新增
      selQty: 1,
      ecnItems: [],         // [{ component_material, component_name, change_type, quantity }]
      // 右侧：手动添加主件（可搜索下拉）
      addParentId: '',
      parentKeyword: '',
      parentFocused: false,
      // 右侧：按元件添加主件（可搜索下拉 + 按钮）
      searchComponent: '',
      searchKeyword: '',
      searchFocused: false,
      parentMaterials: [],  // [{ parent_material_id, parent_material_name }]
      // 提交状态
      message: '', msgType: '', submitting: false,
      resultDetails: []
    };
  },
  computed: {
    selectedComponent() { return this.matObj(this.selComponent); },
    selectedParent() { return this.matObj(this.addParentId); },
    selectedSearch() { return this.matObj(this.searchComponent); }
  },
  mounted() {
    this.loadMaterials();
    document.addEventListener('click', this.onDocClick);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.onDocClick);
  },
  methods: {
    showMsg(type, text) { this.msgType = type; this.message = text; },
    async loadMaterials() {
      const res = await this.ws.send('queryMaterials', { is_active: 1, page_size: 9999 });
      if (res.success) this.materialOptions = res.data.list || [];
    },
    matObj(id) { return this.materialOptions.find(o => o.material_id === id) || null; },
    matName(id) { const m = this.matObj(id); return m ? (m.material_name || '') : ''; },
    matSpec(id) { const m = this.matObj(id); return m ? (m.material_spec || '') : ''; },
    filterMaterials(kw) {
      const k = (kw || '').trim().toLowerCase();
      const src = this.materialOptions || [];
      if (!k) return src.slice(0, 80);
      return src.filter(m =>
        (m.material_id || '').toLowerCase().indexOf(k) >= 0 ||
        (m.material_name || '').toLowerCase().indexOf(k) >= 0 ||
        (m.material_spec || '').toLowerCase().indexOf(k) >= 0
      ).slice(0, 80);
    },
    onDocClick(e) {
      [['componentSelect', 'componentFocused'], ['parentSelect', 'parentFocused'], ['searchSelect', 'searchFocused']].forEach(([ref, key]) => {
        const el = this.$refs[ref];
        if (el && !el.contains(e.target)) this[key] = false;
      });
    },
    // --- 元件下拉 ---
    selectComponent(m) { this.selComponent = m.material_id; this.componentKeyword = ''; this.componentFocused = false; },
    clearComponent() { this.selComponent = ''; this.componentKeyword = ''; },
    focusComponent() {
      this.componentFocused = true;
      if (this.selComponent && !this.componentKeyword) {
        const m = this.matObj(this.selComponent);
        this.componentKeyword = m ? m.material_id + ' - ' + m.material_name : '';
      }
    },
    inputComponent() {
      const m = this.matObj(this.selComponent);
      const full = m ? m.material_id + ' - ' + m.material_name : '';
      if (this.selComponent && this.componentKeyword !== full) this.selComponent = '';
    },
    // --- 主件下拉 ---
    selectParent(m) { this.addParentId = m.material_id; this.parentKeyword = ''; this.parentFocused = false; },
    clearParent() { this.addParentId = ''; this.parentKeyword = ''; },
    focusParent() {
      this.parentFocused = true;
      if (this.addParentId && !this.parentKeyword) {
        const m = this.matObj(this.addParentId);
        this.parentKeyword = m ? m.material_id + ' - ' + m.material_name : '';
      }
    },
    inputParent() {
      const m = this.matObj(this.addParentId);
      const full = m ? m.material_id + ' - ' + m.material_name : '';
      if (this.addParentId && this.parentKeyword !== full) this.addParentId = '';
    },
    // --- 按元件下拉 ---
    selectSearch(m) { this.searchComponent = m.material_id; this.searchKeyword = ''; this.searchFocused = false; },
    clearSearch() { this.searchComponent = ''; this.searchKeyword = ''; },
    focusSearch() {
      this.searchFocused = true;
      if (this.searchComponent && !this.searchKeyword) {
        const m = this.matObj(this.searchComponent);
        this.searchKeyword = m ? m.material_id + ' - ' + m.material_name : '';
      }
    },
    inputSearch() {
      const m = this.matObj(this.searchComponent);
      const full = m ? m.material_id + ' - ' + m.material_name : '';
      if (this.searchComponent && this.searchKeyword !== full) this.searchComponent = '';
    },
    addEcnItem() {
      const comp = (this.selComponent || '').trim();
      if (!comp) { this.showMsg('err', '请选择元件'); return; }
      const qty = this.selType === 'add' ? Number(this.selQty) : null;
      if (this.selType === 'add' && !(qty > 0)) { this.showMsg('err', '用量必须为正数'); return; }
      if (this.ecnItems.some(i => i.component_material === comp && i.change_type === this.selType)) {
        this.showMsg('err', '该元件已按此方式添加');
        return;
      }
      this.ecnItems.push({
        component_material: comp,
        component_name: this.matName(comp),
        change_type: this.selType,
        quantity: this.selType === 'add' ? qty : null
      });
      this.selComponent = '';
      this.componentKeyword = '';
      this.selQty = 1;
      this.message = '';
    },
    removeEcnItem(i) { this.ecnItems.splice(i, 1); },
    addParent() {
      const pid = (this.addParentId || '').trim();
      if (!pid) { this.showMsg('err', '请选择主件'); return; }
      if (this.parentMaterials.some(p => p.parent_material_id === pid)) {
        this.showMsg('err', '该主件已添加');
        return;
      }
      this.parentMaterials.push({ parent_material_id: pid, parent_material_name: this.matName(pid) });
      this.addParentId = '';
      this.parentKeyword = '';
    },
    removeParent(i) { this.parentMaterials.splice(i, 1); },
    async addParentsByComponent() {
      const comp = this.searchComponent;
      if (!comp) { this.showMsg('err', '请先选择元件'); return; }
      const res = await this.ws.send('queryBomParentList', { component_material: comp, page_size: 9999 });
      let added = 0;
      if (res.success && res.data && res.data.list) {
        res.data.list.forEach(s => {
          if (!this.parentMaterials.some(p => p.parent_material_id === s.parent_material_id)) {
            this.parentMaterials.push({
              parent_material_id: s.parent_material_id,
              parent_material_name: s.parent_material_name || '-'
            });
            added++;
          }
        });
      }
      this.showMsg('ok', added ? `已按元件 ${comp} 带出 ${added} 个主件并加入列表` : '该元件未关联到任何主件');
      this.searchComponent = '';
      this.searchKeyword = '';
    },
    async submit() {
      this.message = ''; this.resultDetails = [];
      if (!this.ecnItems.length) { this.showMsg('err', '请至少添加一条变更内容'); return; }
      if (!this.parentMaterials.length) { this.showMsg('err', '请至少添加一个主件'); return; }

      this.submitting = true;
      const res = await this.ws.send('applyMultiBomEcn', {
        ecn_items: this.ecnItems.map(it => ({
          component_material: it.component_material,
          change_type: it.change_type,
          quantity: it.change_type === 'add' ? it.quantity : undefined
        })),
        parent_material_ids: this.parentMaterials.map(p => p.parent_material_id)
      });
      this.submitting = false;

      if (!res.success) {
        this.showMsg('err', res.message || '变更失败');
        if (res.data && res.data.errors) {
          this.resultDetails = res.data.errors.map(e => ({ type: 'err', text: e }));
        }
        return;
      }
      this.showMsg('ok', `ECN 变更完成，共处理 ${res.data.count} 个主件`);
    }
  },
  template: `
    <div class="bom-ecn">
      <div class="page-title">多主件ECN（工程变更通知）</div>
      <div class="page-title" style="font-size:13px;color:#667085;font-weight:400;padding-bottom:4px;">
        对多个主件的 BOM 统一做元件失效 / 新增变更，变更前自动归档历史版本
      </div>

      <div v-if="message" :class="['tip', msgType]" style="margin-top:12px;">{{ message }}</div>
      <div v-if="resultDetails.length" class="panel" style="margin-top:12px;background:#f9fafb;">
        <div style="font-weight:600;margin-bottom:6px;">处理明细</div>
        <div v-for="(d,i) in resultDetails" :key="i" :style="{ color: d.type === 'ok' ? '#10b981' : '#dc2626' }">{{ d.text }}</div>
      </div>

      <div style="display:flex;gap:16px;align-items:flex-start;margin-top:16px;flex-wrap:wrap;">
        <!-- 左：ECN 内容 -->
        <div class="panel" style="flex:1;min-width:440px;">
          <div style="font-weight:600;margin-bottom:10px;">ECN 内容（变更明细）</div>
          <div class="form-row">
            <label>元件料号：</label>
            <div class="ecn-mat-select" ref="componentSelect">
              <div class="ecn-mat-input-row">
                <input class="ecn-mat-input" type="text" v-model="componentKeyword"
                       :placeholder="selectedComponent ? selectedComponent.material_id + ' - ' + selectedComponent.material_name : '输入料号或名称搜索...'"
                       @focus="focusComponent" @input="inputComponent" @keydown.enter.prevent="componentFocused = false">
                <span v-if="selComponent" class="ecn-mat-clear" @click="clearComponent">×</span>
              </div>
              <div v-if="componentFocused && filterMaterials(componentKeyword).length" class="ecn-mat-dropdown">
                <div v-for="m in filterMaterials(componentKeyword)" :key="m.material_id" class="ecn-mat-option"
                     :class="{ sel: m.material_id === selComponent }" @mousedown.prevent="selectComponent(m)">
                  <div class="ecn-mat-opt-id">{{ m.material_id }}</div>
                  <div class="ecn-mat-opt-name">{{ m.material_name }}<span v-if="m.material_spec" class="ecn-mat-opt-spec"> · {{ m.material_spec }}</span></div>
                </div>
              </div>
              <div v-else-if="componentFocused && componentKeyword && !filterMaterials(componentKeyword).length" class="ecn-mat-dropdown ecn-mat-empty">没有匹配的物料</div>
            </div>
          </div>
          <div class="form-row" style="margin-top:8px;">
            <label>变更方式：</label>
            <select v-model="selType">
              <option value="disable">失效</option>
              <option value="add">新增</option>
            </select>
            <template v-if="selType === 'add'">
              <label style="margin-left:8px;">用量：</label>
              <input v-model.number="selQty" type="number" min="0" step="any" style="width:80px;">
            </template>
            <button @click="addEcnItem">添加明细</button>
          </div>
          <table style="margin-top:10px;">
            <thead><tr><th>元件料号</th><th>元件名称</th><th>规格</th><th>变更方式</th><th>用量</th><th style="width:60px;">操作</th></tr></thead>
            <tbody>
              <tr v-for="(it,i) in ecnItems" :key="i">
                <td>{{ it.component_material }}</td>
                <td>{{ it.component_name || '-' }}</td>
                <td>{{ matSpec(it.component_material) || '-' }}</td>
                <td><span :style="{ color: it.change_type === 'disable' ? '#dc2626' : '#10b981', fontWeight:'600' }">{{ it.change_type === 'disable' ? '失效' : '新增' }}</span></td>
                <td>{{ it.change_type === 'add' ? it.quantity : '-' }}</td>
                <td><a href="javascript:;" @click="removeEcnItem(i)" style="color:#dc2626;">删除</a></td>
              </tr>
              <tr v-if="!ecnItems.length"><td colspan="6" style="text-align:center;color:#909399;">尚未添加变更内容</td></tr>
            </tbody>
          </table>
        </div>

        <!-- 右：变更范围 -->
        <div class="panel" style="flex:1;min-width:440px;">
          <div style="font-weight:600;margin-bottom:10px;">变更范围（主件）</div>
          <div class="form-row">
            <label>主件料号：</label>
            <div class="ecn-mat-select" ref="parentSelect">
              <div class="ecn-mat-input-row">
                <input class="ecn-mat-input" type="text" v-model="parentKeyword"
                       :placeholder="selectedParent ? selectedParent.material_id + ' - ' + selectedParent.material_name : '输入料号或名称搜索...'"
                       @focus="focusParent" @input="inputParent" @keydown.enter.prevent="parentFocused = false">
                <span v-if="addParentId" class="ecn-mat-clear" @click="clearParent">×</span>
              </div>
              <div v-if="parentFocused && filterMaterials(parentKeyword).length" class="ecn-mat-dropdown">
                <div v-for="m in filterMaterials(parentKeyword)" :key="m.material_id" class="ecn-mat-option"
                     :class="{ sel: m.material_id === addParentId }" @mousedown.prevent="selectParent(m)">
                  <div class="ecn-mat-opt-id">{{ m.material_id }}</div>
                  <div class="ecn-mat-opt-name">{{ m.material_name }}<span v-if="m.material_spec" class="ecn-mat-opt-spec"> · {{ m.material_spec }}</span></div>
                </div>
              </div>
              <div v-else-if="parentFocused && parentKeyword && !filterMaterials(parentKeyword).length" class="ecn-mat-dropdown ecn-mat-empty">没有匹配的物料</div>
            </div>
            <button @click="addParent">添加主件</button>
          </div>
          <div class="form-row" style="margin-top:8px;">
            <label>按元件添主件：</label>
            <div class="ecn-mat-select" ref="searchSelect">
              <div class="ecn-mat-input-row">
                <input class="ecn-mat-input" type="text" v-model="searchKeyword"
                       :placeholder="selectedSearch ? selectedSearch.material_id + ' - ' + selectedSearch.material_name : '输入元件料号或名称搜索...'"
                       @focus="focusSearch" @input="inputSearch" @keydown.enter.prevent="searchFocused = false">
                <span v-if="searchComponent" class="ecn-mat-clear" @click="clearSearch">×</span>
              </div>
              <div v-if="searchFocused && filterMaterials(searchKeyword).length" class="ecn-mat-dropdown">
                <div v-for="m in filterMaterials(searchKeyword)" :key="m.material_id" class="ecn-mat-option"
                     :class="{ sel: m.material_id === searchComponent }" @mousedown.prevent="selectSearch(m)">
                  <div class="ecn-mat-opt-id">{{ m.material_id }}</div>
                  <div class="ecn-mat-opt-name">{{ m.material_name }}<span v-if="m.material_spec" class="ecn-mat-opt-spec"> · {{ m.material_spec }}</span></div>
                </div>
              </div>
              <div v-else-if="searchFocused && searchKeyword && !filterMaterials(searchKeyword).length" class="ecn-mat-dropdown ecn-mat-empty">没有匹配的物料</div>
            </div>
            <button @click="addParentsByComponent">带出主件</button>
          </div>
          <table style="margin-top:10px;">
            <thead><tr><th>主件料号</th><th>主件名称</th><th>规格</th><th style="width:60px;">操作</th></tr></thead>
            <tbody>
              <tr v-for="(p,i) in parentMaterials" :key="i">
                <td>{{ p.parent_material_id }}</td>
                <td>{{ p.parent_material_name || '-' }}</td>
                <td>{{ matSpec(p.parent_material_id) || '-' }}</td>
                <td><a href="javascript:;" @click="removeParent(i)" style="color:#dc2626;">删除</a></td>
              </tr>
              <tr v-if="!parentMaterials.length"><td colspan="4" style="text-align:center;color:#909399;">尚未添加主件</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style="margin-top:16px;display:flex;justify-content:flex-end;gap:10px;">
        <button @click="nav('page-bom')">返回</button>
        <button @click="submit" :disabled="submitting" style="background:#1e88e5;">{{ submitting ? '提交中...' : '提交变更' }}</button>
      </div>
    </div>
  `
});

// ========== 用户管理 ==========
Vue.component('page-user-mgmt', {
  props: ['ws'],
  data() {
    return {
      filters: { username: '', realname: '', is_active: '' },
      list: [],
      total: 0,
      page: 1,
      pageSize: 20,
      editing: null,
      form: { id: null, username: '', password: '', realname: '', is_active: 1 },
      showForm: false,
      msg: '',
      msgType: ''
    };
  },
  methods: {
    async load() {
      const res = await this.ws.send('queryUsers', { ...this.filters, page: this.page, page_size: this.pageSize });
      if (res.success) { this.list = res.data.list; this.total = res.data.total; }
    },
    doSearch() { this.page = 1; this.load(); },
    reset() { this.filters = { username: '', realname: '', is_active: '' }; this.page = 1; this.load(); },
    fmtTime(v) { return v ? String(v).replace('T', ' ').slice(0, 19) : '-'; },
    openCreate() {
      this.editing = null;
      this.form = { id: null, username: '', password: '', realname: '', is_active: 1 };
      this.showForm = true;
      this.msg = '';
    },
    openEdit(row) {
      this.editing = row;
      this.form = { id: row.id, username: row.username, password: '', realname: row.realname || '', is_active: row.is_active };
      this.showForm = true;
      this.msg = '';
    },
    closeForm() { this.showForm = false; this.editing = null; },
    async submitForm() {
      if (!this.form.username || (!this.editing && !this.form.password)) {
        this.msg = '用户名和密码不能为空'; this.msgType = 'err'; return;
      }
      let res;
      if (this.editing) {
        res = await this.ws.send('updateUser', this.form);
      } else {
        res = await this.ws.send('createUser', this.form);
      }
      if (!res.success) { this.msg = res.message || '操作失败'; this.msgType = 'err'; return; }
      this.msg = this.editing ? '修改成功' : '新增成功'; this.msgType = 'ok';
      setTimeout(() => { this.closeForm(); this.load(); }, 800);
    },
    async doDelete(row) {
      if (row.username === 'admin') { alert('管理员账号不可删除'); return; }
      if (!confirm(`确定停用用户 ${row.username} 吗？`)) return;
      const res = await this.ws.send('deleteUser', { id: row.id });
      if (!res.success) { alert(res.message); return; }
      this.load();
    },
    async toggleActive(row) {
      const res = await this.ws.send('updateUser', { id: row.id, is_active: row.is_active ? 0 : 1 });
      if (!res.success) { alert(res.message); return; }
      this.load();
    }
  },
  mounted() { this.load(); },
  template: `
    <div>
      <div class="page-title">用户管理</div>
      <div class="panel">
        <div class="form-row">
          <label>用户名：</label><input v-model="filters.username" placeholder="模糊" @keyup.enter="doSearch">
          <label style="margin-left:12px;">姓名：</label><input v-model="filters.realname" placeholder="模糊" @keyup.enter="doSearch">
          <label style="margin-left:12px;">状态：</label>
          <select v-model="filters.is_active">
            <option value="">全部</option>
            <option value="1">启用</option>
            <option value="0">停用</option>
          </select>
          <button @click="doSearch" style="margin-left:12px;">查询</button>
          <button @click="reset" style="margin-left:8px;background:#909399;">重置</button>
          <button @click="openCreate" style="margin-left:8px;background:#1e88e5;color:#fff;">新增用户</button>
        </div>
      </div>
      <div class="panel" style="margin-top:16px;">
        <table style="table-layout:fixed;width:100%;">
          <thead><tr>
            <th style="width:60px;">ID</th>
            <th style="width:140px;">用户名</th>
            <th style="width:140px;">姓名</th>
            <th style="width:80px;">状态</th>
            <th style="width:160px;">创建时间</th>
            <th style="width:160px;">更新时间</th>
            <th style="width:180px;">操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td>{{ r.id }}</td>
              <td>{{ r.username }}</td>
              <td>{{ r.realname || '-' }}</td>
              <td>
                <span :style="{ color: r.is_active ? '#10b981' : '#dc2626' }">
                  {{ r.is_active ? '启用' : '停用' }}
                </span>
              </td>
              <td>{{ fmtTime(r.created_time) }}</td>
              <td>{{ fmtTime(r.update_time) }}</td>
              <td style="white-space:nowrap;">
                <button class="mini" @click="openEdit(r)">修改</button>
                <button class="mini" @click="toggleActive(r)" :style="{ marginLeft: '4px', background: r.is_active ? '#f59e0b' : '#10b981', color: '#fff' }">
                  {{ r.is_active ? '停用' : '启用' }}
                </button>
                <button class="mini" @click="doDelete(r)" style="margin-left:4px;background:#dc2626;color:#fff;">删除</button>
              </td>
            </tr>
            <tr v-if="!list.length"><td colspan="7" style="text-align:center;color:#909399;">暂无数据</td></tr>
          </tbody>
        </table>
        <vue-pager :page="page" :page-size="pageSize" :total="total"
          @change="(p)=>{page=p;load()}"
          @size-change="(s)=>{pageSize=s;page=1;load()}"></vue-pager>
      </div>

      <!-- 新增/修改弹窗 -->
      <div v-if="showForm" class="modal-mask" @click.self="closeForm">
        <div class="modal" style="width:460px;">
          <div class="modal-title">{{ editing ? '修改用户' : '新增用户' }}</div>
          <div class="modal-body">
            <div v-if="msg" :style="{ color: msgType === 'err' ? '#dc2626' : '#10b981', marginBottom: '8px' }">{{ msg }}</div>
            <div class="form-row" style="margin-bottom:10px;">
              <label style="width:80px;">用户名：</label>
              <input v-model="form.username" :disabled="!!editing" style="flex:1;" placeholder="登录用户名">
            </div>
            <div class="form-row" style="margin-bottom:10px;">
              <label style="width:80px;">密码：</label>
              <input v-model="form.password" type="password" style="flex:1;" :placeholder="editing ? '留空则不修改' : '初始密码'">
            </div>
            <div class="form-row" style="margin-bottom:10px;">
              <label style="width:80px;">姓名：</label>
              <input v-model="form.realname" style="flex:1;" placeholder="真实姓名">
            </div>
            <div class="form-row">
              <label style="width:80px;">状态：</label>
              <select v-model="form.is_active" style="flex:1;">
                <option :value="1">启用</option>
                <option :value="0">停用</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeForm" style="background:#909399;">取消</button>
            <button @click="submitForm" style="background:#1e88e5;color:#fff;margin-left:8px;">保存</button>
          </div>
        </div>
      </div>
    </div>
  `
});

// ========== 权限管理 ==========
Vue.component('page-permission-mgmt', {
  props: ['ws'],
  data() {
    return {
      filters: { perm_code: '', perm_name: '', perm_type: '', category: '' },
      list: [],
      total: 0,
      page: 1,
      pageSize: 50,
      editing: null,
      editUsers: [],
      allUsers: [],
      showAll: false,
      msg: '',
      msgType: ''
    };
  },
  methods: {
    async load() {
      const res = await this.ws.send('queryPermissions', { ...this.filters, page: this.page, page_size: this.pageSize });
      if (res.success) { this.list = res.data.list; this.total = res.data.total; }
    },
    async loadAllUsers() {
      const res = await this.ws.send('queryUsers', { is_active: 1, page: 1, page_size: 1000 });
      if (res.success) this.allUsers = res.data.list.map(u => u.username);
    },
    doSearch() { this.page = 1; this.load(); },
    reset() { this.filters = { perm_code: '', perm_name: '', perm_type: '', category: '' }; this.page = 1; this.load(); },
    openEdit(row) {
      this.editing = row;
      this.editUsers = [...(row.allowed_users_list || [])];
      this.loadAllUsers();
      this.showAll = false;
      this.msg = '';
    },
    closeEdit() { this.editing = null; },
    toggleUser(u) {
      const idx = this.editUsers.indexOf(u);
      if (idx === -1) this.editUsers.push(u);
      else this.editUsers.splice(idx, 1);
    },
    toggleAll() {
      if (this.editUsers.length === this.allUsers.length) this.editUsers = [];
      else this.editUsers = [...this.allUsers];
    },
    clearUsers() { this.editUsers = []; },
    selectAllUsers() { this.editUsers = [...this.allUsers]; },
    async submitEdit() {
      const res = await this.ws.send('updatePermission', {
        id: this.editing.id,
        allowed_users: this.editUsers.join(',')
      });
      if (!res.success) { this.msg = res.message || '保存失败'; this.msgType = 'err'; return; }
      this.msg = '保存成功'; this.msgType = 'ok';
      // 刷新当前登录用户的权限，确保权限变更即时生效（无需退出重登）
      if (this.$root && this.$root.currentUser && this.$root.currentUser.username) {
        this.$root.loadPermissions(this.$root.currentUser.username);
      }
      setTimeout(() => { this.closeEdit(); this.load(); }, 600);
    }
  },
  mounted() { this.load(); },
  template: `
    <div>
      <div class="page-title">权限管理</div>
      <div class="panel">
        <div class="form-row">
          <label>权限编码：</label><input v-model="filters.perm_code" placeholder="模糊" @keyup.enter="doSearch">
          <label style="margin-left:12px;">权限名称：</label><input v-model="filters.perm_name" placeholder="模糊" @keyup.enter="doSearch">
          <label style="margin-left:12px;">类型：</label>
          <select v-model="filters.perm_type">
            <option value="">全部</option>
            <option value="menu">菜单权限</option>
            <option value="func">功能权限</option>
          </select>
          <button @click="doSearch" style="margin-left:12px;">查询</button>
          <button @click="reset" style="margin-left:8px;background:#909399;">重置</button>
        </div>
      </div>
      <div class="panel" style="margin-top:16px;">
        <div style="margin-bottom:8px;color:#667085;font-size:13px;">
          说明：权限的「可使用用户」为空表示所有用户均有权限；填写后仅指定用户可见/可用。admin 账号始终拥有全部权限。
        </div>
        <table style="table-layout:fixed;width:100%;">
          <thead><tr>
            <th style="width:50px;">ID</th>
            <th style="width:80px;">类型</th>
            <th style="width:110px;">分类</th>
            <th style="width:200px;">权限编码</th>
            <th style="width:160px;">权限名称</th>
            <th>可使用用户</th>
            <th style="width:100px;">操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td>{{ r.id }}</td>
              <td>
                <span :style="{ padding: '2px 6px', borderRadius: '4px', fontSize: '12px', background: r.perm_type === 'menu' ? '#e0f2fe' : '#fef3c7', color: r.perm_type === 'menu' ? '#0369a1' : '#92400e' }">
                  {{ r.perm_type === 'menu' ? '菜单' : '功能' }}
                </span>
              </td>
              <td>{{ r.category }}</td>
              <td style="font-family:monospace;font-size:12px;">{{ r.perm_code }}</td>
              <td>{{ r.perm_name }}</td>
              <td>
                <span v-if="!r.allowed_users_list.length" style="color:#10b981;">全部用户</span>
                <span v-else style="color:#667085;">{{ r.allowed_users_list.length }} 人：</span>
                <span v-if="r.allowed_users_list.length" style="color:#334155;font-size:12px;">
                  {{ r.allowed_users_list.slice(0, 6).join(', ') }}<span v-if="r.allowed_users_list.length > 6"> +{{ r.allowed_users_list.length - 6 }}</span>
                </span>
              </td>
              <td style="white-space:nowrap;">
                <button class="mini" @click="openEdit(r)">配置</button>
              </td>
            </tr>
            <tr v-if="!list.length"><td colspan="7" style="text-align:center;color:#909399;">暂无数据</td></tr>
          </tbody>
        </table>
        <vue-pager :page="page" :page-size="pageSize" :total="total"
          @change="(p)=>{page=p;load()}"
          @size-change="(s)=>{pageSize=s;page=1;load()}"></vue-pager>
      </div>

      <!-- 配置弹窗 -->
      <div v-if="editing" class="modal-mask" @click.self="closeEdit">
        <div class="modal" style="width:560px;">
          <div class="modal-title">权限配置 - {{ editing.perm_name }}</div>
          <div class="modal-body">
            <div v-if="msg" :style="{ color: msgType === 'err' ? '#dc2626' : '#10b981', marginBottom: '8px' }">{{ msg }}</div>
            <div style="margin-bottom:8px;font-size:13px;color:#667085;">
              权限编码：<code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">{{ editing.perm_code }}</code>
              <span style="margin-left:8px;">类型：{{ editing.perm_type === 'menu' ? '菜单权限' : '功能权限' }}</span>
            </div>
            <div style="margin-bottom:12px;font-size:13px;color:#667085;">
              勾选可使用该权限的用户（不勾选即表示所有用户均可使用）
            </div>
            <div style="margin-bottom:8px;display:flex;gap:8px;">
              <button class="mini" @click="selectAllUsers" :disabled="!allUsers.length">全选</button>
              <button class="mini" @click="clearUsers">清空</button>
              <button class="mini" @click="showAll = !showAll">
                {{ showAll ? '收起' : '展开' }}用户列表（{{ allUsers.length }} 人）
              </button>
            </div>
            <div v-if="showAll && allUsers.length" style="max-height:300px;overflow-y:auto;border:1px solid #e5e7eb;border-radius:4px;padding:8px;">
              <label v-for="u in allUsers" :key="u" style="display:inline-flex;align-items:center;margin:2px 8px 2px 0;font-size:13px;cursor:pointer;">
                <input type="checkbox" :value="u" :checked="editUsers.includes(u)" @change="toggleUser(u)">
                <span style="margin-left:4px;">{{ u }}</span>
              </label>
            </div>
            <div v-else-if="!allUsers.length" style="color:#dc2626;font-size:13px;">无法获取用户列表</div>
            <div style="margin-top:12px;color:#667085;font-size:12px;">
              当前已选 <b style="color:#1e88e5;">{{ editUsers.length }}</b> / {{ allUsers.length }} 个用户
              <span v-if="!editUsers.length" style="color:#10b981;margin-left:8px;">（空 = 所有用户可用）</span>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeEdit" style="background:#909399;">取消</button>
            <button @click="submitEdit" style="background:#1e88e5;color:#fff;margin-left:8px;">保存</button>
          </div>
        </div>
      </div>
    </div>
  `
});
