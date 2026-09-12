-- VierdaagseLogeren.nl phase 0 schema
-- Agents do not write to product tables directly; they go through mutation policy,
-- change_log and optionally review_queue.

create extension if not exists pgcrypto;

create type public.provider_status as enum ('active', 'inactive', 'unknown', 'sold_out');
create type public.provider_type as enum ('camping', 'temporary_camping', 'glamping', 'accommodation');
create type public.accommodation_type as enum (
  'small_tent', 'large_tent', 'caravan', 'folding_trailer', 'camper', 'furnished_tent', 'room'
);
create type public.pricing_type as enum ('fixed_week', 'per_night', 'per_person', 'per_pitch', 'package');
create type public.availability_status as enum ('available', 'limited', 'sold_out', 'not_open_yet', 'unknown');
create type public.commercial_plan as enum ('free', 'verified', 'featured', 'performance');
create type public.change_action_type as enum ('auto_applied', 'pending_review', 'rejected');
create type public.review_status as enum ('open', 'approved', 'rejected');
create type public.lead_status as enum ('new', 'sent', 'closed');

create table public.providers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  legal_name text,
  website_url text,
  booking_url text,
  contact_email text,
  contact_phone text,
  city text not null,
  postcode text,
  latitude double precision not null,
  longitude double precision not null,
  distance_to_wedren_km numeric(6,1) not null,
  cycling_minutes_to_wedren integer not null,
  status public.provider_status not null default 'unknown',
  provider_type public.provider_type not null,
  verified boolean not null default false,
  featured boolean not null default false,
  commercial_plan public.commercial_plan not null default 'free',
  transport_modes text[] not null default '{}',
  first_seen_at timestamptz not null default now(),
  last_verified_at timestamptz,
  next_verification_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.accommodation_types (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  type public.accommodation_type not null,
  max_people integer not null check (max_people > 0),
  electricity_possible boolean not null default false,
  available boolean not null default true,
  notes text,
  unique (provider_id, type)
);

create table public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  accommodation_type_id uuid not null references public.accommodation_types(id) on delete cascade,
  season_year integer not null,
  pricing_type public.pricing_type not null,
  base_price numeric(10,2),
  price_per_person numeric(10,2),
  price_per_night numeric(10,2),
  electricity_price numeric(10,2),
  parking_price numeric(10,2),
  tourist_tax numeric(10,2),
  mandatory_fees jsonb not null default '[]'::jsonb,
  deposit numeric(10,2),
  currency text not null default 'EUR' check (currency = 'EUR'),
  minimum_nights integer,
  package_start_date date,
  package_end_date date,
  notes text,
  source_url text,
  verified_at timestamptz,
  confidence_score numeric(3,2) check (confidence_score is null or (confidence_score >= 0 and confidence_score <= 1))
);

create table public.amenities (
  id text primary key,
  label_nl text not null,
  label_en text not null,
  label_de text not null
);

create table public.provider_amenities (
  provider_id uuid not null references public.providers(id) on delete cascade,
  amenity_id text not null references public.amenities(id),
  available boolean not null,
  included boolean not null default false,
  price numeric(10,2),
  notes text,
  source_url text,
  verified_at timestamptz,
  confidence_score numeric(3,2) check (confidence_score is null or (confidence_score >= 0 and confidence_score <= 1)),
  primary key (provider_id, amenity_id)
);

create table public.availability (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  accommodation_type_id uuid references public.accommodation_types(id) on delete cascade,
  season_year integer not null,
  status public.availability_status not null default 'unknown',
  available_units integer,
  checked_at timestamptz not null default now(),
  source_url text,
  confidence_score numeric(3,2) check (confidence_score is null or (confidence_score >= 0 and confidence_score <= 1))
);

create table public.source_snapshots (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  source_url text not null,
  source_type text not null,
  raw_content_hash text not null,
  extracted_text text,
  fetched_at timestamptz not null default now(),
  changed_since_previous boolean,
  previous_snapshot_id uuid references public.source_snapshots(id)
);

create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_name text not null,
  workflow_name text,
  provider_id uuid references public.providers(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null,
  input jsonb,
  output jsonb,
  confidence_score numeric(3,2),
  tokens_used integer,
  estimated_cost numeric(10,4),
  error_message text
);

create table public.change_log (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.providers(id) on delete set null,
  entity_type text not null,
  entity_id text,
  field_name text not null,
  old_value jsonb,
  new_value jsonb,
  change_source text not null,
  source_url text,
  agent_run_id uuid references public.agent_runs(id) on delete set null,
  confidence_score numeric(3,2),
  action_type public.change_action_type not null,
  created_at timestamptz not null default now()
);

create table public.review_queue (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.providers(id) on delete set null,
  change_log_id uuid references public.change_log(id) on delete set null,
  priority text not null default 'normal',
  reason text not null,
  suggested_action text,
  status public.review_status not null default 'open',
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.providers(id) on delete set null,
  user_email text not null,
  party_size integer,
  accommodation_type text,
  travel_preferences jsonb,
  estimated_booking_value numeric(10,2),
  source_page text,
  status public.lead_status not null default 'new',
  created_at timestamptz not null default now()
);

create table public.user_searches (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  party_size integer,
  accommodation_type text,
  selected_preferences jsonb,
  result_ids uuid[],
  clicked_provider_id uuid references public.providers(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.booking_alerts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  accommodation_type text,
  party_size integer,
  preferred_region text,
  preferred_amenities text[],
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  event_type text not null,
  provider_id uuid references public.providers(id) on delete set null,
  source_page text,
  created_at timestamptz not null default now()
);

insert into public.amenities (id, label_nl, label_en, label_de) values
  ('electricity', 'Stroom', 'Electricity', 'Strom'),
  ('parking', 'Parkeren', 'Parking', 'Parken'),
  ('early_breakfast', 'Vroeg ontbijt', 'Early breakfast', 'Frühes Frühstück'),
  ('dinner', 'Avondeten', 'Dinner', 'Abendessen'),
  ('bike_rental', 'Fietsverhuur', 'Bike rental', 'Fahrradverleih'),
  ('bike_storage', 'Fietsenstalling', 'Bike storage', 'Fahrradabstellplatz'),
  ('shuttle', 'Shuttle', 'Shuttle', 'Shuttle'),
  ('massage', 'Massage', 'Massage', 'Massage'),
  ('blister_care', 'Blarenzorg', 'Blister care', 'Blasenpflege'),
  ('physiotherapy', 'Fysiotherapie', 'Physiotherapy', 'Physiotherapie'),
  ('showers', 'Douches', 'Showers', 'Duschen'),
  ('toilets', 'Toiletten', 'Toilets', 'Toiletten'),
  ('wifi', 'Wifi', 'Wifi', 'WLAN'),
  ('charging_points', 'Oplaadpunten', 'Charging points', 'Ladepunkte'),
  ('quiet_area', 'Rustige zone', 'Quiet area', 'Ruhebereich'),
  ('social_area', 'Gezelligheid', 'Social area', 'Geselligkeit'),
  ('food_service', 'Eten op het terrein', 'Food service', 'Verpflegung'),
  ('luggage_storage', 'Bagageopslag', 'Luggage storage', 'Gepäckaufbewahrung');

create index providers_status_idx on public.providers (status);
create index providers_city_idx on public.providers (city);
create index pricing_rules_provider_season_idx on public.pricing_rules (provider_id, season_year);
create index availability_provider_season_idx on public.availability (provider_id, season_year);
create index change_log_provider_idx on public.change_log (provider_id, created_at desc);
create index review_queue_open_idx on public.review_queue (status, created_at desc);
create index agent_runs_started_idx on public.agent_runs (started_at desc);

alter table public.providers enable row level security;
alter table public.accommodation_types enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.amenities enable row level security;
alter table public.provider_amenities enable row level security;
alter table public.availability enable row level security;
alter table public.source_snapshots enable row level security;
alter table public.agent_runs enable row level security;
alter table public.change_log enable row level security;
alter table public.review_queue enable row level security;
alter table public.leads enable row level security;
alter table public.user_searches enable row level security;
alter table public.booking_alerts enable row level security;
alter table public.tracking_events enable row level security;

create policy providers_public_read on public.providers
  for select using (status in ('active', 'sold_out'));

create policy accommodation_public_read on public.accommodation_types
  for select using (
    exists (select 1 from public.providers p where p.id = provider_id and p.status in ('active', 'sold_out'))
  );

create policy pricing_public_read on public.pricing_rules
  for select using (
    exists (select 1 from public.providers p where p.id = provider_id and p.status in ('active', 'sold_out'))
  );

create policy amenities_public_read on public.amenities for select using (true);

create policy provider_amenities_public_read on public.provider_amenities
  for select using (
    exists (select 1 from public.providers p where p.id = provider_id and p.status in ('active', 'sold_out'))
  );

create policy availability_public_read on public.availability
  for select using (
    exists (select 1 from public.providers p where p.id = provider_id and p.status in ('active', 'sold_out'))
  );

create policy leads_anon_insert on public.leads
  for insert to anon with check (user_email ~* '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$');

create policy searches_anon_insert on public.user_searches
  for insert to anon with check (true);

create policy alerts_anon_insert on public.booking_alerts
  for insert to anon with check (email ~* '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$');

create policy tracking_anon_insert on public.tracking_events
  for insert to anon with check (true);

comment on table public.source_snapshots is 'Raw provider source captures for the future Verification Agent.';
comment on table public.agent_runs is 'Execution log for specialised agents. No agent writes product data directly.';
comment on table public.change_log is 'Audit trail for every product mutation.';
comment on table public.review_queue is 'Human approval queue for high-risk or low-confidence mutations.';
