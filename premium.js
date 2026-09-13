(() => {
  'use strict';
  const story = document.querySelector('.scroll-story');
  const chapters = [...document.querySelectorAll('.story-chapter')];
  const phone = document.querySelector('.story-phone');
  const heroPhone = document.querySelector('.hero-phone');
  const hero = document.querySelector('.hero');
  const count = document.querySelector('.story-count');
  const bars = [...document.querySelectorAll('.chapter-progress i')];
  const progress = document.querySelector('.reading-progress');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const heightQuery = matchMedia('(min-height: 680px)');
  let scheduled = false;
  let enabled = false;
  const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
  const configure = () => {
    enabled = !reduced.matches && heightQuery.matches;
    document.documentElement.classList.toggle('scrub-enabled', enabled);
    chapters.forEach(ch => { ch.removeAttribute('style'); ch.removeAttribute('aria-hidden'); });
    phone.style.transform = '';
    heroPhone.style.transform = '';
    requestUpdate();
  };
  function update() {
    scheduled = false;
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${scrollable > 0 ? clamp(scrollY / scrollable) : 0})`;
    if (!reduced.matches) {
      const h = hero.getBoundingClientRect();
      if (h.bottom > 0) {
        const t = clamp(-h.top / h.height);
        heroPhone.style.transform = `translateY(${t * 55}px) rotate(${-9 + t * 11}deg) rotateY(${-12 + t * 12}deg)`;
      }
    }
    if (!enabled) return;
    const rect = story.getBoundingClientRect();
    const sticky = document.querySelector('.site-header').offsetHeight;
    const stageHeight = innerHeight - sticky;
    const t = clamp((sticky - rect.top) / (rect.height - stageHeight));
    const phase = t * 2;
    // Crossfades track the scroll position in both directions; no timed scroll hijacking.
    chapters.forEach((ch, i) => {
      const distance = phase - i;
      const opacity = clamp((.6 - Math.abs(distance)) / .2);
      ch.style.opacity = opacity;
      ch.style.visibility = opacity > 0 ? 'visible' : 'hidden';
      ch.style.transform = `translateY(${-distance * 34}px)`;
      ch.setAttribute('aria-hidden', String(i !== Math.round(phase)));
    });
    phone.style.transform = `rotate(${7 - t * 14}deg) rotateY(${-14 + t * 28}deg) scale(${.93 + Math.sin(t * Math.PI) * .07})`;
    count.textContent = `0${Math.round(phase) + 1} / 03`;
    bars.forEach((bar, i) => bar.style.setProperty('--fill', clamp(t * 3 - i)));
  }
  function requestUpdate() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }
  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate, { passive: true });
  reduced.addEventListener('change', configure);
  heightQuery.addEventListener('change', configure);
  addEventListener('pageshow', requestUpdate);
  document.getElementById('y').textContent = new Date().getFullYear();
  configure();
})();
