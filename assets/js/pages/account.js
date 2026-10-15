/* HPZ — customer account ("My Garage") + sign-in view
   Shopify: new customer accounts. Orders / addresses / profile come from the Customer Account API;
   garage, saved builds and alerts live in customer metafields (hpz.garage, hpz.builds) or app blocks;
   Pit Points = loyalty app (Smile / Rivo / Joy) rendered as an app block. */
(function () {
  // sign-in view hides the garage bar (must run before chrome renders the header)
  if (new URLSearchParams(location.search).has('login')) document.body.dataset.garagebar = 'off';
})();

HPZ.ready(() => {
  const H = HPZ, { $, $$, t, esc, IMG, money, ICON, C, S, LS } = H;
  const arrow = ICON.arrow;
  const USER = { first: 'Ricky', name: 'Ricky R.', email: 'ricky.r@example.com', phone: '+49 1512 3456 789', since: 2023, id: 'HPZ-C-004817' };

  /* ---------------- dates ---------------- */
  const loc = () => S.lang === 'id' ? 'id-ID' : S.lang === 'ja' ? 'ja-JP' : 'en-GB';
  const D = (days, h = 10, m = 24) => { const d = new Date(); d.setDate(d.getDate() - days); d.setHours(h, m, 0, 0); return d; };
  const addH = (d, h) => new Date(d.getTime() + h * 36e5);
  const fd = (d, o = { day: 'numeric', month: 'short', year: 'numeric' }) => d.toLocaleDateString(loc(), o);
  const fds = d => d.toLocaleDateString(loc(), { day: 'numeric', month: 'short' });
  const ft = d => d.toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit', hour12: false });
  const num = n => Math.round(n).toLocaleString('en-US');

  /* ---------------- orders ---------------- */
  const STEPS = () => [t('Placed', 'Dipesan', '注文受付'), t('Quality check', 'Quality check', '検品'), t('Packed', 'Dikemas', '梱包'), t('Shipped', 'Dikirim', '発送'), t('Delivered', 'Diterima', '配達完了')];
  const STEP_NOTE = () => [
    t('Payment confirmed', 'Pembayaran terkonfirmasi', '決済確認'),
    t('Every wheel spun and measured by hand', 'Setiap velg diputar & diukur manual', '全ホイールを手作業で確認'),
    t('Bagged, boxed, weighed', 'Dikantong, dibox, ditimbang', '個包装・計量'),
    t('Left Semarang hub', 'Berangkat dari hub Semarang', 'スマラン発'),
    t('Signed for at the door', 'Diterima di alamat', '受取済み'),
  ];
  const pick = (h, vn) => { const p = H.byH(h); if (!p) return null; return { p, v: vn ? H.vByName(p, vn) : (p.v.find(x => x.a) || p.v[0]) }; };
  const DEMO = [
    { no: 'HPZ-10482', days: 3, step: 3, ship: ['DHL Express', 22, 5], cc: 'DE', lines: [['hpz-wheels-model-te37-sl-bearing-series', 'Gold', 2], ['decal-set-hotwheels-honda-s2000-hks-super-gt', null, 1], ['hpz-wheels-model-six-bearing-series', 'Gunmet', 1]] },
    { no: 'HPZ-10317', days: 31, step: 4, ship: ['DHL Express', 22, 5], cc: 'DE', lines: [['hpz-add-on-body-kit-for-hot-wheels-r34-v-spec', null, 1], ['hpz-wheels-model-bbs-lm-bearing-series', 'Silver', 1], ['parvus-models-nissan-rb26-engine', null, 1]] },
    { no: 'HPZ-09876', days: 134, step: 4, ship: ['Tracked Standard', 8.5, 11], cc: 'DE', lines: [['decal-set-hotwheels-civic-si-wings-west', null, 2], ['jv-accessories-voltex-wing', null, 1], ['recaro-seat-with-detailing', null, 1]] },
    { no: 'HPZ-09214', days: 301, step: 4, ship: ['JNE Reguler', 1.2, 3], cc: 'ID', lines: [['hpz-wheels-model-super-advan-bearing-series', 'Silver', 2], ['parvus-models-miniatur-mesin-toyota-2jz-gte', null, 1]] },
  ];
  const trackNo = (no, cc) => { const d = String(no).replace(/\D/g, '').padStart(6, '0'); return cc === 'ID' ? 'JNE' + d + '0417' : 'JD01460000' + d + '4' + d.slice(-3); };
  function mkOrder(o) {
    const sub = o.lines.reduce((s, l) => s + l.v.p * l.q, 0);
    const placed = o.date;
    const days = o.ship[2] || 6;
    const dates = [placed, addH(placed, 3.2), addH(placed, 19.5), addH(placed, 27), addH(placed, 27 + days * 24)];
    const total = o.total != null ? o.total : sub + o.ship[1];
    return { ...o, sub, total, pts: o.pts != null ? o.pts : Math.round(total), dates, track: trackNo(o.no, o.cc), carrier: o.cc === 'ID' ? 'JNE' : 'DHL' };
  }
  function fromCheckout(o) {
    try {
      const lines = (o.items || o.lines || []).map(l => { const p = H.byId(l.id); if (!p) return null; return { p, v: H.variant(p, l.vid), q: l.q || l.qty || 1 }; }).filter(Boolean);
      if (!lines.length) return null;
      let date = new Date(o.date || o.created || Date.now()); if (isNaN(date)) date = new Date();
      const m = C.MARKETS[o.market] || H.mk();
      let ship = ['Tracked Standard', 0, 8];
      const etaD = v => parseInt(String(v || '').split(/[–-]/).pop(), 10);
      if (typeof o.ship === 'number' || o.shipName) ship = [o.shipName || t('Shipping', 'Pengiriman', '配送'), +o.ship || 0, etaD(o.eta) || 6];
      else if (Array.isArray(o.ship)) ship = [o.ship[1] || o.ship[0], +o.ship[2] || 0, parseInt(String(o.ship[3] || '6').split('–').pop(), 10) || 6];
      else if (o.ship && typeof o.ship === 'object') ship = [o.ship.n || o.ship.name || 'Shipping', +(o.ship.usd ?? o.ship.price ?? 0), 6];
      else if (typeof o.ship === 'string') { const s = m.ship.find(x => x[0] === o.ship || x[1] === o.ship); ship = s ? [s[1], s[2], parseInt(String(s[3]).split('–').pop(), 10) || 2] : [o.ship, 0, 6]; }
      const hrs = (Date.now() - date) / 36e5;
      const step = hrs < 20 ? 1 : hrs < 27 ? 2 : hrs < 24 * ship[2] ? 3 : 4;
      const no = String(o.no || o.name || o.id || ('HPZ-' + String(date.getTime()).slice(-5))).replace(/^#/, '');
      return mkOrder({ no, date, step, ship, cc: m.local ? 'ID' : 'XX', lines, total: typeof o.total === 'number' ? o.total : null, fresh: true, addr: o.addr, pts: typeof o.points === 'number' ? o.points : null });
    } catch (e) { return null; }
  }
  function orders() {
    const demo = DEMO.map(o => {
      const lines = o.lines.map(([h, vn, q], i) => { const x = pick(h, vn) || { p: H.query({ avail: 1 })[i], v: null }; if (!x.v) x.v = x.p.v[0]; return { ...x, q }; });
      return mkOrder({ ...o, date: D(o.days, [10, 14, 9, 16][DEMO.indexOf(o)], [24, 7, 51, 32][DEMO.indexOf(o)]), lines });
    });
    const live = (S.orders || []).map(fromCheckout).filter(Boolean);
    return [...live, ...demo].sort((a, b) => b.date - a.date);
  }
  const statusOf = o => o.step >= 4 ? ['ok', t('Delivered', 'Diterima', '配達完了')] : o.step === 3 ? ['transit', t('In transit', 'Dalam perjalanan', '輸送中')] : ['prep', t('Preparing', 'Disiapkan', '準備中')];

  /* ---------------- points ---------------- */
  const REWARDS = () => [
    { id: 'v5', cost: 500, n: t('Voucher', 'Voucher', 'クーポン') + ' ' + money(5, { short: 1 }), d: t('Off any order, no minimum.', 'Untuk order apa saja, tanpa minimum.', '最低購入額なし。'), pre: 'PIT5' },
    { id: 'box', cost: 800, n: t('Rigid box ×3', 'Box rigid ×3', 'リジッドボックス×3'), d: t('Crush-proof cases on your next three orders.', 'Hard case untuk 3 order berikutnya.', '次回3回分の耐圧ケース。'), pre: 'BOX3' },
    { id: 'dhl', cost: 1500, n: t('Free DHL Express upgrade', 'Upgrade gratis ke DHL Express', 'DHL Express無料アップグレード'), d: t('Standard price, 3–6 day delivery.', 'Harga standar, sampai 3–6 hari.', '通常料金で3〜6日配達。'), pre: 'DHLUP' },
    { id: 'early', cost: 3000, n: t('HPZ Originals early access', 'Akses awal HPZ Originals', 'HPZオリジナル先行アクセス'), d: t('Shop every drop 24 h before everyone else for a year.', 'Belanja setiap rilis 24 jam lebih awal selama setahun.', '1年間、全リリースを24時間早く購入。'), pre: 'EARLY' },
  ];
  const TIERS = () => [
    { k: 'rookie', n: 'Rookie', at: 0, perks: [t('1 pt per $1 spent', '1 poin per $1', '$1で1pt'), t('Birthday bonus 100 pts', 'Bonus ulang tahun 100 poin', '誕生日100pt'), t('Drop alerts by email', 'Info rilis via email', 'リリース通知')] },
    { k: 'pro', n: 'Pro', at: 1000, perks: [t('1.25 pts per $1', '1,25 poin per $1', '$1で1.25pt'), t('Free rigid box on every order', 'Box rigid gratis tiap order', '毎回リジッドボックス無料'), t('Restock alerts 1 h early', 'Notif restock 1 jam lebih awal', '再入荷を1時間早く通知')] },
    { k: 'legend', n: 'Legend', at: 3000, perks: [t('1.5 pts per $1', '1,5 poin per $1', '$1で1.5pt'), t('24 h early access to drops', 'Akses rilis 24 jam lebih awal', 'リリース24時間先行'), t('One free custom decal design / year', '1 desain decal custom gratis / tahun', '年1回カスタムデカール無料')] },
  ];
  const redeemed = () => LS.get('acct.redeemed', []);
  function history(ords) {
    const rows = [
      { d: D(12, 18, 2), a: t('Photo review', 'Ulasan foto', '写真レビュー') + ' — TE37 SL Bearing', ref: 'REV-22841', pts: 50 },
      { d: D(40, 9, 15), a: t('Build featured', 'Build ditampilkan', 'ビルド掲載') + ' — R34 V-Spec Widebody', ref: 'BLD-B8', pts: 500 },
      { d: D(95, 20, 41), a: t('Redeemed', 'Ditukar', '交換') + ' — ' + t('Voucher', 'Voucher', 'クーポン') + ' ' + money(5, { short: 1 }), ref: 'PIT5-8QK2', pts: -500 },
      { d: D(160, 0, 5), a: t('Birthday bonus', 'Bonus ulang tahun', '誕生日ボーナス'), ref: '—', pts: 150 },
      { d: D(220, 13, 30), a: t('Referral — Kenji T. placed a first order', 'Referral — Kenji T. order pertama', '紹介 — Kenji T.様 初回注文'), ref: 'REF-KT64', pts: 250 },
    ];
    ords.forEach(o => rows.push({ d: o.date, a: t('Order', 'Pesanan', '注文') + ' #' + o.no, ref: o.no, pts: o.pts, live: o.fresh }));
    const fixed = rows.filter(r => !r.live).reduce((s, r) => s + r.pts, 0);
    rows.push({ d: D(640, 11, 0), a: t('Points carried over from the old loyalty program', 'Poin dari program loyalti lama', '旧ポイントプログラムから移行'), ref: 'MIGR-2024', pts: 1640 - fixed });
    redeemed().forEach(r => rows.push({ d: new Date(r.d), a: t('Redeemed', 'Ditukar', '交換') + ' — ' + r.n, ref: r.code, pts: -r.cost }));
    return rows.sort((a, b) => b.d - a.d);
  }
  const tierPts = () => 1640 + (S.orders || []).map(fromCheckout).filter(Boolean).reduce((s, o) => s + o.pts, 0);
  const balance = () => tierPts() - redeemed().reduce((s, r) => s + r.cost, 0);
  const tierOf = p => TIERS().filter(x => p >= x.at).pop();
  const nextTier = p => TIERS().find(x => x.at > p);

  /* ---------------- saved builds ---------------- */
  const DEMO_BUILDS = () => [
    { id: 'demo-r34', name: 'R34 pit row', cast: 'r34', items: ['hpz-wheels-model-te37-sl-bearing-series', 'hpz-add-on-body-kit-for-hot-wheels-r34-v-spec', 'parvus-models-nissan-rb26-engine', 'jv-accessories-voltex-wing'], date: D(6).toISOString(), demo: 1 },
    { id: 'demo-s2000', name: 'HKS S2000 tribute', cast: 's2000', items: ['decal-set-hotwheels-honda-s2000-hks-super-gt', 'hpz-wheels-model-six-bearing-series', 'recaro-seat-with-detailing'], date: D(19).toISOString(), demo: 1 },
    { id: 'demo-civic', name: 'Wings West Civic Si', cast: 'civic-si', items: ['decal-set-hotwheels-civic-si-wings-west', 'hpz-wheels-model-super-advan-bearing-series'], date: D(58).toISOString(), demo: 1 },
  ];
  const resolveP = x => { if (x == null) return null; if (typeof x === 'object') return H.byId(x.id) || H.byH(x.h); return H.byId(x) || H.byH(x); };
  function builds() {
    const saved = LS.get('builds', []);
    const list = Array.isArray(saved) && saved.length ? saved : DEMO_BUILDS();
    return list.map(b => ({ ...b, ps: (b.items || b.parts || []).map(resolveP).filter(Boolean), c: H.castById(b.cast), dt: new Date(b.date || b.created || Date.now()) }));
  }

  /* ---------------- restock alerts ---------------- */
  const alertsAll = () => {
    const pri = { wheels: 0, engines: 1, bodykits: 2, decals: 3 };
    const out = H.query({}).filter(p => !p.a).sort((a, b) => (pri[a.k] ?? 9) - (pri[b.k] ?? 9));
    const seen = new Set(), mix = out.filter(p => { const k = p.b + p.k; if (seen.has(k)) return false; seen.add(k); return true; });
    return [...mix, ...out.filter(p => !mix.includes(p))].slice(0, 6);
  };
  let removedAlerts = new Set(LS.get('acct.alertsOff', []));
  const alerts = () => alertsAll().filter(p => !removedAlerts.has(p.id));

  /* ---------------- shared bits ---------------- */
  const svgSil = c => H.silhouette(c.body);
  const madeFor = c => H.CAT.filter(p => ['decals', 'bodykits', 'engines'].includes(p.k) && c.m.test(p.full));
  const head = (idx, h, p, aside = '') => `<header class="ac-ph"><div><span class="eyebrow"><b>${idx}</b> ${h[1] || ''}</span><h2 class="h2">${h[0]}</h2>${p ? `<p>${p}</p>` : ''}</div>${aside}</header>`;
  const empty = (ic, h, p, cta) => `<div class="ac-empty">${ic}<h3 class="h3">${h}</h3><p>${p}</p>${cta || ''}</div>`;
  const thumbs = (lines, max = 4) => `<span class="od-th">${lines.slice(0, max).map(l => `<img src="${IMG(l.p.img[l.v && l.v.i > -1 ? l.v.i : 0], 120)}" alt="">`).join('')}${lines.length > max ? `<i class="mono">+${lines.length - max}</i>` : ''}</span>`;

  function tracker(o) {
    const st = STEPS(), notes = STEP_NOTE();
    const p = o.step >= 4 ? 100 : o.step === 3 ? (3 + Math.min(.8, Math.max(.15, (Date.now() - o.dates[3]) / (o.dates[4] - o.dates[3])))) / 4 * 100 : o.step / 4 * 100;
    return `<div class="trk" style="--p:${p.toFixed(1)}%" data-trk>
      <div class="trk-line"><i></i>${o.step === 3 ? `<b class="trk-van">${ICON.truck}</b>` : ''}</div>
      <ol>${st.map((s, i) => {
        const cls = i < o.step || (o.step === 4) ? 'is-done' : i === o.step ? 'is-now' : '';
        const when = i <= o.step ? `${fds(o.dates[i])} · ${ft(o.dates[i])}` : i === 4 ? `${t('Est.', 'Est.', '予定')} ${fds(o.dates[4])}` : '—';
        return `<li class="${cls}"><span class="trk-dot">${cls === 'is-done' ? ICON.check : ''}</span><b>${s}</b><em class="mono">${when}</em>${i <= o.step ? `<small>${i === 3 ? `<span class="mono">${o.carrier} ${o.track}</span>` : notes[i]}</small>` : ''}</li>`;
      }).join('')}</ol></div>`;
  }
  const animTrk = root => $$('[data-trk]', root).forEach(el => { el.classList.remove('is-go'); void el.offsetWidth; requestAnimationFrame(() => el.classList.add('is-go')); });

  /* ================= panels ================= */
  const P = {};

  /* ---------- identity (top-right) ---------- */
  function drawId() {
    const b = balance(), tier = tierOf(tierPts());
    $('#ac-id').innerHTML = `<span class="ac-av" aria-hidden="true">RR</span><div><b>${USER.name}</b><span class="mono">${USER.id} · ${t('member since', 'member sejak', '会員登録')} ${USER.since}</span></div><a class="ac-tier" href="#points"><i>${tier.n.toUpperCase()}</i><span class="mono">${num(b)} pts</span></a>`;
  }

  /* ---------- overview ---------- */
  function nextDrop() { // every second Friday
    const now = new Date();
    for (let k = 0; k < 2; k++) {
      const d = new Date(now.getFullYear(), now.getMonth() + k, 1); while (d.getDay() !== 5) d.setDate(d.getDate() + 1); d.setDate(d.getDate() + 7);
      if (d >= new Date(now.toDateString())) return d;
    }
    return now;
  }
  P.overview = () => {
    const ords = orders(), last = ords[0], b = balance(), tp = tierPts(), tier = tierOf(tp), nx = nextTier(tp);
    const transit = ords.filter(o => o.step < 4).length;
    const parts = ords.reduce((s, o) => s + o.lines.reduce((a, l) => a + l.q, 0), 0);
    const hr = new Date().getHours();
    const greet = hr < 11 ? t('Morning', 'Selamat pagi', 'おはようございます') : hr < 18 ? t('Afternoon', 'Selamat siang', 'こんにちは') : t('Evening', 'Selamat malam', 'こんばんは');
    const garage = S.garage.map(H.castById).filter(Boolean);
    return `<div class="ov-top">
      <div class="ov-hi">
        <span class="eyebrow"><b>01</b> ${t('Overview', 'Ringkasan', '概要')}</span>
        <h2 class="h1 ov-greet">${greet}, ${USER.first}.</h2>
        <p class="lead">${transit ? `${transit} ${transit > 1 ? t('parcels are', 'paket sedang', '個の荷物が') : t('parcel is', 'paket sedang', '個の荷物が')} ${t('on the way.', 'dalam perjalanan.', '配送中です。')} ` : t('Nothing on the road right now. ', 'Tidak ada paket di jalan. ', '現在配送中の荷物はありません。')}${t('Next wheel drop', 'Rilis velg berikutnya', '次回リリース')}: <b class="mono">${fd(nextDrop(), { weekday: 'short', day: 'numeric', month: 'short' })}, 19:00 WIB</b>.</p>
        <dl class="ov-stats">
          <div><dt>${t('Orders', 'Pesanan', '注文')}</dt><dd class="mono" data-cu="${ords.length}">0</dd></div>
          <div><dt>${t('Parts bought', 'Part dibeli', '購入パーツ')}</dt><dd class="mono" data-cu="${parts}">0</dd></div>
          <div><dt>${t('Builds featured', 'Build tampil', '掲載ビルド')}</dt><dd class="mono" data-cu="2">0</dd></div>
          <div><dt>${t('Member since', 'Member sejak', '会員登録')}</dt><dd class="mono">${USER.since}</dd></div>
        </dl>
      </div>
      ${pointsCard(b, tp, tier, nx, true)}
    </div>

    ${last ? `<div class="ov-last">
      <div class="ov-last-h"><div><span class="eyebrow"><b>${t('Latest order', 'Pesanan terakhir', '最新の注文')}</b></span><h3 class="h3"><span class="mono">#${last.no}</span> · ${statusOf(last)[1]}</h3></div>
        <div class="ov-last-a">${thumbs(last.lines, 3)}<span class="mono ov-tot">${money(last.total)}</span><a class="btn btn-ghost btn-sm" href="#orders" data-goto="${last.no}">${t('Order details', 'Detail pesanan', '注文詳細')} ${arrow}</a></div></div>
      ${tracker(last)}
      ${last.step === 3 ? `<p class="ov-eta small">${ICON.clock}<span>${t('Arriving', 'Tiba', '到着予定')} <b>${fd(last.dates[4], { weekday: 'long', day: 'numeric', month: 'long' })}</b> ${t('with', 'via', '—')} ${esc(last.ship[0])}. ${t('Signature required for parcels over €150.', 'Perlu tanda tangan untuk paket di atas €150.', '')}</span></p>` : ''}
    </div>` : ''}

    <div class="ov-cast">
      <div class="ov-sub"><h3 class="h4">${t('My castings', 'Casting saya', 'マイ車種')} <span class="mono muted">${garage.length}/4</span></h3><a class="arrow-link small" href="#garage">${t('Manage', 'Kelola', '管理')} ${arrow}</a></div>
      <div class="ov-cast-l">${garage.map((c, i) => `<a class="ovc ${i ? '' : 'is-pri'}" href="shop.html?cast=${c.id}"><span class="ovc-sil">${svgSil(c)}</span><b>${esc(H.shortCast(c))}</b><em class="mono">Ø${c.dia} · ${H.query({ cast: c.id }).length} ${t('parts', 'part', '点')}</em>${i ? '' : `<i class="badge new">${t('Primary', 'Utama', 'メイン')}</i>`}</a>`).join('')}
        ${garage.length < 4 ? `<button class="ovc ovc-add" data-open="garage">${ICON.plus}<b>${t('Add casting', 'Tambah casting', '車種を追加')}</b><em>${t('Tag parts that fit', 'Tandai part yang pas', '適合パーツを表示')}</em></button>` : ''}</div>
    </div>`;
  };
  function pointsCard(b, tp, tier, nx, link) {
    const max = 3000, pct = Math.min(100, tp / max * 100);
    return `<div class="pts dark-0">
      <div class="pts-h"><span class="eyebrow"><b>Pit Points</b></span><span class="pts-tier mono">${tier.n.toUpperCase()}</span></div>
      <div class="pts-n"><span class="mono" data-cu="${b}">0</span><small>pts</small></div>
      <p class="pts-v small">≈ ${money(Math.floor(b / 100), { short: 1 })} ${t('in vouchers', 'dalam voucher', '分のクーポン')}</p>
      <div class="pts-bar" style="--p:${pct.toFixed(1)}%"><div class="pts-scale"><i></i></div>
        ${TIERS().map(x => `<span class="pts-m ${tp >= x.at ? 'is-on' : ''}" style="left:${x.at / max * 100}%"><b>${x.n}</b><em class="mono">${num(x.at)}</em></span>`).join('')}
      </div>
      <p class="pts-next small">${nx ? `<b class="mono">${num(nx.at - tp)}</b> ${t('pts to', 'poin lagi ke', 'ptで')} ${nx.n} — ${esc(nx.perks[1])}` : t('Top tier reached.', 'Tier tertinggi.', '最上位ティア達成。')}</p>
      ${link ? `<a class="btn btn-signal btn-sm" href="#points">${t('Redeem points', 'Tukar poin', 'ポイント交換')} ${arrow}</a>` : ''}
    </div>`;
  }

  /* ---------- orders ---------- */
  let openNo = null;
  P.orders = () => {
    const ords = orders();
    if (!openNo) { const o = ords.find(x => x.step < 4) || ords[0]; openNo = o && o.no; }
    return `${head('02', [t('Orders', 'Pesanan', '注文'), ''], t('Every order is checked by hand in Semarang before it ships. Tracking numbers appear the moment the parcel is scanned.', 'Setiap pesanan dicek manual di Semarang sebelum dikirim. Nomor resi muncul saat paket di-scan.', '全注文をスマランで手作業検品。スキャン後すぐ追跡番号を表示。'),
      `<div class="ac-ph-a"><span class="mono xs muted">${ords.length} ${t('orders', 'pesanan', '件')} · ${money(ords.reduce((s, o) => s + o.total, 0))} ${t('lifetime', 'total', '累計')}</span></div>`)}
      <div class="od-list">${ords.map(o => orderRow(o, o.no === openNo)).join('')}</div>
      <p class="xs muted od-foot">${t('Orders older than 24 months are archived. Need one?', 'Pesanan lebih dari 24 bulan diarsipkan. Butuh?', '24ヶ月以上前の注文はアーカイブされます。')} <a class="link" href="services.html#help">${t('Ask the workshop', 'Tanya workshop', '工房に問い合わせ')}</a></p>`;
  };
  function orderRow(o, open) {
    const [k, label] = statusOf(o);
    const cnt = o.lines.reduce((a, l) => a + l.q, 0);
    return `<article class="od ${open ? 'is-open' : ''}" data-no="${esc(o.no)}">
      <button class="od-h" aria-expanded="${open}">
        <span class="od-no"><b class="mono">#${esc(o.no)}</b><em>${fd(o.date)} · ${cnt} ${cnt > 1 ? t('items', 'item', '点') : t('item', 'item', '点')}</em></span>
        ${thumbs(o.lines)}
        <span class="od-st is-${k}"><i></i>${label}${o.fresh ? ` <span class="badge new">${t('New', 'Baru', '新規')}</span>` : ''}</span>
        <span class="od-tot mono">${money(o.total)}</span>
        <span class="od-chev">${ICON.down}</span>
      </button>
      <div class="od-b" ${open ? 'style="height:auto"' : ''}><div class="od-c">
        ${tracker(o)}
        <div class="od-g">
          <ul class="od-items">${o.lines.map(l => `<li><a href="product.html?h=${l.p.h}"><img src="${IMG(l.p.img[l.v.i > -1 ? l.v.i : 0], 120)}" alt=""></a><div><span class="cl-brand">${esc(H.brand(l.p).n)} · <span class="mono">${H.partNo(l.p)}</span></span><a class="cl-t" href="product.html?h=${l.p.h}">${esc(l.p.t)}</a>${l.v.n ? `<span class="cl-v">${H.swatchBg(l.v.n) ? `<i style="--c:${H.swatchBg(l.v.n)}"></i>` : ''}${esc(l.v.n)}</span>` : ''}</div><span class="mono od-q">×${l.q}</span><span class="mono od-lp">${money(l.v.p * l.q)}</span></li>`).join('')}</ul>
          <div class="od-sum">
            <dl>
              <div><dt>${t('Subtotal', 'Subtotal', '小計')}</dt><dd class="mono">${money(o.sub)}</dd></div>
              <div><dt>${esc(o.ship[0])}</dt><dd class="mono">${o.ship[1] > 0.001 ? money(o.ship[1]) : t('Free', 'Gratis', '無料')}</dd></div>
              ${Math.abs(o.total - o.sub - o.ship[1]) > 0.01 ? `<div><dt>${t('Add-ons, duties & discounts', 'Add-on, bea & diskon', 'オプション・関税・割引')}</dt><dd class="mono">${o.total - o.sub - o.ship[1] < 0 ? '' : '+'}${money(o.total - o.sub - o.ship[1])}</dd></div>` : ''}
              <div class="is-tot"><dt>${t('Total', 'Total', '合計')}</dt><dd class="mono">${money(o.total)}</dd></div>
              <div><dt>${t('Pit Points earned', 'Pit Points didapat', '獲得ポイント')}</dt><dd class="mono od-pts">+${num(o.pts)}</dd></div>
            </dl>
            <div class="od-act">
              <button class="btn btn-ink btn-sm" data-act="track">${ICON.truck}${t('Track', 'Lacak', '追跡')}</button>
              <button class="btn btn-ghost btn-sm" data-act="reorder">${ICON.repeat}${t('Reorder', 'Pesan lagi', '再注文')}</button>
              <button class="btn btn-ghost btn-sm" data-act="invoice">${ICON.upload}${t('Invoice', 'Invoice', '請求書')}</button>
              ${o.step >= 4 ? `<a class="btn btn-ghost btn-sm" href="product.html?h=${o.lines[0].p.h}#reviews">${ICON.star}${t('Write review', 'Tulis ulasan', 'レビューを書く')}</a>` : ''}
            </div>
            <p class="xs muted od-addr">${ICON.pin}<span>${esc(o.addr || (o.cc === 'ID' ? 'Jl. Pamularsih Raya 12, Semarang' : 'Kastanienallee 32, 10435 Berlin'))}</span></p>
          </div>
        </div>
      </div></div>
    </article>`;
  }
  function toggleOrder(el, force) {
    const body = $('.od-b', el), open = force != null ? force : !el.classList.contains('is-open');
    if (open === el.classList.contains('is-open')) return;
    el.classList.toggle('is-open', open); $('.od-h', el).setAttribute('aria-expanded', open);
    body.style.height = body.scrollHeight + 'px';
    if (!open) requestAnimationFrame(() => { body.style.height = '0px'; });
    else { animTrk(el); body.addEventListener('transitionend', function te() { if (el.classList.contains('is-open')) body.style.height = 'auto'; body.removeEventListener('transitionend', te); }); }
    if (open) openNo = el.dataset.no;
  }

  /* ---------- garage ---------- */
  P.garage = () => {
    const list = S.garage.map(H.castById).filter(Boolean);
    return `${head('03', [t('My castings', 'Casting saya', 'マイ車種'), ''], t('Up to four castings. The first one is primary — every product page and the shop grid tag parts that fit it.', 'Maksimal empat casting. Yang pertama jadi utama — semua halaman produk menandai part yang pas.', '最大4台。1台目がメインで、全商品に適合表示されます。'),
      list.length && list.length < 4 ? `<button class="btn btn-ink" data-open="garage">${ICON.plus}${t('Add casting', 'Tambah casting', '車種を追加')}</button>` : '')}
      ${list.length ? `<div class="gc-grid">${list.map((c, i) => {
        const wheels = H.query({ k: 'wheels', dia: c.dia }).length, made = madeFor(c).length, all = H.query({ cast: c.id }).length;
        return `<article class="gc ${i ? '' : 'is-pri'}" data-cast-card="${c.id}">
          <div class="gc-vis"><span class="gc-sil">${svgSil(c)}</span><span class="gc-dim mono"><i></i>Ø ${c.dia.toFixed(1)} mm</span>${i ? `<span class="mono gc-slot">0${i + 1}</span>` : `<span class="badge new gc-slot">${t('Primary', 'Utama', 'メイン')}</span>`}</div>
          <div class="gc-b">
            <div><h3 class="h3">${esc(c.n)}</h3><span class="mono xs muted">${esc(c.mk)} · ${c.yr} · ${esc(c.axle)}</span></div>
            <dl class="gc-spec"><div><dt>${t('Wheel Ø', 'Velg Ø', 'ホイール径')}</dt><dd class="mono">${c.dia.toFixed(1)}</dd></div><div><dt>${t('Wheels', 'Velg', 'ホイール')}</dt><dd class="mono">${wheels}</dd></div><div><dt>${t('Made-for', 'Khusus', '専用')}</dt><dd class="mono">${made}</dd></div><div><dt>${t('All fits', 'Semua', '全適合')}</dt><dd class="mono">${all}</dd></div></dl>
            <div class="gc-a"><a class="btn btn-ink btn-sm" href="shop.html?cast=${c.id}">${t('Shop parts that fit', 'Belanja part yang pas', '適合パーツを見る')} ${arrow}</a>
              ${i ? `<button class="btn btn-ghost btn-sm" data-primary="${c.id}">${t('Set as primary', 'Jadikan utama', 'メインにする')}</button>` : ''}
              <button class="btn btn-ghost btn-icon btn-sm gc-rm" data-uncast="${c.id}" aria-label="${t('Remove', 'Hapus', '削除')}">${ICON.trash}</button></div>
          </div></article>`;
      }).join('')}${list.length < 4 ? `<button class="gc gc-add" data-open="garage"><span>${ICON.plus}</span><b>${t('Add a casting', 'Tambah casting', '車種を追加')}</b><em>${C.CASTINGS.length} ${t('castings measured on our bench', 'casting diukur di workshop', '車種を実測済み')}</em></button>` : ''}</div>`
      : empty(`<span class="ac-empty-sil">${H.silhouette('coupe')}</span>`, t('Your garage is empty', 'Garasi masih kosong', 'ガレージは空です'), t('Add the casting you are building and we will tag wheels, decals and kits that fit it — everywhere in the shop.', 'Tambahkan casting yang kamu bangun, kami tandai velg, decal & kit yang pas.', '作っている車種を追加すると、適合パーツを表示します。'), `<button class="btn btn-signal" data-open="garage">${ICON.plus}${t('Add your first casting', 'Tambah casting pertama', '最初の車種を追加')}</button>`)}`;
  };

  /* ---------- saved builds ---------- */
  P.builds = () => {
    const list = builds(), isDemo = list.some(b => b.demo);
    return `${head('04', [t('Saved builds', 'Build tersimpan', '保存ビルド'), ''], t('Build sheets saved from the Build Planner. Load one to keep editing or send the whole parts list to your cart.', 'Sheet build dari Build Planner. Buka untuk lanjut edit atau masukkan semua part ke keranjang.', 'ビルドプランナーで保存したシート。'),
      `<a class="btn btn-ink" href="planner.html">${ICON.plus}${t('New build sheet', 'Sheet baru', '新規シート')}</a>`)}
      ${isDemo ? `<p class="ac-note small">${ICON.info}<span>${t('Examples shown — save a sheet in the Build Planner and it appears here.', 'Contoh ditampilkan — simpan sheet di Build Planner agar muncul di sini.', 'サンプル表示中。')}</span></p>` : ''}
      <div class="bs-list">${list.map((b, i) => {
        const tot = b.ps.reduce((s, p) => s + p.p, 0);
        return `<article class="bs" data-reveal style="--i:${i}">
          <div class="bs-cast">${b.c ? `<span class="bs-sil">${svgSil(b.c)}</span><span class="mono xs">${esc(H.shortCast(b.c))}</span>` : `<span class="mono xs muted">${t('No casting', 'Tanpa casting', '車種なし')}</span>`}</div>
          <div class="bs-m"><span class="mono xs muted">SHEET ${String(i + 1).padStart(2, '0')} · ${fd(b.dt)}${b.demo ? ' · ' + t('example', 'contoh', '例') : ''}</span><h3 class="h3">${esc(b.name || t('Untitled build', 'Build tanpa nama', '無題'))}</h3>
            <div class="bs-parts">${b.ps.slice(0, 5).map(p => `<a href="product.html?h=${p.h}" title="${esc(p.t)}"><img src="${IMG(p.img[0], 120)}" alt=""><span class="mono">${C.CATS[p.k].code}</span></a>`).join('')}</div></div>
          <div class="bs-r"><span class="mono bs-tot">${money(tot)}</span><span class="xs muted">${b.ps.length} ${t('parts', 'part', '点')}</span>
            <a class="btn btn-ink btn-sm" href="planner.html?build=${encodeURIComponent(b.id)}">${t('Load in planner', 'Buka di planner', 'プランナーで開く')}</a>
            <button class="link xs" data-bs-cart="${i}">${t('Add all to cart', 'Semua ke keranjang', 'すべてカートへ')}</button></div>
        </article>`;
      }).join('')}</div>`;
  };

  /* ---------- wishlist ---------- */
  P.wishlist = () => {
    const list = S.wish.map(H.byId).filter(Boolean), av = list.filter(p => p.a);
    return `${head('05', [t('Wishlist', 'Wishlist', 'ウィッシュリスト'), ''], t('Synced across devices while you are signed in. Sold-out parts automatically get a restock alert.', 'Tersinkron di semua device. Part habis otomatis dapat notifikasi restock.', 'サインイン中は全端末で同期。'),
      av.length ? `<button class="btn btn-ink" id="wl-all">${ICON.cart}${t('Add', 'Tambah', '追加')} ${av.length} ${t('to cart', 'ke keranjang', '点をカートへ')}</button>` : '')}
      ${list.length ? `<div class="grid" style="--cols:3" id="wl-grid">${list.map((p, i) => H.card(p, { i })).join('')}</div>`
      : empty(`<span class="ac-empty-ic">${ICON.heart}</span>`, t('Nothing saved yet', 'Belum ada yang disimpan', 'まだ保存がありません'), t('Tap the heart on any part and it lands here — handy for planning the next drop.', 'Tekan ikon hati di part mana saja.', 'ハートをタップして保存。'), `<a class="btn btn-ink" href="shop.html?k=wheels">${t('Browse wheels', 'Lihat velg', 'ホイールを見る')}</a>`)}`;
  };

  /* ---------- points ---------- */
  P.points = () => {
    const ords = orders(), b = balance(), tp = tierPts(), tier = tierOf(tp), nx = nextTier(tp), rows = history(ords);
    return `${head('06', ['Pit Points', ''], t('Earn on every order, review and featured build. Points never expire while you order once a year.', 'Dapat poin dari order, ulasan & build yang ditampilkan. Poin tidak hangus selama order setahun sekali.', '注文・レビュー・ビルド掲載で獲得。'))}
      <div class="pp-top">${pointsCard(b, tp, tier, nx, false)}
        <div class="pp-earn"><h3 class="h4">${t('Ways to earn', 'Cara dapat poin', '獲得方法')}</h3><ul>
          <li><span>${t('Every $1 spent', 'Setiap $1 belanja', '$1ごと')}</span><b class="mono">+1</b></li>
          <li><span>${t('Photo review', 'Ulasan dengan foto', '写真レビュー')}</span><b class="mono">+50</b></li>
          <li><span>${t('Build featured on Built by You', 'Build tampil di Karya Kalian', 'ビルド掲載')}</span><b class="mono">+500</b></li>
          <li><span>${t('Friend places a first order', 'Teman order pertama', '友達の初回注文')}</span><b class="mono">+250</b></li>
          <li><span>${t('Birthday', 'Ulang tahun', '誕生日')}</span><b class="mono">+100</b></li></ul>
          <a class="arrow-link small" href="builds.html#submit">${t('Submit a build', 'Kirim build', 'ビルドを投稿')} ${arrow}</a></div>
      </div>
      <h3 class="ac-h3">${t('Tiers', 'Tier', 'ティア')}</h3>
      <div class="tr-grid">${TIERS().map(x => `<div class="tr ${x.k === tier.k ? 'is-cur' : ''} ${tp >= x.at ? 'is-got' : ''}"><div class="tr-h"><b>${x.n}</b><span class="mono">${num(x.at)}+</span></div>${x.k === tier.k ? `<span class="tr-you mono">${t('YOU ARE HERE', 'POSISI KAMU', '現在')}</span>` : ''}<ul>${x.perks.map(p => `<li>${ICON.check}${esc(p)}</li>`).join('')}</ul></div>`).join('')}</div>
      <h3 class="ac-h3">${t('Redeem', 'Tukar', '交換')}</h3>
      <div class="rw-grid">${REWARDS().map(r => `<div class="rw ${b >= r.cost ? '' : 'is-lock'}"><span class="mono rw-c">${num(r.cost)} <small>pts</small></span><b>${esc(r.n)}</b><p>${esc(r.d)}</p>
        ${b >= r.cost ? `<button class="btn btn-signal btn-sm" data-redeem="${r.id}">${t('Redeem', 'Tukar', '交換する')}</button>` : `<span class="rw-need mono">${num(r.cost - b)} ${t('more pts', 'poin lagi', 'pt不足')}</span><i class="rw-bar" style="--p:${Math.min(100, b / r.cost * 100).toFixed(0)}%"></i>`}</div>`).join('')}</div>
      <h3 class="ac-h3">${t('History', 'Riwayat', '履歴')}</h3>
      <div class="ph-wrap"><table class="ph"><thead><tr><th>${t('Date', 'Tanggal', '日付')}</th><th>${t('Activity', 'Aktivitas', '内容')}</th><th>${t('Reference', 'Referensi', '参照')}</th><th class="r">${t('Points', 'Poin', 'ポイント')}</th><th class="r">${t('Balance', 'Saldo', '残高')}</th></tr></thead>
        <tbody>${(() => { let run = b; return rows.map(r => { const tr = `<tr><td class="mono">${fd(r.d)}</td><td>${esc(r.a)}</td><td class="mono muted">${esc(r.ref)}</td><td class="r mono ${r.pts < 0 ? 'neg' : 'pos'}">${r.pts > 0 ? '+' : '−'}${num(Math.abs(r.pts))}</td><td class="r mono">${num(run)}</td></tr>`; run -= r.pts; return tr; }).join(''); })()}</tbody></table></div>`;
  };

  /* ---------- addresses ---------- */
  let ADDR = [
    { id: 'a1', cc: 'EU', label: t('Home', 'Rumah', '自宅'), name: 'Ricky R.', l: ['Kastanienallee 32, 3. OG', '10435 Berlin', 'Germany'], ph: '+49 1512 3456 789', def: 1 },
    { id: 'a2', cc: 'ID', label: t('Workshop', 'Workshop', '工房'), name: 'Ricky R.', l: ['Jl. Pamularsih Raya 12', 'Bojongsalaman, Semarang Barat', 'Semarang 50148, Jawa Tengah', 'Indonesia'], ph: '+62 813 1016 7872', def: 0 },
  ];
  P.addresses = () => `${head('07', [t('Addresses', 'Alamat', '住所'), ''], t('Your default address sets the region, currency and shipping options at checkout.', 'Alamat utama menentukan wilayah, mata uang & ongkir di checkout.', '既定の住所で地域・通貨・配送方法が決まります。'))}
    <div class="ad-grid">${ADDR.map(a => `<article class="ad ${a.def ? 'is-def' : ''}" data-ad="${a.id}">
      <div class="ad-h">${H.FLAG[a.cc] || H.FLAG.INT}<b>${esc(a.label)}</b>${a.def ? `<span class="badge">${t('Default', 'Utama', '既定')}</span>` : ''}</div>
      <address><b>${esc(a.name)}</b>${a.l.map(esc).join('<br>')}</address>
      <span class="mono xs muted">${esc(a.ph)}</span>
      <div class="ad-a"><button class="link xs" data-ad-edit="${a.id}">${t('Edit', 'Ubah', '編集')}</button>${a.def ? '' : `<button class="link xs" data-ad-def="${a.id}">${t('Set as default', 'Jadikan utama', '既定にする')}</button><button class="link xs" data-ad-rm="${a.id}">${t('Delete', 'Hapus', '削除')}</button>`}</div>
    </article>`).join('')}
    <button class="ad ad-add" id="ad-add">${ICON.plus}<b>${t('Add address', 'Tambah alamat', '住所を追加')}</b></button></div>
    <form class="ad-form" id="ad-form" hidden>
      <h3 class="h4">${t('New address', 'Alamat baru', '新しい住所')}</h3>
      <div class="ad-f">
        <div class="fl"><input class="input" id="af-n" placeholder=" " required value="Ricky R."><label for="af-n">${t('Full name', 'Nama lengkap', '氏名')}</label></div>
        <div class="fl"><select class="select" id="af-c">${Object.entries(C.MARKETS).filter(([k]) => k !== 'INT').map(([k, m]) => `<option value="${k}">${m.n}</option>`).join('')}</select><label for="af-c">${t('Country / region', 'Negara / wilayah', '国・地域')}</label></div>
        <div class="fl ad-wide"><input class="input" id="af-a" placeholder=" " required><label for="af-a">${t('Street and number', 'Jalan dan nomor', '番地')}</label></div>
        <div class="fl"><input class="input" id="af-z" placeholder=" " required><label for="af-z">${t('Postcode', 'Kode pos', '郵便番号')}</label></div>
        <div class="fl"><input class="input" id="af-ci" placeholder=" " required><label for="af-ci">${t('City', 'Kota', '市区町村')}</label></div>
      </div>
      <div class="ad-fa"><button class="btn btn-ink">${t('Save address', 'Simpan alamat', '保存')}</button><button type="button" class="btn btn-ghost" id="af-x">${t('Cancel', 'Batal', 'キャンセル')}</button></div>
    </form>`;

  /* ---------- restock alerts ---------- */
  P.alerts = () => {
    const list = alerts();
    return `${head('08', [t('Restock alerts', 'Notifikasi restock', '再入荷通知'), ''], t('Small batches sell out in hours. We email once — the moment a part you follow is back on the shelf.', 'Batch kecil habis dalam hitungan jam. Kami email sekali saat part kembali tersedia.', '少量生産はすぐ完売。再入荷時に一度だけメールします。'),
      `<label class="ac-sw"><span class="switch"><input type="checkbox" checked id="al-wa"><span></span></span><span class="small">${t('Also ping me on WhatsApp', 'Kabari juga via WhatsApp', 'WhatsAppでも通知')}</span></label>`)}
      ${list.length ? `<ul class="al-list">${list.map((p, i) => `<li class="al" data-al="${p.id}">
        <a href="product.html?h=${p.h}"><img src="${IMG(p.img[0], 120)}" alt=""></a>
        <div class="al-m"><span class="cl-brand">${esc(H.brand(p).n)} · <span class="mono">${H.partNo(p)}</span></span><a class="cl-t" href="product.html?h=${p.h}">${esc(p.t)}</a><span class="xs muted">${t('Following since', 'Diikuti sejak', '登録日')} ${fd(D(9 + i * 17))}</span></div>
        <div class="al-s"><span class="al-st"><i class="dot out"></i>${t('Sold out', 'Habis', '在庫切れ')}</span><span class="mono xs muted">${i % 3 === 0 ? `${t('Next batch', 'Batch berikutnya', '次回入荷')} ~${fds(H.addDays(6 + i * 4))}` : t('No date yet', 'Belum ada tanggal', '未定')}</span></div>
        <span class="al-p mono">${money(p.p)}</span>
        <label class="switch" title="${t('Email alert', 'Notif email', 'メール通知')}"><input type="checkbox" checked data-al-on="${p.id}"><span></span></label>
        <button class="cl-x" data-al-rm="${p.id}" aria-label="${t('Stop following', 'Berhenti ikuti', '解除')}">${ICON.close}</button>
      </li>`).join('')}</ul>`
      : empty(`<span class="ac-empty-ic">${ICON.bell}</span>`, t('No alerts', 'Tidak ada notifikasi', '通知はありません'), t('Tap “Notify me” on any sold-out part to follow it.', 'Tekan “Kabari saya” di part yang habis.', '在庫切れ商品の「入荷通知」から登録できます。'), `<a class="btn btn-ink" href="shop.html">${t('Browse the shop', 'Lihat toko', 'ショップへ')}</a>`)}`;
  };

  /* ---------- settings ---------- */
  P.settings = () => {
    const prefs = LS.get('acct.prefs', { drops: true, restock: true, academy: false, sms: false });
    return `${head('09', [t('Settings', 'Pengaturan', '設定'), ''], '')}
      <div class="st-grid">
        <form class="st" id="st-prof"><h3 class="h4">${t('Profile', 'Profil', 'プロフィール')}</h3>
          <div class="fl"><input class="input" id="sp-n" placeholder=" " value="${USER.name}"><label for="sp-n">${t('Name', 'Nama', 'お名前')}</label></div>
          <div class="fl"><input class="input" id="sp-e" type="email" placeholder=" " value="${USER.email}"><label for="sp-e">Email</label></div>
          <div class="fl"><input class="input" id="sp-p" placeholder=" " value="${USER.phone}"><label for="sp-p">${t('Phone (for courier updates)', 'Telepon (untuk kurir)', '電話番号')}</label></div>
          <button class="btn btn-ink">${t('Save profile', 'Simpan profil', '保存')}</button>
        </form>
        <div class="st" id="st-loc"><h3 class="h4">${t('Region, currency & language', 'Wilayah, mata uang & bahasa', '地域・通貨・言語')}</h3>
          <div class="fl"><select class="select" id="sl-m">${Object.entries(C.MARKETS).map(([k, m]) => `<option value="${k}" ${k === S.market ? 'selected' : ''}>${m.n} — ${m.cur}</option>`).join('')}</select><label for="sl-m">${t('Shipping region', 'Wilayah pengiriman', '配送地域')}</label></div>
          <span class="lbl">${t('Language', 'Bahasa', '言語')}</span>
          <div class="seg" id="sl-l">${Object.entries(C.LANGS).map(([k, n]) => `<button type="button" class="${k === S.lang ? 'is-on' : ''}" data-lg="${k}">${n}</button>`).join('')}</div>
          <p class="xs muted">${t('Sample', 'Contoh', '例')}: <b class="mono" id="sl-x"></b></p>
          <button class="btn btn-ink" id="sl-save">${t('Apply', 'Terapkan', '適用')}</button>
        </div>
        <div class="st st-wide"><h3 class="h4">${t('Email preferences', 'Preferensi email', 'メール設定')}</h3>
          ${[['orders', t('Order & shipping updates', 'Update pesanan & pengiriman', '注文・配送のお知らせ'), t('Required while you have an open order.', 'Wajib selama ada pesanan aktif.', '注文中は必須です。'), true, true],
            ['drops', t('Drop alerts', 'Info rilis', 'リリース通知'), t('One email per drop, 24 h early — every second Friday.', 'Satu email per rilis, 24 jam lebih awal.', '各リリース24時間前に1通。'), prefs.drops],
            ['restock', t('Restock alerts', 'Notifikasi restock', '再入荷通知'), t('Only for parts you follow.', 'Hanya part yang kamu ikuti.', '登録商品のみ。'), prefs.restock],
            ['academy', t('Academy digest', 'Ringkasan Academy', 'アカデミー便り'), t('A new build guide each month.', 'Panduan build baru tiap bulan.', '毎月新しいガイド。'), prefs.academy],
            ['sms', t('WhatsApp updates', 'Update WhatsApp', 'WhatsApp通知'), t('Courier scans and delivery day.', 'Scan kurir & hari pengiriman.', '配送スキャンと配達日。'), prefs.sms]]
            .map(([k, n, d, on, lock]) => `<label class="st-r ${lock ? 'is-lock' : ''}"><span><b>${n}</b><em>${d}</em></span><span class="switch"><input type="checkbox" data-pref="${k}" ${on ? 'checked' : ''} ${lock ? 'disabled' : ''}><span></span></span></label>`).join('')}
        </div>
        <div class="st st-wide st-out"><div><h3 class="h4">${t('Sign out', 'Keluar', 'ログアウト')}</h3><p class="xs muted">${t('Your cart and garage stay saved on this device.', 'Keranjang & garasi tetap tersimpan di device ini.', 'カートとガレージはこの端末に保存されます。')}</p></div>
          <div class="st-out-a"><a class="btn btn-line" href="account.html?login">${t('Sign out', 'Keluar', 'ログアウト')}</a><button class="link xs" id="st-del">${t('Delete account', 'Hapus akun', 'アカウント削除')}</button></div></div>
      </div>`;
  };

  /* ================= routing ================= */
  const TABS = ['overview', 'orders', 'garage', 'builds', 'wishlist', 'points', 'addresses', 'alerts', 'settings'];
  let cur = null;
  const tabName = k => ({ overview: t('Overview', 'Ringkasan', '概要'), orders: t('Orders', 'Pesanan', '注文'), garage: t('My castings', 'Casting saya', 'マイ車種'), builds: t('Saved builds', 'Build tersimpan', '保存ビルド'), wishlist: t('Wishlist', 'Wishlist', 'ウィッシュリスト'), points: 'Pit Points', addresses: t('Addresses', 'Alamat', '住所'), alerts: t('Restock alerts', 'Notifikasi restock', '再入荷通知'), settings: t('Settings', 'Pengaturan', '設定') })[k];
  function render(k) { const el = $('#p-' + k); if (!el) return; el.innerHTML = P[k](); after(k, el); }
  function after(k, el) {
    H.reveal(el);
    if (k === 'overview' || k === 'points') $$('[data-cu]', el).forEach(n => H.countUp(n, +n.dataset.cu, { dur: 1300 }));
    if (k === 'overview' || k === 'points') $$('.pts-bar', el).forEach(b => { b.classList.remove('is-go'); void b.offsetWidth; requestAnimationFrame(() => requestAnimationFrame(() => b.classList.add('is-go'))); });
    if (k === 'overview') animTrk(el);
    if (k === 'orders') animTrk($('.od.is-open', el) || document.createElement('div'));
    if (k === 'settings') sample();
  }
  function navCounts() {
    const n = { orders: orders().length, garage: S.garage.length, builds: builds().length, wish: S.wish.length, points: num(balance()), alerts: alerts().length };
    $$('[data-n]').forEach(e => { const v = n[e.dataset.n]; e.textContent = v || v === 0 && e.dataset.n === 'points' ? v : ''; });
  }
  function moveInk() {
    const a = $('#ac-nav a.is-on'), ink = $('.ac-nav-ink'); if (!a || !ink) return;
    Object.assign(ink.style, { width: a.offsetWidth + 'px', height: a.offsetHeight + 'px', transform: `translate(${a.offsetLeft}px, ${a.offsetTop}px)` });
    const nav = $('#ac-nav'); if (nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });
  }
  function show(k, first) {
    if (!TABS.includes(k)) k = 'overview';
    const prev = cur; cur = k;
    $$('#ac-nav a').forEach(a => a.classList.toggle('is-on', a.dataset.tab === k));
    $('#ac-crumb').textContent = tabName(k);
    document.title = `${tabName(k)} — My Garage | HPZ Diecast`;
    $$('.ac-panel').forEach(p => { const on = p.dataset.panel === k; p.hidden = !on; p.classList.toggle('is-enter', on && !first); });
    render(k); moveInk();
    if (!first && prev) { const top = $('.ac-wrap').getBoundingClientRect().top + scrollY - 80; if (scrollY > top) scrollTo({ top, behavior: 'smooth' }); }
  }
  function renderAll() { drawId(); navCounts(); show(cur || (location.hash.slice(1) || 'overview'), true); }

  /* ================= events ================= */
  const main = $('.ac-main');
  main.addEventListener('click', e => {
    const tgt = e.target;
    const goto = tgt.closest('[data-goto]'); if (goto) { openNo = goto.dataset.goto; }
    const oh = tgt.closest('.od-h'); if (oh) { toggleOrder(oh.closest('.od')); return; }
    const act = tgt.closest('[data-act]');
    if (act) {
      const o = orders().find(x => x.no === act.closest('.od').dataset.no); if (!o) return;
      const a = act.dataset.act;
      if (a === 'reorder') { const lines = o.lines.filter(l => l.v.a).map(l => ({ id: l.p.id, vid: l.v.id, q: l.q })); if (lines.length) H.addMany(lines, act); else H.toast({ title: t('These parts are sold out', 'Part sudah habis', '在庫切れです'), icon: ICON.bell }); }
      if (a === 'track') { try { navigator.clipboard && navigator.clipboard.writeText(o.track); } catch (er) { /* ignore */ } act.closest('.od').querySelector('.trk').scrollIntoView({ behavior: 'smooth', block: 'center' }); animTrk(act.closest('.od')); H.toast({ title: t('Tracking number copied', 'Nomor resi disalin', '追跡番号をコピーしました'), sub: `${o.carrier} ${o.track}`, icon: ICON.truck, action: o.carrier, onAction: () => {} }); }
      if (a === 'invoice') { act.classList.add('is-loading'); act.insertAdjacentHTML('beforeend', '<i class="spin"></i>'); setTimeout(() => { act.classList.remove('is-loading'); act.querySelector('.spin').remove(); H.toast({ title: t('Invoice downloaded', 'Invoice diunduh', '請求書をダウンロードしました'), sub: `HPZ-INV-${o.no.replace(/\D/g, '')}.pdf · ${o.cc === 'ID' ? 'IDR' : 'EUR · IOSS'}`, icon: ICON.upload }); }, 800); }
      return;
    }
    const pri = tgt.closest('[data-primary]'); if (pri) { const c = H.castById(pri.dataset.primary); H.setGarage(c.id); H.toast({ title: t('Primary casting set', 'Casting utama diset', 'メイン車種を設定'), sub: c.n, icon: ICON.car }); return; }
    const un = tgt.closest('[data-uncast]');
    if (un) {
      const id = un.dataset.uncast, card = un.closest('.gc'), c = H.castById(id), before = S.garage.slice();
      card.classList.add('is-out');
      setTimeout(() => { S.garage = S.garage.filter(x => x !== id); LS.set('garage', S.garage); H.emit('garage', S.garage[0] || null); H.toast({ title: t('Casting removed', 'Casting dihapus', '車種を削除'), sub: c.n, icon: ICON.car, action: t('Undo', 'Batal', '元に戻す'), onAction: () => { S.garage = before; LS.set('garage', before); H.emit('garage', before[0]); } }); }, 280);
      return;
    }
    const bc = tgt.closest('[data-bs-cart]'); if (bc) { const b = builds()[+bc.dataset.bsCart]; const lines = b.ps.filter(p => p.a).map(p => ({ id: p.id, q: 1 })); if (lines.length) H.addMany(lines, bc); return; }
    if (tgt.closest('#wl-all')) { const lines = S.wish.map(H.byId).filter(p => p && p.a).map(p => ({ id: p.id, q: 1 })); if (lines.length) H.addMany(lines, tgt.closest('#wl-all')); return; }
    const rd = tgt.closest('[data-redeem]');
    if (rd) {
      const r = REWARDS().find(x => x.id === rd.dataset.redeem); const from = balance(); if (from < r.cost) return;
      const code = `${r.pre}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      LS.set('acct.redeemed', [...redeemed(), { cost: r.cost, n: r.n, code, d: Date.now() }]);
      rd.classList.add('is-loading'); rd.insertAdjacentHTML('beforeend', '<i class="spin"></i>');
      setTimeout(() => {
        render('points'); drawId(); navCounts();
        const n = $('#p-points .pts-n [data-cu]'); if (n) H.countUp(n, balance(), { from, dur: 900 });
        H.toast({ title: t('Reward unlocked', 'Reward didapat', '特典を獲得'), sub: `${code} — ${r.n}`, icon: ICON.gift, action: t('Copy', 'Salin', 'コピー'), onAction: () => { try { navigator.clipboard.writeText(code); } catch (er) { /* ignore */ } }, ms: 7000 });
      }, 700);
      return;
    }
    if (tgt.closest('#ad-add')) { const f = $('#ad-form'); f.hidden = false; f.classList.add('is-enter'); f.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => $('#af-a').focus(), 300); return; }
    if (tgt.closest('#af-x')) { $('#ad-form').hidden = true; return; }
    const ade = tgt.closest('[data-ad-edit]'); if (ade) { const a = ADDR.find(x => x.id === ade.dataset.adEdit); $('#ad-form').hidden = false; $('#af-n').value = a.name; $('#af-a').value = a.l[0]; $('#af-ci').value = a.l[a.l.length - 2]; $('#af-z').value = (a.l.join(' ').match(/\b\d{5}\b/) || [''])[0]; $('#af-c').value = a.cc === 'EU' ? 'EU' : a.cc; $('#ad-form').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    const add = tgt.closest('[data-ad-def]'); if (add) { ADDR.forEach(a => { a.def = a.id === add.dataset.adDef ? 1 : 0; }); ADDR.sort((a, b) => b.def - a.def); render('addresses'); H.toast({ title: t('Default address updated', 'Alamat utama diperbarui', '既定の住所を更新'), icon: ICON.pin }); return; }
    const adr = tgt.closest('[data-ad-rm]'); if (adr) { ADDR = ADDR.filter(a => a.id !== adr.dataset.adRm); render('addresses'); return; }
    const alr = tgt.closest('[data-al-rm]');
    if (alr) { const id = +alr.dataset.alRm, li = alr.closest('.al'); li.classList.add('is-out'); setTimeout(() => { removedAlerts.add(id); LS.set('acct.alertsOff', [...removedAlerts]); render('alerts'); navCounts(); }, 320); return; }
    const lg = tgt.closest('#sl-l [data-lg]'); if (lg) { $$('#sl-l button').forEach(b => b.classList.toggle('is-on', b === lg)); sample(); return; }
    if (tgt.closest('#sl-save')) { const lang = $('#sl-l .is-on').dataset.lg; const m = $('#sl-m').value; H.setMarket(m, lang); H.toast({ title: t('Region updated', 'Wilayah diperbarui', '地域を更新しました'), sub: `${C.MARKETS[m].n} · ${C.MARKETS[m].cur} · ${C.LANGS[lang]}`, icon: H.FLAG[C.MARKETS[m].flag] }); return; }
    if (tgt.closest('#st-del')) { H.toast({ title: t('Request sent', 'Permintaan dikirim', 'リクエストを送信'), sub: t('We will confirm by email within 48 h.', 'Kami konfirmasi via email dalam 48 jam.', '48時間以内にメールで確認します。'), icon: ICON.mail }); return; }
  });
  main.addEventListener('change', e => {
    if (e.target.id === 'sl-m') sample();
    const pf = e.target.closest('[data-pref]'); if (pf) { const p = LS.get('acct.prefs', { drops: true, restock: true, academy: false, sms: false }); p[pf.dataset.pref] = pf.checked; LS.set('acct.prefs', p); H.toast({ title: pf.checked ? t('Subscribed', 'Berlangganan', '購読しました') : t('Unsubscribed', 'Berhenti langganan', '購読解除'), sub: pf.closest('.st-r').querySelector('b').textContent, icon: ICON.mail, ms: 2400 }); }
    const al = e.target.closest('[data-al-on]'); if (al) al.closest('.al').classList.toggle('is-mute', !al.checked);
  });
  main.addEventListener('submit', e => {
    e.preventDefault();
    if (e.target.id === 'ad-form') {
      const cc = $('#af-c').value;
      ADDR.push({ id: 'a' + Date.now(), cc: H.FLAG[cc] ? cc : 'INT', label: t('Address', 'Alamat', '住所') + ' ' + (ADDR.length + 1), name: $('#af-n').value, l: [$('#af-a').value, `${$('#af-z').value} ${$('#af-ci').value}`, C.MARKETS[cc].n], ph: USER.phone, def: 0 });
      render('addresses'); H.toast({ title: t('Address saved', 'Alamat disimpan', '住所を保存しました'), icon: ICON.pin });
    }
    if (e.target.id === 'st-prof') { USER.name = $('#sp-n').value || USER.name; drawId(); H.toast({ title: t('Profile saved', 'Profil disimpan', 'プロフィールを保存'), icon: ICON.check }); }
  });
  function sample() { const m = $('#sl-m'); if (!m) return; const c = C.CURRENCIES[C.MARKETS[m.value].cur]; $('#sl-x').textContent = H.fmt(H.conv(13.5, c), c) + ' — HPZ Wheels SIX'; }
  window.addEventListener('hashchange', () => { if (!isLogin) show(location.hash.slice(1)); });
  window.addEventListener('resize', H.debounce(moveInk, 100));

  /* ================= sign-in view ================= */
  const isLogin = H.params().has('login');
  let mode = 'in', otp = false;
  function loginCopy() {
    $('#lg-title').textContent = mode === 'in' ? t('Welcome back', 'Selamat datang lagi', 'おかえりなさい') : t('Join the pit crew', 'Gabung pit crew', 'ピットクルーに参加');
    $('#lg-sub').textContent = mode === 'in' ? t('Sign in to see orders, saved builds and your Pit Points.', 'Masuk untuk lihat pesanan, build tersimpan & Pit Points.', '注文・保存ビルド・ポイントを確認。') : t('200 Pit Points on sign-up, plus 10% off your first order.', '200 Pit Points saat daftar + diskon 10% order pertama.', '登録で200pt＋初回10%オフ。');
    $('#lg-go-t').textContent = otp ? t('Verify code', 'Verifikasi kode', 'コードを確認') : mode === 'in' ? t('Sign in', 'Masuk', 'ログイン') : t('Create account', 'Buat akun', 'アカウント作成');
    $('#lg-otp-t').textContent = otp ? t('Use password instead', 'Pakai password', 'パスワードを使う') : t('Email me a one-time code', 'Kirim kode sekali pakai', 'ワンタイムコードを送信');
  }
  function initLogin() {
    $('#acct').hidden = true; $('#login').hidden = false;
    document.title = t('Sign in', 'Masuk', 'ログイン') + ' | HPZ Diecast';
    $('#lg-wheel').innerHTML = H.wheelSVG({ spokes: 6, finish: 'gold', disc: 1 }) + `<span class="lg-dim mono">Ø 10.00 mm</span>`;
    $('#lg-otp').innerHTML = Array.from({ length: 6 }, (_, i) => `<input class="input mono" inputmode="numeric" maxlength="1" aria-label="Digit ${i + 1}">`).join('');
    $('#lg-eye').innerHTML = ICON.eye;
    loginCopy();
    requestAnimationFrame(() => $('#login').classList.add('is-in'));
    $('.lg-seg').addEventListener('click', e => {
      const b = e.target.closest('[data-mode]'); if (!b) return; mode = b.dataset.mode;
      $$('.lg-seg button').forEach(x => x.classList.toggle('is-on', x === b));
      $('.lg-name').hidden = mode === 'in'; $('#lg-p').autocomplete = mode === 'in' ? 'current-password' : 'new-password';
      $('#lg-form').classList.remove('is-swap'); void $('#lg-form').offsetWidth; $('#lg-form').classList.add('is-swap');
      loginCopy();
    });
    $('#lg-eye').onclick = () => { const p = $('#lg-p'); p.type = p.type === 'password' ? 'text' : 'password'; };
    const emailOk = () => { const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('#lg-e').value); $('#lg-e').classList.toggle('is-err', !ok); return ok; };
    $('#lg-otp-t').onclick = () => {
      if (!otp && !emailOk()) { $('#lg-e').focus(); return; }
      otp = !otp; $('.lg-pw').hidden = otp; $('#lg-code').hidden = !otp; loginCopy();
      if (otp) { $$('#lg-otp input')[0].focus(); H.toast({ title: t('Code sent', 'Kode dikirim', 'コードを送信しました'), sub: $('#lg-e').value + ' · ' + t('valid for 10 min', 'berlaku 10 menit', '10分間有効'), icon: ICON.mail }); }
    };
    const boxes = () => $$('#lg-otp input');
    $('#lg-otp').addEventListener('input', e => { const i = boxes().indexOf(e.target); e.target.value = e.target.value.replace(/\D/g, '').slice(-1); if (e.target.value && boxes()[i + 1]) boxes()[i + 1].focus(); if (boxes().every(b => b.value)) $('#lg-form').requestSubmit(); });
    $('#lg-otp').addEventListener('keydown', e => { const i = boxes().indexOf(e.target); if (e.key === 'Backspace' && !e.target.value && boxes()[i - 1]) boxes()[i - 1].focus(); });
    $('#lg-otp').addEventListener('paste', e => { const d = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6); if (!d) return; e.preventDefault(); boxes().forEach((b, i) => { b.value = d[i] || ''; }); if (d.length === 6) $('#lg-form').requestSubmit(); });
    $('#lg-e').addEventListener('input', () => $('#lg-e').classList.remove('is-err'));
    $('#lg-form').addEventListener('submit', e => {
      e.preventDefault(); if (!emailOk()) { $('#lg-e').focus(); return; }
      const b = $('#lg-go'); b.classList.add('is-loading');
      setTimeout(() => { b.classList.remove('is-loading'); b.classList.add('is-done'); $('#lg-go-t').innerHTML = ICON.tick; b.style.color = '#fff'; setTimeout(() => { location.href = 'account.html'; }, 450); }, 900);
    });
  }

  /* ================= boot ================= */
  if (isLogin) initLogin();
  else renderAll();
  H.on('market', () => { if (isLogin) loginCopy(); else renderAll(); });
  H.on('garage', () => { if (isLogin) return; drawId(); navCounts(); if (cur === 'garage' || cur === 'overview') render(cur); });
  H.on('wish', () => { if (isLogin) return; navCounts(); if (cur === 'wishlist') render('wishlist'); });
  H.on('cart', () => {});
});
