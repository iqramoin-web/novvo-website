// App shell: router, nav, footer, cart drawer, loader, smooth scroll.
import { t, L, setLang, getLang } from './i18n.js';
import { COLORS, CURRENCIES, FREE_SHIPPING_MIN, BRAND, getProduct } from './data.js';
import * as store from './store.js';
import { thumb } from './band3d.js';
import { $, $$, esc, icon, logo, thumbImg, thumbSpec, productName, hydrateThumbs, toast, flyToCart } from './ui.js';
import { homeView, mountHome, playHeroIntro } from './home.js';
import * as P from './pages.js';
import { mountSupport, refreshSupport } from './support.js';

gsap.registerPlugin(ScrollTrigger);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
setLang(getLang());

// ---------- smooth scroll ----------
const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ---------- chrome ----------
const NAV = [
  ['#/shop', 'nav.shop'], ['#/shop/whoop', 'nav.whoop'], ['#/shop/garmin', 'nav.garmin'], ['#/shop/fitbit', 'nav.fitbit'],
  ['#/track', 'nav.track'], ['#/contact', 'nav.contact'],
];

function renderChrome() {
  const lang = getLang();
  $('#navLogo').innerHTML = logo();
  $('#cartLbl').textContent = t('nav.cart');
  $('#announce').innerHTML = Array(6).fill(`<span>${esc(t('announce'))}</span>`).join('');
  $('#navLinks').innerHTML = NAV.map(([h, k]) => `<a href="${h}" class="link-u">${t(k)}</a>`).join('');
  $('#mobileMenu').innerHTML = NAV.map(([h, k]) => `<a href="${h}">${t(k)}</a>`).join('') +
    `<div class="mm-tools"><button class="btn btn--ghost btn--sm" data-lang-toggle type="button">${lang === 'ar' ? 'English' : 'العربية'}</button>
     <label class="select"><select data-currency>${currencyOptions()}</select></label></div>`;
  $('#langBtn').innerHTML = lang === 'ar' ? 'EN' : '<span class="ar">ع</span>';
  $('#langBtn').setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
  $('#currency').innerHTML = currencyOptions();
  renderFooter();
  updateCartCount();
  markActive();
}
const currencyOptions = () => Object.keys(CURRENCIES).map((c) => `<option value="${c}" ${c === store.getCurrency() ? 'selected' : ''}>${c}</option>`).join('');

function renderFooter() {
  const lang = getLang();
  const now = new Date().getFullYear();
  const since = BRAND.since || '20XX';
  $('#footer').innerHTML = `
    <div class="footer__top">
      <div>
        <h2 class="display h3" style="max-width:16ch">${t('news.title')}</h2>
        <form class="news" id="newsForm"><input type="email" required placeholder="${t('news.ph')}" aria-label="${t('news.ph')}" /><button class="btn" type="submit">${t('news.btn')}</button></form>
      </div>
      <div><h4>${t('ft.cats')}</h4><ul>${[['#/shop/whoop', 'nav.whoop'], ['#/shop/garmin', 'nav.garmin'], ['#/shop/fitbit', 'nav.fitbit'], ['#/shop/charms', 'nav.charms'], ['#/product/whoop-custom', 'nav.custom']].map(([h, k]) => `<li><a class="link-u" href="${h}">${t(k)}</a></li>`).join('')}</ul></div>
      <div><h4>${t('ft.help')}</h4><ul>
        <li><a class="link-u" href="#/track">${t('nav.track')}</a></li>
        <li><a class="link-u" href="#/contact">${t('foot.faq')}</a></li>
        <li><a class="link-u" href="#/terms">${t('legal.terms')}</a></li>
        <li><a class="link-u" href="#/privacy">${t('legal.privacy')}</a></li></ul></div>
      <div><h4>${t('ft.contact')}</h4>
        <ul class="footer__contact">
          <li><a class="link-u" href="${BRAND.phoneHref}" dir="ltr">${icon.phone}${esc(BRAND.phone)}</a></li>
          <li><a class="link-u" href="mailto:${BRAND.email}">${icon.mail}${esc(BRAND.email)}</a></li>
          <li><span>${icon.pin}${esc(BRAND.address[lang] || BRAND.address.en)}</span></li>
        </ul>
        <div class="footer__social">
          <a href="https://instagram.com/${BRAND.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon.ig}</a>
          <a href="https://wa.me/${BRAND.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon.wa}</a>
        </div>
      </div>
    </div>
    <div class="footer__brand" aria-hidden="true">${logo(true)}</div>
    <div class="footer__bottom">
      <span>© ${since}–${now} NOVVO. ${t('foot.rights')}</span>
      <nav class="footer__legal"><a class="link-u" href="#/terms">${t('legal.terms')}</a><a class="link-u" href="#/privacy">${t('legal.privacy')}</a></nav>
      <div class="pay-icons"><span>KNET</span><span>VISA</span><span>MC</span><span>PAY</span></div>
    </div>`;
  $('#newsForm').addEventListener('submit', (e) => { e.preventDefault(); e.target.reset(); toast(t('news.ok')); });
}

function wordmarkAnim() {
  gsap.from('.footer__brand .logo', { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.footer__brand', start: 'top 95%' } });
}

function markActive() {
  const h = location.hash || '#/';
  $$('#navLinks a').forEach((a) => a.classList.toggle('is-active', h === a.getAttribute('href') || (a.getAttribute('href') === '#/shop' && h === '#/shop')));
}

// ---------- cart drawer ----------
function updateCartCount() { $('#cartCount').textContent = store.cartCount(); }

function renderDrawer() {
  const items = store.getCart();
  const sub = store.subtotal();
  const left = Math.max(0, FREE_SHIPPING_MIN - sub);
  const d = $('#drawer');
  d.innerHTML = `
    <div class="drawer__head"><h2 class="display">${t('cart.title')} <span class="mono muted" style="font-size:14px">(${store.cartCount()})</span></h2>
      <button class="x-btn" type="button" data-close aria-label="Close">${icon.close}</button></div>
    ${items.length ? `
    <div class="ship-meter">${left ? `<b>${store.money(left)}</b> ${t('cart.away')}` : `✓ ${t('cart.free')}`}
      <div class="ship-meter__bar"><i style="width:${Math.min(100, (sub / FREE_SHIPPING_MIN) * 100)}%"></i></div></div>
    <div class="drawer__items">${items.map((i) => {
      const p = getProduct(i.id);
      if (!p) return '';
      const meta = [L(COLORS[i.color]), i.size && `${t('cart.size')} ${i.size}`, i.variant, i.engraving && `${t('cart.engraved')}: “${esc(i.engraving)}”`, i.charms?.length && `${t('pdp.charms')}: ${i.charms.join(', ')}`, i.print && `${t('print.cart')}: ${esc(i.print)}`].filter(Boolean);
      return `<div class="line-item">
        <a class="line-item__img" href="#/product/${p.id}">${thumbImg(thumbSpec(p, i.color))}</a>
        <div><h4>${esc(productName(p))}</h4><ul>${meta.map((m) => `<li>${m}</li>`).join('')}</ul>
          <div class="qty qty--sm"><button type="button" data-dec="${esc(i.key)}">−</button><span>${i.qty}</span><button type="button" data-inc="${esc(i.key)}">+</button></div></div>
        <div class="line-item__price"><span>${store.money(store.unitPrice(i) * i.qty)}</span><button class="line-item__rm" type="button" data-rm="${esc(i.key)}">${t('cart.remove')}</button></div>
      </div>`;
    }).join('')}</div>
    <div class="drawer__foot">
      <div class="sum-row"><span>${t('cart.subtotal')}</span><b>${store.money(sub)}</b></div>
      <a class="btn btn--accent btn--block" href="#/checkout" data-close-nav>${t('cart.checkout')} ${icon.arrow}</a>
    </div>` : `
    <div class="drawer__empty"><p class="display">${t('cart.empty')}</p><a class="btn" href="#/shop" data-close-nav>${t('cart.continue')}</a></div>`}`;
  hydrateThumbs(d);
}

const openCart = () => { renderDrawer(); document.body.classList.add('cart-open'); $('#drawer').setAttribute('aria-hidden', 'false'); lenis.stop(); };
const closeCart = () => { document.body.classList.remove('cart-open'); $('#drawer').setAttribute('aria-hidden', 'true'); lenis.start(); };

$('#cartBtn').addEventListener('click', openCart);
$('#scrim').addEventListener('click', closeCart);
$('#drawer').addEventListener('click', (e) => {
  const k = (a) => e.target.closest(`[data-${a}]`)?.dataset[a];
  if (e.target.closest('[data-close]') || e.target.closest('[data-close-nav]')) closeCart();
  const inc = k('inc'), dec = k('dec'), rm = k('rm');
  const find = (key) => store.getCart().find((i) => i.key === key);
  if (inc) store.setQty(inc, find(inc).qty + 1);
  if (dec) store.setQty(dec, find(dec).qty - 1);
  if (rm) store.removeItem(rm);
});
addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeCart(); document.body.classList.remove('menu-open'); } });

store.subscribe(() => {
  updateCartCount();
  if (document.body.classList.contains('cart-open')) renderDrawer();
});

// Quick add from a product card (default size M).
async function quickAdd(id, color, btn) {
  const p = getProduct(id);
  const c = color || p.colors[0];
  store.addToCart(p.kind === 'charm' ? { id, color: c } : { id, color: c, size: 'M', variant: (p.variants || [])[0], charms: [] });
  const src = await thumb(thumbSpec(p, c));
  flyToCart(btn, src);
  toast(`${t('toast.added')} · ${productName(p)}`, src);
}

// ---------- language & currency ----------
function switchLang() {
  setLang(getLang() === 'ar' ? 'en' : 'ar');
  renderChrome();
  refreshSupport();
  route({ force: true });
}
$('#langBtn').addEventListener('click', switchLang);
document.addEventListener('click', (e) => { if (e.target.closest('[data-lang-toggle]')) { document.body.classList.remove('menu-open'); switchLang(); } });
document.addEventListener('change', (e) => {
  if (e.target.id === 'currency' || e.target.matches('[data-currency]')) {
    store.setCurrency(e.target.value);
    renderChrome();
    route({ force: true, instant: true });
  }
});

$('#burger').addEventListener('click', () => document.body.classList.toggle('menu-open'));
$('#mobileMenu').addEventListener('click', (e) => { if (e.target.closest('a')) document.body.classList.remove('menu-open'); });

// nav state on scroll
let lastY = 0;
lenis.on('scroll', ({ scroll }) => {
  const nav = $('#nav');
  nav.classList.toggle('is-scrolled', scroll > 40);
  nav.classList.toggle('is-hidden', scroll > 400 && scroll > lastY && !document.body.classList.contains('menu-open'));
  lastY = scroll;
});

// ---------- router ----------
const view = $('#view');
let cleanup = null;
let first = true;
let currentPath = null;

function resolve() {
  const parts = (location.hash.replace(/^#\/?/, '') || '').split('/').filter(Boolean);
  const [a, b] = parts;
  if (!a) return { name: 'home', html: homeView, mount: (r) => mountHome(r, { onQuick: quickAdd }) };
  if (a === 'shop') return { name: 'shop', html: () => P.shopView(b || 'all'), mount: (r) => P.mountShop(r, { device: b || 'all', onQuick: quickAdd }) };
  if (a === 'product') return { name: 'product', html: () => P.productView(b), mount: (r) => P.mountProduct(r, { id: b, onQuick: quickAdd, openCart }) };
  if (a === 'checkout') return { name: 'checkout', html: P.checkoutView, mount: P.mountCheckout };
  if (a === 'order') return { name: 'order', html: () => P.confirmView(b), mount: (r) => P.mountConfirm(r, { id: b }) };
  if (a === 'track') return { name: 'track', html: () => P.trackView(b), mount: (r) => P.mountTrack(r, { id: b }) };
  if (a === 'contact') return { name: 'contact', html: P.contactView, mount: P.mountContact };
  if (a === 'terms' || a === 'privacy') return { name: a, html: () => P.legalView(a), mount: () => {} };
  return { name: '404', html: () => `<section class="page"><h1 class="display h1">404</h1><p class="lead">${t('404')}</p><a class="btn" href="#/">NOVVO</a></section>`, mount: () => {} };
}

async function route({ force = false, instant = false } = {}) {
  const path = location.hash;
  // shop filter changes use replaceState; ignore identical paths
  if (!force && path === currentPath) return;
  currentPath = path;
  const r = resolve();
  const curtain = $('#curtain');
  const animate = !first && !instant && !matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (animate) {
    await gsap.timeline()
      .set(curtain, { transformOrigin: 'bottom' })
      .to(curtain, { scaleY: 1, duration: 0.55, ease: 'expo.inOut' })
      .to('.curtain__logo', { opacity: 1, duration: 0.2 }, '-=0.2');
  }

  cleanup?.();
  cleanup = null;
  ScrollTrigger.getAll().forEach((s) => s.kill());
  closeCart();
  view.innerHTML = r.html();
  document.body.className = document.body.className.replace(/\broute-\S+/g, '').trim();
  document.body.classList.add('route-' + r.name);
  lenis.scrollTo(0, { immediate: true, force: true });
  try { cleanup = r.mount(view) || null; } catch (err) { console.error(err); }
  wordmarkAnim();
  markActive();
  document.title = r.name === 'home' ? 'NOVVO — The Screenless Strap Specialists' : `NOVVO — ${$('h1', view)?.textContent.trim() || ''}`;
  requestAnimationFrame(() => ScrollTrigger.refresh());

  if (animate) {
    await gsap.timeline()
      .to('.curtain__logo', { opacity: 0, duration: 0.15 })
      .set(curtain, { transformOrigin: 'top' })
      .to(curtain, { scaleY: 0, duration: 0.65, ease: 'expo.inOut' });
    if (r.name === 'home') playHeroIntro(view);
  } else if (!first && r.name === 'home') playHeroIntro(view);
  first = false;
}

addEventListener('hashchange', () => route());
addEventListener('novvo:remount', () => route({ force: true, instant: true }));

// ---------- boot ----------
async function boot() {
  document.body.classList.add('is-loading');
  renderChrome();
  $('#loaderLogo').innerHTML = logo(true);
  $('#curtainLogo').innerHTML = logo(true);
  gsap.from('#loaderLogo', { opacity: 0, y: 16, duration: 0.9, ease: 'expo.out' });
  const bar = gsap.to('#loaderBar', { scaleX: 0.9, duration: 1.4, ease: 'power2.out' });
  await Promise.all([
    document.fonts.load('500 40px "Inter Tight"'), document.fonts.load('600 40px "IBM Plex Sans Arabic"'),
    new Promise((r) => setTimeout(r, 800)),
  ]).catch(() => {});
  await route({ force: true });
  bar.kill();
  await gsap.to('#loaderBar', { scaleX: 1, duration: 0.3 });
  await gsap.to('#loader', { opacity: 0, duration: 0.6, ease: 'power2.out' });
  $('#loader').remove();
  window.scrollTo(0, 0);
  lenis.scrollTo(0, { immediate: true, force: true });
  document.body.classList.remove('is-loading');
  mountSupport();
  if (resolve().name === 'home') playHeroIntro(view);
  ScrollTrigger.refresh();
}
boot();
