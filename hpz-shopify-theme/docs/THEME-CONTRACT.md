# HPZ Shopify theme — build contract

Converts the static mockup in `../hpz-redesign/` (read it: HTML, `assets/css`, `assets/js/pages/*.js`, `assets/js/core.js`, `assets/js/chrome.js`) into a Shopify **Online Store 2.0** theme in this folder (`hpz-shopify-theme/`). Existing live theme is "Trade"; this is a NEW theme, never edit or push to the live store.

## Hard rules
- **Never** run `shopify theme push|dev|pull|share|publish`, `shopify auth/login`, or anything that talks to the store. Work offline only. Validate with `shopify theme check` (offline) from this folder, and `node tools/check-json.cjs`.
- Own only the files assigned to you (list per task). Do **not** edit files owned by others. If you need a shared change, add it to your final report.
- Reuse the mockup CSS **unchanged where possible** (same class names, `assets/*.css` are already copied). If you must change CSS, only edit the `p-*.css` file you own; if base/components need a change, report it.
- Copy markup from the mockup's JS render functions into Liquid, keep class names identical. Server-render with Liquid; use JS only for interaction and Ajax (Section Rendering API, `/cart/*.js`, `/products/{handle}.js`, `/search/suggest`).
- No emoji, no invented facts. See "Copy corrections".

## Data model (see `setup/schema.json` — single source of truth)
Product metafields, namespace `hpz`: `diameter` (decimal mm), `width`, `axle` (long|short|included), `face_material`, `lip_material`, `has_bearing` (bool), `has_disc_brake` (bool), `wheel_style` (jdm|euro|classic|muscle|offroad), `made_for` (list of `casting` metaobjects), `brand` (`brand` metaobject), `sheet_type` (transparent|white-toner), `precoated` (bool), `install_steps` (list of text), `video_url`, `needs_review` (bool).
Metaobjects (storefront-readable): `casting` {name, maker, year, body(coupe|hatch|sedan|truck), diameter, axle, verified}, `brand` {name, code, note, is_original, logo}, `build` {title, builder, photo, casting, story, hotspots(json), products(list product), likes, featured}.
Customer metafield `hpz.garage` (list of casting handles).
Product **type** values: `Wheels`, `Decals`, `Body Kits`, `Engines`, `Aero & Exterior`, `Interior`, `Dioramas`. `data-kind` slug = `wheels|decals|bodykits|engines|exterior|interior|dioramas` (snippet `kind-slug`).
**All metafields may be empty** (data is being filled): every section must degrade gracefully (hide the row/tag, never print "nil"/blank labels). Part number = `variant.sku`; if blank, hide it.
Blogs: `academy` blog = guides (article tags = category: Wheels/Decals/Fitment/Body kits/Engines; article metafields optional `hpz.level`, `hpz.minutes`). Pages: `services`, `builds`, `planner`, `contact` use alternate page templates.
Add-on products (created manually, handles in theme settings): `settings.addon_box_handle` (rigid box), `settings.addon_protect_handle` (shipping protection). Free shipping threshold: `settings.free_ship_usd` (USD, convert client side with `Shopify.currency.rate`).

## Copy corrections (apply everywhere, they fix mistakes in the mockup)
- Workshop location is **Jakarta Selatan, Indonesia** (from store data). Do NOT write "Semarang". Use `settings.workshop_city` / `settings.workshop_address` (street address may be blank → omit).
- Countries shipped: **40** (use `localization.available_countries.size` when available, else don't state a number; never "43" / "40+").
- **No DDP / "duties prepaid" claims.** Import duties/taxes are paid by the recipient (current live banner says so). Delivery boxes say "Duties and import taxes, if any, are paid by the recipient."
- **No discount % badges** on cards/PDP. Keep strike-through compare-at price. Cards render a `−x%` badge only when `settings.show_discount_badge` is true (default false). "On sale" filters are fine.
- Do not claim decals are "printed in-house" / "HPZ Decal Lab". Say "waterslide decals designed for specific castings". Do not state brand-of-origin facts that are not in the data.
- Reviews, ratings, stock counts ("only 3 left"), likes, leaderboard, stats: real data only → use Liquid objects (`variant.inventory_quantity` when tracked), section/block settings the merchant edits, or Judge.me app-block placeholders. No fake numbers in Liquid defaults except clearly editable block defaults.

## Folder / file conventions
`layout/`, `config/`, `locales/`, `sections/`, `snippets/`, `templates/` (JSON templates, `.json` only except `customers/*.liquid`), `blocks/`, `assets/`.
- Page CSS: each section that needs `p-xxx.css` does `{{ 'p-xxx.css' | asset_url | stylesheet_tag }}` at top. `base.css`+`components.css` are in layout.
- Page JS: `<script src="{{ 'xxx.js' | asset_url }}" defer></script>` inside the section; wrap code in `HPZ.ready(() => {...})`.
- Global scripts loaded by layout (all `defer`, in this order): `theme.js` (core), `cart.js`, `search.js`, `quick-view.js`, `localization.js`.
- Every section has a `{% schema %}` with sensible settings/blocks/presets (homepage sections get `presets`). Section schema names can be plain English.
- Translations: Liquid text uses locale keys `{{ 'hpz.<area>.<key>' | t }}`. Put your keys in `_locales/<area>.json` shaped `{"en":{...},"id":{...},"ja":{...}}` (nested objects, deep-merged by `node tools/build-locales.cjs` into `locales/*.json`). Provide EN + ID + JA for every key. JS-built strings use `HPZ.t('English','Indonesia','日本語')` (known tech debt, document it).
- Prices: Liquid `| money` / `| money_without_trailing_zeros`; JS `HPZ.money(cents)`. Never convert currency in the theme except the free-shipping threshold.
- Images: `{{ img | image_url: width: 600 | image_tag: ... }}`, `loading: 'lazy'` below the fold.
- Use `{% render %}` only (never `include`). Avoid deprecated/unsupported Liquid; keep `shopify theme check` clean for errors (warnings OK but minimise).

## Global JS API (assets/theme.js — owned by lead) — `window.HPZ`
`HPZ.cfg` = `{ moneyFormat, currency, rate, locale, country, market, routes:{root,cart,cartAdd,cartChange,cartUpdate,search,suggest,account}, castings:[{handle,name,maker,year,body,dia,axle,verified}], freeShipUsd, addonBox, addonProtect, requireVerified, strings }`
Utils: `$ $$ esc LS{get,set} debounce(fn,ms) emit(name,detail) on(name,fn) ready(fn)` (events are `hpz:<name>`); `t(en,id,ja)`; `money(cents)`; `ICON{name:svgString}`; `icon(name)`; `flag(countryCode)`; `wheelSVG({spokes,finish,style,lip,disc,cap})`; `silhouette(body)`.
UI: `toast({title,sub,img,icon,action,onAction,ms})`, `open(name)` for `cart|menu|wish|search|market|garage|<modal id>`, `closeAll()`, `lock(el)`; `reveal(root)`, `countUp(el,to,{from,dur,dp,fmt})`, `countOnView(root)`, `splitLines(el)`, `acc(root)`, `tabs(el,fn)`, `rail(track,prev,next)`, `stars(n)`, `partNo`—not provided (use sku).
Garage/fitment: `HPZ.garage.current()` → casting object|null, `.set(handle)` (emits `hpz:garage`), `.clear()`, `HPZ.fits({dia, madeFor:[handles], kind}, casting)` → `'fit'|'close'|'made'|'universal'|'no'|null`, `HPZ.fitTagHTML(result, casting)`, `HPZ.tagFit(root)` fills every `[data-fit-slot]` inside root from the nearest ancestor with `data-dia`/`data-made-for`/`data-kind` (call after injecting cards).
Cart (assets/cart.js — owned by cart agent) exposes `HPZ.cart.get()`, `.add([{id,quantity,properties}], {from:element})` (runs fly-to-cart, opens drawer unless `.no-drawer` on body), `.change(key|line, qty)`, `.addBundle(variantIds,{bundleId})`, `.refresh()`; emits `hpz:cart` with the cart JSON; also updates `#hdr-cart-n`. Buttons: `[data-add-to-cart][data-variant-id]`.
Quick view (assets/quick-view.js — product agent): `HPZ.quickView(handle)`; cards use `[data-quick="handle"]`. Fetches `/products/{handle}?section_id=quick-view`.
Search (assets/search.js — catalog agent): overlay `.search#search`, `HPZ.openSearch(q)`; predictive via `/search/suggest?q=…&section_id=predictive-search`.

## Shared markup provided by the lead (layout/theme.liquid)
`#shell` with `.scrim`, `aside#d-cart` (content from `snippets/cart-drawer.liquid`), `aside#d-menu`, `aside#d-wish`, `.search#search` (content from `snippets/search-overlay.liquid`), `.modal#m-market`, `.modal#m-garage`, `.modal#m-quick` (inner `#quick-box`, filled by quick-view.js), `.modal#m-notify`, `.geo#geo`, `#toasts`. Header: `#hdr-cart`, `#hdr-cart-n`. Elements with `data-open="cart|wish|menu|search|market|garage"` open them (delegated in theme.js).
Snippets by the lead: `icon` (`{% render 'icon', name: 'cart' %}`), `product-card` (`{% render 'product-card', product: p, index: i, lazy: true %}` → the `.pc` card incl. swatches, data-attrs, `[data-fit-slot]`, wishlist, quick add), `color-swatch` (`{% render 'color-swatch', name: 'Gold' %}` → css background value), `kind-slug`, `price` (`{% render 'price', product: p, variant: v %}`), `flag`, `stars`, `breadcrumbs`, `section-head`, `meta-tags`.
Product elements that need fitment tags carry: `data-dia="{{ product.metafields.hpz.diameter.value }}"`, `data-made-for="{{ handles comma list }}"` (casting handles from `hpz.made_for`), `data-kind="{{ slug }}"`.

## File ownership
- **lead**: `layout/*`, `config/*`, `locales/*`, `tools/*`, `.shopifyignore`, `sections/{header,announcement-bar,garage-bar,footer,geo-prompt}.liquid`, `sections/{header,footer}-group.json`, `snippets/{icon,product-card,color-swatch,kind-slug,price,flag,stars,breadcrumbs,section-head,meta-tags,market-form,garage-modal,wishlist-drawer,cart-drawer(stub),search-overlay(stub)}.liquid`, `assets/{theme,localization}.js`, `assets/{base,components}.css`, `setup/*`, `docs/*`.
- **catalog agent**: `sections/{main-collection,main-search,main-list-collections,predictive-search}.liquid`, `snippets/{facet-*,collection-*,search-overlay,pagination}.liquid`, `assets/{search,collection}.js`, `assets/p-shop.css`, `templates/{collection,search,list-collections}.json`.
- **product agent**: `sections/{main-product,product-details,product-bundle,product-recommendations,quick-view}.liquid`, `snippets/{product-gallery,product-fitment,product-delivery,product-specs}.liquid`, `assets/{product,quick-view}.js`, `assets/p-product.css`, `templates/product.json` (+ optional `product.decal.json`).
- **cart agent**: `sections/main-cart.liquid`, `snippets/{cart-drawer,cart-line,cart-tach,cart-addons}.liquid`, `assets/cart.js`, `assets/p-cart.css`, `templates/cart.json`.
- **home agent**: `sections/{home-*,hero-workbench,ticker,category-bento,fitment-finder,collection-rail,wheel-anatomy,product-tabs,ugc-builds,services-teaser,reviews-strip,academy-teaser,promise-bar}.liquid`, `assets/home.js`, `assets/p-home.css`, `templates/index.json`.
- **pages-a agent** (services, academy/blog, 404, contact, default page): `sections/{main-services,main-academy-index,main-article,main-blog,main-404,main-page,main-contact}.liquid`, `snippets/{service-*,academy-*}.liquid`, `assets/{services,academy}.js`, `assets/{p-services,p-academy,p-404}.css`, `templates/{page,page.services,page.contact,blog,blog.academy,article,404}.json`.
- **pages-b agent** (builds, planner, accounts): `sections/{main-builds,build-modal,main-planner,main-account-*,main-login,main-register,main-order,main-addresses,main-reset-password,main-activate-account,main-password}.liquid`, `snippets/{build-*,planner-*}.liquid`, `assets/{builds,planner,account}.js`, `assets/{p-builds,p-planner,p-account}.css`, `templates/{page.builds,page.planner,customers/*,gift_card}.json|liquid`.

## Checkout / thank-you
Not theme code (Shopify-hosted). Lead produces `docs/checkout-and-thank-you.md` (branding settings + UI-extension spec). Agents ignore `checkout.html` / `thank-you.html`.

## Final report (each agent)
List: files created, what is dynamic vs placeholder, metafields/settings/menus/pages the merchant must create, any shared-file changes you need from the lead, `shopify theme check` result for your files, known gaps.
