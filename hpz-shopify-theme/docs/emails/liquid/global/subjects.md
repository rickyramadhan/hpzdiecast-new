# International store: notification subjects

Paste into Settings > Notifications > (template) > Subject. Body = the matching .liquid file.

| Shopify template | Subject |
|---|---|
| Order confirmation | `Order {{ order_name }} confirmed` |
| Shipping confirmation | `Order {{ order_name }} has shipped` |
| Delivered | `Order {{ order_name }} has arrived` |
| Order canceled | `Order {{ order_name }} was canceled` |
| Order refund | `Refund for order {{ order_name }}` |
| Customer account invite | `Activate your HPZ Diecast account` |
| Customer account password reset | `Reset your HPZ Diecast password` |
| Abandoned checkout | `Your cart at HPZ Diecast is waiting` |
| Payment reminder | `Payment reminder for order {{ order_name | default: name }}` |
| Order invoice | `Invoice for order {{ order_name | default: name }}` |
| Draft order invoice | `Your invoice from HPZ Diecast` |
