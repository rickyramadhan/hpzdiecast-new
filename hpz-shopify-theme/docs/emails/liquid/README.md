# Cara memasang email baru di Shopify

Folder `indonesia/` untuk toko Indonesia (id.hpzdiecast.com), folder `global/` untuk toko internasional (hpzdiecast.com).
Tiap folder berisi 8 template (`01` sampai `08`) dan `subjects.md` (judul email).

## Untuk setiap email (kerjakan di masing-masing toko)
1. Admin > Settings > Notifications > Customer notifications > pilih email (nama ada di `subjects.md`).
2. Isi kolom **Subject** dengan judul dari `subjects.md`.
3. Klik **Edit code**, hapus seluruh isi kolom, tempel seluruh isi file `.liquid` yang sesuai, lalu **Save**.
4. Klik **Preview** untuk melihat tampilan. Klik **Send test email** untuk mengirim contoh ke emailmu.
5. Kalau ada tampilan yang aneh, jangan ubah banyak. Catat email mana dan kirim ke saya.

## Pengaturan lain
- Settings > Notifications > **Sender email**: `admin@hpzdiecast.com` di kedua toko (Indonesia dan internasional).
- Settings > Store details: Store email dan Customer contact email: `admin@hpzdiecast.com`.

## Urutan yang disarankan
1. Order confirmation, lalu kirim email uji dan periksa di HP. Di toko Indonesia ini yang memuat info bayar (QRIS dan BCA).
2. Shipping confirmation dan Delivered.
3. Order canceled dan Order refund.
4. Customer account invite dan Customer account password reset.
5. Abandoned checkout.

## Catatan
- Email sebelumnya (bawaan Shopify) tetap berjalan sampai template baru ditempel.
- Kalau ada variabel yang tidak dikenali Shopify, bagian itu otomatis disembunyikan, bukan membuat email error.
- Gambar QRIS di email toko Indonesia diambil dari Files toko (`qris-hpz-email.jpg`). Jangan dihapus dari Content > Files.
- Cara membuat ulang kode: `node tools/gen-email-liquid.cjs "<url gambar qris>"`.

## Email yang memuat info bayar (toko Indonesia)
Kartu "Cara bayar" (nominal, QRIS, BCA 2913281284 a.n. Heru Prasetyo, batas 24 jam, tombol WhatsApp) ada di:
- `01-order-confirmation` (muncul otomatis hanya saat pesanan belum dibayar)
- `09-payment-reminder` (Payments > Payment reminder)
- `10-order-invoice` (Order exceptions > Order invoice)
- `11-draft-order-invoice` (Order processing > Draft order invoice)
Toko internasional memakai tombol "Pay now" ke halaman bayar Shopify pada ketiga email terakhir.
Kalau rekening atau QRIS berubah, ubah di `tools/gen-email-liquid.cjs` lalu jalankan ulang generatornya.
