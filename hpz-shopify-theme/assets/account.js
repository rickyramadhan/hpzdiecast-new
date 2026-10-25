/* HPZ - customer account (classic customer accounts) + sign-in pages.
   Orders, addresses, profile come from Liquid. My Garage / saved builds / wishlist are localStorage
   (HPZ.garage, hpz.builds, hpz.wish). Writing customer metafield hpz.garage needs an app proxy; see docs/customer-accounts.md. */
(function () {
  const boot = () => {
    const H = window.HPZ, t = H.t, esc = H.esc;
    const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
    const ic = n => (H.ICON && H.ICON[n]) || '';
    const base = ((H.cfg && H.cfg.routes && H.cfg.routes.root) || '/').replace(/\/?$/, '/');

    /* ---------- auth pages ---------- */
    const auth = $('[data-account-auth]');
    if (auth) {
      const w = $('[data-lg-wheel]', auth); if (w && !w.innerHTML) w.innerHTML = H.wheelSVG({ spokes: 6, finish: 'gold', disc: 1 });
      $$('[data-eye]', auth).forEach(b => { b.onclick = () => { const p = b.parentElement.querySelector('input'); p.type = p.type === 'password' ? 'text' : 'password'; }; });
      const lp = $('#login-panel', auth), rp = $('#recover-panel', auth);
      if (lp && rp) {
        const flip = () => { lp.hidden = !lp.hidden; rp.hidden = !rp.hidden; };
        $$('[data-toggle-recover]', auth).forEach(b => { b.onclick = flip; });
        if ($('.ok, .err-msg', rp)) { lp.hidden = true; rp.hidden = false; }
      }
    }

    /* ---------- account area ---------- */
    const acct = $('[data-account]');
    if (!acct) return;
    const garageHandles = () => H.LS.get('garage', []);
    const castBy = h => ((H.cfg && H.cfg.castings) || []).find(c => c.handle === h);
    const garage = () => garageHandles().map(castBy).filter(Boolean);
    const savedBuilds = () => { const b = H.LS.get('builds', []); return Array.isArray(b) ? b : []; };
    const wish = () => H.LS.get('wish', []);

    const paintCounts = () => {
      const n = { garage: garage().length, builds: savedBuilds().length, wish: wish().length };
      $$('[data-n]', acct).forEach(e => { const v = n[e.dataset.n]; e.textContent = v || (e.tagName === 'DD' ? '0' : ''); });
    };
    const empty = (h, p, cta) => `<div class="ac-empty"><h3 class="h3">${esc(h)}</h3><p>${esc(p)}</p>${cta || ''}</div>`;

    function drawGarage() {
      const list = garage(), el = $('[data-garage-list]', acct), mini = $('[data-garage-mini]', acct);
      if (el) {
        el.innerHTML = list.length ? list.map((c, i) => `<article class="gc ${i ? '' : 'is-pri'}" data-cast-card="${esc(c.handle)}">
          <div class="gc-vis"><span class="gc-sil">${H.silhouette(c.body)}</span>${c.dia ? `<span class="gc-dim mono"><i></i>&Oslash; ${Number(c.dia).toFixed(1)} mm</span>` : ''}${i ? `<span class="mono gc-slot">0${i + 1}</span>` : `<span class="badge new gc-slot">${esc(t('Primary', 'Utama', 'メイン'))}</span>`}</div>
          <div class="gc-b"><div><h3 class="h3">${esc(c.name)}</h3><span class="mono xs muted">${esc([c.maker, c.year, c.axle].filter(Boolean).join(' · '))}</span></div>
            <div class="gc-a"><a class="btn btn-ink btn-sm" href="${base}pages/planner?cast=${encodeURIComponent(c.handle)}">${esc(t('Open in Build Planner', 'Buka di Build Planner', 'プランナーで開く'))} ${ic('arrow')}</a>
              ${i ? `<button class="btn btn-ghost btn-sm" type="button" data-primary="${esc(c.handle)}">${esc(t('Set as primary', 'Jadikan utama', 'メインにする'))}</button>` : ''}
              <button class="btn btn-ghost btn-icon btn-sm gc-rm" type="button" data-uncast="${esc(c.handle)}" aria-label="${esc(t('Remove', 'Hapus', '削除'))}">${ic('trash')}</button></div></div></article>`).join('')
          : empty(t('Your garage is empty', 'Garasi masih kosong', 'ガレージは空です'), t('Add the casting you are building and we will tag parts that fit it.', 'Tambahkan casting yang kamu bangun, kami tandai part yang pas.', '作っている車種を追加すると適合パーツを表示します。'), `<button class="btn btn-signal" type="button" data-open="garage">${ic('plus')}${esc(t('Add your first casting', 'Tambah casting pertama', '最初の車種を追加'))}</button>`);
      }
      if (mini) mini.innerHTML = list.map((c, i) => `<a class="ovc ${i ? '' : 'is-pri'}" href="${base}pages/planner?cast=${encodeURIComponent(c.handle)}"><span class="ovc-sil">${H.silhouette(c.body)}</span><b>${esc(c.name)}</b>${c.dia ? `<em class="mono">&Oslash;${c.dia}</em>` : ''}${i ? '' : `<i class="badge new">${esc(t('Primary', 'Utama', 'メイン'))}</i>`}</a>`).join('') + (list.length < 4 ? `<button class="ovc ovc-add" type="button" data-open="garage">${ic('plus')}<b>${esc(t('Add casting', 'Tambah casting', '車種を追加'))}</b></button>` : '');
      paintCounts();
    }

    function drawBuilds() {
      const el = $('[data-builds-list]', acct); if (!el) return;
      const list = savedBuilds();
      el.innerHTML = list.length ? list.map((b, i) => {
        const items = b.items || [], tot = items.reduce((s, x) => s + (x.p || 0), 0);
        return `<article class="bs" data-bs="${esc(b.id)}"><div class="bs-cast"><span class="mono xs">${esc(b.castName || b.cast || '')}</span></div>
          <div class="bs-m"><span class="mono xs muted">${String(i + 1).padStart(2, '0')} &middot; ${esc(new Date(b.date).toLocaleDateString())}</span><h3 class="h3">${esc(b.name || t('Untitled build', 'Build tanpa nama', '無題'))}</h3>
          <div class="bs-parts">${items.slice(0, 5).map(x => `<a href="${base}products/${esc(x.h)}" title="${esc(x.t || '')}">${x.img ? `<img src="${esc(x.img)}" alt="">` : ''}</a>`).join('')}</div></div>
          <div class="bs-r"><span class="mono bs-tot">${H.money(tot)}</span><span class="xs muted">${items.length} ${esc(t('parts', 'part', '点'))}</span>
          <a class="btn btn-ink btn-sm" href="${base}pages/planner?build=${encodeURIComponent(b.id)}">${esc(t('Load in planner', 'Buka di planner', 'プランナーで開く'))}</a>
          <button class="link xs" type="button" data-bs-cart="${esc(b.id)}">${esc(t('Add all to cart', 'Semua ke keranjang', 'すべてカートへ'))}</button>
          <button class="link xs" type="button" data-bs-del="${esc(b.id)}">${esc(t('Delete', 'Hapus', '削除'))}</button></div></article>`;
      }).join('') : empty(t('No saved builds', 'Belum ada build tersimpan', '保存したビルドはありません'), t('Save a build sheet in the Build Planner and it appears here (on this device).', 'Simpan sheet di Build Planner agar muncul di sini (di device ini).', 'ビルドプランナーで保存するとここに表示されます（この端末のみ）。'));
      paintCounts();
    }

    let wlSeq = 0;
    async function drawWishlist() {
      const el = $('[data-wishlist-grid]', acct); if (!el) return;
      const hs = wish(), seq = ++wlSeq;
      if (!hs.length) { el.style.removeProperty('--cols'); el.className = ''; el.innerHTML =empty(t('Nothing saved yet', 'Belum ada yang disimpan', 'まだ保存がありません'), t('Tap the heart on any part and it lands here (on this device).', 'Tekan ikon hati di part mana saja (di device ini).', 'ハートをタップして保存（この端末のみ）。')); paintCounts(); return; }
      el.className = 'grid'; el.style.setProperty('--cols', '3');
      const cards = await Promise.all(hs.map(h => fetch(`${base}products/${encodeURIComponent(h)}?section_id=wishlist-card`).then(r => r.ok ? r.text() : '').catch(() => '')));
      if (seq !== wlSeq) return;
      el.innerHTML = cards.join('');
      H.tagFit && H.tagFit(el); H.reveal && H.reveal(el); paintCounts();
    }

    /* ---------- tabs ---------- */
    const panels = $$('.ac-panel[data-panel]', acct);
    const show = (k, first) => {
      if (!panels.length) return;
      if (!panels.some(p => p.dataset.panel === k)) k = 'overview';
      $$('#ac-nav [data-tab]', acct).forEach(a => a.classList.toggle('is-on', a.dataset.tab === k));
      panels.forEach(p => { const on = p.dataset.panel === k; p.hidden = !on; p.classList.toggle('is-enter', on && !first); });
      moveInk();
    };
    const moveInk = () => {
      const a = $('#ac-nav a.is-on', acct), ink = $('.ac-nav-ink', acct); if (!a || !ink) return;
      Object.assign(ink.style, { width: a.offsetWidth + 'px', height: a.offsetHeight + 'px', transform: `translate(${a.offsetLeft}px, ${a.offsetTop}px)` });
    };
    if (panels.length) {
      show(location.hash.slice(1) || 'overview', true);
      window.addEventListener('hashchange', () => show(location.hash.slice(1) || 'overview'));
      window.addEventListener('resize', H.debounce(moveInk, 100));
    }

    /* ---------- events (bound once) ---------- */
    window.__hpzAcct = { drawGarage, drawBuilds, drawWishlist };
    if (!window.__hpzAcctBound) {
      window.__hpzAcctBound = true;
      document.addEventListener('click', e => {
        const a = window.__hpzAcct, tg = e.target;
        if (!tg.closest || !tg.closest('[data-account]')) return;
        const oh = tg.closest('.od-h');
        if (oh) {
          const od = oh.closest('.od'), body = $('.od-b', od), open = !od.classList.contains('is-open');
          od.classList.toggle('is-open', open); oh.setAttribute('aria-expanded', open);
          body.style.height = body.scrollHeight + 'px';
          if (!open) requestAnimationFrame(() => { body.style.height = '0px'; });
          else body.addEventListener('transitionend', function te() { if (od.classList.contains('is-open')) body.style.height = 'auto'; body.removeEventListener('transitionend', te); });
          if (open) { od.querySelectorAll('[data-trk]').forEach(x => { x.classList.remove('is-go'); void x.offsetWidth; requestAnimationFrame(() => x.classList.add('is-go')); }); }
          return;
        }
        const ro = tg.closest('[data-reorder]');
        if (ro) { let items = []; try { items = JSON.parse(ro.dataset.reorder).filter(x => x.id); } catch (er) { /* ignore */ } if (items.length) H.cart.add(items, { from: ro }); else H.toast({ title: t('These parts are sold out', 'Part sudah habis', '在庫切れです') }); return; }
        const pri = tg.closest('[data-primary]'); if (pri) { H.garage.set(pri.dataset.primary); return; }
        const un = tg.closest('[data-uncast]'); if (un) { const h = un.dataset.uncast; H.LS.set('garage', garageHandles().filter(x => x !== h)); H.emit('garage', (H.garage.current() || {}).handle || null); return; }
        const bc = tg.closest('[data-bs-cart]'); if (bc) { const b = savedBuilds().find(x => x.id === bc.dataset.bsCart); if (b) H.cart.addBundle((b.items || []).map(x => x.vid), { bundleId: b.id }); return; }
        const bd = tg.closest('[data-bs-del]'); if (bd) { H.LS.set('builds', savedBuilds().filter(x => x.id !== bd.dataset.bsDel)); a.drawBuilds(); return; }
        /* addresses */
        const forms = () => $$('.ad-form');
        if (tg.closest('[data-ad-new]')) { forms().forEach(f => { f.hidden = true; }); const f = $('#ad-form-new'); if (f) { f.hidden = false; f.scrollIntoView({ behavior: 'smooth', block: 'center' }); } return; }
        const ae = tg.closest('[data-ad-edit]'); if (ae) { forms().forEach(f => { f.hidden = true; }); const f = document.getElementById(ae.dataset.adEdit); if (f) { f.hidden = false; f.scrollIntoView({ behavior: 'smooth', block: 'center' }); } return; }
        if (tg.closest('[data-ad-cancel]')) { tg.closest('.ad-form').hidden = true; return; }
        const ad = tg.closest('[data-ad-delete]');
        if (ad) { if (window.confirm(ad.dataset.confirm || 'Delete?')) { if (window.Shopify && Shopify.postLink) Shopify.postLink('/account/addresses/' + ad.dataset.adDelete, { parameters: { _method: 'delete' } }); } return; }
      });
      document.addEventListener('hpz:garage', () => { window.__hpzAcct && window.__hpzAcct.drawGarage(); });
      document.addEventListener('hpz:wish', () => { window.__hpzAcct && window.__hpzAcct.drawWishlist(); });
    }

    /* address country/province selectors (needs shopify_common.js) */
    const initCountries = () => {
      if (!(window.Shopify && Shopify.CountryProvinceSelector)) return false;
      $$('[data-address-country]').forEach(sel => {
        const uid = sel.id.replace('AddressCountry_', '');
        new Shopify.CountryProvinceSelector(sel.id, 'AddressProvince_' + uid, { hideElement: 'AddressProvinceContainer_' + uid });
      });
      return true;
    };
    if ($('[data-address-country]')) { let n = 0; const iv = setInterval(() => { if (initCountries() || ++n > 30) clearInterval(iv); }, 150); }

    drawGarage(); drawBuilds(); drawWishlist();
  };
  const start = () => HPZ.ready(boot);
  if (window.HPZ) start(); else document.addEventListener('DOMContentLoaded', () => window.HPZ && start());
  document.addEventListener('shopify:section:load', () => { if (window.HPZ) start(); });
})();
