# Estimasi ongkir kurir di cart (JNE, SiCepat, dll)

Fitur ini hanya untuk pengunjung sisi Indonesia. Pembeli memilih kecamatan atau kota di cart, lalu melihat tarif beberapa kurir
berdasarkan berat isi cart. Ini perkiraan saja. Shopify tetap menagih tarif dari zona pengiriman Indonesia di Admin,
dan admin mengonfirmasi ongkir final lewat WhatsApp.

Alurnya: cart di theme -> Worker Cloudflare (menyimpan API key) -> API RajaOngkir/Komerce.
API key tidak boleh ada di theme, karena semua kode theme bisa dibaca pengunjung.

## 1. Akun dan API key

1. Daftar di https://rajaongkir.com (Komerce), buka dashboard, buat API key untuk "Shipping Cost".
2. Cek di halaman paket mereka berapa kuota gratisnya dan kurir apa saja yang termasuk. Dokumentasi publik tidak menyebut angka,
   jadi pastikan sebelum dijanjikan ke klien.
3. Simpan key. Jangan kirim lewat chat atau email, dan jangan taruh di berkas theme.

## 2. Pasang Worker

1. Daftar di https://dash.cloudflare.com (gratis), menu Workers & Pages > Create > Worker, beri nama `hpz-ongkir`.
2. Edit code, hapus isi bawaan, tempel seluruh isi `worker/ongkir-worker.js`, lalu Deploy.
3. Settings > Variables and Secrets, tambahkan:
   - `KOMERCE_KEY` (tipe Secret): API key dari langkah 1.
   - `ALLOWED_ORIGIN` (Text): `https://hpzdiecast.com,https://www.hpzdiecast.com`
   - `ORIGIN_ID` (Text): diisi di langkah 3.
4. Catat alamat Worker, bentuknya `https://hpz-ongkir.<akun>.workers.dev`.

Alternatif lewat terminal: `cd worker`, isi `ORIGIN_ID` di `wrangler.toml`, jalankan `npx wrangler deploy`, lalu `npx wrangler secret put KOMERCE_KEY`.

## 3. Cari ORIGIN_ID (kota asal pengiriman)

Origin saat ini di theme: Jakarta Selatan (Theme settings > Store information). Cari id kecamatan gudang yang tepat:

Buka di browser lewat halaman toko, atau dari terminal:
`curl -H "Origin: https://hpzdiecast.com" "https://hpz-ongkir.<akun>.workers.dev/destinations?q=kebayoran"`

Ambil `id` dari baris yang cocok dengan lokasi gudang, lalu isikan sebagai `ORIGIN_ID` di Worker dan Deploy ulang.

## 4. Sambungkan ke theme

Theme editor > Theme settings > Shipping estimate (Indonesia):
- Ongkir Worker URL: alamat Worker dari langkah 2.
- Couriers: kode kurir dipisah titik dua, misalnya `jne:sicepat:jnt:anteraja`.
- Packaging weight: berat kemasan dalam gram (default 50), ditambahkan ke berat produk.

Kosongkan Worker URL untuk menyembunyikan fitur.

## 5. Uji

1. Buka toko dengan negara Indonesia (setelah zona pengiriman Indonesia dibuat, supaya cart tidak kosong), masukkan satu produk ke cart.
2. Ketik nama kecamatan di kotak estimasi, pilih dari daftar, dan pastikan tarif muncul.
3. Bandingkan satu tarif dengan cek ongkir resmi kurir. Selisih kecil wajar.

## Catatan

- Berat diambil dari berat varian di Shopify (saat ini 625 dari 626 varian sudah berisi berat). Varian tanpa berat dihitung 0 g, jadi isi bagian itu.
- Worker membulatkan berat ke atas per 100 g dan menyimpan hasil di cache (tujuan 24 jam, tarif 1 jam), sehingga kuota API hemat.
- Worker menolak permintaan dari domain selain `ALLOWED_ORIGIN`.
- Endpoint API mengikuti dokumentasi RajaOngkir V2 (Komerce). Sebelum dipakai, uji sekali dengan key asli. Kalau Komerce mengubah path atau bentuk respons, ubah di `worker/ongkir-worker.js` bagian `BASE` dan pemetaan `rates`.
- Tarif di sini dalam Rupiah dan tidak dikonversi oleh `idr.js`.
