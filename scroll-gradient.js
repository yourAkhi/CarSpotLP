(() => {
  const root = document.documentElement;
  const scrollContainer = document.querySelector(".container");
  const usesInnerScroll = Boolean(
    scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight,
  );
  const target = usesInnerScroll ? scrollContainer : window;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frameId = 0;

  const readProgress = () => {
    if (usesInnerScroll) {
      const maxScroll = Math.max(
        1,
        scrollContainer.scrollHeight - scrollContainer.clientHeight,
      );
      return Math.min(1, Math.max(0, scrollContainer.scrollTop / maxScroll));
    }

    const documentHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
    );
    const maxScroll = Math.max(1, documentHeight - window.innerHeight);
    return Math.min(1, Math.max(0, window.scrollY / maxScroll));
  };

  const updateGradient = () => {
    frameId = 0;
    const progress = readProgress();
    const whiteOverlay = 0.012 + progress * 0.072;
    const shift = reduceMotion.matches ? 0 : progress * -28;

    root.style.setProperty("--scroll-lightness", whiteOverlay.toFixed(3));
    root.style.setProperty("--gradient-shift", `${shift.toFixed(1)}px`);
  };

  const requestUpdate = () => {
    if (frameId) return;
    frameId = window.requestAnimationFrame(updateGradient);
  };

  target.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  reduceMotion.addEventListener?.("change", requestUpdate);
  updateGradient();
})();
