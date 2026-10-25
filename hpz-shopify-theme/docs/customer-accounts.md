# Customer account pages: how to see them

The templates in `templates/customers/*.json` (login, register, account, order, addresses, reset_password, activate_account)
only render when **classic customer accounts** are enabled for the store. Today the store uses the new customer accounts
(or none), so `/account/login` returns 404 on both the live store and the dev preview.

To preview or use them:

1. Shopify admin > Settings > Customer accounts.
2. Choose "Legacy" / classic customer accounts (login and register pages are served by the theme).
3. Open `/account/login`. Checkout sign-in and order status pages are unaffected.

With new customer accounts, Shopify hosts the account UI itself (not themeable), so these sections will not appear.

Data notes
- Pit Points show only when `settings` / section `points_enabled` is on and the customer metafield `hpz.points` has a value.
- Garage uses the customer metafield `hpz.garage` (list of casting handles), falling back to the local garage.
- Panels not backed by store data (alerts, saved builds from other devices) show only what exists; nothing is invented.
- Reviewed against `hpz-redesign/account.html`: overview, orders, garage, builds, wishlist, points, settings panels are present; the mockup's
  addresses panel is the separate `customers/addresses` template; the "drop alerts" panel needs an app and is intentionally absent.
