/* HPZ — floating WhatsApp widget.
   Shows a button (bottom left). After a few seconds a small greeting bubble pops up with typing dots, then the message.
   Click opens a panel with the admins; each link opens WhatsApp with a prefilled message that includes the page. */
(function () {
  'use strict';
  var root = document.querySelector('[data-waf]');
  if (!root) return;
  var btn = root.querySelector('[data-waf-btn]'), panel = root.querySelector('[data-waf-panel]');
  var bubble = root.querySelector('[data-waf-bubble]'), msg = root.querySelector('[data-waf-msg]');
  var delay = Math.max(1, +root.getAttribute('data-delay') || 6) * 1000;
  var greeting = root.getAttribute('data-greeting') || '';
  var prefill = root.getAttribute('data-prefill') || '';
  var KEY = 'hpzWaSeen';
  var seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch (e) {}
  var timers = [];
  var later = function (fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; };

  /* open now? Mon–Sat 07:00–18:00 WIB (UTC+7) */
  var wib = new Date(Date.now() + 7 * 3600 * 1000);
  var day = wib.getUTCDay(), hour = wib.getUTCHours() + wib.getUTCMinutes() / 60;
  var online = day >= 1 && day <= 6 && hour >= 7 && hour < 18;
  root.querySelectorAll('[data-waf-online]').forEach(function (el) { el.classList.toggle('is-off', !online); });
  root.querySelectorAll('[data-waf-on]').forEach(function (el) { el.hidden = !online; });
  root.querySelectorAll('[data-waf-off]').forEach(function (el) { el.hidden = online; });

  /* every link carries a prefilled message with the page the visitor is on */
  var text = encodeURIComponent((prefill + ' ' + (document.title || '') + ' ' + location.href).trim());
  root.querySelectorAll('[data-waf-link]').forEach(function (a) {
    a.href = 'https://wa.me/' + a.getAttribute('data-waf-link') + '?text=' + text;
    a.addEventListener('click', function () { try { (window.dataLayer = window.dataLayer || []).push({ event: 'whatsapp_click', admin: a.getAttribute('data-waf-name') }); } catch (e) {} });
  });

  function mark() { seen = true; try { sessionStorage.setItem(KEY, '1'); } catch (e) {} }
  function hideBubble() { root.classList.remove('is-bubble'); }
  function stopHints() { timers.forEach(clearTimeout); timers = []; root.classList.remove('is-pulse', 'has-dot'); hideBubble(); }

  function open() {
    stopHints(); mark();
    root.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true');
    var first = panel.querySelector('a'); if (first) later(function () { first.focus({ preventScroll: true }); }, 380);
  }
  function close(refocus) {
    root.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false');
    if (refocus) btn.focus({ preventScroll: true });
  }
  btn.addEventListener('click', function () { root.classList.contains('is-open') ? close(false) : open(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('is-open')) close(true); });
  document.addEventListener('click', function (e) { if (root.classList.contains('is-open') && !root.contains(e.target)) close(false); });
  var bx = root.querySelector('[data-waf-bubble-x]');
  if (bx) bx.addEventListener('click', function (e) { e.stopPropagation(); stopHints(); mark(); });
  if (bubble) bubble.addEventListener('click', function (e) { if (!e.target.closest('[data-waf-bubble-x]')) open(); });

  /* lift above the sticky add-to-cart bar (product pages, up to 1000px wide) */
  function lift() { var s = document.querySelector('.sbar'); root.classList.toggle('has-sbar', !!s && getComputedStyle(s).display !== 'none'); }
  lift(); window.addEventListener('resize', lift);

  /* the hint sequence: pulse + dot, then bubble with typing dots, then the message */
  if (!seen) {
    later(function () {
      if (root.classList.contains('is-open')) return;
      root.classList.add('is-pulse', 'has-dot');
      msg.innerHTML = '<span class="waf-typing" aria-hidden="true"><b></b><b></b><b></b></span>';
      root.classList.add('is-bubble');
      later(function () {
        msg.innerHTML = '';
        var t = document.createElement('span'); t.className = 'waf-msg-t'; t.textContent = greeting; msg.appendChild(t);
      }, 1500);
      later(function () { hideBubble(); }, 16000); /* the dot and pulse stay until the visitor opens the chat */
    }, delay);
  }
})();
