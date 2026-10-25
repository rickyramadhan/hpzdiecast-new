/* HPZ — manual payment page (QRIS / BCA transfer + WhatsApp confirmation).
   No gateway: the admin confirms each payment by hand. Amounts are only displayed, never charged here. */
HPZ.ready(function () {
  'use strict';
  var H = window.HPZ, $ = H.$, root = $('[data-pay]');
  if (!root || root.dataset.payOn) return; root.dataset.payOn = '1';

  var el = {
    order: $('[data-pay-order]', root), orderErr: $('[data-pay-order-err]', root),
    total: $('[data-pay-total]', root), cur: $('[data-pay-cur]', root),
    due: $('[data-pay-due]', root), dueV: $('[data-pay-due-v]', root), dueN: $('[data-pay-due-note]', root),
    name: $('[data-pay-name]', root), wa: $('[data-pay-wa]', root)
  };
  var WA = (root.dataset.wa || '').replace(/\D/g, '');
  var RATE = (window.HPZ_IDR && window.HPZ_IDR.rate) || parseFloat(root.dataset.rate) || 0;
  var BANK = root.dataset.bank || 'BCA';
  var idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  var usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  /* ---- prefill from the link in the email / thank-you page, or from this browser ---- */
  var q = new URLSearchParams(location.search), saved = H.LS.get('pay', {});
  var order = q.get('order') || saved.order || '';
  if (order && !/^#/.test(order)) order = '#' + order;
  el.order.value = order;
  if (q.get('total')) el.total.value = q.get('total');
  var cur = (q.get('cur') || saved.cur || 'IDR').toUpperCase();
  el.cur.value = cur === 'USD' ? 'USD' : 'IDR';
  if (saved.name && el.name) el.name.value = saved.name;

  /* ---- amount ---- */
  function num(v) { v = String(v || '').trim(); if (!v) return 0; if (/,\d{1,2}$/.test(v) && v.indexOf('.') > -1) v = v.replace(/\./g, '').replace(',', '.'); else v = v.replace(/,/g, ''); return parseFloat(v.replace(/[^\d.]/g, '')) || 0; }
  var dueIdr = 0;
  function amount() {
    var t = num(el.total.value), c = el.cur.value;
    dueIdr = 0; el.dueN.textContent = '';
    if (!t) { el.due.hidden = true; return; }
    el.due.hidden = false;
    if (c === 'IDR') { dueIdr = Math.round(t); el.dueV.textContent = idr.format(dueIdr); return; }
    if (RATE > 0) {
      dueIdr = Math.ceil(t * RATE / 100) * 100;
      el.dueV.textContent = idr.format(dueIdr);
      el.dueN.textContent = H.t('Converted from ' + usd.format(t) + ' at Rp ' + RATE.toLocaleString('id-ID') + ' per USD. The admin confirms the final amount on WhatsApp.',
        'Dikonversi dari ' + usd.format(t) + ' dengan kurs Rp ' + RATE.toLocaleString('id-ID') + ' per USD. Nominal akhir dikonfirmasi admin lewat WhatsApp.',
        usd.format(t) + ' を Rp ' + RATE.toLocaleString('id-ID') + '/USD で換算。最終金額は管理者がWhatsAppで確認します。');
    } else {
      el.dueV.textContent = usd.format(t);
      el.dueN.textContent = H.t('Your order is in USD. Ask the admin on WhatsApp for the exact amount in Rupiah.',
        'Pesanan kamu tercatat dalam USD. Tanyakan nominal Rupiah yang tepat ke admin lewat WhatsApp.',
        'ご注文はUSD建てです。正確なルピア金額はWhatsAppでご確認ください。');
    }
  }

  /* ---- WhatsApp message ---- */
  function method() { var r = root.querySelector('input[name="pay-method"]:checked'); return r ? r.value : 'QRIS'; }
  function link() {
    var o = (el.order.value || '').trim(), n = (el.name && el.name.value || '').trim();
    var lines = ['Halo admin HPZ, saya sudah melakukan pembayaran.', '',
      'No. pesanan: ' + (o || '-'), 'Nama: ' + (n || '-'), 'Metode: ' + method()];
    if (dueIdr) lines.push('Total dibayar: ' + idr.format(dueIdr));
    else if (num(el.total.value)) lines.push('Total pesanan: ' + (el.cur.value === 'USD' ? usd.format(num(el.total.value)) : idr.format(num(el.total.value))));
    lines.push('', 'Bukti pembayaran saya lampirkan di chat ini. Terima kasih.');
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n'));
  }
  function refresh() {
    amount();
    if (el.wa) el.wa.href = WA ? link() : '#';
    H.LS.set('pay', { order: el.order.value.trim(), cur: el.cur.value, name: el.name ? el.name.value.trim() : '' });
  }
  ['input', 'change'].forEach(function (ev) { root.addEventListener(ev, refresh); });

  if (el.wa) el.wa.addEventListener('click', function (e) {
    var o = (el.order.value || '').trim();
    if (!/\d/.test(o)) {
      e.preventDefault();
      el.order.classList.add('is-err'); el.orderErr.style.display = 'block';
      el.order.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.order.focus({ preventScroll: true });
      return;
    }
    el.order.classList.remove('is-err'); el.orderErr.style.display = '';
    el.wa.href = link();
  });
  el.order.addEventListener('input', function () { el.order.classList.remove('is-err'); el.orderErr.style.display = ''; });

  /* ---- copy buttons ---- */
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); } t.remove();
    });
  }
  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]'); if (!b) return;
    copy(b.getAttribute('data-copy')).then(function () {
      var old = b.textContent; b.textContent = H.t('Copied', 'Disalin', 'コピー済');
      H.toast({ title: H.t('Account number copied', 'Nomor rekening disalin', '口座番号をコピーしました'), sub: BANK + ' ' + b.getAttribute('data-copy') });
      setTimeout(function () { b.textContent = old; }, 1600);
    });
  });

  refresh();
  H.acc(root); H.reveal(root);
});
