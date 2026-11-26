import { t as jsxRuntime } from './assets/vendor-react-BwTmGSqX.js';

const { jsx, jsxs } = jsxRuntime();
const thumbnailWaitMs = 10_000;

export async function preloadPublicBuildThumbnails(sources, signal) {
  signal.throwIfAborted();
  const urls = new Set(sources.filter((source) => typeof source === 'string' && source));
  const images = Array.from(urls, (url) => {
    const image = new Image();
    image.src = url;
    return image;
  });
  if (!images.length) return images;

  let timeout;
  let stopWaiting;
  const limit = new Promise((resolve) => {
    stopWaiting = resolve;
    signal.addEventListener('abort', stopWaiting, { once: true });
    timeout = setTimeout(resolve, thumbnailWaitMs);
  });

  try {
    // A broken thumbnail or a stalled connection should still let the view open.
    await Promise.race([Promise.allSettled(images.map((image) => image.decode())), limit]);
    signal.throwIfAborted();
    return images;
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', stopWaiting);
    if (signal.aborted) images.forEach((image) => image.removeAttribute('src'));
  }
}

export function PublicBuildLoading({ label }) {
  return jsx('div', {
    className: 'public-build-loading',
    children: jsxs('div', {
      className: 'public-build-loading__group',
      children: [
        jsx('img', {
          src: '/_carspot-builds/assets/carspot-share-card.png',
          alt: '',
          width: 474,
          height: 556,
        }),
        jsx('p', { role: 'status', children: label }),
        jsx('div', { className: 'public-build-loading__track', 'aria-hidden': true }),
      ],
    }),
  });
}
