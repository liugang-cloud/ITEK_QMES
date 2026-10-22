// ========== WebSocket 客户端封装 ==========
class WsClient {
  constructor(url) {
    this.url = url;
    this.connected = false;
    this.ws = null;
    this.token = '';   // 登录成功后由外部赋值，随每次请求发送
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.connected = true;
      if (this.onStatus) this.onStatus(true);
      if (this.onOpen) this.onOpen();
    };

    this.ws.onclose = () => {
      this.connected = false;
      if (this.onStatus) this.onStatus(false);
      // 断线重连
      setTimeout(() => this.connect(), 3000);
    };

    this.ws.onerror = () => { this.ws.close(); };

    this.ws.onmessage = (e) => {
      const res = JSON.parse(e.data);
      const id = res._id;
      delete res._id;
      // 登录失效（token 过期/服务重启）统一回到登录页
      if (res.code === 'UNAUTHORIZED' && this.onUnauthorized) this.onUnauthorized();
      if (this._cbs && this._cbs[id]) {
        this._cbs[id](res);
        delete this._cbs[id];
      }
    };
  }

  // 发送请求并等待响应（通过自增 id 匹配）
  send(action, data) {
    return new Promise((resolve) => {
      const id = Date.now() + Math.random();
      this._cbs = this._cbs || {};
      this._cbs[id] = resolve;
      this.ws.send(JSON.stringify({ _id: id, action, data, token: this.token }));
    });
  }
}

// ========== 页面标题表 ==========
const PAGE_LABELS = {
  'page-scan': '扫码检验',
  'page-records': '检验记录查询',
  'page-record-detail': '检验单明细',
  'page-assemble': '扫码装配',
  'page-assemble-records': '装配记录查询',
  'page-assemble-detail': '装配单明细',
  'page-inspect-item': '检验项目',
  'page-item-add': '新增检验项目',
  'page-material': '物料数据',
  'page-material-add': '新增物料',
  'page-rule': '检验规则',
  'page-rule-add': '新增检验规则',
  'page-rule-detail': '检验规则详情',
  'page-bom': 'BOM数据',
  'page-bom-add': '新增BOM',
  'page-bom-detail': 'BOM明细',
  'page-barcode-print': '条码打印',
  'page-barcode-archive': '条码档案',
  'page-barcode-format': '条码格式',
  'page-api-log': '日志管理',
  'page-arch': '系统架构'
};

// 列表页 → 该页签内可直接跳转的明细页（不新开页签）
const INLINE = {
  'page-records': 'page-record-detail',
  'page-assemble-records': 'page-assemble-detail',
  'page-inspect-item': 'page-item-add',
  'page-material': 'page-material-add',
  'page-rule': 'page-rule-detail',
  'page-bom': 'page-bom-detail',
};

// ========== 主应用 ==========
new Vue({
  el: '#app',
  data: {
    wsConnected: false,
    ws: null,
    loggedIn: false,
    token: '',
    currentUser: {},
    loginForm: { username: '', password: '' },
    loginError: '',
    loginLoading: false,
    tabs: [],        // 已打开页签 [{ key, origin, page, label, params }]
    activeTab: null, // 当前激活页签 key
    menu: [
      {
        title: '基础设置',
        items: [
          { key: 'page-inspect-item', label: '检验项目' },
          { key: 'page-material', label: '物料数据' },
          { key: 'page-rule', label: '检验规则' },
          { key: 'page-bom', label: 'BOM数据' }
        ]
      },
      {
        title: '检验管理',
        items: [
          { key: 'page-scan', label: '扫码检验' },
          { key: 'page-records', label: '检验记录查询' },
          { key: 'page-assemble', label: '扫码装配' },
          { key: 'page-assemble-records', label: '装配记录查询' }
        ]
      },
      {
        title: '条码管理',
        items: [
          { key: 'page-barcode-print', label: '条码打印' },
          { key: 'page-barcode-archive', label: '条码档案' },
          { key: 'page-barcode-format', label: '条码格式' }
        ]
      },
      {
        title: '系统管理',
        items: [
          { key: 'page-api-log', label: '日志管理' },
          { key: 'page-arch', label: '系统架构' }
        ]
      }
    ]
  },
  computed: {
    activeTabObj() {
      return this.tabs.find(t => t.key === this.activeTab);
    }
  },
  created() {
    this._tabSeq = 0;
    this.token = localStorage.getItem('qmes_token') || '';
    this.ws = new WsClient('ws://192.168.40.118:8080');
    this.ws.token = this.token;
    this.ws.onStatus = (on) => { this.wsConnected = on; };
    // 重连成功后自动用已保存的 token 恢复登录状态
    this.ws.onOpen = () => { this.restoreSession(); };
    this.ws.onUnauthorized = () => { this.handleUnauthorized(); };
  },
  methods: {
    // 登录
    async doLogin() {
      if (this.loginLoading) return;
      const username = (this.loginForm.username || '').trim();
      const password = this.loginForm.password || '';
      if (!username || !password) { this.loginError = '请输入用户名和密码'; return; }
      if (!this.ws || !this.ws.connected) { this.loginError = '服务未连接，请稍后重试'; return; }

      this.loginLoading = true;
      this.loginError = '';
      try {
        const res = await this.ws.send('login', { username, password });
        if (!res.success) { this.loginError = res.message || '登录失败'; return; }
        this.token = res.data.token;
        this.ws.token = this.token;
        localStorage.setItem('qmes_token', this.token);
        this.currentUser = { username: res.data.username, realname: res.data.realname };
        this.loginForm.password = '';
        this.loggedIn = true;
      } catch (e) {
        this.loginError = '登录失败，请检查服务是否正常';
      } finally {
        this.loginLoading = false;
      }
    },
    // 退出登录
    async doLogout() {
      try { await this.ws.send('logout'); } catch (e) { /* 忽略 */ }
      this.clearToken();
      this.loggedIn = false;
      this.currentUser = {};
      this.tabs = [];
      this.activeTab = null;
      this.loginForm = { username: '', password: '' };
      this.loginError = '';
    },
    // 用已保存的 token 恢复登录状态
    async restoreSession() {
      if (!this.token) return;
      const res = await this.ws.send('checkSession');
      if (res.success) {
        this.currentUser = res.data;
        this.loggedIn = true;
      } else {
        this.clearToken();
        this.loggedIn = false;
      }
    },
    // 登录失效处理
    handleUnauthorized() {
      if (!this.loggedIn) return;
      this.clearToken();
      this.loggedIn = false;
      this.currentUser = {};
      this.tabs = [];
      this.activeTab = null;
      this.loginError = '登录已失效，请重新登录';
    },
    clearToken() {
      this.token = '';
      this.ws.token = '';
      localStorage.removeItem('qmes_token');
    },
    // 侧边栏点击：打开/切换功能页（单实例，已打开则切换）
    openMenu(item) {
      this.openTab(item.key);
    },
    // 打开功能页
    openTab(page, params) {
      const exist = this.tabs.find(t => t.origin === page);
      if (exist) {
        // 该页签当前显示的是明细，恢复为功能页本身
        exist.page = page;
        exist.label = PAGE_LABELS[page] || page;
        exist.params = params || {};
        this.activeTab = exist.key;
        return;
      }
      const tab = {
        key: page + '_' + (++this._tabSeq),
        origin: page,
        page,
        label: PAGE_LABELS[page] || page,
        params: params || {}
      };
      this.tabs.push(tab);
      this.activeTab = tab.key;
    },
    // 页面跳转（供子页面调用）
    // 列表⇄对应明细：在当前页签内切换；其余跳转：新开页签（同页已开则切换）
    go(page, params) {
      const cur = this.tabs.find(t => t.key === this.activeTab);
      if (cur) {
        const toDetail = INLINE[cur.page] === page; // 列表 → 明细
        const toList = INLINE[page] === cur.page;   // 明细 → 返回列表
        if (toDetail || toList) {
          cur.page = page;
          cur.label = PAGE_LABELS[page] || page;
          cur.params = toDetail ? (params || {}) : {};
          return;
        }
      }
      this.openTab(page, params);
    },
    // 关闭页签
    closeTab(key) {
      const idx = this.tabs.findIndex(t => t.key === key);
      if (idx === -1) return;
      this.tabs.splice(idx, 1);
      if (this.activeTab === key) {
        const next = this.tabs[idx] || this.tabs[idx - 1];
        this.activeTab = next ? next.key : null;
      }
    }
  }
});
