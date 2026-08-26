# Cloudflare Pages Migration Note

The customer-facing static/PWA portion can be hosted on Cloudflare Pages.

However, the current server functions use Node.js APIs such as `https`, `Buffer`, and Cloudflare event handlers. Therefore this package does NOT falsely claim that all 27 functions are Cloudflare-native.

Recommended route for today's launch:
**Cloudflare for the Node server functions + static app, Supabase for data, Razorpay for payments, AI API server-side.**

Cloudflare can be used later after each server function is migrated/tested to Cloudflare Workers/Pages Functions.

Do not switch production hosting to Cloudflare merely by uploading this ZIP.
