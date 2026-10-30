// Floating contact features: WhatsApp on one side, an automated assistant on the other.
// The assistant is rule-based (no backend): it answers common questions from the copy in
// i18n.js, looks up orders by number, and hands off to WhatsApp for anything else.
import { t, getLang } from './i18n.js';
import { BRAND } from './data.js';
import * as store from './store.js';
import { $, esc, icon, logo } from './ui.js';

const TOPICS = ['track', 'size', 'ship', 'eng', 'ret', 'human'];
const INTENTS = [
  ['thanks', /thank|شكر/i],
  ['track', /track|order|where|status|تتبع|طلب|وين/i],
  ['size', /size|fit|wrist|\bcm\b|مقاس|معصم/i],
  ['ship', /deliver|ship|cost|fee|free|توصيل|شحن/i],
  ['eng', /engrav|name|print|font|نقش|اسم|طباعة|خط/i],
  ['ret', /return|exchange|refund|استرجاع|استبدال/i],
  ['human', /human|person|agent|whatsapp|call|talk|موظف|واتساب|اتصال/i],
  ['hello', /^\s*(hi|hello|hey|salam|السلام|مرحب|اهلا|أهلا|هلا)/i],
];

let root, log, input, open = false;

const waLink = (text = '') => `https://wa.me/${BRAND.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

function render() {
  root.innerHTML = `
    <a class="support-wa" href="${waLink(t('wa.msg'))}" target="_blank" rel="noopener" aria-label="${esc(t('wa.label'))}">
      ${icon.wa}<span class="support-wa__label">${t('wa.label')}</span>
    </a>
    <div class="support-bot" data-open="false">
      <div class="support-panel" role="dialog" aria-label="${esc(t('bot.name'))}" aria-hidden="true">
        <header class="support-panel__head">
          <span class="support-panel__avatar">${logo()}</span>
          <div><b>${t('bot.name')}</b><small><i></i>${t('bot.status')}</small></div>
          <button type="button" class="support-panel__x" data-close aria-label="${esc(t('bot.close'))}">${icon.close}</button>
        </header>
        <div class="support-panel__log" id="botLog" aria-live="polite"></div>
        <form class="support-panel__form" id="botForm">
          <input id="botInput" autocomplete="off" placeholder="${esc(t('bot.ph'))}" aria-label="${esc(t('bot.ph'))}" />
          <button type="submit" aria-label="Send">${icon.send}</button>
        </form>
      </div>
      <button type="button" class="support-bot__launch" data-toggle aria-label="${esc(t('bot.open'))}" aria-expanded="false">
        <span class="i-open">${icon.bot}</span><span class="i-close">${icon.close}</span>
      </button>
    </div>`;
  log = $('#botLog', root);
  input = $('#botInput', root);
  greet();
}

function bubble(html, who = 'bot') {
  const el = document.createElement('div');
  el.className = `msg msg--${who}`;
  el.innerHTML = html;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
  return el;
}

function chips(list = TOPICS) {
  const el = bubble(list.map((k) => `<button type="button" class="chip-btn" data-topic="${k}">${t('bot.q.' + k)}</button>`).join(''), 'chips');
  return el;
}

// Short typing pause so replies feel conversational.
function reply(html, { withChips = true, extra = '' } = {}) {
  const typing = bubble('<span class="dots"><i></i><i></i><i></i></span>', 'bot typing');
  setTimeout(() => {
    typing.remove();
    bubble(html + extra);
    if (withChips) chips();
  }, 550);
}

function greet() {
  log.innerHTML = '';
  bubble(esc(t('bot.hi')));
  chips();
}

function trackAnswer(id) {
  const o = store.getOrder(id);
  if (!o) return esc(t('bot.a.trackNo').replace('{id}', id));
  const lang = getLang();
  const status = t('tr.' + store.STEPS[store.orderStep(o)]);
  const days = o.country === 'KW' ? (o.express ? 0.3 : 1.5) : 4;
  const eta = new Date(o.created + days * 86400000).toLocaleDateString(lang === 'ar' ? 'ar-KW' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  return esc(t('bot.a.trackOk').replace('{id}', o.id).replace('{status}', status).replace('{eta}', eta)) +
    `<br><a class="msg__link" href="#/track/${o.id}">${t('ok.track')} →</a>`;
}

function answer(topic) {
  if (topic === 'human') {
    reply(esc(t('bot.a.human')), { extra: `<br><a class="msg__wa" href="${waLink(t('wa.msg'))}" target="_blank" rel="noopener">${icon.wa}${t('bot.wa')}</a>` });
    return;
  }
  reply(esc(t('bot.a.' + topic)), { withChips: topic !== 'track' });
}

function handleText(text) {
  const id = (text.match(/NV-?\d{6}/i) || [])[0];
  if (id) { reply(trackAnswer(id.toUpperCase().replace(/^NV-?/, 'NV-'))); return; }
  const hit = INTENTS.find(([, re]) => re.test(text));
  if (hit) answer(hit[0]);
  else reply(esc(t('bot.a.fallback')), { extra: `<br><a class="msg__wa" href="${waLink(text)}" target="_blank" rel="noopener">${icon.wa}${t('bot.wa')}</a>` });
}

function setOpen(v) {
  open = v;
  const bot = $('.support-bot', root);
  bot.dataset.open = v;
  $('.support-panel', root).setAttribute('aria-hidden', !v);
  $('[data-toggle]', root).setAttribute('aria-expanded', v);
  if (v) setTimeout(() => input.focus(), 250);
}

export function mountSupport() {
  root = document.createElement('div');
  root.className = 'support';
  document.body.appendChild(root);
  render();
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-toggle]')) setOpen(!open);
    if (e.target.closest('[data-close]')) setOpen(false);
    const chip = e.target.closest('[data-topic]');
    if (chip) {
      bubble(esc(chip.textContent), 'user');
      chip.closest('.msg--chips')?.remove();
      answer(chip.dataset.topic);
    }
    if (e.target.closest('.msg__link')) setOpen(false);
  });
  root.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    log.querySelectorAll('.msg--chips').forEach((c) => c.remove());
    bubble(esc(text), 'user');
    handleText(text);
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) setOpen(false); });
}

// Re-render labels after a language switch (the conversation restarts).
export function refreshSupport() {
  if (!root) return;
  const wasOpen = open;
  render();
  setOpen(wasOpen);
}

