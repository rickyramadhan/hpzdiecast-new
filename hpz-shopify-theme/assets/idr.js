/* HPZ — Rupiah display for Indonesian visitors.
   Shopify cannot charge IDR without Shopify Payments / Adyen, so checkout stays in USD. For visitors on the
   Indonesian side of the site (language id or country ID) this script rewrites every USD price on the page
   ("$12.50", "US$12,50") to Rupiah ("Rp 204.000") and keeps the original in the tooltip.
   Rate: Theme settings > idr_rate, optionally refreshed from a free public rate API (idr_rate_live) and cached 12 h.
   Exposes window.HPZ_IDR = { active, rate, convert(usd) } for payment.js and others. */
(function () {
  'use strict';
  var RAW = window.HPZ_RAW || {};
  var S = RAW.settings || {};
  var cur = (window.Shopify && Shopify.currency && Shopify.currency.active) || RAW.currency || 'USD';
  var idSide = RAW.locale === 'id' || RAW.market === 'ID';
  var fixed = parseFloat(S.idrRate) || 0;
  var KEY = 'hpzIdrRate';
  var api = { active: false, rate: fixed, convert: function (usd) { return Math.round(usd * api.rate / 100) * 100; } };
  window.HPZ_IDR = api;
  if (!idSide || cur !== 'USD') return;

  var cached = null;
  try { cached = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (S.idrLive && cached && cached.rate > 0 && Date.now() - cached.t < 43200000) api.rate = cached.rate;
  if (!(api.rate > 0)) return;                    // no rate configured: leave USD untouched
  api.active = true;
  document.documentElement.setAttribute('data-idr', '1');

  var PRICE = /(?:US)?\$\s?(\d[\d.,]*\d|\d)(?:\s?USD)?/g;
  var nf = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
  var parse = function (s) {
    var m = s.match(/^(.*?)([.,])(\d{1,2})$/);
    var whole = m ? m[1] : s;
    return parseFloat(whole.replace(/[.,]/g, '') + (m ? '.' + m[3] : ''));
  };
  var rp = function (usd) { return 'Rp ' + nf.format(api.convert(usd)); };
  var SKIP = /^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT|INPUT|OPTION|CODE)$/;

  function convertNode(n) {
    var v = n.nodeValue;
    if (!v || v.indexOf('$') === -1) return;
    var parent = n.parentNode;
    if (!parent || SKIP.test(parent.nodeName)) return;
    var first = null;
    var out = v.replace(PRICE, function (all, num) {
      var usd = parse(num);
      if (!isFinite(usd)) return all;
      if (first === null) first = all.trim();
      return rp(usd);
    });
    if (out !== v) {
      n.nodeValue = out;
      if (parent.nodeType === 1 && !parent.title) parent.title = '≈ ' + first + ' (checkout in USD)';
    }
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) return convertNode(root);
    if (root.nodeType !== 1 || SKIP.test(root.nodeName)) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var list = [], n;
    while ((n = w.nextNode())) list.push(n);
    list.forEach(convertNode);
  }

  var start = function () {
    walk(document.body);
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.type === 'characterData') convertNode(m.target);
        else m.addedNodes.forEach(walk);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);

  // Optional live rate (free public endpoint, one request per 12 h per browser). Applies from the next page view.
  if (S.idrLive && !(cached && Date.now() - cached.t < 43200000)) {
    fetch('https://open.er-api.com/v6/latest/USD').then(function (r) { return r.json(); }).then(function (d) {
      var r = d && d.rates && d.rates.IDR;
      if (r > 1000) localStorage.setItem(KEY, JSON.stringify({ rate: r, t: Date.now() }));
    }).catch(function () {});
  }
})();
