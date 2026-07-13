(() => {
  const THEME_KEY = 'pp-theme';
  const back = document.querySelector('.workspace-back');
  const themeButton = document.getElementById('themeBtn');
  const resetButton = document.getElementById('resetBtn');

  const readTheme = () => {
    const raw = localStorage.getItem(THEME_KEY);
    if (!raw) return 'dark';
    try {
      const parsed = JSON.parse(raw);
      return parsed === 'light' || parsed === 'dark' ? parsed : 'dark';
    } catch (_) {
      return raw === 'light' || raw === 'dark' ? raw : 'dark';
    }
  };

  const applyTheme = (theme, persist = true) => {
    const next = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    if (themeButton) {
      themeButton.textContent = next === 'light' ? '切换至暗色模式' : '切换至亮色模式';
      themeButton.setAttribute('aria-label', themeButton.textContent);
      themeButton.setAttribute('title', themeButton.textContent);
    }
    if (persist) localStorage.setItem(THEME_KEY, JSON.stringify(next));
  };

  applyTheme(readTheme(), false);

  if (themeButton) {
    themeButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'light' ? 'dark' : 'light');
    }, true);
  }

  window.addEventListener('storage', (event) => {
    if (event.key === THEME_KEY) applyTheme(readTheme(), false);
  });

  if (resetButton) {
    resetButton.textContent = '重置填写内容';
    resetButton.setAttribute('aria-label', '重置填写内容');
    resetButton.setAttribute('title', '重置填写内容');
  }

  const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  document.querySelectorAll('table tbody tr').forEach((row, rowIndex) => {
    const firstCell = row.querySelector('th,td');
    const rowName = cleanText(firstCell?.textContent) || `第 ${rowIndex + 1} 行`;
    row.querySelectorAll('input,select,textarea').forEach((control, controlIndex) => {
      if (control.hasAttribute('aria-label') || control.hasAttribute('aria-labelledby')) return;
      let field = '';
      if (control.classList.contains('current')) field = '当前值';
      else if (control.classList.contains('target')) field = '目标值';
      else if (control.classList.contains('owner')) field = '负责人';
      else field = cleanText(control.getAttribute('placeholder')) || `字段 ${controlIndex + 1}`;
      control.setAttribute('aria-label', `${rowName}－${field}`);
    });
  });

  document.querySelectorAll('input[type="checkbox"]').forEach((control, index) => {
    if (control.hasAttribute('aria-label') || control.hasAttribute('aria-labelledby')) return;
    const container = control.closest('label,.check-item,.checklist-item,li,div');
    const label = cleanText(container?.textContent) || `检查项 ${index + 1}`;
    control.setAttribute('aria-label', label);
  });

  document.querySelectorAll('textarea').forEach((control, index) => {
    if (control.hasAttribute('aria-label') || control.hasAttribute('aria-labelledby')) return;
    const id = control.id;
    const explicit = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
    const nearby = control.closest('.form-card,.panel,.card,.section-card,section,div');
    const heading = nearby?.querySelector('h2,h3,h4,label,.label');
    const label = cleanText(explicit?.textContent || heading?.textContent || control.placeholder) || `补充说明 ${index + 1}`;
    control.setAttribute('aria-label', label);
  });

  document.querySelectorAll('input:not([type="hidden"]),select,textarea').forEach((control, index) => {
    if (control.hasAttribute('aria-label') || control.hasAttribute('aria-labelledby')) return;
    if (control.closest('label')) return;
    const id = control.id;
    const explicit = id && window.CSS?.escape ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
    if (explicit) return;
    const nearby = control.closest('.field,.form-card,.panel,.card,.section-card,section,div');
    const heading = nearby?.querySelector('label,.label,h3,h4,strong');
    const typeLabel = control.tagName === 'SELECT' ? '选择项' : control.type === 'number' ? '数值' : '输入内容';
    const label = cleanText(control.getAttribute('placeholder') || heading?.textContent) || `${typeLabel} ${index + 1}`;
    control.setAttribute('aria-label', label);
  });

  if (back) {
    const source = new URLSearchParams(window.location.search).get('from');
    const label = back.querySelector('span');
    if (source === 'home') {
      back.href = '../index.html#projects';
      back.setAttribute('aria-label', '返回首页');
      back.setAttribute('title', '返回首页');
      if (label) label.textContent = '返回首页';
    } else {
      back.href = '../workspace.html#ai-projects';
      back.setAttribute('aria-label', '返回项目库');
      back.setAttribute('title', '返回项目库');
      if (label) label.textContent = '返回项目库';
    }
  }


  // Shared reading navigation, progress, and mobile header treatment.
  document.body.classList.add('pp-detail-enhanced');
  const style = document.createElement('style');
  style.id = 'pp-detail-enhancement-styles';
  style.textContent = `
    .pp-reading-progress{position:fixed;z-index:10080;top:0;left:0;width:100%;height:2px;pointer-events:none;background:transparent}
    .pp-reading-progress__bar{display:block;width:0;height:100%;background:currentColor;transition:width .1s linear}
    .pp-detail-toc-trigger{position:fixed;z-index:10040;right:22px;bottom:22px;display:inline-flex;align-items:center;gap:8px;min-height:42px;padding:0 14px;border:1px solid var(--line);border-radius:999px;background:color-mix(in srgb,var(--panel) 92%,transparent);color:var(--text);box-shadow:0 14px 38px rgba(0,0,0,.22);backdrop-filter:blur(16px);font:700 12px/1 inherit;cursor:pointer}
    .pp-detail-toc-trigger svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round}
    .pp-detail-toc-overlay{position:fixed;z-index:10050;inset:0;background:rgba(0,0,0,.52);backdrop-filter:blur(8px);opacity:0;pointer-events:none;transition:opacity .18s ease}
    .pp-detail-toc-overlay.is-open{opacity:1;pointer-events:auto}
    .pp-detail-toc-panel{position:fixed;z-index:10060;top:16px;right:16px;bottom:16px;width:min(340px,calc(100vw - 32px));display:flex;flex-direction:column;border:1px solid var(--line);border-radius:20px;background:var(--panel);color:var(--text);box-shadow:0 28px 90px rgba(0,0,0,.38);transform:translateX(calc(100% + 28px));transition:transform .22s ease}
    .pp-detail-toc-panel.is-open{transform:translateX(0)}
    .pp-detail-toc-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:20px;border-bottom:1px solid var(--line)}
    .pp-detail-toc-kicker{margin:0 0 5px;color:var(--muted);font-size:10px;font-weight:750;letter-spacing:.16em;text-transform:uppercase}
    .pp-detail-toc-title{margin:0;font-size:18px;line-height:1.3}
    .pp-detail-toc-close{display:grid;width:34px;height:34px;place-items:center;border:1px solid var(--line);border-radius:10px;background:transparent;color:inherit;font-size:20px;cursor:pointer}
    .pp-detail-toc-list{display:flex;flex:1;flex-direction:column;gap:5px;overflow:auto;padding:12px}
    .pp-detail-toc-link{display:grid;grid-template-columns:28px 1fr;gap:9px;align-items:start;width:100%;border:0;border-radius:10px;background:transparent;color:var(--muted);padding:10px;text-align:left;font:600 12px/1.45 inherit;cursor:pointer}
    .pp-detail-toc-link:hover{background:var(--panel-2);color:var(--text)}
    .pp-detail-toc-link.is-active{background:var(--strong);color:var(--bg)}
    .pp-detail-toc-index{font-size:10px;letter-spacing:.08em;opacity:.72}
    .pp-detail-toc-foot{border-top:1px solid var(--line);padding:14px 20px;color:var(--muted);font-size:11px}
    .pp-project-summary{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;margin:14px 0 0;overflow:hidden;border:1px solid var(--line);border-radius:14px;background:var(--line)}
    .pp-project-summary__item{min-width:0;background:var(--panel);padding:11px 13px}
    .pp-project-summary__label{display:block;margin-bottom:4px;color:var(--muted);font-size:10px;font-weight:750;letter-spacing:.12em;text-transform:uppercase}
    .pp-project-summary__value{display:block;overflow:hidden;color:var(--text);font-size:11px;font-weight:650;line-height:1.4;text-overflow:ellipsis;white-space:nowrap}
    .pp-detail-enhanced .topbar .actions .btn{box-sizing:border-box;height:40px;min-height:40px;border-radius:10px;padding:0 14px;display:inline-flex;align-items:center;justify-content:center}
    .pp-detail-enhanced main h2[id]{scroll-margin-top:110px}
    @media(max-width:640px){
      .pp-detail-enhanced .topbar{display:grid!important;grid-template-columns:auto 1fr;align-items:center!important;gap:10px 12px;padding:12px!important}
      .pp-detail-enhanced .topbar .brand{display:contents!important}
      .pp-detail-enhanced .topbar .brand-mark{grid-column:1;grid-row:1}
      .pp-detail-enhanced .topbar .brand>div:not(.brand-mark){grid-column:1/-1;grid-row:2;min-width:0;padding-top:2px}
      .pp-detail-enhanced .topbar .brand-title{white-space:normal!important;overflow:visible!important;text-overflow:clip!important;font-size:14px;line-height:1.35}
      .pp-detail-enhanced .topbar .brand-sub{display:block!important;margin-top:3px;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .pp-detail-enhanced .topbar .actions{grid-column:2;grid-row:1;display:flex!important;justify-content:flex-end!important;min-width:0}
      .pp-detail-enhanced .topbar .actions .btn:not(.primary){display:none!important}
      .pp-detail-enhanced .workspace-back{max-width:150px;height:40px;min-height:40px;padding:0 10px!important;font-size:12px;overflow:hidden}
      .pp-detail-enhanced .workspace-back span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .pp-detail-toc-trigger{right:12px;bottom:12px;min-height:40px;padding:0 12px}
      .pp-detail-toc-panel{top:8px;right:8px;bottom:8px;width:calc(100vw - 16px);border-radius:18px}
      .pp-project-summary{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:10px}
      .pp-project-summary__item:last-child{grid-column:1/-1}
      .pp-detail-enhanced main h2[id]{scroll-margin-top:130px}
    }
    @media print{.pp-reading-progress,.pp-detail-toc-trigger,.pp-detail-toc-overlay,.pp-detail-toc-panel{display:none!important}}
  `;
  document.head.appendChild(style);


  const currentFile = decodeURIComponent(window.location.pathname.split('/').pop() || '');
  const projectId = window.__PP_PROJECT_ID__ || new URLSearchParams(window.location.search).get('id');
  const projectMeta = (window.PP_PROJECTS_DATA || []).find(project => project.code === projectId || project.file === currentFile);
  const topbar = document.querySelector('.topbar');
  if(projectMeta && topbar && !document.querySelector('.pp-project-summary')){
    const summary = document.createElement('section');
    summary.className = 'pp-project-summary';
    summary.setAttribute('aria-label','项目概览');
    const fields = [
      ['项目编号',projectMeta.code],
      ['项目类别',projectMeta.category],
      ['当前阶段',projectMeta.stage],
      ['价值目标',projectMeta.value],
      ['建议牵头',projectMeta.owner]
    ];
    summary.innerHTML = fields.map(([label,value])=>`<div class="pp-project-summary__item"><span class="pp-project-summary__label">${label}</span><strong class="pp-project-summary__value" title="${value}">${value}</strong></div>`).join('');
    topbar.insertAdjacentElement('afterend',summary);
  }

  const progress = document.createElement('div');
  progress.className = 'pp-reading-progress';
  progress.setAttribute('aria-hidden','true');
  progress.innerHTML = '<span class="pp-reading-progress__bar"></span>';
  document.body.appendChild(progress);
  const progressBar = progress.firstElementChild;
  const updateProgress = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const value = Math.min(1, Math.max(0, window.scrollY / max));
    progressBar.style.width = `${value * 100}%`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, {passive:true});
  window.addEventListener('resize', updateProgress);

  const headings = Array.from(document.querySelectorAll('main h2')).filter(heading => cleanText(heading.textContent));
  headings.forEach((heading,index) => {
    if(!heading.id) heading.id = `chapter-${index + 1}`;
  });

  if(headings.length){
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'pp-detail-toc-trigger';
    trigger.setAttribute('aria-haspopup','dialog');
    trigger.setAttribute('aria-expanded','false');
    trigger.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h10"/></svg><span>目录</span><small>1 / '+headings.length+'</small>';
    document.body.appendChild(trigger);

    const overlay = document.createElement('div');
    overlay.className = 'pp-detail-toc-overlay';
    overlay.hidden = true;
    document.body.appendChild(overlay);

    const panel = document.createElement('aside');
    panel.className = 'pp-detail-toc-panel';
    panel.hidden = true;
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');
    panel.setAttribute('aria-labelledby','pp-detail-toc-title');
    panel.innerHTML = `
      <div class="pp-detail-toc-head"><div><p class="pp-detail-toc-kicker">Page outline</p><h2 class="pp-detail-toc-title" id="pp-detail-toc-title">内容目录</h2></div><button type="button" class="pp-detail-toc-close" aria-label="关闭目录">×</button></div>
      <nav class="pp-detail-toc-list" aria-label="页面章节">${headings.map((heading,index)=>`<button type="button" class="pp-detail-toc-link" data-heading="${heading.id}"><span class="pp-detail-toc-index">${String(index+1).padStart(2,'0')}</span><span>${cleanText(heading.textContent)}</span></button>`).join('')}</nav>
      <div class="pp-detail-toc-foot">点击章节快速定位，返回时保留当前填写内容。</div>`;
    document.body.appendChild(panel);

    const shell = document.querySelector('.shell');
    const closeButton = panel.querySelector('.pp-detail-toc-close');
    const links = Array.from(panel.querySelectorAll('.pp-detail-toc-link'));
    let previousFocus = null;
    let closeDelay = null;
    const focusables = () => [closeButton,...links];
    const openToc = () => {
      clearTimeout(closeDelay);
      previousFocus = document.activeElement;
      overlay.hidden = false;
      panel.hidden = false;
      shell && (shell.inert = true);
      requestAnimationFrame(()=>{overlay.classList.add('is-open');panel.classList.add('is-open');});
      trigger.setAttribute('aria-expanded','true');
      setTimeout(()=>closeButton.focus({preventScroll:true}),60);
    };
    const closeToc = () => {
      panel.classList.remove('is-open');
      overlay.classList.remove('is-open');
      shell && (shell.inert = false);
      trigger.setAttribute('aria-expanded','false');
      closeDelay=setTimeout(()=>{overlay.hidden=true;panel.hidden=true;},220);
      previousFocus?.isConnected && previousFocus.focus({preventScroll:true});
    };
    trigger.addEventListener('click',openToc);
    overlay.addEventListener('click',closeToc);
    closeButton.addEventListener('click',closeToc);
    panel.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();closeToc();return;}
      if(event.key==='Tab'){
        const items=focusables();
        const first=items[0],last=items[items.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      }
    });
    links.forEach(link=>link.addEventListener('click',()=>{
      const heading=document.getElementById(link.dataset.heading);
      closeToc();
      setTimeout(()=>heading?.scrollIntoView({behavior:'smooth',block:'start'}),40);
    }));

    const setActive = index => {
      links.forEach((link,i)=>link.classList.toggle('is-active',i===index));
      const small=trigger.querySelector('small');
      if(small) small.textContent=`${index+1} / ${headings.length}`;
    };
    setActive(0);
    const observer = new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
      if(!visible.length) return;
      const index=headings.indexOf(visible[0].target);
      if(index>=0) setActive(index);
    },{rootMargin:'-18% 0px -68% 0px',threshold:[0,1]});
    headings.forEach(heading=>observer.observe(heading));
  }

})();
