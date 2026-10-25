# Pembayaran lokal Indonesia: QRIS dan transfer BCA (manual)

Dokumen ini untuk pemilik toko dan admin. Checkout Shopify tetap dihosting Shopify, jadi theme tidak bisa mengubah halaman checkout.
Yang dikerjakan theme: info di cart, halaman khusus `/pages/bayar` (QRIS, rekening, tombol konfirmasi WhatsApp), dan teks siap tempel
untuk metode pembayaran serta email konfirmasi.

## 0. Hal yang BELUM pasti: apakah checkout bisa langsung dalam Rupiah

Sumber resmi Shopify tidak sinkron, jadi ini harus diuji di toko Anda sebelum dijanjikan ke klien.

- Changelog Shopify (8 Juli 2025): metode pembayaran manual (transfer bank, COD) kini mendukung multi-currency untuk toko yang memakai Markets. Metode ini ditampilkan dan dicatat dalam mata uang market.
- Halaman bantuan Markets: harga mata uang lokal hanya bisa ditagih lewat Shopify Payments atau Adyen. Dengan gateway lain, harga lokal hanya tampilan, dan checkout dikonversi ke mata uang utama toko (USD). Shopify Payments belum tersedia untuk merchant Indonesia.

Uji ini menentukan jalurnya (lihat bagian 6):
- **Jalur A**: checkout dan pesanan tercatat dalam IDR. Semua harga sudah benar, dan `idr_rate` dibiarkan 0.
- **Jalur B**: checkout tetap USD. Halaman `/pages/bayar` mengonversi total USD ke Rupiah memakai kurs yang Anda isi (`idr_rate`), dan nominal akhir dikonfirmasi admin lewat WhatsApp. Ini bekerja tetapi pelanggan melihat harga USD di checkout. Bicarakan dengan klien.

## 1. Market Indonesia dan mata uang

1. Admin > Settings > Markets > Add market, beri nama Indonesia, pilih negara Indonesia.
2. Di bagian Currency, pilih IDR. Jika pilihan IDR tidak tersedia atau terkunci, itu pertanda Jalur B.
3. Atur pembulatan harga (disarankan ke ribuan terdekat), supaya harga tidak berakhiran angka aneh.
4. Publikasikan market hanya setelah semua langkah di bawah selesai dan diuji.

Catatan: saat ini Indonesia tidak ada di daftar negara tujuan kirim toko, sehingga pengunjung dari Indonesia melihat semua produk "sold out".
Market Indonesia dan zona pengiriman di bawah yang memperbaikinya.

## 2. Pengiriman ke Indonesia

Settings > Shipping and delivery > General shipping rates > tambahkan zona Indonesia dengan tarif (JNE, SiCepat, atau tarif manual lain).
Tanpa zona ini produk tetap tampil sold out untuk pengunjung Indonesia. Tarif ditetapkan dalam mata uang utama toko dan dikonversi oleh market.

## 3. Bahasa Indonesia

Settings > Languages > Add language > Bahasa Indonesia > Publish. Lalu di Markets > Indonesia pilih Bahasa Indonesia sebagai bahasa default market.
Hanya dua bahasa yang dipublikasikan: English (default) dan Bahasa Indonesia. Jangan publikasikan bahasa lain. Terjemahan produk dikelola lewat app Translate & Adapt.


## 3b. Aturan IP: dua bahasa, dua mata uang (ketat)

Aturan di theme (snippet `geo-guard`, aktif lewat Theme settings > Region (IP rule) > Enforce IP rule):

| IP pengunjung | Bahasa | Mata uang |
|---|---|---|
| Indonesia | Bahasa Indonesia | IDR |
| Negara lain mana pun | English | USD |

Cara kerja: Shopify mendeteksi negara dari IP di server saat kunjungan pertama. Script membandingkan negara itu dengan bahasa dan mata uang yang sedang tampil. Jika tidak sesuai, script mengirim form localization satu kali dan halaman dimuat ulang dengan bahasa dan mata uang yang benar. Tidak memakai layanan IP pihak ketiga.

Syarat di Admin supaya aturan bisa berjalan:
1. Hanya dua market aktif: **Indonesia** (negara ID, mata uang IDR, bahasa id) dan **International** (semua negara lain, mata uang USD, bahasa en). Market per negara lain (Japan, Singapore, dll) dihapus atau digabung ke International. Jika ada market non-USD, pengunjung dari sana dipindah ke negara US.
2. Bahasa id dipublikasikan dan dipasang di market Indonesia.
3. Jika IDR tidak tersedia (Jalur B di bagian 0), pengunjung Indonesia tetap mendapat bahasa Indonesia tetapi harga USD. Script tidak akan mengulang pindah (batas satu kali per sesi), jadi tidak ada loop.

Batasan yang jujur:
- Pengguna VPN dinilai dari IP VPN mereka.
- Pemilihan wilayah manual dinonaktifkan; modal wilayah hanya informasi.
- Script tidak jalan di server dev lokal, di editor theme, dan untuk bot mesin pencari.
- Uji nyata hanya bisa dilakukan di domain live (atau preview theme dengan VPN Indonesia dan non-Indonesia).

## 4. Metode pembayaran manual

Settings > Payments > Manual payment methods > Create custom payment method. Buat dua metode.

Hapus atau nonaktifkan PayPal dan metode lain di toko Indonesia: Settings > Payments > klik metode > Deactivate/Remove.
Di toko ini hanya dua metode manual di bawah yang boleh aktif. Kolom "Additional details" tampil di halaman checkout saat pembeli memilih metode,
dan "Payment instructions" tampil di halaman terima kasih dan email konfirmasi. Ganti `id.hpzdiecast.com` dengan domain toko Indonesia yang aktif.

**Metode 1: QRIS**
- Name: `QRIS (semua bank dan e-wallet)`
- Additional details:
  `PENTING: pembayaran manual. Setelah klik Complete order, scan QRIS dan bayar sesuai total, lalu WAJIB konfirmasi ke admin lewat WhatsApp (kirim bukti bayar dan nomor pesanan). Pesanan belum diproses sebelum admin mengonfirmasi.`
- Payment instructions:
  `Buka https://id.hpzdiecast.com/pages/bayar lalu scan QRIS atas nama HPZ STORE N TOYS dan bayar sesuai total pesanan. Setelah itu tekan tombol Konfirmasi via WhatsApp di halaman tersebut dan kirim bukti pembayaran. Pesanan diproses setelah admin mengonfirmasi pembayaran. Pesanan yang tidak dibayar dalam 24 jam dibatalkan.`

**Metode 2: Transfer bank BCA**
- Name: `Transfer Bank BCA`
- Additional details:
  `PENTING: pembayaran manual. Setelah klik Complete order, transfer sesuai total ke BCA a.n. Heru Prasetyo, lalu WAJIB konfirmasi ke admin lewat WhatsApp (kirim bukti transfer dan nomor pesanan). Pesanan belum diproses sebelum admin mengonfirmasi.`
- Payment instructions (ganti nomor rekening):
  `Transfer sesuai total pesanan ke BCA [NOMOR REKENING] a.n. Heru Prasetyo. Tulis nomor pesanan di berita transfer. Setelah transfer, buka https://id.hpzdiecast.com/pages/bayar dan konfirmasi pembayaran lewat WhatsApp. Pesanan diproses setelah admin mengonfirmasi pembayaran. Pesanan yang tidak dibayar dalam 24 jam dibatalkan.`

Batas 24 jam itu belum dikonfirmasi klien; sesuaikan dengan kebijakan yang berlaku dan samakan dengan pengaturan "Payment deadline" di theme.

Penting: metode manual muncul untuk semua negara kecuali dibatasi. Shopify tidak punya pengaturan bawaan per negara untuk metode manual.
Jika klien tidak ingin pembeli internasional melihat QRIS dan transfer BCA, gunakan app payment customization (misalnya HidePay) untuk menyembunyikannya di luar Indonesia.

## 5. Halaman Bayar dan pengaturan theme

1. Pages > Add page. Judul `Bayar` (handle harus `bayar`), Theme template `payment`.
2. Theme editor > Theme settings > Local payment (Indonesia): isi **nomor rekening BCA**, nomor WhatsApp konfirmasi (jika berbeda dari nomor toko), batas waktu bayar, dan `idr_rate` bila Jalur B.
   QRIS sudah terpasang dari berkas `assets/qris-hpz.jpg` (HPZ STORE N TOYS, NMID ID1022170478187).
3. Footer dan cart sudah menautkan ke `/pages/bayar` untuk pengunjung Indonesia.

### Email konfirmasi pesanan (tautan otomatis dengan nomor pesanan dan total)
Settings > Notifications > Customer notifications > Order confirmation > Edit code. Tempel blok ini setelah ringkasan pesanan:

```liquid
{% if shipping_address.country_code == 'ID' and financial_status != 'paid' %}
  <h3>Cara bayar (QRIS atau transfer BCA)</h3>
  <p>Total pesanan: {{ total_price | money }}</p>
  <p><a href="https://hpzdiecast.com/pages/bayar?order={{ name | url_encode }}&total={{ total_price | divided_by: 100.0 }}&cur={{ currency }}">Buka halaman pembayaran</a></p>
  <p>Setelah membayar, kirim bukti bayar dan nomor pesanan lewat WhatsApp supaya pesanan bisa diproses.</p>
{% endif %}
```

## 6. Uji sebelum dibuka ke publik (menentukan Jalur A atau B)

1. Buat market Indonesia (belum publik) dan aktifkan metode manual.
2. Buka toko dari domain live dengan negara Indonesia, tambahkan satu produk murah, lanjut sampai checkout, pilih QRIS atau BCA, selesaikan pesanan.
3. Catat tiga hal: (a) mata uang di halaman checkout, (b) mata uang pesanan di Admin > Orders, (c) mata uang dan total di email konfirmasi.
4. Jika ketiganya IDR: Jalur A. Biarkan `idr_rate` 0.
5. Jika USD: Jalur B. Isi `idr_rate` (misalnya 16300) dan setujui dengan klien cara kerjanya.
6. Batalkan pesanan uji (Orders > Cancel order) dan kembalikan stok.

## 7. Alur harian admin

1. Pelanggan checkout lalu pesanan muncul di Admin > Orders dengan status Payment pending.
2. Pelanggan mengirim bukti bayar lewat WhatsApp (pesan sudah berisi nomor pesanan dan metode).
3. Admin mencocokkan di mutasi rekening atau aplikasi QRIS, lalu klik Mark as paid di pesanan.
4. Pesanan yang tidak dibayar melewati batas waktu: batalkan manual (Cancel order) supaya stok kembali.

Catatan: pesanan diproses hanya setelah Mark as paid. Karena manual, sebaiknya satu orang bertanggung jawab memeriksa pembayaran tiap hari kerja.
