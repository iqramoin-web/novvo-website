// Catalogue, pricing and region data. Prices are in KWD (base currency).

export const COLORS = {
  onyx:    { hex: '#1c1d20', en: 'Onyx',        ar: 'أسود أونيكس' },
  bone:    { hex: '#e6dfd2', en: 'Bone',        ar: 'عاجي' },
  aqua:    { hex: '#4f9fc4', en: 'Aqua Blue',   ar: 'أزرق مائي' },
  ember:   { hex: '#e5622a', en: 'Ember',       ar: 'برتقالي جمري' },
  sage:    { hex: '#8ea48a', en: 'Sage',        ar: 'أخضر مريمي' },
  lilac:   { hex: '#b4a0d4', en: 'Lilac',       ar: 'ليلكي' },
  sand:    { hex: '#cdb38e', en: 'Desert Sand', ar: 'رملي' },
  navy:    { hex: '#1e2943', en: 'Midnight',    ar: 'كحلي' },
  cognac:  { hex: '#8a4a28', en: 'Cognac',      ar: 'كونياك' },
  blush:   { hex: '#e8b6ad', en: 'Blush',       ar: 'وردي' },
  mint:    { hex: '#7dffcf', en: 'Volt Mint',   ar: 'نعناعي' },
  crimson: { hex: '#9c1b30', en: 'Crimson',     ar: 'قرمزي' },
  olive:   { hex: '#5a5f3b', en: 'Olive',       ar: 'زيتي' },
  slate:   { hex: '#6a7380', en: 'Slate',       ar: 'رمادي أردوازي' },
  gold:    { hex: '#d6b06a', en: 'Gold',        ar: 'ذهبي' },
  silver:  { hex: '#cfd3d7', en: 'Silver',      ar: 'فضي' },
  rose:    { hex: '#d79e88', en: 'Rose Gold',   ar: 'ذهبي وردي' },
};

export const MATERIALS = {
  silicone:  { en: 'Silicone',    ar: 'سيليكون' },
  nylon:     { en: 'Nylon Weave', ar: 'نايلون منسوج' },
  leather:   { en: 'Leather',     ar: 'جلد' },
  sportflex: { en: 'Sport Flex',  ar: 'سبورت فليكس' },
};

export const DEVICES = {
  whoop:  { en: 'WHOOP',        ar: 'WHOOP',        variants: ['5.0 · MG · ONE · PEAK', '4.0'] },
  garmin: { en: 'Garmin Cirqa', ar: 'Garmin Cirqa', variants: ['Cirqa'] },
  fitbit: { en: 'Fitbit Air',   ar: 'Fitbit Air',   variants: ['Air'] },
  charms: { en: 'Charms',       ar: 'تعليقات' },
};

export const SIZES = [
  { id: 'S', cm: '13–16' },
  { id: 'M', cm: '16–19' },
  { id: 'L', cm: '19–22' },
];

export const ENGRAVING_PRICE = 2;
export const CHARM_ADDON_PRICE = 3;
export const FREE_SHIPPING_MIN = 35;

export const PRODUCTS = [
  { id: 'whoop-classic', device: 'whoop', material: 'nylon', price: 10, featured: true, badge: 'best',
    colors: ['aqua', 'bone', 'ember', 'onyx', 'sage', 'lilac'],
    name: { en: 'Classic Loop', ar: 'كلاسيك لوب' },
    desc: { en: 'A breathable, hook-and-loop nylon weave with a metal clasp. The everyday WHOOP strap that disappears on your wrist.',
            ar: 'نسيج نايلون قابل للتهوية بإغلاق لاصق ومشبك معدني. الحزام اليومي لـ WHOOP الذي تنساه على معصمك.' } },
  { id: 'whoop-silicone', device: 'whoop', material: 'silicone', price: 8, featured: true,
    colors: ['onyx', 'bone', 'mint', 'crimson', 'navy', 'blush'],
    name: { en: 'Silicone Sport', ar: 'سيليكون سبورت' },
    desc: { en: 'Medical-grade silicone that shrugs off sweat, chlorine and sand. Built for training days and long swims.',
            ar: 'سيليكون طبي مقاوم للعرق والكلور والرمل. مصمم لأيام التمرين والسباحة الطويلة.' } },
  { id: 'whoop-leather', device: 'whoop', material: 'leather', price: 15, featured: true, badge: 'new',
    colors: ['cognac', 'onyx', 'sand', 'navy'],
    name: { en: 'Leather Luxe', ar: 'جلد لوكس' },
    desc: { en: 'Full-grain leather with contrast hand-finished stitching. From the boardroom to the diwaniya.',
            ar: 'جلد طبيعي بخياطة يدوية متباينة. من الاجتماعات إلى الديوانية.' } },
  { id: 'whoop-sportflex', device: 'whoop', material: 'sportflex', price: 9,
    colors: ['onyx', 'ember', 'slate', 'mint', 'bone'],
    name: { en: 'Sport Flex', ar: 'سبورت فليكس' },
    desc: { en: 'Perforated flex rubber that vents heat during high-strain sessions. Light, fast, locked in.',
            ar: 'مطاط مرن مثقّب يطرد الحرارة أثناء الجهد العالي. خفيف وسريع وثابت.' } },
  { id: 'whoop-biceps', device: 'whoop', material: 'nylon', price: 12, variants: ['5.0 · MG · ONE · PEAK'],
    colors: ['onyx', 'slate', 'aqua'],
    name: { en: 'Biceps Band', ar: 'حزام العضلة' },
    desc: { en: 'Extra-long weave sized for the upper arm, for cleaner heart-rate data while you lift.',
            ar: 'نسيج طويل مصمم للعضد لقراءات نبض أدق أثناء رفع الأثقال.' } },
  { id: 'whoop-custom', device: 'whoop', material: 'silicone', price: 18, featured: true, badge: 'custom', engravingIncluded: true,
    colors: ['onyx', 'bone', 'sand', 'navy', 'crimson'],
    name: { en: 'Custom Edition', ar: 'الإصدار المخصص' },
    desc: { en: 'Your name, your logo, your date. Laser-engraved in Kuwait and delivered in a NOVVO gift box.',
            ar: 'اسمك، شعارك، تاريخك. نقش بالليزر في الكويت ويُسلّم في علبة هدايا NOVVO.' } },
  { id: 'garmin-classic', device: 'garmin', material: 'nylon', price: 10, featured: true,
    colors: ['sand', 'olive', 'onyx', 'lilac'],
    name: { en: 'Classic Loop', ar: 'كلاسيك لوب' },
    desc: { en: 'Soft nylon weave cut precisely for the Garmin Cirqa pod. Quick-adjust, all-day comfort.',
            ar: 'نسيج نايلون ناعم مقصوص بدقة لجهاز Garmin Cirqa. تعديل سريع وراحة طوال اليوم.' } },
  { id: 'garmin-silicone', device: 'garmin', material: 'silicone', price: 8,
    colors: ['onyx', 'bone', 'sage', 'ember'],
    name: { en: 'Silicone Sport', ar: 'سيليكون سبورت' },
    desc: { en: 'Waterproof silicone for the Cirqa. Rinse, dry, repeat.',
            ar: 'سيليكون مقاوم للماء لجهاز Cirqa. اشطفه، جففه، كرر.' } },
  { id: 'garmin-leather', device: 'garmin', material: 'leather', price: 15,
    colors: ['cognac', 'onyx', 'sand'],
    name: { en: 'Leather Luxe', ar: 'جلد لوكس' },
    desc: { en: 'Full-grain leather for the Cirqa with tonal stitching.',
            ar: 'جلد طبيعي لجهاز Cirqa بخياطة متناسقة.' } },
  { id: 'fitbit-classic', device: 'fitbit', material: 'nylon', price: 10, featured: true, badge: 'new',
    colors: ['blush', 'aqua', 'bone', 'onyx'],
    name: { en: 'Classic Loop', ar: 'كلاسيك لوب' },
    desc: { en: 'A featherweight weave for the screenless Fitbit Air. Barely there, always on.',
            ar: 'نسيج خفيف كالريشة لجهاز Fitbit Air بدون شاشة. بالكاد تشعر به، ويعمل دائماً.' } },
  { id: 'fitbit-silicone', device: 'fitbit', material: 'silicone', price: 8,
    colors: ['onyx', 'lilac', 'mint', 'bone'],
    name: { en: 'Silicone Sport', ar: 'سيليكون سبورت' },
    desc: { en: 'Smooth silicone for the Fitbit Air with a low-profile pin closure.',
            ar: 'سيليكون ناعم لجهاز Fitbit Air بإغلاق منخفض.' } },
  { id: 'fitbit-sportflex', device: 'fitbit', material: 'sportflex', price: 9,
    colors: ['slate', 'ember', 'onyx'],
    name: { en: 'Sport Flex', ar: 'سبورت فليكس' },
    desc: { en: 'Ventilated flex rubber for the Fitbit Air.',
            ar: 'مطاط مرن مهوّى لجهاز Fitbit Air.' } },
  { id: 'charm-star', device: 'charms', kind: 'charm', shape: 'star', price: 3, colors: ['gold', 'silver', 'rose'],
    name: { en: 'Star Charm', ar: 'تعليقة نجمة' },
    desc: { en: 'Clips onto any NOVVO strap. Stainless steel, PVD-coated.', ar: 'تُثبّت على أي حزام من NOVVO. ستانلس ستيل بطلاء PVD.' } },
  { id: 'charm-heart', device: 'charms', kind: 'charm', shape: 'heart', price: 3, colors: ['gold', 'silver', 'rose'],
    name: { en: 'Heart Charm', ar: 'تعليقة قلب' },
    desc: { en: 'Clips onto any NOVVO strap. Stainless steel, PVD-coated.', ar: 'تُثبّت على أي حزام من NOVVO. ستانلس ستيل بطلاء PVD.' } },
  { id: 'charm-bolt', device: 'charms', kind: 'charm', shape: 'bolt', price: 3, colors: ['gold', 'silver', 'rose'],
    name: { en: 'Bolt Charm', ar: 'تعليقة برق' },
    desc: { en: 'Clips onto any NOVVO strap. Stainless steel, PVD-coated.', ar: 'تُثبّت على أي حزام من NOVVO. ستانلس ستيل بطلاء PVD.' } },
  { id: 'charm-initial', device: 'charms', kind: 'charm', shape: 'disc', price: 4, colors: ['gold', 'silver', 'rose'],
    name: { en: 'Initial Charm', ar: 'تعليقة الحرف' },
    desc: { en: 'A polished disc engraved with your initial.', ar: 'قرص مصقول منقوش بالحرف الأول من اسمك.' } },
];

export const CHARM_SHAPES = ['star', 'heart', 'bolt', 'disc'];

export const PROMOS = {
  NOVVO10:   { type: 'pct', value: 10 },
  WELCOME15: { type: 'pct', value: 15 },
  FREESHIP:  { type: 'ship' },
  GCC5:      { type: 'fixed', value: 5, min: 25 },
};

export const COUNTRIES = {
  KW: { en: 'Kuwait',       ar: 'الكويت',     dial: '+965', ship: 2, express: 1.5, days: { en: '24–48 h', ar: '٢٤–٤٨ ساعة' }, cod: true },
  SA: { en: 'Saudi Arabia', ar: 'السعودية',   dial: '+966', ship: 5, days: { en: '3–5 days', ar: '٣–٥ أيام' } },
  AE: { en: 'UAE',          ar: 'الإمارات',   dial: '+971', ship: 5, days: { en: '3–5 days', ar: '٣–٥ أيام' } },
  QA: { en: 'Qatar',        ar: 'قطر',        dial: '+974', ship: 5, days: { en: '3–5 days', ar: '٣–٥ أيام' } },
  BH: { en: 'Bahrain',      ar: 'البحرين',    dial: '+973', ship: 4, days: { en: '2–4 days', ar: '٢–٤ أيام' } },
  OM: { en: 'Oman',         ar: 'عُمان',      dial: '+968', ship: 5, days: { en: '3–5 days', ar: '٣–٥ أيام' } },
};

// Indicative conversion rates from 1 KWD.
export const CURRENCIES = {
  KWD: { rate: 1,     dec: 3, en: 'KD',  ar: 'د.ك' },
  SAR: { rate: 12.2,  dec: 2, en: 'SAR', ar: 'ر.س' },
  AED: { rate: 11.95, dec: 2, en: 'AED', ar: 'د.إ' },
  QAR: { rate: 11.85, dec: 2, en: 'QAR', ar: 'ر.ق' },
  BHD: { rate: 1.226, dec: 3, en: 'BHD', ar: 'د.ب' },
  OMR: { rate: 1.253, dec: 3, en: 'OMR', ar: 'ر.ع' },
};

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id);

// ---------- Brand details ----------
// PLACEHOLDERS: replace once NOVVO confirms inception year, phone, Instagram and address.
export const BRAND = {
  since: null,                         // e.g. 2023; shown as "20XX" until confirmed
  phone: '+965 XXXX XXXX',
  phoneHref: 'tel:+96500000000',
  whatsapp: '96500000000',             // digits only, used for wa.me links
  instagram: 'ordernovvo',
  email: 'hello@ordernovvo.com',
  address: {
    en: 'Block X, Street X, Building X, Kuwait City, Kuwait',
    ar: 'قطعة X، شارع X، مبنى X، مدينة الكويت، الكويت',
  },
};

// ---------- Engraving & printing ----------
// PLACEHOLDERS pending confirmation from Joel (fonts offered, Arabic support, printable materials).
export const ENGRAVING_FONTS = {
  en: [
    { id: 'sans', family: '"Inter Tight", sans-serif', weight: 700, upper: true, label: { en: 'Modern', ar: 'عصري' } },
    { id: 'serif', family: '"Instrument Serif", serif', weight: 400, label: { en: 'Classic', ar: 'كلاسيكي' } },
    { id: 'mono', family: '"JetBrains Mono", monospace', weight: 500, upper: true, label: { en: 'Technical', ar: 'تقني' } },
  ],
  ar: [
    { id: 'ar-plex', family: '"IBM Plex Sans Arabic", sans-serif', weight: 700, label: { en: 'Modern', ar: 'عصري' } },
    { id: 'ar-naskh', family: '"Amiri", serif', weight: 700, label: { en: 'Naskh', ar: 'نسخ' } },
    { id: 'ar-kufi', family: '"Reem Kufi", sans-serif', weight: 600, label: { en: 'Kufi', ar: 'كوفي' } },
  ],
};
export const isArabic = (s) => /[؀-ۿ]/.test(s || '');
export const fontFor = (id, text) => {
  const set = isArabic(text) ? ENGRAVING_FONTS.ar : ENGRAVING_FONTS.en;
  return set.find((f) => f.id === id) || set[0];
};
export const PRINTABLE_MATERIALS = ['silicone', 'sportflex'];
export const PRINT_PRICE = 3;

// ---------- Product perks ----------
// PLACEHOLDERS until the factory questionnaire comes back.
export const PERKS = [
  { icon: 'drop',    t: { en: 'Sweat & water resistant', ar: 'مقاوم للعرق والماء' }, d: { en: 'Built for training, swimming and Gulf summers.', ar: 'مصمم للتمارين والسباحة وصيف الخليج.' } },
  { icon: 'leaf',    t: { en: 'Skin-friendly', ar: 'لطيف على البشرة' }, d: { en: 'Hypoallergenic, latex-free materials for all-day wear.', ar: 'خامات مضادة للحساسية وخالية من اللاتكس للارتداء طوال اليوم.' } },
  { icon: 'wind',    t: { en: 'Breathable', ar: 'قابل للتهوية' }, d: { en: 'Airy weaves keep your wrist cool and dry.', ar: 'نسيج متجدد الهواء يحافظ على برودة وجفاف معصمك.' } },
  { icon: 'lock',    t: { en: 'Secure fit', ar: 'ثبات محكم' }, d: { en: 'Cut for each pod so it clicks in and never slips.', ar: 'مقصوص لكل جهاز ليثبت بإحكام ولا ينزلق.' } },
  { icon: 'shield',  t: { en: 'Built to last', ar: 'متين ويدوم' }, d: { en: 'Colourfast fibres and reinforced edges.', ar: 'ألياف ثابتة اللون وحواف مقوّاة.' } },
  { icon: 'sun',     t: { en: 'Quick-dry', ar: 'سريع الجفاف' }, d: { en: 'Dries fast after a workout or a swim.', ar: 'يجف بسرعة بعد التمرين أو السباحة.' } },
];
