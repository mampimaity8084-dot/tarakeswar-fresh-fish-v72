TARAKESWAR FRESH FISH — V3 SECURE PREMIUM

WHAT IS NEW
- Premium Blinkit-style mobile UI
- ADD changes to visible − / + quantity control
- Secure Razorpay server-side order creation + signature + amount verification + payment capture
- Customer order is created ONLY after verified/captured payment
- Delivery slot capacity protection
- Delivery 4-digit OTP
- My Fresh Hub: wallet balance, Fresh Points, referral, VIP, recent orders
- PWA install / Add to Home Screen
- Order status auto refresh + browser notification while app is active
- Cutting/preparation choice
- Existing offers, wishlist, admin, delivery, referral and rewards kept

IMPORTANT SECURITY CHANGE
The old browser-callable create_order_v3 is revoked for anon users. The new Cloudflare Functions use a Supabase SECRET key. Never put that key in index.html or supabase-config.js.

ONE-TIME SETUP (ONLY 3 THINGS)
1) Supabase SQL Editor: run UPGRADE_V3_SECURE_PREMIUM.sql once.
2) Cloudflare > Environment variables: add ONE new secret variable:
   SUPABASE_SECRET_KEY = your Supabase Project secret key (sb_secret_...)
   If your project only has legacy service_role, you may instead add SUPABASE_SERVICE_ROLE_KEY.
   Keep existing RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET exactly as they are.
3) Upload this whole ZIP to Cloudflare Drop as a new production deploy.

DO NOT SHARE OR SCREENSHOT SUPABASE_SECRET_KEY / service_role / RAZORPAY_KEY_SECRET.

PAYMENT FLOW
Customer cart -> Cloudflare create-checkout -> server reads real product prices from Supabase -> Razorpay order -> payment -> Cloudflare verifies HMAC + Razorpay payment amount/status -> captures if required -> private Supabase RPC creates paid order -> customer receives Order ID + Delivery OTP.

WALLET SAFETY
Wallet/reward BALANCE is visible in My Fresh Hub. Wallet SPENDING/withdrawal is intentionally locked until phone OTP authentication is configured. This avoids allowing money to be spent using only a typed phone number.
