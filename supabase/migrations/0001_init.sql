-- Randevu Sistemi — initial schema
-- Run this in the Supabase SQL editor, or via `supabase db push` / the CLI.

create extension if not exists "btree_gist";

-- ---------------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------------
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references auth.users (id) on delete cascade,
  phone text,
  address text,
  working_hours jsonb not null default '{
    "mon": [["09:00","18:00"]],
    "tue": [["09:00","18:00"]],
    "wed": [["09:00","18:00"]],
    "thu": [["09:00","18:00"]],
    "fri": [["09:00","18:00"]],
    "sat": [],
    "sun": []
  }'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists businesses_owner_id_idx on public.businesses (owner_id);

-- ---------------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price numeric(10, 2) not null default 0 check (price >= 0),
  created_at timestamptz not null default now()
);

create index if not exists services_business_id_idx on public.services (business_id);

-- ---------------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete restrict,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  constraint appointments_time_order check (end_time > start_time)
);

create index if not exists appointments_business_id_start_time_idx
  on public.appointments (business_id, start_time);

-- Prevent double-booking at the database level: no two non-cancelled
-- appointments for the same business may have overlapping time ranges.
alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (
    business_id with =,
    tstzrange(start_time, end_time) with &&
  ) where (status <> 'cancelled');

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.businesses enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;

-- businesses: public read (needed for the public booking page), owner-only writes
create policy "businesses_public_select" on public.businesses
  for select using (true);

create policy "businesses_owner_insert" on public.businesses
  for insert with check (owner_id = auth.uid());

create policy "businesses_owner_update" on public.businesses
  for update using (owner_id = auth.uid());

create policy "businesses_owner_delete" on public.businesses
  for delete using (owner_id = auth.uid());

-- services: public read, owner-only writes (via business ownership)
create policy "services_public_select" on public.services
  for select using (true);

create policy "services_owner_insert" on public.services
  for insert with check (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  );

create policy "services_owner_update" on public.services
  for update using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  );

create policy "services_owner_delete" on public.services
  for delete using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  );

-- appointments: NO public insert policy — the public booking flow writes
-- through a server-side Server Action using the service-role key, which
-- bypasses RLS entirely. Only the business owner can read/update/delete.
create policy "appointments_owner_select" on public.appointments
  for select using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  );

create policy "appointments_owner_update" on public.appointments
  for update using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  );

create policy "appointments_owner_delete" on public.appointments
  for delete using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  );
