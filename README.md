# HPZ Diecast — Redesign Mockup (front-end)

Static HTML/CSS/JS mockup of the new hpzdiecast.com, built to be converted into a Shopify OS 2.0 theme.
Product data, prices, variants and images are the **real live catalogue** (490 products, pulled from the public `/products.json`).

## Run

Served by XAMPP: <http://localhost/hpzdiecast.com/hpz-redesign/> — page index: [pages.html](pages.html)

- `?reset` on any page clears demo state (cart, wishlist, garage, orders, market).
- `?static` disables entrance animations (screenshots / presentations).
- Region + language switch: top bar (`EN · USD`). 9 markets, 8 currencies, 3 languages (EN / ID / JA).
- Press `/` anywhere to search.
- Checkout has an "Autofill demo details" chip. Discount code: `PITCREW10`.

## Concept — "The Workbench"

Every 1:64 builder shoots on a green self-healing cutting mat with a yellow cutter next to it. That is the palette:
ink black, paper, cutting-mat green (used sparingly, with real ruler ticks), cutter yellow for actions, plus the three
HPZ logo colours as tiny accents. Archivo (expanded, uppercase) for headings, JetBrains Mono for part numbers, sizes and prices.
Catalogue-dense, 1 px lines, small radii, no glow or decorative gradients.

## Pages

| Page | What it shows |
|---|---|
| index.html | Workbench hero (interactive wheel, finish switcher, scroll-reactive spin), ticker, category bento, fitment finder (car drives in with the right wheel size), HPZ Originals rail, wheel anatomy, product tabs, shoppable UGC, services, reviews, academy, shipping promise |
| shop.html | Faceted filters (category, diameter, finish swatches, maker, style, features, price range, in stock, fits my casting), active chips, sort, grid density, promo tiles, load-more with skeletons, URL sync |
| product.html?h= | Gallery with hover zoom + lightbox, engineering drawing (wheels), compare slider (decals), variant picker, fitment check, stock, delivery ETA per market, bundle "complete the build" (−10%), install steps, specs, reviews, builds using this part, sticky bar |
| cart.html | Lines, save for later, add-ons (rigid box, shipping protection), free-shipping tachometer, shipping estimate per market, US DDP duties notice, discount code, express checkout |
| checkout.html | Shopify Checkout look: express pay, contact, delivery (country switch changes market live), address autocomplete, shipping methods, payments per market (cards/PayPal/Shop Pay/Klarna/Afterpay — or QRIS/VA/GoPay for Indonesia), Pit Points banner, processing overlay, QRIS modal |
| thank-you.html | Animated confirmation, live timeline, WhatsApp opt-in, VA number, order details, Pit Points + account creation, share-your-build |
| builds.html | Shoppable "Built by You" gallery, hotspots, build modal with "add build to cart", likes, leaderboard, submission form with drag-and-drop + part tagging |
| planner.html | Build Planner: casting → wheels → livery → aero → engine → build sheet; live car preview (paint, stance, wheel finish/size), bundle meter, save/share/print |
| services.html | Custom Decal Studio (quote estimator), Commission Build tiers, Wholesale, part requests, Pit Points, help centre |
| academy.html | Guide index + article view with scroll-spy steps and persistent checklist |
| account.html | "My Garage": overview, orders + tracking, castings, saved builds, wishlist, Pit Points, addresses, restock alerts, settings; `?login` sign-in |
| 404.html | "Lost a wheel" |

## Structure

```
*.html                       one file per page
assets/css/base.css          tokens, type, buttons, forms, motion
assets/css/components.css    header, mega menu, garage bar, search, drawers, product card, modals, toast, footer
assets/css/p-<page>.css      page styles
assets/js/catalog.js         GENERATED from the live store (tools/build-catalog.cjs)
assets/js/content.js         brands, castings (fitment table), builds, reviews, guides, markets, currencies, languages
assets/js/core.js            state, i18n, money/markets, catalog query, fitment, cart, product card, wheel SVG, motion
assets/js/chrome.js          header, mega menu, garage bar, search, cart/wish drawers, market modal, geo prompt, quick view, footer
assets/js/pages/<page>.js    page scripts (run in HPZ.ready, re-render on hpz:market / hpz:cart / hpz:garage)
tools/build-catalog.cjs      regenerate catalog.js from ../_src/*.json
```

i18n: static HTML uses `data-id="…" data-ja="…"` with English as content; JS uses `t('EN', 'ID', 'JA')`.

## Shopify mapping

| Mockup | Theme / platform |
|---|---|
| Header, mega menu, garage bar, footer | `sections/header-group.json` (announcement-bar, header with mega-menu blocks, garage-bar), `footer-group.json` |
| Market & language switch, geo prompt | **Shopify Markets** + `localization` form; Geolocation app (or custom using `request.locale` / `localization.country`); **Translate & Adapt** for ID/JA; locale files `en.default.json`, `id.json`, `ja.json` |
| Prices per market, rounding | Markets price lists / auto conversion with rounding rules; IDR market with its own price list |
| US duties (DDP), EU IOSS | Markets Pro / Managed Markets or duties & import taxes at checkout |
| Product card | `snippets/product-card.liquid` (swatches from variant images, metafields for diameter / part number) |
| Metafields | `hpz.diameter` (number), `hpz.width`, `hpz.axle`, `hpz.face_material`, `hpz.lip_material`, `hpz.bearing` (bool), `hpz.disc_brake` (bool), `hpz.part_number`, `hpz.made_for` (list of `casting` metaobject refs), `hpz.install_steps` (rich text) |
| Castings / fitment | metaobject `casting` {name, maker, year, body, recommended_diameter, axle}; "My garage" stored in customer metafield (logged in) or localStorage |
| Filters | **Search & Discovery** filters on product type, vendor, `hpz.diameter`, variant option Color, price, availability; "fits my casting" = collection filter on `hpz.made_for` + diameter |
| Cart drawer + tachometer | `snippets/cart-drawer.liquid`, Ajax Cart API; free-shipping threshold per market from settings; add-ons as products or line-item properties |
| Bundles (−10%) | Line property `_bundle` + **Shopify Functions** discount (or Bundles app) |
| Build Planner | page template + section/app block reading casting metaobjects and product metafields |
| Built by You | metaobject `build` {photo, builder, casting, story, hotspots JSON, products}; submission via Shopify Forms / app proxy |
| Checkout / Thank-you | Shopify Checkout + branding API; Checkout UI extensions (fitment reminder, rigid-box upsell, Pit Points, WhatsApp opt-in, timeline). Indonesia: Xendit or Midtrans for QRIS / VA / e-wallets |
| Pit Points | loyalty app (Smile, Rivo, BON) or custom with customer metafields |
| Reviews | Judge.me / Okendo (photo reviews) |
| Account | new customer accounts + customer account UI extensions (garage, saved builds, points) |

## Placeholder data (replace before launch)

Reviews, review counts/ratings, stock counts ("only 3 left"), likes, leaderboard, hero stats, workshop address,
VA/QR codes, tracking numbers and fitment dimensions per casting are **mock values**. Product names, prices,
variants and images are real. Casting fitment table needs to be measured and confirmed by the workshop.
