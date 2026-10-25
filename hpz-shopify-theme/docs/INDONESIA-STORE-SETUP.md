# Toko Indonesia (my0ywb-0x.myshopify.com): langkah setup

Dua toko, satu theme. Theme sudah di-push ke kedua toko sebagai theme tidak aktif:
- Toko Internasional (hpzdiecast.com): theme "HPZ Redesign Preview", peran `global`.
- Toko Indonesia (my0ywb-0x): theme "HPZ Redesign Indonesia" (id 189341827324), peran `indonesia`.

Dokumen lama `INDONESIA-PAYMENT-SETUP.md` bagian pembayaran manual (QRIS, transfer BCA, halaman Bayar, email) tetap dipakai, tapi
sekarang di toko Indonesia. Bagian "Market Indonesia", "Jalur A/B" dan estimasi Rupiah di theme tidak diperlukan lagi
karena mata uang dasar toko Indonesia sudah IDR.

## 1. Pengaturan dasar toko Indonesia (Admin toko baru)

1. Settings > Store details: Store currency = **Indonesian Rupiah (IDR)**. Lakukan ini sebelum menambah produk.
2. Settings > Languages: ubah bahasa default menjadi **Bahasa Indonesia**. Teks theme sudah ada dalam bahasa Indonesia.
3. Settings > Markets: pastikan ada dua market supaya deteksi IP bekerja.
   - **Indonesia**: negara Indonesia, mata uang IDR.
   - **International**: semua negara lain. Market ini hanya agar Shopify bisa melaporkan negara pengunjung asing, supaya mereka dialihkan ke toko internasional.
   Pengunjung dari negara yang tidak masuk market selalu dilaporkan sebagai negara market utama, jadi pengalihan tidak akan bekerja tanpa market International.
4. Settings > Shipping and delivery: buat zona Indonesia dengan tarif Rupiah (JNE, SiCepat, atau flat).
5. Settings > Taxes and duties: atur sesuai kebutuhan klien (PPN).
6. Matikan password toko saat siap dibuka (Online Store > Preferences). Selama password aktif, pengalihan dari .com ke toko ini tidak berguna.

## 2. Impor produk dengan harga Rupiah

1. Berkas: `setup/products-idr.csv`, dibuat dari export produk toko lama (`products_export_1 (1).csv`: 517 produk, 1.419 baris, 1.126 varian).
   Semua data dipertahankan persis seperti export (judul, opsi, gambar, SEO, status, pelacakan stok, jumlah stok, berat, kolom Google Shopping).
   Hanya harga yang berubah: harga USD dikali 16.300 dan dibulatkan ke Rp1.000 (misalnya 13,50 menjadi Rp 220.000).
   Ubah kurs atau pembulatan: `node tools/gen-id-csv.cjs "../products_export_1 (1).csv" 16300 1000`.
2. Admin toko Indonesia > Products > Import > pilih berkas. Jumlah stok masuk ke lokasi default toko baru, jadi pastikan lokasi itu ada (Settings > Locations).
3. Status produk ikut export: 491 active dan 26 archived.
4. **Cek angka stok.** Total stok di export 97.572 unit dan banyak varian bernilai 100. Kalau itu angka sementara, perbaiki lewat Products > Inventory sebelum toko dibuka, supaya tidak ada barang habis yang terjual.
5. Metafield `hpz.*`, metaobject casting/brand/build, dan koleksi tidak ikut dalam export ini (hanya metafield Shopify standar warna, bahan, dan level). Lihat `setup/product-metafields.csv` dan `setup/schema.json`, atau pakai aplikasi seperti Matrixify untuk menyalin semuanya.
6. Cek hasil impor: jumlah produk, harga contoh, gambar, dan varian.

## 3. Domain

Rekomendasi: subdomain `id.hpzdiecast.com`.
1. Toko Indonesia > Settings > Domains > Connect existing domain > `id.hpzdiecast.com`.
2. Di DNS domain: buat record CNAME `id` menuju `shops.myshopify.com`.
3. Tunggu verifikasi dan SSL, lalu jadikan domain utama toko ini.

## 4. Aktifkan theme dan hubungkan kedua toko

Di toko Indonesia, buka theme editor theme "HPZ Redesign Indonesia" > Theme settings > Stores (Indonesia / International) dan pastikan:
- This store is: Indonesia
- International store URL: https://hpzdiecast.com
- Indonesia store URL: https://id.hpzdiecast.com

Di toko Internasional, theme settings yang sama:
- This store is: International
- Indonesia store URL: https://id.hpzdiecast.com

Pengalihan baru aktif setelah URL toko lawan diisi. Lakukan ini paling akhir, setelah domain dan toko Indonesia siap dipakai dan theme-nya dipublikasikan.

Aturan: IP Indonesia di toko internasional dialihkan ke toko Indonesia. IP luar negeri di toko Indonesia dialihkan ke toko internasional.
Pilihan manual di pemilih wilayah (header atau footer) tidak akan dialihkan lagi di browser itu.
Link `hreflang` antar toko ditambahkan otomatis di kepala halaman supaya Google memahami kedua domain.

## 5. Pembayaran dan ongkir di toko Indonesia

- Payment: Settings > Payments > Manual payment methods. Buat QRIS dan Transfer BCA (teks siap tempel di `INDONESIA-PAYMENT-SETUP.md` bagian 4).
- Halaman Bayar: Pages > Add page, judul `Bayar`, handle `bayar`, template `payment`. Isi nomor rekening BCA di Theme settings > Local payment (Indonesia).
- Email konfirmasi: tempel blok di `INDONESIA-PAYMENT-SETUP.md` bagian 5. Di toko ini total sudah Rupiah, jadi tautan `&cur=IDR` otomatis benar.
- Estimasi ongkir kurir: `ONGKIR-SETUP.md`, isi Ongkir Worker URL di Theme settings.
- Karena mata uang IDR, `idr_rate` di theme tidak dipakai di toko ini dan boleh 0.

## 6. Yang tetap harus dikerjakan manual

- Menyamakan stok dua toko (satu gudang): awalnya bagi stok per toko, atau pakai aplikasi sinkron seperti Syncio atau Matrixify.
- Pesanan dikelola di admin masing-masing toko.
- Nomor rekening BCA dan nomor WhatsApp konfirmasi di Theme settings toko Indonesia.
