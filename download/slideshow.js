(() => {
  'use strict';

  const preview = document.querySelector('[data-preview-slideshow]');
  if (!preview) return;
  const layers = [...preview.querySelectorAll('.landscape')];
  if (layers.length !== 2) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Reuse the nine separately composed landscape/portrait pairs from the home page.
  // Each focus keeps the location visible around the phone in this smaller card.
  const scenes = [
    ['alpine', '06', '54% 47%', '50% 38%'],
    ['coast', '01', '68% 50%', '65% 38%'],
    ['urban', '03', '60% 52%', '40% 42%'],
    ['skyline', '02', '72% 48%', '78% 38%'],
    ['bridge', '04', '60% 48%', '50% 38%'],
    ['forest', '05', '62% 50%', '65% 40%'],
    ['industrial', '07', '62% 52%', '50% 42%'],
    ['harbor', '08', '62% 50%', '55% 40%'],
    ['winter', '09', '64% 50%', '70% 40%'],
  ].map(([name, portrait, wideFocus, tallFocus]) => ({
    wide: `/assets/hero/desktop-${name}.avif`,
    tall: `/assets/hero/mobile-${portrait}.avif`,
    wideFocus,
    tallFocus,
  }));

  let currentScene = scenes[0];
  let activeLayer = 0;
  let wide = preview.clientWidth >= preview.clientHeight;
  let order = [];
  let timer;
  let generation = 0;
  let ready = false;
  let inView = true;
  let suspended = false;

  const canPlay = () => ready && !reducedMotion.matches && !document.hidden && inView && !suspended;
  const urlFor = scene => wide ? scene.wide : scene.tall;

  function shuffle() {
    order = scenes.filter(scene => scene !== currentScene);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  }

  // Load only the next scene, rather than downloading the whole gallery on mobile.
  function prepare(scene) {
    const image = new Image();
    image.fetchPriority = 'low';
    image.src = urlFor(scene);
    return image.decode();
  }

  function setLayer(layer, scene) {
    layer.querySelector('source').media = wide ? 'all' : 'not all';
    layer.querySelector('source').srcset = scene.wide;
    layer.querySelector('img').src = scene.tall;
    layer.style.setProperty('--preview-focus', wide ? scene.wideFocus : scene.tallFocus);
  }

  function stop() {
    generation++;
    window.clearTimeout(timer);
  }

  function queue() {
    if (!canPlay()) return;
    if (!order.length) shuffle();
    const scene = order[0];
    // Convert load errors to a value immediately, avoiding unhandled rejections.
    const loaded = prepare(scene).then(() => true, () => false);
    const token = generation;
    timer = window.setTimeout(async () => {
      const success = await loaded;
      if (token !== generation || !canPlay()) return;
      order.shift();
      if (success) {
        const next = 1 - activeLayer;
        setLayer(layers[next], scene);
        try { await layers[next].querySelector('img').decode(); }
        catch (_) { queue(); return; }
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

  function fitPreview() {
    const nextWide = preview.clientWidth >= preview.clientHeight;
    if (nextWide === wide) return;
    wide = nextWide;
    stop();
    // Keep both layers in the same format if the card changes shape on rotation.
    layers.forEach(layer => setLayer(layer, currentScene));
    queue();
  }

  layers.forEach(layer => setLayer(layer, currentScene));
  Promise.resolve(window.carspotImagesReady).then(() => {
    ready = true;
    updatePlayback();
  });
  document.addEventListener('visibilitychange', updatePlayback);
  reducedMotion.addEventListener('change', updatePlayback);
  if ('ResizeObserver' in window) new ResizeObserver(fitPreview).observe(preview);
  else window.addEventListener('resize', fitPreview);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      updatePlayback();
    }).observe(preview);
  }
  window.addEventListener('pagehide', () => { suspended = true; stop(); });
  window.addEventListener('pageshow', () => { suspended = false; updatePlayback(); });
})();
