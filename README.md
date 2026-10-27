# NOVVO — website concept

Interactive e-commerce site for NOVVO (screenless tracker straps, Kuwait & GCC).
It's a static site with no build step: HTML, CSS and ES modules. Three.js, GSAP and Lenis load from CDNs.

## Run locally

```
python3 serve.py
```
Then open http://localhost:5173. `serve.py` supports byte-range requests, which the hero video needs to loop smoothly. Any production host (Netlify, Vercel, S3, etc.) already does this.

## What's inside

| File | Purpose |
| --- | --- |
| `index.html` | Shell: nav, cart drawer, loader, page-transition curtain |
| `css/style.css` | Design tokens, layouts, RTL rules, responsive breakpoints |
| `js/band3d.js` | Procedural 3D strap (geometry, materials, live engraving, charms, pods) + thumbnail renderer |
| `js/home.js` | Home page and its scroll-choreographed 3D story |
| `js/pages.js` | Shop, product configurator, checkout, confirmation, tracking, contact |
| `js/store.js` | Cart, currency, promo codes, orders (localStorage) |
| `js/data.js` | Catalogue, colours, prices, GCC shipping, currencies, promo codes |
| `js/i18n.js` | English / Arabic dictionary |

## Features
- Real-time 3D strap: drag to rotate, swap colour, material (silicone / nylon / leather / sport flex) and device (WHOOP / Garmin Cirqa / Fitbit Air)
- Live laser-engraving preview in English or Arabic, with charms
- Product images are rendered by the same 3D engine, so every colourway has a photo with no photoshoot
- EN / AR with full RTL mirroring (including the 3D scene)
- Cart drawer with a free-delivery meter, checkout (KNET / card / Apple Pay / COD), promo codes, order tracking
- GCC currency switcher (KWD, SAR, AED, QAR, BHD, OMR; rates are indicative)

Promo codes: `NOVVO10`, `WELCOME15`, `FREESHIP`, `GCC5` (5 KD off orders of 25 KD or more). Demo tracking number: `NV-102938`.

## Hero video (AI-generated)
The hero plays `assets/hero.mp4` (muted and looped) if the file exists; it's currently set to the supplied clip. Until then it shows a 3D fallback of floating straps.
Export at 1920×1080 (or 1080×1920 for a mobile-first cut), H.264, under about 8 MB, 8–12 seconds, seamless loop.

Suggested prompt (Veo 3 / Kling / Runway):
> Cinematic slow-motion lifestyle montage in warm natural light, minimalist neutral tones. Close-ups of wrists wearing slim
> screenless fitness tracker straps: a woman stretching at home in a sage nylon strap, a Gulf Arab man running on a
> seaside promenade at golden hour in a black silicone sport strap, a hand resting on a linen table in a cognac leather
> strap with a small gold charm. Soft shallow depth of field, gentle camera drift, premium brand campaign, no text, no logos.

## Device photos
`assets/devices/` holds official product photos taken from whoop.com (cropped to the band), garmin.com (background removed) and the Google Store (Fitbit Air).
They are the manufacturers' copyrighted images. Confirm you're allowed to use them (or swap in your own photography) before launch.

## Placeholders to replace before launch
- WhatsApp number, Instagram/TikTok handles and email in `js/pages.js` and `js/app.js`
- Customer reviews in `js/home.js` (sample copy)
- Prices and colourways in `js/data.js` (approximated from ordernovvo.com)
- Payment, orders and tracking are simulated in the browser. Production needs a backend
  (e.g. Shopify / Ordable / custom API) and a payment gateway (KNET via MyFatoorah, Tap, etc.).
