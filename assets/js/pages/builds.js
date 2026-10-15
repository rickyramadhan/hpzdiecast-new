/* HPZ — Built by You (shoppable UGC)
   Shopify: metaobject `build` {photo, builder, casting (ref), story, hotspots (json), parts (product list)} + page template;
   submission via Shopify Forms / app proxy into a review queue. */
HPZ.ready(() => {
  const H = HPZ, { $, $$, t, esc, IMG, money, ICON, C, S } = H;
  let likes = H.LS.get('likes', {}), filter = 'all', sort = 'likes';
  const img = b => b.img ? b.img : (H.byH(b.fromProduct) || { img: [] }).img[b.imgIndex || 0];
  const parts = b => {
    const out = [];
    b.spots.forEach(([x, y, h, vn]) => { const p = H.byH(h); if (p && !out.some(o => o.p === p)) out.push({ p, v: H.vByName(p, vn), spot: [x, y] }); });
    b.parts.forEach(h => { const p = H.byH(h); if (p && !out.some(o => o.p === p)) out.push({ p, v: p.v.find(v => v.a) || p.v[0] }); });
    return out;
  };
  const cast = b => b.cast ? H.castById(b.cast) : null;
  const likeN = b => b.likes + (likes[b.id] ? 1 : 0);

  function chips() {
    const cs = [...new Set(C.BUILDS.map(b => b.cast).filter(Boolean))];
    $('#bg-chips').innerHTML = `<button class="chip ${filter === 'all' ? 'is-on' : ''}" data-bf="all">${t('All builds', 'Semua build', 'すべて')} <span class="ct">${C.BUILDS.length}</span></button>` + cs.map(c => `<button class="chip ${filter === c ? 'is-on' : ''}" data-bf="${c}">${esc(H.shortCast(H.castById(c)))} <span class="ct">${C.BUILDS.filter(b => b.cast === c).length}</span></button>`).join('') + `<button class="chip ${filter === 'hpz' ? 'is-on' : ''}" data-bf="hpz">${t('HPZ workshop', 'Workshop HPZ', 'HPZ工房')}</button>`;
  }
  function grid() {
    let list = C.BUILDS.filter(b => filter === 'all' || (filter === 'hpz' ? b.by === 'hpz.workshop' : b.cast === filter));
    list = list.slice().sort((a, b) => sort === 'likes' ? likeN(b) - likeN(a) : sort === 'parts' ? parts(b).length - parts(a).length : C.BUILDS.indexOf(a) - C.BUILDS.indexOf(b));
    const g = $('#bg-grid'); g.classList.add('is-swap');
    setTimeout(() => {
      g.innerHTML = list.map((b, i) => { const ps = parts(b); const c = cast(b); return `<figure class="bt" data-reveal style="--i:${i % 6}">
        <button class="bt-img" data-build="${b.id}" aria-label="${esc(b.title)}"><img src="${IMG(img(b), 700)}" alt="${esc(b.title)}" loading="lazy">
          ${b.spots.map(([x, y]) => `<span class="bt-dot" style="left:${x}%;top:${y}%"></span>`).join('')}
          <span class="bt-shop">${ICON.cart}${t('Shop this build', 'Belanja build ini', 'このビルドを購入')} · ${ps.length} ${t('parts', 'part', '点')}</span></button>
        <figcaption><div><b>${esc(b.title)}</b><span class="mono">@${esc(b.by)}${c ? ` · ${esc(H.shortCast(c))}` : ''}</span></div><button class="bt-like ${likes[b.id] ? 'is-on' : ''}" data-like="${b.id}" aria-label="Like">${ICON.heart}<span class="mono">${likeN(b).toLocaleString('en-US')}</span></button></figcaption></figure>`; }).join('') +
        `<a class="bt bt-cta mat" href="#submit" data-reveal><span class="eyebrow"><b>${t('Your build here', 'Build kamu di sini', 'あなたのビルド')}</b></span><h3>${t('Built something with HPZ parts?', 'Bikin sesuatu dengan parts HPZ?', 'HPZパーツで作りましたか？')}</h3><p>${t('Featured builds earn 500 Pit Points and a spot on the homepage.', 'Build terpilih dapat 500 Pit Points & tampil di homepage.', '掲載で500ポイント。')}</p><span class="arrow-link">${t('Submit', 'Kirim', '投稿')} ${ICON.arrow}</span></a>`;
      g.classList.remove('is-swap'); H.reveal(g);
    }, 160);
  }

  /* ---------- build modal ---------- */
  let cur = null;
  function openBuild(id) {
    const b = C.BUILDS.find(x => x.id === id); if (!b) return; cur = b;
    const ps = parts(b), c = cast(b);
    const box = $('#bm-box');
    const draw = () => {
      const sel = $$('[data-bp]', box).length ? $$('[data-bp]', box).filter(x => x.checked).map(x => +x.dataset.bp) : ps.filter(x => x.v.a).map(x => x.p.id);
      const items = ps.filter(x => sel.includes(x.p.id));
      const sum = items.reduce((s, x) => s + x.v.p, 0), disc = items.length > 1 ? sum * .1 : 0;
      return { items, sum, disc };
    };
    box.innerHTML = `<button class="modal-x" data-close aria-label="Close">${ICON.close}</button>
      <div class="bm-in">
        <div class="bm-ph"><img src="${IMG(img(b), 1200)}" alt="${esc(b.title)}">
          ${ps.filter(x => x.spot).map((x, i) => `<div class="hs" style="left:${x.spot[0]}%;top:${x.spot[1]}%"><button class="hs-dot" data-hsi="${x.p.id}" aria-label="${esc(x.p.t)}"></button><div class="hs-card"><img src="${IMG(x.p.img[x.v.i > -1 ? x.v.i : 0], 120)}" alt=""><div><em>${esc(H.brand(x.p).n)}</em><b>${esc(x.p.t)}</b><span class="mono">${x.v.n ? esc(x.v.n) + ' · ' : ''}${money(x.v.p)}</span></div><button class="btn btn-signal btn-icon" data-hs-add="${x.p.id}" data-v="${x.v.id}" aria-label="Add">${ICON.plus}</button></div></div>`).join('')}
          <button class="bm-nav bm-prev" data-bnav="-1" aria-label="Previous">${ICON.left}</button><button class="bm-nav bm-next" data-bnav="1" aria-label="Next">${ICON.right}</button>
        </div>
        <div class="bm-i">
          <div class="bm-by"><span class="bm-av">${esc(b.by[0].toUpperCase())}</span><div><b>@${esc(b.by)}</b><span class="xs muted">${b.by === 'hpz.workshop' ? t('HPZ workshop build', 'Build workshop HPZ', 'HPZ工房') : t('Community build · verified parts', 'Build komunitas · parts terverifikasi', 'コミュニティ')}</span></div><button class="bt-like ${likes[b.id] ? 'is-on' : ''}" data-like="${b.id}">${ICON.heart}<span class="mono">${likeN(b).toLocaleString('en-US')}</span></button></div>
          <h2 class="h2">${esc(b.title)}</h2>
          ${c ? `<a class="bm-cast" href="shop.html?cast=${c.id}"><span class="g-sil">${H.silhouette(c.body)}</span><span><em class="mono">${t('Casting', 'Casting', '車種')}</em><b>${esc(c.n)}</b></span>${ICON.arrow}</a>` : ''}
          <p class="bm-story">${esc(b.story)}</p>
          <div class="bm-parts"><div class="bm-ph2"><span class="eyebrow"><b>${t('Parts in this build', 'Parts di build ini', '使用パーツ')}</b></span><span class="xs muted">${ps.length} ${t('tagged', 'ditandai', '点')}</span></div>
            <ul>${ps.map(x => `<li class="${x.v.a ? '' : 'is-out'}"><label class="check"><input type="checkbox" data-bp="${x.p.id}" ${x.v.a ? 'checked' : 'disabled'}><span class="box">${ICON.check}</span></label><img src="${IMG(x.p.img[x.v.i > -1 ? x.v.i : 0], 120)}" alt=""><a href="product.html?h=${x.p.h}&variant=${x.v.id}"><em>${esc(C.CATS[x.p.k].short)} · ${esc(H.brand(x.p).n)}</em><b>${esc(x.p.t)}</b>${x.v.n ? `<span>${esc(x.v.n)}</span>` : ''}</a><span class="mono">${x.v.a ? money(x.v.p) : t('Sold out', 'Habis', '在庫切れ')}</span></li>`).join('')}</ul></div>
          <div class="bm-sum" id="bm-sum"></div>
          <div class="bm-more"><a class="link small" href="planner.html?cast=${b.cast || ''}">${t('Open in Build Planner', 'Buka di Build Planner', 'プランナーで開く')}</a><button class="link small" data-share="${b.id}">${t('Copy link', 'Salin link', 'リンクをコピー')}</button></div>
        </div>
      </div>`;
    const sumDraw = () => { const { items, sum, disc } = draw(); $('#bm-sum').innerHTML = `<div class="bm-tot"><span>${items.length} ${t('parts', 'part', '点')}${disc ? ` · <em>−10% ${t('build bundle', 'bundle build', 'セット割')}</em>` : ''}</span><span>${disc ? `<s class="mono">${money(sum)}</s>` : ''}<b class="mono">${money(sum - disc)}</b></span></div><button class="btn btn-signal btn-lg btn-block" id="bm-add" ${items.length ? '' : 'disabled'}>${ICON.cart}${t('Add build to cart', 'Tambah build ke keranjang', 'ビルドをカートへ')}</button>`; };
    sumDraw();
    box.onchange = e => { if (e.target.matches('[data-bp]')) sumDraw(); };
    $('#bm').classList.add('is-open'); $('.scrim').classList.add('is-on'); document.body.classList.add('is-locked');
    history.replaceState(null, '', 'builds.html?b=' + b.id);
  }

  /* ---------- leaderboard ---------- */
  function board() {
    const rows = [['ozzyg_7customs', 'ID', 2051, 6], ['sq_wheelsproject', 'MY', 1776, 4], ['flames.diecast', 'GB', 1517, 5], ['armygreentaco.diecast', 'US', 1284, 3], ['colo.customs', 'AU', 932, 2]];
    const max = rows[0][2];
    $('#board').innerHTML = rows.map(([h, c, l, f], i) => `<li data-reveal style="--i:${i}"><span class="mono bd-r">${String(i + 1).padStart(2, '0')}</span><span class="bd-h">${H.FLAG[c]}<b>@${h}</b></span><span class="bd-bar"><i style="--w:${l / max * 100}%"></i></span><span class="mono bd-l">${l.toLocaleString('en-US')} ${ICON.heart}</span><span class="mono bd-f">${f} ${t('featured', 'featured', '掲載')}</span></li>`).join('');
  }

  /* ---------- submit form ---------- */
  let tagged = [], files = [];
  function form() {
    $('#sub-f').innerHTML = `
      <div class="drop" id="drop"><input type="file" id="files" accept="image/*" multiple hidden><div class="drop-in">${ICON.upload}<b>${t('Drop photos here', 'Taruh foto di sini', '写真をドロップ')}</b><span>${t('or', 'atau', 'または')} <button type="button" class="link" id="pick">${t('browse files', 'pilih file', 'ファイルを選択')}</button></span></div><div class="drop-prev" id="drop-prev"></div></div>
      <div class="row2"><div class="field"><label for="ig">Instagram / TikTok</label><input class="input" id="ig" placeholder="@yourhandle" required></div><div class="field"><label for="sc">${t('Casting', 'Casting', '車種')}</label><select class="select" id="sc"><option value="">${t('Choose…', 'Pilih…', '選択…')}</option>${C.CASTINGS.map(c => `<option value="${c.id}">${esc(c.n)}</option>`).join('')}<option value="other">${t('Other', 'Lainnya', 'その他')}</option></select></div></div>
      <div class="field"><label for="tagq">${t('Tag the HPZ parts you used', 'Tag parts HPZ yang dipakai', '使用したHPZパーツ')}</label><div class="tagbox"><div class="tags" id="tags"></div><input class="input" id="tagq" placeholder="${t('Search: TE37, R34 decal…', 'Cari: TE37, decal R34…', '検索：TE37…')}" autocomplete="off"><div class="tag-sug" id="tag-sug"></div></div></div>
      <div class="field"><label for="story">${t('The story (optional)', 'Cerita (opsional)', 'ストーリー（任意）')}</label><textarea class="textarea" id="story" placeholder="${t('Paint, mods, what was hard…', 'Cat, modifikasi, kesulitan…', '塗装、改造など…')}"></textarea></div>
      <label class="check"><input type="checkbox" required><span class="box">${ICON.check}</span><span class="small">${t('I own these photos and HPZ may feature them with credit.', 'Foto ini milik saya dan HPZ boleh menampilkannya dengan kredit.', '写真の掲載に同意します。')}</span></label>
      <button class="btn btn-ink btn-lg" type="submit">${t('Submit build', 'Kirim build', '投稿する')} ${ICON.arrow}</button>`;
  }
  function drawTags() { $('#tags').innerHTML = tagged.map(p => `<span class="tag"><img src="${IMG(p.img[0], 60)}" alt="">${esc(p.t)}<button type="button" data-untag="${p.id}" aria-label="Remove">${ICON.close}</button></span>`).join(''); }
  function addFiles(list) {
    [...list].slice(0, 6 - files.length).forEach(f => { if (!f.type.startsWith('image/')) return; files.push(f); const r = new FileReader(); r.onload = e => { $('#drop-prev').insertAdjacentHTML('beforeend', `<span class="dp"><img src="${e.target.result}" alt=""><i class="mono">${(f.size / 1048576).toFixed(1)} MB</i></span>`); }; r.readAsDataURL(f); });
    $('#drop').classList.toggle('has-files', files.length > 0);
  }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const tg = e.target;
    const bf = tg.closest('[data-bf]'); if (bf) { filter = bf.dataset.bf; chips(); grid(); return; }
    const lk = tg.closest('[data-like]'); if (lk) { e.stopPropagation(); const id = lk.dataset.like; likes[id] = !likes[id]; H.LS.set('likes', likes); const b = C.BUILDS.find(x => x.id === id); $$(`[data-like="${id}"]`).forEach(x => { x.classList.toggle('is-on', likes[id]); x.querySelector('span').textContent = likeN(b).toLocaleString('en-US'); x.classList.remove('pop'); void x.offsetWidth; x.classList.add('pop'); }); return; }
    const bd = tg.closest('[data-build]'); if (bd) { openBuild(bd.dataset.build); return; }
    const nv = tg.closest('[data-bnav]'); if (nv) { const i = C.BUILDS.indexOf(cur); openBuild(C.BUILDS[(i + +nv.dataset.bnav + C.BUILDS.length) % C.BUILDS.length].id); return; }
    const hd = tg.closest('#bm .hs-dot'); if (hd) { const hs = hd.parentElement; $$('#bm .hs.is-open').forEach(x => x !== hs && x.classList.remove('is-open')); hs.classList.toggle('is-open'); return; }
    const ha = tg.closest('[data-hs-add]'); if (ha) { document.body.classList.add('no-drawer'); H.addToCart(ha.dataset.hsAdd, ha.dataset.v, 1, ha); document.body.classList.remove('no-drawer'); H.toast({ title: t('Added to cart', 'Ditambahkan', 'カートに追加'), sub: H.byId(ha.dataset.hsAdd).t, img: IMG(H.byId(ha.dataset.hsAdd).img[0], 120) }); return; }
    if (tg.closest('#bm-add')) { const sel = $$('#bm [data-bp]').filter(x => x.checked).map(x => +x.dataset.bp); const ps = parts(cur).filter(x => sel.includes(x.p.id)); H.closeAll(); H.addMany(ps.map(x => ({ id: x.p.id, vid: x.v.id, q: 1, bundle: ps.length > 1 })), $('#bg-grid')); return; }
    const sh = tg.closest('[data-share]'); if (sh) { navigator.clipboard && navigator.clipboard.writeText(location.origin + location.pathname + '?b=' + sh.dataset.share); H.toast({ title: t('Link copied', 'Link disalin', 'コピーしました') }); return; }
    if (tg.closest('#pick')) { $('#files').click(); return; }
    const ut = tg.closest('[data-untag]'); if (ut) { tagged = tagged.filter(p => String(p.id) !== ut.dataset.untag); drawTags(); return; }
    const sg = tg.closest('[data-tag]'); if (sg) { const p = H.byId(sg.dataset.tag); if (!tagged.includes(p)) tagged.push(p); drawTags(); $('#tagq').value = ''; $('#tag-sug').innerHTML = ''; return; }
    if (tg.closest('[data-close]') || tg.id === 'bm') history.replaceState(null, '', 'builds.html');
  });
  document.addEventListener('input', e => {
    if (e.target.id !== 'tagq') return; const q = e.target.value.trim();
    $('#tag-sug').innerHTML = q.length < 2 ? '' : H.query({ q }).slice(0, 5).map(p => `<button type="button" data-tag="${p.id}"><img src="${IMG(p.img[0], 60)}" alt=""><span><b>${esc(p.t)}</b><em>${esc(H.brand(p).n)}</em></span></button>`).join('');
  });
  document.addEventListener('change', e => { if (e.target.id === 'files') addFiles(e.target.files); if (e.target.id === 'bg-sort') { sort = e.target.value; grid(); } });
  const drop = () => $('#drop');
  ['dragenter', 'dragover'].forEach(ev => document.addEventListener(ev, e => { if (e.target.closest && e.target.closest('#drop')) { e.preventDefault(); drop().classList.add('is-over'); } }));
  ['dragleave', 'drop'].forEach(ev => document.addEventListener(ev, e => { if (e.target.closest && e.target.closest('#drop')) { e.preventDefault(); drop().classList.remove('is-over'); if (ev === 'drop') addFiles(e.dataTransfer.files); } }));
  document.addEventListener('submit', e => {
    if (e.target.id !== 'sub-f') return; e.preventDefault();
    const f = e.target; f.classList.add('is-sent');
    f.innerHTML = `<div class="sent"><div class="sent-ic">${ICON.tick}</div><span class="mono">REF BB-26-${String(2185 + Math.floor(Math.random() * 40))}</span><h3 class="h2">${t('Build received.', 'Build diterima.', '受け付けました。')}</h3><p>${t('We review every submission within 48 hours. If it is featured, 500 Pit Points land in your account automatically.', 'Kami review dalam 48 jam. Jika terpilih, 500 Pit Points otomatis masuk ke akunmu.', '48時間以内に審査します。')}</p><div class="sent-pts"><b class="mono">+500</b><span>Pit Points ${t('pending review', 'menunggu review', '審査中')}</span></div></div>`;
  });

  chips(); grid(); board(); form(); H.reveal(); H.countOnView();
  const q = H.params().get('b'); if (q) setTimeout(() => openBuild(q), 300);
  H.on('market', () => { chips(); grid(); board(); form(); if (cur && $('#bm.is-open')) openBuild(cur.id); });
});
