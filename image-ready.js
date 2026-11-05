(() => {
  'use strict';

  const root = document.documentElement;
  const style = document.createElement('style');
  style.textContent = `
    html.images-loading { background: #0b1321; overflow: hidden; }
    html.images-loading body { pointer-events: none; }
    html.images-loading::after,
    html.images-revealing::after {
      content: '';
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      background: #0b13214d;
      -webkit-backdrop-filter: blur(18px);
      backdrop-filter: blur(18px);
      transition: backdrop-filter 800ms ease, -webkit-backdrop-filter 800ms ease,
        background-color 800ms ease;
      pointer-events: none;
    }
    html.images-revealing::after {
      background: transparent;
      -webkit-backdrop-filter: blur(0);
      backdrop-filter: blur(0);
    }
    @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
      html.images-loading body,
      html.images-revealing body { transition: filter 800ms ease; }
      html.images-loading body { filter: blur(18px); }
      html.images-revealing body { filter: blur(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      html.images-loading::after,
      html.images-revealing::after,
      html.images-loading body,
      html.images-revealing body { transition: none; }
    }
  `;
  document.head.append(style);
  root.classList.add('images-loading');

  let resolveReady;
  let revealed = false;
  let cleanupTimer;
  window.carspotImagesReady = new Promise(resolve => { resolveReady = resolve; });

  function cleanup() {
    window.clearTimeout(cleanupTimer);
    root.classList.remove('images-revealing');
    style.remove();
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    window.clearTimeout(timeout);
    root.classList.add('images-revealing');
    root.classList.remove('images-loading');
    resolveReady();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cleanup();
    } else {
      // Keep the transition styles until the blur has finished fading out.
      cleanupTimer = window.setTimeout(cleanup, 900);
    }
  }

  // A failed or stalled request must never leave the website blurred.
  const timeout = window.setTimeout(reveal, 12000);

  async function decode(image) {
    image.loading = 'eager';
    if (typeof image.decode === 'function') {
      try { await image.decode(); } catch (_) { /* Reveal even if an image fails. */ }
      return;
    }
    if (image.complete) return;
    await new Promise(resolve => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  }

  async function prepare() {
    const images = [...document.images];
    // Include CSS backgrounds and select the same responsive source as <picture>.
    for (const link of document.querySelectorAll('link[rel="preload"][as="image"]')) {
      if (link.media && !window.matchMedia(link.media).matches) continue;
      const image = new Image();
      if (link.imageSrcset) image.srcset = link.imageSrcset;
      if (link.imageSizes) image.sizes = link.imageSizes;
      image.src = link.href;
      images.push(image);
    }
    await Promise.allSettled([
      ...images.map(decode),
      window.carspotHeroImagesReady,
    ]);
    reveal();
  }

  document.addEventListener('DOMContentLoaded', prepare, { once: true });
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      reveal();
      cleanup();
    }
  });
})();
