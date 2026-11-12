import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { products } from './products.mjs';

const out = new URL('./dist/', import.meta.url);
const css = await readFile(new URL('./assets/site.css', import.meta.url));
const styleVersion = createHash('sha256').update(css).digest('hex').slice(0, 12);
const escape = (value) => String(value).replace(/[&<>"']/g, (character) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const arrow = '<span aria-hidden="true">↗</span>';
const picture = (product, shot, prefix = '', eager = false) =>
  '<img src="' + prefix + 'assets/' + product.slug + '/' + shot[0] + '.jpg" width="720" height="1600" alt="' + escape(shot[2]) + '"' + (eager ? ' fetchpriority="high"' : ' loading="lazy"') + '>';
const icon = (product, prefix = '') => '<img class="app-icon" src="' + prefix + 'assets/' + product.slug + '/icon.svg" width="44" height="44" alt="">';
const symbols = {
  back: 'M19 12H5m7 7-7-7 7-7',
  left: 'm15 18-6-6 6-6',
  right: 'm9 18 6-6-6-6',
  close: 'm6 6 12 12M18 6 6 18',
  download: 'M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4',
};
const svg = (name) => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + symbols[name] + '"/></svg>';
const plate = (product, prefix = '') => '<div class="plate" aria-hidden="true">' +
  (product.preview?.map((id) => product.screenshots.find(([file]) => file === id)) ?? product.screenshots.slice(0, 3)).map((shot) => '<div class="phone">' + picture(product, shot, prefix, true) + '</div>').join('') +
  '</div>';

function shell({ title, description, prefix = '', body, page = 'collection' }) {
  return '<!doctype html><html lang="en" data-page="' + page + '"><head><meta charset="utf-8"><meta name="color-scheme" content="only light"><meta name="darkreader-lock"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<meta name="description" content="' + escape(description) + '"><title>' + escape(title) + '</title>' +
    '<link rel="icon" href="' + prefix + 'assets/collection-mark.svg" type="image/svg+xml"><link rel="stylesheet" href="' + prefix + 'assets/site.css?v=' + styleVersion + '"><script defer src="' + prefix + 'assets/site.js"></script></head>' +
    '<body><a class="skip" href="#main">Skip to content</a>' + body +
    '<footer id="about" class="site-footer wrap"><div><strong>Idraak’s collection</strong></div><nav aria-label="Footer links"><a href="https://www.linkedin.com/in/idraak/">LinkedIn ' + arrow + '</a><a href="https://www.instagram.com/idraakk/">Instagram ' + arrow + '</a></nav></footer></body></html>';
}

function home() {
  return shell({ title: "Idraak's collection", description: 'An independent collection of apps and digital products by Idraak.', body:
    '<main id="main" class="wrap"><section class="intro"><div><h1>The software<br><em>collection.</em></h1></div>' +
    '<div class="intro-note"><p>An evolving collection of apps and digital products I’ve built. Take a look inside each one.</p><a class="text-link" href="#collection">Explore the collection <span aria-hidden="true">↓</span></a></div></section>' +
    '<section class="collection" id="collection" aria-labelledby="collection-title"><div class="section-line"><h2 id="collection-title">Products</h2><span>' + products.length + (products.length === 1 ? ' app' : ' apps') + '</span></div>' +
    products.map((product) => '<a class="exhibit" href="' + product.slug + '/index.html"><div class="exhibit-copy"><div class="product-meta">' + icon(product) + '<span>' + escape(product.category) + ' / ' + escape(product.platform) + '</span></div><div><h3>' + escape(product.name) + '</h3><p>' + escape(product.description) + '</p></div><span class="exhibit-action">Explore ' + escape(product.name) + ' ' + arrow + '</span></div>' + plate(product) + '</a>').join('') +
    '</section></main>' });
}

function productPage(product) {
  const prefix = '../';
  const access = product.apk
    ? 'href="' + prefix + 'assets/' + product.slug + '/downloads/' + product.apk + '" download'
    : product.accessUrl ? 'href="' + escape(product.accessUrl) + '"' : '';
  const images = product.screenshots.map((shot) =>
    '<figure><button type="button" class="shot" data-caption="' + escape(shot[1]) + '" aria-label="Enlarge ' + escape(shot[1]) + '">' +
    picture(product, shot, prefix) + '</button><figcaption>' + escape(shot[1]) + '</figcaption></figure>').join('');
  return shell({ title: product.name + ' · Idraak’s collection', description: product.description, prefix, page: 'product', body:
    '<main id="main" class="wrap product"><a href="../index.html#collection" class="back">' + svg('back') + ' Collection</a><section class="product-hero"><div class="product-copy"><div class="product-meta">' + icon(product, prefix) + '<span>' + escape(product.name) + ' / ' + escape(product.platform) + '</span></div><h1>' + escape(product.headline) + '</h1><p>' + escape(product.description) + '</p><p>' + escape(product.introduction) + '</p>' + (access ? '<a class="button" ' + access + '>Get ' + escape(product.name) + ' ' + svg('download') + '</a>' : '') + '</div>' + plate(product, prefix) + '</section>' +
    '<nav class="product-index" aria-label="On this page"><a href="#screens-title">Screenshots ↓</a><a href="#features-title">Features ↓</a><a href="#privacy-title">Privacy ↓</a></nav>' +
    '<section class="product-section" aria-labelledby="screens-title"><div class="section-line"><h2 id="screens-title">Screenshots</h2><div class="rail-controls"><button type="button" data-scroll="-1" aria-label="Previous screenshots">' + svg('left') + '</button><button type="button" data-scroll="1" aria-label="Next screenshots">' + svg('right') + '</button></div></div><div class="screens" tabindex="0" aria-label="Screenshots">' + images + '</div></section>' +
    '<section class="product-section" aria-labelledby="features-title"><div class="section-line"><h2 id="features-title">What you can do</h2></div><div class="features">' +
    product.features.map(([title, copy]) => '<article><h3>' + escape(title) + '</h3><p>' + escape(copy) + '</p></article>').join('') + '</div></section>' +
    '<section class="product-section privacy" aria-labelledby="privacy-title"><div class="section-line"><h2 id="privacy-title">Privacy &amp; security</h2></div>' +
    '<div class="privacy-layout"><aside class="privacy-lead"><h3>Privacy is worth protecting.</h3></aside><ul class="privacy-details">' +
    product.privacy.map(([title, copy]) => '<li><h3>' + escape(title) + '</h3>' + (copy ? '<p>' + escape(copy) + '</p>' : '') + '</li>').join('') + '</ul></div></section>' +
    '<dialog class="viewer" aria-label="Screenshot viewer"><div class="viewer-top"><span class="viewer-caption" aria-live="polite"></span><button type="button" class="viewer-close" aria-label="Close screenshot">' + svg('close') + '</button></div><div class="viewer-body"><button type="button" data-step="-1" aria-label="Previous screenshot">' + svg('left') + '</button><img alt="" draggable="false"><button type="button" data-step="1" aria-label="Next screenshot">' + svg('right') + '</button></div></dialog></main>' });

}

const used = new Set();
for (const product of products) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug) || used.has(product.slug)) throw new Error('Invalid or duplicate product slug.');
  used.add(product.slug);
  for (const filename of [product.apk].filter(Boolean)) {
    if (!/^[\w.-]+\.apk$/.test(filename)) throw new Error('Invalid download filename.');
    await readFile(new URL('./assets/' + product.slug + '/downloads/' + filename, import.meta.url));
  }
  if (product.accessUrl && new URL(product.accessUrl).protocol !== 'https:') throw new Error('Use an HTTPS access URL.');

  if (product.preview?.some((id) => !product.screenshots.some(([file]) => file === id))) throw new Error('Unknown preview screenshot.');
  if (product.screenshots.length < 3) throw new Error('Provide at least three screenshots.');
  await readFile(new URL('./assets/' + product.slug + '/icon.svg', import.meta.url));
  for (const [file] of product.screenshots) {
    if (!/^[a-z0-9-]+$/.test(file)) throw new Error('Invalid screenshot filename.');
    await readFile(new URL('./assets/' + product.slug + '/' + file + '.jpg', import.meta.url));
  }
}
await mkdir(out, { recursive: true });
await cp(new URL('./assets/', import.meta.url), new URL('assets/', out), { recursive: true });
await writeFile(new URL('index.html', out), home());
await writeFile(new URL('.nojekyll', out), '');
for (const product of products) {
  const folder = new URL(product.slug + '/', out);
  await mkdir(folder, { recursive: true });
  await writeFile(new URL('index.html', folder), productPage(product));
}
console.log('Built ' + products.length + ' product page(s) in dist/.');
