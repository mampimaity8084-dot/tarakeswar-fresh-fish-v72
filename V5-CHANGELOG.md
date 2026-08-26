# Tarakeswar Fresh Fish — V5 Additive Upgrade

## Base
- V4.3-FINAL-CANDIDATE is preserved as the source base.
- No V4/V4.3 customer, admin, delivery, wallet, payment, OTP, GPS, rewards, referral, membership, reorder, product, banner or automation feature was intentionally removed.

## V5 upgrades included
- Auto Banner Pro: active offers + available/low stock + current price + popular product signal + seasonal theme.
- Auto Banner Run Now is admin-authenticated server-side.
- Admin banner read/save is routed through a protected Cloudflare function, avoiding direct client writes to `banner_assets`.
- Delivery Partner Pro profile summary, earnings/bonus summary and completed-delivery count.
- Delivery actions are server-side verified against the logged-in delivery partner.
- GPS writes are server-side verified and assigned-order restricted.
- Delivery OTP verification is routed through the protected delivery function.
- Customer Smart Reorder from the existing last-order record.
- Customer price-change alert for products from the last order.
- Admin V5 analytics: today's orders/sales/delivered, VIP count, top-selling products, low stock and delivery partner performance.

## Database rule
- No production SQL was executed while preparing this V5 package.
- Existing V4.3 database is not intentionally reset or replaced.
- `MASTER_FINAL_SETUP.sql` is not part of the V5 deployment instruction and must not be blindly run.

## Testing
- `node tests/v43-static-check.mjs` passed.
- `node tests/v5-static-check.mjs` passed.
- Node syntax checks passed for the new V5 client/server files.
- Live Supabase/Razorpay/GPS/Push/WhatsApp/device testing still requires the deployed environment and credentials.
