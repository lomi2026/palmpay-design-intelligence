(() => {
  const ICONS = {
    flask: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6"/><path d="M10 3v6.5L5.5 18a2.5 2.5 0 0 0 2.2 3.7h8.6a2.5 2.5 0 0 0 2.2-3.7L14 9.5V3"/><path d="M8 16h8"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
    open: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5"/><path d="m19 5-8 8"/><path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4"/></svg>'
  };

  const rawProjects = [
    ['S01','体验设计团队北极星指标对焦板','统一团队的业务价值、体验结果和组织能力指标。','战略与组织','提升组织能力','探索方案','设计管理 / Design Ops'],
    ['S02','设计团队升级为体验增长部门','从需求交付升级为持续发现机会并推动业务结果。','战略与组织','提升组织能力','探索方案','设计管理 / Design Ops'],
    ['S03','把设计指标与业务指标绑定','建立业务结果、体验结果与设计过程的三级指标体系。','战略与组织','提升组织能力','探索方案','设计管理 / Design Ops'],
    ['S04','设计团队组织如何调整','重构负责人、核心旅程、增长、AI 与平台能力角色。','战略与组织','提升组织能力','探索方案','设计管理 / Design Ops'],
    ['S05','90 天执行计划','通过试点完成基础建设、结果验证、标准化与复制。','战略与组织','提升组织能力','可立项','设计管理 / Design Ops'],
    ['S06','设计团队固定周运行机制','将问题评审、方案实验、跨职能决策和资产沉淀固定化。','战略与组织','提升组织能力','探索方案','设计管理 / Design Ops'],
    ['S07','设计团队 AI 转型组织与运行机制','建立围绕业务结果、AI 能力和组织资产的长期运行模型。','战略与组织','提升组织能力','探索方案','设计管理 / Design Ops'],
    ['P01','AI 需求分析与体验策略中心','统一吸收项目上下文，自动生成设计分析与体验策略。','设计生产','提升效率','可立项','体验设计 / 产品'],
    ['P02','AI 用户反馈与机会发现系统','将分散反馈转化为结构化、可排序、可行动的机会池。','设计生产','提升组织能力','可立项','体验设计 / 产品'],
    ['P03','AI 设计系统与设计开发一体化','连接规范、组件、Token、代码与 AI 生产流程。','设计生产','提升效率','探索方案','体验设计 / 产品'],
    ['P04','AI 产品质量门禁','建立需求、设计、开发和上线前后的自动化质量控制。','设计生产','提升质量','可立项','体验设计 / 产品'],
    ['P05','体验增长实验工厂','将用户问题持续转化为可验证、可复盘的增长实验。','设计生产','提升效率','探索方案','体验设计 / 产品'],
    ['P06','产品内 AI 体验升级','把 AI 嵌入关键任务，提升效率、成功率和可解释性。','设计生产','提升效率','探索方案','体验设计 / 产品'],
    ['P15','AI PRD 风险扫描器','在设计启动前识别规则、状态、权限、数据和异常流程风险。','设计生产','提升质量','可立项','体验设计 / 产品'],
    ['P16','AI 体验债务管理系统','持续识别、分级和关闭历史体验问题与一致性债务。','设计生产','提升质量','探索方案','体验设计 / 产品'],
    ['P17','AI 竞品与行业变化雷达','持续追踪竞品、行业、合规和设计趋势，发现有效机会。','设计生产','提升组织能力','探索方案','体验设计 / 产品'],
    ['P18','AI 用户研究助手','覆盖研究前、中、后的计划、记录、聚类与洞察生产。','设计生产','提升组织能力','探索方案','体验设计 / 产品'],
    ['P19','AI 页面状态生成器','根据 PRD 和页面结构自动补齐组件与业务状态矩阵。','设计生产','提升质量','探索方案','体验设计 / 产品'],
    ['P20','AI 原型批量生成工作流','先生成结构、信息架构、状态和多方案低保真原型。','设计生产','提升效率','探索方案','体验设计 / 产品'],
    ['P21','AI 文案与内容治理中心','统一产品术语、状态文案、错误提示和多语言内容规则。','设计生产','提升质量','探索方案','体验设计 / 产品'],
    ['P07','AI 核心漏斗诊断中心','定位核心流程最大流失步骤、失败原因和优化实验。','增长与运营','提升增长','探索方案','体验设计 / 产品'],
    ['P08','AI 新用户激活助手','基于用户状态推荐最有价值的下一步行动。','增长与运营','提升增长','可立项','体验设计 / 产品'],
    ['P09','AI 功能渗透增长助手','根据行为识别潜在需求，在合适时机推荐相关功能。','增长与运营','提升增长','探索方案','体验设计 / 产品'],
    ['P10','AI 流失用户召回分析','识别流失原因、用户类型和可执行的召回策略。','增长与运营','提升增长','探索方案','体验设计 / 产品'],
    ['P11','AI 客服问题产品化系统','把高频咨询持续转化为产品、流程、文案和帮助内容优化。','增长与运营','提升增长','探索方案','体验设计 / 产品'],
    ['P12','AI 运营工作台助手','重构运营工作台的信息架构、任务优先级和风险提醒。','增长与运营','提升增长','探索方案','体验设计 / 产品'],
    ['P13','AI 审核材料预检','在用户提交前发现缺失、模糊、过期和字段冲突。','增长与运营','提升增长','探索方案','体验设计 / 产品'],
    ['P14','AI 智能报表生成器','自动生成交易、费用、风险和运营分析报告。','增长与运营','提升增长','探索方案','体验设计 / 产品'],
    ['P22','AI 多语言与本地化体验检查','检查语言、格式、字段、金融术语、文化表达和 RTL 布局。','风险与治理','降低风险','探索方案','体验设计 / 风控合规'],
    ['P23','AI 高风险操作体验审计','审计资金、权限、安全和敏感操作的保护与可追溯性。','风险与治理','降低风险','可立项','体验设计 / 风控合规'],
    ['P24','AI 合规规则体验转译器','把专业规则转化为用户可理解、可准备、可执行的内容。','风险与治理','降低风险','探索方案','体验设计 / 风控合规'],
    ['P25','AI 设计决策知识库','让关键决策可检索、可复用、可追溯并持续验证。','风险与治理','提升组织能力','探索方案','体验设计 / 风控合规'],
    ['P26','AI 团队能力诊断与培训系统','基于真实项目识别能力短板并生成个性化成长计划。','风险与治理','提升组织能力','探索方案','体验设计 / 风控合规']
  ];
  const projects = rawProjects.map(([code,title,description,category,value,stage,owner]) => ({code,title,description,category,value,stage,owner}));
  const priorityCodes = new Set(['P01','P02','P04','P08','P15','P23']);
  const state = { query:'', category:'全部', value:'全部目标', stage:'全部阶段', selected:null };
  let panel;
  let previousActive = [];
  let previousBreadcrumb = [];

  const el = (selector, root=document) => root.querySelector(selector);
  const all = (selector, root=document) => Array.from(root.querySelectorAll(selector));
  const card = (project, priority=false) => `
    <button type="button" class="pp-project-card" data-project="${project.code}">
      <span class="pp-project-card__top"><span>${project.code}</span>${ICONS.open}</span>
      <span class="pp-project-card__title">${project.title}</span>
      <span class="pp-project-card__description">${project.description}</span>
      <span class="pp-project-card__tags"><span class="pp-project-tag">${priority ? project.category : project.stage}</span><span class="pp-project-tag pp-project-tag--solid">${priority ? project.value : project.category}</span></span>
      ${priority ? '' : `<span class="pp-project-owner">${project.value} · 建议牵头：${project.owner}</span>`}
    </button>`;

  function filteredProjects(){
    const q = state.query.trim().toLowerCase();
    return projects.filter(project =>
      (state.category === '全部' || project.category === state.category) &&
      (state.value === '全部目标' || project.value === state.value) &&
      (state.stage === '全部阶段' || project.stage === state.stage) &&
      (!q || `${project.code}${project.title}${project.description}${project.category}${project.value}`.toLowerCase().includes(q))
    );
  }

  function ensureNav(){
    const skill = all('aside nav button').find(button => button.textContent.trim() === 'AI Skill');
    if (!skill || el('[data-pp-project-nav]')) return;
    const projectNav = document.createElement('button');
    projectNav.type = 'button';
    projectNav.className = skill.className;
    projectNav.dataset.ppProjectNav = '';
    projectNav.innerHTML = `${ICONS.flask}<span class="truncate">AI 项目库</span><span class="ml-auto rounded-full border px-1.5 py-0.5 text-[9px] text-muted-foreground">33</span>`;
    skill.insertAdjacentElement('afterend', projectNav);
    projectNav.addEventListener('click', showProjects);
  }

  function markNav(active){
    const nav = el('[data-pp-project-nav]');
    if (!nav) return;
    if (active) {
      previousActive = all('aside nav button').filter(button => button !== nav && button.classList.contains('bg-accent'));
      previousActive.forEach(button => button.classList.remove('bg-accent','text-accent-foreground'));
      nav.classList.add('bg-accent','text-accent-foreground');
    } else {
      nav.classList.remove('bg-accent','text-accent-foreground');
      previousActive.forEach(button => button.classList.add('bg-accent','text-accent-foreground'));
      previousActive = [];
    }
  }

  function updateBreadcrumb(active){
    const routeNames = ['工作台','价值总览','设计资产','AI Skill','AI案例','提交内容','审核中心','数据洞察','管理中心'];
    const crumbs = all('header span').filter(element => routeNames.includes(element.textContent.trim()));
    if (active) {
      previousBreadcrumb = crumbs.map(element => [element, element.textContent]);
      crumbs.forEach(element => { element.textContent = 'AI 项目库'; });
    } else {
      previousBreadcrumb.forEach(([element, text]) => { if (element.isConnected) element.textContent = text; });
      previousBreadcrumb = [];
    }
  }

  function buildPanel(){
    if (panel) return panel;
    panel = document.createElement('section');
    panel.className = 'pp-projects-panel';
    panel.id = 'pp-projects-panel';
    panel.hidden = true;
    document.body.appendChild(panel);
    return panel;
  }

  function openProject(code){
    state.selected = projects.find(project => project.code === code) || null;
    render();
  }

  function closeProjects(){
    buildPanel().hidden = true;
    markNav(false);
    updateBreadcrumb(false);
    state.selected = null;
  }

  function render(){
    const current = buildPanel();
    const priority = projects.filter(project => priorityCodes.has(project.code));
    const filtered = filteredProjects();
    const categories = ['全部','战略与组织','设计生产','增长与运营','风险与治理'];
    current.innerHTML = `
      <div class="pp-projects-inner">
        <div class="pp-projects-head">
          <div><p class="pp-projects-eyebrow">Exploration Portfolio</p><h1 class="pp-projects-title">AI 项目库</h1><p class="pp-projects-subtitle">浏览可评估、可立项和可验证的 AI 体验设计项目方向。</p></div>
          <div class="pp-projects-actions"><button type="button" class="pp-projects-button" data-roadmap>查看 90 天路线</button><button type="button" class="pp-projects-button pp-projects-button--primary" data-all-projects>${ICONS.open}打开独立项目库</button></div>
        </div>
        <section class="pp-project-stats">
          ${[['战略与组织','7','组织战略与运行'],['设计生产','13','设计效率与质量'],['增长与运营','8','用户生命周期增长'],['风险与治理','5','金融风险与合规']].map(([label,value,note]) => `<article class="pp-project-stat"><div class="pp-project-stat__label">${label}</div><div class="pp-project-stat__value">${value}</div><div class="pp-project-stat__note">${note}</div></article>`).join('')}
        </section>
        <section class="pp-project-block"><div class="pp-project-block__head"><div><h2 class="pp-project-block__title">建议优先验证</h2><p class="pp-project-block__desc">覆盖设计生产、增长、质量与金融风险的第一批试点方向</p></div><span class="pp-project-count">6 个建议项目</span></div><div class="pp-project-priority">${priority.map(project => card(project, true)).join('')}</div></section>
        <section class="pp-project-block"><div class="pp-project-filter"><div class="pp-project-filter__row"><div class="pp-project-search">${ICONS.search}<input id="pp-project-query" class="pp-project-input" placeholder="搜索项目名称、编号或关键词" /></div><select id="pp-project-value" class="pp-project-select">${['全部目标','提升效率','提升增长','提升质量','降低风险','提升组织能力'].map(value => `<option${state.value===value?' selected':''}>${value}</option>`).join('')}</select><select id="pp-project-stage" class="pp-project-select">${['全部阶段','探索方案','可立项'].map(stage => `<option${state.stage===stage?' selected':''}>${stage}</option>`).join('')}</select></div><div class="pp-project-filters">${categories.map(category => `<button type="button" class="pp-project-filter-chip${state.category===category?' is-active':''}" data-category="${category}">${category}</button>`).join('')}</div></div></section>
        <div class="pp-project-list-meta"><span>共 ${filtered.length} 个项目</span><span>点击项目查看详情</span></div>
        <section class="pp-project-grid" id="pp-project-grid">${filtered.length ? filtered.map(project => card(project)).join('') : '<div class="pp-project-empty">没有找到匹配项目，请调整关键词或筛选条件。</div>'}</section>
      </div>
      <div class="pp-project-modal"${state.selected ? '' : ' hidden'}>${state.selected ? modal(state.selected) : ''}</div>`;
    const query = el('#pp-project-query', current);
    query.value = state.query;
    query.addEventListener('input', event => { state.query = event.target.value; render(); const refreshed = el('#pp-project-query', buildPanel()); refreshed.focus(); refreshed.setSelectionRange(state.query.length, state.query.length); });
    el('#pp-project-value', current).addEventListener('change', event => { state.value = event.target.value; render(); });
    el('#pp-project-stage', current).addEventListener('change', event => { state.stage = event.target.value; render(); });
    all('[data-category]', current).forEach(button => button.addEventListener('click', () => { state.category = button.dataset.category; render(); }));
    all('[data-project]', current).forEach(button => button.addEventListener('click', () => openProject(button.dataset.project)));
    el('[data-roadmap]', current).addEventListener('click', () => { window.location.href = './projects/index.html'; });
    el('[data-all-projects]', current).addEventListener('click', () => { window.location.href = './projects/index.html'; });
    const close = el('[data-project-close]', current);
    if (close) close.addEventListener('click', () => { state.selected=null; render(); });
  }

  function modal(project){
    return `<article class="pp-project-dialog" role="dialog" aria-modal="true" aria-label="${project.title}"><div class="pp-project-dialog__head"><div><p class="pp-project-dialog__code">${project.code}</p><h2 class="pp-project-dialog__title">${project.title}</h2></div><button type="button" class="pp-project-close" data-project-close aria-label="关闭">×</button></div><div class="pp-project-dialog__body"><p class="pp-project-dialog__description">${project.description}</p><div class="pp-project-detail-grid"><div class="pp-project-detail"><div class="pp-project-detail__label">所属领域</div><div class="pp-project-detail__value">${project.category}</div></div><div class="pp-project-detail"><div class="pp-project-detail__label">预期价值</div><div class="pp-project-detail__value">${project.value}</div></div><div class="pp-project-detail"><div class="pp-project-detail__label">当前阶段</div><div class="pp-project-detail__value">${project.stage}</div></div></div><div class="pp-project-dialog__section"><h4>建议牵头</h4><p>${project.owner}</p></div><div class="pp-project-dialog__section"><h4>下一步建议</h4><p>完成关键场景与数据输入确认，选择一个真实项目进行小范围试点，并将验证结果沉淀为可复用资产或案例。</p></div></div></article>`;
  }

  function showProjects(){
    ensureNav();
    buildPanel().hidden = false;
    markNav(true);
    updateBreadcrumb(true);
    render();
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('aside nav button');
    if (button && !button.matches('[data-pp-project-nav]')) closeProjects();
  }, true);
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && panel && !panel.hidden) { state.selected ? (state.selected=null, render()) : closeProjects(); } });
  const observer = new MutationObserver(ensureNav);
  observer.observe(document.getElementById('root') || document.body, {childList:true,subtree:true});
  ensureNav();
  window.setTimeout(ensureNav, 500);
})();
