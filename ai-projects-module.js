(() => {
  const ICONS = {
    flask: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6"/><path d="M10 3v6.5L5.5 18a2.5 2.5 0 0 0 2.2 3.7h8.6a2.5 2.5 0 0 0 2.2-3.7L14 9.5V3"/><path d="M8 16h8"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
    open: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5"/><path d="m19 5-8 8"/><path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4"/></svg>',
    grid: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>',
    list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>'
  };

  const sourceProjects = Array.isArray(window.PP_PROJECTS_DATA) ? window.PP_PROJECTS_DATA : [];
  const priorityFallback = {
    P01: { priorityRank: 1, priorityReason: '输入与输出边界清晰，可直接复用现有 PRD，最快形成团队级效率样板。', impact: '高', effort: '中', readiness: '高' },
    P04: { priorityRank: 2, priorityReason: '质量问题成本可量化，适合在上线前流程中建立明确门禁。', impact: '高', effort: '中', readiness: '高' },
    P15: { priorityRank: 3, priorityReason: '可利用历史 PRD 回测，低风险验证规则召回率与误报率。', impact: '高', effort: '低', readiness: '高' },
    P08: { priorityRank: 4, priorityReason: '激活链路数据基础较成熟，业务结果可通过转化率直接验证。', impact: '高', effort: '中', readiness: '中' }
  };
  const normalizedSourceProjects = sourceProjects.map(project => {
    const fallback = priorityFallback[project.code];
    const rawRank = Number(project.priorityRank);
    if (!fallback) return { ...project, priorityRank: Number.isFinite(rawRank) ? rawRank : undefined };
    return {
      ...fallback,
      ...project,
      priorityRank: Number.isFinite(rawRank) ? rawRank : fallback.priorityRank,
      priorityReason: project.priorityReason || fallback.priorityReason,
      impact: project.impact || fallback.impact,
      effort: project.effort || fallback.effort,
      readiness: project.readiness || fallback.readiness
    };
  });
  const projects = normalizedSourceProjects.map(({ file, ...project }) => project);
  const detailFiles = Object.fromEntries(normalizedSourceProjects.map(project => [project.code, project.file]));
  const priorityProjects = projects.filter(project => Number.isFinite(project.priorityRank)).sort((a, b) => a.priorityRank - b.priorityRank).slice(0, 4);
  window.PP_PROJECTS = normalizedSourceProjects.map(project => ({ ...project }));

  const STORAGE_KEY = 'pp-ai-project-library-state';
  const defaultState = {
    query: '',
    category: '全部',
    value: '全部目标',
    stage: '全部阶段',
    portfolio: '全部项目',
    sort: 'recommended',
    view: 'card',
    scrollTop: 0
  };
  let savedState = {};
  try { savedState = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}'); } catch {}
  const state = { ...defaultState, ...savedState };
  if (!['card', 'list'].includes(state.view)) state.view = 'card';
  if (!['recommended', 'code', 'stage', 'title'].includes(state.sort)) state.sort = 'recommended';
  if (!['全部项目', '优先验证', '可立项', '探索方案'].includes(state.portfolio)) state.portfolio = '全部项目';

  let panel;
  let selectedProject = null;
  let projectTriggerCode = null;
  let previousActive = [];
  let previousBreadcrumb = [];

  const el = (selector, root = document) => root.querySelector(selector);
  const all = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  const stageClass = stage => stage === '可立项' ? 'is-ready' : 'is-exploring';
  const inputHintByCategory = {
    '战略与组织': '业务目标、组织角色、现有运行机制与关键指标',
    '设计生产': '真实需求文档、设计资产、交付记录与质量问题',
    '增长与运营': '用户行为、核心漏斗、运营策略与实验指标',
    '风险与治理': '合规规则、高风险场景、历史问题与审计记录'
  };

  function persistState() {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  function compareCode(a, b) {
    return a.code.localeCompare(b.code, 'zh-CN', { numeric: true, sensitivity: 'base' });
  }

  function filteredProjects() {
    const q = state.query.trim().toLowerCase();
    const filtered = projects.filter(project => {
      const portfolioMatch = state.portfolio === '全部项目'
        || (state.portfolio === '优先验证' && Number.isFinite(project.priorityRank))
        || (state.portfolio === '可立项' && project.stage === '可立项')
        || (state.portfolio === '探索方案' && project.stage === '探索方案');
      return portfolioMatch
        && (state.category === '全部' || project.category === state.category)
        && (state.value === '全部目标' || project.value === state.value)
        && (state.stage === '全部阶段' || project.stage === state.stage)
        && (!q || `${project.code}${project.title}${project.description}${project.category}${project.value}${project.owner}`.toLowerCase().includes(q));
    });

    return filtered.sort((a, b) => {
      if (state.sort === 'code') return compareCode(a, b);
      if (state.sort === 'title') return a.title.localeCompare(b.title, 'zh-CN');
      if (state.sort === 'stage') {
        const stageWeight = { '可立项': 0, '探索方案': 1 };
        return (stageWeight[a.stage] ?? 9) - (stageWeight[b.stage] ?? 9) || compareCode(a, b);
      }
      const aRank = Number.isFinite(a.priorityRank) ? a.priorityRank : 999;
      const bRank = Number.isFinite(b.priorityRank) ? b.priorityRank : 999;
      const aStage = a.stage === '可立项' ? 0 : 1;
      const bStage = b.stage === '可立项' ? 0 : 1;
      return aRank - bRank || aStage - bStage || compareCode(a, b);
    });
  }

  function projectCard(project) {
    return `
      <button type="button" class="pp-project-card" data-project="${project.code}" aria-label="查看 ${escapeHtml(project.title)} 项目概览">
        <span class="pp-project-card__top">
          <span class="pp-project-code">${project.code}</span>
          <span class="pp-project-stage ${stageClass(project.stage)}">${project.stage}</span>
        </span>
        <span class="pp-project-card__title">${escapeHtml(project.title)}</span>
        <span class="pp-project-card__description">${escapeHtml(project.description)}</span>
        <span class="pp-project-card__meta">${escapeHtml(project.category)} · ${escapeHtml(project.value)}</span>
        <span class="pp-project-card__footer">
          <span class="pp-project-owner">建议牵头：${escapeHtml(project.owner)}</span>
          <span class="pp-project-card__action">查看概览${ICONS.chevron}</span>
        </span>
      </button>`;
  }

  function priorityCard(project) {
    return `
      <button type="button" class="pp-priority-card" data-project="${project.code}" aria-label="查看推荐项目 ${escapeHtml(project.title)} 的概览">
        <span class="pp-priority-card__top">
          <span class="pp-priority-card__rank">${String(project.priorityRank).padStart(2, '0')}</span>
          <span class="pp-project-stage ${stageClass(project.stage)}">${project.stage}</span>
        </span>
        <span class="pp-priority-card__code">${project.code} · ${escapeHtml(project.category)}</span>
        <span class="pp-priority-card__title">${escapeHtml(project.title)}</span>
        <span class="pp-priority-card__reason">${escapeHtml(project.priorityReason)}</span>
        <span class="pp-priority-card__metrics">
          <span><small>预期影响</small><strong>${escapeHtml(project.impact)}</strong></span>
          <span><small>实施难度</small><strong>${escapeHtml(project.effort)}</strong></span>
          <span><small>数据准备度</small><strong>${escapeHtml(project.readiness)}</strong></span>
        </span>
        <span class="pp-priority-card__next"><small>下一步</small>${escapeHtml(project.nextStep)}</span>
      </button>`;
  }

  function projectList(items) {
    return `
      <div class="pp-project-list" role="table" aria-label="AI 项目列表">
        <div class="pp-project-list__header" role="row">
          <span role="columnheader">项目</span><span role="columnheader">类别</span><span role="columnheader">价值目标</span><span role="columnheader">阶段</span><span role="columnheader">建议牵头</span><span aria-hidden="true"></span>
        </div>
        ${items.map(project => `
          <button type="button" class="pp-project-list__row" data-project="${project.code}" role="row" aria-label="查看 ${escapeHtml(project.title)} 项目概览">
            <span class="pp-project-list__project" role="cell"><small>${project.code}</small><strong>${escapeHtml(project.title)}</strong><em>${escapeHtml(project.description)}</em></span>
            <span role="cell" data-label="类别">${escapeHtml(project.category)}</span>
            <span role="cell" data-label="价值目标">${escapeHtml(project.value)}</span>
            <span role="cell" data-label="阶段"><span class="pp-project-stage ${stageClass(project.stage)}">${project.stage}</span></span>
            <span role="cell" data-label="建议牵头">${escapeHtml(project.owner)}</span>
            <span class="pp-project-list__arrow" aria-hidden="true">${ICONS.chevron}</span>
          </button>`).join('')}
      </div>`;
  }

  function overviewCards() {
    const readyCount = projects.filter(project => project.stage === '可立项').length;
    const exploreCount = projects.filter(project => project.stage === '探索方案').length;
    const items = [
      ['可立项', readyCount, '具备启动条件'],
      ['探索方案', exploreCount, '等待进一步评估'],
      ['优先验证', priorityProjects.length, '建议首批投入'],
      ['全部项目', projects.length, '完整项目组合']
    ];
    return items.map(([key, count, note]) => `
      <button type="button" class="pp-project-stat${state.portfolio === key ? ' is-active' : ''}" data-portfolio="${key}" aria-pressed="${state.portfolio === key}">
        <span class="pp-project-stat__top"><span class="pp-project-stat__label">${key}</span>${ICONS.chevron}</span>
        <span class="pp-project-stat__value">${count}</span>
        <span class="pp-project-stat__note">${note}</span>
      </button>`).join('');
  }

  function activeFilters() {
    const filters = [];
    if (state.query) filters.push(['query', `关键词：${state.query}`]);
    if (state.portfolio !== '全部项目') filters.push(['portfolio', state.portfolio]);
    if (state.category !== '全部') filters.push(['category', state.category]);
    if (state.value !== '全部目标') filters.push(['value', state.value]);
    if (state.stage !== '全部阶段') filters.push(['stage', state.stage]);
    if (!filters.length) return '';
    return `
      <div class="pp-project-active-filters" aria-label="已选筛选条件">
        <span class="pp-project-active-filters__label">已选</span>
        ${filters.map(([key, label]) => `<button type="button" class="pp-project-active-filter" data-remove-filter="${key}" aria-label="移除筛选条件 ${escapeHtml(label)}"><span>${escapeHtml(label)}</span><b aria-hidden="true">×</b></button>`).join('')}
        <button type="button" class="pp-project-filter-clear" data-clear-filters>清空全部</button>
      </div>`;
  }

  function modal(project) {
    const rationale = project.priorityReason || `该项目聚焦${project.category}，核心价值是${project.value}，适合通过真实业务场景完成小范围验证。`;
    const rationaleTitle = project.priorityReason ? '推荐理由' : '项目价值判断';
    return `
      <article class="pp-project-dialog" role="dialog" aria-modal="true" aria-labelledby="pp-project-dialog-title" aria-describedby="pp-project-dialog-description">
        <div class="pp-project-dialog__head">
          <div>
            <div class="pp-project-dialog__meta"><span>${project.code}</span><span class="pp-project-stage ${stageClass(project.stage)}">${project.stage}</span></div>
            <h2 class="pp-project-dialog__title" id="pp-project-dialog-title">${escapeHtml(project.title)}</h2>
          </div>
          <button type="button" class="pp-project-close" data-project-close aria-label="关闭项目概览">×</button>
        </div>
        <div class="pp-project-dialog__body">
          <p class="pp-project-dialog__description" id="pp-project-dialog-description">${escapeHtml(project.description)}</p>
          <div class="pp-project-detail-grid">
            <div class="pp-project-detail"><div class="pp-project-detail__label">所属领域</div><div class="pp-project-detail__value">${escapeHtml(project.category)}</div></div>
            <div class="pp-project-detail"><div class="pp-project-detail__label">预期价值</div><div class="pp-project-detail__value">${escapeHtml(project.value)}</div></div>
            <div class="pp-project-detail"><div class="pp-project-detail__label">建议牵头</div><div class="pp-project-detail__value">${escapeHtml(project.owner)}</div></div>
            <div class="pp-project-detail"><div class="pp-project-detail__label">启动所需输入</div><div class="pp-project-detail__value">${escapeHtml(inputHintByCategory[project.category] || '真实业务场景、基础数据与验收指标')}</div></div>
          </div>
          <div class="pp-project-dialog__section"><h3>${rationaleTitle}</h3><p>${escapeHtml(rationale)}</p></div>
          <div class="pp-project-dialog__section pp-project-dialog__section--next"><h3>下一验证节点</h3><p>${escapeHtml(project.nextStep || '选择一个真实项目进行小范围试点，并将验证结果沉淀为可复用资产。')}</p></div>
        </div>
        <div class="pp-project-dialog__footer">
          <button type="button" class="pp-projects-button" data-project-close>关闭</button>
          <button type="button" class="pp-project-detail-button" data-project-detail="${project.code}">查看项目详情${ICONS.arrow}</button>
        </div>
      </article>`;
  }

  function ensureNav() {
    const skill = all('aside nav button').find(button => button.textContent.trim() === 'AI Skill');
    if (!skill || el('[data-pp-project-nav]')) return;
    const projectNav = document.createElement('button');
    projectNav.type = 'button';
    projectNav.className = skill.className;
    projectNav.classList.remove('bg-accent', 'text-accent-foreground');
    projectNav.removeAttribute('aria-current');
    projectNav.dataset.ppProjectNav = '';
    projectNav.innerHTML = `${ICONS.flask}<span class="truncate">AI 项目库</span><span class="ml-auto rounded-full border px-1.5 py-0.5 text-[9px] text-muted-foreground">${projects.length}</span>`;
    skill.insertAdjacentElement('afterend', projectNav);
    projectNav.addEventListener('click', () => {
      if (window.location.hash !== '#ai-projects') window.location.hash = 'ai-projects';
      else showProjects();
    });
  }

  function markNav(active) {
    const nav = el('[data-pp-project-nav]');
    if (!nav) return;
    if (active) {
      previousActive = all('aside nav button').filter(button => button !== nav && button.classList.contains('bg-accent'));
      previousActive.forEach(button => button.classList.remove('bg-accent', 'text-accent-foreground'));
      nav.classList.add('bg-accent', 'text-accent-foreground');
      nav.setAttribute('aria-current', 'page');
    } else {
      nav.classList.remove('bg-accent', 'text-accent-foreground');
      nav.removeAttribute('aria-current');
      previousActive.forEach(button => button.classList.add('bg-accent', 'text-accent-foreground'));
      previousActive = [];
    }
  }

  function updateBreadcrumb(active) {
    const routeNames = ['工作台', '价值总览', '设计资产', 'AI Skill', 'AI 案例', '提交内容', '审核中心', '数据洞察', '管理中心'];
    const crumbs = all('header span').filter(element => routeNames.includes(element.textContent.trim()));
    if (active) {
      previousBreadcrumb = crumbs.map(element => [element, element.textContent]);
      crumbs.forEach(element => { element.textContent = 'AI 项目库'; });
    } else {
      previousBreadcrumb.forEach(([element, text]) => { if (element.isConnected) element.textContent = text; });
      previousBreadcrumb = [];
    }
  }

  function getMain() {
    return document.querySelector('#root main');
  }

  function syncPageState(active) {
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

  function buildPanel() {
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

  function navigateToProject(code) {
    const filename = detailFiles[code];
    if (!filename) return;
    state.scrollTop = window.scrollY;
    persistState();
    window.location.href = `./projects/${filename}?from=workspace`;
  }

  function openProject(code) {
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

  function closeProjectModal() {
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

  function closeProjects({ clearHash = false } = {}) {
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
    if (clearHash && window.location.hash === '#ai-projects') window.location.hash = '';
  }

  function clearFilters() {
    Object.assign(state, {
      query: '',
      category: '全部',
      value: '全部目标',
      stage: '全部阶段',
      portfolio: '全部项目'
    });
    state.scrollTop = window.scrollY;
    persistState();
    render();
  }

  function removeFilter(key) {
    const defaults = {
      query: '',
      category: '全部',
      value: '全部目标',
      stage: '全部阶段',
      portfolio: '全部项目'
    };
    if (Object.prototype.hasOwnProperty.call(defaults, key)) state[key] = defaults[key];
    state.scrollTop = window.scrollY;
    persistState();
    render();
  }

  function render() {
    const current = buildPanel();
    const previousScroll = state.scrollTop || 0;
    const filtered = filteredProjects();
    const categories = ['全部', '战略与组织', '设计生产', '增长与运营', '风险与治理'];
    const gridContent = filtered.length
      ? (state.view === 'list' ? projectList(filtered) : `<section class="pp-project-grid" id="pp-project-grid">${filtered.map(projectCard).join('')}</section>`)
      : '<div class="pp-project-empty"><p>没有找到匹配项目，请调整关键词或筛选条件。</p><button type="button" class="pp-projects-button" data-clear-filters>恢复全部项目</button></div>';

    current.innerHTML = `
      <div class="pp-projects-inner">
        <header class="pp-projects-head">
          <div>
            <p class="pp-projects-eyebrow">AI Portfolio Governance</p>
            <h1 class="pp-projects-title" id="pp-projects-title">AI 项目库</h1>
            <p class="pp-projects-subtitle">从 33 个项目方向中识别优先投入机会，判断成熟度、牵头团队与下一验证节点。</p>
          </div>
          <div class="pp-projects-actions"><button type="button" class="pp-projects-button" data-roadmap>查看 90 天路线${ICONS.arrow}</button></div>
        </header>

        <section class="pp-project-stats" aria-label="项目组合概览">${overviewCards()}</section>

        <section class="pp-project-section pp-project-section--priority">
          <div class="pp-project-section__head">
            <div><p class="pp-project-section__eyebrow">Decision Focus</p><h2 class="pp-project-section__title">建议优先验证</h2><p class="pp-project-section__desc">综合业务影响、实施难度与数据准备度，建议作为第一批试点。</p></div>
            <span class="pp-project-count">${priorityProjects.length} 个建议项目</span>
          </div>
          <div class="pp-project-priority">${priorityProjects.map(priorityCard).join('')}</div>
        </section>

        <section class="pp-project-section pp-project-section--all">
          <div class="pp-project-section__head pp-project-section__head--compact">
            <div><p class="pp-project-section__eyebrow">Portfolio</p><h2 class="pp-project-section__title">全部项目</h2><p class="pp-project-section__desc">按项目成熟度、价值目标与领域快速筛选和比较。</p></div>
          </div>
          <div class="pp-project-toolbar">
            <label class="pp-project-field pp-project-field--search"><span>搜索</span><div class="pp-project-search">${ICONS.search}<input id="pp-project-query" class="pp-project-input" placeholder="项目名称、编号或关键词" aria-label="搜索 AI 项目" /></div></label>
            <label class="pp-project-field"><span>价值目标</span><select id="pp-project-value" class="pp-project-select">${['全部目标', '提升效率', '提升增长', '提升质量', '降低风险', '提升组织能力'].map(value => `<option${state.value === value ? ' selected' : ''}>${value}</option>`).join('')}</select></label>
            <label class="pp-project-field"><span>项目阶段</span><select id="pp-project-stage" class="pp-project-select">${['全部阶段', '探索方案', '可立项'].map(stage => `<option${state.stage === stage ? ' selected' : ''}>${stage}</option>`).join('')}</select></label>
            <label class="pp-project-field"><span>排序方式</span><select id="pp-project-sort" class="pp-project-select"><option value="recommended"${state.sort === 'recommended' ? ' selected' : ''}>推荐优先</option><option value="code"${state.sort === 'code' ? ' selected' : ''}>项目编号</option><option value="stage"${state.sort === 'stage' ? ' selected' : ''}>项目阶段</option><option value="title"${state.sort === 'title' ? ' selected' : ''}>项目名称</option></select></label>
            <div class="pp-project-view" role="group" aria-label="项目查看方式"><span>视图</span><div><button type="button" data-view="card" aria-pressed="${state.view === 'card'}" class="${state.view === 'card' ? 'is-active' : ''}" aria-label="卡片视图">${ICONS.grid}</button><button type="button" data-view="list" aria-pressed="${state.view === 'list'}" class="${state.view === 'list' ? 'is-active' : ''}" aria-label="列表视图">${ICONS.list}</button></div></div>
          </div>
          <div class="pp-project-category-row"><span>项目领域</span><div class="pp-project-filters">${categories.map(category => `<button type="button" class="pp-project-filter-chip${state.category === category ? ' is-active' : ''}" data-category="${category}" aria-pressed="${state.category === category}">${category}</button>`).join('')}</div></div>
          ${activeFilters()}
          <div class="pp-project-list-meta"><span>共 <strong>${filtered.length}</strong> 个项目</span><span>点击项目查看概览</span></div>
          ${gridContent}
        </section>
      </div>
      <div class="pp-project-modal"${selectedProject ? '' : ' hidden'}>${selectedProject ? modal(selectedProject) : ''}</div>`;

    const query = el('#pp-project-query', current);
    query.value = state.query;
    query.addEventListener('input', event => {
      state.query = event.target.value;
      state.scrollTop = window.scrollY;
      persistState();
      render();
      const refreshed = el('#pp-project-query', buildPanel());
      if (refreshed) {
        refreshed.focus();
        refreshed.setSelectionRange(state.query.length, state.query.length);
      }
    });

    el('#pp-project-value', current)?.addEventListener('change', event => {
      state.value = event.target.value;
      state.scrollTop = window.scrollY;
      persistState();
      render();
    });
    el('#pp-project-stage', current)?.addEventListener('change', event => {
      state.stage = event.target.value;
      state.portfolio = '全部项目';
      state.scrollTop = window.scrollY;
      persistState();
      render();
    });
    el('#pp-project-sort', current)?.addEventListener('change', event => {
      state.sort = event.target.value;
      state.scrollTop = window.scrollY;
      persistState();
      render();
    });

    all('[data-category]', current).forEach(button => button.addEventListener('click', () => {
      state.category = button.dataset.category;
      state.scrollTop = window.scrollY;
      persistState();
      render();
    }));
    all('[data-portfolio]', current).forEach(button => button.addEventListener('click', () => {
      state.portfolio = state.portfolio === button.dataset.portfolio ? '全部项目' : button.dataset.portfolio;
      state.stage = '全部阶段';
      state.scrollTop = window.scrollY;
      persistState();
      render();
    }));
    all('[data-view]', current).forEach(button => button.addEventListener('click', () => {
      state.view = button.dataset.view;
      state.scrollTop = window.scrollY;
      persistState();
      render();
    }));
    all('[data-remove-filter]', current).forEach(button => button.addEventListener('click', () => removeFilter(button.dataset.removeFilter)));
    all('[data-clear-filters]', current).forEach(button => button.addEventListener('click', clearFilters));
    all('[data-project]', current).forEach(button => button.addEventListener('click', () => openProject(button.dataset.project)));
    el('[data-roadmap]', current)?.addEventListener('click', () => navigateToProject('S05'));
    el('[data-project-detail]', current)?.addEventListener('click', buttonEvent => navigateToProject(buttonEvent.currentTarget.dataset.projectDetail));
    all('[data-project-close]', current).forEach(button => button.addEventListener('click', closeProjectModal));

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

  function showProjects() {
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
  observer.observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
  ensureNav();
  window.setTimeout(ensureNav, 500);
  if (window.location.hash === '#ai-projects') window.setTimeout(showProjects, 0);
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#ai-projects') showProjects();
    else closeProjects();
  });
})();
