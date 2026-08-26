Tarakeswar Fresh - Secure Admin + Auto Offer Slider

What changed:
1. Customer page:
   - Admin button remains hidden.
   - Automatic scrolling offer poster slider added.
   - Slider changes every 3.5 seconds.
   - Replace banners/offer1.jpg, offer2.jpg, offer3.jpg with your own offer posters.
   - Keep the same filenames for easiest updates.

2. Admin page:
   - 6-digit PIN gate added.
   - Current PIN: 274619
   - Admin URL remains /admin.html
   - This is FRONT-END PIN protection only. It is useful for casual access control, but it is not bank-grade security because static-site source code can be inspected.
   - For real secure admin access, use server-side authentication / Cloudflare Identity / Firebase / Supabase.

How to deploy:
- Upload this full ZIP as a new deploy to the SAME Cloudflare project.
- Your public customer URL stays the same.
- Admin page: yoursite.netlify.app/admin.html
- Delivery page: yoursite.netlify.app/delivery.html
