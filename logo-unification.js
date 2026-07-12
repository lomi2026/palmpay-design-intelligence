(() => {
  const LOGO_SRC = 'data:image/png;base64,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';
  let applying = false;
  const isProjectDetailPage = Boolean(document.querySelector('script[src$="project-detail-nav.js"]'));

  const applyUnifiedLogo = () => {
    if (applying) return;
    applying = true;
    try {
      document.querySelectorAll('.brand-mark, .logo, .pp-platform-logo').forEach((mark) => {
        const isProjectNumberBadge =
          isProjectDetailPage &&
          mark.classList.contains('brand-mark') &&
          mark.closest('.topbar');
        if (isProjectNumberBadge) return;

        mark.classList.add('pp-unified-nav-logo');
        let image = mark.querySelector('img');
        if (!image) {
          image = document.createElement('img');
          mark.replaceChildren(image);
        }
        if (image.getAttribute('src') !== LOGO_SRC) image.src = LOGO_SRC;
        image.alt = 'PalmPay Design';
        image.decoding = 'async';
        image.draggable = false;
        image.addEventListener('error', () => {
          if (image.src !== LOGO_SRC) image.src = LOGO_SRC;
        }, { once: true });
      });
    } finally {
      applying = false;
    }
  };

  applyUnifiedLogo();
  const root = document.getElementById('root') || document.body;
  if (root) new MutationObserver(applyUnifiedLogo).observe(root, { childList: true, subtree: true });
  window.setTimeout(applyUnifiedLogo, 0);
})();
