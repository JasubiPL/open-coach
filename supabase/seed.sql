-- ============================================================================
-- Open Coach — Seed de desarrollo (datos demo, NO usar en producción)
-- Se ejecuta tras `supabase db reset`.
-- ============================================================================
-- NOTA: en Fase 0 sólo se siembra una organización. Los usuarios (auth.users +
-- profiles) se crean mediante el flujo de signup/invitación, no aquí, porque
-- requieren registros en auth. En sprints posteriores se añadirá un seed de
-- usuarios demo usando la API de admin de Supabase.

insert into public.organizations (id, name, slug, status)
values (
  '00000000-0000-0000-0000-000000000001',
  'Gimnasio Demo',
  'gimnasio-demo',
  'active'
)
on conflict (id) do nothing;
