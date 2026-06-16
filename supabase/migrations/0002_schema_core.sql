-- ============================================================================
-- Open Coach — Migración 0002: esquema core
-- Planes, membresías, rutinas, dietas, asignaciones, progreso, adherencia,
-- pagos y notas. RLS y Storage se habilitan en 0003 y 0004.
-- (Convenciones: snake_case, uuid PK, dinero en *_cents int + currency char(3),
--  enums como text + CHECK. Ver specs/01-spec-tecnico.md §3.)
-- ============================================================================

-- ── membership_plans (por organización) ─────────────────────────────────────
create table public.membership_plans (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  name             text not null,                        -- "Free", "Pro", "Max"
  description      text,
  price_cents      int not null default 0,
  currency         char(3) not null default 'MXN',
  interval         text not null default 'month'
                   check (interval in ('month','year','custom')),
  features         jsonb not null default '{}'::jsonb,   -- {rutinas:true, dieta:false, max_rutinas:3}
  active           boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index membership_plans_organization_id_idx on public.membership_plans (organization_id);

create trigger trg_membership_plans_updated_at
  before update on public.membership_plans
  for each row execute function public.set_updated_at();

-- ── client_memberships (cliente ↔ plan) ──────────────────────────────────────
create table public.client_memberships (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  client_id        uuid not null references public.profiles(id) on delete cascade,
  plan_id          uuid not null references public.membership_plans(id) on delete restrict,
  status           text not null default 'pending'
                   check (status in ('active','expired','pending')),
  start_date       date not null default now(),
  end_date         date,                                 -- próxima fecha de vencimiento
  payment_method   text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index client_memberships_organization_id_idx on public.client_memberships (organization_id);
create index client_memberships_client_id_idx on public.client_memberships (client_id);

create trigger trg_client_memberships_updated_at
  before update on public.client_memberships
  for each row execute function public.set_updated_at();

-- ── routines + routine_exercises (plantillas del entrenador) ─────────────────
create table public.routines (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  created_by       uuid references public.profiles(id) on delete set null,
  name             text not null,
  description      text,
  archived         boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index routines_organization_id_idx on public.routines (organization_id);

create trigger trg_routines_updated_at
  before update on public.routines
  for each row execute function public.set_updated_at();

create table public.routine_exercises (
  id               uuid primary key default gen_random_uuid(),
  routine_id       uuid not null references public.routines(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  position         int not null default 0,               -- orden (drag & drop)
  name             text not null,
  sets             int,
  reps             text,                                 -- "8-12", "al fallo" → text
  rest_seconds     int,
  suggested_weight text,
  notes            text,
  media_url        text,                                 -- video/imagen demostrativa
  created_at       timestamptz not null default now()
);
create index routine_exercises_routine_id_idx on public.routine_exercises (routine_id);
create index routine_exercises_organization_id_idx on public.routine_exercises (organization_id);

-- ── diet_plans + meals ───────────────────────────────────────────────────────
create table public.diet_plans (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  created_by       uuid references public.profiles(id) on delete set null,
  name             text not null,
  description      text,
  archived         boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index diet_plans_organization_id_idx on public.diet_plans (organization_id);

create trigger trg_diet_plans_updated_at
  before update on public.diet_plans
  for each row execute function public.set_updated_at();

create table public.meals (
  id               uuid primary key default gen_random_uuid(),
  diet_plan_id     uuid not null references public.diet_plans(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  position         int not null default 0,
  title            text not null,                        -- "Desayuno", "Comida"...
  items            jsonb not null default '[]'::jsonb,   -- [{food, portion, macros, notes}]
  notes            text,
  created_at       timestamptz not null default now()
);
create index meals_diet_plan_id_idx on public.meals (diet_plan_id);
create index meals_organization_id_idx on public.meals (organization_id);

-- ── assignments (rutina o dieta asignada a un cliente, con snapshot inmutable) ─
create table public.assignments (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  client_id        uuid not null references public.profiles(id) on delete cascade,
  assigned_by      uuid references public.profiles(id) on delete set null,
  type             text not null check (type in ('routine','diet')),
  routine_id       uuid references public.routines(id) on delete set null,
  diet_plan_id     uuid references public.diet_plans(id) on delete set null,
  title            text not null,                        -- copia del nombre para mostrar
  content_snapshot jsonb not null,                       -- ejercicios/comidas congelados
  frequency        text not null check (frequency in ('daily','weekly','monthly','custom')),
  start_date       date not null,
  end_date         date,                                 -- null = indefinida
  days_of_week     smallint[],                           -- 0..6 (weekly/custom por días)
  custom_dates     date[],                               -- selección manual de días
  status           text not null default 'active'
                   check (status in ('active','completed','cancelled')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint assignment_target check (
    (type = 'routine' and diet_plan_id is null) or
    (type = 'diet'    and routine_id   is null)
  )
);
create index assignments_organization_id_idx on public.assignments (organization_id);
create index assignments_client_status_idx on public.assignments (client_id, status);
create index assignments_client_type_status_idx on public.assignments (client_id, type, status);

create trigger trg_assignments_updated_at
  before update on public.assignments
  for each row execute function public.set_updated_at();

-- ── progress_logs + progress_photos ──────────────────────────────────────────
create table public.progress_logs (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  client_id        uuid not null references public.profiles(id) on delete cascade,
  logged_at        date not null default now(),
  weight_kg        numeric(5,2),
  body_fat_pct     numeric(4,1),
  measurements     jsonb not null default '{}'::jsonb,   -- {cintura, pecho, brazo, ...}
  notes            text,
  created_at       timestamptz not null default now()
);
create index progress_logs_organization_id_idx on public.progress_logs (organization_id);
create index progress_logs_client_logged_idx on public.progress_logs (client_id, logged_at desc);

create table public.progress_photos (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  client_id        uuid not null references public.profiles(id) on delete cascade,
  storage_path     text not null,                        -- ruta en bucket privado
  taken_at         date not null default now(),
  created_at       timestamptz not null default now()
);
create index progress_photos_client_taken_idx on public.progress_photos (client_id, taken_at desc);

-- ── adherence_logs (cumplimiento) ────────────────────────────────────────────
create table public.adherence_logs (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  client_id        uuid not null references public.profiles(id) on delete cascade,
  assignment_id    uuid not null references public.assignments(id) on delete cascade,
  log_date         date not null,
  exercise_ref     text,                                 -- MVP siempre NULL = día completo
  completed        boolean not null default true,
  created_at       timestamptz not null default now(),
  completed_by     uuid references public.profiles(id) on delete set null
);
-- Un único registro de "día completo" por (asignación, día) — índice parcial (NULL es distinto en UNIQUE):
create unique index adherence_day_unique
  on public.adherence_logs (assignment_id, log_date) where exercise_ref is null;
-- Granularidad por ejercicio a futuro:
create unique index adherence_exercise_unique
  on public.adherence_logs (assignment_id, log_date, exercise_ref) where exercise_ref is not null;
create index adherence_logs_organization_id_idx on public.adherence_logs (organization_id);
create index adherence_logs_assignment_date_idx on public.adherence_logs (assignment_id, log_date);
create index adherence_logs_client_date_idx on public.adherence_logs (client_id, log_date);

-- ── payments ─────────────────────────────────────────────────────────────────
create table public.payments (
  id                       uuid primary key default gen_random_uuid(),
  organization_id          uuid not null references public.organizations(id) on delete cascade,
  client_id                uuid not null references public.profiles(id) on delete cascade,
  membership_id            uuid references public.client_memberships(id) on delete set null,
  amount_cents             int not null,
  currency                 char(3) not null default 'MXN',
  method                   text not null default 'cash'
                           check (method in ('cash','transfer','card','stripe','other')),
  status                   text not null default 'paid'
                           check (status in ('paid','pending','failed','refunded')),
  paid_at                  date,
  recorded_by              uuid references public.profiles(id) on delete set null,
  stripe_payment_intent_id text,                         -- Fase 2
  notes                    text,
  created_at               timestamptz not null default now()
);
create index payments_organization_id_idx on public.payments (organization_id);
create index payments_client_paid_idx on public.payments (client_id, paid_at desc);

-- ── notes ────────────────────────────────────────────────────────────────────
create table public.notes (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  author_id        uuid not null references public.profiles(id) on delete cascade,
  client_id        uuid references public.profiles(id) on delete set null,  -- null = nota general
  title            text,
  body             text not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index notes_organization_id_idx on public.notes (organization_id);
create index notes_org_client_idx on public.notes (organization_id, client_id);

create trigger trg_notes_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();
