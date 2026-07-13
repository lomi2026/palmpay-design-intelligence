(() => {
  // Phase 2 owns the AI project library. This compatibility bridge intentionally
  // keeps only the shared project data exposed for homepage search and legacy links.
  const source = Array.isArray(window.PP_PROJECTS_DATA) ? window.PP_PROJECTS_DATA : [];
  window.PP_PROJECTS = source.map(project => ({ ...project }));
  window.PP_AI_PROJECTS_RUNTIME = 'phase2-react';
})();
