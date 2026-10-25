/* HPZ — quick view modal + restock-notify form (global; loaded by layout/theme.liquid)
   HPZ.quickView(handle) fetches /products/{handle}?section_id=quick-view into #quick-box.
   Variant changes re-fetch the same section with ?variant=ID. Add to cart is handled by cart.js ([data-add-to-cart]).
   Restock alerts: theme.js opens #m-notify; this file submits #notify-form (Shopify contact form, tag restock-alert) via fetch.
   Known tech debt: JS-built strings use HPZ.t(en, id, ja). */
(function () {
  'use strict';
  var H = window.HPZ;
  function ready(fn) { if (window.HPZ) window.HPZ.ready(fn); else document.addEventListener('DOMContentLoaded', fn); }

  ready(function () {
    H = window.HPZ;
    var modal = document.getElementById('m-quick'), box = document.getElementById('quick-box');
    var root = function () { return ((H.cfg.routes && H.cfg.routes.root) || '/').replace(/\/?$/, '/'); };
    var token = 0, addClicked = false;

    function load(url, first) {
      var tk = ++token;
      if (first) box.innerHTML = '<button type="button" class="modal-x" data-close aria-label="Close">' + H.ICON.close + '</button><div class="qv" style="min-height:360px"></div>';
      return fetch(url, { credentials: 'same-origin' }).then(function (r) { if (r.ok) return r; /* one retry: the section API can 404 briefly while a theme is re-uploading */ return new Promise(function (ok) { setTimeout(ok, 900); }).then(function () { return fetch(url, { credentials: 'same-origin' }); }); }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (html) {
        if (tk !== token) return;
        var n = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-qv-root]');
        if (!n) throw new Error('no section');
        box.innerHTML = n.innerHTML;
        box.setAttribute('data-handle', n.getAttribute('data-handle') || '');
        box.setAttribute('data-product-url', n.getAttribute('data-product-url') || '');
        H.tagFit(box);
      });
    }

    H.quickView = function (handle, variantId) {
      if (!modal || !box || !handle) return;
      var url = root() + 'products/' + encodeURIComponent(handle) + '?section_id=quick-view' + (variantId ? '&variant=' + variantId : '');
      H.open('m-quick');
      load(url, true).catch(function () { window.location.href = root() + 'products/' + encodeURIComponent(handle); });
    };

    box.addEventListener('click', function (e) {
      var th = e.target.closest('[data-qi]');
      if (th) {
        var main = box.querySelector('[data-qv-img]');
        if (main) { main.removeAttribute('srcset'); main.src = th.getAttribute('data-src'); }
        box.querySelectorAll('[data-qi]').forEach(function (b) { b.classList.toggle('is-on', b === th); });
        return;
      }
      var ob = e.target.closest('[data-opt-value]');
      if (ob) {
        var j = box.querySelector('[data-qv-json]'); if (!j) return;
        var data = JSON.parse(j.textContent || '[]');
        var cur = box.querySelector('[data-add-to-cart],[data-notify]');
        var curId = cur && cur.getAttribute('data-variant-id');
        var curV = data.filter(function (v) { return String(v.id) === String(curId); })[0] || data[0];
        var i = +ob.getAttribute('data-opt-index'), val = ob.getAttribute('data-opt-value');
        var opts = curV.options.slice(); opts[i] = val;
        var v = data.filter(function (x) { return x.options.join('\u0001') === opts.join('\u0001'); })[0] ||
          data.filter(function (x) { return x.options[i] === val && x.available; })[0] ||
          data.filter(function (x) { return x.options[i] === val; })[0];
        if (v) load(box.getAttribute('data-product-url') + '?section_id=quick-view&variant=' + v.id, false).catch(function () { /* keep current view */ });
        return;
      }
      if (e.target.closest('[data-add-to-cart]')) addClicked = true;
    });
    /* cart.js opens the drawer (which closes this modal); when drawers are disabled, close it ourselves */
    H.on('cart', function () {
      if (addClicked && document.body.classList.contains('no-drawer') && modal.classList.contains('is-open')) H.closeAll();
      addClicked = false;
    });

    /* restock alert form */
    var nf = document.getElementById('notify-form');
    if (nf) {
      nf.addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = nf.querySelector('button[type="submit"]'); if (btn) btn.classList.add('is-loading');
        var nativeSubmit = function () { HTMLFormElement.prototype.submit.call(nf); };
        fetch(nf.getAttribute('action') || '/contact', { method: 'POST', body: new FormData(nf), credentials: 'same-origin' }).then(function (r) {
          if (!r.ok || /\/challenge/.test(r.url)) { nativeSubmit(); return; }
          if (btn) btn.classList.remove('is-loading');
          var title = (document.getElementById('notify-title') || {}).textContent || '';
          nf.reset(); H.closeAll();
          H.toast({ title: H.t('You are on the list', 'Kamu sudah terdaftar', '登録しました'), sub: title });
        }).catch(nativeSubmit);
      });
    }
  });
})();
