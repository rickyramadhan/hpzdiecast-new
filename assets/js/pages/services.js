/* HPZ — services page
   Shopify: page.services.json → sections: services-hero, decal-studio (form → app proxy / Shopify Forms),
   commission-build, wholesale, part-request, loyalty (Smile / Rivo), help-centre (FAQ metaobjects) */
HPZ.ready(() => {
  const H = HPZ, { $, $$, t, esc, money, ICON, C, FLAG } = H;
  const arrow = ICON.arrow;
  const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const YY = String(new Date().getFullYear()).slice(2);
  const castOpts = (extra = '') => [...new Set(C.CASTINGS.map(c => c.mk))].map(g => `<optgroup label="${esc(g)}">${C.CASTINGS.filter(c => c.mk === g).map(c => `<option value="${c.id}">${esc(c.n)}</option>`).join('')}</optgroup>`).join('') + extra;
  const keepVal = (sel, html) => { const v = sel.value; sel.innerHTML = html; if (v && [...sel.options].some(o => o.value === v)) sel.value = v; };
  // fake-submit helper: spinner → callback
  function submitting(btn, fn) { btn.classList.add('is-loading'); setTimeout(() => { btn.classList.remove('is-loading'); fn(); }, 900); }
  function needEmail(inp) { const ok = reEmail.test(inp.value.trim()); inp.classList.toggle('is-err', !ok); if (!ok) inp.focus(); return ok; }

  /* ================= hero: service index ================= */
  const SVC = () => [
    ['#decal', 'S-01', t('Custom Decal Studio', 'Studio Decal Custom', 'カスタムデカール'), t('Liveries drawn to your casting', 'Livery digambar sesuai casting', '車種に合わせたカラー'), `${t('from', 'mulai', '〜')} ${money(25, { short: 1 })}`, t('3–7 days', '3–7 hari', '3〜7日')],
    ['#build', 'S-02', t('Commission Build', 'Jasa Build', '受注ビルド'), t('We build the car, you open the box', 'Kami rakit, kamu tinggal buka box', '組み上げてお届け'), `${t('from', 'mulai', '〜')} ${money(65, { short: 1 })}`, t('1–5 weeks', '1–5 minggu', '1〜5週間')],
    ['#wholesale', 'S-03', t('Wholesale & Stockists', 'Grosir & Reseller', '卸売・取扱店'), t('Trade pricing from 20 sets', 'Harga trade mulai 20 set', '20セットから卸価格'), t('20–35% off', 'diskon 20–35%', '20〜35%引'), t('2-day reply', 'balas 2 hari', '2日で返信')],
    ['#request', 'S-04', t('Part / casting request', 'Request part / casting', 'パーツ取り寄せ'), t('We source what is not listed', 'Kami carikan yang belum ada', '未掲載品を手配'), t('Free', 'Gratis', '無料'), t('4–14 days', '4–14 hari', '4〜14日')],
    ['#points', 'S-05', 'Pit Points', t('Loyalty: 1,000 pts = $10', 'Loyalti: 1.000 poin = $10', '1,000pt＝$10'), t('3 tiers', '3 level', '3段階'), t('Auto', 'Otomatis', '自動')],
  ];
  function drawIndex() {
    $('#svh-idx').innerHTML = SVC().map(([href, code, n, d, a, b], i) => `<li style="--i:${i}"><a href="${href}"><span class="mono si-c">${code}</span><span class="si-t"><b>${n}</b><em>${d}</em></span><span class="si-m mono"><b>${a}</b><em>${b}</em></span>${arrow}</a></li>`).join('');
    $('#svh-queue').innerHTML = `<span class="dot pulse"></span><span>${t('On the bench today', 'Di meja kerja hari ini', '本日の作業')}: <b class="mono">9</b> ${t('decal briefs', 'brief decal', 'デカール')} · <b class="mono">3</b> ${t('builds in paint', 'build tahap cat', 'ビルド塗装中')} · <b class="mono">2</b> ${t('trade orders packing', 'order grosir dikemas', '卸梱包中')}</span><a class="link" href="#help">${t('Need help with an order?', 'Butuh bantuan pesanan?', '注文のヘルプ')}</a>`;
  }
  const heroH = $('#svh-h');
  function heroIntro() { heroH.classList.remove('is-in'); delete heroH.dataset.splitDone; H.splitLines(heroH); void heroH.offsetWidth; requestAnimationFrame(() => heroH.classList.add('is-in')); }

  /* ================= S-01 decal studio ================= */
  const CX = {
    logo: { usd: 25, days: 3, n: () => t('Logo only', 'Logo saja', 'ロゴのみ'), d: () => t('Up to 3 marks, single colour per mark', 'Maks 3 logo, 1 warna per logo', '最大3点・単色') },
    partial: { usd: 45, days: 5, n: () => t('Partial livery', 'Livery parsial', 'パーシャル'), d: () => t('Stripes, number boards, sponsors', 'Stripe, nomor, sponsor', 'ストライプ・ゼッケン・スポンサー') },
    full: { usd: 75, days: 7, n: () => t('Full livery', 'Livery penuh', 'フルカラー'), d: () => t('Wrap-style, both sides + bonnet + roof', 'Gaya wrap, dua sisi + kap + atap', '両サイド＋ボンネット＋ルーフ') },
  };
  const TYPE = {
    clear: { add: 0, sheet: 6, days: 0, n: () => t('Transparent', 'Transparan', '透明'), d: () => t('For white / light paint', 'Untuk cat putih / terang', '白・明るい塗装向け') },
    white: { add: 8, sheet: 8, days: 0, n: () => t('White toner', 'White toner', 'ホワイトトナー'), d: () => t('Opaque white on dark paint', 'Putih opak di cat gelap', '濃色ボディに白') },
    both: { add: 14, sheet: 12, days: 1, n: () => t('Both', 'Keduanya', '両方'), d: () => t('Colour layer + white underlay', 'Lapisan warna + dasar putih', 'カラー＋白下地') },
  };
  const ds = { cast: 'civic-eg6', type: 'clear', cx: 'partial', q: 2, rush: false, files: [] };
  let lastTotal = 0, sent = null;

  function calc() {
    const c = CX[ds.cx], ty = TYPE[ds.type];
    const lines = [[t('Artwork & template fitting', 'Artwork & penyesuaian template', 'デザイン・テンプレート調整') + ' — ' + c.n(), c.usd]];
    if (ty.add) lines.push([ty.n() + ' ' + t('print', 'cetak', '印刷'), ty.add]);
    if (ds.q > 1) lines.push([`${t('Extra sheets', 'Sheet tambahan', '追加シート')} ${ds.q - 1} × ${money(ty.sheet)}`, (ds.q - 1) * ty.sheet]);
    let days = c.days + ty.days + (ds.q > 10 ? 1 : 0);
    if (ds.cast === 'other') { lines.push([t('Measure a new casting', 'Ukur casting baru', '新規車種の採寸'), 10]); days += 2; }
    const sub = lines.reduce((s, l) => s + l[1], 0);
    if (ds.rush) { lines.push([t('Rush (+40%)', 'Rush (+40%)', '特急 (+40%)'), Math.round(sub * .4 * 100) / 100]); days = Math.max(2, Math.ceil(days * .5)); }
    const total = lines.reduce((s, l) => s + l[1], 0);
    // process split: proof / print / ship-out
    const proof = Math.max(1, Math.round(days * .45)), print = Math.max(1, days - proof - 1);
    return { lines, total, days, split: [proof, print, days - proof - print] };
  }
  function cardSil(kind) { // silhouette showing decal coverage
    const id = 'cv' + kind, p = H.SIL.coupe;
    const cover = kind === 'logo' ? '<rect x="92" y="36" width="20" height="8" rx="1" class="cv-d"/>' : kind === 'partial' ? '<rect x="0" y="37" width="200" height="6" class="cv-d"/><rect x="104" y="27" width="10" height="7" class="cv-d"/>' : `<rect x="0" y="0" width="200" height="70" fill="url(#${id}h)"/>`;
    return `<svg viewBox="0 0 200 60" aria-hidden="true"><defs><clipPath id="${id}c"><path d="${p}"/></clipPath><pattern id="${id}h" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="6" class="cv-d"/></pattern></defs><path d="${p}" class="cv-b"/><g clip-path="url(#${id}c)">${cover}</g><circle cx="48" cy="52" r="8" class="cv-w"/><circle cx="152" cy="52" r="8" class="cv-w"/></svg>`;
  }
  const typeSw = k => `<span class="tsw tsw-${k}" aria-hidden="true"><i>HPZ</i></span>`;
  function drawDecalForm() {
    keepVal($('#ds-cast'), castOpts(`<optgroup label="—"><option value="other">${t('Not listed — measure mine (+$10)', 'Tidak ada — ukur punyaku (+$10)', '未掲載 — 採寸 (+$10)')}</option></optgroup>`));
    if (!$('#ds-cast').value || $('#ds-cast').value !== ds.cast) $('#ds-cast').value = ds.cast;
    $('#ds-type').innerHTML = Object.entries(TYPE).map(([k, o]) => `<label class="oc ${ds.type === k ? 'is-on' : ''}"><input type="radio" name="ds-type" value="${k}" ${ds.type === k ? 'checked' : ''}>${typeSw(k)}<b>${o.n()}</b><em>${o.d()}</em><span class="oc-p mono">${o.add ? '+' + money(o.add, { short: 1 }) : t('incl.', 'termasuk', '込み')}</span></label>`).join('');
    $('#ds-cx').innerHTML = Object.entries(CX).map(([k, o]) => `<label class="oc oc-cx ${ds.cx === k ? 'is-on' : ''}"><input type="radio" name="ds-cx" value="${k}" ${ds.cx === k ? 'checked' : ''}>${cardSil(k)}<b>${o.n()}</b><em>${o.d()}</em><span class="oc-p mono">${money(o.usd, { short: 1 })}</span></label>`).join('');
    castNote();
  }
  function castNote() {
    const c = H.castById(ds.cast);
    if (!c) { $('#ds-cast-note').innerHTML = t('Post the car or send 4 straight-on photos with a ruler. We build the template and keep it on file for you.', 'Kirim mobilnya atau 4 foto lurus dengan penggaris. Template kami simpan untukmu.', '実車を送るか、定規と一緒に4方向の写真を。'); return; }
    const made = H.CAT.filter(p => p.k === 'decals' && c.m.test(p.full)).length;
    $('#ds-cast-note').innerHTML = `<span class="ok-t">${ICON.check}${t('Template on file', 'Template tersedia', 'テンプレートあり')}</span> · ${esc(c.mk)} ${c.yr} · ${made ? `${made} ${t('ready-made sheet' + (made > 1 ? 's' : ''), 'sheet siap pakai', '種の既製品')}` : t('no ready-made sheet yet', 'belum ada sheet siap pakai', '既製品なし')}`;
  }
  function drawSteps(active = 0) {
    const q = calc();
    const st = [
      [t('Brief', 'Brief', 'ご依頼'), t('You send references', 'Kamu kirim referensi', '参考資料を送付'), t('Day 0', 'Hari 0', '0日目')],
      [t('Artwork proof', 'Proof artwork', 'デザイン校正'), t('PDF on the template, 2 revisions', 'PDF di template, 2x revisi', 'テンプレート上のPDF・修正2回'), `${t('Day', 'Hari', '')} ${q.split[0]}${t('', '', '日目')}`],
      [t('Test print', 'Cetak tes', 'テスト印刷'), t('Photo on a real casting', 'Foto di casting asli', '実車で撮影確認'), `${t('Day', 'Hari', '')} ${q.split[0] + q.split[1]}${t('', '', '日目')}`],
      [t('Ship', 'Kirim', '発送'), t('Precoated, bagged, tracked', 'Precoated, dikemas, dilacak', 'プレコート・追跡付き'), `${t('Day', 'Hari', '')} ${q.days}${t('', '', '日目')}`],
    ];
    const el = $('#ds-steps'); el.style.setProperty('--done', active);
    el.innerHTML = st.map(([n, d, day], i) => `<li class="${i < active ? 'is-done' : i === active ? 'is-cur' : ''}" style="--i:${i}"><span class="st-n mono">${i < active ? ICON.check : String(i + 1).padStart(2, '0')}</span><div><b>${n}</b><em>${d}</em></div><span class="st-d mono">${day}</span></li>`).join('') + '<i class="st-line"><b></b></i>';
  }
  function drawQuote() {
    const host = $('#ds-quote');
    if (sent) { drawSent(); return; }
    if (!$('#q-tot')) {
      host.innerHTML = `<div class="q-h"><span class="mono">${t('Live quote', 'Estimasi langsung', '自動見積')}</span><span class="mono" id="q-no"></span></div>
        <div class="q-cast" id="q-cast"></div><ul class="q-lines" id="q-lines"></ul>
        <div class="q-total"><span>${t('Estimated total', 'Estimasi total', '概算合計')}</span><b class="mono" id="q-tot">${money(0)}</b></div>
        <div class="q-ta"><div><span>${t('Turnaround', 'Pengerjaan', '納期')}</span><b class="mono"><span id="q-days">0</span> ${t('working days', 'hari kerja', '営業日')}</b></div><div><span>${t('Ships around', 'Dikirim sekitar', '発送予定')}</span><b id="q-date"></b></div></div>
        <div class="q-bar" id="q-bar"><i class="qb-p"></i><i class="qb-r"></i><i class="qb-s"></i></div>
        <div class="q-leg mono"><span><i class="qb-p"></i>${t('Proof', 'Proof', '校正')}</span><span><i class="qb-r"></i>${t('Print', 'Cetak', '印刷')}</span><span><i class="qb-s"></i>${t('Pack', 'Kemas', '梱包')}</span></div>
        <button class="btn btn-signal btn-lg btn-block" type="submit" form="ds-form" id="ds-go"><span class="spin"></span><span>${t('Send brief', 'Kirim brief', '依頼を送信')}</span>${arrow}</button>
        <p class="q-note">${t('Estimate only — you get a fixed quote with the first proof. 50% deposit once you approve the artwork, balance before printing.', 'Hanya estimasi — harga pasti dikirim bersama proof pertama. DP 50% setelah artwork disetujui, pelunasan sebelum cetak.', '概算です。初回校正時に確定見積をお送りします。デザイン承認後に50%、印刷前に残金。')}</p>`;
    }
    const q = calc(), c = H.castById(ds.cast);
    $('#q-no').textContent = `DS-${YY}-${String(H.LS.get('dsSeq', 141) + 1).padStart(4, '0')} · ${t('DRAFT', 'DRAF', '下書き')}`;
    $('#q-cast').innerHTML = c ? `<b>${esc(c.n)}</b><span class="mono">${esc(c.mk)} · ${c.yr} · ${TYPE[ds.type].n()} · ${ds.q} ${t('sheet' + (ds.q > 1 ? 's' : ''), 'sheet', '枚')}</span>` : `<b>${t('Your casting', 'Casting kamu', 'お手持ちの車種')}</b><span class="mono">${t('to be measured', 'akan diukur', '採寸予定')} · ${ds.q} ${t('sheets', 'sheet', '枚')}</span>`;
    $('#q-lines').innerHTML = q.lines.map(([n, v]) => `<li><span>${esc(n)}</span><b class="mono">${money(v)}</b></li>`).join('');
    const tot = $('#q-tot');
    if (Math.abs(q.total - lastTotal) > .001) { tot.classList.remove('is-tick'); void tot.offsetWidth; tot.classList.add('is-tick'); }
    H.countUp(tot, q.total, { from: lastTotal, dur: 650, fmt: v => money(v) });
    H.countUp($('#q-days'), q.days, { from: +$('#q-days').textContent || 0, dur: 500 });
    lastTotal = q.total;
    $('#q-date').textContent = H.dfmt(H.addDays(q.days));
    const max = 12, bar = $('#q-bar');
    bar.style.setProperty('--p', q.split[0] / max * 100 + '%'); bar.style.setProperty('--r', q.split[1] / max * 100 + '%'); bar.style.setProperty('--s', Math.max(0, q.split[2]) / max * 100 + '%');
    drawSteps(0);
  }
  function drawSent() {
    const q = sent.q;
    $('#ds-quote').innerHTML = `<div class="q-sent"><span class="q-stamp mono">${t('Received', 'Diterima', '受付済')}</span>
      <span class="mono q-k">${t('Request number', 'Nomor request', '受付番号')}</span><b class="q-no mono">${sent.no}</b>
      <ol class="q-next">
        <li><span class="mono">${H.dfmt(H.addDays(1))}</span>${t('We reply by email with questions or a fixed quote', 'Kami balas via email dengan pertanyaan atau harga pasti', 'メールで質問または確定見積')}</li>
        <li><span class="mono">${H.dfmt(H.addDays(q.split[0]))}</span>${t('First artwork proof on the casting template', 'Proof artwork pertama di template casting', '初回デザイン校正')}</li>
        <li><span class="mono">${H.dfmt(H.addDays(q.days))}</span>${t('Printed, precoated and shipped', 'Dicetak, precoated dan dikirim', '印刷・発送')}</li>
      </ol>
      <div class="q-total"><span>${t('Estimate', 'Estimasi', '概算')}</span><b class="mono">${money(q.total)}</b></div>
      <button class="btn btn-line btn-block" type="button" id="ds-again">${t('Start another brief', 'Buat brief lain', '別の依頼を作成')}</button></div>`;
    $('#ds-again').onclick = () => { sent = null; $('#ds-form').classList.remove('is-sent'); lastTotal = 0; $('#ds-quote').innerHTML = ''; drawQuote(); };
  }
  function drawFiles() {
    $('#ds-files').innerHTML = ds.files.map((f, i) => `<span class="fchip"><i class="mono">${esc((f.name.split('.').pop() || '').toUpperCase().slice(0, 4))}</i><b>${esc(f.name)}</b><em class="mono">${f.size > 1e6 ? (f.size / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(f.size / 1e3)) + ' KB'}</em><button type="button" data-rmf="${i}" aria-label="Remove">${ICON.close}</button></span>`).join('');
  }
  function addFiles(list) {
    [...list].forEach(f => { if (ds.files.length < 8 && !ds.files.some(x => x.name === f.name)) ds.files.push({ name: f.name, size: f.size }); });
    drawFiles();
  }
  // bind once
  const form = $('#ds-form');
  form.addEventListener('change', e => {
    const n = e.target.name, id = e.target.id;
    if (n === 'ds-type' || n === 'ds-cx') { ds[n.slice(3)] = e.target.value; $$(`[name="${n}"]`).forEach(r => r.closest('.oc').classList.toggle('is-on', r.checked)); }
    if (id === 'ds-cast') { ds.cast = e.target.value; castNote(); }
    if (id === 'ds-rush') ds.rush = e.target.checked;
    if (id === 'ds-q') ds.q = Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1));
    if (id === 'ds-file') addFiles(e.target.files);
    drawQuote();
  });
  form.addEventListener('click', e => {
    const b = e.target.closest('[data-q]');
    if (b) { ds.q = Math.max(1, Math.min(20, ds.q + +b.dataset.q)); $('#ds-q').value = ds.q; drawQuote(); }
    const r = e.target.closest('[data-rmf]');
    if (r) { e.preventDefault(); ds.files.splice(+r.dataset.rmf, 1); drawFiles(); }
  });
  const drop = $('#ds-drop');
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('is-over'); }));
  drop.addEventListener('drop', e => { if (e.dataTransfer && e.dataTransfer.files.length) addFiles(e.dataTransfer.files); });
  form.addEventListener('submit', e => {
    e.preventDefault(); if (sent) return;
    if (!needEmail($('#ds-mail'))) return;
    submitting($('#ds-go'), () => {
      const seq = H.LS.get('dsSeq', 141) + 1; H.LS.set('dsSeq', seq);
      sent = { no: `DS-${YY}-${String(seq).padStart(4, '0')}`, q: calc() };
      form.classList.add('is-sent'); drawSent(); drawSteps(1);
      H.toast({ title: t('Brief received', 'Brief diterima', '依頼を受け付けました'), sub: `${sent.no} — ${t('reply within 1 working day', 'balasan dalam 1 hari kerja', '1営業日以内に返信')}`, icon: ICON.layers });
      $('#ds-quote').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  /* ================= S-02 commission build ================= */
  const TIERS = () => [
    { k: 'swap', n: t('Wheel Swap', 'Ganti Velg', 'ホイール交換'), usd: 65, ta: t('5–7 days', '5–7 hari', '5〜7日') },
    { k: 'street', n: t('Street Build', 'Street Build', 'ストリート'), usd: 140, ta: t('2–3 weeks', '2–3 minggu', '2〜3週間'), hot: 1 },
    { k: 'show', n: t('Showroom', 'Showroom', 'ショールーム'), usd: 290, ta: t('4–5 weeks', '4–5 minggu', '4〜5週間') },
  ];
  const ROWS = () => [
    [t('Casting from our stock, or yours', 'Casting dari stok kami, atau milikmu', '在庫車種またはお手持ちの車'), [1, 1, 1]],
    [t('HPZ wheel set, any finish', 'Velg HPZ, warna bebas', 'HPZホイール（色自由）'), [1, 1, 1]],
    [t('Base opened, closed with M1.7 screw', 'Base dibuka, ditutup baut M1.7', 'ベース開封・M1.7ネジ留め'), [1, 1, 1]],
    [t('Ride height set (axle relocation)', 'Atur ketinggian (relokasi axle)', '車高調整（アクスル移設）'), [0, 1, 1]],
    [t('Strip, prime, colour, gloss clear', 'Kupas, primer, warna, clear gloss', '剥離・下地・塗装・クリア'), [0, 1, 1]],
    [t('Custom waterslide livery', 'Livery waterslide custom', 'カスタムデカール'), [0, t('Partial', 'Parsial', 'パーシャル'), t('Full', 'Penuh', 'フル')]],
    [t('Resin aero / body kit fitted', 'Aero / body kit resin dipasang', 'レジンエアロ装着'), [0, t('Lip + wing', 'Lip + wing', 'リップ＋ウイング'), t('Widebody', 'Widebody', 'ワイドボディ')]],
    [t('Interior detail paint', 'Cat detail interior', '内装塗り分け'), [0, 0, 1]],
    [t('Engine fitted, bonnet opened', 'Mesin dipasang, kap dibuka', 'エンジン搭載・ボンネット開口'), [0, 0, 1]],
    [t('Acrylic case with engraved plate', 'Case akrilik + plat grafir', '刻印プレート付きアクリルケース'), [0, 0, 1]],
    [t('Progress photos', 'Foto progres', '進捗写真'), ['2', '6', t('Every stage', 'Setiap tahap', '全工程')]],
    [t('Turnaround', 'Pengerjaan', '納期'), 'ta'],
  ];
  let tier = 'street';
  const nextMonth = () => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + 1); return d.toLocaleDateString(H.S.lang === 'id' ? 'id-ID' : H.S.lang === 'ja' ? 'ja-JP' : 'en-GB', { month: 'long' }); };
  function drawCmp() {
    const T = TIERS();
    const cell = v => v === 1 ? `<span class="ck">${ICON.check}</span>` : v === 0 ? '<span class="nx">—</span>' : `<span class="tx">${esc(v)}</span>`;
    $('#cmp').innerHTML = `<thead><tr><th class="cmp-f"><span class="mono">${t('Included', 'Termasuk', '内容')}</span></th>${T.map((x, i) => `<th class="${x.k === tier ? 'is-on' : ''}" data-col="${i}"><button type="button" data-tier="${x.k}">${x.hot ? `<span class="badge new">${t('Most booked', 'Paling laris', '人気')}</span>` : ''}<span class="mono cmp-c">T-0${i + 1}</span><b>${x.n}</b><span class="cmp-p"><small>${t('from', 'mulai', '〜')}</small> <span class="mono">${money(x.usd, { short: 1 })}</span></span></button></th>`).join('')}</tr></thead>
      <tbody>${ROWS().map(([n, v]) => `<tr><th scope="row">${n}</th>${T.map((x, i) => `<td class="${x.k === tier ? 'is-on' : ''}" data-col="${i}">${v === 'ta' ? `<span class="tx mono">${x.ta}</span>` : cell(v[i])}</td>`).join('')}</tr>`).join('')}</tbody>
      <tfoot><tr><th></th>${T.map((x, i) => `<td class="${x.k === tier ? 'is-on' : ''}" data-col="${i}"><button type="button" class="btn btn-sm ${x.k === tier ? 'btn-ink' : 'btn-ghost'} btn-block" data-tier="${x.k}">${x.k === tier ? t('Selected', 'Dipilih', '選択中') : t('Choose', 'Pilih', '選ぶ')}</button></td>`).join('')}</tr></tfoot>`;
  }
  function drawSlots() {
    const total = 12, left = 4;
    $('#slots').innerHTML = `<div class="sl-t"><b class="mono"><span data-count="${left}">0</span> / ${total}</b><span>${t(`slots left for ${nextMonth()}`, `slot tersisa untuk ${nextMonth()}`, `${nextMonth()}の残り枠`)}</span></div><div class="sl-cells">${Array.from({ length: total }, (_, i) => `<i class="${i < total - left ? 'is-taken' : ''}" style="--i:${i}"></i>`).join('')}</div><span class="xs muted">${t('Street & Showroom only — wheel swaps are unlimited', 'Hanya Street & Showroom — ganti velg tanpa batas', 'ストリート・ショールームのみ。ホイール交換は枠なし')}</span>`;
    const el = $('#slots'); const ob = new IntersectionObserver(es => { if (es[0].isIntersecting) { el.classList.add('is-in'); ob.disconnect(); } }, { threshold: .6 }); ob.observe(el);
    H.countOnView(el);
  }
  const BENCH = () => [
    ['R34 V-Spec', t('Showroom · widebody, Bayside Blue', 'Showroom · widebody, Bayside Blue', 'ショールーム'), 'JP', 3],
    ['Civic EG6', t('Street · Spoon livery, TE37 bronze', 'Street · livery Spoon, TE37 bronze', 'ストリート'), 'US', 4],
    ['Supra MK4', t('Showroom · 2JZ bay, case + plate', 'Showroom · bay 2JZ, case + plat', 'ショールーム'), 'GB', 2],
    ['Silvia S15', t('Street · D1 livery, 9.5 mm mesh', 'Street · livery D1, mesh 9.5 mm', 'ストリート'), 'MY', 5],
  ];
  const STAGES = () => [t('Strip', 'Kupas', '剥離'), t('Paint', 'Cat', '塗装'), t('Decal', 'Decal', 'デカール'), t('Assemble', 'Rakit', '組立'), t('Case', 'Case', 'ケース')];
  function drawBoard() {
    const st = STAGES();
    $('#board').innerHTML = `<div class="bd-h"><span class="eyebrow"><b>${t('On the bench', 'Di meja kerja', '作業中')}</b> ${t('right now', 'sekarang', '現在')}</span><span class="mono xs">${st.map((s, i) => `${i + 1} ${s}`).join(' · ')}</span></div>
      <ul class="bd-l">${BENCH().map(([car, d, cc, s], i) => `<li style="--i:${i}"><span class="bd-sil">${H.silhouette(car.includes('Civic') ? 'hatch' : 'coupe')}</span><div class="bd-t"><b>${car}</b><em>${d}</em></div><span class="bd-cc">${FLAG[cc] || FLAG.INT}</span><div class="bd-st" style="--s:${s}">${st.map((x, k) => `<i class="${k < s ? 'is-on' : ''}" title="${x}"></i>`).join('')}<span class="mono">${s}/5 ${st[s - 1]}</span></div></li>`).join('')}</ul>
      <p class="bd-f small">${t('Every build ships in a foam-lined rigid box with DHL Express, insured for its full value. Your own car? Post it to us tracked — we photograph it on arrival.', 'Setiap build dikirim dalam box rigid berlapis busa via DHL Express, diasuransikan penuh. Mobil sendiri? Kirim dengan resi — kami foto saat tiba.', '完成品はウレタン入りリジッドボックスでDHL Express（全額保険付）にて発送。')}</p>`;
    const el = $('#board'); const ob = new IntersectionObserver(es => { if (es[0].isIntersecting) { el.classList.add('is-in'); ob.disconnect(); } }, { threshold: .3 }); ob.observe(el);
  }
  function drawBuildForm() {
    keepVal($('#cb-cast'), `<option value="own">${t("I'll send my own car", 'Saya kirim mobil sendiri', '自分の車を送る')}</option>` + castOpts());
    $('#cb-tier').innerHTML = TIERS().map(x => `<button type="button" class="${x.k === tier ? 'is-on' : ''}" data-tier="${x.k}">${x.n}</button>`).join('');
    keepVal($('#cb-budget'), [[65, 100], [100, 200], [200, 350], [350, 0]].map(([a, b], i) => `<option value="${i}" ${i === 1 ? 'selected' : ''}>${money(a, { short: 1 })}${b ? ' – ' + money(b, { short: 1 }) : '+'}</option>`).join(''));
    const x = TIERS().find(z => z.k === tier);
    $('#cb-foot').innerHTML = `${x.n}: ${t('from', 'mulai', '〜')} <b class="mono">${money(x.usd, { short: 1 })}</b> · ${x.ta}. ${t('No payment now — we confirm the spec and slot first.', 'Belum bayar sekarang — kami konfirmasi spek & slot dulu.', 'お支払いは仕様と枠の確定後です。')}`;
  }
  function setTier(k) { tier = k; drawCmp(); drawBuildForm(); }
  $('#build').addEventListener('click', e => { const b = e.target.closest('[data-tier]'); if (b) { e.preventDefault(); setTier(b.dataset.tier); } });
  $('#cmp').addEventListener('mouseover', e => { const c = e.target.closest('[data-col]'); $$('#cmp [data-col]').forEach(x => x.classList.toggle('is-hov', !!c && x.dataset.col === c.dataset.col)); });
  $('#cmp').addEventListener('mouseleave', () => $$('#cmp .is-hov').forEach(x => x.classList.remove('is-hov')));
  $('#cb-form').addEventListener('submit', e => {
    e.preventDefault(); if (!needEmail($('#cb-mail'))) return;
    submitting($('#cb-go'), () => {
      const no = `CB-${YY}-${String(31 + Math.floor(Math.random() * 9)).padStart(4, '0')}`;
      H.toast({ title: t('Build request sent', 'Request build terkirim', 'ビルド依頼を送信'), sub: `${no} — ${t('we hold a slot for 48 h', 'slot kami tahan 48 jam', '48時間枠を確保')}`, icon: ICON.wheel });
      $('#cb-form').reset(); drawBuildForm();
    });
  });

  /* ================= S-03 wholesale ================= */
  const RRP = 13.5;
  const WT = [[20, .20], [50, .28], [100, .35]];
  let wsN = 60, wsLast = 0;
  const disc = n => { let d = 0; WT.forEach(([m, p]) => { if (n >= m) d = p; }); return d; };
  function drawCalc() {
    $('#ws-calc').innerHTML = `<div class="wc-h"><span class="eyebrow"><b>${t('Volume calculator', 'Kalkulator volume', '数量シミュレーター')}</b></span><span class="mono xs">${t('avg. RRP per set', 'rata-rata harga retail / set', '平均小売価格')} ${money(RRP)}</span></div>
      <div class="wc-in"><label class="lbl" for="ws-n">${t('Sets per order', 'Set per order', '1回の注文セット数')}</label><b class="mono wc-n" id="ws-nv">${wsN}</b></div>
      <input type="range" class="wc-r" id="ws-n" min="10" max="200" step="5" value="${wsN}" aria-label="Sets">
      <div class="wc-scale mono"><span>10</span><span style="left:${(20 - 10) / 190 * 100}%">20</span><span style="left:${(50 - 10) / 190 * 100}%">50</span><span style="left:${(100 - 10) / 190 * 100}%">100</span><span style="left:100%">200</span></div>
      <table class="wc-t"><thead><tr><th>${t('Tier', 'Level', 'ランク')}</th><th>${t('Sets / order', 'Set / order', 'セット数')}</th><th>${t('Discount', 'Diskon', '割引')}</th><th>${t('Per set', 'Per set', '1セット')}</th></tr></thead>
      <tbody>${WT.map(([m, p], i) => `<tr data-wt="${i}"><td class="mono">W-${i + 1}</td><td class="mono">${m}${i < WT.length - 1 ? '–' + (WT[i + 1][0] - 1) : '+'}</td><td class="mono"><b>${Math.round(p * 100)}%</b></td><td class="mono">${money(RRP * (1 - p))}</td></tr>`).join('')}</tbody></table>
      <div class="wc-out"><div><span>${t('Your discount', 'Diskon kamu', '割引率')}</span><b class="mono"><span id="ws-d">0</span>%</b></div><div><span>${t('Order total', 'Total order', '合計')}</span><b class="mono" id="ws-tot"></b></div><div><span>${t('Margin at RRP', 'Margin di harga retail', '小売時の粗利')}</span><b class="mono" id="ws-m"></b></div></div>`;
    $('#ws-n').addEventListener('input', e => { wsN = +e.target.value; updCalc(); });
    updCalc(true);
  }
  function updCalc() {
    const d = disc(wsN), r = $('#ws-n');
    $('#ws-nv').textContent = wsN;
    r.style.setProperty('--v', (wsN - 10) / 190 * 100 + '%');
    $$('#ws-calc [data-wt]').forEach((tr, i) => tr.classList.toggle('is-on', WT[i][1] === d));
    const dEl = $('#ws-d');
    if (Math.round(d * 100) !== wsLast) { H.countUp(dEl, Math.round(d * 100), { from: wsLast, dur: 500 }); wsLast = Math.round(d * 100); }
    $('#ws-tot').textContent = money(wsN * RRP * (1 - d));
    $('#ws-m').textContent = d ? money(wsN * RRP * d) : t('Min. 20 sets', 'Min. 20 set', '最小20セット');
    $('#ws-calc').classList.toggle('is-min', !d);
  }
  const BEN = () => [
    [t('Mix anything', 'Campur bebas', '組み合わせ自由'), t('Wheels, decals and kits all count toward the same tier.', 'Velg, decal dan kit dihitung ke level yang sama.', 'ホイール・デカール・キットを合算。')],
    [t('Drop-shipping', 'Dropship', 'ドロップシップ'), t('We ship to your customer with your packing slip — no HPZ invoice in the box.', 'Kami kirim ke pelangganmu dengan slip tokomu — tanpa invoice HPZ.', 'お客様へ直送。HPZの請求書は同梱しません。')],
    [t('48 h early allocation', 'Alokasi 48 jam lebih awal', '48時間先行割当'), t('Limited drops are offered to stockists two days before retail.', 'Rilis terbatas ditawarkan ke reseller 2 hari sebelum retail.', '限定品は一般販売の2日前に案内。')],
    [t('White-label from 100 sets', 'White-label mulai 100 set', '100セットからOEM'), t('Your logo on the blister card and bag header.', 'Logo tokomu di kartu blister dan header kantong.', 'ブリスターと袋にショップロゴ。')],
    [t('Counter kit', 'Kit display', 'カウンターキット'), t('Acrylic riser, printed fitment chart and 20 sample tyres for the counter.', 'Riser akrilik, chart fitment cetak dan 20 sampel ban.', 'アクリル台・適合表・サンプル。')],
    [t('Net-14 terms', 'Termin Net-14', '14日後払い'), t('After your third paid order. PayPal, Wise or bank transfer in USD.', 'Setelah order lunas ketiga. PayPal, Wise atau transfer USD.', '3回目以降。PayPal・Wise・USD送金。')],
  ];
  // placeholder stockists (metaobject: stockist)
  const STOCK = [
    ['JP', 'Japan', [['Tokyo', 'Garage Hobby Akiba'], ['Osaka', 'Speed Line Models']]],
    ['US', 'United States', [['Los Angeles, CA', 'Tiny Tuner Supply'], ['Houston, TX', 'Lone Star Diecast']]],
    ['GB', 'United Kingdom', [['Birmingham', 'Scale Garage UK']]],
    ['EU', 'Germany', [['Köln', 'Kleine Räder']]],
    ['EU', 'Netherlands', [['Rotterdam', 'Diecast Depot']]],
    ['EU', 'France', [['Lyon', 'Atelier 1/64']]],
    ['AU', 'Australia', [['Melbourne', 'Southern Cross Scale']]],
    ['SG', 'Singapore', [['Bukit Merah', 'Lion City Diecast']]],
    ['MY', 'Malaysia', [['Kuala Lumpur', 'KL Mini Garage'], ['George Town', 'Pulau Customs']]],
    ['ID', 'Indonesia', [['Jakarta', 'Pitstop 64'], ['Bandung', 'Kopi & Diecast'], ['Surabaya', 'Garasi Mini SBY']]],
    ['', 'Philippines', [['Quezon City', 'Manila Scale Works']]],
    ['', 'Thailand', [['Bangkok', 'Siam 64 Garage']]],
  ];
  function drawWholesale() {
    drawCalc();
    $('#ws-ben').innerHTML = BEN().map(([h, d], i) => `<li data-reveal style="--i:${i}"><span class="mono">0${i + 1}</span><div><b>${h}</b><p>${d}</p></div></li>`).join('');
    const shops = STOCK.reduce((n, s) => n + s[2].length, 0);
    $('#ws-stock-n').textContent = `${shops} ${t('stockists', 'reseller', '店舗')} · ${STOCK.length} ${t('countries', 'negara', 'ヶ国')}`;
    $('#ws-list').innerHTML = STOCK.map(([f, n, list]) => `<div class="wl-c" data-reveal><div class="wl-h">${f ? FLAG[f] : `<span class="flag flag-x mono">${n.slice(0, 2).toUpperCase()}</span>`}<b>${n}</b><span class="mono">${list.length}</span></div><ul>${list.map(([city, shop]) => `<li><span>${esc(shop)}</span><em class="mono">${esc(city)}</em></li>`).join('')}</ul></div>`).join('');
    keepVal($('#ws-country'), STOCK.map(s => `<option>${s[1]}</option>`).join('') + `<option>${t('Other', 'Lainnya', 'その他')}</option>`);
    keepVal($('#ws-type'), [t('Physical hobby shop', 'Toko hobi fisik', '実店舗'), t('Online store', 'Toko online', 'オンラインストア'), t('Events & meets', 'Event & kopdar', 'イベント出店'), t('Distributor', 'Distributor', '代理店')].map((x, i) => `<option value="${i}">${x}</option>`).join(''));
    keepVal($('#ws-vol'), ['20–49', '50–99', '100–249', '250+'].map((x, i) => `<option value="${i}">${x} ${t('sets', 'set', 'セット')}</option>`).join(''));
  }
  $('#ws-apply').addEventListener('submit', e => {
    e.preventDefault(); if (!needEmail($('#ws-mail'))) return;
    submitting($('#ws-go'), () => { H.toast({ title: t('Application received', 'Aplikasi diterima', '申込を受け付けました'), sub: t('Price list on its way within 2 working days', 'Price list dikirim dalam 2 hari kerja', '2営業日以内に価格表を送付'), icon: ICON.box }); $('#ws-apply').reset(); });
  });

  /* ================= S-04 part request ================= */
  const LOG = () => [
    [t('Tomica AE86 Trueno — 9.5 mm long-axle set', 'Tomica AE86 Trueno — set 9.5 mm axle panjang', 'トミカAE86用 9.5mmロング'), 6, 1],
    [t('Mini GT R34 — Nismo Omori engine', 'Mini GT R34 — mesin Nismo Omori', 'MiniGT R34 ニスモ大森エンジン'), 11, 1],
    [t('BBS RS gold, 8.5 mm, for HW Beetle', 'BBS RS gold, 8.5 mm, untuk HW Beetle', 'BBS RS ゴールド 8.5mm'), 4, 1],
    [t('HW ’83 Silverado — dually rear axle', 'HW ’83 Silverado — axle belakang dually', 'シルバラード デュアリー'), 14, 1],
    [t('Work Equip 03, stepped lip, 12 mm', 'Work Equip 03, stepped lip, 12 mm', 'ワーク エクイップ03 12mm'), 0, 0],
  ];
  function drawRequest() {
    $('#rq-log').innerHTML = LOG().map(([n, d, ok]) => `<li><span class="dot ${ok ? '' : 'low'}"></span><span>${n}</span><b class="mono">${ok ? d : t('hunting', 'dicari', '捜索中')}</b></li>`).join('');
    keepVal($('#rq-cast'), `<option value="">${t('Any / universal', 'Bebas / universal', '指定なし')}</option>` + castOpts(`<option value="other">${t('Not in the list', 'Tidak ada di daftar', 'リストにない')}</option>`));
  }
  $('#rq-file').addEventListener('change', e => { const f = e.target.files[0]; $('#rq-file-n').textContent = f ? (f.name.length > 14 ? f.name.slice(0, 12) + '…' : f.name) : t('Photo', 'Foto', '写真'); });
  $('#rq-form').addEventListener('submit', e => {
    e.preventDefault();
    const w = $('#rq-what'); const okW = w.value.trim().length > 2; w.classList.toggle('is-err', !okW); if (!okW) { w.focus(); return; }
    if (!needEmail($('#rq-mail'))) return;
    submitting($('#rq-go'), () => { H.toast({ title: t('Request logged', 'Request dicatat', 'リクエストを受付'), sub: t('We usually find it in 4–14 days', 'Biasanya ketemu dalam 4–14 hari', '通常4〜14日で見つかります'), icon: ICON.search }); $('#rq-form').reset(); $('#rq-file-n').textContent = t('Photo', 'Foto', '写真'); });
  });

  /* ================= S-05 Pit Points ================= */
  const PT = () => [
    { k: 'rookie', n: 'Rookie', at: 0, rate: 1, perks: [t('1 pt per $1 spent', '1 poin per $1', '$1につき1pt'), t('200 pts on your birthday', '200 poin saat ulang tahun', '誕生日に200pt'), t('Member price on bundles', 'Harga member untuk bundle', 'セット会員価格')] },
    { k: 'pro', n: 'Pro', at: 1000, rate: 1.25, perks: [t('1.25 pts per $1 spent', '1,25 poin per $1', '$1につき1.25pt'), t('24 h early access to drops', 'Akses rilis 24 jam lebih awal', '新作24時間先行'), t('Free rigid box on every order', 'Box rigid gratis setiap order', 'リジッドボックス無料')] },
    { k: 'legend', n: 'Legend', at: 3000, rate: 1.5, perks: [t('1.5 pts per $1 spent', '1,5 poin per $1', '$1につき1.5pt'), t('Free DHL Express upgrade, once a quarter', 'Upgrade DHL Express gratis, 1x per kuartal', '四半期に1回DHL無料'), t('Extra decal proof revision', 'Revisi proof decal ekstra', 'デカール校正1回追加'), t('Legend-only colourways', 'Warna khusus Legend', 'Legend限定カラー')] },
  ];
  const PMAX = 4000;
  let pSpend = 240, pRev = true, pFeat = false, pLast = 0;
  function points() {
    const T = PT(); let pts = pSpend * 10 + (pRev ? 300 : 0) + (pFeat ? 500 : 0);
    let tr = T.filter(x => pts >= x.at).pop();
    pts = Math.round(pSpend * tr.rate) + (pRev ? 300 : 0) + (pFeat ? 500 : 0); tr = T.filter(x => pts >= x.at).pop();
    return { pts, tr };
  }
  function drawPoints() {
    const T = PT();
    $('#pp-meter').innerHTML = `<div class="pm-ctl">
        <div class="pm-in"><label class="lbl" for="pp-s">${t('What you spend with us in a year', 'Belanja kamu dalam setahun', '年間購入額')}</label><b class="mono" id="pp-sv"></b></div>
        <input type="range" class="wc-r" id="pp-s" min="0" max="800" step="10" value="${pSpend}">
        <div class="pm-opts"><label class="check"><input type="checkbox" id="pp-r" ${pRev ? 'checked' : ''}><span class="box">${ICON.check}</span>${t('2 photo reviews', '2 ulasan foto', '写真レビュー2件')} <em class="mono">+300</em></label><label class="check"><input type="checkbox" id="pp-f" ${pFeat ? 'checked' : ''}><span class="box">${ICON.check}</span>${t('A build featured in the gallery', 'Build tampil di galeri', 'ギャラリー掲載')} <em class="mono">+500</em></label></div>
      </div>
      <div class="pm-track"><div class="pm-rail"><i class="pm-fill" id="pp-fill"></i>${T.map(x => `<span class="pm-mk" style="left:${x.at / PMAX * 100}%" data-tk="${x.k}"><i></i><b>${x.n}</b><em class="mono">${x.at.toLocaleString('en-US')}</em></span>`).join('')}<span class="pm-you" id="pp-you"><b class="mono" id="pp-pts">0</b><em>${t('pts / year', 'poin / tahun', 'pt/年')}</em></span></div>
      <div class="pm-sum" id="pp-sum"></div></div>`;
    $('#pp-tiers').innerHTML = T.map((x, i) => `<article class="pt" data-tier-k="${x.k}" data-reveal style="--i:${i}"><div class="pt-h"><span class="mono">0${i + 1}</span><h3>${x.n}</h3><span class="mono pt-at">${x.at ? x.at.toLocaleString('en-US') + '+ pts' : t('On sign-up', 'Saat daftar', '登録時')}</span></div><ul>${x.perks.map(p => `<li>${ICON.check}${p}</li>`).join('')}</ul></article>`).join('');
    $('#pp-earn').innerHTML = `<h3 class="h4">${t('How to earn', 'Cara dapat poin', '獲得方法')}</h3><table><tbody>${[
      [t('Every order', 'Setiap order', '購入'), t('10–15 pts per $1', '10–15 poin per $1', '$1につき10〜15pt')],
      [t('Review with a photo', 'Ulasan dengan foto', '写真付きレビュー'), '150'],
      [t('Build featured in the gallery', 'Build tampil di galeri', 'ギャラリー掲載'), '500'],
      [t('Friend’s first order ships', 'Order pertama teman dikirim', '紹介した友人の初回発送'), '300'],
      [t('Birthday', 'Ulang tahun', '誕生日'), '200'],
    ].map(([a, b]) => `<tr><td>${a}</td><td class="mono">${b}</td></tr>`).join('')}</tbody></table><p class="xs">${t('Points post when the order ships and never expire while you order once a year. Tier is based on points earned in the last 12 months.', 'Poin masuk saat order dikirim dan tidak hangus selama kamu order setahun sekali. Level dihitung dari poin 12 bulan terakhir.', 'ポイントは発送時に付与。年1回のご注文で失効しません。')}</p>`;
    const s = $('#pp-s');
    s.addEventListener('input', () => { pSpend = +s.value; updPoints(); });
    $('#pp-r').addEventListener('change', e => { pRev = e.target.checked; updPoints(); });
    $('#pp-f').addEventListener('change', e => { pFeat = e.target.checked; updPoints(); });
    pLast = 0; updPoints();
  }
  function updPoints() {
    const { pts, tr } = points();
    $('#pp-sv').textContent = money(pSpend, { short: 1 });
    $('#pp-s').style.setProperty('--v', pSpend / 800 * 100 + '%');
    const pc = Math.min(100, pts / PMAX * 100);
    $('#pp-fill').style.width = pc + '%'; $('#pp-you').style.left = pc + '%';
    H.countUp($('#pp-pts'), pts, { from: pLast, dur: 500 }); pLast = pts;
    $$('#pp-meter [data-tk]').forEach(m => m.classList.toggle('is-on', PT().find(x => x.k === m.dataset.tk).at <= pts));
    $$('#pp-tiers [data-tier-k]').forEach(a => a.classList.toggle('is-on', a.dataset.tierK === tr.k));
    const next = PT().find(x => x.at > pts);
    $('#pp-sum').innerHTML = `<span>${t('You would be', 'Kamu akan jadi', 'あなたのランク')} <b>${tr.n}</b></span><span>${t('Worth', 'Senilai', '価値')} <b class="mono">${money(pts / 100)}</b> ${t('in rewards', 'potongan', '分の特典')}</span><span>${next ? `<b class="mono">${(next.at - pts).toLocaleString('en-US')}</b> ${t('pts to', 'poin lagi ke', 'pt で')} ${next.n}` : t('Top tier reached', 'Level tertinggi', '最上位ランク')}</span>`;
  }

  /* ================= help centre ================= */
  const WA = '+62 813 1016 7872', WAL = 'https://wa.me/6281310167872';
  function wibNow() { const n = new Date(); return new Date(n.getTime() + (n.getTimezoneOffset() + 420) * 60000); }
  function drawSide() {
    const w = wibNow(), d = w.getDay(), h = w.getHours() + w.getMinutes() / 60;
    const open = d !== 0 && h >= 9 && h < 17;
    const off = -new Date().getTimezoneOffset() / 60 - 7; // local − WIB
    const lt = x => { const v = ((x + off) % 24 + 24) % 24; return String(Math.floor(v)).padStart(2, '0') + ':' + (v % 1 ? '30' : '00'); };
    const hhmm = `${String(w.getHours()).padStart(2, '0')}:${String(w.getMinutes()).padStart(2, '0')}`;
    $('#hc-side').innerHTML = `
      <div class="hc-open ${open ? 'is-open' : ''}"><span class="dot ${open ? 'pulse' : 'out'}"></span><span>${open ? t('Workshop open', 'Workshop buka', '営業中') : t('Workshop closed', 'Workshop tutup', '営業時間外')} · <b class="mono">${hhmm}</b> WIB</span></div>
      <a class="cc cc-wa" href="${WAL}" target="_blank" rel="noopener"><span class="cc-ic">${ICON.wa}</span><span class="cc-t"><em>WhatsApp</em><b class="mono">${WA}</b><span>${t('Fastest. Send a photo of your casting next to a ruler.', 'Paling cepat. Kirim foto casting di samping penggaris.', '最速。定規と一緒に車の写真を。')}</span></span>${ICON.arrowUR}</a>
      <a class="cc" href="mailto:hello@hpzdiecast.com"><span class="cc-ic">${ICON.mail}</span><span class="cc-t"><em>Email</em><b>hello@hpzdiecast.com</b><span>${t('Reply within one working day', 'Balasan dalam 1 hari kerja', '1営業日以内に返信')}</span></span>${ICON.arrowUR}</a>
      <div class="cc"><span class="cc-ic">${ICON.pin}</span><span class="cc-t"><em>${t('Workshop', 'Workshop', '工房')}</em><b>Jl. Pamularsih Raya 12</b><span>Semarang 50148, Jawa Tengah, Indonesia<br>${t('Pick-up by appointment', 'Ambil di tempat dengan janji', '受取は要予約')}</span></span></div>
      <div class="cc"><span class="cc-ic">${ICON.clock}</span><span class="cc-t"><em>${t('Hours', 'Jam buka', '営業時間')}</em><b class="mono">${t('Mon–Sat', 'Sen–Sab', '月〜土')} 09:00–17:00 WIB</b><span>${off ? `${t('That is', 'Yaitu', '現地時間')} <b class="mono">${lt(9)}–${lt(17)}</b> ${t('your time', 'waktu kamu', '')}. ` : ''}${t('Same-day dispatch cut-off 15:00 WIB.', 'Batas kirim hari ini 15:00 WIB.', '当日発送は15:00 WIBまで。')}</span></span></div>`;
  }
  function drawShip() {
    const m = H.mk();
    $('#hc-mk').innerHTML = `<button class="mkt-btn hc-mkb" data-open="market">${FLAG[m.flag]}<span>${t('Showing answers for', 'Jawaban untuk', '表示中の地域')} <b>${m.n}</b></span>${ICON.down}</button>`;
    $('#hc-ship').innerHTML = `<div class="hs-h"><span class="eyebrow"><b>${t('Delivery to', 'Pengiriman ke', '配送先')}</b> ${m.n}</span><span class="xs muted">${t('Order today, arrives', 'Pesan hari ini, tiba', '本日注文の場合')}</span></div>
      <div class="hs-rows">${m.ship.map(([k, n, usd, days]) => { const free = usd && k === m.ship[0][0]; return `<div class="hs-r"><span class="hs-n">${H.ICON.truck}<b>${esc(n)}</b></span><span class="mono hs-d">${days === '0' ? t('Same day', 'Hari ini', '当日') : days + ' ' + t('days', 'hari', '日')}</span><span class="mono hs-p">${money(usd)}${free ? `<em>${t('free over', 'gratis di atas', '以上無料')} ${money(m.free, { short: 1 })}</em>` : ''}</span><b class="hs-e">${H.eta(days)}</b></div>`; }).join('')}</div>
      <div class="hs-f">${H.payIcons(m.pay)}<span class="xs muted">${m.duty ? t('Duties prepaid at checkout (DDP)', 'Bea masuk dibayar di checkout (DDP)', '関税は決済時に前払い') : m.local ? t('QRIS confirms in about a minute', 'QRIS terkonfirmasi ±1 menit', 'QRISは約1分で確認') : t('Taxes shown at checkout', 'Pajak tampil di checkout', '税は決済時に表示')}</span></div>`;
  }
  const idr = usd => H.fmt(H.conv(usd, C.CURRENCIES.IDR), C.CURRENCIES.IDR);
  function etaTable() {
    return `<table class="eta-t"><thead><tr><th>${t('Market', 'Negara', '地域')}</th><th>${t('Standard', 'Standar', '通常')}</th><th>Express</th><th>${t('Standard arrives', 'Standar tiba', '到着目安')}</th></tr></thead><tbody>${Object.entries(C.MARKETS).map(([k, m]) => `<tr class="${k === H.S.market ? 'is-on' : ''}"><td>${FLAG[m.flag]}<span>${m.n}</span></td><td class="mono">${m.ship[0][3] === '0' ? '0' : m.ship[0][3]} d</td><td class="mono">${m.ship[1][3]} d</td><td>${H.eta(m.ship[0][3])}</td></tr>`).join('')}</tbody></table>`;
  }
  const FAQ = () => ({
    ship: [
      [t(`How long does delivery take to ${H.mk().n}?`, `Berapa lama pengiriman ke ${H.mk().n}?`, `${H.mk().n}への配送日数は？`),
        `<p>${t('We dispatch within 24 hours, Monday to Saturday (cut-off 15:00 WIB). Times below are working days from dispatch, and the date is what to expect if you order today.', 'Kami kirim dalam 24 jam, Senin–Sabtu (batas 15:00 WIB). Waktu di bawah adalah hari kerja sejak dikirim.', '月〜土、24時間以内に発送（15:00 WIB締切）。以下は発送後の営業日数です。')}</p>${etaTable()}`],
      [t('I am in the US. Will I pay tariffs or fees on delivery?', 'Saya di US. Apakah ada tarif saat barang tiba?', '米国在住。配達時に関税はかかりますか？'),
        `<p>${t('No. Since the US ended duty-free de minimis entry in August 2025, every parcel is dutiable — so we ship US orders DDP (Delivered Duty Paid). Duty is calculated at checkout as its own line, roughly 10% of the goods value, and we pay it to customs on your behalf. USPS via Asendia or DHL then deliver with nothing more to pay.', 'Tidak. Sejak US menghapus de minimis bebas bea pada Agustus 2025, setiap paket kena bea — jadi pesanan US kami kirim DDP. Bea dihitung di checkout (±10% nilai barang) dan kami bayarkan ke bea cukai.', 'いいえ。2025年8月の少額免税廃止以降、米国向けはDDPで発送。関税（商品代の約10%）は決済時に計算し、当社が納付します。')}</p><p class="xs">${t('Please do not refuse a parcel because a carrier asks for fees — message us first, it is always a carrier error.', 'Jangan tolak paket jika kurir minta biaya — hubungi kami dulu.', '配達員から請求があっても受取拒否せずご連絡ください。')}</p>`],
      [t('EU, UK and Australia: VAT / GST at the door?', 'EU, UK, Australia: VAT / GST saat tiba?', 'EU・英国・豪州：VAT/GSTは？'),
        `<p>${t('EU orders up to €150 are declared through IOSS: VAT for your country is collected at checkout and you pay nothing at delivery. Over €150, the carrier charges import VAT plus a handling fee. UK orders up to £135 have VAT collected at checkout; Australian orders under A$1,000 have 10% GST collected at checkout.', 'Pesanan EU hingga €150 dideklarasikan via IOSS: VAT ditagih di checkout. Di atas €150 kurir menagih VAT impor + biaya handling. UK hingga £135 VAT di checkout; Australia di bawah A$1.000 GST 10% di checkout.', 'EUは€150までIOSSで決済時にVAT徴収。英国は£135まで、豪州はA$1,000未満で決済時に徴収。')}</p>`],
      [t('Is there free shipping?', 'Ada gratis ongkir?', '送料無料はありますか？'),
        `<ul class="fq-l">${Object.values(C.MARKETS).map(m => `<li>${FLAG[m.flag]}<span>${m.n}</span><b class="mono">${H.fmt(H.conv(m.free, C.CURRENCIES[m.cur]), C.CURRENCIES[m.cur], { short: 1 })}</b><em>${esc(m.ship[0][1])}</em></li>`).join('')}</ul>`],
      [t('My tracking has not moved for days.', 'Resi tidak update berhari-hari.', '追跡が何日も更新されません。'),
        `<p>${t('Standard parcels are scanned in Jakarta, then often not again until they reach your country — a 4–6 day gap is normal. If nothing moves for 10 working days, WhatsApp us the order number and we open a trace with the carrier.', 'Paket standar di-scan di Jakarta lalu sering tidak update sampai tiba di negaramu — jeda 4–6 hari normal. Jika 10 hari kerja tidak bergerak, WhatsApp nomor order.', '標準便はジャカルタ以降、到着国まで更新されないことがあります。10営業日動かなければご連絡を。')}</p>`],
    ],
    returns: [
      [t('What is the fitment guarantee?', 'Apa itu garansi fitment?', 'フィット保証とは？'),
        `<p>${t('If you chose a part with the fitment finder or your saved garage casting and it does not fit, send us a photo of it on the car next to a ruler within 30 days. We ship the correct size free — and for sets under $25 you keep the first one.', 'Jika kamu memilih part lewat fitment finder atau garasi dan ternyata tidak pas, kirim foto di mobil dengan penggaris dalam 30 hari. Kami kirim ukuran yang benar gratis — untuk set di bawah $25 tidak perlu dikembalikan.', '適合検索やガレージで選んで合わない場合、30日以内に定規と一緒の写真を。正しいサイズを無料でお送りします。')}</p>`],
      [t('Can I return something I changed my mind about?', 'Bisa retur karena berubah pikiran?', '気が変わった場合の返品は？'),
        `<p>${t('Yes, within 30 days if it is unopened and unused. Return postage is on you; we refund the item price to the original payment method within 3 days of it arriving in Semarang. Custom decals and commission builds cannot be returned once the proof is approved.', 'Bisa, dalam 30 hari jika belum dibuka. Ongkir retur ditanggung pembeli; refund ke metode bayar awal dalam 3 hari setelah tiba di Semarang. Decal custom & jasa build tidak bisa diretur setelah proof disetujui.', '未開封・未使用なら30日以内可。返送料はお客様負担。カスタム品は校正承認後の返品不可。')}</p>`],
      [t('It arrived damaged or something is missing.', 'Barang rusak atau kurang.', '破損・欠品がありました。'),
        `<p>${t('Photograph the parcel and the part within 7 days of delivery and message us. We send a replacement in the next dispatch, no return needed. Orders with shipping protection are also covered if the parcel is lost.', 'Foto paket & part dalam 7 hari setelah diterima lalu hubungi kami. Pengganti dikirim di pengiriman berikutnya, tanpa retur. Order dengan proteksi pengiriman juga dicover jika hilang.', '到着後7日以内に写真を添えてご連絡ください。返送不要で再発送します。')} <span class="mono">(${money(H.ADDON.ins.usd)})</span></p>`],
    ],
    id: [
      [t('Domestic shipping within Indonesia', 'Pengiriman dalam negeri', 'インドネシア国内配送'),
        `<ul class="fq-l">${C.MARKETS.ID.ship.map(([, n, usd, d]) => `<li>${FLAG.ID}<span>${esc(n)}</span><b class="mono">${idr(usd)}</b><em>${d === '0' ? t('same day', 'hari ini', '当日') : d + ' ' + t('days', 'hari', '日')} · ${H.eta(d)}</em></li>`).join('')}</ul><p>${t('Free shipping across Indonesia over', 'Gratis ongkir se-Indonesia min.', '国内送料無料：')} <b class="mono">${idr(C.MARKETS.ID.free)}</b>. ${t('GoSend same-day covers Semarang city for orders paid before 14:00 WIB.', 'GoSend same-day untuk kota Semarang jika dibayar sebelum 14:00 WIB.', 'GoSend当日便はスマラン市内・14:00 WIBまでの決済。')}</p>`],
      [t('How does QRIS payment work?', 'Bagaimana cara bayar dengan QRIS?', 'QRIS決済の方法は？'),
        `<p>${t('Choose QRIS at checkout and scan the code with any banking or e-wallet app — GoPay, OVO, DANA, ShopeePay, BCA mobile, Livin’ by Mandiri. Payment is confirmed automatically in about a minute; the code is valid for 15 minutes. No transfer receipts to upload.', 'Pilih QRIS di checkout dan scan dengan aplikasi bank atau e-wallet apa saja — GoPay, OVO, DANA, ShopeePay, BCA mobile, Livin’. Pembayaran terkonfirmasi otomatis ±1 menit; kode berlaku 15 menit. Tidak perlu upload bukti transfer.', 'QRISを選び、銀行・電子マネーアプリでスキャン。約1分で自動確認、コードは15分有効。')}</p>${H.payIcons(C.MARKETS.ID.pay)}`],
      [t('Can I pick up at the workshop?', 'Bisa ambil di workshop?', '工房で受け取れますか？'),
        `<p>${t('Yes — choose “Ambil di workshop” at checkout and wait for our WhatsApp confirmation (usually within 2 hours). Pick-up Monday–Saturday 10:00–16:00 at Jl. Pamularsih Raya 12, Semarang. Bring the order number.', 'Bisa — pilih “Ambil di workshop” di checkout dan tunggu konfirmasi WhatsApp (biasanya < 2 jam). Ambil Senin–Sabtu 10:00–16:00 di Jl. Pamularsih Raya 12, Semarang.', 'チェックアウトで工房受取を選択。月〜土10:00〜16:00。')}</p>`],
      [t('Is COD available?', 'Ada COD?', '代引きは？'),
        `<p>${t('Not at the moment. QRIS and virtual accounts (BCA, Mandiri, BNI) confirm instantly, so your order still goes out the same day.', 'Belum. QRIS dan virtual account (BCA, Mandiri, BNI) terkonfirmasi instan, jadi pesanan tetap dikirim hari itu juga.', '現在不可。QRIS・バーチャル口座は即時確認されます。')}</p>`],
    ],
    orders: [
      [t('Can I change my address after ordering?', 'Bisa ganti alamat setelah order?', '注文後に住所変更できますか？'),
        `<p>${t('Yes, until the label is printed — usually 15:00 WIB on the day you order. WhatsApp us the order number and new address.', 'Bisa, sebelum label dicetak — biasanya 15:00 WIB di hari order. WhatsApp nomor order & alamat baru.', 'ラベル印刷前（通常当日15:00 WIB）まで可能です。')}</p>`],
      [t(`Which payment methods work in ${H.mk().n}?`, `Metode bayar apa saja di ${H.mk().n}?`, `${H.mk().n}の支払方法は？`),
        `${H.payIcons(H.mk().pay)}<p class="xs">${t('All prices are charged in', 'Semua harga ditagih dalam', '請求通貨：')} <b class="mono">${H.mk().cur}</b>.</p>`],
      [t('Can you combine two orders to save on shipping?', 'Bisa gabung dua order agar hemat ongkir?', '2つの注文を同梱できますか？'),
        `<p>${t('If the first order has not shipped, yes — place the second one with the cheapest shipping and message us; we merge them and refund the difference.', 'Jika order pertama belum dikirim, bisa — buat order kedua dengan ongkir termurah lalu kabari kami; kami gabung dan refund selisihnya.', '未発送なら可能です。差額は返金します。')}</p>`],
    ],
  });
  let fqTab = H.isLocal() ? 'id' : 'ship';
  function drawFaqTabs() {
    const host = $('#hc-tabs');
    const tabsL = [['ship', t('Shipping & duties', 'Pengiriman & bea', '配送・関税')], ['returns', t('Returns & fitment', 'Retur & fitment', '返品・保証')], ['id', t('Indonesia', 'Indonesia', 'インドネシア')], ['orders', t('Orders & payment', 'Order & pembayaran', '注文・支払')]];
    host.innerHTML = tabsL.map(([k, l]) => `<button type="button" data-tab="${k}" class="${k === fqTab ? 'is-on' : ''}">${l}</button>`).join('');
    H.tabs(host, k => { fqTab = k; drawFaq(true); });
  }
  function drawFaq(anim) {
    const el = $('#hc-faq');
    el.innerHTML = FAQ()[fqTab].map(([q, a], i) => `<div class="acc ${i === 0 ? 'is-open' : ''}" data-acc><button class="acc-h" aria-expanded="${i === 0}"><span class="mono fq-n">${String(i + 1).padStart(2, '0')}</span><span class="fq-q">${q}</span><span class="acc-ic"></span></button><div class="acc-b"><div class="acc-c">${a}</div></div></div>`).join('');
    H.acc(el);
    if (anim) { el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap'); }
  }

  /* ================= render ================= */
  function all() {
    drawIndex(); drawDecalForm(); lastTotal = 0; drawQuote();
    drawCmp(); drawSlots(); drawBoard(); drawBuildForm();
    drawWholesale(); drawRequest(); drawPoints();
    drawSide(); drawShip(); drawFaqTabs(); drawFaq();
    H.applyI18n(); H.reveal();
  }
  all(); heroIntro();
  setInterval(drawSide, 60000);
  H.on('market', () => { all(); heroIntro(); });
});
