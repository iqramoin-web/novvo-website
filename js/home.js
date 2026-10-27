// Home page (light edition): scroll-expanding hero video, device shop panel,
// live 3D customizer, reviews, how-it-works, materials, FAQ.
import { t, L, isRTL, getLang } from './i18n.js';
import { COLORS, MATERIALS, PRODUCTS, DEVICES, SIZES, ENGRAVING_PRICE, CHARM_ADDON_PRICE, getProduct } from './data.js';
import { Band, Stage, thumb } from './band3d.js';
import * as store from './store.js';
import { $, $$, esc, icon, charmIcon, card, bindCards, hydrateThumbs, thumbImg, thumbSpec, productName, reveal, toast, flyToCart } from './ui.js';

// Drop an AI-generated clip here to replace the 3D fallback in the hero.
const HERO_VIDEO = 'assets/hero.mp4';
const BAND_COLORS = ['onyx', 'bone', 'aqua', 'ember', 'sage', 'lilac', 'sand', 'navy', 'cognac', 'blush', 'crimson', 'olive'];
const MAT_ORDER = ['silicone', 'nylon', 'leather', 'sportflex'];
// Official device photos (from whoop.com, garmin.com and the Google Store).
const DEVICE_INFO = {
  whoop: { img: 'assets/devices/whoop.png', models: '5.0 · MG · ONE · PEAK · 4.0' },
  garmin: { img: 'assets/devices/garmin.png', models: 'Cirqa · Smart Band' },
  fitbit: { img: 'assets/devices/fitbit.png', models: 'Air' },
  charms: { img: null, models: 'Gold · Silver · Rose' },
};
const FEATURE_ICONS = {
  fit: '<svg viewBox="0 0 24 24"><rect x="7" y="3" width="10" height="18" rx="4"/><path d="M7 9h10M7 15h10"/></svg>',
  eng: '<svg viewBox="0 0 24 24"><path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/></svg>',
  ship: '<svg viewBox="0 0 24 24"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
  mat: '<svg viewBox="0 0 24 24"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/></svg>',
};
const money = store.money;

export function homeView() {
  const lang = getLang();
  const best = getProduct('whoop-classic');
  const introA = t('i.l1').split(' '), introB = t('i.l2').split(' ');
  // Placeholder testimonials — replace with real customer reviews.
  const reviews = lang === 'ar' ? [
    ['أفضل حزام جربته لـ WHOOP. ما أحس فيه حتى وقت النوم.', 'نورة', 'الكويت'],
    ['النقش بالعربي طلع مرة مرتب، ووصل خلال يوم.', 'عبدالله', 'السالمية'],
    ['الجلد فخم ويناسب الدوام. صار جهازي شكله ساعة.', 'ريم', 'الرياض'],
    ['سبورت فليكس ممتاز للجيم، ما يحبس العرق.', 'فهد', 'الدوحة'],
    ['طلبت لفريق الشركة بشعارنا. خدمة ممتازة.', 'مريم', 'دبي'],
  ] : [
    ['The best WHOOP strap I’ve owned. I forget it’s there, even asleep.', 'Noura', 'Kuwait City'],
    ['Arabic engraving came out razor sharp and arrived the next day.', 'Abdullah', 'Salmiya'],
    ['The leather makes my tracker look like a proper watch at work.', 'Reem', 'Riyadh'],
    ['Sport Flex is perfect for the gym. No sweat trapped underneath.', 'Fahad', 'Doha'],
    ['Ordered logo-engraved straps for our whole team. Flawless.', 'Maryam', 'Dubai'],
  ];
  const reviewHtml = reviews.map(([q, n, c]) => `<article class="review"><span class="stars">★★★★★</span><p>“${q}”</p><footer><b>${n}</b><span>${c}</span></footer></article>`).join('');
  const prevArrow = icon.arrow.replace('d="M4 12h16m-6-6 6 6-6 6"', 'd="M20 12H4m6-6-6 6 6 6"');

  return `
  <section class="hero" id="hero">
    <div class="hero__sticky">
      <div class="hero__media" id="heroMedia"><div class="hero__fallback"></div></div>
      <div class="hero__copy" id="heroCopy">
        <h1 class="display"><span class="l">${t('h.title1')}</span><span class="l">${t('h.title2')}</span></h1>
        <p class="hero__sub">${t('h.sub')}</p>
        <a class="btn" href="#/shop" id="heroCta">${icon.arrow}${t('h.cta')}</a>
      </div>
      <div class="hero-card">
        <a class="hero-card__img" href="#/product/${best.id}">${thumbImg(thumbSpec(best, 'aqua'), '', productName(best))}</a>
        <div class="hero-card__body">
          <span class="mono muted">${t('h.cardKicker')}</span>
          <b>${esc(productName(best))}</b>
          <div class="hero-card__row">
            <a class="btn btn--ghost" href="#/product/${best.id}">${icon.arrow}${t('h.learn')}</a>
            <button class="btn btn--accent" type="button" data-quick="${best.id}" data-color="aqua">${t('h.add')}</button>
          </div>
        </div>
      </div>
      <span class="hero__tag mono">WHOOP · GARMIN · FITBIT AIR</span>
    </div>
  </section>

  <section class="intro">
    <h2 class="display" id="introTitle">${introA.map((w) => `<span class="w">${esc(w)} </span>`).join('')}<br>${introB.map((w) => `<span class="w soft">${esc(w)} </span>`).join('')}</h2>
  </section>
  <div class="features">
    ${['fit', 'eng', 'ship', 'mat'].map((k) => `<div class="feature" data-reveal>${FEATURE_ICONS[k]}<h3>${t(`f.${k}.t`)}</h3><p>${t(`f.${k}.d`)}</p></div>`).join('')}
  </div>

  <section class="shop-panel" id="shopPanel">
    <div class="shop-panel__head">
      <div><span class="kicker">${t('sp.kicker')}</span><h2 class="display h2">${t('sp.l1')}<br><span class="soft">${t('sp.l2')}</span></h2></div>
      <div class="tabs" id="devTabs" role="tablist"><span class="tabs__ind" aria-hidden="true"></span>${['whoop', 'garmin', 'fitbit', 'charms'].map((d, i) => `<button type="button" role="tab" aria-selected="${!i}" class="${i ? '' : 'is-on'}" data-dev="${d}">${DEVICE_INFO[d].img ? `<img src="${DEVICE_INFO[d].img}" alt="" />` : charmIcon.star}<span>${L(DEVICES[d])}</span><small>${PRODUCTS.filter((p) => p.device === d).length}</small></button>`).join('')}</div>
    </div>
    <div class="rail" id="devRail" tabindex="0" aria-label="${esc(t('sp.kicker'))}"></div>
    <div class="rail-foot">
      <div class="rail-progress"><i id="railBar"></i></div>
      <span class="mono rail-count" id="railCount"></span>
      <div class="rail-nav"><button type="button" data-dir="-1" aria-label="Previous">${prevArrow}</button><button type="button" data-dir="1" aria-label="Next">${icon.arrow}</button></div>
    </div>
  </section>
  <section class="fit" id="fit">
    <div class="fit__copy">
      <span class="kicker">${t('fit.kicker')}</span>
      <h2 class="display h2">${t('sp.b1')}<br><span class="soft">${t('sp.b2')}</span></h2>
      <p class="lead">${t('sp.p')}</p>
      <ul class="fit__points">
        ${[1, 2, 3].map((i) => `<li data-reveal><span class="mono">0${i}</span><div><b>${t(`fit.s${i}t`)}</b><p>${t(`fit.s${i}d`)}</p></div></li>`).join('')}
      </ul>
      <div class="fit__ctas">
        <a class="btn" href="#/shop">${t('sp.btn')} ${icon.arrow}</a>
        <a class="arrow-l link-u" href="#/shop">${icon.arrow}${t('sp.link')}</a>
      </div>
    </div>
    <div class="fit__tool" data-reveal>
      <div class="fit__head"><b>${t('fit.tool')}</b><span class="mono muted">${t('fit.wrist')}</span></div>
      <div class="fit__readout">
        <div><span class="fit__cm" id="fitCm">16.5</span><span class="fit__unit">cm</span></div>
        <div class="fit__size"><span class="mono muted">${t('fit.rec')}</span><b id="fitSize">M</b></div>
      </div>
      <input type="range" class="fit__range" id="fitRange" min="12" max="23" step="0.5" value="16.5" aria-label="${esc(t('fit.wrist'))}" />
      <div class="fit__sizes">${SIZES.map((z) => `<button type="button" class="fit__bar" data-size="${z.id}"><b>${z.id}</b><span class="mono" dir="ltr">${z.cm} cm</span></button>`).join('')}</div>
      <p class="fit__tip">${t('fit.tip')}</p>
      <div class="fit__devices">
        <span class="mono muted">${t('fit.for')}</span>
        <div>${['whoop', 'garmin', 'fitbit'].map((d) => `<a href="#/shop/${d}" class="fit__dev"><img src="${DEVICE_INFO[d].img}" alt="" draggable="false" /><span>${esc(L(DEVICES[d]))}</span></a>`).join('')}</div>
      </div>
    </div>
  </section>

  <section class="custom" id="custom">
    <div class="custom__stage"><canvas id="czCanvas"></canvas><span class="hint mono">${icon.drag}${t('chip.drag')}</span></div>
    <div class="custom__panel">
      <div><span class="kicker">${t('cz.kicker')}</span><h2 class="display h2">${t('cz.l1')}<br><span class="soft">${t('cz.l2')}</span></h2></div>
      <p class="lead" style="margin:0">${t('cz.sub')}</p>
      <div class="custom__row"><span>${t('cz.device')}</span>
        <div class="seg" id="czDev">${['whoop', 'garmin', 'fitbit'].map((d, i) => `<button type="button" class="${i ? '' : 'is-on'}" data-v="${d}">${L(DEVICES[d])}</button>`).join('')}</div></div>
      <div class="custom__row"><span>${t('cz.material')}</span>
        <div class="seg" id="czMat">${MAT_ORDER.map((m) => `<button type="button" class="${m === 'nylon' ? 'is-on' : ''}" data-v="${m}">${L(MATERIALS[m])}</button>`).join('')}</div></div>
      <div class="custom__row"><span>${t('cz.color')}<b id="czColorName">${L(COLORS.sage)}</b></span>
        <div class="swatches" id="czColor">${BAND_COLORS.map((c) => `<button class="swatch ${c === 'sage' ? 'is-on' : ''}" style="--c:${COLORS[c].hex}" data-v="${c}" aria-label="${esc(L(COLORS[c]))}" type="button"></button>`).join('')}</div></div>
      <div class="custom__row"><span>${t('cz.engrave')}<b>+${money(ENGRAVING_PRICE)}</b></span>
        <div class="engrave-input"><input id="czEng" maxlength="14" placeholder="${esc(t('eng.placeholder'))}" autocomplete="off" /><small class="mono" id="czCount">0/14</small></div></div>
      <div class="custom__row"><span>${t('cz.charms')}<b>+${money(CHARM_ADDON_PRICE)}</b></span>
        <div class="charm-toggles" id="czCharms">${['star', 'heart', 'bolt'].map((c) => `<button type="button" class="charm-toggle" data-v="${c}" aria-label="${c}">${charmIcon[c]}</button>`).join('')}</div></div>
      <div class="custom__buy"><div><span class="mono muted">${t('cz.total')}</span><br><b id="czPrice"></b></div><button class="btn btn--accent" type="button" id="czAdd">${t('h.add')} ${icon.arrow}</button></div>
    </div>
  </section>

  <section class="reviews">
    <div class="reviews__head">
      <h2 class="display h2">${t('rv.l1')}<br><span class="soft">${t('rv.l2')}</span></h2>
    </div>
    <div class="reviews__track">${reviewHtml + reviewHtml}</div>
  </section>

  <section class="how" id="how">
    <div class="how__bg" id="howBg" aria-hidden="true"></div>
    <div class="how__head">
      <span class="kicker how__kicker">${t('hw.kicker')}</span>
      <h2 class="display h2">${t('hw.title')}</h2>
      <p class="how__lead">${t('hw.sub')}</p>
    </div>
    <div class="how__steps">
      ${[1, 2, 3].map((i) => `<div class="step"><div class="step__title"><span class="step__num mono">${t('hw.step')} 0${i}</span><h3>${t(`hw.${i}t`)}</h3></div><p>${t(`hw.${i}d`)}</p></div>`).join('')}
    </div>
  </section>

  <section class="section">
    <div class="section__head"><h2 class="display h2">${t('mt.l1')}<br><span class="soft">${t('mt.l2')}</span></h2><a class="btn btn--ghost" href="#/shop">${t('feat.all')} ${icon.arrow}</a></div>
    <div class="mats">
      ${MAT_ORDER.map((m) => {
        const c = { silicone: 'onyx', nylon: 'aqua', leather: 'cognac', sportflex: 'ember' }[m];
        return `<a class="mat" href="#/shop" data-reveal><div class="mat__img">${thumbImg({ device: 'whoop', material: m, color: COLORS[c].hex, angle: 'a' }, '', L(MATERIALS[m]))}</div><h3>${t(`mat.${m}.t`)}</h3><p>${t(`mat.${m}.d`)}</p></a>`;
      }).join('')}
    </div>
  </section>

  <section class="faq">
    <h2 class="display h2">${t('fq.title')}</h2>
    <div>${[1, 2, 3, 4].map((i) => `<details class="acc"><summary>${t('faq.q' + i)}</summary><p>${t('faq.a' + i)}</p></details>`).join('')}</div>
  </section>

  <section class="cta">
    <h2 class="display">${t('ct.l1')}<br><span class="soft">${t('ct.l2')}</span></h2>
    <a class="btn btn--accent" href="#/shop">${t('ct.btn')} ${icon.arrow}</a>
  </section>`;
}

// ---------- hero media ----------
async function mountHeroMedia(el) {
  let hasVideo = false;
  try { hasVideo = (await fetch(HERO_VIDEO, { method: 'HEAD' })).ok; } catch {}
  if (hasVideo) {
    const v = document.createElement('video');
    Object.assign(v, { src: HERO_VIDEO, autoplay: true, muted: true, loop: true, playsInline: true });
    v.setAttribute('playsinline', '');
    el.appendChild(v);
    v.play().catch(() => {});
    return () => v.pause();
  }
  // Fallback until the AI video is added: three straps drifting in warm light.
  const c = document.createElement('canvas');
  el.appendChild(c);
  const stage = new Stage(c, { distance: 9 });
  const bands = [
    { cfg: { device: 'whoop', material: 'nylon', color: COLORS.sage.hex }, pos: [0, -0.15, 0], s: 1.2, sp: 0.25 },
    { cfg: { device: 'garmin', material: 'leather', color: COLORS.cognac.hex }, pos: [-3.4, 0.7, -2], s: 0.9, sp: -0.18 },
    { cfg: { device: 'fitbit', material: 'silicone', color: COLORS.bone.hex }, pos: [3.5, -0.6, -1.5], s: 0.9, sp: 0.2 },
  ].map((b) => {
    const band = new Band(b.cfg);
    band.group.position.set(...b.pos);
    band.group.scale.setScalar(b.s);
    band.group.rotation.set(0.45, b.pos[0] * 0.2, 0.1);
    stage.pivot.add(band.group);
    return { ...b, band };
  });
  stage.onFrame((dt, time) => {
    bands.forEach((b, i) => {
      b.band.group.rotation.y += b.sp * dt;
      b.band.group.position.y = b.pos[1] + Math.sin(time * 0.6 + i * 2) * 0.12;
    });
  });
  stage.start();
  return () => stage.dispose();
}

// ---------- mount ----------
export function mountHome(root, { onQuick }) {
  const cleanups = [];
  const ST = window.ScrollTrigger;
  const heroEl = $('#hero', root);
  const media = $('#heroMedia', root);
  let disposed = false;
  mountHeroMedia(media).then((fn) => (disposed ? fn() : cleanups.push(fn)));

  // hero: the video frame starts below the CTA and grows to full-bleed
  const cta = $('#heroCta', root), copy = $('#heroCopy', root), h1 = $('#heroCopy h1', root);
  let geo = null, prog = 0;
  const measure = () => {
    const vw = media.clientWidth, vh = media.clientHeight;
    const gap = Math.max(40, vh * 0.07);
    // offsets ignore transforms, so the intro animation doesn't skew the result
    const top = copy.offsetTop + cta.offsetTop + cta.offsetHeight + gap;
    // on phones the product card sits at the bottom, so start the frame above it
    const heroCard = $('.hero-card', root);
    const bottom = vw < 900 ? heroCard.offsetHeight + 24 : Math.max(16, vh * 0.05);
    const w = Math.min(vw - 32, Math.max(vw * 0.36, (vh - top - bottom) * 16 / 9));
    geo = { top, bottom, side: Math.max(16, (vw - w) / 2), textTop: copy.offsetTop + h1.offsetTop };
    applyHero(prog);
  };
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const applyHero = (p) => {
    prog = p;
    if (!geo) return;
    const e = ease(Math.min(1, p / 0.8)); // expand over the first 80%, then hold full-bleed
    const k = 1 - e;
    const top = geo.top * k;
    media.style.clipPath = `inset(${top}px ${geo.side * k}px ${geo.bottom * k}px ${geo.side * k}px round ${22 * k}px)`;
    media.style.setProperty('--shade', Math.min(1, e * 1.3).toFixed(3));
    media.style.setProperty('--zoom', (1.18 - 0.18 * e).toFixed(4));
    heroEl.classList.toggle('is-dark', top < geo.textTop + 20);
  };
  ST.create({ trigger: heroEl, start: 'top top', end: 'bottom bottom', onUpdate: (s) => applyHero(s.progress), onRefresh: measure });
  measure();

  // intro: words sharpen as they scroll in
  gsap.fromTo($$('#introTitle .w', root), { opacity: 0.1, filter: 'blur(10px)' }, {
    opacity: 1, filter: 'blur(0px)', stagger: 0.1, ease: 'none',
    scrollTrigger: { trigger: '#introTitle', start: 'top 85%', end: 'bottom 50%', scrub: true },
  });

  // device shop panel
  const rail = $('#devRail', root);
  const tabs = $('#devTabs', root);
  const deviceCard = (dev) => {
    const info = DEVICE_INFO[dev];
    const count = PRODUCTS.filter((p) => p.device === dev).length;
    const media = info.img
      ? `<img src="${info.img}" alt="${esc(L(DEVICES[dev]))}" draggable="false" />`
      : thumbImg(thumbSpec(getProduct('charm-star'), 'gold'), '', L(DEVICES[dev]));
    return `<a class="dev-card" data-dev="${dev}" href="#/shop/${dev}">
      <span class="mono muted">${t('pdp.compat')}</span>
      <h3>${esc(L(DEVICES[dev]))}</h3>
      <span class="mono dev-card__models">${info.models}</span>
      <div class="dev-card__img">${media}</div>
      <div class="dev-card__foot"><span>${count} ${t('dev.items')}</span><span class="arrow-c">${icon.arrow}</span></div>
    </a>`;
  };
  const moveIndicator = () => {
    const on = $('button.is-on', tabs), ind = $('.tabs__ind', tabs);
    if (!on || !ind) return;
    Object.assign(ind.style, { width: `${on.offsetWidth}px`, height: `${on.offsetHeight}px`, transform: `translate(${on.offsetLeft}px, ${on.offsetTop}px)` });
  };
  const renderRail = (dev) => {
    rail.innerHTML = deviceCard(dev) + PRODUCTS.filter((p) => p.device === dev).map(card).join('');
    rail.scrollLeft = 0;
    hydrateThumbs(rail);
    gsap.fromTo(rail.children, { opacity: 0, y: 30, rotateX: -8 }, { opacity: 1, y: 0, rotateX: 0, stagger: 0.06, duration: 0.8, ease: 'expo.out', clearProps: 'transform' });
    updateRail();
  };
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('[data-dev]'); if (!b || b.classList.contains('is-on')) return;
    $$('button', tabs).forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', x === b); });
    moveIndicator();
    renderRail(b.dataset.dev);
  });

  // one column width shared by every tab, so WHOOP and Garmin cards match
  const step = () => (rail.firstElementChild?.offsetWidth || 0) + parseFloat(getComputedStyle(rail).columnGap || 16);
  const updateRail = () => {
    const max = rail.scrollWidth - rail.clientWidth;
    const x = Math.abs(rail.scrollLeft);
    const p = max > 0 ? x / max : 1;
    $('#railBar', root).style.transform = `scaleX(${Math.max(0.08, p)})`;
    const total = rail.children.length, perView = Math.max(1, Math.round(rail.clientWidth / step()));
    const first = Math.min(total, Math.round(x / step()) + 1), last = Math.min(total, first + perView - 1);
    $('#railCount', root).textContent = `${String(first).padStart(2, '0')}–${String(last).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    const [prev, next] = $$('.rail-nav button', root);
    prev.disabled = x < 4; next.disabled = x > max - 4;
  };
  rail.addEventListener('scroll', updateRail, { passive: true });
  const go = (dir) => rail.scrollBy({ left: dir * (isRTL() ? -1 : 1) * step(), behavior: 'smooth' });
  $('.rail-nav', root).addEventListener('click', (e) => { const b = e.target.closest('[data-dir]'); if (b) go(+b.dataset.dir); });
  rail.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(isRTL() ? -1 : 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(isRTL() ? 1 : -1); }
  });

  // mouse drag-to-scroll; a drag never counts as a click
  let drag = null, dragged = false;
  rail.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('button, input')) return;
    drag = { x: e.clientX, left: rail.scrollLeft }; dragged = false;
  });
  const onMove = (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!dragged && Math.abs(dx) > 6) { dragged = true; rail.classList.add('is-dragging'); }
    if (dragged) rail.scrollLeft = drag.left - dx;
  };
  const onUp = () => {
    if (!drag) return;
    drag = null;
    if (dragged) {
      rail.classList.remove('is-dragging');
      // let snap settle on the nearest card
      rail.scrollBy({ left: 0, behavior: 'smooth' });
      // the click that ends a drag fires right after pointerup; clear the flag once it has passed
      setTimeout(() => (dragged = false), 0);
    }
  };
  addEventListener('pointermove', onMove);
  addEventListener('pointerup', onUp);
  cleanups.push(() => { removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); });
  rail.addEventListener('click', (e) => { if (dragged) { e.preventDefault(); e.stopPropagation(); } }, true);

  // 3D tilt with a soft glare that follows the pointer
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    rail.addEventListener('pointermove', (e) => {
      if (drag) return;
      const c = e.target.closest('.card, .dev-card'); if (!c) return;
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      c.style.transform = `perspective(1000px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateY(-6px)`;
      c.style.setProperty('--gx', `${(x + 0.5) * 100}%`);
      c.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
    });
    rail.addEventListener('pointerout', (e) => {
      const c = e.target.closest('.card, .dev-card');
      if (c && !c.contains(e.relatedTarget)) c.style.transform = '';
    });
  }

  renderRail('whoop');
  requestAnimationFrame(moveIndicator);
  const onResize = () => { moveIndicator(); updateRail(); };
  addEventListener('resize', onResize);
  cleanups.push(() => removeEventListener('resize', onResize));
  bindCards(rail, onQuick);
  $('.hero-card', root).addEventListener('click', (e) => {
    const q = e.target.closest('[data-quick]'); if (q) onQuick(q.dataset.quick, q.dataset.color, q);
  });

  // how it works: slow parallax on the photo, steps cascade in
  gsap.fromTo('#howBg', { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.04, ease: 'none', scrollTrigger: { trigger: '#how', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from($$('#how .step', root), { x: isRTL() ? 60 : -60, opacity: 0, duration: 1, stagger: 0.18, ease: 'expo.out', clearProps: 'transform', scrollTrigger: { trigger: '#how .how__steps', start: 'top 85%' } });

  // size finder
  const fitRange = $('#fitRange', root);
  const sizeFor = (cm) => (cm < 16 ? 'S' : cm < 19 ? 'M' : 'L');
  const syncFit = () => {
    const cm = +fitRange.value, size = sizeFor(cm);
    $('#fitCm', root).textContent = cm.toFixed(1);
    const sizeEl = $('#fitSize', root);
    if (sizeEl.textContent !== size) { sizeEl.textContent = size; gsap.fromTo(sizeEl, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }); }
    fitRange.style.setProperty('--p', `${((cm - fitRange.min) / (fitRange.max - fitRange.min)) * 100}%`);
    $$('.fit__bar', root).forEach((b) => b.classList.toggle('is-on', b.dataset.size === size));
  };
  fitRange.addEventListener('input', syncFit);
  $('.fit__sizes', root).addEventListener('click', (e) => {
    const b = e.target.closest('[data-size]'); if (!b) return;
    fitRange.value = { S: 14.5, M: 17.5, L: 20.5 }[b.dataset.size];
    syncFit();
  });
  syncFit();

  // live customizer
  const st = { device: 'whoop', material: 'nylon', color: 'sage', engraving: '', charms: [] };
  const stage = new Stage($('#czCanvas', root), { orbit: true, distance: 6.6, shadow: true });
  stage.controls.enableZoom = false;
  const band = new Band({ device: st.device, material: st.material, color: COLORS[st.color].hex });
  band.group.rotation.set(0.35, -0.5, 0.05);
  stage.pivot.add(band.group);
  stage.onFrame((dt, time) => { stage.pivot.position.y = Math.sin(time) * 0.05; });
  cleanups.push(() => stage.dispose());
  // render only while on screen
  ST.create({ trigger: '#custom', start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? stage.start() : stage.stop()) });

  const product = () => PRODUCTS.find((p) => p.device === st.device && p.material === st.material) || PRODUCTS.find((p) => p.device === st.device);
  const price = () => product().price + (st.engraving.trim() ? ENGRAVING_PRICE : 0) + st.charms.length * CHARM_ADDON_PRICE;
  const sync = () => {
    band.set({ device: st.device, material: st.material, color: COLORS[st.color].hex, engraving: st.engraving, charms: st.charms });
    $('#czPrice', root).textContent = money(price());
    $('#czColorName', root).textContent = L(COLORS[st.color]);
  };
  const seg = (id, key) => $(id, root).addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    $$(`${id} [data-v]`, root).forEach((x) => x.classList.toggle('is-on', x === b));
    st[key] = b.dataset.v; sync();
  });
  seg('#czDev', 'device'); seg('#czMat', 'material'); seg('#czColor', 'color');
  let engViewed = false;
  $('#czEng', root).addEventListener('input', (e) => {
    st.engraving = e.target.value;
    $('#czCount', root).textContent = `${e.target.value.length}/14`;
    if (!engViewed) {
      engViewed = true;
      stage.controls.autoRotate = false;
      gsap.to(stage.camera.position, { x: 0, y: 0, z: 6.6, duration: 1, ease: 'expo.inOut', onUpdate: () => stage.camera.lookAt(0, 0, 0) });
      gsap.to(band.group.rotation, { x: -1.15, y: 0, z: 0, duration: 1.2, ease: 'expo.inOut' });
    }
    sync();
  });
  $('#czCharms', root).addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    b.classList.toggle('is-on');
    st.charms = $$('#czCharms .is-on', root).map((x) => x.dataset.v);
    sync();
  });
  $('#czAdd', root).addEventListener('click', async (e) => {
    const p = product();
    const btn = e.currentTarget;
    const item = { id: p.id, color: st.color, size: 'M', variant: (p.variants || DEVICES[p.device].variants)[0], charms: st.charms, charmMetal: st.charms.length ? 'gold' : undefined };
    if (st.engraving.trim()) Object.assign(item, { engraving: st.engraving.trim(), font: 'sans' });
    store.addToCart(item);
    const src = await thumb({ device: st.device, material: st.material, color: COLORS[st.color].hex, angle: 'a' });
    flyToCart(btn, src);
    toast(`${t('toast.added')} · ${productName(p)}`, src);
  });
  sync();

  hydrateThumbs(root);
  reveal(root);

  return () => {
    disposed = true;
    cleanups.forEach((f) => f?.());
    ST.getAll().forEach((s) => s.kill());
  };
}

export function playHeroIntro(root) {
  gsap.from($$('#heroCopy .l, #heroCopy .hero__sub, #heroCta', root), { yPercent: 40, opacity: 0, duration: 1.2, stagger: 0.08, ease: 'expo.out' });
  gsap.from($('.hero-card', root), { y: 40, opacity: 0, duration: 1.2, delay: 0.4, ease: 'expo.out' });
}
