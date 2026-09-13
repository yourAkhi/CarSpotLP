(() => {
  const toggle = document.querySelector('[data-menu-toggle]');
  const drawer = document.querySelector('[data-menu-drawer]');
  const backdrop = document.querySelector('[data-menu-backdrop]');
  const closeButton = document.querySelector('[data-menu-close]');
  const links = document.querySelectorAll('[data-menu-link]');

  if (!toggle || !drawer || !backdrop || !closeButton) return;

  let lastFocused = null;

  const openMenu = () => {
    lastFocused = document.activeElement;
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      document.documentElement.classList.add('menu-open');
      toggle.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      closeButton.focus({ preventScroll: true });
    });
  };

  const closeMenu = ({ restoreFocus = true } = {}) => {
    document.documentElement.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');

    window.setTimeout(() => {
      backdrop.hidden = true;
    }, 260);

    if (restoreFocus && lastFocused instanceof HTMLElement) {
      lastFocused.focus({ preventScroll: true });
    }
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  closeButton.addEventListener('click', () => closeMenu());
  backdrop.addEventListener('click', () => closeMenu());

  links.forEach((link) => {
    link.addEventListener('click', () => closeMenu({ restoreFocus: false }));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.documentElement.classList.contains('menu-open')) {
      closeMenu();
    }
  });
})();
