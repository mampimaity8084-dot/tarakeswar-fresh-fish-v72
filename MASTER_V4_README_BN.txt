TARAKESWAR FRESH FISH — MASTER V4 PREMIUM
==========================================

এই ZIP-টি বর্তমান project-এর উপর additive Master V4 upgrade।
মূল Customer / Admin / Delivery flow রাখা হয়েছে।

যা READY করা হয়েছে
-------------------
1. Customer PWA
   - Cart / Buy Now / Wishlist / Checkout / Razorpay flow retained
   - AI-style Fresh Assistant
   - Bengali voice search (browser-supported)
   - Photo-based catalog visual similarity search
   - Reorder/CRM-ready account foundation
   - Wallet / Fresh Points / VIP / Referral foundation retained
   - Auto banner click target support
   - Customer App QR fixed
   - Install / Share / Copy Link

2. Admin PWA
   - আলাদা admin-manifest.webmanifest + admin-sw.js
   - Install Admin button
   - Master Automation Center
   - Automation ON/OFF controls
   - Banner customization: title / CTA / click URL / share text
   - 3-App QR Center: Customer / Admin / Delivery
   - QR Save / Share / Copy

3. Delivery PWA
   - Existing secure login, assigned orders, GPS, navigation, OTP retained
   - Delivery App QR added
   - Installable PWA retained

4. WhatsApp architecture
   - send-feedback.js hardened
   - feedback error/status is written back to orders
   - whatsapp-health.js added
   - send-whatsapp.js generic authenticated gateway added
   - IMPORTANT: actual Meta credentials/template approval are intentionally NOT included.

5. Push architecture
   - Existing optional VAPID flow retained
   - No real VAPID secret included
   - Push can be activated later by adding server environment variables

6. Premium database foundation
   - MASTER_V4_PREMIUM.sql
   - automation_settings
   - coupons / coupon_redemptions
   - wallet_ledger / loyalty_ledger
   - customer_addresses
   - delivery_zones
   - product_reviews
   - support_tickets
   - marketing_campaigns
   - abandoned_carts
   - app_events
   - banner click_url / CTA fields
   - master dashboard RPC

IMPORTANT LIMITATION
--------------------
Photo Search এখন browser-side catalog-image similarity ব্যবহার করে। এটি external cloud AI vision নয়। তাই কোনো AI API key ছাড়াই featureটি test করা যায়, কিন্তু Amazon/Flipkart-এর মতো semantic-level visual recognition-এর জন্য ভবিষ্যতে একটি vision model provider যোগ করা যাবে।

WhatsApp Group Auto-Post
------------------------
Official WhatsApp Group API eligibility/limits-এর উপর নির্ভরশীল। এই build-এ safe WhatsApp Share fallback রাখা হয়েছে। Eligible official group automation পরে gateway-এ connect করা যাবে।

DEPLOY ORDER
------------
1. Existing SQL setup files যেভাবে current project-এ করা আছে সেগুলো রাখুন।
2. MASTER_V4_PREMIUM.sql Supabase SQL Editor-এ একবার run করুন।
3. এই ZIP Cloudflare-এ deploy করুন।
4. Cloudflare Functions deploy হয়েছে কিনা check করুন।
5. WhatsApp ও Push এখন না দিলেও app চালু থাকবে।
6. পরে শুধু Cloudflare/Supabase secrets/config দিয়ে WhatsApp + Push activate করুন।

WhatsApp পরে বসাতে হবে
----------------------
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_ACCESS_TOKEN
WHATSAPP_GRAPH_VERSION
WHATSAPP_TEMPLATE_NAME (যদি approved template ব্যবহার করেন)
WHATSAPP_TEMPLATE_LANG
FEEDBACK_FORM_URL

Push পরে বসাতে হবে
------------------
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT

Razorpay existing deployment-এর server secrets আগের মতোই রাখতে হবে।

NO SECRETS ARE INCLUDED IN THIS ZIP.
