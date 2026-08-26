# Tarakeswar Fresh Fish — V7 Final Build Specification

## Included
- Customer App + Admin App + Delivery App
- Existing V4/V5/V5.1/V5.2/V5.3/V6/V7 features carried forward from the master package
- V7 AI assistant as a floating assistant only; it does not replace the main navigation
- AI quick actions, voice input/output, catalog-grounded answers, camera/gallery visual search foundation
- Smart reorder, wishlist, search, offers, wallet, orders, family hub, help/support and delivery OTP/GPS foundations
- Admin AI/Festival/branding controls and AI insights foundation
- Delivery smart brief and existing delivery actions
- Product/Order loading safety fixes and defensive failure handling
- Payment/Razorpay setup and Supabase migration/setup files
- Deployment guides and rollback documentation

## Permanent bug-fix targets
- Products stuck on Loading / false 0 items
- Orders stuck on Loading
- Wishlist permission errors
- Bottom navigation touch blocking
- Cart dock / floating button / checkout modal overlap
- Duplicate online indicator and unnecessary floating controls
- Duplicate popups and old version display
- Help & Support, Family Hub, Update, Category, Orders, Wallet, QR and AI navigation failures
- Infinite spinner and silent API failures

## UI decision
The latest requested 3D-style redesign/sample instruction is intentionally NOT included in this build. The existing premium visual language and previously approved structure are retained.

## Safety
No real secrets/API keys are included in this archive. Production credentials must be supplied through the deployment platform's encrypted environment variables.
