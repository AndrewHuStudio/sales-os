// =====================================================================
// WorkBuddy GeoSales OS · 共享工具库
// - 主题切换、localStorage 持久化
// - 销售漏斗阶段、客户等级、评分计算
// - 话术生成、跟进记录管理
// - 侧边栏导航、通用 UI 组件
// =====================================================================

(function (global) {
  'use strict';

  // ---------------- 主题切换 ----------------
  const THEME_KEY = 'wb_theme';
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    return next;
  }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'light'; }

  // ---------------- 数据获取 ----------------
  function data() { return global.WB_DATA; }
  function districts() { return data().DISTRICTS; }
  function companies() { return data().COMPANIES; }
  function scripts() { return data().SCRIPTS; }

  function getCompany(id) { return companies().find(c => c.id === id); }
  function getDistrict(id) { return districts().find(d => d.id === id); }
  function companiesByDistrict(districtId) { return companies().filter(c => c.districtId === districtId); }
  function getDistrictName(id) { const d = getDistrict(id); return d ? d.name : '—'; }

  // ---------------- 销售阶段定义 ----------------
  const STAGES = [
    { id: 'untouched',  name: '未触达',   color: 'neutral',  order: 0 },
    { id: 'touched',    name: '已触达',   color: 'info',     order: 1 },
    { id: 'replied',    name: '有效回复', color: 'info',     order: 2 },
    { id: 'meeting',    name: '需求沟通', color: 'info',     order: 3 },
    { id: 'demoed',     name: '产品演示', color: 'primary',  order: 4 },
    { id: 'poc',        name: 'POC 试点', color: 'warning',  order: 5 },
    { id: 'pricing',    name: '商务报价', color: 'warning',  order: 6 },
    { id: 'contract',   name: '合同推进', color: 'warning',  order: 7 },
    { id: 'won',        name: '已成交',   color: 'success',  order: 8 },
    { id: 'lost',       name: '输单',     color: 'danger',   order: 9 },
    { id: 'paused',     name: '暂缓',     color: 'neutral',  order: 10 }
  ];
  function getStage(id) { return STAGES.find(s => s.id === id) || STAGES[0]; }
  function getStageName(id) { return getStage(id).name; }

  // ---------------- 客户等级判断 ----------------
  function getLevel(score) {
    if (score >= 80) return { id: 'A', name: 'A 类', min: 80 };
    if (score >= 60) return { id: 'B', name: 'B 类', min: 60 };
    return { id: 'C', name: 'C 类', min: 0 };
  }

  // ---------------- 行业相关 ----------------
  const INDUSTRY_SCENARIOS = {
    '跨境电商':  ['选品研究助手', '竞品分析助手', '多语言营销内容', '客服知识库', '平台规则问答'],
    'SaaS':     ['客户方案生成', '产品文档助手', '会议纪要助手', '研发知识库', 'CSM 助手'],
    '人工智能': ['技术文档助手', '客户方案生成', '会议纪要', '研发知识库'],
    '金融':     ['研究报告整理', '客户会议纪要', '投研助手', '客户经理助手', '合规文档'],
    '咨询':     ['研究报告整理', '客户提案生成', '知识库问答'],
    '金融科技': ['合规文档', '客户经理助手', '风控文档', '研究报告整理'],
    '智能硬件': ['产品文档助手', '客户方案生成', 'SOP 培训', '多语种内容'],
    '制造':     ['售前方案助手', '售后知识库', 'SOP 培训助手', '客户需求整理', '质检文档'],
    '教育':     ['内容生成', '客服知识库', '培训助手'],
    '物流':     ['客户报价助手', '客户研究', '培训助手'],
    '文旅':     ['活动方案生成', '营销内容生成', '客户问答助手', '游客服务知识库', '培训助手'],
    '商业':     ['营销内容生成', '客户问答助手', '招商资料整理'],
    '教育科技': ['内容生成', '客服知识库', '培训助手'],
    '企业服务': ['销售资料整理', '客户研究', '会议纪要'],
    '保险':     ['保险条款助手', '客户经理助手', '会议纪要', '培训助手'],
    '芯片':     ['技术文档助手', '客户方案生成', '会议纪要'],
    '法律':     ['法律检索助手', '合同审核助手'],
    '通用':     ['会议纪要助手', '客户方案生成', '企业知识库', '销售资料整理', '培训助手']
  };
  const INDUSTRY_PAIN_POINTS = {
    '跨境电商': ['选品和竞品研究耗时长', '多语言内容生产压力大', '客服知识库分散', '平台规则变化快', '新人培训成本高'],
    'SaaS':     ['会议多、纪要多', '产品文档更新频繁', '客户方案重复撰写', '研发/产品/销售信息不同步', '内部知识沉淀不足'],
    '人工智能': ['技术文档分散', '客户行业方案定制耗时', '研发知识沉淀不足', '跨部门沟通成本高'],
    '金融':     ['研究报告数量大', '客户提案定制化高', '合规审查繁重', '投研团队效率瓶颈', '客户经理展业效率'],
    '咨询':     ['研究报告耗时长', '客户提案定制化', '知识沉淀不足'],
    '金融科技': ['合规文档更新频繁', '客户经理方案多', '研究资料量大', '跨部门合规审查'],
    '智能硬件': ['产品迭代快文档多', '客户行业方案重复', '海外客户多语种', '团队培训成本高'],
    '制造':     ['售前方案制作慢', '客户需求资料分散', '售后问题重复处理', 'SOP 难维护', '多部门协同效率低'],
    '教育':     ['课程内容产能', '客服知识分散', '教师培训繁重'],
    '物流':     ['客户报价定制', '会议信息分散', '新人培训慢', '客户研究重复'],
    '文旅':     ['活动方案定制', '营销内容产能', '游客咨询量大', '多项目协同'],
    '商业':     ['营销内容产能', '客户咨询量大', '招商资料更新'],
    '企业服务': ['客户研究重复', '销售物料版本管理', '团队规模小效率压力大'],
    '保险':     ['保险产品复杂', '客户经理培训', '团队规模大管理难'],
    '芯片':     ['技术文档复杂', '客户方案定制', '会议密度高'],
    '法律':     ['法律检索耗时长', '合同审核重复', '知识沉淀分散'],
    '通用':     ['会议纪要繁重', '客户资料分散', '团队培训成本高', '内部知识复用低']
  };

  function getScenarios(industry) { return INDUSTRY_SCENARIOS[industry] || INDUSTRY_SCENARIOS['通用']; }
  function getPainPoints(industry) { return INDUSTRY_PAIN_POINTS[industry] || INDUSTRY_PAIN_POINTS['通用']; }

  // ---------------- 8 维度评分（用于重新计算） ----------------
  const SCORE_DIMENSIONS = [
    { id: 'knowledge',  name: '知识工作密度',  weight: 20 },
    { id: 'scale',      name: '组织规模',      weight: 15 },
    { id: 'collab',     name: '多部门协作',    weight: 15 },
    { id: 'aiAttitude', name: 'AI 接受度',     weight: 15 },
    { id: 'tencentEco', name: '腾讯生态适配',  weight: 10 },
    { id: 'growth',     name: '业务增长压力',  weight: 10 },
    { id: 'security',   name: '数据安全需求',  weight: 10 },
    { id: 'procurement',name: '采购可能性',    weight: 5 }
  ];

  // ---------------- 话术生成 ----------------
  function generateScript(company, kpRole, scenario, scriptType) {
    // 1. 优先匹配：行业 + KP + 场景 + 类型
    let pool = scripts();
    let match = pool.find(s => s.industry === company.industry && s.kpRole === kpRole && s.scenario === scenario && s.scriptType === scriptType);
    if (match) return { content: match.content, source: 'matched', score: match.effectivenessScore };

    // 2. 行业 + KP + 场景
    match = pool.find(s => s.industry === company.industry && s.kpRole === kpRole && s.scenario === scenario);
    if (match) return { content: match.content, source: 'industry-kp-scenario', score: match.effectivenessScore };

    // 3. 行业 + KP
    match = pool.find(s => s.industry === company.industry && s.kpRole === kpRole);
    if (match) return { content: match.content, source: 'industry-kp', score: match.effectivenessScore };

    // 4. 行业 + 场景
    match = pool.find(s => s.industry === company.industry && s.scenario === scenario);
    if (match) return { content: match.content, source: 'industry-scenario', score: match.effectivenessScore };

    // 5. KP + 场景
    match = pool.find(s => s.kpRole === kpRole && s.scenario === scenario);
    if (match) return { content: match.content, source: 'kp-scenario', score: match.effectivenessScore };

    // 6. 通用 + 场景
    match = pool.find(s => s.industry === '通用' && s.scenario === scenario);
    if (match) return { content: match.content, source: 'general-scenario', score: match.effectivenessScore };

    // 7. 通用 + KP
    match = pool.find(s => s.industry === '通用' && s.kpRole === kpRole);
    if (match) return { content: match.content, source: 'general-kp', score: match.effectivenessScore };

    // 8. 兜底
    return {
      content: `您好，我是腾讯云的 Andrew，目前主要负责企业 AI 办公和 WorkBuddy 相关方案。我关注到贵司在 ${company.industry} 领域的发展，结合贵司的具体情况，我们可以用 WorkBuddy 帮团队在 ${scenario || '日常协作'} 上提效。想约您 20 分钟简单交流。`,
      source: 'fallback', score: 3.0
    };
  }

  // ---------------- 跟进总结（自然语言 → 结构化） ----------------
  function summarizeFollowup(text) {
    if (!text || text.trim().length < 10) return null;
    const t = text.trim();

    // 简易规则提取（生产环境应调 WorkBuddy API）
    const result = {
      summary: t.length > 120 ? t.substring(0, 120) + '...' : t,
      customerInterest: [],
      objections: [],
      suggestedStage: '已沟通',
      nextAction: '建议 3-5 天后跟进',
      materialsNeeded: []
    };

    // 兴趣关键词
    const interestKeywords = [
      ['会议纪要', '会议纪要', '会议'], ['客户方案', '方案生成', '方案'],
      ['知识库', '知识', '问答'], ['客服', '客服助手', '客服知识'],
      ['多语言', '多语种', '翻译'], ['选品', '选品研究'],
      ['投研', '研究报告', '研究'], ['合规', '合规文档'],
      ['培训', '新员工', 'SOP'], ['SOP', '操作手册']
    ];
    for (const [_, ...keys] of interestKeywords) {
      for (const k of keys) {
        if (t.includes(k)) {
          const interest = keys[0] === '会议纪要' ? '会议纪要' :
                          keys[0] === '客户方案' ? '客户方案生成' :
                          keys[0] === '知识库' ? '企业知识库' :
                          keys[0] === '客服' ? '客服知识库' :
                          keys[0] === '多语言' ? '多语言内容' :
                          keys[0] === '选品' ? '选品研究' :
                          keys[0] === '投研' ? '投研助手' :
                          keys[0] === '合规' ? '合规文档' :
                          keys[0] === '培训' ? '培训助手' :
                          keys[0] === 'SOP' ? 'SOP 助手' : keys[0];
          if (!result.customerInterest.includes(interest)) result.customerInterest.push(interest);
          break;
        }
      }
    }

    // 异议关键词
    const objectionKeywords = [
      ['价格', '价格', '费用', '预算', '贵'],
      ['数据安全', '数据安全', '安全', '权限', '私有化', '私有部署'],
      ['效果', '效果', 'ROI', '价值', '有没有用'],
      ['时间', '时间', '没时间', '太忙'],
      ['集团', '集团', '总部', '审批', '走流程'],
      ['已经在用', '已经在用', '已有方案', '对比'],
      ['人员', '人员', '团队', '编制']
    ];
    for (const keys of objectionKeywords) {
      for (const k of keys) {
        if (t.includes(k)) {
          const label = keys[0] === '价格' ? '价格/预算' :
                       keys[0] === '数据安全' ? '数据安全' :
                       keys[0] === '效果' ? '效果/ROI' :
                       keys[0] === '时间' ? '时间/优先级' :
                       keys[0] === '集团' ? '集团/审批' :
                       keys[0] === '已经在用' ? '竞品对比' :
                       keys[0] === '人员' ? '团队/编制' : keys[0];
          if (!result.objections.includes(label)) result.objections.push(label);
          break;
        }
      }
    }

    // 阶段判断
    if (t.includes('POC') || t.includes('试点')) result.suggestedStage = 'POC';
    else if (t.includes('演示') || t.includes('看产品')) result.suggestedStage = '已演示';
    else if (t.includes('合同') || t.includes('报价')) result.suggestedStage = '商务报价';
    else if (t.includes('已沟通') || t.includes('聊过')) result.suggestedStage = '已沟通';
    else if (t.includes('未触达')) result.suggestedStage = '未触达';

    // 下一步建议
    if (result.objections.length > 0) {
      const obj = result.objections[0];
      if (obj === '数据安全') result.nextAction = '准备安全说明材料，约 IT 负责人参加下一次会议';
      else if (obj === '价格/预算') result.nextAction = '提供 ROI 测算表，准备采购预算说明';
      else if (obj === '效果/ROI') result.nextAction = '提供同行业 POC 案例+ROI 数据';
      else if (obj === '集团/审批') result.nextAction = '准备集团采购对接表+案例集';
      else result.nextAction = '针对异议准备具体回应材料';
    }
    if (t.includes('POC') || t.includes('试点')) result.nextAction = '推动 POC 合同签订';
    if (t.includes('演示')) result.nextAction = '准备产品演示+案例材料';
    if (t.includes('集团') || t.includes('总部')) result.nextAction = '准备集团/总部对接材料';

    // 推荐材料
    if (result.customerInterest.includes('会议纪要')) result.materialsNeeded.push('会议纪要案例');
    if (result.customerInterest.includes('客服知识库')) result.materialsNeeded.push('客服知识库方案');
    if (result.customerInterest.includes('多语言内容')) result.materialsNeeded.push('多语言内容案例');
    if (result.objections.includes('数据安全')) result.materialsNeeded.push('数据安全白皮书');
    if (result.objections.includes('价格/预算')) result.materialsNeeded.push('ROI 测算表');
    if (t.includes('POC') || t.includes('试点')) result.materialsNeeded.push('POC 合同模板');

    return result;
  }

  // ---------------- LocalStorage 跟进记录 ----------------
  const FOLLOWUP_KEY = 'wb_followups_v1';
  function loadFollowups() {
    try {
      const stored = localStorage.getItem(FOLLOWUP_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) { console.error(e); }
    // 首次加载：合并 mock + 空数组
    const initial = (data().INITIAL_FOLLOWUPS || []).map(f => ({ ...f, _mock: true }));
    saveFollowups(initial);
    return initial;
  }
  function saveFollowups(list) { localStorage.setItem(FOLLOWUP_KEY, JSON.stringify(list)); }
  function addFollowup(fu) {
    const list = loadFollowups();
    fu.id = 'fu_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    list.unshift(fu);
    saveFollowups(list);
    return fu;
  }

  // ---------------- 今日拜访开始 ----------------
  const VISIT_KEY = 'wb_visit_log_v1';
  function loadVisits() { try { return JSON.parse(localStorage.getItem(VISIT_KEY) || '[]'); } catch (e) { return []; } }
  function startVisit(companyId) {
    const list = loadVisits();
    const c = getCompany(companyId);
    if (!c) return;
    // 同一企业同一天不重复记录
    const today = todayStr();
    if (list.find(v => v.companyId === companyId && v.startedAt && v.startedAt.indexOf(today) === 0)) {
      toast('今日已记录开始拜访 ' + c.name, 'success');
      return;
    }
    list.unshift({
      id: 'v_' + Date.now(),
      companyId,
      companyName: c.name,
      startedAt: fmtDate(new Date(), true)
    });
    localStorage.setItem(VISIT_KEY, JSON.stringify(list));
    // 同时把客户阶段更新为「已触达」（如果还是未触达）
    const cs = companies();
    const target = cs.find(x => x.id === companyId);
    if (target && target.currentStage === 'untouched') {
      target.currentStage = 'touched';
      // 同步刷新内存中的 companies（直接修改 data 引用）
      // 由于 COMPANIES 是 const，此处仅在前端状态生效
    }
    toast('已开始拜访：' + c.name + '，请到跟进记录补充沟通内容', 'success');
  }
  function followupsForCompany(companyId) {
    return loadFollowups().filter(f => f.companyId === companyId);
  }
  function deleteFollowup(id) {
    const list = loadFollowups().filter(f => f.id !== id);
    saveFollowups(list);
  }

  // ---------------- 收藏 ----------------
  const FAV_KEY = 'wb_favs_v1';
  function loadFavs() { try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch (e) { return []; } }
  function toggleFav(companyId) {
    const list = loadFavs();
    const idx = list.indexOf(companyId);
    if (idx >= 0) list.splice(idx, 1); else list.push(companyId);
    localStorage.setItem(FAV_KEY, JSON.stringify(list));
    return idx < 0;
  }
  function isFav(companyId) { return loadFavs().includes(companyId); }

  // ---------------- 工具函数 ----------------
  function fmtDate(d, withTime) {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date)) return '—';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    if (!withTime) return `${y}-${m}-${day}`;
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day} ${hh}:${mm}`;
  }
  function todayStr() { return fmtDate(new Date()); }
  function daysFromNow(d) {
    if (!d) return null;
    const target = new Date(d);
    const today = new Date();
    return Math.round((target - today) / 86400000);
  }
  function relativeDate(d) {
    const diff = daysFromNow(d);
    if (diff === null) return '—';
    if (diff === 0) return '今天';
    if (diff === 1) return '明天';
    if (diff === -1) return '昨天';
    if (diff > 1 && diff <= 7) return `${diff} 天后`;
    if (diff < -1 && diff >= -7) return `${-diff} 天前`;
    if (diff > 7 && diff <= 30) return `${diff} 天后`;
    if (diff < -7 && diff >= -30) return `${-diff} 天前`;
    return fmtDate(d);
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function urlParam(name) {
    const params = new URLSearchParams(location.search);
    return params.get(name);
  }
  function setUrlParam(name, value) {
    const params = new URLSearchParams(location.search);
    if (value) params.set(name, value); else params.delete(name);
    const newSearch = params.toString();
    const newUrl = location.pathname + (newSearch ? '?' + newSearch : '');
    history.replaceState(null, '', newUrl);
  }

  // ---------------- Toast ----------------
  function toast(message, type) {
    type = type || 'success';
    const el = document.createElement('div');
    el.className = 'toast' + (type === 'error' ? ' error' : '');
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(120%)'; el.style.transition = 'all 0.3s ease'; }, 2400);
    setTimeout(() => el.remove(), 2800);
  }

  // ---------------- Sidebar 渲染 ----------------
  const NAV_ITEMS = [
    { group: '主导航', items: [
      { id: 'dashboard', name: '销售工作台', href: 'dashboard.html', icon: '<path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>' },
      { id: 'map', name: '深圳客户地图', href: 'map.html', icon: '<path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>' },
      { id: 'companies', name: '企业清单', href: 'companies.html', icon: '<path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>' },
      { id: 'followups', name: '跟进记录', href: 'followups.html', icon: '<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>' }
    ]},
    { group: '战术看板', items: [
      { id: 'funnel', name: '销售漏斗', href: 'funnel.html', icon: '<path d="M4 4h16v3H4V4zm0 6.5h16v3H4v-3zm0 6.5h16v3H4v-3z"/>' },
      { id: 'review', name: '销售复盘', href: 'review.html', icon: '<path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>' }
    ]}
  ];

  function renderSidebar(activeId) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    let html = `
      <div class="brand">
        <div class="brand-logo">WB</div>
        <div>
          <div class="brand-name">GeoSales OS</div>
          <div class="brand-sub">WorkBuddy · 销售作战</div>
        </div>
      </div>
    `;
    for (const group of NAV_ITEMS) {
      html += `<div class="nav-section"><div class="nav-title">${group.group}</div>`;
      for (const item of group.items) {
        const active = item.id === activeId ? ' active' : '';
        html += `<a class="nav-link${active}" href="${item.href}"><svg viewBox="0 0 24 24" fill="currentColor">${item.icon}</svg>${item.name}</a>`;
      }
      html += '</div>';
    }
    html += `
      <div class="sidebar-footer">
        <div style="padding: 12px; background: var(--gradient-primary-soft); border-radius: var(--radius-md); margin-top: 8px;">
          <div style="font-size: 12px; color: var(--color-text-soft); margin-bottom: 4px;">Sales</div>
          <div style="font-weight: 700;">Andrew 胡</div>
          <div style="font-size: 11px; color: var(--color-text-muted); margin-top: 2px;">深圳 · WorkBuddy</div>
        </div>
      </div>
    `;
    sidebar.innerHTML = html;
  }

  // ---------------- 移动端汉堡菜单 ----------------
  function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (!btn || !sidebar) return;
    btn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
    // 点击 sidebar link 后收起
    sidebar.querySelectorAll('.nav-link').forEach(a => {
      a.addEventListener('click', () => sidebar.classList.remove('open'));
    });
  }

  // ---------------- 主题按钮 ----------------
  function initThemeBtn() {
    const btn = document.getElementById('theme-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const next = toggleTheme();
      btn.title = next === 'dark' ? '切换到浅色' : '切换到深色';
    });
  }

  // ---------------- 评分维度明细展示 ----------------
  function scoreBarHTML(dim, value) {
    const pct = Math.round((value / dim.weight) * 100);
    return `
      <div class="score-bar">
        <div class="score-bar-label">${dim.name}</div>
        <div class="score-bar-track"><div class="score-bar-fill" style="width: ${pct}%"></div></div>
        <div class="score-bar-value num">${value} / ${dim.weight}</div>
      </div>
    `;
  }

  function fullScoreBreakdown(breakdown) {
    return SCORE_DIMENSIONS.map(dim => scoreBarHTML(dim, breakdown[dim.id] || 0)).join('');
  }

  // ---------------- 数字 countUp 动画 ----------------
  function animateNumbers() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const decimals = (el.dataset.count.split('.')[1] || '').length;
      const duration = 1000;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  // ---------------- 全局初始化 ----------------
  function initShell(activeId) {
    initTheme();
    renderSidebar(activeId);
    initMobileMenu();
    initThemeBtn();
    animateNumbers();
  }

  // ---------------- 导出 ----------------
  global.WB = {
    // 数据
    data, districts, companies, scripts,
    getCompany, getDistrict, companiesByDistrict, getDistrictName,
    // 业务逻辑
    STAGES, getStage, getStageName,
    getLevel, getScenarios, getPainPoints,
    SCORE_DIMENSIONS,
    generateScript, summarizeFollowup,
    // 持久化
    loadFollowups, addFollowup, followupsForCompany, deleteFollowup,
    loadFavs, toggleFav, isFav,
    loadVisits, startVisit,
    // 工具
    fmtDate, todayStr, daysFromNow, relativeDate, escapeHtml, urlParam, setUrlParam,
    toast, initShell,
    scoreBarHTML, fullScoreBreakdown, animateNumbers
  };

})(window);
