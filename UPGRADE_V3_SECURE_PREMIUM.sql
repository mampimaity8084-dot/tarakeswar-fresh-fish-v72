-- TARAKESWAR FRESH FISH — V3 SECURE PREMIUM UPGRADE
-- Run once in Supabase SQL Editor AFTER the earlier V2/V2.3 SQL files.

create extension if not exists pgcrypto;

alter table public.fish add column if not exists stock_qty integer;
alter table public.orders add column if not exists guest_id text;
alter table public.orders add column if not exists razorpay_payment_id text;
alter table public.orders add column if not exists payment_verified_at timestamptz;
alter table public.orders add column if not exists delivery_otp_hash text;
alter table public.public_settings add column if not exists morning_slot_capacity integer default 30;
alter table public.public_settings add column if not exists evening_slot_capacity integer default 30;
alter table public.public_settings add column if not exists min_order numeric(12,2) default 1;
alter table public.public_settings add column if not exists free_delivery_min numeric(12,2) default 499;

create table if not exists public.payment_sessions (
  id uuid primary key default gen_random_uuid(),
  razorpay_order_id text not null unique,
  guest_id text,
  customer_name text not null,
  mobile text not null,
  area text not null,
  referral_code text,
  items jsonb not null default '[]'::jsonb,
  total numeric(12,2) not null,
  delivery_date date not null,
  delivery_slot text not null,
  payment_method text not null,
  advance_percent numeric(5,2) not null default 0,
  advance_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  payable_total numeric(12,2) not null,
  pay_now numeric(12,2) not null,
  customer_note text,
  status text not null default 'created' check(status in ('created','finalized','failed','expired')),
  razorpay_payment_id text,
  final_order_id uuid,
  final_order_no text,
  created_at timestamptz not null default now(),
  finalized_at timestamptz
);

alter table public.payment_sessions enable row level security;
revoke all on public.payment_sessions from anon, authenticated;
-- service_role / Supabase secret key bypasses RLS and is used only by Netlify Functions.

create or replace function public.finalize_payment_session_v3(p_session_id uuid,p_payment_id text)
returns table(order_id uuid,order_no text,customer_referral_code text,delivery_otp text)
language plpgsql
security definer
set search_path=public
as $$
declare
 s public.payment_sessions%rowtype;
 c public.customers%rowtype;
 referrer uuid;
 o public.orders%rowtype;
 it jsonb;
 ref text;
 otp text;
begin
 select * into s from public.payment_sessions where id=p_session_id for update;
 if not found then raise exception 'Payment session not found'; end if;
 if s.status='finalized' then
   return query select s.final_order_id,s.final_order_no,(select referral_code from public.customers where id=(select customer_id from public.orders where id=s.final_order_id)),null::text;
   return;
 end if;
 if s.status<>'created' then raise exception 'Invalid payment session state'; end if;
 if nullif(trim(coalesce(p_payment_id,'')),'') is null then raise exception 'Payment id required'; end if;

 select * into c from public.customers where mobile=right(regexp_replace(s.mobile,'[^0-9]','','g'),10);
 if not found then
   ref:='TFF'||upper(substr(md5(s.mobile||clock_timestamp()::text),1,6));
   if nullif(trim(coalesce(s.referral_code,'')),'') is not null then
      select id into referrer from public.customers where upper(referral_code)=upper(trim(s.referral_code)) limit 1;
   end if;
   insert into public.customers(name,mobile,area,referral_code,referred_by)
   values(trim(s.customer_name),right(regexp_replace(s.mobile,'[^0-9]','','g'),10),trim(s.area),ref,referrer)
   returning * into c;
 else
   update public.customers set name=trim(s.customer_name),area=trim(s.area),updated_at=now() where id=c.id returning * into c;
 end if;

 otp:=lpad((floor(random()*10000))::int::text,4,'0');
 insert into public.orders(customer_id,total,status,delivery_date,delivery_slot,payment_method,advance_percent,advance_amount,discount_amount,payable_total,payment_status,customer_note,guest_id,razorpay_payment_id,payment_verified_at,delivery_otp_hash)
 values(c.id,s.total,'New',s.delivery_date,s.delivery_slot,s.payment_method,s.advance_percent,s.advance_amount,s.discount_amount,s.payable_total,'Paid',s.customer_note,s.guest_id,p_payment_id,now(),encode(digest(otp,'sha256'),'hex'))
 returning * into o;

 for it in select * from jsonb_array_elements(coalesce(s.items,'[]'::jsonb)) loop
   insert into public.order_items(order_id,product_id,product_name,qty,unit,unit_price,line_total)
   values(o.id,it->>'product_id',coalesce(it->>'name','Product'),greatest(coalesce((it->>'qty')::numeric,1),1),it->>'unit',greatest(coalesce((it->>'unit_price')::numeric,0),0),greatest(coalesce((it->>'line_total')::numeric,0),0));
 end loop;

 insert into public.order_status_history(order_id,status,note) values(o.id,'New','Secure Razorpay payment verified on server');
 if nullif(trim(coalesce(s.guest_id,'')),'') is not null then delete from public.cart_drafts where guest_id=s.guest_id; end if;
 update public.payment_sessions set status='finalized',razorpay_payment_id=p_payment_id,final_order_id=o.id,final_order_no=o.order_no,finalized_at=now() where id=s.id;
 return query select o.id,o.order_no,c.referral_code,otp;
end $$;

-- Only server-side Supabase secret/service role should call finalization.
revoke all on function public.finalize_payment_session_v3(uuid,text) from public, anon, authenticated;
grant execute on function public.finalize_payment_session_v3(uuid,text) to service_role;

-- Customer hub: only returns data when this browser's guest id matches a previous verified order.
create or replace function public.get_customer_hub_v3(p_mobile text,p_guest_id text)
returns table(wallet_credit numeric,fresh_points integer,referral_credit_total numeric,referral_code text,vip_member boolean,recent_orders jsonb)
language plpgsql security definer set search_path=public as $$
declare cid uuid;
begin
 select c.id into cid from public.customers c
 where right(regexp_replace(c.mobile,'[^0-9]','','g'),10)=right(regexp_replace(coalesce(p_mobile,''),'[^0-9]','','g'),10)
 and exists(select 1 from public.orders o where o.customer_id=c.id and o.guest_id=p_guest_id and o.payment_status='Paid') limit 1;
 if cid is null then return; end if;
 return query
 select c.wallet_credit,c.fresh_points,c.referral_credit_total,c.referral_code,c.vip_member,
 coalesce((select jsonb_agg(x order by x.created_at desc) from (select o.order_no,o.status,o.total,o.delivery_date,o.created_at from public.orders o where o.customer_id=cid order by o.created_at desc limit 8)x),'[]'::jsonb)
 from public.customers c where c.id=cid;
end $$;
grant execute on function public.get_customer_hub_v3(text,text) to anon,authenticated;

-- Delivery OTP verification. Authenticated delivery/admin users only.
create or replace function public.verify_delivery_otp_v3(p_order_id uuid,p_otp text)
returns boolean language plpgsql security definer set search_path=public as $$
declare ok boolean;
begin
 select delivery_otp_hash=encode(digest(trim(coalesce(p_otp,'')),'sha256'),'hex') into ok from public.orders where id=p_order_id;
 if coalesce(ok,false) then update public.orders set status='Delivered',delivered_at=now() where id=p_order_id; end if;
 return coalesce(ok,false);
end $$;
revoke all on function public.verify_delivery_otp_v3(uuid,text) from public,anon;
grant execute on function public.verify_delivery_otp_v3(uuid,text) to authenticated;

-- Helpful indexes
create index if not exists idx_orders_guest_id on public.orders(guest_id);
create index if not exists idx_orders_delivery_slot on public.orders(delivery_date,delivery_slot,status);
create index if not exists idx_payment_sessions_created on public.payment_sessions(created_at,status);

-- Make sure normal customer-side order creation cannot bypass secure payment.
revoke execute on function public.create_order_v3(text,text,text,text,numeric,jsonb,date,text,text,numeric,numeric,numeric,numeric,text,text) from anon;

-- Optional cleanup: sessions older than 2 days can be marked expired manually or by a scheduled job.
