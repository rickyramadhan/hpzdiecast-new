/* HPZ ongkir proxy — Cloudflare Worker.
   Keeps the RajaOngkir (Komerce) API key off the storefront. The theme only talks to this Worker.

   Secrets / variables (Cloudflare dashboard > Worker > Settings > Variables):
     KOMERCE_KEY     (secret)  API key from the RajaOngkir / Komerce dashboard
     ORIGIN_ID       (text)    destination id of the shop's origin (find it with GET /destinations?q=<kecamatan>)
     ALLOWED_ORIGIN  (text)    https://hpzdiecast.com   (comma separated for more, e.g. also the myshopify domain)
   Routes:
     GET  /destinations?q=<text>          -> [{ id, label }]
     POST /rates  { destination, weight, couriers }  -> { rates: [{ courier, service, description, cost, etd }] }
   Upstream docs: https://rajaongkir.com/docs (endpoint paths below follow the V2 / Komerce API; verify once with a real key). */

const BASE = 'https://rajaongkir.komerce.id/api/v1';
const COURIERS = ['jne', 'sicepat', 'jnt', 'anteraja', 'pos', 'tiki', 'ide', 'sap', 'ninja', 'lion', 'wahana', 'sentral', 'rpx', 'ncs', 'rex', 'star', 'dse'];

const json = (body, status, cors) => new Response(JSON.stringify(body), {
  status, headers: Object.assign({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }, cors)
});

async function cached(ctx, url, ttl, make) {
  const key = new Request(url);
  const hit = await caches.default.match(key);
  if (hit) return hit;
  const res = await make();
  if (res.ok) {
    const copy = new Response(res.body, res);
    copy.headers.set('cache-control', 'public, max-age=' + ttl);
    ctx.waitUntil(caches.default.put(key, copy.clone()));
    return copy;
  }
  return res;
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const origin = req.headers.get('origin') || '';
    const allowed = (env.ALLOWED_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
    const okOrigin = allowed.includes(origin);
    const cors = okOrigin ? { 'access-control-allow-origin': origin, 'vary': 'origin', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type' } : {};

    if (req.method === 'OPTIONS') return new Response(null, { status: okOrigin ? 204 : 403, headers: cors });
    if (!okOrigin) return json({ error: 'forbidden' }, 403, cors);
    if (!env.KOMERCE_KEY) return json({ error: 'not_configured' }, 500, cors);
    const headers = { key: env.KOMERCE_KEY };

    try {
      if (req.method === 'GET' && url.pathname === '/destinations') {
        const q = (url.searchParams.get('q') || '').trim().slice(0, 60);
        if (q.length < 3) return json({ results: [] }, 200, cors);
        const upstream = BASE + '/destination/domestic-destination?limit=8&offset=0&search=' + encodeURIComponent(q);
        const res = await cached(ctx, upstream, 86400, () => fetch(upstream, { headers }));
        if (!res.ok) return json({ error: 'upstream', status: res.status }, 502, cors);
        const d = await res.json();
        const results = (d.data || []).map(x => ({ id: x.id, label: x.label || [x.subdistrict_name, x.district_name, x.city_name, x.province_name, x.zip_code].filter(Boolean).join(', ') }));
        return json({ results }, 200, cors);
      }

      if (req.method === 'POST' && url.pathname === '/rates') {
        const b = await req.json().catch(() => ({}));
        const destination = String(b.destination || '').replace(/\D/g, '').slice(0, 10);
        const weight = Math.min(30000, Math.max(1, parseInt(b.weight, 10) || 0));
        const couriers = String(b.couriers || 'jne').toLowerCase().split(/[:,]/).filter(c => COURIERS.includes(c)).slice(0, 6);
        if (!destination || !weight || !couriers.length) return json({ error: 'bad_request' }, 400, cors);
        // weight is rounded up to the next 100 g so cache hits stay frequent and rates stay stable
        const w = Math.ceil(weight / 100) * 100;
        const body = new URLSearchParams({ origin: String(env.ORIGIN_ID), destination, weight: String(w), courier: couriers.join(':'), price: 'lowest' }).toString();
        const upstream = BASE + '/calculate/domestic-cost';
        const cacheKey = upstream + '?o=' + env.ORIGIN_ID + '&d=' + destination + '&w=' + w + '&c=' + couriers.join(':');
        const res = await cached(ctx, cacheKey, 3600, () => fetch(upstream, { method: 'POST', headers: Object.assign({ 'content-type': 'application/x-www-form-urlencoded' }, headers), body }));
        if (!res.ok) return json({ error: 'upstream', status: res.status }, 502, cors);
        const d = await res.json();
        const rates = (d.data || []).filter(x => x && x.cost > 0).map(x => ({
          courier: String(x.name || x.code || '').toUpperCase(),
          service: x.service || '',
          description: x.description || '',
          cost: Math.round(+x.cost),
          etd: x.etd || ''
        })).sort((a, b) => a.cost - b.cost);
        return json({ rates, weight: w }, 200, cors);
      }
      return json({ error: 'not_found' }, 404, cors);
    } catch (e) {
      return json({ error: 'failed' }, 502, cors);
    }
  }
};
