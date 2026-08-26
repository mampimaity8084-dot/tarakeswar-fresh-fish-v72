# 🐟 Tarakeswar Fresh Fish — FINAL AUTO MACHINE 7.1

## এই ZIP কী?
এটি V7 master package-এর উপর একটি additive final layer। পুরনো feature/route/database files সরানো হয়নি। লক্ষ্য হলো Customer + Admin + Delivery তিনটি app-কে একই premium brand language-এর মধ্যে রেখে automatic sync, silent app update, floating Bengali AI assistant, top Partner Hub, customer mini-profile এবং category automation যোগ করা।

## 🟢 Included
- Customer App (`index.html`)
- Admin App (`admin.html`)
- Delivery App (`delivery.html`)
- Existing V4/V5/V6/V7 SQL + API functions
- Razorpay/payment verification foundation
- Wallet server-side debit foundation
- Fresh Points / Referral / VIP foundation
- Wishlist / Saved Cart / Smart Reorder foundation
- Delivery GPS / OTP / earnings foundation
- Auto Banner foundation
- WhatsApp / Push foundation
- AI assistant + Bengali `bn-IN` voice foundation
- Festival / branding controls
- PWA + service workers
- Android/iOS store preparation assets
- `tff-final-auto-machine.js` universal automation layer
- `V7_FINAL_AUTO_MACHINE.sql` additive database migration
- `expire-rewards-scheduled` scheduled function

## 🤖 Final Auto Machine behaviour
### Automatic
- App version check every 5 minutes
- Service-worker update with `updateViaCache=none`
- Reload after a new worker takes control
- Background/foreground sync
- Online/offline awareness
- Customer/Admin/Delivery data refresh hooks
- Customer Partner Hub auto-scroll + touch pause
- Floating draggable AI robot on all 3 apps
- Robot edge snap + idle mini/transparent mode
- Bengali India voice (`bn-IN`) where browser/device supports speech
- Customer profile shortcut beside address/header area
- Admin category/subcategory manager
- AI category suggestion
- 30-day reward grant/expiry migration + daily scheduled expiry job

## 🎞️ Customer top layout
1. Header + customer profile shortcut
2. Auto-scroll offer banner
3. Partner Hub (auto-scroll, touch/swipe, clickable)
4. Member/offer area
5. Product/search area
6. Floating AI robot

## 🔐 Security
- No real secrets are included.
- Razorpay secret, Supabase service-role key, VAPID private key, WhatsApp token and AI provider secrets must remain in Cloudflare/Supabase encrypted environment variables.
- Customer/Admin/Delivery roles must be enforced by Auth + RLS/server checks.

## ⚠️ Important verification rule
This ZIP is source/build prepared, not a claim that every external production service is already connected. Before public launch, test the real Supabase project, payment, authentication, WhatsApp, VAPID push, GPS and AI provider. The existing V7 master tracker already marks these as production verification items.

## 🤖 3D robot note
The V7 archives did not contain a separate named 3D robot model asset. This final layer therefore includes a lightweight CSS 3D-style talking robot fallback and uses the Admin `AI Avatar URL` setting when a real robot/avatar asset is supplied. If the original purchased 3D model file is available later, it can be connected through that avatar/asset configuration without changing the app architecture.

## 🚀 Deployment order
1. Backup the exact ZIP.
2. Run existing master SQL stack in the documented order.
3. Run `V7_FINAL_AUTO_MACHINE.sql` once.
4. Add production environment variables in Cloudflare.
5. Deploy the root as the site publish directory.
6. Verify Customer → Product → Cart → Payment → Order.
7. Verify Admin → Order → Delivery assignment → Offer/Banner.
8. Verify Delivery → GPS → OTP → Delivered → Earnings.
9. Verify push/WhatsApp/AI with real credentials.
10. Freeze the tested production ZIP as the rollback copy.

## 🧪 Hard rule
No screen should remain on an infinite spinner. Every critical operation must have Loading → Success → Empty → Error → Retry → Timeout handling.
