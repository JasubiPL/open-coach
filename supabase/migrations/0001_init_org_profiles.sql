-- ============================================================================
-- Open Coach — Migración 0001: organizaciones, perfiles, helpers RLS y bootstrap auth
-- ============================================================================

-- ── Utilidad: updated_at automático ────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── organizations ──────────────────────────────────────────────────────────
create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  status      text not null default 'active' check (status in ('active','suspended','trial')),
  settings    jsonb not null default '{"currency":"MXN","timezone":"America/Mexico_City"}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

-- ── profiles (1:1 con auth.users) ──────────────────────────────────────────
create table public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  organization_id  uuid references public.organizations(id) on delete cascade,
  role             text not null check (role in ('trainer','client','super_admin')),
  full_name        text not null default '',
  email            text,
  phone            text,
  avatar_url       text,
  birth_date       date,
  medical_notes    text,            -- DATO SENSIBLE
  member_since     date default now(),
  status           text not null default 'active' check (status in ('active','inactive')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index profiles_organization_id_idx on public.profiles (organization_id);
create index profiles_org_role_idx on public.profiles (organization_id, role);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── Bootstrap: crear profile al registrarse en auth ────────────────────────
-- org_id, role y full_name llegan en raw_user_meta_data (alta de org o invitación).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, organization_id, role, full_name, email)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'organization_id', '')::uuid,
    coalesce(new.raw_user_meta_data ->> 'role', 'client'),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Helpers RLS (evitan recursión en políticas) ────────────────────────────
create or replace function public.current_org_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select organization_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_trainer()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'trainer');
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin');
$$;

-- ── RLS: organizations ─────────────────────────────────────────────────────
alter table public.organizations enable row level security;

create policy org_member_read on public.organizations
  for select using (id = public.current_org_id());

create policy org_trainer_update on public.organizations
  for update using (id = public.current_org_id() and public.is_trainer())
  with check (id = public.current_org_id() and public.is_trainer());

create policy org_admin_all on public.organizations
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ── RLS: profiles ──────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

create policy profiles_self_read on public.profiles
  for select using (id = auth.uid());

create policy profiles_self_update on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy profiles_trainer_all on public.profiles
  for all
  using (organization_id = public.current_org_id() and public.is_trainer())
  with check (organization_id = public.current_org_id() and public.is_trainer());

create policy profiles_admin_read on public.profiles
  for select using (public.is_super_admin());
