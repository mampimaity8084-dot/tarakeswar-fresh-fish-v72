-- Tarakeswar Fresh Fish Master V4 Premium additive migration
-- Run after the existing MASTER_FINAL_SETUP / FINAL_PRODUCTION_SETUP SQL files.
-- WhatsApp Cloud API secrets and VAPID keys are intentionally NOT stored here.

begin;

alter table if exists public.banner_assets add column if not exists click_url text default '/';
alter table if exists public.banner_assets add column if not exists cta_text text default 'ORDER NOW';

alter table if exists public.customers add column if not exists membership_tier text default 'Silver';
alter table if exists public.customers add column if not exists marketing_opt_in boolean default true;
alter table if exists public.customers add column if not exists birthday date;
alter table if exists public.customers add column if not exists last_order_at timestamptz;

create table if not exists public.automation_settings (
  id integer primary key default 1,
  order_confirmed boolean default true,
  payment_success boolean default true,
  order_status boolean default true,
  delivered_feedback boolean default true,
  reorder_reminder boolean default true,
  abandoned_cart boolean default true,
  new_offer boolean default true,
  flash_sale boolean default true,
  low_stock boolean default true,
  vip_rewards boolean default true,
  referral boolean default true,
  marketing_campaigns boolean default true,
  updated_at timestamptz default now()
);
insert into public.automation_settings(id) values(1) on conflict(id) do nothing;

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text,
  discount_type text not null default 'percent' check(discount_type in ('percent','flat','free_delivery')),
  discount_value numeric(12,2) not null default 0,
  min_order numeric(12,2) default 0,
  max_discount numeric(12,2),
  usage_limit integer,
  used_count integer not null default 0,
  customer_limit integer,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  enabled boolean default true,
  created_at timestamptz default now()
);
create index if not exists idx_coupons_active on public.coupons(enabled,starts_at,ends_at);

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid references public.coupons(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  guest_id text,
  order_id uuid references public.orders(id) on delete set null,
  discount_amount numeric(12,2) default 0,
  created_at timestamptz default now()
);

create table if not exists public.wallet_ledger (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  amount numeric(12,2) not null,
  type text not null default 'credit',
  reason text,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.loyalty_ledger (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  points integer not null,
  reason text,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  guest_id text,
  label text default 'Home',
  recipient_name text,
  mobile text,
  area text,
  address_line text,
  lat numeric(10,7),
  lng numeric(10,7),
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_customer_addresses_guest on public.customer_addresses(guest_id);

create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  area_keywords text[] default '{}',
  delivery_fee numeric(12,2) default 0,
  free_delivery_min numeric(12,2),
  min_order numeric(12,2) default 0,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id bigint,
  customer_id uuid references public.customers(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  guest_id text,
  rating integer check(rating between 1 and 5),
  review_text text,
  photo_url text,
  approved boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_product_reviews_product on public.product_reviews(product_id,approved);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  guest_id text,
  order_id uuid references public.orders(id) on delete set null,
  mobile text,
  category text default 'Other',
  subject text,
  message text,
  status text default 'Open',
  admin_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  audience text default 'all',
  channel text default 'push',
  title text,
  message text,
  target_url text default '/',
  scheduled_at timestamptz,
  enabled boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.abandoned_carts (
  id uuid primary key default gen_random_uuid(),
  guest_id text,
  mobile text,
  customer_name text,
  items jsonb default '[]'::jsonb,
  total numeric(12,2) default 0,
  recovered boolean default false,
  last_seen_at timestamptz default now(),
  reminder_sent_at timestamptz
);
create index if not exists idx_abandoned_carts_guest on public.abandoned_carts(guest_id,last_seen_at desc);

create table if not exists public.app_events (
  id bigserial primary key,
  guest_id text,
  event_name text not null,
  product_id bigint,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_app_events_event_time on public.app_events(event_name,created_at desc);

-- Useful dashboard RPC. It reads aggregate business data without exposing server secrets.
create or replace function public.get_master_dashboard_v4()
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'today_sales', coalesce((select sum(coalesce(payable_total,total,0)) from orders where created_at::date=current_date and payment_status='Paid' and status<>'Cancelled'),0),
    'today_orders', coalesce((select count(*) from orders where created_at::date=current_date and status<>'Cancelled'),0),
    'pending_orders', coalesce((select count(*) from orders where status in ('New','Confirmed','Preparing','Packed')),0),
    'out_for_delivery', coalesce((select count(*) from orders where status='Out for Delivery'),0),
    'delivered_today', coalesce((select count(*) from orders where delivered_at::date=current_date and status='Delivered'),0),
    'customers', coalesce((select count(*) from customers),0),
    'vip_members', coalesce((select count(*) from customers where vip_member=true),0),
    'active_offers', coalesce((select count(*) from offers where enabled=true and start_at<=now() and end_at>=now()),0)
  ) into result;
  return result;
end $$;

-- RLS for additive tables. Existing project policies remain untouched.
alter table public.automation_settings enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.wallet_ledger enable row level security;
alter table public.loyalty_ledger enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.product_reviews enable row level security;
alter table public.support_tickets enable row level security;
alter table public.marketing_campaigns enable row level security;
alter table public.abandoned_carts enable row level security;
alter table public.app_events enable row level security;

-- Public/read policies where the customer app needs them.
do $$begin
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='coupons' and policyname='public read active coupons') then
    create policy "public read active coupons" on public.coupons for select to anon,authenticated using(enabled=true and starts_at<=now() and (ends_at is null or ends_at>=now()));
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='delivery_zones' and policyname='public read active zones') then
    create policy "public read active zones" on public.delivery_zones for select to anon,authenticated using(active=true);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='product_reviews' and policyname='public read approved reviews') then
    create policy "public read approved reviews" on public.product_reviews for select to anon,authenticated using(approved=true);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='product_reviews' and policyname='public submit reviews') then
    create policy "public submit reviews" on public.product_reviews for insert to anon,authenticated with check(true);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='support_tickets' and policyname='public create support ticket') then
    create policy "public create support ticket" on public.support_tickets for insert to anon,authenticated with check(true);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='app_events' and policyname='public create app events') then
    create policy "public create app events" on public.app_events for insert to anon,authenticated with check(true);
  end if;
end$$;

-- Admin access for the automation/CRM tables.
do $$begin
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='automation_settings' and policyname='authenticated automation manage') then create policy "authenticated automation manage" on public.automation_settings for all to authenticated using(true) with check(true); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='coupons' and policyname='authenticated coupon manage') then create policy "authenticated coupon manage" on public.coupons for all to authenticated using(true) with check(true); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='coupon_redemptions' and policyname='authenticated coupon redemption manage') then create policy "authenticated coupon redemption manage" on public.coupon_redemptions for all to authenticated using(true) with check(true); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='wallet_ledger' and policyname='authenticated wallet ledger manage') then create policy "authenticated wallet ledger manage" on public.wallet_ledger for all to authenticated using(true) with check(true); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='loyalty_ledger' and policyname='authenticated loyalty ledger manage') then create policy "authenticated loyalty ledger manage" on public.loyalty_ledger for all to authenticated using(true) with check(true); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='customer_addresses' and policyname='authenticated address manage') then create policy "authenticated address manage" on public.customer_addresses for all to authenticated using(true) with check(true); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='delivery_zones' and policyname='authenticated zone manage') then create policy "authenticated zone manage" on public.delivery_zones for all to authenticated using(true) with check(true); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='product_reviews' and policyname='authenticated review manage') then create policy "authenticated review manage" on public.product_reviews for all to authenticated using(true) with check(true); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='support_tickets' and policyname='authenticated support manage') then create policy "authenticated support manage" on public.support_tickets for all to authenticated using(true) with check(true); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='marketing_campaigns' and policyname='authenticated campaign manage') then create policy "authenticated campaign manage" on public.marketing_campaigns for all to authenticated using(true) with check(true); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='abandoned_carts' and policyname='authenticated abandoned cart manage') then create policy "authenticated abandoned cart manage" on public.abandoned_carts for all to authenticated using(true) with check(true); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='app_events' and policyname='authenticated event read') then create policy "authenticated event read" on public.app_events for select to authenticated using(true); end if;
end$$;


-- Delivery service controls / benefits / partner compensation (Master V4.1)
create table if not exists public.delivery_service_settings(
 id integer primary key default 1,
 service_name text not null default 'Tarakeswar Fresh Delivery',
 subtitle text default 'Fast, safe and trackable home delivery',
 benefits jsonb not null default '["Live GPS tracking","Delivery OTP verification","Customer Call & WhatsApp","Fast local delivery"]'::jsonb,
 default_base_pay numeric(12,2) not null default 30,
 default_surge_multiplier numeric(6,2) not null default 1,
 default_rain_surge numeric(12,2) not null default 0,
 free_delivery_min numeric(12,2) default 499,
 delivery_note text default 'Order confirmed হলে delivery partner assignment ও live tracking available.',
 active boolean not null default true,
 updated_at timestamptz not null default now()
);
insert into public.delivery_service_settings(id) values(1) on conflict(id) do nothing;
alter table public.delivery_service_settings enable row level security;
drop policy if exists "public read delivery service settings" on public.delivery_service_settings;
create policy "public read delivery service settings" on public.delivery_service_settings for select to anon,authenticated using(active=true);

-- Admin writes are performed through the protected Netlify admin function using the service role.
create index if not exists idx_delivery_partner_active on public.delivery_partner_profiles(active,name);

commit;
