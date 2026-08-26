Tarakeswar Fresh - Supabase Admin Panel

Open: /admin.html
Login: use the Supabase Authentication user email/password you created.

Features:
- Add fish/product
- Upload image directly to fish-images bucket
- Edit name/category/price/unit/description
- Available / Out of Stock toggle
- Delete product
- Customer index.html reads the same public.fish table automatically

Security:
- This admin page uses Supabase Auth, not a hard-coded PIN.
- Never put Secret/service_role keys in website files.
- Your existing RLS policies determine who can insert/update/delete.
