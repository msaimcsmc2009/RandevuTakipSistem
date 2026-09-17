-- Randevu Sistemi — Phase 1 foundation additions
-- Additive only: adds customers/staff tables, extends services/appointments,
-- backfills historical data. Does not modify any existing table, column,
-- constraint, or RLS policy from 0001_init.sql.

-- ---------------------------------------------------------------------------
-- helper: normalize a Turkish phone number to a bare 10-digit canonical form
-- (strips spaces/dashes/parens, drops a leading "0" or country code "90").
-- Mirrored in lib/phone.ts for use at write time by the app.
-- ---------------------------------------------------------------------------
create or replace function public.normalize_phone_tr(raw text)
returns text
language sql
immutable
as $$
  select case
    when length(regexp_replace(coalesce(raw, ''), '\D', '', 'g')) = 11
         and regexp_replace(raw, '\D', '', 'g') like '0%'
      then substring(regexp_replace(raw, '\D', '', 'g') from 2)
    when length(regexp_replace(coalesce(raw, ''), '\D', '', 'g')) = 12
         and regexp_replace(raw, '\D', '', 'g') like '90%'
      then substring(regexp_replace(raw, '\D', '', 'g') from 3)
    else regexp_replace(coalesce(raw, ''), '\D', '', 'g')
  end;
$$;

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  birth_date date,
  notes text,
  loyalty_points integer not null default 0 check (loyalty_points >= 0),
  created_at timestamptz not null default now(),
  constraint customers_business_phone_unique unique (business_id, phone)
);

create index if not exists customers_business_id_idx on public.customers (business_id);
create index if not exists customers_business_id_name_idx on public.customers (business_id, name);

-- Backfill: seed customers from existing appointment history, one row per
-- distinct (business, normalized phone), using the most recent name/email.
insert into public.customers (business_id, name, phone, email, created_at)
select distinct on (a.business_id, public.normalize_phone_tr(a.customer_phone))
  a.business_id,
  a.customer_name,
  public.normalize_phone_tr(a.customer_phone),
  a.customer_email,
  now()
from public.appointments a
where public.normalize_phone_tr(a.customer_phone) <> ''
order by a.business_id, public.normalize_phone_tr(a.customer_phone), a.created_at desc
on conflict (business_id, phone) do nothing;

-- ---------------------------------------------------------------------------
-- staff — data records only, no auth.users link (no staff login, per decision)
-- ---------------------------------------------------------------------------
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  phone text,
  specialty text,
  photo_url text,
  working_hours jsonb not null default '{
    "mon": [["09:00","18:00"]],
    "tue": [["09:00","18:00"]],
    "wed": [["09:00","18:00"]],
    "thu": [["09:00","18:00"]],
    "fri": [["09:00","18:00"]],
    "sat": [],
    "sun": []
  }'::jsonb,
  time_off jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists staff_business_id_idx on public.staff (business_id);

-- ---------------------------------------------------------------------------
-- services: extend with color / description / active
-- ---------------------------------------------------------------------------
alter table public.services add column if not exists color text not null default '#0d9488'
  check (color ~ '^#[0-9a-fA-F]{6}$');
alter table public.services add column if not exists description text;
alter table public.services add column if not exists active boolean not null default true;

-- ---------------------------------------------------------------------------
-- appointments: link to customers/staff, freeze price at booking time
-- ---------------------------------------------------------------------------
alter table public.appointments add column if not exists customer_id uuid
  references public.customers (id) on delete set null;
alter table public.appointments add column if not exists staff_id uuid
  references public.staff (id) on delete set null;
alter table public.appointments add column if not exists price_at_booking numeric(10, 2);

create index if not exists appointments_customer_id_idx on public.appointments (customer_id);
create index if not exists appointments_staff_id_idx on public.appointments (staff_id);

update public.appointments a
set customer_id = c.id
from public.customers c
where c.business_id = a.business_id
  and c.phone = public.normalize_phone_tr(a.customer_phone)
  and a.customer_id is null;

-- service_id is `on delete restrict`, so every appointment always has a
-- matching service — the backfill below is guaranteed complete.
update public.appointments a
set price_at_booking = s.price
from public.services s
where a.service_id = s.id
  and a.price_at_booking is null;

alter table public.appointments alter column price_at_booking set default 0;
alter table public.appointments alter column price_at_booking set not null;
alter table public.appointments add constraint appointments_price_at_booking_check
  check (price_at_booking >= 0);

-- ---------------------------------------------------------------------------
-- Row Level Security — customers, staff (owner-only; no public policy on
-- either — unlike businesses/services, this data must never be publicly
-- selectable). Public booking writes to customers via the service-role
-- client, the same bypass pattern already used for the appointments insert.
-- ---------------------------------------------------------------------------
alter table public.customers enable row level security;
alter table public.staff enable row level security;

create policy "customers_owner_select" on public.customers
  for select using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
create policy "customers_owner_insert" on public.customers
  for insert with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
create policy "customers_owner_update" on public.customers
  for update using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
create policy "customers_owner_delete" on public.customers
  for delete using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );

create policy "staff_owner_select" on public.staff
  for select using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
create policy "staff_owner_insert" on public.staff
  for insert with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
create policy "staff_owner_update" on public.staff
  for update using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
create policy "staff_owner_delete" on public.staff
  for delete using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
