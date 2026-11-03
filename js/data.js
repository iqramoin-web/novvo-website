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
    desc: { en: 'A breathable 100% nylon weave with a 316L stainless steel clasp. The everyday WHOOP strap, comfortable from morning to night.',
            ar: 'نسيج نايلون ١٠٠٪ قابل للتهوية مع مشبك من الستانلس ستيل 316L. حزام WHOOP اليومي، مريح من الصباح حتى المساء.' } },
  { id: 'whoop-silicone', device: 'whoop', material: 'silicone', price: 8, featured: true,
    colors: ['onyx', 'bone', 'mint', 'crimson', 'navy', 'blush'],
    name: { en: 'Silicone Sport', ar: 'سيليكون سبورت' },
    desc: { en: '100% silicone that keeps its shape and colour with everyday wear. Made for training days and Gulf summers.',
            ar: 'سيليكون ١٠٠٪ يحافظ على شكله ولونه مع الاستخدام اليومي. مصمم لأيام التمرين وصيف الخليج.' } },
  { id: 'whoop-leather', device: 'whoop', material: 'leather', price: 15, featured: true, badge: 'new',
    colors: ['cognac', 'onyx', 'sand', 'navy'],
    name: { en: 'Leather Luxe', ar: 'جلد لوكس' },
    desc: { en: 'Full leather with contrast stitching and zinc-alloy hardware. From the boardroom to the diwaniya.',
            ar: 'جلد كامل بخياطة متباينة وقطع معدنية من سبيكة الزنك. من الاجتماعات إلى الديوانية.' } },
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
    desc: { en: 'Soft 100% nylon weave cut precisely for the Garmin Cirqa pod. Quick-adjust, all-day comfort.',
            ar: 'نسيج نايلون ناعم مقصوص بدقة لجهاز Garmin Cirqa. تعديل سريع وراحة طوال اليوم.' } },
  { id: 'garmin-silicone', device: 'garmin', material: 'silicone', price: 8,
    colors: ['onyx', 'bone', 'sage', 'ember'],
    name: { en: 'Silicone Sport', ar: 'سيليكون سبورت' },
    desc: { en: '100% silicone cut for the Garmin Cirqa, made to handle GCC heat and humidity.',
            ar: 'سيليكون ١٠٠٪ مقصوص لجهاز Garmin Cirqa، مصمم لتحمّل حرارة ورطوبة الخليج.' } },
  { id: 'garmin-leather', device: 'garmin', material: 'leather', price: 15,
    colors: ['cognac', 'onyx', 'sand'],
    name: { en: 'Leather Luxe', ar: 'جلد لوكس' },
    desc: { en: 'Full leather for the Cirqa with tonal stitching and zinc-alloy hardware.',
            ar: 'جلد كامل لجهاز Cirqa بخياطة متناسقة وقطع معدنية من سبيكة الزنك.' } },
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
  { id: 'charm-star', device: 'charms', kind: 'charm', shape: 'star', price: 3, colors: ['gold', 'silver'],
    name: { en: 'Star Charm', ar: 'تعليقة نجمة' },
    desc: { en: 'Clips onto any NOVVO strap. Copper with gold or silver plating and Czech-style rhinestones.', ar: 'تُثبّت على أي حزام من NOVVO. نحاس مطلي بالذهب أو الفضة مع أحجار راين ستون بأسلوب تشيكي.' } },
  { id: 'charm-heart', device: 'charms', kind: 'charm', shape: 'heart', price: 3, colors: ['gold', 'silver'],
    name: { en: 'Heart Charm', ar: 'تعليقة قلب' },
    desc: { en: 'Clips onto any NOVVO strap. Copper with gold or silver plating and Czech-style rhinestones.', ar: 'تُثبّت على أي حزام من NOVVO. نحاس مطلي بالذهب أو الفضة مع أحجار راين ستون بأسلوب تشيكي.' } },
  { id: 'charm-bolt', device: 'charms', kind: 'charm', shape: 'bolt', price: 3, colors: ['gold', 'silver'],
    name: { en: 'Bolt Charm', ar: 'تعليقة برق' },
    desc: { en: 'Clips onto any NOVVO strap. Copper with gold or silver plating and Czech-style rhinestones.', ar: 'تُثبّت على أي حزام من NOVVO. نحاس مطلي بالذهب أو الفضة مع أحجار راين ستون بأسلوب تشيكي.' } },
  { id: 'charm-initial', device: 'charms', kind: 'charm', shape: 'disc', price: 4, colors: ['gold', 'silver'],
    name: { en: 'Initial Charm', ar: 'تعليقة الحرف' },
    desc: { en: 'A gold- or silver-plated copper disc engraved with your initial.', ar: 'قرص نحاسي مطلي بالذهب أو الفضة منقوش بالحرف الأول من اسمك.' } },
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
// Confirmed by NOVVO (Nov 2026). Instagram handle and email still to be confirmed.
export const BRAND = {
  since: 2025,
  phone: '+965 6075 5440',
  phoneHref: 'tel:+96560755440',
  whatsapp: '96560755440',             // digits only, used for wa.me links (assumed same as phone)
  instagram: 'ordernovvo',
  email: 'hello@ordernovvo.com',
  // Home-business licence: this is a residential address
  address: {
    en: 'Mubarak Al Abdullah, Block 3, Street 301, Plot 584, Hawalli Governorate, Kuwait',
    ar: 'مبارك العبدالله، قطعة ٣، شارع ٣٠١، قسيمة ٥٨٤، محافظة حولي، الكويت',
  },
};

// ---------- Materials (from the product & material questionnaire, 28.10.2026) ----------
export const MATERIAL_FACTS = {
  nylon:    { en: '100% nylon · 316L stainless steel clasp', ar: 'نايلون ١٠٠٪ · مشبك ستانلس ستيل 316L' },
  silicone: { en: '100% silicone · 316L stainless steel clasp', ar: 'سيليكون ١٠٠٪ · مشبك ستانلس ستيل 316L' },
  leather:  { en: 'Full leather · zinc-alloy hardware', ar: 'جلد كامل · قطع معدنية من سبيكة الزنك' },
  sportflex:{ en: 'Sport flex · 316L stainless steel clasp', ar: 'سبورت فليكس · مشبك ستانلس ستيل 316L' },
  charms:   { en: 'Copper, gold or silver plating, Czech-style rhinestones', ar: 'نحاس مطلي بالذهب أو الفضة مع أحجار راين ستون تشيكية' },
};

// ---------- Engraving ----------
// Six fonts, the same set for every language (Arabic included). Engraving goes on the clasp.
// Fonts without Arabic glyphs fall back to IBM Plex Sans Arabic in the on-screen preview.
const AR_FALLBACK = '"IBM Plex Sans Arabic"';
export const ENGRAVING_FONTS = [
  { id: 'raleway', name: 'Raleway', family: `"Raleway", ${AR_FALLBACK}, sans-serif`, weight: 400 },
  { id: 'tenor', name: 'Tenor Sans', family: `"Tenor Sans", ${AR_FALLBACK}, sans-serif`, weight: 400 },
  { id: 'b612', name: 'B612 Mono', family: `"B612 Mono", ${AR_FALLBACK}, monospace`, weight: 400 },
  { id: 'cinzel', name: 'Cinzel Decorative', family: `"Cinzel Decorative", ${AR_FALLBACK}, serif`, weight: 400 },
  { id: 'yeseva', name: 'Yeseva One', family: `"Yeseva One", ${AR_FALLBACK}, serif`, weight: 400 },
  { id: 'mashan', name: 'Ma Shan Zheng', family: `"Ma Shan Zheng", ${AR_FALLBACK}, cursive`, weight: 400 },
];
export const ENGRAVE_MAX = 10;
// Symbols that can be engraved alongside text
export const ENGRAVING_SYMBOLS = ['♥', '☀', '★', '☾', '✦', '♛', '✿', '∞', '✓', '☘'];
export const isArabic = (s) => /[\u0600-\u06FF]/.test(s || '');
export const fontFor = (id) => ENGRAVING_FONTS.find((f) => f.id === id) || ENGRAVING_FONTS[0];

// ---------- Printing ----------
// Printing is available on nylon straps only. Customers pick a preset design or upload their own;
// artwork is fitted to the printable area. PRINT_PRICE is a placeholder until NOVVO confirms it.
export const PRINTABLE_MATERIALS = ['nylon'];
export const PRINT_PRICE = 3;
// Preset design library (drawn in js/designs.js). Licensed popular logos can be added here later.
export const PRINT_DESIGNS = [
  { id: 'stripes', name: { en: 'Race Stripes', ar: 'خطوط سباق' } },
  { id: 'camo', name: { en: 'Desert Camo', ar: 'تمويه صحراوي' } },
  { id: 'kuwait', name: { en: 'Kuwait', ar: 'الكويت' } },
  { id: 'waves', name: { en: 'Waves', ar: 'أمواج' } },
  { id: 'check', name: { en: 'Checker', ar: 'مربعات' } },
  { id: 'stars', name: { en: 'Stars', ar: 'نجوم' } },
  { id: 'geo', name: { en: 'Geometric', ar: 'هندسي' } },
  { id: 'leopard', name: { en: 'Leopard', ar: 'نمر' } },
];

// ---------- Product perks ----------
// Only the confirmed answers from the questionnaire are used here.
export const PERKS = [
  { icon: 'lock',   t: { en: 'Holds its shape', ar: 'يحافظ على شكله' }, d: { en: 'Straps don’t stretch or lose their shape with normal use.', ar: 'الأحزمة لا تتمدد ولا تفقد شكلها مع الاستخدام العادي.' } },
  { icon: 'drop',   t: { en: 'Colour that stays', ar: 'لون ثابت' }, d: { en: 'No fading, peeling or colour transfer onto skin or clothes in normal use.', ar: 'لا يبهت ولا يتقشر ولا ينقل اللون إلى البشرة أو الملابس مع الاستخدام العادي.' } },
  { icon: 'sun',    t: { en: 'Made for the GCC', ar: 'مصمم للخليج' }, d: { en: 'Suited to Gulf heat, sunlight and humidity.', ar: 'مناسب لحرارة الخليج وأشعة الشمس والرطوبة.' } },
  { icon: 'wind',   t: { en: 'All-day comfort', ar: 'راحة طوال اليوم' }, d: { en: 'Breathable and comfortable to wear all day; the feel varies by material.', ar: 'قابل للتهوية ومريح طوال اليوم، ويختلف الإحساس حسب الخامة.' } },
  { icon: 'pen',    t: { en: 'Engrave with confidence', ar: 'انقش بثقة' }, d: { en: 'Engraving doesn’t affect durability or how the strap works.', ar: 'النقش لا يؤثر على متانة الحزام أو وظيفته.' } },
  { icon: 'shield', t: { en: 'Checked twice', ar: 'فحص مزدوج' }, d: { en: 'Our supplier runs quality checks, and NOVVO inspects every product before sale.', ar: 'يجري المورّد فحوصات جودة منتظمة، وتفحص NOVVO كل منتج قبل بيعه.' } },
];
