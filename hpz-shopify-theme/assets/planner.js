/* HPZ - Build Planner
   Guided flow: casting > wheels > livery > aero & body > engine & interior > build sheet.
   Data: HPZ.cfg.castings (casting metaobjects) + product rows fetched from the planner-results section
   (/collections/<handle>?section_id=planner-results&page=N). Cart: HPZ.cart.addBundle(). */
(function () {
  const boot = () => {
    const H = window.HPZ, t = H.t, esc = H.esc;
    const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
    const ic = n => (H.ICON && H.ICON[n]) || '';
    const root = $('[data-planner]'); if (!root) return;
    const D = root.dataset;
    const base = (D.root || '/').replace(/\/?$/, '/');
    const bundleOn = D.bundle === 'true', bundlePct = +D.bundlePct || 10, maxPages = +D.maxPages || 5;
    const castings = (H.cfg && H.cfg.castings) || [];
    const castBy = h => castings.find(c => c.handle === h) || null;
    const params = new URLSearchParams(location.search);
    const P0 = H.LS.get('plan', {});

    const KIND = { wheels: 'wheels', decals: 'decals', 'body kits': 'bodykits', engines: 'engines', 'aero & exterior': 'exterior', interior: 'interior', dioramas: 'dioramas' };
    const ROLE = () => ({ wheels: t('Wheels', 'Velg', 'ホイール'), decals: t('Livery', 'Livery', 'カラー'), bodykits: t('Body kit', 'Body kit', 'ボディキット'), exterior: t('Aero & exterior', 'Aero & eksterior', 'エアロ'), engines: t('Engine', 'Mesin', 'エンジン'), interior: t('Interior', 'Interior', '内装'), dioramas: t('Diorama', 'Diorama', 'ジオラマ') });
    const BODY = { white: '#f2f2ef', black: '#1d1f22', red: '#c8202a', blue: '#2453c8', silver: '#b9bec6', yellow: '#f2c200', green: '#1e4b40' };
    const STEPS = () => [
      ['cast', t('Casting', 'Casting', '車種')], ['wheel', t('Wheels', 'Velg', 'ホイール')], ['decal', t('Livery', 'Livery', 'カラー')],
      ['aero', t('Aero & body', 'Aero & body', 'エアロ')], ['engine', t('Engine & interior', 'Mesin & interior', 'エンジン')], ['sheet', t('Build sheet', 'Build sheet', 'ビルドシート')],
    ];

    /* state: slots hold {p: item, vid} */
    const st = { step: 0, cast: null, wheel: null, decal: null, aero: [], engine: [], body: 'white', stance: 1, wf: 'fit', q: '', mk: 'all', show: 30 };
    const cache = {};

    /* ---------- data loading ---------- */
    function parseRow(r, hint) {
      const d = r.dataset; let variants = []; try { variants = JSON.parse(d.variants); } catch (e) { /* ignore */ }
      return { id: +d.id, handle: d.handle, title: d.title, url: d.url, img: d.img, brand: d.brand, dia: parseFloat(d.dia) || null, madeFor: (d.madeFor || '').split(',').filter(Boolean), kind: hint || d.kind || KIND[(d.type || '').toLowerCase()] || '', available: d.available === 'true', variants };
    }
    async function fetchRows(path, extra, hint) {
      const out = [];
      for (let pg = 1; pg <= maxPages; pg++) {
        let res = null;
        for (let tr = 0; tr < 3; tr++) { try { res = await fetch(`${base}${path}?section_id=planner-results&page=${pg}${extra || ''}`); } catch (e) { res = null; } if (res && res.ok) break; await new Promise(r => setTimeout(r, 700 * (tr + 1))); }
        if (!res) { if (pg === 1) throw new Error('load'); break; }
        if (!res.ok) { if (pg === 1) throw new Error('load'); break; }
        const box = document.createElement('div'); box.innerHTML = await res.text();
        $$('[data-pl-item]', box).forEach(r => out.push(parseRow(r, hint)));
        if (!$('[data-next]', box)) break;
      }
      return out;
    }
    /* returns cached array, or undefined and kicks off the load (re-renders the panel when done) */
    function coll(handle, extra, hint) {
      if (!handle) return [];
      const key = handle + '|' + (extra || '');
      if (cache[key]) return cache[key].rows;
      if (!cache[key]) {
        cache[key] = { rows: undefined };
        fetchRows('collections/' + handle, extra, hint).catch(() => { const e = []; e.err = true; return e; }).then(rows => { cache[key].rows = rows; panel(); });
      }
      return undefined;
    }
    /* The store has no diameter metafield filter: the whole wheels collection is paged client side and the diameter
       stated in the product text (product-facts) is compared here. Unknown diameter is never guessed. */
    const diaFit = (p, c) => {
      if (p.madeFor.includes(c.handle)) return 'made';
      if (!p.dia || !c.dia) return 'unknown';
      const d = Math.abs(p.dia - c.dia);
      return d === 0 ? 'fit' : d <= 0.5 ? 'close' : 'no';
    };
    const fitOf = (p, c) => c ? H.fits({ dia: p.dia, madeFor: p.madeFor, kind: p.kind }, c) : null;
    const firstAvail = p => p.variants.find(v => v.available) || p.variants[0];
    const variantOf = s => s.p.variants.find(v => v.id === s.vid) || firstAvail(s.p);

    /* ---------- state helpers ---------- */
    const cast = () => castBy(st.cast);
    const slots = () => [st.wheel, st.decal, ...st.aero, ...st.engine].filter(Boolean);
    const lines = () => slots().map(s => ({ s, p: s.p, v: variantOf(s), role: ROLE()[s.p.kind] || t('Part', 'Part', 'パーツ') }));
    const totals = () => { const ls = lines(); const sum = ls.reduce((a, l) => a + l.v.price, 0); const disc = bundleOn && ls.length >= 3 ? Math.round(sum * bundlePct / 100) : 0; return { ls, sum, disc, total: sum - disc }; };
    const compact = s => s && { p: { ...s.p }, vid: s.vid };
    const save = () => H.LS.set('plan', { cast: st.cast, wheel: compact(st.wheel), decal: compact(st.decal), aero: st.aero.map(compact), engine: st.engine.map(compact), body: st.body, stance: st.stance, step: st.step });

    const FIN = [['gunmet', /gun|grey|gray/i], ['black', /black/i], ['chrome', /chrome/i], ['gold', /gold/i], ['bronze', /bronze/i], ['white', /white/i], ['blue', /blue/i], ['red', /red/i], ['pink', /pink/i], ['tosca', /tosca|teal|turq/i], ['silver', /silver/i]];
    const finOf = () => { if (!st.wheel) return 'silver'; const v = variantOf(st.wheel); const f = FIN.find(x => x[1].test(v.title || '')); return f ? f[0] : 'silver'; };
    const spokesOf = () => { if (!st.wheel) return 5; const n = st.wheel.p.title; return /mesh|bbs|lm|rs|gt3/i.test(n) ? 12 : /six|te37|ce28|6/i.test(n) ? 6 : /10|multi|chd|hur/i.test(n) ? 10 : 5; };
    const styleOf = () => { if (!st.wheel) return 'spoke'; const n = st.wheel.p.title; return /mesh|bbs|lm|rs/i.test(n) ? 'mesh' : /dish|meister|work|vs|longchamp/i.test(n) ? 'dish' : /aero|disc/i.test(n) ? 'disc' : 'spoke'; };

    /* ---------- steps bar ---------- */
    function steps() {
      const done = [!!st.cast, !!st.wheel, !!st.decal, st.aero.length > 0, st.engine.length > 0, false];
      $('#pl-steps').innerHTML = STEPS().map(([k, l], i) => `<li class="${i === st.step ? 'is-on' : ''} ${done[i] ? 'is-done' : ''}"><button type="button" data-go="${i}" ${!st.cast && i > 0 ? 'disabled' : ''}><span class="mono">${done[i] ? ic('check') : String(i + 1).padStart(2, '0')}</span><b>${esc(l)}</b></button></li>`).join('');
    }

    /* ---------- stage ---------- */
    function stage(anim) {
      const c = cast(), el = $('#stage');
      if (!c) { el.innerHTML = `<div class="st-empty"><div class="st-w">${H.wheelSVG({ spokes: 6, finish: 'gold' })}</div><b>${esc(t('Pick a casting to start', 'Pilih casting untuk mulai', '車種を選んでスタート'))}</b>${castings.length ? `<span class="mono">${castings.length} ${esc(t('castings listed', 'casting terdaftar', '車種を登録済'))}</span>` : ''}</div>`; return; }
      const wp = st.wheel ? st.wheel.p : null, dia = wp && wp.dia ? wp.dia : c.dia;
      const f = wp ? fitOf(wp, c) : null;
      const T = totals();
      const wheel = H.wheelSVG({ spokes: spokesOf(), finish: finOf(), style: styleOf() });
      const drop = [0, 2.2, 4.2][st.stance];
      const sil = H.SIL || {}, path = sil[c.body] || sil.coupe || '';
      const wing = st.aero.some(s => /wing|spoiler/i.test(s.p.title));
      const wingPath = c.body === 'truck' ? 'M168 22 h22 v3 h-22 z M176 25 l1 5 h2 l0 -5 z' : c.body === 'hatch' ? 'M146 13 h26 v3 h-26 z M156 16 l1 3 h2 l0 -3 z' : 'M152 22 h32 v3 h-32 z M162 25 l1.5 7 h2 l-.5 -7 z M176 25 l1.5 8 h2 l-.5 -8 z';
      const light = ['white', 'silver', 'yellow'].includes(st.body);
      el.innerHTML = `<div class="st-h"><span class="mono">${esc((c.maker || '').toUpperCase())}${c.year ? ' &middot; ' + esc(c.year) : ''}</span><b>${esc(c.name)}</b></div>
      <div class="st-car ${anim || ''}" style="--w:${(dia || 10) * 1.55}%;--drop:${drop}%">
        <svg class="st-body" viewBox="0 0 200 70" aria-hidden="true"><path d="${path}" fill="${BODY[st.body]}"/>${st.decal ? `<path class="st-liv" d="M40 40 L160 34" stroke="${light ? '#e5306b' : '#ffd100'}" stroke-width="3"/><path class="st-liv" d="M60 44 L150 39" stroke="#0e0f11" stroke-width="1.2"/>` : ''}${wing ? `<path class="st-wing" d="${wingPath}" fill="#0e0f11"/>` : ''}</svg>
        <span class="st-wh st-w1">${wheel}</span><span class="st-wh st-w2">${wheel}</span>
        ${wp && wp.dia ? `<span class="st-dim mono">&Oslash;${dia} mm</span>` : c.dia ? `<span class="st-dim is-ghost mono">&Oslash;${c.dia} mm ${esc(t('recommended', 'disarankan', '推奨'))}</span>` : ''}
      </div>
      <div class="st-ground"></div>
      <div class="st-ctl">
        <div class="st-c"><span class="mono">${esc(t('Paint', 'Cat', '塗装'))}</span><div class="st-paint">${Object.entries(BODY).map(([k, v]) => `<button type="button" class="${k === st.body ? 'is-on' : ''}" data-body="${k}" style="--c:${v}" aria-label="${k}"></button>`).join('')}</div></div>
        <div class="st-c"><span class="mono">${esc(t('Stance', 'Stance', '車高'))}</span><div class="seg st-seg">${[t('Stock', 'Standar', 'ノーマル'), t('Lowered', 'Ceper', 'ローダウン'), t('Slammed', 'Ceper banget', 'シャコタン')].map((l, i) => `<button type="button" class="${i === st.stance ? 'is-on' : ''}" data-stance="${i}">${esc(l)}</button>`).join('')}</div></div>
      </div>
      ${f && f !== 'universal' ? `<div class="st-fit st-${f === 'made' ? 'fit' : f}">${f === 'fit' || f === 'made' ? ic('check') + esc(f === 'made' ? t('Made for it', 'Khusus', '専用') : t('Flush fit', 'Pas rata', 'ツライチ')) : f === 'close' ? ic('info') + esc(t('Tucked, 0.5 mm off', 'Masuk, selisih 0,5 mm', '0.5mm差')) : ic('close') + esc(t('Will not fit', 'Tidak muat', '非適合'))}</div>` : ''}
      <div class="st-tags">${T.ls.map(l => `<span><i class="mono">${esc(l.role)}</i>${esc(l.p.title)}</span>`).join('')}</div>`;
    }

    /* ---------- mini build sheet ---------- */
    function sheet() {
      const T = totals(), n = T.ls.length;
      $('#sheet').innerHTML = `<div class="sh-h"><span class="eyebrow"><b>${esc(t('Build sheet', 'Build sheet', 'ビルドシート'))}</b></span><span class="mono xs">${n} ${esc(t('parts', 'part', '点'))}</span></div>
      ${n ? `<ul>${T.ls.map(l => `<li><img src="${esc(l.v.img || l.p.img)}" alt=""><span><em class="mono">${esc(l.role)}</em><b>${esc(l.p.title)}</b></span><span class="mono">${H.money(l.v.price)}</span><button type="button" data-drop="${l.p.id}" aria-label="${esc(t('Remove', 'Hapus', '削除'))}">${ic('close')}</button></li>`).join('')}</ul>` : `<p class="xs muted">${esc(t('Parts you choose appear here.', 'Part yang dipilih muncul di sini.', '選んだパーツがここに表示されます。'))}</p>`}
      ${bundleOn ? `<div class="sh-meter"><div class="sh-bar"><i style="width:${Math.min(1, n / 3) * 100}%"></i>${[1, 2, 3].map(k => `<b class="${n >= k ? 'on' : ''}" style="left:${k / 3 * 100}%"></b>`).join('')}</div><span class="xs">${n >= 3 ? `<b class="ok">${esc(t(`Bundle unlocked: ${bundlePct}% off every part`, `Bundle aktif: diskon ${bundlePct}% semua part`, `セット割適用: 全パーツ${bundlePct}%オフ`))}</b>` : `${3 - n} ${esc(t(`more part(s) to unlock ${bundlePct}% off`, `part lagi untuk diskon ${bundlePct}%`, `点追加で${bundlePct}%オフ`))}`}</span></div>` : ''}
      <div class="sh-tot"><span>${esc(t('Total', 'Total', '合計'))}</span><span>${T.disc ? `<s class="mono">${H.money(T.sum)}</s>` : ''}<b class="mono" id="sh-total">${H.money(T.total)}</b></span></div>
      <button class="btn btn-signal btn-block" type="button" data-addall ${n ? '' : 'disabled'}>${ic('cart')}${esc(t('Add build to cart', 'Tambah build ke keranjang', 'カートに追加'))}</button>`;
    }

    /* ---------- panel ---------- */
    const isOn = (p) => slots().some(s => s.p.id === p.id);
    function pick(p) {
      const c = cast(), f = c ? fitOf(p, c) : null, on = isOn(p);
      const slot = slots().find(s => s.p.id === p.id);
      const v = slot ? variantOf(slot) : firstAvail(p);
      const sku = v && v.sku;
      const vs = on && p.variants.length > 1 && !(p.variants.length === 1 && p.variants[0].title === 'Default Title') ? `<div class="pk-v">${p.variants.map(x => `<button type="button" class="vp-b ${x.id === v.id ? 'is-on' : ''} ${x.available ? '' : 'is-out'}" data-pid="${p.id}" data-pvid="${x.id}" ${x.available ? '' : 'disabled'}>${esc(x.title)}</button>`).join('')}</div>` : '';
      return `<div class="pk ${on ? 'is-on' : ''} ${p.available ? '' : 'is-out'}" data-pk="${p.id}"><button type="button" class="pk-main" data-pick="${p.id}" ${p.available ? '' : 'disabled'}><img src="${esc(p.img)}" alt="" loading="lazy"><span class="pk-t"><em>${p.brand ? esc(p.brand) : ''}${p.brand && sku ? ' &middot; ' : ''}${sku ? `<span class="mono">${esc(sku)}</span>` : ''}</em><b>${esc(p.title)}</b><span class="pk-m">${p.dia ? `<i class="mono">&Oslash;${p.dia}</i>` : ''}${f === 'fit' || f === 'made' ? `<i class="pk-ok">${ic('check')}${esc(f === 'made' ? t('Made for it', 'Khusus', '専用') : t('Flush', 'Pas', '適合'))}</i>` : f === 'close' ? '<i class="pk-cl">&plusmn;0.5</i>' : ''}</span></span><span class="pk-p mono">${p.available ? H.money(v.price) : esc(t('Sold out', 'Habis', '在庫切れ'))}</span><span class="pk-ck">${ic('check')}</span></button>${vs}</div>`;
    }
    const loadErr = () => `<p class="pn-note">${ic('info')}${esc(t('Parts could not be loaded.', 'Part gagal dimuat.', 'パーツを読み込めませんでした。'))} <button type="button" class="link small" data-retry>${esc(t('Try again', 'Coba lagi', '再試行'))}</button></p>`;
    const loading = () => `<p class="muted pn-load">${esc(t('Loading parts...', 'Memuat part...', 'パーツを読み込み中...'))}</p>`;
    const none = (msg) => `<p class="pn-note">${ic('info')}${esc(msg)}</p>`;
    const head = (n, h, d) => `<div class="pn-h"><span class="mono">${String(n).padStart(2, '0')} / 06</span><h2 class="h2">${esc(h)}</h2>${d ? `<p class="small muted">${d}</p>` : ''}</div>`;
    const nav = (canNext, skip) => { const S = STEPS(); return `<div class="pn-nav">${st.step > 0 ? `<button class="btn btn-ghost" type="button" data-go="${st.step - 1}">${ic('left')}${esc(t('Back', 'Kembali', '戻る'))}</button>` : '<span></span>'}<div>${skip ? `<button class="link small" type="button" data-go="${st.step + 1}">${esc(t('Skip this step', 'Lewati', 'スキップ'))}</button>` : ''}<button class="btn btn-ink" type="button" data-go="${st.step + 1}" ${canNext ? '' : 'disabled'}>${esc(t('Next', 'Lanjut', '次へ'))} &middot; ${esc(S[st.step + 1] ? S[st.step + 1][1] : '')}${ic('arrow')}</button></div></div>`; };

    function panel() {
      const el = $('#panel'), c = cast(), k = STEPS()[st.step][0]; let html = '';
      if (k === 'cast') {
        const makers = ['all', ...new Set(castings.map(x => x.maker).filter(Boolean))];
        const list = castings.filter(x => (st.mk === 'all' || x.maker === st.mk) && (!st.q || x.name.toLowerCase().includes(st.q.toLowerCase())));
        html = head(1, t('Which casting?', 'Casting apa?', 'どの車種？'), esc(t('Pick the casting you are building. Wheel diameter and made-for parts come from the store data.', 'Pilih casting yang kamu bangun. Diameter velg dan part khusus berasal dari data toko.', '作る車種を選択。ホイール径と専用パーツはストアのデータに基づきます。'))) +
          `<div class="pn-tools"><div class="g-s">${ic('search')}<input class="input" id="pq" placeholder="${esc(t('Search castings...', 'Cari casting...', '車種を検索...'))}" value="${esc(st.q)}"></div><div class="seg">${makers.map(m => `<button type="button" class="${m === st.mk ? 'is-on' : ''}" data-mk="${esc(m)}">${m === 'all' ? esc(t('All', 'Semua', 'すべて')) : esc(m)}</button>`).join('')}</div></div>
          ${castings.length ? '' : none(t('No castings have been added yet.', 'Belum ada casting.', '車種はまだ登録されていません。'))}
          <div class="cg">${list.map(x => `<button type="button" class="cg-i ${x.handle === st.cast ? 'is-on' : ''}" data-cast="${esc(x.handle)}"><span class="cg-s">${H.silhouette(x.body)}</span><b>${esc(x.name)}</b><span class="cg-m">${x.maker ? `<i class="mono">${esc(x.maker)}</i>` : ''}${x.dia ? `<i class="mono">&Oslash;${x.dia}</i>` : ''}</span></button>`).join('')}</div>` + nav(!!st.cast);
      }
      if (k === 'wheel') {
        const hd = head(2, t('Wheels', 'Velg', 'ホイール'), `${esc(t('Recommended for', 'Disarankan untuk', '推奨'))} ${esc(c.name)}: ${c.dia ? `<b class="mono">&Oslash;${c.dia} mm</b>` : ''}${c.axle ? ' &middot; ' + esc(c.axle) : ''}`);
        const tools = `<div class="pn-tools"><div class="seg">${[['fit', `${t('Flush', 'Pas', 'ツライチ')} &Oslash;${c.dia}`], ['close', t('Incl. &plusmn;0.5 mm', 'Termasuk &plusmn;0,5 mm', '&plusmn;0.5含む')], ['all', t('All sizes', 'Semua ukuran', '全サイズ')]].map(([v, l]) => `<button type="button" class="${v === st.wf ? 'is-on' : ''}" data-wf="${v}">${l}</button>`).join('')}</div></div>`;
        if (!D.wheels) html = hd + none(t('No wheels collection is set in the section settings.', 'Koleksi velg belum diatur.', 'ホイールのコレクションが未設定です。')) + nav(true, true);
        else {
          const rows = coll(D.wheels, '', 'wheels');
          let body;
          if (!rows) body = loading();
          else if (rows.err) body = loadErr();
          else {
            const byAvail = (x, y) => (y.available ? 1 : 0) - (x.available ? 1 : 0);
            const known = rows.filter(p => p.dia).length;
            const grp = k => rows.filter(p => { const f = diaFit(p, c); return k === 'match' ? (st.wf === 'close' ? ['fit', 'made', 'close'].includes(f) : ['fit', 'made'].includes(f)) : k === 'unknown' ? f === 'unknown' : true; }).sort(byAvail);
            const note = !known ? none(t('No wheel in the store states its diameter yet, so all sizes are shown. Check the size in the description before buying.', 'Belum ada velg yang menyebut diameter, jadi semua ukuran ditampilkan. Cek ukuran di deskripsi.', '径の記載がないため全サイズを表示しています。')) : '';
            const mode = !known ? 'all' : st.wf;
            const showAll = mode === 'all';
            const matched = showAll ? rows.filter(p => p.dia).sort(byAvail) : grp('match');
            const unknown = grp('unknown');
            const sect = (title, list) => list.length ? (title ? `<h3 class="pn-sub">${esc(title)}</h3>` : '') + `<div class="pks">${list.slice(0, st.show).map(pick).join('')}</div>` : '';
            const total = matched.length + unknown.length;
            body = note + (total ? sect(showAll && known ? t('Stated diameter', 'Diameter tercantum', '記載径あり') : '', matched) + sect(t('Unknown size', 'Ukuran tidak diketahui', '径不明'), unknown) + (Math.max(matched.length, unknown.length) > st.show ? `<button type="button" class="btn btn-ghost" data-more>${esc(t('Show more', 'Tampilkan lagi', 'もっと見る'))}</button>` : '') : `<p class="muted">${esc(t('No wheels with this stated size. Try "Incl. +/-0.5 mm" or "All sizes".', 'Tidak ada velg dengan ukuran ini. Coba "Semua ukuran".', 'このサイズなし。'))}</p>`);
          }
          html = hd + tools + body + nav(true, true);
        }
      }
      if (k === 'decal') {
        const rows = coll(D.decals, '', 'decals');
        const made = rows ? rows.filter(p => p.madeFor.includes(st.cast)) : [], other = rows ? rows.filter(p => p.available && !p.madeFor.includes(st.cast) && !p.madeFor.length).slice(0, 6) : [];
        html = head(3, t('Livery', 'Livery', 'カラー'), rows && !rows.err ? (made.length ? `${made.length} ${esc(t('sheets made for this casting', 'sheet khusus casting ini', '枚の専用シート'))}` : esc(t('No sheet made for this casting yet.', 'Belum ada sheet untuk casting ini.', 'この車種専用シートはまだありません。'))) : '') +
          (!D.decals ? none(t('No decals collection is set in the section settings.', 'Koleksi decal belum diatur.', 'デカールのコレクションが未設定です。')) : !rows ? loading() : rows.err ? loadErr() :
            `${made.length ? `<div class="pks">${made.map(pick).join('')}</div>` : ''}
            ${D.studioUrl && D.studioText ? `<a class="studio mat" href="${esc(D.studioUrl)}"><span class="eyebrow"><b>${esc(D.studioText)}</b></span>${ic('arrow')}</a>` : ''}
            ${other.length ? `<h3 class="pn-sub">${esc(t('Universal & other sheets', 'Sheet universal & lainnya', 'その他のシート'))}</h3><div class="pks">${other.map(pick).join('')}</div>` : ''}`) + nav(true, true);
      }
      if (k === 'aero') {
        const kits = coll(D.bodykits, '', 'bodykits'), ext = coll(D.exterior, '', 'exterior');
        const loadingAny = (D.bodykits && !kits) || (D.exterior && !ext);
        const made = (kits || []).filter(p => p.madeFor.includes(st.cast)), ex = (ext || []).filter(p => p.available).slice(0, 12);
        html = head(4, t('Aero & body', 'Aero & body', 'エアロ・ボディ'), esc(t('Pick as many as you like.', 'Pilih sebanyak yang kamu mau.', '複数選択可。'))) +
          (loadingAny ? loading() : `${made.length ? `<h3 class="pn-sub">${esc(t('Body kits for', 'Body kit untuk', 'ボディキット：'))} ${esc(c.name)}</h3><div class="pks">${made.map(pick).join('')}</div>` : none(t('No body kit for this casting yet. Wings and mirrors below fit most cars.', 'Belum ada body kit untuk casting ini.', 'ボディキットはまだありません。'))}
          ${ex.length ? `<h3 class="pn-sub">${esc(t('Wings, mirrors & racks', 'Wing, spion & rack', 'ウイング・ミラー'))}</h3><div class="pks">${ex.map(pick).join('')}</div>` : ''}`) + nav(true, true);
      }
      if (k === 'engine') {
        const eng = coll(D.engines, '', 'engines'), int = coll(D.interior, '', 'interior');
        const loadingAny = (D.engines && !eng) || (D.interior && !int);
        const made = (eng || []).filter(p => p.madeFor.includes(st.cast)), rest = (eng || []).filter(p => p.available && !made.includes(p) && !p.madeFor.length).slice(0, 8);
        html = head(5, t('Engine & interior', 'Mesin & interior', 'エンジン・内装'), esc(t('For opening-hood builds and display pieces.', 'Untuk build kap terbuka & display.', 'ボンネット開放ビルドに。'))) +
          (loadingAny ? loading() : `${made.length ? `<h3 class="pn-sub">${esc(t('Matches this casting', 'Cocok untuk casting ini', 'この車種向け'))}</h3><div class="pks">${made.map(pick).join('')}</div>` : ''}
          ${rest.length ? `<h3 class="pn-sub">${esc(t('Engine swaps', 'Swap mesin', 'エンジンスワップ'))}</h3><div class="pks">${rest.map(pick).join('')}</div>` : ''}
          ${(int || []).length ? `<h3 class="pn-sub">${esc(t('Interior', 'Interior', '内装'))}</h3><div class="pks">${int.filter(p => p.available).map(pick).join('')}</div>` : ''}`) + nav(true, true);
      }
      if (k === 'sheet') {
        const T = totals(), ref = refOf(T);
        const nm = H.LS.get('planName', `${c.name} ${t('street build', 'street build', 'ストリートビルド')}`);
        html = head(6, t('Build sheet', 'Build sheet', 'ビルドシート'), esc(t('Check it, name it, send it to the cart.', 'Cek, beri nama, masukkan ke keranjang.', '確認してカートへ。'))) +
          `<div class="bs"><div class="bs-h"><div><span class="mono">${ref}</span><input class="bs-name" id="bs-name" value="${esc(nm)}" aria-label="${esc(t('Build name', 'Nama build', 'ビルド名'))}"></div><span class="g-sil">${H.silhouette(c.body)}</span></div>
          <table class="bs-t"><thead><tr><th>#</th><th>${esc(t('Part', 'Part', 'パーツ'))}</th><th>${esc(t('Part no.', 'No. part', '品番'))}</th><th>${esc(t('Fit', 'Fit', '適合'))}</th><th>${esc(t('Price', 'Harga', '価格'))}</th></tr></thead><tbody>
            <tr class="bs-c"><td class="mono">00</td><td><b>${esc(c.name)}</b><em>${esc(t('Your casting, not included', 'Casting kamu, tidak termasuk', 'ベース車（付属なし）'))}</em></td><td></td><td></td><td></td></tr>
            ${T.ls.map((l, i) => { const f = fitOf(l.p, c); return `<tr><td class="mono">${String(i + 1).padStart(2, '0')}</td><td><b>${esc(l.p.title)}</b><em>${esc(l.role)}${l.v.title && l.v.title !== 'Default Title' ? ' &middot; ' + esc(l.v.title) : ''}</em></td><td class="mono">${l.v.sku ? esc(l.v.sku) : ''}</td><td>${f === 'fit' || f === 'made' || f === 'universal' ? `<span class="pk-ok">${ic('check')}</span>` : f === 'close' ? '<span class="pk-cl">&plusmn;0.5</span>' : f === 'no' ? '<span class="pk-no">!</span>' : ''}</td><td class="mono">${H.money(l.v.price)}</td></tr>`; }).join('')}
          </tbody><tfoot>${T.disc ? `<tr><td></td><td colspan="3">${esc(t(`Build bundle -${bundlePct}%`, `Bundle build -${bundlePct}%`, `セット割 -${bundlePct}%`))}</td><td class="mono ok">-${H.money(T.disc)}</td></tr>` : ''}<tr class="bs-tot"><td></td><td colspan="3">${esc(t('Total', 'Total', '合計'))}</td><td class="mono">${H.money(T.total)}</td></tr></tfoot></table>
          <div class="bs-a"><button class="btn btn-signal btn-lg" type="button" data-addall ${T.ls.length ? '' : 'disabled'}>${ic('cart')}${esc(t('Add all to cart', 'Tambah semua ke keranjang', 'すべてカートへ'))}</button><button class="btn btn-ghost btn-lg" type="button" id="bs-save">${ic('heart')}${esc(t('Save build', 'Simpan build', '保存'))}</button><button class="btn btn-ghost btn-lg" type="button" id="bs-share">${ic('arrowUR')}${esc(t('Share', 'Bagikan', '共有'))}</button><button class="btn btn-ghost btn-lg" type="button" id="bs-print">${esc(t('Print', 'Cetak', '印刷'))}</button></div></div>` +
          `<div class="pn-nav"><button class="btn btn-ghost" type="button" data-go="4">${ic('left')}${esc(t('Back', 'Kembali', '戻る'))}</button><button class="link small" type="button" id="bs-reset">${esc(t('Start a new build', 'Mulai build baru', '新しいビルド'))}</button></div>`;
      }
      el.innerHTML = html; el.classList.remove('is-in'); void el.offsetWidth; el.classList.add('is-in');
    }
    const refOf = T => 'BP-' + String(Math.abs([...(st.cast + T.ls.map(l => l.p.id).join(''))].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) | 0, 7)) % 100000).padStart(5, '0');

    function all(anim) { steps(); stage(anim); sheet(); panel(); save(); }
    function go(i) { if (i > 5 || i < 0 || (!st.cast && i > 0)) return; st.step = i; all(); const top = $('.pl-body').getBoundingClientRect().top + scrollY - 150; if (scrollY > top) scrollTo({ top, behavior: 'smooth' }); }

    /* ---------- save / share ---------- */
    function shareURL() {
      const u = new URL(location.origin + location.pathname);
      u.searchParams.set('cast', st.cast);
      if (st.wheel) u.searchParams.set('w', st.wheel.p.handle + ':' + variantOf(st.wheel).id);
      if (st.decal) u.searchParams.set('d', st.decal.p.handle + ':' + variantOf(st.decal).id);
      if (st.aero.length) u.searchParams.set('a', st.aero.map(s => s.p.handle + ':' + variantOf(s).id).join(','));
      if (st.engine.length) u.searchParams.set('e', st.engine.map(s => s.p.handle + ':' + variantOf(s).id).join(','));
      u.searchParams.set('paint', st.body); u.searchParams.set('stance', st.stance);
      return u.toString();
    }
    async function hydrate(spec) { /* 'handle:variantId' */
      const [h, vid] = spec.split(':'); if (!h) return null;
      try {
        const res = await fetch(`${base}products/${encodeURIComponent(h)}?section_id=planner-results`); if (!res.ok) return null;
        const box = document.createElement('div'); box.innerHTML = await res.text();
        const r = $('[data-pl-item]', box); if (!r) return null;
        return { p: parseRow(r), vid: +vid || null };
      } catch (e) { return null; }
    }
    async function restoreFromUrl() {
      const q = params; let b = null;
      if (q.get('build')) { b = (H.LS.get('builds', []) || []).find(x => x.id === q.get('build')); }
      const spec = b ? { cast: b.cast, items: (b.items || []).map(i => i.h + ':' + i.vid) } : { cast: q.get('cast'), items: [q.get('w'), q.get('d'), ...(q.get('a') || '').split(','), ...(q.get('e') || '').split(',')].filter(Boolean) };
      if (spec.cast && castBy(spec.cast)) st.cast = spec.cast;
      if (q.get('paint') && BODY[q.get('paint')]) st.body = q.get('paint');
      if (q.get('stance') != null && !isNaN(+q.get('stance'))) st.stance = Math.min(2, Math.max(0, +q.get('stance')));
      if (spec.items.length) {
        const got = (await Promise.all(spec.items.map(hydrate))).filter(Boolean);
        got.forEach(s => { if (s.p.kind === 'wheels') st.wheel = s; else if (s.p.kind === 'decals') st.decal = s; else if (s.p.kind === 'engines' || s.p.kind === 'interior') st.engine.push(s); else st.aero.push(s); });
        if (st.cast) st.step = 5;
      } else if (st.cast) st.step = 1;
    }

    /* ---------- events ---------- */
    function onClick(e) {
      const tg = e.target; if (!root.contains(tg)) return;
      const g = tg.closest('[data-go]'); if (g && !g.disabled) { go(+g.dataset.go); return; }
      const c = tg.closest('[data-cast]');
      if (c) { const ch = st.cast !== c.dataset.cast; st.cast = c.dataset.cast; if (ch) { st.wheel = null; st.decal = null; st.aero = []; st.engine = []; } H.garage && H.garage.set && H.garage.set(st.cast); all('is-drive'); return; }
      const mk = tg.closest('[data-mk]'); if (mk) { st.mk = mk.dataset.mk; panel(); return; }
      const wf = tg.closest('[data-wf]'); if (wf) { st.wf = wf.dataset.wf; st.show = 30; panel(); return; }
      if (tg.closest('[data-retry]')) { Object.keys(cache).forEach(k => { if (cache[k].rows && cache[k].rows.err) delete cache[k]; }); panel(); return; }
      if (tg.closest('[data-more]')) { st.show += 30; panel(); return; }
      const pv = tg.closest('[data-pvid]'); if (pv) { const s = slots().find(x => x.p.id === +pv.dataset.pid); if (s) { s.vid = +pv.dataset.pvid; all('is-spin'); } return; }
      const pk = tg.closest('[data-pick]');
      if (pk) {
        const id = +pk.dataset.pick, p = findItem(id); if (!p) return;
        const k = STEPS()[st.step][0], s = { p, vid: firstAvail(p).id };
        if (k === 'wheel') { st.wheel = st.wheel && st.wheel.p.id === id ? null : s; all(st.wheel ? 'is-spin' : ''); }
        else if (k === 'decal') { st.decal = st.decal && st.decal.p.id === id ? null : s; all(); }
        else { const arr = st[k]; st[k] = arr.some(x => x.p.id === id) ? arr.filter(x => x.p.id !== id) : [...arr, s]; all(); }
        const sh = $('#sheet'); sh.classList.remove('bump'); void sh.offsetWidth; sh.classList.add('bump'); return;
      }
      const dr = tg.closest('[data-drop]');
      if (dr) { const id = +dr.dataset.drop; if (st.wheel && st.wheel.p.id === id) st.wheel = null; if (st.decal && st.decal.p.id === id) st.decal = null; st.aero = st.aero.filter(x => x.p.id !== id); st.engine = st.engine.filter(x => x.p.id !== id); all(); return; }
      const bd = tg.closest('[data-body]'); if (bd) { st.body = bd.dataset.body; stage(); save(); return; }
      const sn = tg.closest('[data-stance]'); if (sn) { st.stance = +sn.dataset.stance; stage('is-drop'); save(); return; }
      const aa = tg.closest('[data-addall]');
      if (aa) { const ls = totals().ls; if (ls.length) H.cart.addBundle(ls.map(l => l.v.id), { bundleId: refOf(totals()) }); return; }
      if (tg.closest('#bs-save')) {
        const T = totals(), name = $('#bs-name').value, b = H.LS.get('builds', []);
        b.unshift({ id: 'pb' + Date.now().toString(36), name, cast: st.cast, castName: cast().name, items: T.ls.map(l => ({ h: l.p.handle, vid: l.v.id, role: l.role, t: l.p.title, img: l.v.img || l.p.img, p: l.v.price })), date: new Date().toISOString() });
        H.LS.set('builds', b.slice(0, 12));
        H.toast({ title: t('Build saved', 'Build disimpan', '保存しました'), sub: `${name} - ${t('find it in My Garage', 'lihat di Garasi Saya', 'マイガレージで確認')}`, icon: ic('heart') }); return;
      }
      if (tg.closest('#bs-share')) { const u = shareURL(); navigator.clipboard && navigator.clipboard.writeText(u); H.toast({ title: t('Link copied', 'Link disalin', 'コピーしました'), sub: u }); return; }
      if (tg.closest('#bs-print')) { window.print(); return; }
      if (tg.closest('#bs-reset')) { Object.assign(st, { wheel: null, decal: null, aero: [], engine: [], step: 0 }); all(); return; }
    }
    function findItem(id) {
      for (const k in cache) { const r = cache[k].rows; const f = r && r.find(p => p.id === id); if (f) return f; }
      const s = slots().find(x => x.p.id === id); return s ? s.p : null;
    }
    function onInput(e) {
      if (!root.contains(e.target)) return;
      if (e.target.id === 'pq') { st.q = e.target.value; const pos = e.target.selectionStart; panel(); const i = $('#pq'); i.focus(); i.setSelectionRange(pos, pos); }
      if (e.target.id === 'bs-name') H.LS.set('planName', e.target.value);
    }

    /* ---------- init ---------- */
    async function init() {
      const P = P0 || {};
      if (P.cast && castBy(P.cast)) { st.cast = P.cast; st.wheel = P.wheel || null; st.decal = P.decal || null; st.aero = P.aero || []; st.engine = P.engine || []; st.body = P.body || 'white'; st.stance = P.stance != null ? P.stance : 1; st.step = P.step || 1; }
      else { const g = H.garage && H.garage.current && H.garage.current(); if (g) { st.cast = g.handle; st.step = 1; } }
      if (params.get('cast') || params.get('build')) { st.wheel = st.decal = null; st.aero = []; st.engine = []; await restoreFromUrl(); }
      all();
    }
    if (!window.__hpzPlannerBound) {
      window.__hpzPlannerBound = true;
      document.addEventListener('click', e => window.__hpzPlannerClick && window.__hpzPlannerClick(e));
      document.addEventListener('input', e => window.__hpzPlannerInput && window.__hpzPlannerInput(e));
    }
    window.__hpzPlannerClick = onClick; window.__hpzPlannerInput = onInput;
    init();
  };
  const start = () => HPZ.ready(boot);
  if (window.HPZ) start(); else document.addEventListener('DOMContentLoaded', () => window.HPZ && start());
  document.addEventListener('shopify:section:load', e => { if (e.target.querySelector && e.target.querySelector('[data-planner]') && window.HPZ) start(); });
})();
