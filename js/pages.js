// Inner pages: shop, product configurator, checkout, confirmation, tracking, contact.
import { t, L, getLang } from './i18n.js';
import { COLORS, MATERIALS, DEVICES, SIZES, PRODUCTS, COUNTRIES, ENGRAVING_PRICE, CHARM_ADDON_PRICE, BRAND, PERKS, ENGRAVING_FONTS, ENGRAVING_SYMBOLS, ENGRAVE_MAX, MATERIAL_FACTS, PRINTABLE_MATERIALS, PRINT_PRICE, PRINT_DESIGNS, getProduct } from './data.js';
import { designCanvas } from './designs.js';
import * as store from './store.js';
import { Band, Stage, makeCharm, thumb } from './band3d.js';
import { $, $$, esc, icon, charmIcon, card, bindCards, hydrateThumbs, thumbImg, thumbSpec, productName, toast, flyToCart, reveal, perksSection } from './ui.js';

const go = (h) => (location.hash = h);

// ================= SHOP =================
export function shopView(device = 'all') {
  const title = device === 'all' ? t('shop.title') : L(DEVICES[device]);
  return `
  <section class="page">
    <div class="page-head">
      <div>
        <div class="crumbs mono"><a href="#/">NOVVO</a><span>/</span><a href="#/shop">${t('nav.shop')}</a>${device !== 'all' ? `<span>/</span><span>${esc(title)}</span>` : ''}</div>
        <h1 class="display h1">${esc(title)}</h1>
      </div>
      <p class="lead">${t('hero.sub')}</p>
    </div>
    <div class="filters">
      <div class="filters__group" id="fDevice">
        ${['all', 'whoop', 'garmin', 'fitbit', 'charms'].map((d) => `<button class="pill ${d === device ? 'is-on' : ''}" data-dev="${d}" type="button">${d === 'all' ? t('shop.all') : L(DEVICES[d])} <small>${d === 'all' ? PRODUCTS.length : PRODUCTS.filter((p) => p.device === d).length}</small></button>`).join('')}
      </div>
      <div class="filters__group">
        <div class="filters__group" id="fMat">
          ${Object.keys(MATERIALS).map((m) => `<button class="pill" data-mat="${m}" type="button">${L(MATERIALS[m])}</button>`).join('')}
        </div>
        <label class="select"><span class="sr">${t('shop.sort')}</span>
          <select id="fSort">
            <option value="featured">${t('sort.featured')}</option>
            <option value="low">${t('sort.low')}</option>
            <option value="high">${t('sort.high')}</option>
          </select>
        </label>
      </div>
    </div>
    <p class="mono muted" id="fCount"></p>
    <div class="grid" id="shopGrid"></div>
  </section>`;
}

export function mountShop(root, { device = 'all', onQuick }) {
  const state = { device, mats: new Set(), sort: 'featured' };
  const grid = $('#shopGrid', root);
  const render = () => {
    let list = PRODUCTS.filter((p) => (state.device === 'all' || p.device === state.device) && (!state.mats.size || state.mats.has(p.material)));
    if (state.sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (state.sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
    if (state.sort === 'featured') list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    grid.innerHTML = list.length ? list.map(card).join('') : `<p class="empty">${t('shop.empty')}</p>`;
    $('#fCount', root).textContent = `${list.length} ${t('shop.count')}`;
    hydrateThumbs(grid);
    gsap.fromTo($$('.card', grid), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.05, ease: 'expo.out' });
  };
  $('#fDevice', root).addEventListener('click', (e) => {
    const b = e.target.closest('[data-dev]'); if (!b) return;
    state.device = b.dataset.dev;
    history.replaceState(null, '', state.device === 'all' ? '#/shop' : `#/shop/${state.device}`);
    $$('#fDevice .pill', root).forEach((x) => x.classList.toggle('is-on', x === b));
    $('h1', root).textContent = state.device === 'all' ? t('shop.title') : L(DEVICES[state.device]);
    render();
  });
  $('#fMat', root).addEventListener('click', (e) => {
    const b = e.target.closest('[data-mat]'); if (!b) return;
    state.mats.has(b.dataset.mat) ? state.mats.delete(b.dataset.mat) : state.mats.add(b.dataset.mat);
    b.classList.toggle('is-on');
    render();
  });
  $('#fSort', root).addEventListener('change', (e) => { state.sort = e.target.value; render(); });
  bindCards(grid, onQuick);
  render();
}

// ================= PRODUCT =================
export function productView(id) {
  const p = getProduct(id);
  if (!p) return `<section class="page"><h1 class="display h2">${t('pdp.notFound')}</h1><a class="btn" href="#/shop">${t('nav.shop')}</a></section>`;
  const isCharm = p.kind === 'charm';
  const dev = DEVICES[p.device];
  const variants = p.variants || dev.variants || [];
  return `
  <section class="page" style="padding-top:24px">
    <div class="crumbs mono" style="margin-bottom:18px"><a href="#/">NOVVO</a><span>/</span><a href="#/shop/${p.device}">${esc(L(dev))}</a><span>/</span><span>${esc(L(p.name))}</span></div>
    <div class="pdp">
      <div class="pdp__stage" id="pdpStage">
        <canvas id="pdpCanvas" data-cursor="drag"></canvas>
        <div class="spec-tag mono"><span>${esc(L(dev))}</span><span>${isCharm ? 'PVD STEEL' : esc(L(MATERIALS[p.material]))}</span></div>
        <div class="views">${isCharm ? '' : '<button type="button" data-view="front">3/4</button><button type="button" data-view="top">TOP</button><button type="button" data-view="engrave">ENG</button>'}</div>
        <span class="hint mono">${t('pdp.drag')}</span>
      </div>
      <div class="pdp__info">
        <span class="kicker mono">${esc(L(dev))}${p.badge ? ' · ' + t('badge.' + p.badge) : ''}</span>
        <h1 class="display">${esc(L(p.name))}</h1>
        <div class="pdp__price"><span id="pdpPrice">${store.money(p.price)}</span><small id="pdpPriceNote"></small></div>
        <p class="pdp__desc">${esc(L(p.desc))}</p>

        ${!isCharm && variants.length > 1 ? `
        <div class="opt"><div class="opt__head"><b>${t('pdp.compat')}</b></div>
          <div class="seg" id="optVariant">${variants.map((v, i) => `<button type="button" class="${i ? '' : 'is-on'}" data-variant="${esc(v)}">${esc(L(dev))} ${esc(v)}</button>`).join('')}</div>
        </div>` : ''}

        <div class="opt"><div class="opt__head"><b>${isCharm ? t('pdp.metal') : t('pdp.color')}</b><span id="optColorName">${esc(L(COLORS[p.colors[0]]))}</span></div>
          <div class="swatches" id="optColor">${p.colors.map((c, i) => `<button class="swatch ${i ? '' : 'is-on'}" style="--c:${COLORS[c].hex}" data-color="${c}" aria-label="${esc(L(COLORS[c]))}" type="button"></button>`).join('')}</div>
        </div>

        ${!isCharm ? `
        <div class="opt"><div class="opt__head"><b>${t('pdp.size')}</b><span class="mono">cm</span></div>
          <div class="sizes" id="optSize">${SIZES.map((s) => `<button type="button" class="size ${s.id === 'M' ? 'is-on' : ''}" data-size="${s.id}"><b>${s.id}</b><small>${s.cm}</small></button>`).join('')}</div>
        </div>` : ''}

        ${!isCharm ? `<p class="opt__facts mono">${esc(L(MATERIAL_FACTS[p.material]))}</p>` : `<p class="opt__facts mono">${esc(L(MATERIAL_FACTS.charms))}</p>`}

        ${!isCharm ? `
        <div class="opt">
          <div class="toggle-row">
            <div><b>${t('pdp.engrave')}</b><div class="muted" style="font-size:13px">${t('pdp.engraveHint')}</div></div>
            ${p.engravingIncluded ? `<span class="mono" style="color:var(--accent)">${t('pdp.included')}</span>` : `<span class="mono muted">+${store.money(ENGRAVING_PRICE)}</span><button type="button" class="switch" role="switch" aria-checked="false" id="optEngrave" aria-label="${t('pdp.engrave')}"></button>`}
          </div>
          <div class="engrave-box" id="engBox" ${p.engravingIncluded ? '' : 'hidden'}>
            <div class="engrave-input"><input id="engText" placeholder="${esc(t('eng.placeholder'))}" autocomplete="off" /><small class="mono" id="engCount">0/${ENGRAVE_MAX}</small></div>
            <div class="symbols" id="engSymbols" aria-label="${esc(t('eng.symbols'))}">${ENGRAVING_SYMBOLS.map((c) => `<button type="button" data-sym="${c}" aria-label="${c}">${c}</button>`).join('')}</div>
            <div class="font-grid" id="engFont">${ENGRAVING_FONTS.map((f, i) => `<button type="button" class="${i ? '' : 'is-on'}" data-font="${f.id}"><span style="font-family:${f.family.replace(/"/g, "'")}">Aa</span><small>${esc(f.name)}</small></button>`).join('')}</div>
            <p class="opt__note">${t('eng.clasp')}</p>
          </div>
        </div>
        ${PRINTABLE_MATERIALS.includes(p.material) ? `
        <div class="opt">
          <div class="toggle-row">
            <div><b>${t('print.title')}</b><div class="muted" style="font-size:13px">${t('print.hint')}</div></div>
            <span class="mono muted">+${store.money(PRINT_PRICE)}</span>
          </div>
          <div class="print-designs" id="printDesigns">
            <button type="button" class="print-tile is-on" data-design="none"><span class="print-tile__none">${t('print.none')}</span><small>${t('print.none')}</small></button>
            ${PRINT_DESIGNS.map((d) => `<button type="button" class="print-tile" data-design="${d.id}"><img alt="" data-design-img="${d.id}" /><small>${esc(L(d.name))}</small></button>`).join('')}
            <label class="print-tile print-tile--upload" id="printDrop"><input type="file" accept="image/png,image/jpeg,image/webp" id="printFile" hidden /><span class="print-tile__none">${icon.upload}</span><small id="printName">${t('print.choose')}</small></label>
          </div>
          <div class="print-place" id="printPlace" hidden>
            <div class="seg" id="printMode"><button type="button" class="is-on" data-mode="wrap">${t('print.wrap')}</button><button type="button" data-mode="place">${t('print.place')}</button></div>
            <label class="range-row" id="printPosRow" hidden><span>${t('print.pos')}</span><input type="range" id="printPos" min="0.3" max="0.7" step="0.01" value="0.5" /></label>
            <label class="range-row" id="printScaleRow" hidden><span>${t('print.size')}</span><input type="range" id="printScale" min="0.4" max="1" step="0.01" value="0.9" /></label>
          </div>
          <p class="opt__note">${t('print.note')}</p>
        </div>` : ''}
        <div class="opt"><div class="opt__head"><b>${t('pdp.charms')}</b><span class="mono muted">+${store.money(CHARM_ADDON_PRICE)} / ea</span></div>
          <div class="toggle-row" style="justify-content:flex-start;flex-wrap:wrap">
            <div class="charm-toggles" id="optCharms">${['star', 'heart', 'bolt', 'disc'].map((c) => `<button type="button" class="charm-toggle" data-charm="${c}" aria-label="${c}">${charmIcon[c]}</button>`).join('')}</div>
            <div class="swatches" id="optCharmMetal">${['gold', 'silver'].map((c, i) => `<button class="swatch swatch--sm ${i ? '' : 'is-on'}" style="--c:${COLORS[c].hex}" data-metal="${c}" aria-label="${esc(L(COLORS[c]))}" type="button"></button>`).join('')}</div>
            <input class="input" id="optInitial" maxlength="1" value="N" style="width:60px;text-align:center;display:none" aria-label="${t('pdp.initial')}" />
          </div>
        </div>` : p.shape === 'disc' ? `
        <div class="opt"><div class="opt__head"><b>${t('pdp.initial')}</b></div>
          <input class="input" id="optInitial" maxlength="1" value="N" style="width:80px;text-align:center;font-size:22px" />
        </div>` : ''}

        <div class="buy-row">
          <div class="qty"><button type="button" data-q="-1" aria-label="-">−</button><span id="qty">1</span><button type="button" data-q="1" aria-label="+">+</button></div>
          <button class="btn" id="addBtn" type="button">${t('pdp.add')} — <span id="addPrice">${store.money(p.price)}</span></button>
          <button class="btn btn--ghost" id="buyBtn" type="button">${t('pdp.buy')}</button>
        </div>

        <div class="trust">
          <div>${icon.truck}<span>${getLang() === 'ar' ? 'توصيل مجاني فوق ٣٥ د.ك' : 'Free delivery over 35 KD'}</span></div>
          <div>${icon.spark}<span>${getLang() === 'ar' ? 'نقش في الكويت خلال ٢٤ ساعة' : 'Engraved in Kuwait within 24 h'}</span></div>
          <div>${icon.swap}<span>${getLang() === 'ar' ? 'استبدال خلال ١٤ يوماً' : '14-day exchange'}</span></div>
        </div>

        <div style="margin-top:28px">
          <details class="acc" open><summary>${t('pdp.details')}</summary><p>${esc(L(p.desc))}</p></details>
          <details class="acc"><summary>${t('pdp.care')}</summary><p>${t('pdp.careText')}</p></details>
          <details class="acc"><summary>${t('pdp.delivery')}</summary><p>${t('pdp.deliveryText')}</p></details>
        </div>
      </div>
    </div>

    ${perksSection(PERKS, { compact: true })}

    <div class="section" style="padding-inline:0">
      <div class="section__head"><h2 class="display h2">${t('pdp.related')}</h2></div>
      <div class="rail" id="related">${PRODUCTS.filter((x) => x.id !== p.id && (x.device === p.device || x.kind === 'charm')).slice(0, 6).map(card).join('')}</div>
    </div>
  </section>`;
}

export function mountProduct(root, { id, onQuick, openCart }) {
  const p = getProduct(id);
  if (!p) return;
  const isCharm = p.kind === 'charm';
  const st = {
    color: p.colors[0], size: 'M', variant: (p.variants || DEVICES[p.device].variants || [])[0], clasp: 'silver',
    engrave: !!p.engravingIncluded, engraving: '', font: ENGRAVING_FONTS[0].id, charms: [], charmMetal: 'gold', initial: 'N', qty: 1,
    print: null, printName: '', printMode: 'wrap', printPos: 0.5, printScale: 0.9,
  };

  const stage = new Stage($('#pdpCanvas', root), { orbit: true, distance: isCharm ? 5 : 7, shadow: !isCharm });
  let band, charm;
  if (isCharm) {
    charm = makeCharm(p.shape, st.color, st.initial);
    charm.scale.setScalar(11);
    stage.pivot.add(charm);
  } else {
    band = new Band({ device: p.device, material: p.material, color: COLORS[st.color].hex });
    band.group.rotation.set(0.4, -0.5, 0.06);
    stage.pivot.add(band.group);
  }
  stage.onFrame((dt, time) => { stage.pivot.position.y = Math.sin(time * 1.1) * 0.05; });
  stage.start();
  gsap.from(stage.pivot.scale, { x: 0.6, y: 0.6, z: 0.6, duration: 1.6, ease: 'expo.out' });
  gsap.from(stage.pivot.rotation, { y: -2, duration: 1.8, ease: 'expo.out' });

  const views = {
    front: { x: 0.4, y: -0.5, z: 0.06 },
    top: { x: 1.2, y: 0, z: 0 },
    engrave: { x: -1.15, y: 0, z: 0 },
    print: { x: 0.12, y: Math.PI / 2, z: 0 },
  };
  const setView = (v) => {
    if (!band) return;
    stage.controls.autoRotate = false;
    gsap.to(stage.camera.position, { x: 0, y: 0, z: 7, duration: 1, ease: 'expo.inOut', onUpdate: () => stage.camera.lookAt(0, 0, 0) });
    gsap.to(band.group.rotation, { ...views[v], duration: 1.2, ease: 'expo.inOut' });
  };
  root.querySelector('.views')?.addEventListener('click', (e) => { const b = e.target.closest('[data-view]'); if (b) setView(b.dataset.view); });

  const unit = () => p.price + (st.engrave && st.engraving.trim() && !p.engravingIncluded ? ENGRAVING_PRICE : 0) + st.charms.length * CHARM_ADDON_PRICE + (st.print ? PRINT_PRICE : 0);
  const refresh = () => {
    $('#pdpPrice', root).textContent = store.money(unit());
    $('#addPrice', root).textContent = store.money(unit() * st.qty);
    $('#qty', root).textContent = st.qty;
    if (band) band.set({ color: COLORS[st.color].hex, engraving: st.engrave ? st.engraving : '', font: st.font, charms: st.charms, charmMetal: st.charmMetal, initial: st.initial, print: st.print ? { img: st.print, mode: st.printMode, pos: st.printPos, scale: st.printScale } : null });
    const ini = $('#optInitial', root);
    if (ini && !isCharm) ini.style.display = st.charms.includes('disc') ? '' : 'none';
  };

  const pick = (sel, attr, fn) => $(sel, root)?.addEventListener('click', (e) => {
    const b = e.target.closest(`[data-${attr}]`); if (!b) return;
    $$(`${sel} [data-${attr}]`, root).forEach((x) => x.classList.toggle('is-on', x === b));
    fn(b.dataset[attr], b); refresh();
  });
  pick('#optColor', 'color', (c) => {
    st.color = c; $('#optColorName', root).textContent = L(COLORS[c]);
    if (charm) charm.material = makeCharm(p.shape, c, st.initial).material;
  });
  pick('#optVariant', 'variant', (v) => (st.variant = v));
  pick('#optSize', 'size', (v) => (st.size = v));
  pick('#optCharmMetal', 'metal', (v) => (st.charmMetal = v));
  pick('#engFont', 'font', (v) => (st.font = v));
  $('#optCharms', root)?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-charm]'); if (!b) return;
    b.classList.toggle('is-on');
    st.charms = $$('#optCharms .is-on', root).map((x) => x.dataset.charm);
    refresh();
  });
  $('#optInitial', root)?.addEventListener('input', (e) => {
    st.initial = (e.target.value || 'N').slice(0, 1).toUpperCase();
    if (charm) { stage.pivot.remove(charm); charm = makeCharm(p.shape, st.color, st.initial); charm.scale.setScalar(11); stage.pivot.add(charm); }
    refresh();
  });
  const sw = $('#optEngrave', root);
  sw?.addEventListener('click', () => {
    st.engrave = !st.engrave;
    sw.setAttribute('aria-checked', st.engrave);
    $('#engBox', root).hidden = !st.engrave;
    if (st.engrave) { $('#engText', root).focus(); setView('engrave'); }
    refresh();
  });
  let engViewed = false;
  // engraving: 10 characters max (symbols count as one), previewed live on the clasp
  const engText = $('#engText', root);
  const setEngraving = (v) => {
    const chars = [...v].slice(0, ENGRAVE_MAX);
    st.engraving = chars.join('');
    if (engText.value !== st.engraving) engText.value = st.engraving;
    $('#engCount', root).textContent = `${chars.length}/${ENGRAVE_MAX}`;
    if (!engViewed) { engViewed = true; setView('engrave'); }
    refresh();
  };
  engText?.addEventListener('input', () => setEngraving(engText.value));
  $('#engSymbols', root)?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sym]'); if (!b) return;
    const at = engText.selectionStart ?? engText.value.length;
    setEngraving(engText.value.slice(0, at) + b.dataset.sym + engText.value.slice(at));
    engText.focus();
  });
  pick('#engFont', 'font', (v) => { st.font = v; if (!engViewed) { engViewed = true; setView('engrave'); } });

  // printing (nylon only): pick a preset design or upload your own, then choose placement
  $$('[data-design-img]', root).forEach((img) => { img.src = designCanvas(img.dataset.designImg)?.toDataURL('image/png') || ''; });
  const printFile = $('#printFile', root);
  const syncPrintUI = () => {
    $('#printPlace', root).hidden = !st.print;
    const placed = st.printMode === 'place';
    $('#printPosRow', root).hidden = !placed;
    $('#printScaleRow', root).hidden = !placed;
    $$('#printMode [data-mode]', root).forEach((b) => b.classList.toggle('is-on', b.dataset.mode === st.printMode));
  };
  const selectTile = (el) => $$('#printDesigns .print-tile', root).forEach((x) => x.classList.toggle('is-on', x === el));
  const usePrint = (img, name, mode) => {
    st.print = img; st.printName = name; st.printMode = mode;
    syncPrintUI();
    setView(mode === 'wrap' ? 'front' : 'print');
    refresh();
  };
  $('#printDesigns', root)?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-design]'); if (!b) return;
    selectTile(b);
    if (b.dataset.design === 'none') { st.print = null; syncPrintUI(); refresh(); return; }
    const d = PRINT_DESIGNS.find((x) => x.id === b.dataset.design);
    usePrint(designCanvas(d.id), L(d.name), 'wrap');
  });
  printFile?.addEventListener('change', () => {
    const f = printFile.files?.[0]; if (!f) return;
    const img = new Image();
    img.onload = () => {
      $('#printName', root).textContent = f.name;
      selectTile($('#printDrop', root));
      usePrint(img, f.name, 'place');
    };
    img.src = URL.createObjectURL(f);
  });
  $('#printMode', root)?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-mode]'); if (!b) return;
    st.printMode = b.dataset.mode; syncPrintUI();
    setView(st.printMode === 'wrap' ? 'front' : 'print');
    refresh();
  });
  $('#printPos', root)?.addEventListener('input', (e) => { st.printPos = +e.target.value; refresh(); });
  $('#printScale', root)?.addEventListener('input', (e) => { st.printScale = +e.target.value; refresh(); });

  $('.qty', root).addEventListener('click', (e) => {
    const b = e.target.closest('[data-q]'); if (!b) return;
    st.qty = Math.max(1, Math.min(20, st.qty + +b.dataset.q)); refresh();
  });

  const add = async (btn) => {
    const item = { id: p.id, color: st.color, qty: st.qty };
    if (!isCharm) Object.assign(item, { size: st.size, variant: st.variant, charms: st.charms, charmMetal: st.charms.length ? st.charmMetal : undefined, initial: st.charms.includes('disc') ? st.initial : undefined });
    if (st.engrave && st.engraving.trim()) Object.assign(item, { engraving: st.engraving.trim(), font: st.font });
    // an uploaded image would be sent with the order once a backend exists; the cart keeps its name and placement
    if (st.print) item.print = `${st.printName} · ${t(st.printMode === 'wrap' ? 'print.wrap' : 'print.place')}`;
    if (isCharm && p.shape === 'disc') item.initial = st.initial;
    store.addToCart(item);
    const src = await thumb(thumbSpec(p, st.color));
    flyToCart(btn, src);
    toast(`${t('toast.added')} · ${productName(p)}`, src);
  };
  $('#addBtn', root).addEventListener('click', (e) => add(e.currentTarget));
  $('#buyBtn', root).addEventListener('click', async (e) => { await add(e.currentTarget); go('#/checkout'); });

  bindCards($('#related', root), onQuick);
  hydrateThumbs(root);
  reveal(root);
  refresh();
  return () => stage.dispose();
}

// ================= CHECKOUT =================
export function checkoutView() {
  const lang = getLang();
  return `
  <section class="page">
    <div class="page-head">
      <div><div class="crumbs mono"><a href="#/">NOVVO</a><span>/</span><span>${t('co.title')}</span></div><h1 class="display h1">${t('co.title')}</h1></div>
      <span class="mono muted" style="display:flex;gap:8px;align-items:center">${icon.shield.replace('<svg', '<svg width="18" stroke="currentColor"')}${t('co.secure')}</span>
    </div>
    <div class="co">
      <form id="coForm" novalidate>
        <div class="co__block">
          <h3><i>1</i>${t('co.contact')}</h3>
          <div class="fields">
            <div class="field full"><label for="f-name">${t('co.name')}</label><input class="input" id="f-name" name="name" required autocomplete="name" /></div>
            <div class="field"><label for="f-email">${t('co.email')}</label><input class="input" id="f-email" name="email" type="email" required autocomplete="email" /></div>
            <div class="field"><label for="f-phone">${t('co.phone')}</label><div class="phone"><span id="dial">+965</span><input class="input" id="f-phone" name="phone" type="tel" inputmode="tel" required autocomplete="tel-national" /></div></div>
          </div>
        </div>
        <div class="co__block">
          <h3><i>2</i>${t('co.address')}</h3>
          <div class="fields">
            <div class="field"><label for="f-country">${t('co.country')}</label>
              <select id="f-country" name="country">${Object.entries(COUNTRIES).map(([k, c]) => `<option value="${k}">${c[lang]}</option>`).join('')}</select></div>
            <div class="field"><label for="f-area">${t('co.area')}</label><input class="input" id="f-area" name="area" required autocomplete="address-level2" /></div>
            <div class="field"><label for="f-block">${t('co.block')}</label><input class="input" id="f-block" name="block" required /></div>
            <div class="field"><label for="f-street">${t('co.street')}</label><input class="input" id="f-street" name="street" required autocomplete="address-line1" /></div>
            <div class="field full"><label for="f-house">${t('co.house')}</label><input class="input" id="f-house" name="house" required autocomplete="address-line2" /></div>
            <div class="field full"><label for="f-notes">${t('co.notes')}</label><input class="input" id="f-notes" name="notes" /></div>
          </div>
        </div>
        <div class="co__block">
          <h3><i>3</i>${t('co.delivery')}</h3>
          <div class="radio-cards" id="shipOpts"></div>
        </div>
        <div class="co__block">
          <h3><i>4</i>${t('co.payment')}</h3>
          <div class="radio-cards radio-cards--2" id="payOpts">
            ${[['knet', 'K-NET'], ['card', 'VISA'], ['apple', ' Pay'], ['cod', 'COD']].map(([k, logo], i) => `
              <label class="rcard"><input type="radio" name="pay" value="${k}" ${i ? '' : 'checked'} /><span class="rcard__main"><b>${t('co.' + k)}</b></span><span class="pay-logo">${logo}</span></label>`).join('')}
          </div>
          <p class="muted" style="font-size:13px;margin:14px 0 0">${t('co.payNote')}</p>
        </div>
        <p class="form-err" id="coErr"></p>
      </form>
      <aside class="co__summary" id="coSummary"></aside>
    </div>
  </section>`;
}

export function mountCheckout(root) {
  const form = $('#coForm', root);
  const st = { promo: null, country: 'KW', express: false };
  const summary = $('#coSummary', root);

  const renderShip = () => {
    const c = COUNTRIES[st.country], lang = getLang();
    const tot = store.totals({ ...st, express: false });
    const base = tot.shipping === 0 ? t('co.free') : store.money(c.ship);
    $('#shipOpts', root).innerHTML = `
      <label class="rcard"><input type="radio" name="ship" value="std" ${st.express ? '' : 'checked'} /><span class="rcard__main"><b>${t('co.standard')}</b><small>${c.days[lang]}</small></span><span class="rcard__end">${base}</span></label>
      ${st.country === 'KW' ? `<label class="rcard"><input type="radio" name="ship" value="exp" ${st.express ? 'checked' : ''} /><span class="rcard__main"><b>${t('co.express')}</b><small>${t('co.expressNote')}</small></span><span class="rcard__end">+${store.money(c.express)}</span></label>` : ''}`;
    const cod = $('#payOpts input[value="cod"]', root);
    cod.disabled = !c.cod;
    if (cod.disabled && cod.checked) $('#payOpts input[value="knet"]', root).checked = true;
    $('#dial', root).textContent = c.dial;
  };

  const renderSummary = () => {
    const items = store.getCart();
    const tot = store.totals(st);
    summary.innerHTML = `
      <h3>${t('co.summary')}</h3>
      <div class="co__items">${items.length ? items.map((i) => {
        const p = getProduct(i.id);
        return `<div class="co__item"><div class="img">${thumbImg(thumbSpec(p, i.color))}<em>${i.qty}</em></div>
          <div><b>${esc(productName(p))}</b><small>${esc(L(COLORS[i.color]))}${i.size ? ' · ' + i.size : ''}${i.engraving ? ` · “${esc(i.engraving)}”` : ''}</small></div>
          <span class="mono">${store.money(store.unitPrice(i) * i.qty)}</span></div>`;
      }).join('') : `<p class="muted">${t('co.empty')}</p>`}</div>
      <label class="mono muted" for="promoIn">${t('co.promo')}</label>
      <div class="promo"><input class="input" id="promoIn" placeholder="${t('co.promoHint')}" value="${st.promo || ''}" /><button class="btn btn--ghost btn--sm" type="button" id="promoBtn" style="height:46px">${t('co.apply')}</button></div>
      <div class="promo-msg" id="promoMsg"></div>
      <div class="sum-row"><span>${t('cart.subtotal')}</span><b>${store.money(tot.sub)}</b></div>
      ${tot.discount ? `<div class="sum-row" style="color:var(--accent)"><span>${t('co.discount')} (${tot.promo})</span><b>−${store.money(tot.discount)}</b></div>` : ''}
      <div class="sum-row"><span>${t('co.shipping')}</span><b>${tot.shipping ? store.money(tot.shipping) : t('co.free')}</b></div>
      <div class="sum-row sum-total"><span>${t('co.total')}</span><b>${store.money(tot.total)}</b></div>
      <button class="btn btn--accent btn--block" type="submit" form="coForm" ${items.length ? '' : 'disabled'}>${t('co.place')} ${icon.arrow}</button>`;
    hydrateThumbs(summary);
    $('#promoBtn', summary).addEventListener('click', () => applyPromo($('#promoIn', summary).value));
    $('#promoIn', summary).addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); applyPromo(e.target.value); } });
  };

  const applyPromo = (code) => {
    const r = store.checkPromo(code);
    if (r.ok) st.promo = r.code;
    renderSummary(); renderShip();
    const msg = $('#promoMsg', summary);
    msg.className = 'promo-msg ' + (r.ok ? 'ok' : 'err');
    msg.textContent = r.ok ? `✓ ${t('co.promoOk')} — ${r.code}` : r.reason === 'min' ? `${t('co.promoMin')} ${store.money(r.min)}` : t('co.promoBad');
  };

  form.addEventListener('change', (e) => {
    if (e.target.name === 'country') { st.country = e.target.value; st.express = false; renderShip(); renderSummary(); }
    if (e.target.name === 'ship') { st.express = e.target.value === 'exp'; renderSummary(); }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!store.getCart().length) return;
    let ok = true;
    $$('[required]', form).forEach((inp) => {
      const bad = !inp.value.trim() || (inp.type === 'email' && !/^\S+@\S+\.\S+$/.test(inp.value)) || (inp.type === 'tel' && inp.value.replace(/\D/g, '').length < 7);
      inp.closest('.field').classList.toggle('is-err', bad);
      if (bad) ok = false;
    });
    $('#coErr', root).textContent = ok ? '' : t('co.required');
    if (!ok) { $('.is-err .input', form)?.focus(); return; }
    const fd = Object.fromEntries(new FormData(form));
    const id = store.placeOrder({
      customer: { name: fd.name, email: fd.email, phone: `${COUNTRIES[st.country].dial} ${fd.phone}`, area: fd.area, block: fd.block, street: fd.street, house: fd.house, notes: fd.notes },
      country: st.country, express: st.express, payment: fd.pay, totals: store.totals(st),
    });
    go(`#/order/${id}`);
  });

  renderShip();
  renderSummary();
  const unsub = store.subscribe(renderSummary);
  return unsub;
}

// ================= CONFIRMATION =================
export function confirmView(id) {
  const o = store.getOrder(id);
  if (!o) return `<section class="page"><h1 class="display h2">${t('tr.notFound')}</h1></section>`;
  return `
  <section class="page">
    <div class="ok-wrap">
      <div>
        <span class="kicker mono">${t('ok.number')}</span>
        <h1 class="display h1" style="margin-top:14px">${t('ok.title')}</h1>
        <p class="lead">${t('ok.sub')}</p>
        <div class="order-no"><span class="mono muted">${t('ok.number')}</span><b>${o.id}</b></div>
        <div class="hero__ctas"><a class="btn btn--accent" href="#/track/${o.id}">${t('ok.track')} ${icon.arrow}</a><a class="btn btn--ghost" href="#/shop">${t('ok.shop')}</a></div>
      </div>
      <div class="ok-stage"><canvas id="okCanvas"></canvas></div>
    </div>
  </section>`;
}

export function mountConfirm(root, { id }) {
  const o = store.getOrder(id);
  const c = $('#okCanvas', root);
  if (!o || !c) return;
  const first = o.items.find((i) => getProduct(i.id)?.kind !== 'charm') || o.items[0];
  const p = getProduct(first.id);
  const stage = new Stage(c, { distance: 6.6 });
  let obj;
  if (p.kind === 'charm') { obj = makeCharm(p.shape, first.color, first.initial || 'N'); obj.scale.setScalar(10); }
  else {
    const b = new Band({ device: p.device, material: p.material, color: COLORS[first.color].hex, engraving: first.engraving || '', charms: first.charms || [] });
    obj = b.group;
  }
  stage.pivot.add(obj);
  stage.onFrame((dt, time) => { obj.rotation.y = time * 0.6; obj.rotation.x = 0.35 + Math.sin(time * 0.7) * 0.2; });
  stage.start();
  gsap.from(stage.pivot.scale, { x: 0.2, y: 0.2, z: 0.2, duration: 1.8, ease: 'elastic.out(1, 0.55)' });
  return () => stage.dispose();
}

// ================= TRACKING =================
export function trackView(id = '') {
  return `
  <section class="page">
    <div class="page-head" style="display:block">
      <span class="kicker mono">${t('tr.kicker')}</span>
      <h1 class="display h1" style="margin-top:14px">${t('tr.title')}</h1>
      <p class="lead">${t('tr.sub')}</p>
      <form class="track-form" id="trForm">
        <input class="input" id="trIn" placeholder="${t('tr.ph')}" value="${esc(id)}" aria-label="${t('ok.number')}" />
        <button class="btn" type="submit">${t('tr.btn')} ${icon.arrow}</button>
      </form>
      <p class="mono muted" style="margin-top:12px"><button type="button" class="link-u" id="trDemo">${t('tr.demo')}</button></p>
    </div>
    <div id="trRes"></div>
  </section>`;
}

const STEP_ICONS = [icon.check, icon.card, icon.spark, icon.truck, icon.home];

export function mountTrack(root, { id }) {
  const res = $('#trRes', root);
  let timer;
  const show = (oid) => {
    const o = store.getOrder(oid);
    if (!o) { res.innerHTML = `<p class="empty">${t('tr.notFound')}</p>`; return; }
    const step = store.orderStep(o), lang = getLang();
    const fmt = (d) => d.toLocaleString(lang === 'ar' ? 'ar-KW' : 'en-GB', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
    const eta = new Date(o.created + (o.country === 'KW' ? (o.express ? 0.3 : 1.5) : 4) * 86400000);
    const circ = 2 * Math.PI * 36, pct = step / (store.STEPS.length - 1);
    res.innerHTML = `
      <div class="track-res">
        <div class="timeline">
          ${store.STEPS.map((s, i) => `
            <div class="tl-step ${i <= step ? 'done' : ''} ${i === step ? 'now' : ''}">
              <span class="tl-dot">${STEP_ICONS[i]}</span>
              <div><h4>${t('tr.' + s)}</h4>${i === 2 && o.items.some((x) => x.engraving) ? `<span class="muted" style="font-size:13px">“${esc(o.items.find((x) => x.engraving).engraving)}”</span>` : ''}</div>
              <time>${i <= step ? fmt(store.stepTime(o, i)) : '—'}</time>
            </div>`).join('')}
        </div>
        <div style="display:grid;gap:14px;align-content:start">
          <div class="panel">
            <h4>${o.id}</h4>
            <div class="progress-ring">
              <svg viewBox="0 0 84 84"><circle class="bg" cx="42" cy="42" r="36"/><circle class="fg" cx="42" cy="42" r="36" stroke-dasharray="${circ}" stroke-dashoffset="${circ}" id="ring"/></svg>
              <div><span class="mono muted">${t('tr.eta')}</span><div style="font-size:20px;font-weight:600">${eta.toLocaleDateString(lang === 'ar' ? 'ar-KW' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</div></div>
            </div>
          </div>
          <div class="panel"><h4>${t('tr.items')}</h4>
            ${o.items.map((i) => { const p = getProduct(i.id); return p ? `<div class="co__item"><div class="img">${thumbImg(thumbSpec(p, i.color))}<em>${i.qty}</em></div><div><b>${esc(productName(p))}</b><small>${esc(L(COLORS[i.color]))}${i.size ? ' · ' + i.size : ''}</small></div><span></span></div>` : ''; }).join('')}
          </div>
          <div class="panel"><h4>${t('tr.to')}</h4><div>${esc(o.customer?.name || '')}<br><span class="muted">${esc(o.customer?.area || '')}, ${COUNTRIES[o.country]?.[lang] || ''}</span></div></div>
          <p class="mono muted" style="font-size:11px">${lang === 'ar' ? 'عرض تجريبي: تتقدم الحالة تلقائياً.' : 'Demo: statuses advance automatically.'}</p>
        </div>
      </div>`;
    hydrateThumbs(res);
    gsap.from($$('.tl-step', res), { opacity: 0, x: getLang() === 'ar' ? 30 : -30, stagger: 0.1, duration: 0.8, ease: 'expo.out' });
    requestAnimationFrame(() => { const r = $('#ring', res); if (r) r.style.strokeDashoffset = circ * (1 - pct); });
  };
  $('#trForm', root).addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#trIn', root).value.trim().toUpperCase();
    history.replaceState(null, '', `#/track/${v}`);
    show(v);
    clearInterval(timer); timer = setInterval(() => show(v), 30000);
  });
  $('#trDemo', root).addEventListener('click', () => { $('#trIn', root).value = 'NV-102938'; $('#trForm', root).requestSubmit(); });
  if (id) $('#trForm', root).requestSubmit();
  return () => clearInterval(timer);
}

// ================= CONTACT =================
export function contactView() {
  return `
  <section class="page">
    <div class="contact">
      <div>
        <span class="kicker mono">${t('ct.kicker')}</span>
        <h1 class="display h1" style="margin-top:14px">${t('ct.title')}</h1>
        <p class="lead">${t('ct.sub')}</p>
        <div class="contact__cards">
          <a class="c-card" href="https://wa.me/${BRAND.whatsapp}" target="_blank" rel="noopener">${icon.chat}<div><b>${t('ct.wa')}</b><small class="mono" dir="ltr">${esc(BRAND.phone)}</small></div>${icon.arrow.replace('<svg', '<svg width="18"')}</a>
          <a class="c-card" href="https://instagram.com/${BRAND.instagram}" target="_blank" rel="noopener">${icon.ig}<div><b>${t('ct.ig')}</b><small class="mono">@${esc(BRAND.instagram)}</small></div>${icon.arrow.replace('<svg', '<svg width="18"')}</a>
          <a class="c-card" href="mailto:${BRAND.email}">${icon.mail}<div><b>${t('ct.mail')}</b><small class="mono">${esc(BRAND.email)}</small></div>${icon.arrow.replace('<svg', '<svg width="18"')}</a>
          <div class="c-card">${icon.clock}<div><b>${t('ct.hours')}</b></div></div>
        </div>
      </div>
      <form id="ctForm" novalidate>
        <div class="fields">
          <div class="field"><label for="c-name">${t('ct.name')}</label><input class="input" id="c-name" required /></div>
          <div class="field"><label for="c-email">${t('ct.email')}</label><input class="input" id="c-email" type="email" required /></div>
          <div class="field"><label for="c-phone">${t('ct.phone')}</label><input class="input" id="c-phone" type="tel" /></div>
          <div class="field"><label for="c-topic">${t('ct.topic')}</label><select id="c-topic">${[1, 2, 3, 4].map((i) => `<option>${t('ct.t' + i)}</option>`).join('')}</select></div>
          <div class="field full"><label for="c-msg">${t('ct.msg')}</label><textarea id="c-msg" required></textarea></div>
        </div>
        <button class="btn btn--accent" type="submit">${t('ct.send')} ${icon.arrow}</button>
      </form>
    </div>
    <div class="section" style="padding-inline:0">
      <div class="section__head"><h2 class="display h2">${t('ct.faq')}</h2></div>
      ${[1, 2, 3, 4].map((i) => `<details class="acc" data-reveal><summary>${t('faq.q' + i)}</summary><p>${t('faq.a' + i)}</p></details>`).join('')}
    </div>
  </section>`;
}

export function mountContact(root) {
  $('#ctForm', root).addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    let ok = true;
    $$('[required]', f).forEach((i) => {
      const bad = !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value));
      i.closest('.field').classList.toggle('is-err', bad);
      if (bad) ok = false;
    });
    if (!ok) return;
    f.reset();
    toast(t('ct.ok'));
  });
  reveal(root);
}

// ================= LEGAL (placeholder until NOVVO sends the final policies) =================
const LEGAL_SECTIONS = {
  terms: {
    en: ['Orders & pricing', 'Delivery', 'Engraving & personalisation', 'Exchanges & returns', 'Liability', 'Governing law'],
    ar: ['الطلبات والأسعار', 'التوصيل', 'النقش والتخصيص', 'الاستبدال والاسترجاع', 'المسؤولية', 'القانون المعمول به'],
  },
  privacy: {
    en: ['Information we collect', 'How we use it', 'Payments', 'Cookies', 'Your rights', 'Contact'],
    ar: ['المعلومات التي نجمعها', 'كيف نستخدمها', 'المدفوعات', 'ملفات تعريف الارتباط', 'حقوقك', 'التواصل'],
  },
};

// NOVVO's preferred returns policy (questionnaire, 28.10.2026), shown under Terms → Exchanges & returns.
const RETURNS_POLICY = {
  en: [
    'Returns and size exchanges can be requested within 14 days of receipt, with proof of purchase.',
    'Items must be unworn, unwashed, unaltered and in their original condition, with packaging and accessories.',
    'Size exchanges are subject to availability.',
    'Customised products don’t qualify for change-of-mind or incorrect-size returns once customisation has started, subject to applicable consumer rights.',
    'Confirmed manufacturing defects, incorrect products or customisation mistakes by NOVVO qualify for a replacement or refund.',
    'Normal wear, accidental damage, misuse and improper care are not covered.',
  ],
  ar: [
    'يمكن طلب الإرجاع أو استبدال المقاس خلال ١٤ يوماً من الاستلام مع إثبات الشراء.',
    'يجب أن يكون المنتج غير مستخدم وغير مغسول وغير معدّل وبحالته الأصلية مع التغليف والملحقات.',
    'استبدال المقاس حسب التوفر.',
    'لا تشمل المنتجات المخصصة الإرجاع بسبب تغيير الرأي أو المقاس الخاطئ بعد بدء التخصيص، مع مراعاة حقوق المستهلك المعمول بها.',
    'عيوب التصنيع المؤكدة أو المنتجات الخاطئة أو أخطاء التخصيص من NOVVO تستحق الاستبدال أو الاسترداد.',
    'لا يشمل الضمان الاستهلاك العادي أو الأضرار العرضية أو سوء الاستخدام أو العناية غير الصحيحة.',
  ],
};

export function legalView(kind) {
  const lang = getLang();
  const title = t(kind === 'terms' ? 'legal.terms' : 'legal.privacy');
  return `
  <section class="page legal">
    <div class="page-head" style="display:block">
      <div class="crumbs mono"><a href="#/">NOVVO</a><span>/</span><span>${esc(title)}</span></div>
      <h1 class="display h1">${esc(title)}</h1>
      <p class="mono muted" style="margin-top:14px">${t('legal.updated')}: —</p>
    </div>
    <div class="legal__body">
      <p class="legal__pending">${t('legal.pending')}</p>
      ${LEGAL_SECTIONS[kind][lang].map((h, i) => `<section><h2>${i + 1}. ${esc(h)}</h2>${kind === 'terms' && i === 3
        ? `<ul class="legal__list">${RETURNS_POLICY[lang].map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
        : '<p class="muted">—</p>'}</section>`).join('')}
      <p><a class="arrow-l link-u" href="#/contact">${icon.arrow}${t('legal.contact')}</a></p>
    </div>
  </section>`;
}
