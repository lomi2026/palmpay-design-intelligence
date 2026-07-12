(() => {
  const ICONS = {
    flask: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6"/><path d="M10 3v6.5L5.5 18a2.5 2.5 0 0 0 2.2 3.7h8.6a2.5 2.5 0 0 0 2.2-3.7L14 9.5V3"/><path d="M8 16h8"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
    open: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5"/><path d="m19 5-8 8"/><path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4"/></svg>'
  };

  const sourceProjects = Array.isArray(window.PP_PROJECTS_DATA) ? window.PP_PROJECTS_DATA : [];
  const projects = sourceProjects.map(({file, ...project}) => project);
  const detailFiles = Object.fromEntries(sourceProjects.map(project => [project.code, project.file]));
  const priorityCodes = new Set(['P01','P02','P04','P08','P15','P23']);
  window.PP_PROJECTS = sourceProjects.map(project => ({ ...project }));
  const STORAGE_KEY = 'pp-ai-project-library-state';
  const defaultState = { query:'', category:'全部', value:'全部目标', stage:'全部阶段', scrollTop:0 };
  let savedState = {};
  try { savedState = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}'); } catch {}
  const state = { ...defaultState, ...savedState };
  let panel;
  let selectedProject = null;
  let projectTriggerCode = null;
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
    projectNav.addEventListener('click', () => {
      if (window.location.hash !== '#ai-projects') window.location.hash = 'ai-projects';
      else showProjects();
    });
  }

  function markNav(active){
    const nav = el('[data-pp-project-nav]');
    if (!nav) return;
    if (active) {
      previousActive = all('aside nav button').filter(button => button !== nav && button.classList.contains('bg-accent'));
      previousActive.forEach(button => button.classList.remove('bg-accent','text-accent-foreground'));
      nav.classList.add('bg-accent','text-accent-foreground');
      nav.setAttribute('aria-current', 'page');
    } else {
      nav.classList.remove('bg-accent','text-accent-foreground');
      nav.removeAttribute('aria-current');
      previousActive.forEach(button => button.classList.add('bg-accent','text-accent-foreground'));
      previousActive = [];
    }
  }

  function updateBreadcrumb(active){
    const routeNames = ['工作台','价值总览','设计资产','AI Skill','AI 案例','提交内容','审核中心','数据洞察','管理中心'];
    const crumbs = all('header span').filter(element => routeNames.includes(element.textContent.trim()));
    if (active) {
      previousBreadcrumb = crumbs.map(element => [element, element.textContent]);
      crumbs.forEach(element => { element.textContent = 'AI 项目库'; });
    } else {
      previousBreadcrumb.forEach(([element, text]) => { if (element.isConnected) element.textContent = text; });
      previousBreadcrumb = [];
    }
  }

  function getMain(){
    return document.querySelector('#root main');
  }

  function syncPageState(active){
    const main = getMain();
    if (!main) return;
    if (panel && panel.parentElement !== main) main.appendChild(panel);
    Array.from(main.children).forEach(child => {
      if (child === panel) return;
      if (active) {
        child.dataset.ppProjectsHidden = 'true';
        child.hidden = true;
        child.inert = true;
        child.setAttribute('aria-hidden', 'true');
      } else if (child.dataset.ppProjectsHidden === 'true') {
        child.hidden = false;
        child.inert = false;
        child.removeAttribute('aria-hidden');
        delete child.dataset.ppProjectsHidden;
      }
    });
    document.body.classList.toggle('pp-projects-active', active);
  }

  function buildPanel(){
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'pp-projects-panel';
      panel.id = 'pp-projects-panel';
      panel.setAttribute('aria-labelledby', 'pp-projects-title');
      panel.hidden = true;
    }
    const main = getMain();
    if (main && panel.parentElement !== main) main.appendChild(panel);
    return panel;
  }

  function persistState(){
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  function navigateToProject(code){
    const filename = detailFiles[code];
    if (!filename) return;
    state.scrollTop = window.scrollY;
    persistState();
    window.location.href = `./projects/${filename}?from=workspace`;
  }

  function openProject(code){
    selectedProject = projects.find(project => project.code === code) || null;
    if (!selectedProject) return;
    projectTriggerCode = code;
    state.scrollTop = window.scrollY;
    persistState();
    render();
    window.requestAnimationFrame(() => {
      document.body.classList.add('pp-project-modal-open');
      const closeButton = el('[data-project-close]', buildPanel());
      if (closeButton) closeButton.focus();
    });
  }

  function closeProjectModal(){
    if (!selectedProject) return;
    const triggerCode = projectTriggerCode;
    selectedProject = null;
    projectTriggerCode = null;
    document.body.classList.remove('pp-project-modal-open');
    render();
    window.requestAnimationFrame(() => {
      const trigger = el(`[data-project="${triggerCode}"]`, buildPanel());
      if (trigger) trigger.focus();
    });
  }

  function closeProjects({ clearHash = false } = {}){
    if (!panel) return;
    state.scrollTop = window.scrollY;
    persistState();
    selectedProject = null;
    projectTriggerCode = null;
    document.body.classList.remove('pp-project-modal-open');
    panel.hidden = true;
    syncPageState(false);
    markNav(false);
    updateBreadcrumb(false);
    if (clearHash && window.location.hash === '#ai-projects') {
      window.location.hash = '';
    }
  }

  function clearFilters(){
    Object.assign(state, defaultState, { scrollTop: 0 });
    persistState();
    render();
  }

  function render(){
    const current = buildPanel();
    const previousScroll = state.scrollTop || 0;
    const priority = projects.filter(project => priorityCodes.has(project.code));
    const filtered = filteredProjects();
    const categories = ['全部','战略与组织','设计生产','增长与运营','风险与治理'];
    const hasFilters = Boolean(state.query || state.category !== '全部' || state.value !== '全部目标' || state.stage !== '全部阶段');
    current.innerHTML = `
      <div class="pp-projects-inner">
        <div class="pp-projects-head">
          <div><p class="pp-projects-eyebrow">Exploration Portfolio</p><h1 class="pp-projects-title" id="pp-projects-title">AI 项目库</h1><p class="pp-projects-subtitle">浏览可评估、可立项和可验证的 AI 体验设计项目方向。</p></div>
          <div class="pp-projects-actions"><button type="button" class="pp-projects-button" data-roadmap>查看 90 天路线</button></div>
        </div>
        <section class="pp-project-stats">
          ${[['战略与组织','7','组织战略与运行'],['设计生产','13','设计效率与质量'],['增长与运营','8','用户生命周期增长'],['风险与治理','5','金融风险与合规']].map(([label,value,note]) => `<button type="button" class="pp-project-stat${state.category===label?' is-active':''}" data-stat-category="${label}" aria-pressed="${state.category===label}"><span class="pp-project-stat__label">${label}</span><span class="pp-project-stat__value">${value}</span><span class="pp-project-stat__note">${note}</span></button>`).join('')}
        </section>
        <section class="pp-project-block"><div class="pp-project-block__head"><div><h2 class="pp-project-block__title">建议优先验证</h2><p class="pp-project-block__desc">覆盖设计生产、增长、质量与金融风险的第一批试点方向</p></div><span class="pp-project-count">6 个建议项目</span></div><div class="pp-project-priority">${priority.map(project => card(project, true)).join('')}</div></section>
        <section class="pp-project-block"><div class="pp-project-filter"><div class="pp-project-filter__row"><div class="pp-project-search">${ICONS.search}<input id="pp-project-query" class="pp-project-input" placeholder="搜索项目名称、编号或关键词" aria-label="搜索 AI 项目" /></div><select id="pp-project-value" class="pp-project-select" aria-label="按目标筛选">${['全部目标','提升效率','提升增长','提升质量','降低风险','提升组织能力'].map(value => `<option${state.value===value?' selected':''}>${value}</option>`).join('')}</select><select id="pp-project-stage" class="pp-project-select" aria-label="按阶段筛选">${['全部阶段','探索方案','可立项'].map(stage => `<option${state.stage===stage?' selected':''}>${stage}</option>`).join('')}</select></div><div class="pp-project-filters">${categories.map(category => `<button type="button" class="pp-project-filter-chip${state.category===category?' is-active':''}" data-category="${category}" aria-pressed="${state.category===category}">${category}</button>`).join('')}${hasFilters ? '<button type="button" class="pp-project-filter-clear" data-clear-filters>清空全部筛选</button>' : ''}</div></div></section>
        <div class="pp-project-list-meta"><span>共 ${filtered.length} 个项目</span><span>点击项目查看详情</span></div>
        <section class="pp-project-grid" id="pp-project-grid">${filtered.length ? filtered.map(project => card(project)).join('') : '<div class="pp-project-empty"><p>没有找到匹配项目，请调整关键词或筛选条件。</p><button type="button" class="pp-projects-button" data-clear-filters>恢复全部项目</button></div>'}</section>
      </div>
      <div class="pp-project-modal"${selectedProject ? '' : ' hidden'}>${selectedProject ? modal(selectedProject) : ''}</div>`;
    const query = el('#pp-project-query', current);
    query.value = state.query;
    query.addEventListener('input', event => { state.query = event.target.value; persistState(); render(); const refreshed = el('#pp-project-query', buildPanel()); refreshed.focus(); refreshed.setSelectionRange(state.query.length, state.query.length); });
    el('#pp-project-value', current).addEventListener('change', event => { state.value = event.target.value; persistState(); render(); });
    el('#pp-project-stage', current).addEventListener('change', event => { state.stage = event.target.value; persistState(); render(); });
    all('[data-category]', current).forEach(button => button.addEventListener('click', () => { state.category = button.dataset.category; persistState(); render(); }));
    all('[data-stat-category]', current).forEach(button => button.addEventListener('click', () => { state.category = state.category === button.dataset.statCategory ? '全部' : button.dataset.statCategory; persistState(); render(); }));
    all('[data-clear-filters]', current).forEach(button => button.addEventListener('click', clearFilters));
    all('[data-project]', current).forEach(button => button.addEventListener('click', () => openProject(button.dataset.project)));
    el('[data-roadmap]', current).addEventListener('click', () => navigateToProject('S05'));
    const detailButton = el('[data-project-detail]', current);
    if (detailButton) detailButton.addEventListener('click', () => navigateToProject(detailButton.dataset.projectDetail));
    const closeButton = el('[data-project-close]', current);
    if (closeButton) closeButton.addEventListener('click', closeProjectModal);
    const modalOverlay = el('.pp-project-modal', current);
    if (modalOverlay) modalOverlay.addEventListener('click', event => { if (event.target === modalOverlay) closeProjectModal(); });
    const dialog = el('.pp-project-dialog', current);
    if (dialog) dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const focusable = all('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])', dialog).filter(node => !node.hidden);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    state.scrollTop = previousScroll;
    persistState();
    window.requestAnimationFrame(() => { window.scrollTo({ top: state.scrollTop, behavior: 'auto' }); });
  }

  function modal(project){
    return `<article class="pp-project-dialog" role="dialog" aria-modal="true" aria-labelledby="pp-project-dialog-title" aria-describedby="pp-project-dialog-description"><div class="pp-project-dialog__head"><div><p class="pp-project-dialog__code">${project.code}</p><h2 class="pp-project-dialog__title" id="pp-project-dialog-title">${project.title}</h2></div><button type="button" class="pp-project-close" data-project-close aria-label="关闭项目详情弹窗">×</button></div><div class="pp-project-dialog__body"><p class="pp-project-dialog__description" id="pp-project-dialog-description">${project.description}</p><div class="pp-project-detail-grid"><div class="pp-project-detail"><div class="pp-project-detail__label">所属领域</div><div class="pp-project-detail__value">${project.category}</div></div><div class="pp-project-detail"><div class="pp-project-detail__label">预期价值</div><div class="pp-project-detail__value">${project.value}</div></div><div class="pp-project-detail"><div class="pp-project-detail__label">当前阶段</div><div class="pp-project-detail__value">${project.stage}</div></div></div><div class="pp-project-dialog__section"><h4>建议牵头</h4><p>${project.owner}</p></div><div class="pp-project-dialog__section"><h4>下一步建议</h4><p>完成关键场景与数据输入确认，选择一个真实项目进行小范围试点，并将验证结果沉淀为可复用资产或案例。</p></div><div class="pp-project-dialog__footer"><button type="button" class="pp-project-detail-button" data-project-detail="${project.code}">查看项目详情${ICONS.arrow}</button></div></div></article>`;
  }

  function showProjects(){
    ensureNav();
    const current = buildPanel();
    current.hidden = false;
    syncPageState(true);
    markNav(true);
    updateBreadcrumb(true);
    render();
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('aside nav button');
    if (button && !button.matches('[data-pp-project-nav]')) closeProjects({ clearHash: true });
  }, true);
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !panel || panel.hidden) return;
    if (selectedProject) closeProjectModal();
    else closeProjects({ clearHash: true });
  });
  const observer = new MutationObserver(() => {
    ensureNav();
    if (window.location.hash === '#ai-projects') {
      buildPanel();
      syncPageState(true);
      markNav(true);
      updateBreadcrumb(true);
    }
  });
  observer.observe(document.getElementById('root') || document.body, {childList:true,subtree:true});
  ensureNav();
  window.setTimeout(ensureNav, 500);
  if (window.location.hash === '#ai-projects') window.setTimeout(showProjects, 0);
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#ai-projects') showProjects();
    else closeProjects();
  });
})();
