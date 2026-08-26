# TODAY LAUNCH — Safe Order

1. Keep current Cloudflare production site untouched as rollback.
2. Create PRIVATE GitHub repository.
3. Upload V7 Final Master.
4. Import GitHub repository into Cloudflare.
5. Add production environment variables.
6. Deploy.
7. Open Cloudflare URL on Android.
8. Test Home/Product/Search/Cart/Wishlist/Offers/Orders/Support.
9. Test AI chat and verify it refuses to invent price/stock.
10. Test camera/gallery image input.
11. Test Admin login and AI insights.
12. Test Delivery flow.
13. Test Razorpay only with a real small test order.
14. Check Supabase rows and payment verification.
15. Only after all critical tests pass, use Cloudflare as the new production URL.
16. Keep the Cloudflare URL as rollback until the new version has been stable.

If any critical test fails: STOP. Do not announce the new URL yet.
