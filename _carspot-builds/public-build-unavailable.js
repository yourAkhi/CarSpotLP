import { t as jsxRuntime } from './assets/vendor-react-BwTmGSqX.js';
import { n as Link } from './assets/vendor-router-CjVjjOsj.js';

const { jsx, jsxs } = jsxRuntime();

const messages = {
  de: ['Build nicht verfügbar', 'Dieser Build ist nicht verfügbar'],
  en: ['Build unavailable', 'This build is unavailable'],
  tr: ['Proje erişilebilir değil', 'Bu proje erişilebilir değil'],
  es: ['Proyecto no disponible', 'Este proyecto no está disponible'],
  fr: ['Projet indisponible', 'Ce projet est indisponible'],
  it: ['Progetto non disponibile', 'Questo progetto non è disponibile'],
  pt: ['Projeto indisponível', 'Este projeto não está disponível'],
  ar: ['المشروع غير متاح', 'هذا المشروع غير متاح'],
};

export function PublicBuildUnavailable({ language, garagePath, garageLabel }) {
  const [title, description] = messages[language] ?? messages.de;

  return jsxs('div', {
    className: 'public-build-unavailable',
    children: [
      jsx('div', {
        className: 'public-build-unavailable__hero',
        role: 'status',
        children: jsx('h1', { children: title }),
      }),
      jsxs('div', {
        className: 'public-build-unavailable__details',
        children: [
          jsx('p', { children: description }),
          garagePath && jsx(Link, {
            className: 'public-build-unavailable__garage-link',
            to: garagePath,
            children: language === 'de' ? 'Zur Garage' : garageLabel,
          }),
        ],
      }),
    ],
  });
}
