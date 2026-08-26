-- FINAL AUTO BANNER + PAYMENT SUPPORT
create table if not exists public.banner_assets(
 id uuid primary key default gen_random_uuid(), title text not null, description text,
 price numeric(12,2), image_url text not null, share_text text, is_active boolean not null default true,
 created_at timestamptz not null default now()
);
alter table public.banner_assets enable row level security;
drop policy if exists "public read active banners" on public.banner_assets;
create policy "public read active banners" on public.banner_assets for select to anon,authenticated using (is_active=true);
drop policy if exists "admin manage banners" on public.banner_assets;
create policy "admin manage banners" on public.banner_assets for all to authenticated using (true) with check (true);
create index if not exists idx_banner_assets_created on public.banner_assets(created_at desc);

insert into storage.buckets(id,name,public) values('banners','banners',true) on conflict(id) do update set public=true;
drop policy if exists "public read banners" on storage.objects;
create policy "public read banners" on storage.objects for select to anon,authenticated using (bucket_id='banners');

-- Ensure payment finalization can be called only server-side.
revoke all on public.payment_sessions from anon,authenticated;
revoke all on function public.finalize_payment_session_v3(uuid,text) from public,anon,authenticated;
grant execute on function public.finalize_payment_session_v3(uuid,text) to service_role;
