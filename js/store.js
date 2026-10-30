// Cart, currency, promo and order state, persisted to localStorage.
import { CURRENCIES, PROMOS, COUNTRIES, FREE_SHIPPING_MIN, ENGRAVING_PRICE, CHARM_ADDON_PRICE, PRINT_PRICE, getProduct } from './data.js';
import { getLang } from './i18n.js';

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const listeners = new Set();
export const subscribe = (fn) => (listeners.add(fn), () => listeners.delete(fn));
const emit = () => listeners.forEach((f) => f());

// ---------- currency ----------
let currency = read('novvo.currency', 'KWD');
export const getCurrency = () => currency;
export function setCurrency(c) { currency = c; write('novvo.currency', c); emit(); }

export function money(kwd) {
  const c = CURRENCIES[currency];
  const v = (kwd * c.rate).toFixed(c.dec);
  return getLang() === 'ar' ? `${v} ${c.ar}` : `${v} ${c.en}`;
}

// ---------- cart ----------
let cart = read('novvo.cart', []);
const save = () => { write('novvo.cart', cart); emit(); };

export function unitPrice(item) {
  const p = getProduct(item.id);
  if (!p) return 0;
  let price = p.price;
  if (item.engraving && !p.engravingIncluded) price += ENGRAVING_PRICE;
  price += (item.charms?.length || 0) * CHARM_ADDON_PRICE;
  if (item.print) price += PRINT_PRICE;
  return price;
}

export const getCart = () => cart;
export const cartCount = () => cart.reduce((n, i) => n + i.qty, 0);
export const subtotal = () => cart.reduce((s, i) => s + unitPrice(i) * i.qty, 0);

export function addToCart(item) {
  const key = JSON.stringify([item.id, item.color, item.size, item.variant, item.clasp, item.engraving, item.font, item.charms, item.charmMetal, item.initial, item.print]);
  const existing = cart.find((i) => i.key === key);
  if (existing) existing.qty += item.qty || 1;
  else cart.push({ ...item, key, qty: item.qty || 1 });
  save();
}
export function setQty(key, qty) {
  const it = cart.find((i) => i.key === key);
  if (!it) return;
  it.qty = Math.max(0, Math.min(20, qty));
  if (!it.qty) cart = cart.filter((i) => i.key !== key);
  save();
}
export function removeItem(key) { cart = cart.filter((i) => i.key !== key); save(); }
export function clearCart() { cart = []; save(); }

// ---------- promo / totals ----------
export function checkPromo(code, sub = subtotal()) {
  const c = (code || '').trim().toUpperCase();
  const p = PROMOS[c];
  if (!p) return { ok: false, reason: 'bad' };
  if (p.min && sub < p.min) return { ok: false, reason: 'min', min: p.min };
  return { ok: true, code: c, ...p };
}

export function totals({ promo, country = 'KW', express = false } = {}) {
  const sub = subtotal();
  const pr = promo ? checkPromo(promo, sub) : null;
  let discount = 0;
  if (pr?.ok && pr.type === 'pct') discount = +(sub * pr.value / 100).toFixed(3);
  if (pr?.ok && pr.type === 'fixed') discount = Math.min(pr.value, sub);
  const cty = COUNTRIES[country] || COUNTRIES.KW;
  let shipping = sub - discount >= FREE_SHIPPING_MIN || (pr?.ok && pr.type === 'ship') ? 0 : cty.ship;
  if (express && country === 'KW') shipping += cty.express;
  if (!cart.length) shipping = 0;
  return { sub, discount, shipping, total: Math.max(0, sub - discount + shipping), promo: pr?.ok ? pr.code : null };
}

// ---------- orders ----------
let orders = read('novvo.orders', {});

// The demo order is re-seeded on every load so it always shows a mid-journey status.
function seedDemo() {
  orders['NV-102938'] = {
    id: 'NV-102938', demo: true, created: Date.now() - 4 * 60 * 1000,
    items: [{ id: 'whoop-classic', color: 'aqua', size: 'M', qty: 1, engraving: 'SARA', charms: [] }],
    customer: { name: 'Demo Customer', area: 'Salmiya' }, country: 'KW', express: false,
    totals: { sub: 12, discount: 0, shipping: 2, total: 14 },
  };
  write('novvo.orders', orders);
}
seedDemo();

export function placeOrder(data) {
  let id;
  do { id = 'NV-' + Math.floor(100000 + Math.random() * 900000); } while (orders[id]);
  orders[id] = { id, created: Date.now(), items: cart.map(({ key, ...i }) => i), ...data };
  write('novvo.orders', orders);
  clearCart();
  return id;
}

export const getOrder = (id) => orders[(id || '').trim().toUpperCase()];

// Statuses advance with elapsed time so tracking can be demonstrated without a backend.
export const STEPS = ['placed', 'confirmed', 'crafting', 'out', 'delivered'];
const STEP_MIN = [0, 1, 3, 6, 10];
export function orderStep(order) {
  const mins = (Date.now() - order.created) / 60000;
  let s = 0;
  STEP_MIN.forEach((m, i) => { if (mins >= m) s = i; });
  return s;
}
export function stepTime(order, i) { return new Date(order.created + STEP_MIN[i] * 60000); }
