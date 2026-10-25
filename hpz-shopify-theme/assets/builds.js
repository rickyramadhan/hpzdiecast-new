/* HPZ - Built by You (shoppable UGC)
   Data: `build` metaobjects rendered by sections/main-builds.liquid (each tile embeds a JSON blob).
   Likes: localStorage only (display = build.likes + local increment). Real shared likes need an app. */
(function () {
  const boot = () => {
    const H = window.HPZ, t = H.t, esc = H.esc;
    const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
    const ic = n => (H.ICON && H.ICON[n]) || '';
    const LSK = 'buildLikes';
    let likes = H.LS.get(LSK, {}), filter = 'all', sort = 'likes', cur = null, data = {}, order = [], root = null;

    const likeN = b => (b.likes || 0) + (likes[b.id] ? 1 : 0);
    const fmt = n => Number(n).toLocaleString('en-US');

    function init() {
      root = $('[data-builds]'); if (!root) return;
      data = {}; order = [];
      $$('[data-build-card]', root).forEach(f => {
        try { const j = JSON.parse($('script[data-build-json]', f).textContent); data[j.id] = j; order.push(j.id); } catch (e) { /* skip */ }
      });
      sort = root.dataset.sort || 'likes'; filter = 'all';
      applySort(); paintLikes();
      H.reveal && H.reveal(root); H.countOnView && H.countOnView(root);
      const q = new URLSearchParams(location.search).get('b');
      if (q && data[q]) setTimeout(() => openBuild(q), 300);
    }

    function applySort() {
      const g = $('#bg-grid', root); if (!g) return;
      const figs = $$('[data-build-card]', g);
      const val = f => { const b = data[f.dataset.buildCard]; return sort === 'likes' ? likeN(b) : sort === 'parts' ? b.parts.length : -(+f.dataset.order); };
      figs.sort((a, b) => val(b) - val(a)).forEach(f => g.appendChild(f));
      const cta = $('[data-cta]', g); if (cta) g.appendChild(cta);
      figs.forEach(f => { f.hidden = !(filter === 'all' || f.dataset.casting === filter); });
    }
    function paintLikes() {
      $$('[data-like]').forEach(x => {
        const b = data[x.dataset.like]; if (!b) return;
        x.classList.toggle('is-on', !!likes[b.id]);
        const s = $('span', x); if (s) s.textContent = fmt(likeN(b));
      });
    }

    /* ---------- modal ---------- */
    const bundleOn = () => root && root.dataset.bundle === 'true';
    const bundlePct = () => +(root && root.dataset.bundlePct) || 0;
    function openBuild(id) {
      const b = data[id]; if (!b) return; cur = b;
      const box = $('#bm-box'); if (!box) return;
      const ps = b.parts;
      const thumb = p => p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy">` : '';
      box.innerHTML = `<button class="modal-x" type="button" data-bm-close aria-label="${esc(t('Close', 'Tutup', '閉じる'))}">${ic('close')}</button>
      <div class="bm-in">
        <div class="bm-ph">${b.photo ? `<img src="${esc(b.photo)}" alt="${esc(b.photoAlt || b.title)}">` : ''}
          ${ps.filter(p => p.x != null && p.y != null).map(p => `<div class="hs" style="left:${p.x}%;top:${p.y}%"><button class="hs-dot" type="button" aria-label="${esc(p.title)}"></button><div class="hs-card">${thumb(p)}<div>${p.brand ? `<em>${esc(p.brand)}</em>` : ''}<b>${esc(p.title)}</b><span class="mono">${p.variantTitle ? esc(p.variantTitle) + ' &middot; ' : ''}${H.money(p.price)}</span></div>${p.available ? `<button class="btn btn-signal btn-icon" type="button" data-hs-add="${p.variantId}" aria-label="${esc(t('Add', 'Tambah', '追加'))}">${ic('plus')}</button>` : ''}</div></div>`).join('')}
          ${order.length > 1 ? `<button class="bm-nav bm-prev" type="button" data-bnav="-1" aria-label="${esc(t('Previous', 'Sebelumnya', '前へ'))}">${ic('left')}</button><button class="bm-nav bm-next" type="button" data-bnav="1" aria-label="${esc(t('Next', 'Berikutnya', '次へ'))}">${ic('right')}</button>` : ''}
        </div>
        <div class="bm-i">
          <div class="bm-by">${b.builder ? `<span class="bm-av">${esc(b.builder.charAt(0).toUpperCase())}</span><div><b>@${esc(b.builder)}</b></div>` : '<div></div>'}<button class="bt-like ${likes[b.id] ? 'is-on' : ''}" type="button" data-like="${esc(b.id)}">${ic('heart')}<span class="mono">${fmt(likeN(b))}</span></button></div>
          <h2 class="h2">${esc(b.title)}</h2>
          ${b.casting && b.casting.name ? `<div class="bm-cast"><span class="g-sil">${b.casting.body && H.silhouette ? H.silhouette(b.casting.body) : ''}</span><span><em class="mono">${esc(t('Casting', 'Casting', '車種'))}</em><b>${esc(b.casting.name)}</b></span></div>` : ''}
          ${b.story ? `<p class="bm-story">${esc(b.story)}</p>` : ''}
          ${ps.length ? `<div class="bm-parts"><div class="bm-ph2"><span class="eyebrow"><b>${esc(t('Parts in this build', 'Parts di build ini', '使用パーツ'))}</b></span><span class="xs muted">${ps.length}</span></div>
            <ul>${ps.map((p, i) => `<li class="${p.available ? '' : 'is-out'}"><label class="check"><input type="checkbox" data-bp="${i}" ${p.available ? 'checked' : 'disabled'}><span class="box">${ic('check')}</span></label>${thumb(p)}<a href="${esc(p.url)}?variant=${p.variantId}"><em>${esc(p.kind || '')}${p.brand ? (p.kind ? ' &middot; ' : '') + esc(p.brand) : ''}</em><b>${esc(p.title)}</b>${p.variantTitle ? `<span>${esc(p.variantTitle)}</span>` : ''}</a><span class="mono">${p.available ? H.money(p.price) : esc(t('Sold out', 'Habis', '在庫切れ'))}</span></li>`).join('')}</ul></div>
          <div class="bm-sum" id="bm-sum"></div>` : ''}
          <div class="bm-more">${b.casting && b.casting.handle ? `<a class="link small" href="/pages/planner?cast=${encodeURIComponent(b.casting.handle)}">${esc(t('Open in Build Planner', 'Buka di Build Planner', 'プランナーで開く'))}</a>` : ''}<button class="link small" type="button" data-share="${esc(b.id)}">${esc(t('Copy link', 'Salin link', 'リンクをコピー'))}</button></div>
        </div>
      </div>`;
      sumDraw();
      const m = $('#bm'); m.classList.add('is-open'); const sc = $('.scrim'); sc && sc.classList.add('is-on'); document.body.classList.add('is-locked');
      history.replaceState(null, '', location.pathname + '?b=' + encodeURIComponent(b.id));
    }
    function selected() { return $$('#bm [data-bp]').filter(x => x.checked).map(x => cur.parts[+x.dataset.bp]); }
    function sumDraw() {
      const el = $('#bm-sum'); if (!el) return;
      const items = selected(), sum = items.reduce((s, p) => s + p.price, 0);
      const disc = bundleOn() && items.length > 1 ? Math.round(sum * bundlePct() / 100) : 0;
      el.innerHTML = `<div class="bm-tot"><span>${items.length} ${esc(t('parts', 'part', '点'))}${disc ? ` &middot; <em>-${bundlePct()}% ${esc(t('build bundle', 'bundle build', 'セット割'))}</em>` : ''}</span><span>${disc ? `<s class="mono">${H.money(sum)}</s>` : ''}<b class="mono">${H.money(sum - disc)}</b></span></div><button class="btn btn-signal btn-lg btn-block" type="button" id="bm-add" ${items.length ? '' : 'disabled'}>${ic('cart')}${esc(t('Add build to cart', 'Tambah build ke keranjang', 'ビルドをカートへ'))}</button>`;
    }
    function closeBuild() {
      const m = $('#bm'); if (!m || !m.classList.contains('is-open')) return;
      m.classList.remove('is-open'); const sc = $('.scrim'); sc && sc.classList.remove('is-on'); document.body.classList.remove('is-locked');
      history.replaceState(null, '', location.pathname);
    }

    if (window.__hpzBuildsBound) { init(); return; }
    window.__hpzBuildsBound = true;

    document.addEventListener('click', e => {
      const tg = e.target;
      const bf = tg.closest('[data-bf]');
      if (bf) { filter = bf.dataset.bf; $$('[data-bf]').forEach(x => x.classList.toggle('is-on', x === bf)); applySort(); return; }
      const lk = tg.closest('[data-like]');
      if (lk) { e.stopPropagation(); const id = lk.dataset.like; likes[id] = !likes[id]; H.LS.set(LSK, likes); paintLikes(); lk.classList.remove('pop'); void lk.offsetWidth; lk.classList.add('pop'); return; }
      const bd = tg.closest('[data-build]'); if (bd) { openBuild(bd.dataset.build); return; }
      const nv = tg.closest('[data-bnav]'); if (nv && cur) { const i = order.indexOf(cur.id); openBuild(order[(i + +nv.dataset.bnav + order.length) % order.length]); return; }
      const hd = tg.closest('#bm .hs-dot'); if (hd) { const hs = hd.parentElement; $$('#bm .hs.is-open').forEach(x => x !== hs && x.classList.remove('is-open')); hs.classList.toggle('is-open'); return; }
      const ha = tg.closest('[data-hs-add]');
      if (ha) {
        const p = cur.parts.find(x => String(x.variantId) === ha.dataset.hsAdd);
        document.body.classList.add('no-drawer');
        const r = H.cart.add([{ id: +ha.dataset.hsAdd, quantity: 1 }], { from: ha });
        Promise.resolve(r).finally(() => document.body.classList.remove('no-drawer'));
        H.toast({ title: t('Added to cart', 'Ditambahkan', 'カートに追加'), sub: p && p.title, img: p && p.image });
        return;
      }
      if (tg.closest('#bm-add')) { const ids = selected().map(p => p.variantId); if (ids.length) { closeBuild(); H.cart.addBundle(ids, { bundleId: 'BB-' + cur.id }); } return; }
      const sh = tg.closest('[data-share]');
      if (sh) { const u = location.origin + location.pathname + '?b=' + encodeURIComponent(sh.dataset.share); navigator.clipboard && navigator.clipboard.writeText(u); H.toast({ title: t('Link copied', 'Link disalin', 'コピーしました') }); return; }
      if (tg.closest('[data-bm-close]') || tg.id === 'bm') closeBuild();
    });
    document.addEventListener('change', e => {
      if (e.target.id === 'bg-sort') { sort = e.target.value; applySort(); }
      if (e.target.matches && e.target.matches('#bm [data-bp]')) sumDraw();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeBuild(); });
    document.addEventListener('shopify:section:load', e => { if (e.target.querySelector && e.target.querySelector('[data-builds]')) init(); });
    init();
  };
  if (window.HPZ && HPZ.ready) HPZ.ready(boot); else document.addEventListener('DOMContentLoaded', () => window.HPZ && HPZ.ready(boot));
})();
