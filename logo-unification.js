(() => {
  const logoPath = window.location.pathname.includes('/projects/') ? '../导航logo.png' : './导航logo.png';
  const applyUnifiedLogo = () => {
    document.querySelectorAll('.brand-mark, .logo, .pp-platform-logo').forEach(mark => {
      mark.classList.add('pp-unified-nav-logo');
      const image = mark.querySelector('img');
      if (!image) return;
      if (!image.getAttribute('src')?.endsWith('导航logo.png')) image.src = logoPath;
      image.alt = 'PalmPay Design';
    });
  };
  applyUnifiedLogo();
  const root = document.getElementById('root') || document.body;
  new MutationObserver(applyUnifiedLogo).observe(root, {childList:true, subtree:true});
  window.setTimeout(applyUnifiedLogo, 0);
})();
