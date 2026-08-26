TARAKESWAR FRESH FISH - MASTER FINAL BUILD

এই ZIP বর্তমান V3 Product Loading Fix build-এর ওপর ভিত্তি করে final launch package।

প্রথম কাজ: Supabase SQL Editor-এ MASTER_FINAL_SETUP.sql একবার Run করুন।
তারপর Cloudflare-এ এই পুরো project deploy করুন।

Required Cloudflare environment variables:
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY (server only)
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET

Optional WhatsApp Cloud API automation (individual customer messages):
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_ACCESS_TOKEN
WHATSAPP_GRAPH_VERSION
WHATSAPP_TEMPLATE_NAME (recommended)
WHATSAPP_TEMPLATE_LANG
FEEDBACK_FORM_URL

IMPORTANT:
1) Official WhatsApp Cloud API arbitrary WhatsApp Group-এ server-side auto-post করার supported API নয়। তাই group auto-post এই package-এ দাবি করা হয়নি; Share button Android WhatsApp/share sheet ব্যবহার করে।
2) Customer individual delivery/feedback WhatsApp automation Cloud API + approved template + proper Meta setup-এর উপর নির্ভর করে।
3) Live GPS continuous tracking-এর জন্য Delivery Partner-কে browser location permission দিতে হবে; HTTPS/production domain প্রয়োজন।
4) QR code dynamicভাবে current site URL ব্যবহার করে generate করা উচিত; যদি পুরনো QR-এ 404 থাকে, নতুন site URL দিয়ে নতুন QR তৈরি করুন।
5) Sample products SQL প্রতিটি category-তে 20টি sample row যোগ করে, কিন্তু images generic নয়; Admin থেকে real image/price customize করতে হবে।
6) Payment test flow অপরিবর্তিত রাখা হয়েছে; launch-এর আগে Test credentials থেকে Live credentials বদলাতে হবে।
