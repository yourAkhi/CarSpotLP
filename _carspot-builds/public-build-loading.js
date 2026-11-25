import { t as jsxRuntime } from './assets/vendor-react-BwTmGSqX.js';

const { jsx, jsxs } = jsxRuntime();

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
