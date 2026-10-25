# Indonesia store: notification subjects

Paste into Settings > Notifications > (template) > Subject. Body = the matching .liquid file.

| Shopify template | Subject |
|---|---|
| Order confirmation | `{% if financial_status == 'pending' %}Pesanan {{ order_name }} diterima, tinggal bayar{% else %}Pesanan {{ order_name }} diterima{% endif %}` |
| Shipping confirmation | `Pesanan {{ order_name }} sudah dikirim` |
| Delivered | `Pesanan {{ order_name }} sudah sampai` |
| Order canceled | `Pesanan {{ order_name }} dibatalkan` |
| Order refund | `Refund untuk pesanan {{ order_name }}` |
| Customer account invite | `Aktifkan akun HPZ Diecast kamu` |
| Customer account password reset | `Atur ulang kata sandi HPZ Diecast` |
| Abandoned checkout | `Keranjangmu di HPZ Diecast masih tersimpan` |
| Payment reminder | `Pengingat bayar pesanan {{ order_name | default: name }}` |
| Order invoice | `Tagihan pesanan {{ order_name | default: name }}` |
| Draft order invoice | `Tagihan dari HPZ Diecast` |
