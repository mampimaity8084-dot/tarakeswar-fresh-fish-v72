-- TARAKESWAR FRESH FISH — FINAL STORE FIX V4.2
-- Run ONCE after the existing MASTER_FINAL_SETUP / V3 / FINAL_PRODUCTION_SETUP SQL.
-- This file fixes the final launch gaps: minimum order, wallet recharge/spend,
-- customer profile photo, delivery login/logout + bonus, and secure wallet checkout.

begin;

alter table public.public_settings add column if not exists min_order numeric(12,2) default 499;
alter table public.public_settings add column if not exists wallet_discount_percent numeric(5,2) default 2;
update public.public_settings set min_order=499 where min_order is null or min_order < 499;
update public.public_settings set wallet_discount_percent=2 where wallet_discount_percent is null;

alter table public.customers add column if not exists profile_photo_url text;
alter table public.orders add column if not exists delivery_earnings_awarded boolean not null default false;

-- Customer avatar storage. The bucket is public only for reading the avatar URL;
-- uploads are performed by protected Netlify server functions.
insert into storage.buckets(id,name,public) values('customer-avatars','customer-avatars',true)
on conflict(id) do update set public=true;
drop policy if exists "public read customer avatars" on storage.objects;
create policy "public read customer avatars" on storage.objects
for select to anon,authenticated using(bucket_id='customer-avatars');

-- Delivery partner can update only session timestamps through this RPC.
create or replace function public.delivery_session_v4(p_login boolean)
returns boolean language plpgsql security definer set search_path=public as $$
begin
  if not exists(select 1 from public.delivery_partner_profiles where user_id=auth.uid() and active=true) then
    raise exception 'Delivery partner profile not found or inactive';
  end if;
  if p_login then
    update public.delivery_partner_profiles set login_at=now(),updated_at=now() where user_id=auth.uid();
  else
    update public.delivery_partner_profiles set logout_at=now(),updated_at=now() where user_id=auth.uid();
  end if;
  return true;
end $$;
revoke all on function public.delivery_session_v4(boolean) from public,anon;
grant execute on function public.delivery_session_v4(boolean) to authenticated;

-- Wallet checkout: secure, server-only. Customer must have a previous verified paid
-- order from the same browser guest_id before wallet spending is enabled.
create or replace function public.create_wallet_order_v4(
  p_guest_id text,
  p_name text,
  p_mobile text,
  p_area text,
  p_referral_code text,
  p_items jsonb,
  p_delivery_date date,
  p_delivery_slot text,
  p_customer_note text,
  p_min_order numeric default 499,
  p_discount_percent numeric default 2
)
returns table(order_id uuid,order_no text,discount_amount numeric,payable_total numeric,wallet_balance numeric,delivery_otp text)
language plpgsql security definer set search_path=public as $$
declare
  v_mobile text:=right(regexp_replace(coalesce(p_mobile,''),'[^0-9]','','g'),10);
  c public.customers%rowtype;
  o public.orders%rowtype;
  it jsonb;
  q numeric;
  unit_price numeric;
  total numeric:=0;
  discount numeric:=0;
  payable numeric:=0;
  new_balance numeric:=0;
  otp text;
  pid text;
  f public.fish%rowtype;
begin
  if length(v_mobile)<>10 then raise exception 'Invalid mobile number'; end if;
  if trim(coalesce(p_guest_id,''))='' then raise exception 'Wallet security session missing'; end if;

  select * into c from public.customers where mobile=v_mobile for update;
  if not found then raise exception 'Customer account not found'; end if;
  if not exists(select 1 from public.orders where customer_id=c.id and guest_id=p_guest_id and payment_status='Paid') then
    raise exception 'Wallet spending requires a verified order on this device';
  end if;

  for it in select * from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) loop
    pid:=trim(coalesce(it->>'product_id',''));
    q:=greatest(1,least(20,coalesce((it->>'qty')::numeric,1)));
    if pid='' then raise exception 'Invalid product'; end if;
    select * into f from public.fish where id::text=pid and available=true;
    if not found then raise exception 'Product unavailable: %',pid; end if;
    unit_price:=greatest(coalesce(f.price,0),0);
    total:=total+(unit_price*q);
  end loop;

  if total < greatest(coalesce(p_min_order,499),499) then
    raise exception 'Minimum order is ₹% . Add more products to continue.', greatest(coalesce(p_min_order,499),499)::int;
  end if;
  discount:=round(total*greatest(0,least(30,coalesce(p_discount_percent,2)))/100,2);
  payable:=greatest(0,total-discount);
  if (select count(*) from public.orders where delivery_date=p_delivery_date and delivery_slot=trim(p_delivery_slot) and status<>'Cancelled') >= (case when lower(trim(p_delivery_slot)) like '%evening%' then coalesce((select evening_slot_capacity from public.public_settings where id=1),30) else coalesce((select morning_slot_capacity from public.public_settings where id=1),30) end) then raise exception 'Selected delivery slot is full. Please choose another slot.'; end if;
  if c.wallet_credit < payable then
    raise exception 'Wallet balance ₹% is insufficient. Recharge ₹% more.', round(c.wallet_credit,2), round(payable-c.wallet_credit,2);
  end if;

  update public.customers set name=trim(p_name),area=trim(p_area),updated_at=now() where id=c.id returning * into c;
  otp:=lpad((floor(random()*10000))::int::text,4,'0');

  insert into public.orders(
    customer_id,total,status,delivery_date,delivery_slot,payment_method,advance_percent,
    advance_amount,discount_amount,payable_total,payment_status,customer_note,guest_id,
    payment_verified_at,delivery_otp_hash
  ) values(
    c.id,total,'New',p_delivery_date,trim(p_delivery_slot),'WALLET',100,0,discount,payable,'Paid',
    nullif(trim(p_customer_note),''),p_guest_id,now(),encode(digest(otp,'sha256'),'hex')
  ) returning * into o;

  for it in select * from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) loop
    pid:=trim(coalesce(it->>'product_id',''));
    q:=greatest(1,least(20,coalesce((it->>'qty')::numeric,1)));
    select * into f from public.fish where id::text=pid and available=true;
    unit_price:=greatest(coalesce(f.price,0),0);
    insert into public.order_items(order_id,product_id,product_name,qty,unit,unit_price,line_total)
    values(o.id,pid,f.name,q,f.unit,unit_price,unit_price*q);
  end loop;

  update public.customers set wallet_credit=wallet_credit-payable,updated_at=now() where id=c.id returning wallet_credit into new_balance;
  insert into public.wallet_ledger(customer_id,amount,type,reason,order_id)
  values(c.id,-payable,'debit','Wallet order: 2% wallet discount applied',o.id);
  insert into public.order_status_history(order_id,status,note) values(o.id,'New','Wallet payment verified server-side; wallet debited automatically');

  return query select o.id,o.order_no,discount,payable,new_balance,otp;
end $$;
revoke all on function public.create_wallet_order_v4(text,text,text,text,text,jsonb,date,text,text,numeric,numeric) from public,anon,authenticated;
grant execute on function public.create_wallet_order_v4(text,text,text,text,text,jsonb,date,text,text,numeric,numeric) to service_role;

-- Delivery earnings/bonus are awarded exactly once when an assigned order becomes Delivered.
create or replace function public.apply_delivery_earnings_v4() returns trigger
language plpgsql security definer set search_path=public as $$
declare bonus numeric:=0;
begin
  if new.status='Delivered' and old.status is distinct from 'Delivered' and coalesce(new.delivery_partner_id::text,'')<>'' and coalesce(new.delivery_earnings_awarded,false)=false then
    select greatest(0,coalesce(base_pay,0)*greatest(0.1,coalesce(surge_multiplier,1))+greatest(0,coalesce(rain_surge,0))) into bonus
    from public.delivery_partner_profiles where id=new.delivery_partner_id;
    update public.delivery_partner_profiles set total_earnings=coalesce(total_earnings,0)+coalesce(bonus,0),updated_at=now() where id=new.delivery_partner_id;
    update public.orders set delivery_earnings_awarded=true where id=new.id;
  end if;
  return new;
end $$;
drop trigger if exists trg_apply_delivery_earnings_v4 on public.orders;
create trigger trg_apply_delivery_earnings_v4 after update of status on public.orders for each row execute function public.apply_delivery_earnings_v4();

commit;

-- Customer hub v4 adds the profile photo URL while preserving the device/session security.
create or replace function public.get_customer_hub_v4(p_mobile text,p_guest_id text)
returns table(wallet_credit numeric,fresh_points integer,referral_credit_total numeric,referral_code text,vip_member boolean,profile_photo_url text,recent_orders jsonb)
language plpgsql security definer set search_path=public as $$
declare cid uuid;
begin
 select c.id into cid from public.customers c
 where right(regexp_replace(c.mobile,'[^0-9]','','g'),10)=right(regexp_replace(coalesce(p_mobile,''),'[^0-9]','','g'),10)
 and exists(select 1 from public.orders o where o.customer_id=c.id and o.guest_id=p_guest_id and o.payment_status='Paid') limit 1;
 if cid is null then return; end if;
 return query
 select c.wallet_credit,c.fresh_points,c.referral_credit_total,c.referral_code,c.vip_member,c.profile_photo_url,
 coalesce((select jsonb_agg(x order by x.created_at desc) from (select o.order_no,o.status,o.total,o.delivery_date,o.created_at from public.orders o where o.customer_id=cid order by o.created_at desc limit 8)x),'[]'::jsonb)
 from public.customers c where c.id=cid;
end $$;
revoke all on function public.get_customer_hub_v4(text,text) from public;
grant execute on function public.get_customer_hub_v4(text,text) to anon,authenticated;

-- Final order log now records the assigned delivery partner name.
create or replace function public.log_order_status_change() returns trigger
language plpgsql security definer set search_path=public as $$
declare rider text;
begin
  select name into rider from public.delivery_partner_profiles where id=new.delivery_partner_id;
  insert into public.order_status_history(order_id,status,note)
  values(new.id,new.status,case when rider is not null then 'Delivery Partner: '||rider else 'Status updated' end);
  return new;
end $$;
drop trigger if exists trg_order_status_history on public.orders;
create trigger trg_order_status_history after update of status on public.orders for each row execute function public.log_order_status_change();
