# V7 Step 6 — Deployment Guide

## 1. Deploy
Upload the Step 6 ZIP to the same Cloudflare site only after taking a backup of the current working deploy.

## 2. Environment variables
Set secrets in Cloudflare environment variables, never inside HTML/JS:
- OPENAI_API_KEY
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY (server-side functions only, if required)

Never expose service-role keys to the browser.

## 3. Test order
1. Open production site
2. Test Home
3. Search
4. Product detail
5. Cart
6. Checkout
7. Orders
8. Wishlist
9. Offers
10. Support
11. AI chat
12. Camera/gallery image input
13. Admin
14. Delivery
15. PWA install
16. Refresh/back/offline fallback

## 4. Rollback
If a critical regression appears, restore the last known-good deploy rather than repeatedly patching production.

## 5. Important
AI must answer commercial questions only from verified server-side catalog/order context. If data is unavailable, it must say it cannot verify the information.
