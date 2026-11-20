// Regenerate one published static page: node scripts/render-share-card.mjs b85qp
// Its public data lives in id/<slug>/profile.json. An optional detailsUrl links
// the printed action directly to that vehicle's existing build page.
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';

const slug = process.argv[2];
if (!slug || !/^[a-z0-9_-]+$/.test(slug)) throw new Error('Expected a public profile slug.');
const profileDir = new URL(`../id/${slug}/`, import.meta.url);
const profile = JSON.parse(await readFile(new URL('profile.json', profileDir), 'utf8'));
const template = await readFile(new URL('share-card.template.html', import.meta.url), 'utf8');
const origin = 'https://carspot.gg';
const profileUrl = `${origin}/id/${slug}`;
const { owner, serial, vehicle, variant, image, detailsUrl } = profile;
const facts = profile.facts ?? {};
const modifications = profile.modifications ?? [];
if (![owner, serial, vehicle, image?.src, image?.alt].every(value => typeof value === 'string' && value.trim())) {
  throw new Error('A public card needs its owner, serial, vehicle, image and image description.');
}
const fullVehicle = [vehicle, variant].filter(Boolean).join(' ');

const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escape(value) {
  return String(value).replace(/[&<>"']/g, character => entities[character]);
}
function webUrl(value) {
  const url = new URL(value, profileUrl + '/');
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`Invalid profile URL: ${value}`);
  return url;
}
function pageHref(url) {
  return url.origin === origin ? url.pathname + url.search + url.hash : url.href;
}

const { width, height, detailsArea } = image;
if (![width, height].every(value => Number.isSafeInteger(value) && value > 0)) {
  throw new Error('Artwork needs its natural width and height.');
}

// Art coordinates refer to the original image so the hit area scales with it.
function actionPosition(area) {
  if (!area) return '';
  const { x, y, width: w, height: h } = area;
  if (![x, y, w, h].every(Number.isFinite) || x < 0 || y < 0 || w <= 0 || h <= 0 || x + w > width || y + h > height) {
    throw new Error('The detail action must be inside the artwork.');
  }
  const pct = fraction => `${(100 * fraction).toFixed(3)}%`;
  return ` style="inset-inline: ${pct(x / width)} ${pct((width - x - w) / width)}; bottom: ${pct((height - y - h) / height)}; height: ${pct(h / height)}"`;
}

const actionAttrs = `class="card-details" id="details-button" aria-label="Umbauten im Detail sehen"${actionPosition(detailsArea)}`;
let detailsAction;
let detailsDialog = '';
if (detailsUrl) {
  detailsAction = `<a ${actionAttrs} href="${escape(pageHref(webUrl(detailsUrl)))}"></a>`;
} else {
  detailsAction = `<button ${actionAttrs} type="button" aria-haspopup="dialog" aria-controls="details-dialog"></button>`;
  const factRows = Object.entries(facts).map(([name, value]) =>
    `<div><dt>${escape(name)}</dt><dd>${escape(value)}</dd></div>`).join('');
  const detailNote = modifications.length
    ? `<ul id="details-note">${modifications.map(text => `<li>${escape(text)}</li>`).join('')}</ul>`
    : '<p id="details-note">Für diese Share Card sind noch keine Umbauten hinterlegt.</p>';
  detailsDialog = `<dialog class="card-dialog" id="details-dialog" aria-labelledby="details-title" aria-describedby="details-note">
    <h2 id="details-title">Umbauten im Detail</h2>
    <p>${escape(fullVehicle)} · ${escape(owner)}</p>
    ${factRows ? `<dl class="card-facts">${factRows}</dl>` : ''}
    ${detailNote}
    <form method="dialog"><button autofocus>Zurück zur Share Card</button></form>
  </dialog>\n`;
}

const artworkUrl = webUrl(image.src);
const fields = {
  vehicle: escape(vehicle), fullVehicle: escape(fullVehicle), owner: escape(owner), serial: escape(serial),
  profileUrl, imageUrl: escape(pageHref(artworkUrl)), shareImageUrl: escape(artworkUrl.href),
  width, height, alt: escape(image.alt), detailsAction, detailsDialog,
  reportUrl: `mailto:info@carspot.gg?subject=${escape(encodeURIComponent(`Share Card ${serial} melden (${owner})`))}`
};
async function writePage(directory, layout, values) {
  const html = layout.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!Object.hasOwn(values, key)) throw new Error(`Unknown share-card template field: ${key}`);
    return values[key];
  });
  await mkdir(directory, { recursive: true });
  const pending = new URL(`.index-${randomUUID()}.tmp`, directory);
  try {
    await writeFile(pending, html, { flag: 'wx' });
    await rename(pending, new URL('index.html', directory));
  } finally {
    await rm(pending, { force: true });
  }
}



// Crop coordinates follow the vehicle editor: -1…1 from center, zoom 1…3.
function cropStyle(cover) {
  if (cover.bakedCrop || !cover.crop) return '';
  const { x, y, zoom, width, height } = cover.crop;
  if (![x, y, zoom, width, height].every(Number.isFinite) || width <= 0 || height <= 0) {
    throw new Error('Invalid cover crop');
  }
  const scale = Math.max(100 / width, 50 / height) * Math.min(3, Math.max(1, zoom));
  const w = width * scale, h = height * scale * 2;
  const offset = (size, position) => (100 - size) * (1 - Math.max(-1, Math.min(1, position))) / 2;
  return ` style="width:${w}%;height:${h}%;left:${offset(w, x)}%;top:${offset(h, y)}%"`;
}

if (profile.cover?.src) {
  const layout = await readFile(new URL('split-card.template.html', import.meta.url), 'utf8');
  const { cover, avatar } = profile;
  const personalization = profile.personalization ?? {};
  const mediaHref = src => escape(pageHref(webUrl(src)));
  const paragraph = (name, value) => value ? `<p class="${name}" dir="auto">${escape(value)}</p>` : '';
  const target = detailsUrl
    ? `<a class="build-action" href="${mediaHref(detailsUrl)}"`
    : '<button class="build-action" id="details-button" type="button" aria-haspopup="dialog" aria-controls="details-dialog"';
  const action = target + '>Umbauten im Detail sehen<span aria-hidden="true"></span>' + (detailsUrl ? '</a>' : '</button>');
  await writePage(profileDir, layout, {
    ...fields, variantText: paragraph('motor', variant),
    coverUrl: mediaHref(cover.src), coverAlt: escape(cover.alt || fullVehicle), cropStyle: cropStyle(cover),
    photoLogo: cover.branded ? '' : '<img class="photo-logo" src="/assets/carspot-logo.png" alt="CarSpot">',
    pills: ['Baujahr', 'Karosserie', 'Kraftstoff'].filter(name => facts[name] != null && facts[name] !== '').map(name =>
      `<li><span class="visually-hidden">${name} </span>${escape(facts[name])}</li>`).join(''),
    avatarImage: avatar ? `<img src="${mediaHref(avatar)}" alt="" class="owner-avatar">` : '',
    quote: paragraph('quote', personalization.quote), hashtag: paragraph('hashtag', personalization.subtext),
    signature: personalization.signature ? `<p class="signature"><bdi>${escape(personalization.signature)}</bdi></p>` : '',
    buildAction: action
  });
} else {
  await writePage(profileDir, template, fields);
}
