-- ============================================================================
-- Open Coach — Migración 0003: Row Level Security para el esquema core
-- Patrones (ver specs/01-spec-tecnico.md §4):
--   A) solo-entrenador (plantillas): membership_plans, routines, routine_exercises,
--      diet_plans, meals, notes. El cliente NO las consulta.
--   B) centrada en cliente: client_memberships, assignments, progress_logs,
--      progress_photos, adherence_logs, payments. El cliente ve/gestiona sus filas.
--   + lectura global para super_admin en todas.
-- Helpers: public.current_org_id(), public.is_trainer(), public.is_super_admin().
-- ============================================================================

-- ── Patrón A: solo-entrenador ────────────────────────────────────────────────

-- membership_plans
alter table public.membership_plans enable row level security;
create policy membership_plans_trainer_all on public.membership_plans
  for all
  using (organization_id = public.current_org_id() and public.is_trainer())
  with check (organization_id = public.current_org_id() and public.is_trainer());
create policy membership_plans_admin_read on public.membership_plans
  for select using (public.is_super_admin());

-- routines
alter table public.routines enable row level security;
create policy routines_trainer_all on public.routines
  for all
  using (organization_id = public.current_org_id() and public.is_trainer())
  with check (organization_id = public.current_org_id() and public.is_trainer());
create policy routines_admin_read on public.routines
  for select using (public.is_super_admin());

-- routine_exercises
alter table public.routine_exercises enable row level security;
create policy routine_exercises_trainer_all on public.routine_exercises
  for all
  using (organization_id = public.current_org_id() and public.is_trainer())
  with check (organization_id = public.current_org_id() and public.is_trainer());
create policy routine_exercises_admin_read on public.routine_exercises
  for select using (public.is_super_admin());

-- diet_plans
alter table public.diet_plans enable row level security;
create policy diet_plans_trainer_all on public.diet_plans
  for all
  using (organization_id = public.current_org_id() and public.is_trainer())
  with check (organization_id = public.current_org_id() and public.is_trainer());
create policy diet_plans_admin_read on public.diet_plans
  for select using (public.is_super_admin());

-- meals
alter table public.meals enable row level security;
create policy meals_trainer_all on public.meals
  for all
  using (organization_id = public.current_org_id() and public.is_trainer())
  with check (organization_id = public.current_org_id() and public.is_trainer());
create policy meals_admin_read on public.meals
  for select using (public.is_super_admin());

-- notes
alter table public.notes enable row level security;
create policy notes_trainer_all on public.notes
  for all
  using (organization_id = public.current_org_id() and public.is_trainer())
  with check (organization_id = public.current_org_id() and public.is_trainer());
create policy notes_admin_read on public.notes
  for select using (public.is_super_admin());

-- ── Patrón B: centrada en cliente ────────────────────────────────────────────

-- client_memberships (cliente: solo lectura de la suya)
alter table public.client_memberships enable row level security;
create policy client_memberships_trainer_all on public.client_memberships
  for all
  using (organization_id = public.current_org_id() and public.is_trainer())
  with check (organization_id = public.current_org_id() and public.is_trainer());
create policy client_memberships_client_read on public.client_memberships
  for select using (client_id = auth.uid());
create policy client_memberships_admin_read on public.client_memberships
  for select using (public.is_super_admin());

-- assignments (cliente: solo lectura de las suyas)
alter table public.assignments enable row level security;
create policy assignments_trainer_all on public.assignments
  for all
  using (organization_id = public.current_org_id() and public.is_trainer())
  with check (organization_id = public.current_org_id() and public.is_trainer());
create policy assignments_client_read on public.assignments
  for select using (client_id = auth.uid());
create policy assignments_admin_read on public.assignments
  for select using (public.is_super_admin());

-- progress_logs (cliente: lee/inserta/actualiza las suyas)
alter table public.progress_logs enable row level security;
create policy progress_logs_trainer_all on public.progress_logs
  for all
  using (organization_id = public.current_org_id() and public.is_trainer())
  with check (organization_id = public.current_org_id() and public.is_trainer());
create policy progress_logs_client_read on public.progress_logs
  for select using (client_id = auth.uid());
create policy progress_logs_client_insert on public.progress_logs
  for insert with check (client_id = auth.uid() and organization_id = public.current_org_id());
create policy progress_logs_client_update on public.progress_logs
  for update using (client_id = auth.uid()) with check (client_id = auth.uid());
create policy progress_logs_admin_read on public.progress_logs
  for select using (public.is_super_admin());

-- progress_photos (cliente: lee/inserta/borra las suyas)
alter table public.progress_photos enable row level security;
create policy progress_photos_trainer_all on public.progress_photos
  for all
  using (organization_id = public.current_org_id() and public.is_trainer())
  with check (organization_id = public.current_org_id() and public.is_trainer());
create policy progress_photos_client_read on public.progress_photos
  for select using (client_id = auth.uid());
create policy progress_photos_client_insert on public.progress_photos
  for insert with check (client_id = auth.uid() and organization_id = public.current_org_id());
create policy progress_photos_client_delete on public.progress_photos
  for delete using (client_id = auth.uid());
create policy progress_photos_admin_read on public.progress_photos
  for select using (public.is_super_admin());

-- adherence_logs (cliente: lee/inserta/actualiza las suyas)
alter table public.adherence_logs enable row level security;
create policy adherence_trainer_all on public.adherence_logs
  for all
  using (organization_id = public.current_org_id() and public.is_trainer())
  with check (organization_id = public.current_org_id() and public.is_trainer());
create policy adherence_client_read on public.adherence_logs
  for select using (client_id = auth.uid());
create policy adherence_client_insert on public.adherence_logs
  for insert with check (client_id = auth.uid() and organization_id = public.current_org_id());
create policy adherence_client_update on public.adherence_logs
  for update using (client_id = auth.uid()) with check (client_id = auth.uid());
create policy adherence_admin_read on public.adherence_logs
  for select using (public.is_super_admin());

-- payments (cliente: solo lectura de los suyos)
alter table public.payments enable row level security;
create policy payments_trainer_all on public.payments
  for all
  using (organization_id = public.current_org_id() and public.is_trainer())
  with check (organization_id = public.current_org_id() and public.is_trainer());
create policy payments_client_read on public.payments
  for select using (client_id = auth.uid());
create policy payments_admin_read on public.payments
  for select using (public.is_super_admin());
