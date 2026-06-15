# 01 — Spec Técnico Detallado — Open Coach

> Documento técnico de referencia para implementar el MVP y dejar preparadas las Fases 2 y 3.
> Todo el SQL está escrito para Postgres/Supabase y pensado para vivir en `supabase/migrations`.

---

## 1. Visión de arquitectura

### 1.1 Principios

1. **Multi-tenant desde el día 1.** Cada entrenador es una `organization`. Toda fila de negocio
   lleva `organization_id`. El aislamiento se garantiza con **RLS en Postgres**, no con filtros de
   aplicación. Aunque al inicio exista una sola organización (la del papá), el modelo ya es multi-tenant.
2. **Supabase como backend único.** Postgres + Auth + Storage + Realtime. No hay servidor de API
   propio. La lógica server-only (Stripe webhooks, operaciones con `service_role`) vive en
   **Route Handlers / Server Actions** de Next.js.
3. **Paridad funcional móvil ↔ web.** La lógica de negocio, validaciones (Zod) y tipos viven en
   `packages/shared`. Web y móvil son sólo capas de presentación sobre el mismo núcleo y el mismo
   backend Supabase. El móvil es el canal principal (~90%), por lo que es ciudadano de primera clase.
4. **El cliente nunca toca tablas de plantilla.** Las rutinas/dietas se "congelan" en un snapshot
   dentro de la asignación. El cliente sólo lee `assignments`, `progress_*`, `adherence_logs`,
   `client_memberships` y `payments` propios → RLS más simple y robusta + historial inmutable.

### 1.2 Diagrama lógico

```
                 ┌──────────────────────────┐
                 │      apps/web (Next.js)   │  Entrenador + Cliente + Super Admin (web)
                 └──────────────┬───────────┘
                                │  (server actions / route handlers)
 ┌────────────────────┐        │        ┌──────────────────────────┐
 │ apps/mobile (Expo) │────────┼────────│  packages/shared         │
 │ Entrenador+Cliente │        │        │  tipos · Zod · queries   │
 └──────────┬─────────┘        │        │  · cliente Supabase      │
            │                  │        └──────────┬───────────────┘
            │                  │                   │
            ▼                  ▼                   ▼
 ┌─────────────────────────────────────────────────────────────────┐
 │                          SUPABASE                                 │
 │  Postgres (RLS)   ·   Auth   ·   Storage (privado)   ·   Realtime │
 │                  Stripe (Fase 2, vía webhooks)                    │
 └─────────────────────────────────────────────────────────────────┘
```

### 1.3 Decisiones de stack

| Capa | Tecnología | Notas |
|------|-----------|-------|
| Monorepo | Turborepo + pnpm | workspaces, cache de tareas |
| Web | Next.js (App Router) + TS + Tailwind | SSR/RSC, responsive (sidebar desktop / tabs móvil) |
| Móvil | React Native + Expo + TS | Expo Router, EAS para builds |
| Estilos móvil | NativeWind (Tailwind para RN) | comparte tokens de diseño con web |
| UI web | Tailwind + shadcn/ui (o Radix) | tema oscuro como base (ver prompts de diseño) |
| Estado servidor | TanStack Query | cache/invalidación tanto en web como móvil |
| Validación | Zod (en `packages/shared`) | una sola fuente de verdad de esquemas |
| Backend | Supabase | Postgres + Auth + Storage + Realtime |
| Pagos | Manual (MVP) → Stripe (Fase 2) | campos ya en `payments` |
| Tipos de BD | `supabase gen types typescript` | generados a `packages/shared` |

---

## 2. Estructura del monorepo

```
open-coach/
├─ apps/
│  ├─ web/                      # Next.js (App Router)
│  │  ├─ app/
│  │  │  ├─ (auth)/             # login, signup, recuperar contraseña
│  │  │  ├─ (trainer)/          # layout + rutas del entrenador
│  │  │  ├─ (client)/           # layout + rutas del cliente
│  │  │  ├─ (admin)/            # Super Admin (Fase 3, sólo web)
│  │  │  └─ api/                # route handlers (webhooks, etc.)
│  │  ├─ components/
│  │  ├─ lib/                   # createClient server/browser (SSR)
│  │  └─ middleware.ts          # refresco de sesión + guard por rol
│  └─ mobile/                   # Expo + Expo Router
│     ├─ app/
│     │  ├─ (auth)/
│     │  ├─ (trainer)/          # tabs del entrenador
│     │  └─ (client)/           # tabs del cliente
│     ├─ components/
│     └─ lib/                   # cliente Supabase (AsyncStorage)
├─ packages/
│  ├─ shared/                   # CORAZÓN: reutilizado por web y móvil
│  │  ├─ src/
│  │  │  ├─ types/              # database.types.ts (generado) + dominio
│  │  │  ├─ schemas/            # Zod (client, routine, assignment, ...)
│  │  │  ├─ queries/            # funciones de acceso a datos (data layer)
│  │  │  ├─ domain/             # lógica de negocio pura (fechas, adherencia)
│  │  │  └─ supabase/           # factory de cliente (browser/native/server)
│  │  └─ package.json
│  ├─ ui/                       # (opcional) componentes compartibles RN/web
│  ├─ config-eslint/
│  └─ config-typescript/
├─ supabase/
│  ├─ migrations/               # SQL versionado (fuente de verdad del esquema)
│  ├─ seed.sql                  # datos demo para desarrollo
│  └─ config.toml
├─ turbo.json
├─ pnpm-workspace.yaml
└─ package.json
```

**Reglas de dependencia:** `apps/*` dependen de `packages/*`. `packages/shared` no depende de apps.
Las `queries` reciben un cliente Supabase ya construido (inyección), para que la misma query corra
en server (RSC/action), browser (web) y native (móvil) sin reimplementarse.

---

## 3. Esquema de base de datos

Convenciones: `snake_case`, PK `uuid` (`gen_random_uuid()`), `created_at`/`updated_at timestamptz`,
todos los importes en **centavos** (`*_cents int`) + `currency char(3)`. Enums vía `text` + `CHECK`
(más fáciles de evolucionar en migraciones que `ENUM` nativos).

### 3.0 Tipos / enums (como CHECK)

- `profiles.role`: `trainer` | `client` | `super_admin`
- `organizations.status`: `active` | `suspended` | `trial`
- `client_memberships.status`: `active` | `expired` | `pending`
- `assignments.type`: `routine` | `diet`
- `assignments.frequency`: `daily` | `weekly` | `monthly` | `custom`
- `assignments.status`: `active` | `completed` | `cancelled`
- `payments.method`: `cash` | `transfer` | `card` | `stripe` | `other`
- `payments.status`: `paid` | `pending` | `failed` | `refunded`

### 3.1 `organizations`

```sql
create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  status      text not null default 'active'
              check (status in ('active','suspended','trial')),
  settings    jsonb not null default '{}'::jsonb,   -- moneda por defecto, timezone, etc.
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

### 3.2 `profiles` (1:1 con `auth.users`)

```sql
create table public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  organization_id  uuid references public.organizations(id) on delete cascade,
  role             text not null check (role in ('trainer','client','super_admin')),
  full_name        text not null,
  email            text,
  phone            text,
  avatar_url       text,
  birth_date       date,
  medical_notes    text,            -- DATO SENSIBLE (RLS restringida)
  member_since     date default now(),
  status           text not null default 'active' check (status in ('active','inactive')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
-- super_admin: organization_id NULL (nivel plataforma)
create index on public.profiles (organization_id);
create index on public.profiles (organization_id, role);
```

> Se crea automáticamente vía trigger `on auth.users` (ver §4.1) para enlazar `auth` ↔ `profiles`.

### 3.3 `membership_plans` (por organización)

```sql
create table public.membership_plans (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  name             text not null,                       -- "Free", "Pro", "Max"
  description      text,
  price_cents      int not null default 0,
  currency         char(3) not null default 'MXN',
  interval         text not null default 'month'
                   check (interval in ('month','year','custom')),
  features         jsonb not null default '{}'::jsonb,  -- {rutinas:true, dieta:false, max_rutinas:3}
  active           boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index on public.membership_plans (organization_id);
```

### 3.4 `client_memberships` (cliente ↔ plan)

```sql
create table public.client_memberships (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  client_id        uuid not null references public.profiles(id) on delete cascade,
  plan_id          uuid not null references public.membership_plans(id) on delete restrict,
  status           text not null default 'pending'
                   check (status in ('active','expired','pending')),
  start_date       date not null default now(),
  end_date         date,                                -- próxima fecha de vencimiento
  payment_method   text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index on public.client_memberships (organization_id);
create index on public.client_memberships (client_id);
```

### 3.5 `routines` + `routine_exercises` (plantillas del entrenador)

```sql
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
create index on public.routines (organization_id);

create table public.routine_exercises (
  id               uuid primary key default gen_random_uuid(),
  routine_id       uuid not null references public.routines(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  position         int not null default 0,              -- orden (drag & drop)
  name             text not null,
  sets             int,
  reps             text,                                -- "8-12", "al fallo" → text
  rest_seconds     int,
  suggested_weight text,
  notes            text,
  media_url        text,                                -- video/imagen demostrativa
  created_at       timestamptz not null default now()
);
create index on public.routine_exercises (routine_id);
create index on public.routine_exercises (organization_id);
```

### 3.6 `diet_plans` + `meals`

```sql
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
create index on public.diet_plans (organization_id);

create table public.meals (
  id               uuid primary key default gen_random_uuid(),
  diet_plan_id     uuid not null references public.diet_plans(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  position         int not null default 0,
  title            text not null,                       -- "Desayuno", "Comida"...
  items            jsonb not null default '[]'::jsonb,  -- [{food, portion, macros, notes}]
  notes            text,
  created_at       timestamptz not null default now()
);
create index on public.meals (diet_plan_id);
create index on public.meals (organization_id);
```

### 3.7 `assignments` (rutina o dieta asignada a un cliente)

Decisión clave: además del FK al template, se guarda un **snapshot JSONB** del contenido al momento
de asignar. Esto: (a) preserva el historial aunque la plantilla se edite o borre; (b) permite que el
cliente lea todo lo que necesita desde una sola tabla, simplificando RLS.

```sql
create table public.assignments (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  client_id        uuid not null references public.profiles(id) on delete cascade,
  assigned_by      uuid references public.profiles(id) on delete set null,
  type             text not null check (type in ('routine','diet')),
  routine_id       uuid references public.routines(id) on delete set null,
  diet_plan_id     uuid references public.diet_plans(id) on delete set null,
  title            text not null,                       -- copia del nombre para mostrar
  content_snapshot jsonb not null,                      -- ejercicios/comidas congelados
  frequency        text not null check (frequency in ('daily','weekly','monthly','custom')),
  start_date       date not null,
  end_date         date,                                -- null = indefinida
  days_of_week     smallint[],                          -- 0..6 (weekly/custom por días)
  custom_dates     date[],                              -- selección manual de días
  status           text not null default 'active'
                   check (status in ('active','completed','cancelled')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint assignment_target check (
    (type = 'routine' and diet_plan_id is null) or
    (type = 'diet'    and routine_id   is null)
  )
);
create index on public.assignments (organization_id);
create index on public.assignments (client_id, status);
create index on public.assignments (client_id, type, status);
```

### 3.8 Progreso: `progress_logs` + `progress_photos`

```sql
create table public.progress_logs (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  client_id        uuid not null references public.profiles(id) on delete cascade,
  logged_at        date not null default now(),
  weight_kg        numeric(5,2),
  body_fat_pct     numeric(4,1),
  measurements     jsonb not null default '{}'::jsonb,  -- {cintura, pecho, brazo, ...}
  notes            text,
  created_at       timestamptz not null default now()
);
create index on public.progress_logs (organization_id);
create index on public.progress_logs (client_id, logged_at desc);

create table public.progress_photos (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  client_id        uuid not null references public.profiles(id) on delete cascade,
  storage_path     text not null,                       -- ruta en bucket privado
  taken_at         date not null default now(),
  created_at       timestamptz not null default now()
);
create index on public.progress_photos (client_id, taken_at desc);
```

### 3.9 `adherence_logs` (cumplimiento)

```sql
create table public.adherence_logs (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  client_id        uuid not null references public.profiles(id) on delete cascade,
  assignment_id    uuid not null references public.assignments(id) on delete cascade,
  log_date         date not null,
  exercise_ref     text,                                -- MVP siempre NULL = día completo; reservado para granularidad por ejercicio a futuro
  completed        boolean not null default true,
  created_at       timestamptz not null default now(),
  completed_by     uuid references public.profiles(id) on delete set null
);
-- En Postgres NULL es distinto en UNIQUE, así que para garantizar UN registro de "día completo"
-- por (asignación, día) en el MVP se usa un índice parcial:
create unique index adherence_day_unique
  on public.adherence_logs (assignment_id, log_date) where exercise_ref is null;
-- Para granularidad por ejercicio a futuro:
create unique index adherence_exercise_unique
  on public.adherence_logs (assignment_id, log_date, exercise_ref) where exercise_ref is not null;
create index on public.adherence_logs (organization_id);
create index on public.adherence_logs (assignment_id, log_date);
create index on public.adherence_logs (client_id, log_date);
```

### 3.10 `payments`

```sql
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
  stripe_payment_intent_id text,                        -- Fase 2
  notes                    text,
  created_at               timestamptz not null default now()
);
create index on public.payments (organization_id);
create index on public.payments (client_id, paid_at desc);
```

### 3.11 `notes`

```sql
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
create index on public.notes (organization_id);
create index on public.notes (organization_id, client_id);
```

### 3.12 Trigger `updated_at` (genérico)

```sql
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- aplicar en cada tabla con updated_at:
create trigger trg_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();
-- ... (idem profiles, membership_plans, client_memberships, routines,
--      diet_plans, assignments, notes)
```

### 3.13 Diagrama de relaciones (resumen)

```
organizations 1───* profiles
organizations 1───* membership_plans 1───* client_memberships *───1 profiles(client)
organizations 1───* routines 1───* routine_exercises
organizations 1───* diet_plans 1───* meals
profiles(client) 1───* assignments *───? routines / diet_plans   (FK + snapshot)
profiles(client) 1───* progress_logs / progress_photos
assignments      1───* adherence_logs
profiles(client) 1───* payments *───? client_memberships
organizations 1───* notes *───? profiles(client)
```

---

## 4. Row Level Security (multi-tenancy)

### 4.1 Bootstrap: trigger auth → profiles

```sql
-- Crea el profile al registrarse. org_id y role llegan en raw_user_meta_data
-- (definidos durante la invitación del cliente o el alta de la organización).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, organization_id, role, full_name, email)
  values (
    new.id,
    (new.raw_user_meta_data ->> 'organization_id')::uuid,
    coalesce(new.raw_user_meta_data ->> 'role', 'client'),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  );
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 4.2 Funciones helper (evitan recursión en políticas)

Las políticas no deben hacer subconsultas a `profiles` directamente (recursión). Se usan funciones
`SECURITY DEFINER` que leen el `profiles` del usuario actual:

```sql
create or replace function public.current_org_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select organization_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_trainer()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'trainer'
  );
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;
```

> **Optimización futura (Fase 2/3):** mover `organization_id` y `role` a *custom claims* del JWT
> mediante un *Custom Access Token Hook*. Las políticas leerían `auth.jwt() ->> 'org_id'` sin tocar
> `profiles` → mejor rendimiento. Para el MVP, las funciones helper son suficientes y más simples.

### 4.3 Patrón de políticas

Se distinguen **3 patrones** de tabla:

**A) Tablas de plantilla / sólo-entrenador** (`membership_plans`, `routines`, `routine_exercises`,
`diet_plans`, `meals`, `notes`): el entrenador tiene acceso total dentro de su org; el cliente **no**
las consulta (lee el snapshot en `assignments`).

```sql
alter table public.routines enable row level security;

create policy routines_trainer_all on public.routines
  for all
  using ( organization_id = public.current_org_id() and public.is_trainer() )
  with check ( organization_id = public.current_org_id() and public.is_trainer() );

-- super admin (Fase 3): lectura global
create policy routines_admin_read on public.routines
  for select using ( public.is_super_admin() );
```

(Idéntico para `membership_plans`, `routine_exercises`, `diet_plans`, `meals`, `notes`.)

**B) Tablas centradas en el cliente** (`client_memberships`, `assignments`, `progress_logs`,
`progress_photos`, `adherence_logs`, `payments`): el entrenador ve/gestiona todo en su org; el
cliente sólo ve/gestiona **sus propias filas** (`client_id = auth.uid()`). Qué puede *escribir* el
cliente varía por tabla (ver §4.4).

```sql
alter table public.assignments enable row level security;

-- Entrenador: control total en su organización
create policy assignments_trainer_all on public.assignments
  for all
  using ( organization_id = public.current_org_id() and public.is_trainer() )
  with check ( organization_id = public.current_org_id() and public.is_trainer() );

-- Cliente: sólo lectura de sus asignaciones
create policy assignments_client_read on public.assignments
  for select
  using ( client_id = auth.uid() );

create policy assignments_admin_read on public.assignments
  for select using ( public.is_super_admin() );
```

**C) `profiles`** (mixta): el usuario ve su propio perfil; el entrenador ve y gestiona los perfiles
de su org; nadie ve `medical_notes` fuera de (cliente dueño + su entrenador).

```sql
alter table public.profiles enable row level security;

create policy profiles_self_read on public.profiles
  for select using ( id = auth.uid() );

create policy profiles_self_update on public.profiles
  for update using ( id = auth.uid() ) with check ( id = auth.uid() );

create policy profiles_trainer_all on public.profiles
  for all
  using ( organization_id = public.current_org_id() and public.is_trainer() )
  with check ( organization_id = public.current_org_id() and public.is_trainer() );

create policy profiles_admin_read on public.profiles
  for select using ( public.is_super_admin() );
```

> `medical_notes` y `email`/`phone` quedan protegidos: un cliente sólo ve su propia fila; el
> entrenador ve las de su org. No hay forma de que un cliente vea a otro cliente. Para defensa en
> profundidad se puede exponer una **vista** `client_directory` sin `medical_notes` para listados.

### 4.4 Qué puede escribir el cliente (matriz)

| Tabla | Cliente lee | Cliente inserta | Cliente actualiza |
|-------|:----------:|:---------------:|:-----------------:|
| `assignments` | ✅ (suyas) | ❌ | ❌ |
| `adherence_logs` | ✅ (suyas) | ✅ (suyas) | ✅ (suyas) |
| `progress_logs` | ✅ (suyas) | ✅ (suyas) | ✅ (suyas) |
| `progress_photos` | ✅ (suyas) | ✅ (suyas) | ✅ (borrar suyas) |
| `client_memberships` | ✅ (suya) | ❌ | ❌ |
| `payments` | ✅ (suyos) | ❌ | ❌ |
| `profiles` (propio) | ✅ | — | ✅ (datos básicos) |

Ejemplo para `adherence_logs` (cliente puede registrar cumplimiento):

```sql
alter table public.adherence_logs enable row level security;

create policy adherence_trainer_all on public.adherence_logs
  for all
  using ( organization_id = public.current_org_id() and public.is_trainer() )
  with check ( organization_id = public.current_org_id() and public.is_trainer() );

create policy adherence_client_read on public.adherence_logs
  for select using ( client_id = auth.uid() );

create policy adherence_client_write on public.adherence_logs
  for insert with check (
    client_id = auth.uid()
    and organization_id = public.current_org_id()
  );

create policy adherence_client_update on public.adherence_logs
  for update using ( client_id = auth.uid() ) with check ( client_id = auth.uid() );
```

(`progress_logs` y `progress_photos` siguen el mismo patrón de insert/update por el cliente dueño.)

### 4.5 `organizations`

```sql
alter table public.organizations enable row level security;

create policy org_member_read on public.organizations
  for select using ( id = public.current_org_id() );

create policy org_trainer_update on public.organizations
  for update using ( id = public.current_org_id() and public.is_trainer() )
  with check ( id = public.current_org_id() and public.is_trainer() );

create policy org_admin_all on public.organizations
  for all using ( public.is_super_admin() ) with check ( public.is_super_admin() );
```

> Operaciones que cruzan tenants o crean organizaciones se hacen con la **`service_role` key** desde
> el servidor (Server Action/Route Handler), que **bypassa RLS**. Nunca exponer esa key al cliente.

---

## 5. Storage

| Bucket | Visibilidad | Contenido | Path |
|--------|-------------|-----------|------|
| `progress-photos` | **privado** | fotos de progreso (sensible) | `{organization_id}/{client_id}/{uuid}.jpg` |
| `exercise-media` | **privado** | videos/imágenes de ejercicios (sólo visibles autenticado) | `{organization_id}/{routine_id}/{uuid}` |
| `avatars` | privado | foto de perfil | `{organization_id}/{user_id}.jpg` |

Acceso a fotos siempre vía **URLs firmadas** (signed URLs) generadas en el servidor. Políticas de
Storage (sobre `storage.objects`) replican el patrón: el primer segmento del path es `organization_id`
y el segundo `client_id`.

```sql
-- Lectura de fotos de progreso: entrenador de la org o el cliente dueño
create policy "progress_photos read" on storage.objects
  for select using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = public.current_org_id()::text
    and ( public.is_trainer() or (storage.foldername(name))[2] = auth.uid()::text )
  );

create policy "progress_photos insert" on storage.objects
  for insert with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = public.current_org_id()::text
    and ( public.is_trainer() or (storage.foldername(name))[2] = auth.uid()::text )
  );
```

Todos los buckets son **privados**: `exercise-media` también se sirve sólo con signed URLs a usuarios
autenticados de la organización (decisión §04-B8). Su política replica el patrón usando
`organization_id` como primer segmento del path (sin restricción por `client_id`, ya que es contenido
de plantilla de la org, no de un cliente).

---

## 6. Capa de acceso a datos, Server Actions y API Routes

### 6.1 Filosofía

- **Lecturas y escrituras "normales"** ⇒ directo a Supabase con la **anon key** + sesión del usuario.
  RLS garantiza el aislamiento. Se usa el mismo `packages/shared/queries` en web (RSC/Client) y móvil.
- **Operaciones privilegiadas / server-only** ⇒ Server Action o Route Handler con `service_role`:
  invitar clientes, crear organizaciones, webhooks de Stripe, métricas de Super Admin, generar
  signed URLs, asignar (porque arma el `content_snapshot`).

### 6.2 Catálogo de operaciones (data layer en `packages/shared/queries`)

Auth / contexto:
- `getSession()`, `getMyProfile()`, `getMyOrganization()`

Clientes (entrenador):
- `listClients(orgId, { search, status })`
- `getClient(clientId)` · `createClientInvite(...)`† · `updateClient(...)` · `deactivateClient(...)`

Membresías y planes:
- `listMembershipPlans()` · `createPlan(...)` · `updatePlan(...)`
- `assignMembership(clientId, planId, {...})` · `getClientMembership(clientId)`

Rutinas / dietas (plantillas):
- `listRoutines()` · `getRoutine(id)` · `createRoutine(...)` · `updateRoutine(...)` · `archiveRoutine(id)`
- `listDietPlans()` · `getDietPlan(id)` · `createDietPlan(...)` · `updateDietPlan(...)`

Asignaciones:
- `assignRoutine(routineId, clientIds[], { frequency, dates })`†  → arma snapshot
- `assignDiet(dietPlanId, clientIds[], {...})`†
- `listAssignments(clientId, { type, status })`
- `getTodaysAssignments(clientId)` (lógica de frecuencia en `domain/`)
- `cancelAssignment(id)`

Progreso:
- `listProgressLogs(clientId)` · `addProgressLog(...)`
- `uploadProgressPhoto(...)`† (genera signed URL + inserta fila) · `listProgressPhotos(clientId)`

Cumplimiento:
- `toggleAdherence(assignmentId, date, exerciseRef)` · `getAdherenceSummary(clientId)`

Pagos:
- `listPayments(clientId)` · `recordPayment(...)` · `getMembershipStatusBoard()` (clientes con pendientes)

Notas:
- `listNotes({ clientId })` · `createNote(...)` · `updateNote(...)` · `deleteNote(id)`

† = pasa por Server Action / Route Handler (lógica server-only).

### 6.3 Route Handlers (web)

```
POST   /api/clients/invite          # crea auth user + profile (service_role) y manda invitación
POST   /api/assignments             # crea asignación con snapshot (server-only)
POST   /api/storage/signed-url      # firma subida/lectura de fotos
POST   /api/stripe/webhook          # Fase 2: eventos de Stripe (sin auth de sesión, valida firma)
POST   /api/stripe/checkout         # Fase 2: crea sesión de checkout
GET    /api/admin/metrics           # Fase 3: métricas plataforma (service_role, sólo super_admin)
```

### 6.4 Lógica de dominio reutilizable (`packages/shared/domain`)

- `resolveAssignmentForDate(assignment, date)` → ¿esta asignación aplica hoy? (daily/weekly/monthly/custom)
- `computeAdherence(assignment, logs, range)` → % cumplimiento + calendario
- `membershipStatus(membership, today)` → `al_dia | proximo_a_vencer | vencido`
- `buildRoutineSnapshot(routine, exercises)` / `buildDietSnapshot(plan, meals)`

---

## 7. Flujo de pantallas e Information Architecture

Aquí se define la **navegación** y el mapa de pantallas por rol y plataforma, con los datos que
consume cada una. El diseño visual de detalle (wireframes/UI) se define aparte.

### 7.1 Cliente — móvil (canal principal)

Bottom tabs:

```
[ Inicio ]   [ Rutina ]   [ Dieta ]   [ Progreso ]   [ Membresía ]
```

| Pantalla | Contenido | Datos |
|----------|-----------|-------|
| Inicio / Dashboard | saludo, estado de membresía, rutina de hoy, resumen de dieta del día, acceso a progreso | membresía + asignaciones de hoy |
| Detalle de rutina | ejercicios (series/reps/descanso) en modo lectura + botón "Marcar día como completado" | snapshot de la asignación + `adherence_logs` (fila por día, `exercise_ref` NULL) |
| Plan alimenticio | comidas (desayuno/comida/cena/snacks) con alimentos y porciones | snapshot de la asignación |
| Mi progreso | registrar peso/medidas, galería de fotos cronológica, gráfica de peso | `progress_logs` + `progress_photos` |
| Membresía y pagos | plan actual, próximo pago, estado (badge), historial | `client_memberships` + `payments` |

### 7.2 Entrenador — móvil (uso principal hoy)

Bottom tabs:

```
[ Dashboard ]  [ Clientes ]  [ Plantillas ]  [ Pagos ]  [ Notas ]
```

| Pantalla | Contenido | Datos |
|----------|-----------|-------|
| Dashboard | métricas: #clientes activos, pagos pendientes (alerta), adherencia promedio; accesos rápidos | agregados de la org |
| Lista + perfil de cliente | lista con badge de pago; perfil con datos, asignaciones, progreso, pagos | `profiles`, membresía, asignaciones, progreso, pagos |
| Crear/editar rutina | agregar/reordenar ejercicios (drag & drop), guardar como plantilla | `routines` + `routine_exercises` |
| Crear/editar dieta | comidas e items, guardar como plantilla | `diet_plans` + `meals` |
| Asignar rutina/plan | elegir plantilla, multi-selección de clientes, frecuencia (diaria/semanal/mensual/personalizada) | crea `assignments` con snapshot |
| Registro de pagos | board de estado por cliente + alta rápida de pago | `payments` + estado de membresía |
| Notas | lista tipo libreta (general o por cliente), buscador, crear nota | `notes` |

> "Plantillas" agrupa rutinas y dietas. La pantalla de asignación es accesible desde una plantilla
> o desde el perfil del cliente.

### 7.3 Web responsive (entrenador y cliente)

Misma cobertura funcional. En **escritorio**: navegación lateral (sidebar) en vez de tabs; listas de
clientes como **tabla** (nombre, plan, estado de pago, adherencia, acciones). En **móvil web**: se
reusa el layout de tabs. Paridad total: ninguna plataforma es una versión reducida.

### 7.4 Super Admin — sólo web (Fase 3)

| Pantalla | Contenido | Datos |
|----------|-----------|-------|
| Dashboard plataforma | #orgs activas/inactivas/trial, #usuarios, storage usado vs límite, gráfica de crecimiento | métricas plataforma |
| Detalle / gestión de organización | ver detalle, suspender/activar/eliminar org | `organizations` + agregados |

Métricas de infraestructura (storage, tamaño BD) vía API de administración de Supabase; engagement
(DAU/MAU, sesiones) vía **PostHog** (free tier), no desde la BD de negocio.

### 7.5 Onboarding y autenticación (ambos roles)

```
Login (email/password)
  ├─ Entrenador → primer login crea/usa su organización
  └─ Cliente   → llega por invitación (deep link / email) → set password → entra a su org
Recuperar contraseña · (OAuth opcional a futuro)
```

---

## 8. Realtime (opcional MVP, recomendado)

Canales útiles vía Supabase Realtime:
- Entrenador suscrito a `adherence_logs` / `progress_logs` de su org → ver cumplimiento en vivo.
- Cliente suscrito a `assignments` (status/contenido) → recibe nueva rutina sin recargar.

No es bloqueante para MVP; TanStack Query con refetch ya cubre el caso base.

---

## 9. Resumen de tablas

| Tabla | Patrón RLS | Escribe cliente |
|-------|-----------|-----------------|
| `organizations` | miembro lee / trainer edita / admin all | no |
| `profiles` | self + trainer org + admin | sólo su perfil |
| `membership_plans` | A (sólo trainer) | no |
| `client_memberships` | B (centrada en cliente) | no |
| `routines`, `routine_exercises` | A | no |
| `diet_plans`, `meals` | A | no |
| `assignments` | B | no |
| `progress_logs`, `progress_photos` | B | sí (propias) |
| `adherence_logs` | B | sí (propias) |
| `payments` | B | no |
| `notes` | A | no |
