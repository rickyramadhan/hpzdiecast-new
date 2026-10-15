/* HPZ — Build Planner
   Guided bundle builder: casting → wheels → livery → aero & body → engine & interior → build sheet.
   Shopify: app block / section reading casting metaobjects + product metafields; adds lines with
   `properties._bundle = BP-xxxx` so a Shopify Function (discount) applies −10% for 3+ parts. */
HPZ.ready(() => {
  const H = HPZ, { $, $$, t, esc, IMG, money, ICON, C, S } = H;
  const P0 = H.LS.get('plan', {});
  const st = {
    step: 0, cast: H.params().get('cast') || (H.myCast() && H.myCast().id) || P0.cast || null,
    wheel: P0.wheel || null, decal: P0.decal || null, aero: P0.aero || [], engine: P0.engine || [],
    body: P0.body || 'white', stance: P0.stance ?? 1, wf: 'fit', q: '', mk: 'all',
  };
  if (st.cast && !H.castById(st.cast)) st.cast = null;
  if (st.cast) st.step = H.params().get('cast') ? 1 : (P0.step || 1);
  const save = () => H.LS.set('plan', { cast: st.cast, wheel: st.wheel, decal: st.decal, aero: st.aero, engine: st.engine, body: st.body, stance: st.stance, step: st.step });

  const STEPS = () => [
    ['cast', t('Casting', 'Casting', '車種')], ['wheel', t('Wheels', 'Velg', 'ホイール')], ['decal', t('Livery', 'Livery', 'カラー')],
    ['aero', t('Aero & body', 'Aero & body', 'エアロ')], ['engine', t('Engine & interior', 'Mesin & interior', 'エンジン')], ['sheet', t('Build sheet', 'Build sheet', 'ビルドシート')],
  ];
  const BODY = { white: '#f2f2ef', black: '#1d1f22', red: '#c8202a', blue: '#2453c8', silver: '#b9bec6', yellow: '#f2c200', green: '#1e4b40' };
  const cast = () => H.castById(st.cast);
  const lines = () => {
    const out = [];
    if (st.wheel) { const p = H.byId(st.wheel.id); if (p) out.push({ p, v: H.variant(p, st.wheel.vid), role: t('Wheels', 'Velg', 'ホイール') }); }
    if (st.decal) { const p = H.byId(st.decal); if (p) out.push({ p, v: p.v.find(v => v.a) || p.v[0], role: t('Livery', 'Livery', 'カラー') }); }
    st.aero.forEach(id => { const p = H.byId(id); if (p) out.push({ p, v: p.v.find(v => v.a) || p.v[0], role: C.CATS[p.k].short }); });
    st.engine.forEach(id => { const p = H.byId(id); if (p) out.push({ p, v: p.v.find(v => v.a) || p.v[0], role: C.CATS[p.k].short }); });
    return out;
  };
  const totals = () => { const ls = lines(); const sum = ls.reduce((s, l) => s + l.v.p, 0); const disc = ls.length >= 3 ? sum * .1 : 0; return { ls, sum, disc, total: sum - disc }; };
  const finOf = () => { if (!st.wheel) return 'silver'; const p = H.byId(st.wheel.id); const v = H.variant(p, st.wheel.vid); const f = H.colorFamily(v.n) || 'silver'; return { gunmet: 'gunmet', grey: 'gunmet', black: 'black', chrome: 'chrome', gold: 'gold', bronze: 'bronze', white: 'white', blue: 'blue', red: 'red', pink: 'pink', tosca: 'tosca' }[f] || 'silver'; };
  const spokesOf = () => { if (!st.wheel) return 5; const n = H.byId(st.wheel.id).t; return /mesh|bbs|lm|rs|gt3/i.test(n) ? 12 : /six|te37|ce28|6/i.test(n) ? 6 : /10|multi|chd|hur/i.test(n) ? 10 : 5; };
  const styleOf = () => { if (!st.wheel) return 'spoke'; const n = H.byId(st.wheel.id).t; return /mesh|bbs|lm|rs/i.test(n) ? 'mesh' : /dish|meister|work|vs|longchamp/i.test(n) ? 'dish' : /aero|disc/i.test(n) ? 'disc' : 'spoke'; };

  /* ---------- steps bar ---------- */
  function steps() {
    const done = [!!st.cast, !!st.wheel, !!st.decal, st.aero.length > 0, st.engine.length > 0, false];
    $('#pl-steps').innerHTML = STEPS().map(([k, l], i) => `<li class="${i === st.step ? 'is-on' : ''} ${done[i] ? 'is-done' : ''}"><button data-go="${i}" ${!st.cast && i > 0 ? 'disabled' : ''}><span class="mono">${done[i] ? ICON.check : String(i + 1).padStart(2, '0')}</span><b>${l}</b></button></li>`).join('');
  }

  /* ---------- stage ---------- */
  function stage(anim) {
    const c = cast(); const el = $('#stage');
    if (!c) { el.innerHTML = `<div class="st-empty"><div class="st-w">${H.wheelSVG({ spokes: 6, finish: 'gold' })}</div><b>${t('Pick a casting to start', 'Pilih casting untuk mulai', '車種を選んでスタート')}</b><span class="mono">${C.CASTINGS.length} ${t('castings measured', 'casting terukur', '車種を計測済')}</span></div>`; return; }
    const p = st.wheel ? H.byId(st.wheel.id) : null; const dia = p && p.sp.dia ? p.sp.dia : c.dia;
    const f = st.wheel ? H.fits(p, c) : null;
    const T = totals();
    const wheel = H.wheelSVG({ spokes: spokesOf(), finish: finOf(), style: styleOf() });
    const drop = [0, 2.2, 4.2][st.stance];
    el.innerHTML = `<div class="st-h"><span class="mono">${esc(c.mk.toUpperCase())} · ${esc(c.yr)}</span><b>${esc(c.n)}</b></div>
      <div class="st-car ${anim || ''}" style="--w:${dia * 1.55}%;--drop:${drop}%">
        <svg class="st-body" viewBox="0 0 200 70" aria-hidden="true"><path d="${H.SIL[c.body] || H.SIL.coupe}" fill="${BODY[st.body]}"/><path d="${H.SILW[c.body] || H.SILW.coupe}" fill="#1b2a30" opacity=".85"/>${st.decal ? `<path class="st-liv" d="M40 40 L160 34" stroke="${st.body === 'white' || st.body === 'silver' || st.body === 'yellow' ? '#e5306b' : '#ffd100'}" stroke-width="3"/><path class="st-liv" d="M60 44 L150 39" stroke="#0e0f11" stroke-width="1.2"/>` : ''}${st.aero.some(id => /wing|spoiler/i.test(H.byId(id).full)) ? `<path class="st-wing" d="${c.body === 'truck' ? 'M168 22 h22 v3 h-22 z M176 25 l1 5 h2 l0 -5 z' : c.body === 'hatch' ? 'M146 13 h26 v3 h-26 z M156 16 l1 3 h2 l0 -3 z' : 'M152 22 h32 v3 h-32 z M162 25 l1.5 7 h2 l-.5 -7 z M176 25 l1.5 8 h2 l-.5 -8 z'}" fill="#0e0f11"/>` : ''}</svg>
        <span class="st-wh st-w1">${wheel}</span><span class="st-wh st-w2">${wheel}</span>
        ${p ? `<span class="st-dim mono">Ø${dia} mm</span>` : `<span class="st-dim is-ghost mono">Ø${c.dia} mm ${t('recommended', 'disarankan', '推奨')}</span>`}
      </div>
      <div class="st-ground"></div>
      <div class="st-ctl">
        <div class="st-c"><span class="mono">${t('Paint', 'Cat', '塗装')}</span><div class="st-paint">${Object.entries(BODY).map(([k, v]) => `<button class="${k === st.body ? 'is-on' : ''}" data-body="${k}" style="--c:${v}" aria-label="${k}"></button>`).join('')}</div></div>
        <div class="st-c"><span class="mono">${t('Stance', 'Stance', '車高')}</span><div class="seg st-seg">${[t('Stock', 'Standar', 'ノーマル'), t('Lowered', 'Ceper', 'ローダウン'), t('Slammed', 'Ceper banget', 'シャコタン')].map((l, i) => `<button class="${i === st.stance ? 'is-on' : ''}" data-stance="${i}">${l}</button>`).join('')}</div></div>
      </div>
      ${f ? `<div class="st-fit st-${f}">${f === 'fit' ? ICON.check + t('Flush fit', 'Pas rata', 'ツライチ') : f === 'close' ? ICON.info + t('Tucked — 0.5 mm off', 'Masuk — selisih 0,5 mm', '0.5mm差') : ICON.close + t('Will not fit', 'Tidak muat', '非適合')}</div>` : ''}
      <div class="st-tags">${T.ls.map(l => `<span><i class="mono">${esc(l.role)}</i>${esc(l.p.t)}</span>`).join('')}</div>`;
  }

  /* ---------- build sheet (mini) ---------- */
  function sheet() {
    const T = totals(); const n = T.ls.length;
    $('#sheet').innerHTML = `<div class="sh-h"><span class="eyebrow"><b>${t('Build sheet', 'Build sheet', 'ビルドシート')}</b></span><span class="mono xs">${n} ${t('parts', 'part', '点')}</span></div>
      ${n ? `<ul>${T.ls.map(l => `<li><img src="${IMG(l.p.img[l.v.i > -1 ? l.v.i : 0], 100)}" alt=""><span><em class="mono">${esc(l.role)}</em><b>${esc(l.p.t)}</b></span><span class="mono">${money(l.v.p)}</span><button data-drop="${l.p.id}" aria-label="Remove">${ICON.close}</button></li>`).join('')}</ul>` : `<p class="xs muted">${t('Parts you choose appear here.', 'Part yang dipilih muncul di sini.', '選んだパーツがここに表示されます。')}</p>`}
      <div class="sh-meter"><div class="sh-bar"><i style="width:${Math.min(1, n / 3) * 100}%"></i>${[1, 2, 3].map(k => `<b class="${n >= k ? 'on' : ''}" style="left:${k / 3 * 100}%"></b>`).join('')}</div><span class="xs">${n >= 3 ? `<b class="ok">${t('Bundle unlocked — 10% off every part', 'Bundle aktif — diskon 10% semua part', 'セット割適用 — 全パーツ10%オフ')}</b>` : `${3 - n} ${t('more part(s) to unlock 10% off', 'part lagi untuk diskon 10%', '点追加で10%オフ')}`}</span></div>
      <div class="sh-tot"><span>${t('Total', 'Total', '合計')}</span><span>${T.disc ? `<s class="mono">${money(T.sum)}</s>` : ''}<b class="mono" id="sh-total">${money(T.total)}</b></span></div>
      <button class="btn btn-signal btn-block" data-addall ${n ? '' : 'disabled'}>${ICON.cart}${t('Add build to cart', 'Tambah build ke keranjang', 'カートに追加')}</button>`;
  }

  /* ---------- panel ---------- */
  const pick = (p, on, extra = '') => { const c = cast(); const f = c ? H.fits(p, c) : null; return `<div class="pk ${on ? 'is-on' : ''} ${p.a ? '' : 'is-out'}" data-pk="${p.id}"><button class="pk-main" data-pick="${p.id}" ${p.a ? '' : 'disabled'}><img src="${IMG(p.img[0], 240)}" alt="" loading="lazy"><span class="pk-t"><em>${esc(H.brand(p).n)} · <span class="mono">${H.partNo(p)}</span></em><b>${esc(p.t)}</b><span class="pk-m">${H.specLine(p).slice(0, 2).map(s => `<i class="mono">${esc(s)}</i>`).join('')}${f === 'fit' || f === 'made' ? `<i class="pk-ok">${ICON.check}${f === 'made' ? t('Made for it', 'Khusus', '専用') : t('Flush', 'Pas', '適合')}</i>` : f === 'close' ? `<i class="pk-cl">±0.5</i>` : ''}</span></span><span class="pk-p mono">${p.a ? money(p.p) : t('Sold out', 'Habis', '在庫切れ')}</span><span class="pk-ck">${ICON.check}</span></button>${extra}</div>`; };
  function panel() {
    const el = $('#panel'); const c = cast(); const k = STEPS()[st.step][0];
    const nav = (canNext = true, skip = false) => `<div class="pn-nav">${st.step > 0 ? `<button class="btn btn-ghost" data-go="${st.step - 1}">${ICON.left}${t('Back', 'Kembali', '戻る')}</button>` : '<span></span>'}<div>${skip ? `<button class="link small" data-go="${st.step + 1}">${t('Skip this step', 'Lewati', 'スキップ')}</button>` : ''}<button class="btn btn-ink" data-go="${st.step + 1}" ${canNext ? '' : 'disabled'}>${t('Next', 'Lanjut', '次へ')} · ${STEPS()[st.step + 1] ? STEPS()[st.step + 1][1] : ''}${ICON.arrow}</button></div></div>`;
    const head = (n, h, d) => `<div class="pn-h"><span class="mono">${String(n).padStart(2, '0')} / 06</span><h2 class="h2">${h}</h2>${d ? `<p class="small muted">${d}</p>` : ''}</div>`;
    let html = '';
    if (k === 'cast') {
      const makers = ['all', ...new Set(C.CASTINGS.map(x => x.mk))];
      const list = C.CASTINGS.filter(x => (st.mk === 'all' || x.mk === st.mk) && (!st.q || x.n.toLowerCase().includes(st.q.toLowerCase())));
      html = head(1, t('Which casting?', 'Casting apa?', 'どの車種？'), t('Fitment is measured on our own castings — wheel diameter, axle and which kits are made for it.', 'Fitment diukur dari casting kami sendiri.', '自社で計測した適合データ。')) +
        `<div class="pn-tools"><div class="g-s">${ICON.search}<input class="input" id="pq" placeholder="${t('Search castings…', 'Cari casting…', '車種を検索…')}" value="${esc(st.q)}"></div><div class="seg">${makers.map(m => `<button class="${m === st.mk ? 'is-on' : ''}" data-mk="${m}">${m === 'all' ? t('All', 'Semua', 'すべて') : m}</button>`).join('')}</div></div>
        <div class="cg">${list.map(x => { const made = H.CAT.filter(p => ['decals', 'bodykits', 'engines'].includes(p.k) && x.m.test(p.full)).length; return `<button class="cg-i ${x.id === st.cast ? 'is-on' : ''}" data-cast="${x.id}"><span class="cg-s">${H.silhouette(x.body)}</span><b>${esc(x.n)}</b><span class="cg-m"><i class="mono">${esc(x.mk)}</i><i class="mono">Ø${x.dia}</i>${made ? `<i class="cg-made">${made} ${t('kits', 'kit', 'キット')}</i>` : ''}</span></button>`; }).join('')}</div>` + nav(!!st.cast);
    }
    if (k === 'wheel') {
      let list = H.query({ k: 'wheels', avail: 1 });
      if (st.wf === 'fit') list = list.filter(p => H.fits(p, c) === 'fit'); else if (st.wf === 'close') list = list.filter(p => ['fit', 'close'].includes(H.fits(p, c)));
      list = list.sort((a, b) => (b.sp.bearing ? 1 : 0) - (a.sp.bearing ? 1 : 0) || (C.BRANDS[b.b].own ? 1 : 0) - (C.BRANDS[a.b].own ? 1 : 0)).slice(0, 30);
      html = head(2, t('Wheels', 'Velg', 'ホイール'), `${t('Recommended for', 'Disarankan untuk', '推奨')} ${esc(H.shortCast(c))}: <b class="mono">Ø${c.dia} mm</b> · ${esc(c.axle)}`) +
        `<div class="pn-tools"><div class="seg">${[['fit', `${t('Flush', 'Pas', 'ツライチ')} Ø${c.dia}`], ['close', t('Incl. ±0.5 mm', 'Termasuk ±0,5 mm', '±0.5含む')], ['all', t('All sizes', 'Semua ukuran', '全サイズ')]].map(([v, l]) => `<button class="${v === st.wf ? 'is-on' : ''}" data-wf="${v}">${l}</button>`).join('')}</div></div>
        <div class="pks">${list.map(p => { const on = st.wheel && st.wheel.id === p.id; const v = on ? H.variant(p, st.wheel.vid) : null; return pick(p, on, on && p.v.length > 1 ? `<div class="pk-v">${p.v.map(x => `<button class="vp-b ${x === v ? 'is-on' : ''} ${x.a ? '' : 'is-out'}" data-wv="${x.id}" ${x.a ? '' : 'disabled'}>${H.swatchBg(x.n) ? `<i style="--c:${H.swatchBg(x.n)}"></i>` : ''}${esc(x.n)}</button>`).join('')}</div>` : ''); }).join('') || `<p class="muted">${t('No wheels in stock at this size. Try “Incl. ±0.5 mm”.', 'Tidak ada stok di ukuran ini.', '在庫なし。')}</p>`}</div>` + nav(true, true);
    }
    if (k === 'decal') {
      const made = H.query({ k: 'decals' }).filter(p => c.m.test(p.full));
      const other = H.query({ k: 'decals', avail: 1 }).filter(p => !made.includes(p)).slice(0, 6);
      html = head(3, t('Livery', 'Livery', 'カラー'), made.length ? `${made.length} ${t('sheets cut for this casting', 'sheet khusus casting ini', '枚の専用シート')}` : t('No sheet made for this casting yet.', 'Belum ada sheet untuk casting ini.', 'この車種専用シートはまだありません。')) +
        `${made.length ? `<div class="pks">${made.map(p => pick(p, st.decal === p.id)).join('')}</div>` : ''}
        <a class="studio mat" href="services.html#decal"><span class="eyebrow"><b>${t('Custom Decal Studio', 'Studio Decal Custom', 'カスタムデカール')}</b></span><b>${t('Want your own livery on the', 'Mau livery sendiri untuk', 'オリジナルカラーを')} ${esc(H.shortCast(c))}?</b><span>${t('We draw it to the casting and print a test sheet — from', 'Kami gambar sesuai casting dan cetak sheet tes — mulai', '作図・テスト印刷 —')} ${money(25, { short: 1 })}</span>${ICON.arrow}</a>
        ${other.length ? `<h3 class="pn-sub">${t('Universal & other sheets', 'Sheet universal & lainnya', 'その他のシート')}</h3><div class="pks">${other.map(p => pick(p, st.decal === p.id)).join('')}</div>` : ''}` + nav(true, true);
    }
    if (k === 'aero') {
      const kits = H.query({ k: 'bodykits' }).filter(p => c.m.test(p.full));
      const ext = H.query({ k: 'exterior', avail: 1 }).slice(0, 12);
      html = head(4, t('Aero & body', 'Aero & body', 'エアロ・ボディ'), t('Pick as many as you like.', 'Pilih sebanyak yang kamu mau.', '複数選択可。')) +
        `${kits.length ? `<h3 class="pn-sub">${t('Body kits for', 'Body kit untuk', 'ボディキット：')} ${esc(H.shortCast(c))}</h3><div class="pks">${kits.map(p => pick(p, st.aero.includes(p.id))).join('')}</div>` : `<p class="pn-note">${ICON.info}${t('No body kit for this casting yet — wings and mirrors below fit most cars.', 'Belum ada body kit untuk casting ini — wing & spion di bawah cocok untuk kebanyakan mobil.', 'ボディキットはまだありません。')}</p>`}
        <h3 class="pn-sub">${t('Wings, mirrors & racks', 'Wing, spion & rack', 'ウイング・ミラー')}</h3><div class="pks">${ext.map(p => pick(p, st.aero.includes(p.id))).join('')}</div>` + nav(true, true);
    }
    if (k === 'engine') {
      const eng = H.query({ k: 'engines' }); const made = eng.filter(p => c.m.test(p.full)); const rest = eng.filter(p => !made.includes(p) && p.a).slice(0, 8);
      const inte = H.query({ k: 'interior' });
      html = head(5, t('Engine & interior', 'Mesin & interior', 'エンジン・内装'), t('For opening-hood builds and display pieces.', 'Untuk build kap terbuka & display.', 'ボンネット開放ビルドに。')) +
        `${made.length ? `<h3 class="pn-sub">${t('Matches this casting', 'Cocok untuk casting ini', 'この車種向け')}</h3><div class="pks">${made.map(p => pick(p, st.engine.includes(p.id))).join('')}</div>` : ''}
        <h3 class="pn-sub">${t('Engine swaps', 'Swap mesin', 'エンジンスワップ')}</h3><div class="pks">${rest.map(p => pick(p, st.engine.includes(p.id))).join('')}</div>
        <h3 class="pn-sub">${t('Interior', 'Interior', '内装')}</h3><div class="pks">${inte.map(p => pick(p, st.engine.includes(p.id))).join('')}</div>` + nav(true, true);
    }
    if (k === 'sheet') {
      const T = totals(); const ref = 'BP-' + String(Math.abs([...(st.cast + T.ls.map(l => l.p.id).join(''))].reduce((h, ch) => h * 31 + ch.charCodeAt(0) | 0, 7)) % 100000).padStart(5, '0');
      html = head(6, t('Build sheet', 'Build sheet', 'ビルドシート'), t('Check it, name it, send it to the cart.', 'Cek, beri nama, masukkan ke keranjang.', '確認してカートへ。')) +
        `<div class="bs"><div class="bs-h"><div><span class="mono">${ref}</span><input class="bs-name" id="bs-name" value="${esc(H.LS.get('planName', `${H.shortCast(c)} street build`))}" aria-label="Build name"></div><span class="g-sil">${H.silhouette(c.body)}</span></div>
          <table class="bs-t"><thead><tr><th>#</th><th>${t('Part', 'Part', 'パーツ')}</th><th>${t('Part no.', 'No. part', '品番')}</th><th>${t('Fit', 'Fit', '適合')}</th><th>${t('Price', 'Harga', '価格')}</th></tr></thead><tbody>
            <tr class="bs-c"><td class="mono">00</td><td><b>${esc(c.n)}</b><em>${t('Your casting — not included', 'Casting kamu — tidak termasuk', 'ベース車（付属なし）')}</em></td><td class="mono">—</td><td></td><td class="mono">—</td></tr>
            ${T.ls.map((l, i) => { const f = H.fits(l.p, c); return `<tr><td class="mono">${String(i + 1).padStart(2, '0')}</td><td><b>${esc(l.p.t)}</b><em>${esc(l.role)}${l.v.n ? ' · ' + esc(l.v.n) : ''}</em></td><td class="mono">${H.partNo(l.p)}</td><td>${f === 'fit' || f === 'made' || f === 'universal' ? `<span class="pk-ok">${ICON.check}</span>` : f === 'close' ? '<span class="pk-cl">±0.5</span>' : '<span class="pk-no">!</span>'}</td><td class="mono">${money(l.v.p)}</td></tr>`; }).join('')}
          </tbody><tfoot>${T.disc ? `<tr><td></td><td colspan="3">${t('Build bundle −10%', 'Bundle build −10%', 'セット割 −10%')}</td><td class="mono ok">−${money(T.disc)}</td></tr>` : ''}<tr class="bs-tot"><td></td><td colspan="3">${t('Total', 'Total', '合計')}</td><td class="mono">${money(T.total)}</td></tr></tfoot></table>
          <div class="bs-a"><button class="btn btn-signal btn-lg" data-addall ${T.ls.length ? '' : 'disabled'}>${ICON.cart}${t('Add all to cart', 'Tambah semua ke keranjang', 'すべてカートへ')}</button><button class="btn btn-ghost btn-lg" id="bs-save">${ICON.heart}${t('Save build', 'Simpan build', '保存')}</button><button class="btn btn-ghost btn-lg" id="bs-share">${ICON.arrowUR}${t('Share', 'Bagikan', '共有')}</button><button class="btn btn-ghost btn-lg" onclick="window.print()">${t('Print', 'Cetak', '印刷')}</button></div></div>` + `<div class="pn-nav"><button class="btn btn-ghost" data-go="4">${ICON.left}${t('Back', 'Kembali', '戻る')}</button><button class="link small" id="bs-reset">${t('Start a new build', 'Mulai build baru', '新しいビルド')}</button></div>`;
    }
    el.innerHTML = html; el.classList.remove('is-in'); void el.offsetWidth; el.classList.add('is-in');
  }

  function all(anim) { steps(); stage(anim); sheet(); panel(); save(); H.applyI18n(); }
  function go(i) { if (i > 5 || (!st.cast && i > 0)) return; st.step = i; all(); const top = $('.pl-body').getBoundingClientRect().top + scrollY - 150; if (scrollY > top) scrollTo({ top, behavior: 'smooth' }); }

  document.addEventListener('click', e => {
    const tg = e.target;
    const g = tg.closest('[data-go]'); if (g && !g.disabled) { go(+g.dataset.go); return; }
    const c = tg.closest('[data-cast]'); if (c) { const changed = st.cast !== c.dataset.cast; st.cast = c.dataset.cast; if (changed) { st.wheel = null; st.decal = null; st.aero = []; st.engine = []; } H.setGarage(st.cast); all('is-drive'); return; }
    const mk = tg.closest('[data-mk]'); if (mk) { st.mk = mk.dataset.mk; panel(); return; }
    const wf = tg.closest('[data-wf]'); if (wf) { st.wf = wf.dataset.wf; panel(); return; }
    const wv = tg.closest('[data-wv]'); if (wv) { st.wheel.vid = +wv.dataset.wv; all('is-spin'); return; }
    const pk = tg.closest('[data-pick]'); if (pk) {
      const p = H.byId(pk.dataset.pick); const k = STEPS()[st.step][0];
      if (k === 'wheel') { st.wheel = st.wheel && st.wheel.id === p.id ? null : { id: p.id, vid: (p.v.find(v => v.a) || p.v[0]).id }; all(st.wheel ? 'is-spin' : ''); }
      else if (k === 'decal') { st.decal = st.decal === p.id ? null : p.id; all(); }
      else { const arr = st[k]; st[k] = arr.includes(p.id) ? arr.filter(x => x !== p.id) : [...arr, p.id]; all(); }
      const sh = $('#sheet'); sh.classList.remove('bump'); void sh.offsetWidth; sh.classList.add('bump'); return;
    }
    const dr = tg.closest('[data-drop]'); if (dr) { const id = +dr.dataset.drop; if (st.wheel && st.wheel.id === id) st.wheel = null; if (st.decal === id) st.decal = null; st.aero = st.aero.filter(x => x !== id); st.engine = st.engine.filter(x => x !== id); all(); return; }
    const bd = tg.closest('[data-body]'); if (bd) { st.body = bd.dataset.body; stage(); save(); return; }
    const sn = tg.closest('[data-stance]'); if (sn) { st.stance = +sn.dataset.stance; stage('is-drop'); save(); return; }
    if (tg.closest('[data-addall]')) { const ls = totals().ls; H.addMany(ls.map(l => ({ id: l.p.id, vid: l.v.id, q: 1, bundle: ls.length >= 3 })), tg.closest('[data-addall]')); return; }
    if (tg.closest('#bs-save')) { const b = H.LS.get('builds', []); const name = $('#bs-name').value; b.unshift({ id: 'pb' + Date.now().toString(36), name, cast: st.cast, items: totals().ls.map(l => l.p.id), date: new Date().toISOString() }); H.LS.set('builds', b.slice(0, 12)); H.toast({ title: t('Build saved', 'Build disimpan', '保存しました'), sub: `${name} — ${t('find it in My Garage', 'lihat di Garasi Saya', 'マイガレージで確認')}`, icon: ICON.heart }); return; }
    if (tg.closest('#bs-share')) { const u = `${location.origin}${location.pathname}?cast=${st.cast}`; navigator.clipboard && navigator.clipboard.writeText(u); H.toast({ title: t('Link copied', 'Link disalin', 'コピーしました'), sub: u }); return; }
    if (tg.closest('#bs-reset')) { Object.assign(st, { wheel: null, decal: null, aero: [], engine: [], step: 0 }); all(); return; }
  });
  document.addEventListener('input', e => { if (e.target.id === 'pq') { st.q = e.target.value; const pos = e.target.selectionStart; panel(); const i = $('#pq'); i.focus(); i.setSelectionRange(pos, pos); } if (e.target.id === 'bs-name') H.LS.set('planName', e.target.value); });

  all();
  H.on('market', () => all());
});
