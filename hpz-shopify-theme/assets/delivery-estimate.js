/* HPZ — shipping cost estimate on the product page.
   Uses the store's own shipping zones, exported to snippets/shipping-rates-data.liquid by tools/gen-shipping-table.cjs
   (zone countries + weight tiers per method). The estimate = tier that matches variant weight x quantity for the chosen
   country. No API, no token. Countries outside every zone show "Calculated at checkout". */
(function () {
  'use strict';
  var RAW = window.HPZ_RAW || {};
  var T = function (en, id) { return RAW.locale === 'id' ? id : en; };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var fmt = function (amount, cur) {
    try { return new Intl.NumberFormat(RAW.locale || 'en', { style: 'currency', currency: cur, maximumFractionDigits: cur === 'IDR' ? 0 : 2 }).format(amount); }
    catch (e) { return cur + ' ' + amount; }
  };

  function init(box) {
    if (box.__est) return; box.__est = true;
    var out = box.querySelector('[data-dlv-cost]');
    var sel = box.querySelector('[data-dlv-country]');
    var rt = box.querySelector('script[data-dlv-rates]'), wt = box.querySelector('script[data-dlv-weights]');
    if (!out || !rt) return;
    var table, weights = {};
    try { table = JSON.parse(rt.textContent); weights = wt ? JSON.parse(wt.textContent) : {}; } catch (e) { return; }
    var byCountry = {};
    (table.zones || []).forEach(function (z) { z.countries.forEach(function (c) { byCountry[c] = z; }); });

    var variantId = function () { var i = document.querySelector('form[action*="/cart/add"] input[name="id"]'); return i ? i.value : null; };
    var qty = function () { var q = document.querySelector('[data-qty]'); return Math.max(1, parseInt(q && q.value, 10) || 1); };
    var calc = function () { return T('Calculated at checkout', 'Dihitung saat checkout'); };

    function run() {
      var country = sel ? sel.value : RAW.market;
      var zone = byCountry[country];
      var grams = weights[variantId()] != null ? weights[variantId()] * qty() : null;
      if (!zone || grams == null || grams <= 0) { out.textContent = calc(); return; }
      var kg = grams / 1000, rows = [];
      zone.methods.forEach(function (m) {
        var t = m.tiers.filter(function (x) { return kg >= x.min && (x.max == null || kg <= x.max); })[0];
        if (t) rows.push({ name: m.name, price: t.price, cur: t.cur });
      });
      if (!rows.length) { out.textContent = calc(); return; }
      rows.sort(function (a, b) { return a.price - b.price; });
      out.innerHTML = rows.map(function (r) {
        return '<span class="dlv-opt"><span>' + esc(r.name) + '</span><b class="mono">' + (r.price === 0 ? esc(T('Free', 'Gratis')) : esc(fmt(r.price, r.cur))) + '</b></span>';
      }).join('') + '<span class="dlv-est">' + esc(T('Estimate for the selected item and quantity', 'Perkiraan untuk barang dan jumlah yang dipilih')) + '</span>';
    }

    if (sel) sel.addEventListener('change', run);
    document.addEventListener('input', function (e) { if (e.target.matches && e.target.matches('[data-qty]')) run(); });
    document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[data-qs]')) setTimeout(run, 0); });
    document.addEventListener('change', function (e) { if (e.target.matches && e.target.matches('form[action*="/cart/add"] input, form[action*="/cart/add"] select')) setTimeout(run, 0); });
    run();
  }
  var go = function () { document.querySelectorAll('[data-dlv]').forEach(init); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
