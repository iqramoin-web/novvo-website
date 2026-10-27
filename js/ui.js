// Shared UI helpers: icons, product cards, thumbnail hydration, toasts.
import { t, L } from './i18n.js';
import { COLORS, DEVICES, getProduct } from './data.js';
import { money } from './store.js';
import { thumb } from './band3d.js';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// NOVVO mark, traced from the logo on ordernovvo.com.
const MARK = '<svg class="mark" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><polygon points="0,0 34,0 100,100 66,100"/><polygon points="74,0 100,0 100,48 93,48 93,7 74,7"/><polygon points="0,55 7,55 7,88 26,100 0,100"/></svg>';
export const logo = (stack = false) => `<span class="logo ${stack ? 'logo--stack' : ''}">${MARK}<span>NOVVO</span></span>`;

export const icon = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 5l14 14M19 5 5 19"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  drag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 9 4 12l4 3M16 9l4 3-4 3M4 12h16"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><path d="M12 3 5 6v6c0 4 3 7.5 7 9 4-1.5 7-5 7-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
  swap: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="m5 12 5 5 9-10"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/></svg>',
  card: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><path d="M4 11 12 4l8 7v9H4z"/><path d="M10 20v-6h4v6"/></svg>',
  chat: '<svg viewBox="0 0 24 24" stroke-width="1.6"><path d="M4 20l1.5-4A8 8 0 1 1 9 19z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  ig: '<svg viewBox="0 0 24 24" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
};

export const charmIcon = {
  star: '<svg viewBox="-12 -12 24 24"><path d="M0-10 2.6-3.6 9.5-3.1 4.2 1.4 5.9 8.1 0 4.4-5.9 8.1-4.2 1.4-9.5-3.1-2.6-3.6z"/></svg>',
  heart: '<svg viewBox="-12 -12 24 24"><path d="M0 9C-6 4-10 0.5-10-3.5A5 5 0 0 1 0-6a5 5 0 0 1 10 2.5C10 0.5 6 4 0 9Z"/></svg>',
  bolt: '<svg viewBox="-12 -12 24 24"><path d="M3-11-7 1h6l-3 10L7-2H1z"/></svg>',
  disc: '<svg viewBox="-12 -12 24 24"><circle r="9"/></svg>',
};

export const productName = (p) => (p.kind === 'charm' ? L(p.name) : `${L(DEVICES[p.device])} ${L(p.name)}`);
export const thumbSpec = (p, color, angle = 'a') =>
  p.kind === 'charm'
    ? { kind: 'charm', shape: p.shape, metal: color || p.colors[0], angle }
    : { device: p.device, material: p.material, color: COLORS[color || p.colors[0]].hex, angle };

// <img> placeholders get their src from the thumbnail renderer once mounted.
export const thumbImg = (spec, cls = '', alt = '') => `<img class="${cls}" data-thumb='${esc(JSON.stringify(spec))}' alt="${esc(alt)}" />`;

export function hydrateThumbs(root = document) {
  $$('img[data-thumb]:not([src])', root).forEach((img) => {
    const spec = JSON.parse(img.dataset.thumb);
    thumb(spec).then((url) => {
      img.src = url;
      img.closest('.card__media')?.querySelector('.ph')?.remove();
    });
  });
}

export function card(p) {
  const c0 = p.colors[0];
  const badge = p.badge ? `<span class="badge badge--${p.badge}">${t('badge.' + p.badge)}</span>` : '';
  return `
  <article class="card" data-id="${p.id}" data-reveal>
    <a class="card__media" href="#/product/${p.id}" aria-label="${esc(productName(p))}">
      <div class="ph"></div>
      ${badge}
      ${thumbImg(thumbSpec(p, c0, 'a'), 'a', productName(p))}
      ${thumbImg(thumbSpec(p, c0, 'b'), 'b', '')}
    </a>
    <div class="card__body">
      <div class="card__row">
        <a href="#/product/${p.id}" class="card__title">${esc(L(p.name))}</a>
        <span class="card__price">${money(p.price)}</span>
      </div>
      <div class="card__row">
        <span class="card__dev mono">${esc(L(DEVICES[p.device]))}</span>
        <div class="swatches">${p.colors.slice(0, 5).map((c, i) => `<button class="swatch swatch--sm ${i ? '' : 'is-on'}" style="--c:${COLORS[c].hex}" data-card-color="${c}" aria-label="${esc(L(COLORS[c]))}" type="button"></button>`).join('')}</div>
      </div>
      <div class="card__ctas">
        <button class="btn btn--accent" data-quick="${p.id}" type="button">${t('h.add')}</button>
        <a class="btn btn--ghost" href="#/product/${p.id}">${icon.arrow}${t('sp.details')}</a>
      </div>
    </div>
  </article>`;
}

// Card colour dots re-render the card thumbnails in that colour.
export function bindCards(root, onQuick) {
  root.addEventListener('click', (e) => {
    const sw = e.target.closest('[data-card-color]');
    if (sw) {
      const cardEl = sw.closest('.card');
      const p = getProduct(cardEl.dataset.id);
      cardEl.querySelectorAll('[data-card-color]').forEach((b) => b.classList.toggle('is-on', b === sw));
      cardEl.dataset.color = sw.dataset.cardColor;
      ['a', 'b'].forEach((ang) => {
        const img = cardEl.querySelector('img.' + ang);
        thumb(thumbSpec(p, sw.dataset.cardColor, ang)).then((u) => (img.src = u));
      });
      return;
    }
    const q = e.target.closest('[data-quick]');
    if (q) {
      onQuick(q.dataset.quick, q.closest('.card')?.dataset.color, q);
      // brief confirmation on the button itself
      if (!q.dataset.label) q.dataset.label = q.innerHTML;
      q.classList.add('is-added');
      q.innerHTML = `${icon.check.replace('<svg', '<svg width="16" stroke="currentColor"')}${t('pdp.added')}`;
      clearTimeout(q._t);
      q._t = setTimeout(() => { q.classList.remove('is-added'); q.innerHTML = q.dataset.label; }, 1600);
    }
  });
}

export function toast(msg, img) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `${img ? `<img src="${img}" alt="" />` : '<i>✓</i>'}<span>${esc(msg)}</span>`;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 2600);
}

// Little product image that arcs into the cart button.
export function flyToCart(fromEl, src) {
  if (!fromEl || !src || !window.gsap) return;
  const a = fromEl.getBoundingClientRect(), b = $('#cartBtn').getBoundingClientRect();
  const img = document.createElement('img');
  img.className = 'fly'; img.src = src;
  document.body.appendChild(img);
  const x0 = a.left + a.width / 2 - 40, y0 = a.top + a.height / 2 - 40;
  const x1 = b.left + b.width / 2 - 40, y1 = b.top + b.height / 2 - 40;
  gsap.set(img, { x: x0, y: y0 });
  gsap.to(img, { x: x1, duration: 0.8, ease: 'power1.inOut' });
  gsap.to(img, { y: y1, duration: 0.8, ease: 'back.in(1.6)' });
  gsap.to(img, { scale: 0.2, opacity: 0.4, duration: 0.8, ease: 'power2.in', onComplete: () => {
    img.remove();
    const btn = $('#cartBtn'); btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');
  } });
}

export function reveal(root) {
  if (!window.gsap || !window.ScrollTrigger) { $$('[data-reveal]', root).forEach((e) => (e.style.opacity = 1)); return; }
  ScrollTrigger.batch($$('[data-reveal]', root), {
    start: 'top 92%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, stagger: 0.07, ease: 'expo.out', overwrite: true }),
  });
}
