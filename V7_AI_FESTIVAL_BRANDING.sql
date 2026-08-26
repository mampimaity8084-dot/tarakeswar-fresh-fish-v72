
-- TFF V7 AI + Festival Branding
create table if not exists public.tff_ai_branding (
  id integer primary key default 1 check (id=1),
  enabled boolean not null default true,
  greeting_enabled boolean not null default true,
  morning text,
  afternoon text,
  evening text,
  night text,
  festival_enabled boolean not null default false,
  festival_name text,
  festival_greeting text,
  festival_start timestamptz,
  festival_end timestamptz,
  theme text default 'customer',
  theme_accent text,
  theme_navy text,
  theme_bg text,
  logo_url text,
  splash_url text,
  ai_avatar_url text,
  banner_url text,
  updated_at timestamptz not null default now()
);

insert into public.tff_ai_branding
(id,morning,afternoon,evening,night)
values
(1,
 'শুভ সকাল! Tarakeswar Fresh Fish-এ আপনাকে স্বাগতম। আজ কী খুঁজছেন?',
 'শুভ অপরাহ্ন! Tarakeswar Fresh Fish-এ আপনাকে স্বাগতম। কীভাবে সাহায্য করতে পারি?',
 'শুভ সন্ধ্যা! Tarakeswar Fresh Fish-এ আপনাকে স্বাগতম। আজকের fresh stock দেখুন।',
 'শুভ রাত্রি! Tarakeswar Fresh Fish-এ আপনাকে স্বাগতম। আগামীকালের অর্ডার চাইলে এখনই বুক করুন।')
on conflict (id) do nothing;

alter table public.tff_ai_branding enable row level security;

drop policy if exists "tff_ai_branding_read" on public.tff_ai_branding;
create policy "tff_ai_branding_read" on public.tff_ai_branding
for select using (true);

drop policy if exists "tff_ai_branding_admin_write" on public.tff_ai_branding;
create policy "tff_ai_branding_admin_write" on public.tff_ai_branding
for all to authenticated
using (
  (auth.jwt()->'app_metadata'->>'role')='admin'
  or (auth.jwt()->'user_metadata'->>'role')='admin'
)
with check (
  (auth.jwt()->'app_metadata'->>'role')='admin'
  or (auth.jwt()->'user_metadata'->>'role')='admin'
);
