(() => {
  'use strict';

  const hero = document.querySelector('.home-hero--slideshow');
  if (!hero) return;
  const layers = [...hero.querySelectorAll('.hero-background__layer')];
  if (layers.length !== 2) return;

  const desktop = window.matchMedia('(min-width: 701px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const base = 'assets/hero/';
  // Each scene has an independently composed portrait and landscape image.
  const scenes = [
    ['alpine', '06', '50% 0%'],
    ['coast', '01', '65% 0%'],
    ['urban', '03', '40% 0%'],
    ['skyline', '02', '78% 0%'],
    ['bridge', '04', '50% 0%'],
    ['forest', '05', '65% 0%'],
    ['industrial', '07', '50% 0%'],
    ['harbor', '08', '55% 0%'],
    ['winter', '09', '70% 0%']
  ].map(([name, portrait, focus]) => ({
    desktop: `desktop-${name}.avif`,
    mobile: `mobile-${portrait}.avif`,
    focus,
  }));
  const imageUrl = scene => `${base}${desktop.matches ? scene.desktop : scene.mobile}`;
  let currentScene = scenes[0];
  let activeLayer = 0;
  let order = [];
  let timer;
  let generation = 0;
  let inView = true;
  const pending = new Map();

  function shuffle() {
    order = scenes.filter(scene => scene !== currentScene);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  }

  function preload(url) {
    if (pending.has(url)) return pending.get(url);
    const request = new Promise(resolve => {
      const image = new Image();
      const timeout = window.setTimeout(() => finish(false), 12000);
      let finished = false;
      function finish(success) {
        if (finished) return;
        finished = true;
        window.clearTimeout(timeout);
        image.onload = image.onerror = null;
        resolve(success);
      }
      image.onload = async () => {
        try { await image.decode(); } catch (_) { /* onload already succeeded */ }
        finish(true);
      };
      image.onerror = () => finish(false);
      image.src = url;
    });
    pending.set(url, request);
    request.then(success => { if (!success) pending.delete(url); });
    return request;
  }

  function setLayer(layer, scene) {
    // The browser selects the matching format, including during resizing.
    layer.querySelector('source').srcset = `${base}${scene.desktop}`;
    layer.querySelector('img').src = `${base}${scene.mobile}`;
    layer.style.setProperty('--hero-mobile-focus', scene.focus);
  }

  function canPlay() {
    return !reducedMotion.matches && !document.hidden && inView;
  }

  function stop() {
    generation++;
    window.clearTimeout(timer);
  }

  function queue() {
    window.clearTimeout(timer);
    if (!canPlay()) return;
    if (!order.length) shuffle();
    void preload(imageUrl(order[0]));
    const token = generation;
    timer = window.setTimeout(async () => {
      const scene = order.shift();
      const loaded = await preload(imageUrl(scene));
      if (token !== generation || !canPlay()) return;
      if (loaded) {
        const next = 1 - activeLayer;
        setLayer(layers[next], scene);
        try { await layers[next].querySelector('img').decode(); } catch (_) { queue(); return; }
        if (token !== generation || !canPlay()) return;
        layers[next].classList.add('is-active');
        layers[activeLayer].classList.remove('is-active');
        activeLayer = next;
        currentScene = scene;
      }
      queue();
    }, 3500);
  }

  function updatePlayback() {
    stop();
    queue();
  }

  document.addEventListener('visibilitychange', updatePlayback);
  reducedMotion.addEventListener('change', updatePlayback);
  desktop.addEventListener('change', updatePlayback);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      updatePlayback();
    });
    observer.observe(hero);
  }
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', updatePlayback);
  updatePlayback();
})();
