-- ============================================================================
-- Open Coach — Seed de desarrollo (datos demo, NO usar en producción)
-- Se ejecuta tras `supabase db reset`.
-- ============================================================================
-- NOTA: los usuarios (auth.users + profiles) NO se siembran aquí porque requieren
-- registros en auth.users (los crea el flujo de signup/invitación o un script con
-- la admin API de Supabase). Por eso created_by / created_by quedan en NULL en las
-- plantillas demo. Para sembrar usuarios demo ver scripts/seed-users (pendiente).

-- ── Organización demo ────────────────────────────────────────────────────────
insert into public.organizations (id, name, slug, status)
values (
  '00000000-0000-0000-0000-000000000001',
  'Gimnasio Demo',
  'gimnasio-demo',
  'active'
)
on conflict (id) do nothing;

-- ── Planes de membresía (Free / Pro / Max) ───────────────────────────────────
insert into public.membership_plans (id, organization_id, name, description, price_cents, currency, interval, features, active)
values
  ('00000000-0000-0000-0000-000000000101',
   '00000000-0000-0000-0000-000000000001',
   'Free', 'Acceso básico a rutinas.', 0, 'MXN', 'month',
   '{"rutinas": true, "dieta": false, "max_rutinas": 1}'::jsonb, true),
  ('00000000-0000-0000-0000-000000000102',
   '00000000-0000-0000-0000-000000000001',
   'Pro', 'Rutinas + dieta + seguimiento.', 65000, 'MXN', 'month',
   '{"rutinas": true, "dieta": true, "max_rutinas": 5}'::jsonb, true),
  ('00000000-0000-0000-0000-000000000103',
   '00000000-0000-0000-0000-000000000001',
   'Max', 'Todo incluido + soporte prioritario.', 120000, 'MXN', 'month',
   '{"rutinas": true, "dieta": true, "max_rutinas": 99, "soporte": true}'::jsonb, true)
on conflict (id) do nothing;

-- ── Rutina demo (plantilla) ──────────────────────────────────────────────────
insert into public.routines (id, organization_id, created_by, name, description)
values (
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000001',
  null,
  'Tren superior — Fuerza',
  'Plantilla demo de empuje/jalón.'
)
on conflict (id) do nothing;

insert into public.routine_exercises (organization_id, routine_id, position, name, sets, reps, rest_seconds)
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 0, 'Press banca con barra', 4, '10', 90),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 1, 'Remo con mancuerna',    4, '12', 75),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 2, 'Press militar sentado', 3, '10', 90),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 3, 'Jalón al pecho',        3, '12', 60)
on conflict do nothing;

-- ── Dieta demo (plantilla) ───────────────────────────────────────────────────
insert into public.diet_plans (id, organization_id, created_by, name, description)
values (
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000001',
  null,
  'Definición — 1 850 kcal',
  'Plantilla demo de definición.'
)
on conflict (id) do nothing;

insert into public.meals (organization_id, diet_plan_id, position, title, items)
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000301', 0, 'Desayuno',
   '[{"food":"Avena en hojuelas","portion":"80 g"},{"food":"Claras de huevo","portion":"200 g"},{"food":"Plátano","portion":"1 pza"}]'::jsonb),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000301', 1, 'Comida',
   '[{"food":"Pechuga de pollo","portion":"200 g"},{"food":"Arroz","portion":"150 g"},{"food":"Ensalada","portion":"libre"}]'::jsonb),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000301', 2, 'Cena',
   '[{"food":"Salmón","portion":"180 g"},{"food":"Verduras al vapor","portion":"200 g"}]'::jsonb)
on conflict do nothing;
