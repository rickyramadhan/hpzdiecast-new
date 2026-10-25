/* HPZ — courier rate estimate for Indonesian visitors.
   Talks only to the ongkir Worker (worker/ongkir-worker.js), which holds the API key.
   Weight comes from /cart.js (total_weight, grams) + packaging. Rates are IDR, shown as-is. */
(function () {
  'use strict';
  var RAW = window.HPZ_RAW || {};
  if (!(RAW.locale === 'id' || RAW.market === 'ID')) return;
  var KEY = 'hpzShipDest';
  var nf = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
  var T = function (en, id) { return RAW.locale === 'id' ? id : en; };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var load = function () { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };

  function init(root) {
    if (root.__sc) return;
    root.__sc = true;
    root.hidden = false;
    var api = root.dataset.api.replace(/\/+$/, '');
    var q = root.querySelector('[data-sc-q]'), sug = root.querySelector('[data-sc-sug]'), dest = root.querySelector('[data-sc-dest]'), out = root.querySelector('[data-sc-out]');
    var timer, seq = 0, dst = load();
    var wa = root.dataset.wa ? 'https://wa.me/' + root.dataset.wa : '';
    var help = wa ? ' <a href="' + wa + '" target="_blank" rel="noopener">WhatsApp</a>' : '';

    function showDest() {
      if (!dst) { dest.hidden = true; return; }
      dest.hidden = false;
      dest.innerHTML = esc(T('Delivering to', 'Dikirim ke')) + ' <b>' + esc(dst.label) + '</b><button type="button" data-sc-change>' + esc(T('Change', 'Ganti')) + '</button>';
      q.hidden = true;
    }
    function message(html) { out.innerHTML = '<p class="sc-msg">' + html + '</p>'; }

    function rates() {
      if (!dst) return;
      var my = ++seq;
      root.classList.add('is-busy');
      fetch('/cart.js', { headers: { Accept: 'application/json' } }).then(function (r) { return r.json(); }).then(function (cart) {
        if (!cart.item_count) { root.classList.remove('is-busy'); return message(esc(T('Add items to see delivery costs.', 'Tambahkan barang untuk melihat ongkir.'))); }
        var grams = Math.max(1, (cart.total_weight || 0) + (+root.dataset.pack || 0));
        return fetch(api + '/rates', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ destination: dst.id, weight: grams, couriers: root.dataset.couriers }) })
          .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
          .then(function (d) {
            if (my !== seq) return;
            root.classList.remove('is-busy');
            if (!d.rates || !d.rates.length) return message(esc(T('No courier rates for this address.', 'Tarif kurir untuk alamat ini tidak tersedia.')) + help);
            out.innerHTML = d.rates.slice(0, 8).map(function (r) {
              return '<div class="sc-r"><b>' + esc(r.courier + ' ' + r.service) + '</b><span class="mono">Rp&nbsp;' + nf.format(r.cost) + '</span>' +
                '<span class="xs">' + esc(r.description || '') + (r.etd ? ' · ' + esc(r.etd) : '') + '</span></div>';
            }).join('');
          });
      }).catch(function () {
        root.classList.remove('is-busy');
        message(esc(T('Could not load delivery costs right now. Ask the admin on', 'Ongkir belum bisa dimuat. Tanyakan ke admin lewat')) + help);
      });
    }

    q.addEventListener('input', function () {
      clearTimeout(timer);
      var v = q.value.trim();
      if (v.length < 3) { sug.hidden = true; return; }
      timer = setTimeout(function () {
        var my = ++seq;
        fetch(api + '/destinations?q=' + encodeURIComponent(v)).then(function (r) { return r.json(); }).then(function (d) {
          if (my !== seq) return;
          var l = d.results || [];
          sug.innerHTML = l.length ? l.map(function (x) { return '<li data-id="' + esc(x.id) + '">' + esc(x.label) + '</li>'; }).join('') : '<li>' + esc(T('No match. Try the district name.', 'Tidak ditemukan. Coba nama kecamatan.')) + '</li>';
          sug.hidden = false;
        }).catch(function () { sug.hidden = true; });
      }, 280);
    });
    sug.addEventListener('click', function (e) {
      var li = e.target.closest('li[data-id]');
      if (!li) return;
      dst = { id: li.getAttribute('data-id'), label: li.textContent };
      try { localStorage.setItem(KEY, JSON.stringify(dst)); } catch (x) {}
      sug.hidden = true; q.value = ''; showDest(); rates();
    });
    dest.addEventListener('click', function (e) {
      if (!e.target.closest('[data-sc-change]')) return;
      dst = null;
      try { localStorage.removeItem(KEY); } catch (x) {}
      q.hidden = false; q.focus(); dest.hidden = true; out.innerHTML = '';
    });
    document.addEventListener('click', function (e) { if (!root.contains(e.target)) sug.hidden = true; });
    showDest();
    if (dst) rates();
  }

  function scan(node) { (node || document).querySelectorAll('[data-shipcalc]').forEach(init); }
  var start = function () {
    scan();
    // cart sections are re-rendered after every change: re-init, which re-fetches the rates for the new weight
    new MutationObserver(function (m) {
      for (var i = 0; i < m.length; i++) for (var j = 0; j < m[i].addedNodes.length; j++) {
        var n = m[i].addedNodes[j];
        if (n.nodeType === 1) { if (n.matches && n.matches('[data-shipcalc]')) init(n); else scan(n); }
      }
    }).observe(document.body, { childList: true, subtree: true });
  };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
