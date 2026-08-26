# TARAKE​​SWAR FRESH FISH 7.2 — CLOUDFLARE-ONLY LAUNCH GUIDE

এই package Cloudflare/Cloudflare ছাড়াই Cloudflare hosting-এর জন্য প্রস্তুত করা হয়েছে।

## 1. Hosting architecture
- Static Customer/Admin/Delivery/PWA assets → Cloudflare
- API/backend routes → Cloudflare Worker advanced-mode `_worker.js`
- Database/Auth/Realtime/Storage → existing Supabase
- Payment → existing Razorpay
- AI → existing AI/OpenAI configuration
- Push → existing VAPID configuration (Web Push package must be tested live)
- WhatsApp → existing Meta configuration; only credentials need to be added later

## 2. Important
This package keeps the existing server function source under `netlify/functions/` only as legacy source code. The deployed runtime is `_worker.js`; browser URLs are rewritten to `/api/...`. You do NOT deploy to Cloudflare.

## 3. Cloudflare Pages Git settings
- Connect the new GitHub repository.
- Production branch: `main`.
- Build command: leave empty (or `npm run check:all` if your Pages UI requires a command).
- Build output directory: `.`
- Root directory: `/`.
- Use the repository as-is; do not upload a ZIP into the repository as the only project file.

## 4. Required Cloudflare Variables/Secrets
Keep server secrets only in Cloudflare Variables & Secrets:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY  (important: not SUPABASE_SECRET_KEY)
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- ADMIN_EMAILS
- AI_API_KEY + AI_API_URL + OPENAI_MODEL OR OPENAI_API_KEY + OPENAI_MODEL
- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY
- VAPID_SUBJECT
- WHATSAPP_GRAPH_VERSION
- WHATSAPP_ACCESS_TOKEN (when WhatsApp is activated)
- WHATSAPP_PHONE_NUMBER_ID (when WhatsApp is activated)
- WHATSAPP_TEMPLATE_NAME / WHATSAPP_TEMPLATE_LANG / WHATSAPP_GROUP_ID only if your Meta setup uses them

Never commit `.env`, private keys, service-role keys or payment secrets.

## 5. Supabase one-time setup
Run the correct master SQL only after taking a database backup. Do not blindly run every historical V4/V5/V6 SQL file. Prefer `V7_FINAL_AUTO_MACHINE.sql` and any dependency SQL explicitly required by that script.

## 6. Maps
Current app uses external Google Maps navigation URLs for rider/customer navigation. A Google Maps API key is NOT required just to launch the current navigation flow. Add a Maps key later only if embedded Maps/Places/Routes APIs are enabled.

## 7. Real launch test order
Customer: login → products → category → cart → offer → checkout → Razorpay test → order.
Admin: login → products → stock → offer → banner → customer → delivery assignment.
Delivery: login/QR → assigned queue → navigation → GPS → OTP → delivered → earnings.
Then test AI, Push and WhatsApp separately.

## 8. Scheduler
The package includes a `scheduled()` handler and Wrangler cron definitions for auto-banner and reward expiry. Cloudflare Worker Cron Triggers are a Worker feature; if you deploy only as a Pages project, configure the scheduler as a separate Cloudflare Worker or move the same entrypoint to Workers. Do not assume Pages alone will run the cron jobs.
