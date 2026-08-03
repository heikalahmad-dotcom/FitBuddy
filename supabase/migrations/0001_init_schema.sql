-- FitBuddy initial schema: customer profiles, subscriptions, and image metadata.
--
-- How to apply:
--   Easiest: paste this whole file into the Supabase Dashboard -> SQL Editor -> Run.
--   Or, if you have the Supabase CLI set up locally: `supabase db push`
--     (this file already lives at supabase/migrations/, where the CLI expects it).
--
-- Auth is handled entirely by Supabase's built-in `auth.users` table (managed by
-- GoTrue) - there is no separate `users` table here on purpose. Every app table
-- below references `auth.users(id)` directly.

-- ============================= PROFILES =============================
-- Fitness/nutrition profile, 1:1 with an auth user. Mirrors state.profile in
-- www/js/app.js today.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  sex text,                       -- 'male' | 'female' | 'other'
  age smallint,
  height_cm smallint,
  weight_kg numeric(5,1),
  target_weight_kg numeric(5,1),
  goal text,                      -- 'lose_fat' | 'build_muscle' | 'maintain'
  workout_days smallint,
  location text,                  -- 'gym' | 'home'
  diet_pref text,                 -- 'none' | 'vegetarian' | 'vegan' | 'pescatarian'
  allergies text[],
  coach_notes text,
  onboarding_mode text,           -- 'form' | 'chat'
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================= SUBSCRIPTIONS =============================
-- Catalog of plans - public read (anyone can see pricing), no write access
-- from the client at all (only ever changed by an admin/migration).
create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,      -- 'free' | 'pro_monthly' | 'pro_annual'
  name text not null,
  price_cents integer not null,
  currency text not null default 'USD',
  billing_interval text,          -- 'month' | 'year' | null for free
  features jsonb,                 -- entitlement flags for this tier
  active boolean not null default true
);

alter table public.subscription_plans enable row level security;

create policy "subscription_plans: public read"
  on public.subscription_plans for select
  using (active = true);

-- A user's subscription state. This is a synced cache, not the source of
-- truth - Stripe/Apple/Google remain authoritative. Only ever written by a
-- trusted server-side webhook handler using the service_role key (which
-- bypasses RLS) - never directly from the client, hence no insert/update
-- policy for regular users below.
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id),
  status text not null,           -- 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired'
  provider text not null,         -- 'stripe' | 'apple' | 'google'
  provider_customer_id text,
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  trial_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_subscriptions_provider on public.subscriptions(provider, provider_subscription_id);
create index idx_subscriptions_user on public.subscriptions(user_id);

alter table public.subscriptions enable row level security;

create policy "subscriptions: select own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Append-only audit trail of billing webhook deliveries, for debugging and
-- reconciliation. Service-role/admin access only - no client policy at all.
create table public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions(id) on delete set null,
  event_type text not null,       -- 'created' | 'renewed' | 'canceled' | 'payment_failed' | ...
  raw_payload jsonb,
  occurred_at timestamptz not null default now()
);

alter table public.subscription_events enable row level security;
-- (intentionally no policies - inaccessible from the client entirely)

-- seed the free tier so new signups always have a valid plan_id to reference
insert into public.subscription_plans (code, name, price_cents, currency, billing_interval, features, active)
values ('free', 'Free', 0, 'USD', null, '{}'::jsonb, true);

-- ============================= IMAGES =============================
-- Metadata only - actual image bytes live in Supabase Storage buckets
-- (see the storage bucket + policy section below), never in this table.
create table public.user_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,             -- 'meal_photo' | 'progress_photo'
  storage_path text not null,     -- object path within the bucket, e.g. {user_id}/{id}.jpg
  thumbnail_path text,
  mime_type text,
  size_bytes integer,
  estimated_calories integer,     -- meal_photo only
  linked_log_day integer,         -- meal_photo only - ties to that day's food log
  linked_weight_log_id uuid,      -- progress_photo only
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_user_images_user_kind on public.user_images(user_id, kind, created_at desc);

alter table public.user_images enable row level security;

create policy "user_images: own rows"
  on public.user_images for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================= STORAGE BUCKETS =============================
-- Private buckets (not publicly readable) - the app must generate short-lived
-- signed URLs to display a photo, since these are personal meal/progress photos.
insert into storage.buckets (id, name, public)
values
  ('meal-photos', 'meal-photos', false),
  ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- Storage objects are keyed by path; convention here is {user_id}/{filename},
-- which lets a single policy check the first path segment against auth.uid().
create policy "meal-photos: owner read"
  on storage.objects for select
  using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "meal-photos: owner write"
  on storage.objects for insert
  with check (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "meal-photos: owner delete"
  on storage.objects for delete
  using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "progress-photos: owner read"
  on storage.objects for select
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "progress-photos: owner write"
  on storage.objects for insert
  with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "progress-photos: owner delete"
  on storage.objects for delete
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
