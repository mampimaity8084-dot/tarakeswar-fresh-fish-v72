# 🐟 Tarakeswar Fresh Fish — FINAL AUTO MACHINE 7.2
## বাস্তব Feature Status / Launch Checklist

এই নথিটি গুরুত্বপূর্ণ: ZIP-এর code/static inspection থেকে যা নিশ্চিত করা যায় এবং যা real production credentials/service দিয়ে পরীক্ষা করতে হবে—দুইটি আলাদা করা হয়েছে। কোনো external service credential এই ZIP-এ দেওয়া নেই।

## 🟢 Code-এ উপস্থিত / ব্যবহারযোগ্য foundation
### Customer
- Customer PWA (`index.html`), service worker এবং install assets
- Product/catalog loading + automatic retry/refresh hooks
- Cart, wishlist, saved cart, smart-reorder foundation
- Offers/banner loading foundation
- Wallet/points/referral/VIP business-rule foundation
- Razorpay checkout + server-side signature verification code
- Order creation/finalization foundation
- Order status / delivery OTP foundation
- Customer profile photo shortcut layer
- Floating draggable AI assistant
- Bengali India `bn-IN` speech output যেখানে device/browser speech support করে
- Bengali voice input যেখানে SpeechRecognition support করে
- AI quick actions
- Auto-scroll/touch-scroll Partner Hub layer
- 30-day reward grant/expiry database layer
- Push subscription endpoint + reminder scheduler foundation

### Admin
- Product add/edit/delete/stock toggle
- Orders + delivery partner assignment
- Offers
- Members/customer list
- Wallet recharge foundation
- Customer profile photo management
- Auto Banner functions
- AI Insights
- AI Assistant
- Category/Subcategory management layer
- AI category suggestion
- Festival/branding configuration SQL
- Health/automation API foundations

### Delivery
- Delivery login foundation
- Delivery queue
- Customer call/WhatsApp actions
- Navigation action
- Live GPS start/stop
- Delivery OTP
- Delivery completion
- Earnings/bonus display foundation
- Delivery AI smart brief
- Delivery PWA/service worker

### Backend
- Cloudflare Functions
- Supabase migration/function files
- Razorpay verification code
- Wallet server-side checkout code
- Push subscription/send code
- WhatsApp send/health functions
- AI assistant/admin functions
- Auto Banner scheduler
- Reward expiry scheduler
- Backup/restore endpoints

## 🟡 এখনই পাওয়া যাবে, কিন্তু real configuration/test লাগবে
1. Supabase production database-এ required SQL migrations run করতে হবে.
2. Cloudflare environment variables বসাতে হবে.
3. Razorpay live/test keys বসিয়ে real checkout + verify flow test করতে হবে.
4. VAPID keys দিলে real Web Push চালু হবে.
5. WhatsApp Cloud API token/Phone Number ID/Graph version/template configuration দিলে 1:1 messaging চালু হবে.
6. WhatsApp Group automation account/API capability অনুযায়ী configure ও test করতে হবে; ZIP একা group permission তৈরি করতে পারে না.
7. AI provider key দিলে real AI replies চালু হবে.
8. GPS-এর জন্য HTTPS + device location permission + real phone test দরকার.
9. Supabase Realtime tables/permissions ঠিকভাবে enabled থাকতে হবে.
10. PWA install/update real production domain-এ test করতে হবে.

## 🔴 এই ZIP একা যা দিতে পারবে না
- Razorpay account/merchant credentials
- Supabase project/account/database itself
- WhatsApp Business/Meta account approval, templates বা group permission
- VAPID keys
- AI provider account/API key
- Google Play developer account বা Apple Developer account
- App Store review/approval
- Purchased 3D robot model file (V7 source inventory-তে আলাদা named 3D model asset পাওয়া যায়নি)
- Real GPS signal/location without device permission
- Real production customer/order/payment data

## 🤖 3D Talking Robot — বাস্তব অবস্থা
ZIP-এ lightweight CSS 3D-style talking robot + `bn-IN` browser speech foundation আছে। আপনার কেনা original 3D model asset আলাদা file হিসেবে source inventory-তে পাওয়া যায়নি। Original model দিলে Admin AI Avatar/asset configuration-এর মাধ্যমে পরে বসানো যাবে।

## 🔄 Auto Update — বাস্তব অবস্থা
PWA/service-worker update detection আছে এবং `app-version.json` check করা হয়। নতুন web deployment এলে service worker update/reload করতে পারে। কিন্তু Play Store/App Store native apps-এর update store policy অনুযায়ী হবে; web code দিয়ে store approval bypass করা যায় না।

## 🔄 Auto Sync — বাস্তব অবস্থা
Customer/Admin/Delivery-তে refresh/visibility/online hooks এবং selected Supabase realtime listeners আছে। তবে “প্রতিটি database field instant sync” দাবি করা যাবে না—যে tables/events listener-এ যুক্ত আছে সেগুলোই realtime refresh পায়।

## 🎁 30-Day Wallet/Points
30-day reward-grant/expiry database layer ও scheduled expiry function আছে। Reward reminder scheduler বর্তমানে push subscription-এর উপর best-effort broadcast fallback ব্যবহার করে; এটি ব্যক্তিগত customer-by-customer reminder হিসেবে final production-এ verify/upgrade করা উচিত।

## 🚨 Infinite Loading Prevention
Core layer-এ retry/empty/error handling এবং product-loading recovery hooks আছে। তবে সব legacy screen-এর প্রতিটি async path runtime-এ test না করে 100% bug-free বলা যাবে না।

## 🧪 Static verification
- `node tests/v6-static-check.mjs` → PASSED
- `node tools/v7-structure-check.mjs` → PASSED

## 🚀 Launch order
1. Backup ZIP.
2. Supabase backup নিন.
3. Required SQL migrations documented order-এ run করুন; `V7_FINAL_AUTO_MACHINE.sql` একবার run করুন.
4. Cloudflare env vars বসান.
5. Deploy.
6. Customer: Product → Cart → Payment → Order test.
7. Admin: Order → Assignment → Offer → Banner test.
8. Delivery: Login → GPS → OTP → Delivered → Earnings test.
9. WhatsApp test.
10. Push test.
11. AI test.
12. Slow network/offline/refresh/reopen test.
13. Production freeze + rollback backup.

## 🔐 Golden rule
এই ZIP-কে “সব external service already connected” বলা যাবে না। এটি build/source package। Production Ready status কেবল real Supabase, Razorpay, WhatsApp, Push, AI, GPS এবং real-phone QA pass করার পর দেওয়া যাবে।
