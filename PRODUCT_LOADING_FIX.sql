-- Product loading fix for customer app
-- Allows public customer browsing while keeping writes protected.

alter table if exists public.fish enable row level security;

drop policy if exists "public can read available fish" on public.fish;
create policy "public can read available fish"
on public.fish
for select
to anon, authenticated
using (available is true);

-- If your fish table has rows where available is NULL and you want those
-- visible too, change the policy condition to: (available is true OR available is null)
