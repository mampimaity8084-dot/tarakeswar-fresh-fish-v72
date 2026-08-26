-- TARAKESWAR FRESH FISH — V7 FINAL AUTO MACHINE
-- Safe additive migration. Run after the existing V4/V5/V6/V7 SQL stack.
-- It adds category automation, 30-day reward grants/expiry, and notification helpers.

begin;
create extension if not exists pgcrypto;

create table if not exists public.tff_categories(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_name text,
  icon text default '📂',
  image_url text,
  sort_order integer not null default 100,
  active boolean not null default true,
  ai_suggested boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_tff_categories_active_sort on public.tff_categories(active,sort_order,name);
alter table public.tff_categories enable row level security;
drop policy if exists "public read active tff categories" on public.tff_categories;
create policy "public read active tff categories" on public.tff_categories for select to anon,authenticated using(active=true);
drop policy if exists "authenticated manage tff categories" on public.tff_categories;
create policy "authenticated manage tff categories" on public.tff_categories for all to authenticated using(true) with check(true);

alter table public.wallet_ledger add column if not exists expires_at timestamptz;
alter table public.loyalty_ledger add column if not exists expires_at timestamptz;
alter table public.reward_ledger add column if not exists expires_at timestamptz;

create table if not exists public.tff_reward_grants(
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  grant_type text not null check(grant_type in ('wallet','points')),
  source_table text not null,
  source_id text,
  amount numeric(12,2) not null default 0,
  points integer not null default 0,
  remaining_amount numeric(12,2) not null default 0,
  remaining_points integer not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now()+interval '30 days'),
  expired_at timestamptz
);
create index if not exists idx_tff_reward_grants_customer_expiry on public.tff_reward_grants(customer_id,expires_at,grant_type);
alter table public.tff_reward_grants enable row level security;
drop policy if exists "admin reward grants" on public.tff_reward_grants;
create policy "admin reward grants" on public.tff_reward_grants for all to authenticated using(true) with check(true);
drop policy if exists "customer reward grants read" on public.tff_reward_grants;
create policy "customer reward grants read" on public.tff_reward_grants for select to authenticated using(customer_id=auth.uid());

-- New wallet credits/rewards receive a 30-day grant. Existing aggregate balances are preserved;
-- the optional seed below starts their first 30-day validity window from this migration date.
insert into public.tff_reward_grants(customer_id,grant_type,source_table,source_id,amount,remaining_amount,expires_at)
select c.id,'wallet','migration','seed-wallet-'||c.id,greatest(coalesce(c.wallet_credit,0),0),greatest(coalesce(c.wallet_credit,0),0),now()+interval '30 days'
from public.customers c
where coalesce(c.wallet_credit,0)>0
and not exists(select 1 from public.tff_reward_grants g where g.customer_id=c.id and g.grant_type='wallet');
insert into public.tff_reward_grants(customer_id,grant_type,source_table,source_id,points,remaining_points,expires_at)
select c.id,'points','migration','seed-points-'||c.id,greatest(coalesce(c.fresh_points,0),0),greatest(coalesce(c.fresh_points,0),0),now()+interval '30 days'
from public.customers c
where coalesce(c.fresh_points,0)>0
and not exists(select 1 from public.tff_reward_grants g where g.customer_id=c.id and g.grant_type='points');

create or replace function public.tff_record_wallet_credit() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  if new.amount>0 and new.customer_id is not null then
    insert into public.tff_reward_grants(customer_id,grant_type,source_table,source_id,amount,remaining_amount,expires_at)
    values(new.customer_id,'wallet','wallet_ledger',new.id::text,new.amount,new.amount,coalesce(new.expires_at,now()+interval '30 days'));
  elsif new.amount<0 and new.customer_id is not null then
    declare need numeric:=abs(new.amount); g record; take numeric;
    begin
      for g in select * from public.tff_reward_grants where customer_id=new.customer_id and grant_type='wallet' and remaining_amount>0 and expires_at>now() order by expires_at asc,created_at asc for update loop
        exit when need<=0;
        take:=least(need,g.remaining_amount);
        update public.tff_reward_grants set remaining_amount=remaining_amount-take where id=g.id;
        need:=need-take;
      end loop;
    end;
  end if;
  return new;
end $$;
drop trigger if exists trg_tff_wallet_grant on public.wallet_ledger;
create trigger trg_tff_wallet_grant after insert on public.wallet_ledger for each row execute function public.tff_record_wallet_credit();

create or replace function public.tff_record_reward_grant() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  if new.customer_id is not null and coalesce(new.credit,0)>0 then
    insert into public.tff_reward_grants(customer_id,grant_type,source_table,source_id,amount,remaining_amount,expires_at)
    values(new.customer_id,'wallet','reward_ledger',new.id::text,new.credit,new.credit,coalesce(new.expires_at,now()+interval '30 days'));
  end if;
  if new.customer_id is not null and coalesce(new.points,0)>0 then
    insert into public.tff_reward_grants(customer_id,grant_type,source_table,source_id,points,remaining_points,expires_at)
    values(new.customer_id,'points','reward_ledger',new.id::text,new.points,new.points,coalesce(new.expires_at,now()+interval '30 days'));
  end if;
  return new;
end $$;
drop trigger if exists trg_tff_reward_grant on public.reward_ledger;
create trigger trg_tff_reward_grant after insert on public.reward_ledger for each row execute function public.tff_record_reward_grant();

create or replace function public.tff_expire_reward_grants() returns integer
language plpgsql security definer set search_path=public as $$
declare g record; n integer:=0; take numeric; takep integer;
begin
  for g in select * from public.tff_reward_grants where expired_at is null and expires_at<=now() and (remaining_amount>0 or remaining_points>0) order by expires_at asc for update loop
    if g.grant_type='wallet' and g.remaining_amount>0 then
      take:=least(g.remaining_amount,greatest((select wallet_credit from public.customers where id=g.customer_id),0));
      if take>0 then
        update public.customers set wallet_credit=greatest(0,wallet_credit-take),updated_at=now() where id=g.customer_id;
        insert into public.wallet_ledger(customer_id,amount,type,reason,expires_at) values(g.customer_id,-take,'expiry','30-day promotional wallet credit expired',now());
      end if;
      update public.tff_reward_grants set remaining_amount=0,expired_at=now() where id=g.id;
    elsif g.grant_type='points' and g.remaining_points>0 then
      takep:=least(g.remaining_points,greatest((select fresh_points from public.customers where id=g.customer_id),0));
      if takep>0 then update public.customers set fresh_points=greatest(0,fresh_points-takep),updated_at=now() where id=g.customer_id; end if;
      update public.tff_reward_grants set remaining_points=0,expired_at=now() where id=g.id;
    end if;
    n:=n+1;
  end loop;
  return n;
end $$;
revoke all on function public.tff_expire_reward_grants() from public,anon,authenticated;
grant execute on function public.tff_expire_reward_grants() to service_role;

create or replace function public.tff_reward_expiry_summary(p_customer_id uuid)
returns table(wallet_expiring numeric,points_expiring integer,next_expiry timestamptz)
language sql security definer set search_path=public as $$
select coalesce(sum(remaining_amount) filter(where grant_type='wallet' and expires_at>now()),0),
       coalesce(sum(remaining_points) filter(where grant_type='points' and expires_at>now()),0),
       min(expires_at) filter(where expires_at>now())
from public.tff_reward_grants where customer_id=p_customer_id and expired_at is null;
$$;
revoke all on function public.tff_reward_expiry_summary(uuid) from public;
grant execute on function public.tff_reward_expiry_summary(uuid) to authenticated;

commit;

-- OPTIONAL Netlify scheduled function will call tff_expire_reward_grants() daily.
