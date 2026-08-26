# Tarakeswar Fresh Fish — V7 Step 4 Master Tracker

## Customer App
- 🟢 AI floating robot + LED indicator
- 🟢 Time-based greeting: Morning/Afternoon/Evening/Night
- 🟢 Festival greeting + coordinated branding foundation
- 🟢 Voice input/output
- 🟢 Verified catalog-aware AI endpoint
- 🟢 AI cannot invent price/stock/order facts; it must rely on supplied context
- 🟢 AI quick actions: Fresh Fish / Offers / Cart / Orders / Suggest
- 🟢 Product photo camera/gallery input
- 🟢 Automatic image resize/compression before visual search
- 🟢 Visual product matching endpoint using exact catalog IDs
- 🟢 Wishlist / Search / Smart Reorder / Offers foundation retained

## Admin Section
- 🟢 AI & Festival control center
- 🟢 Custom morning/afternoon/evening/night greetings
- 🟢 Festival name/greeting/date range/theme/logo/avatar/banner fields
- 🟢 AI Insights tab: live orders, delivered, pending, estimated sales, low stock
- 🟢 Low-stock list from live database
- 🟡 Full AI-powered auto-actions require business rules + approval gates
- 🟡 Automatic festival asset generation requires an image-generation provider/API configuration

## Delivery Section
- 🟢 Delivery Smart Brief panel
- 🟢 Queue-aware safety reminder
- 🟢 Existing GPS / OTP / delivery actions retained
- 🟡 Full voice delivery copilot requires optional AI/API configuration

## Server / Cloudflare
- 🟢 ai-assistant function
- 🟢 ai-visual-search function
- 🟢 ai-admin-insights function
- 🟢 No API key is placed in browser code
- 🟡 Cloudflare environment variable `OPENAI_API_KEY` must be configured for real AI
- 🟡 Optional `OPENAI_MODEL` can override the default `gpt-5-mini`

## Important
The AI is designed to fail safely: if live catalog/order data is unavailable, it should say that verified information is unavailable rather than inventing a price, stock count, delivery time, payment status, or order status.
