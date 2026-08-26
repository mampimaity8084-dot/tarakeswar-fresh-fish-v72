# TFF V7 Smart Experience Upgrade

## Added in this package
- Customer AI robot/LED assistant UI
- Automatic Bengali time-based greeting
- Festival greeting + coordinated theme loader
- Admin AI & Festival control panel
- Voice input (browser SpeechRecognition where supported)
- Voice output (browser speechSynthesis where supported)
- Customer camera/gallery visual product search
- Automatic client-side image resize/compression before upload
- Safe visual matching: exact catalog IDs only; no price/stock invention
- New server function: /api/ai-visual-search
- Supabase migration: V7_AI_FESTIVAL_BRANDING.sql

## Important setup
1. Run `V7_AI_FESTIVAL_BRANDING.sql` in the same Supabase project.
2. Ensure Cloudflare has OPENAI_API_KEY and, if desired, OPENAI_MODEL configured.
3. Deploy the ZIP to Cloudflare.
4. In Admin -> 🤖 AI & Festival, configure greetings/theme/logo/avatar/banner.
5. Voice features depend on browser/device permissions.
6. App icon files are still controlled by the PWA manifest. Dynamic festival artwork for the installed icon requires generating/replacing app-icon-192.png and app-icon-512.png (or a future server/CDN asset pipeline). The in-app logo, splash/theme, AI avatar and banner are runtime-configurable.

## Safety
The AI assistant is instructed to use only supplied catalog/context. It must not invent prices, stock, delivery slots, payment or order status.
