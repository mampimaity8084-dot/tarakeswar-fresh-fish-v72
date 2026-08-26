# V7 Final Master — Cloudflare Launch Guide

## Recommended launch architecture
GitHub → Cloudflare → Supabase
                    ↘ AI API
                    ↘ Razorpay

This package contains Cloudflare API wrappers for the existing Cloudflare-style functions.

## Environment variables (Cloudflare Project Settings → Environment Variables)
Required server-side values depend on enabled features:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- OPENAI_API_KEY
- OPENAI_MODEL
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- ADMIN_EMAILS

Never put service-role keys or Razorpay secret in client code.

## Deployment
1. Push this folder to a PRIVATE GitHub repository.
2. Import the repository into Cloudflare.
3. Set environment variables for Production.
4. Deploy.
5. Open the production URL.
6. Run the QA checklist before announcing the app.
7. Test a small Razorpay transaction only after server variables are confirmed.

## Important
The Cloudflare wrappers translate the existing Cloudflare function event/response format. This is a migration aid, not proof that every business flow has passed live testing.
