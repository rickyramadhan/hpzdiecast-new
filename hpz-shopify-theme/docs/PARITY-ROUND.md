# Parity round: make the Liquid theme look and behave like the HTML mockup

The theme was pushed as an UNPUBLISHED theme to the live store and is served locally by `shopify theme dev`
at http://127.0.0.1:9292 (already running. DO NOT start another, DO NOT push, DO NOT publish, DO NOT touch the live theme).
Every file you save in `hpz-shopify-theme/` is hot-synced to the unpublished theme automatically.

## The problem to fix

The Liquid theme renders only data that exists in Shopify. Many sections are EMPTY or look different from the mockup
(`hpz-redesign/*.html`, served at http://localhost/hpzdiecast.com/hpz-redesign/). The goal of this round: with the
store data that exists TODAY, each page looks and works like its mockup page.

## Facts about the store (verified)

- 491 products, all vendor "HPZToys", product type EMPTY, no SKUs, no `hpz.*` metafields, no `casting`/`brand`/`build` metaobjects yet.
- Real collection handles: `wheels` (222), `hpz-wheels` (137), `jv-custom` (52), `sakura-model` (50), `turbo-miniscale` (72), `decals` (38), `body-kit` (26), `wide-body-kit`, `engines`, `exterior-detail` (41), `interior-detail`, `interior-set`, `dioramas`, `parvus-models`, `octopus`, `rebel-tires`, `carlomo-alloy-wheels`, `premium-alloy-disc-brake`, `muscle-car-23`, `all`.
- Existing menus are Trade's (`main-menu`: Home, All Product, Wheels, Interior Detail, Exterior Detail, Decals, Dioramas, Others; `footer`: Search, About Us). Treat menus as merchant data: build sensible fallbacks, never rely on them having children.
- Pages that exist: `contact`. Blog `news` (0 articles). Everything else is previewed with the alternate-template trick:
  `/pages/contact?view=services`, `?view=builds`, `?view=planner`, `?view=contact`, `/blogs/news?view=academy`, `/products/<handle>?view=decal`.
- Store files usable in template JSON as `shopify://shop_images/<filename>`, for example customer build photos:
  `627859247_17903468040358636_9215028376513405304_n.jpg`, `631316196_18006175139836329_2723227655320315377_n.jpg`,
  `625947038_17917284378256467_2530175199263028026_n.jpg`, `626183649_17878289820469569_3561695745277330278_n.jpg`,
  `627967251_17960306688023139_3741770519470168888_n.jpg`. Collections and products in template JSON are referenced by handle string.
- Handy product handles: `hpz-wheels-model-te37-sl-bearing-series`, `hpz-wheels-model-six-bearing-series`, `hpz-wheels-model-bbs-lm-bearing-series`,
  `hpz-wheels-model-super-advan-bearing-series`, `decal-set-hotwheels-honda-s2000-hks-super-gt`, `decal-set-hotwheels-skyline-r34-nismo-z-tune`,
  `hpz-add-on-body-kit-for-hot-wheels-r34-v-spec`, `add-on-body-kit-for-hot-wheels-skyline-r34`, `parvus-models-nissan-rb26-engine`,
  `parvus-models-miniatur-mesin-toyota-2jz-gte`, `jv-accessories-voltex-wing`, `recaro-seat-with-detailing`.

## Fallback helpers (lead, ready). NOTE: Liquid has NO parse_json filter

- `{% render 'product-facts', product: product %}` outputs ONE line of `~`-separated fields. Read it like this:
  `{%- capture facts_raw -%}{%- render 'product-facts', product: product -%}{%- endcapture -%}{%- assign f = facts_raw | strip | split: '~' -%}`
  Fields: f[0] brand, f[1] own ('true'/'false'), f[2] kind (wheels|decals|bodykits|engines|exterior|interior|dioramas), f[3] diameter mm (empty when not stated),
  f[4] bearing ('true'/'false'), f[5] disc brake, f[6] face material, f[7] lip material, f[8] decal sheet (transparent|white-toner), f[9] precoated, f[10] made_for casting handles (comma list).
  Metafield first, then ONLY what the title or description explicitly states. Use it everywhere you read `product.metafields.hpz.*` (specs, chips, fitment, bundle, quick view, planner...).
  Compare strings, e.g. `{% if f[1] == 'true' %}`. Never default a diameter.
- Castings fallback: `window.HPZ_CASTINGS` (JS) already falls back to the built-in list when no `casting` metaobject exists. For Liquid loops use
  `{%- capture raw -%}{%- render 'default-castings-list' -%}{%- endcapture -%}{%- assign recs = raw | strip | split: ';;' -%}` then per record `{%- assign c = rec | split: '|' -%}`:
  c[0] handle, c[1] name, c[2] maker, c[3] year, c[4] body, c[5] diameter, c[6] axle, c[7] keywords. (See snippets/garage-modal.liquid for a working example.)
  Entries are estimates (verified:false); fitment TAGS stay hidden for unverified castings (setting fitment_requires_verified), but pickers, silhouettes, diameters and finders must work.
- The `HPZ.*` JS API is unchanged (see THEME-CONTRACT.md).
- PREVIEW CAVEAT: the dev server resolves the visitor country from this machine's IP (Indonesia). The store does not ship to Indonesia, so EVERY product looks sold out there and add-to-cart returns 422. Switch the puppeteer session to the US first: `const { setCountry } = require('C:/xampp/htdocs/hpzdiecast.com/.qa/use-country.cjs'); await setCountry(page, 'US');`.
- NEVER use `sed -i` inside the theme folder (temp files break the dev server). Use the Edit/Write tools or node fs.

## How to check your work (mandatory, repeat until your page matches)

1. `node .qa/compare.cjs <mockup.html> <livePath> .qa/<name> [1440|390]` writes `.qa/<name>-mock-N.png` and `.qa/<name>-live-N.png`.
   Read both and compare section by section. In Git Bash run `export MSYS_NO_PATHCONV=1` first so paths starting with `/` are not rewritten.
2. `node .qa/liquid-scan.cjs <paths...>` lists "Liquid error" strings per page. Must be zero for your pages.
3. `shopify theme check` (offline) from `hpz-shopify-theme/` must stay at 0 errors. Run `node tools/check-json.cjs`, and `node tools/build-locales.cjs` after adding locale keys.
4. Also test at 390px width. Interact (click, hover) with puppeteer wherever the mockup has behaviour.

## Rules

- Empty sections are the bug. Pre-populate template JSON defaults with the real handles and files above so the page looks right immediately;
  merchants can edit later. Do not invent facts, numbers, reviews, prices, stock or ratings. The copy corrections in THEME-CONTRACT.md still apply:
  Jakarta Selatan, 40 countries only via `localization`, duties paid by the recipient, no % badges, no "printed in-house".
- Derive data from real store content (titles, descriptions, `collection.products_count`, `localization.available_countries.size`).
  Never default a diameter or any other spec.
- Stay in your own files (ownership list in THEME-CONTRACT.md). If you need a change in a lead file (layout, theme.js, header/footer,
  product-card, base/components css), describe it precisely in your final report.
- Final report: what was wrong, what you changed, what still differs from the mockup and why (data that genuinely does not exist),
  and what the merchant must still create.
