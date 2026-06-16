-- ============================================================================
-- Open Coach — Migración 0004: buckets de Storage y políticas
-- Todos los buckets son PRIVADOS; el acceso se sirve siempre con signed URLs.
-- El primer segmento del path es organization_id (aislamiento multi-tenant).
-- Ver specs/01-spec-tecnico.md §5.
--   progress-photos: {organization_id}/{client_id}/{uuid}.jpg   (sensible)
--   exercise-media:  {organization_id}/{routine_id}/{uuid}
--   avatars:         {organization_id}/{user_id}.jpg
-- ============================================================================

-- ── Buckets (privados) ───────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values
  ('progress-photos', 'progress-photos', false),
  ('exercise-media',  'exercise-media',  false),
  ('avatars',         'avatars',         false)
on conflict (id) do nothing;

-- ── progress-photos: entrenador de la org o el cliente dueño ─────────────────
create policy "progress_photos read" on storage.objects
  for select using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = public.current_org_id()::text
    and (public.is_trainer() or (storage.foldername(name))[2] = auth.uid()::text)
  );

create policy "progress_photos insert" on storage.objects
  for insert with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = public.current_org_id()::text
    and (public.is_trainer() or (storage.foldername(name))[2] = auth.uid()::text)
  );

create policy "progress_photos delete" on storage.objects
  for delete using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = public.current_org_id()::text
    and (public.is_trainer() or (storage.foldername(name))[2] = auth.uid()::text)
  );

-- ── exercise-media: cualquier miembro autenticado de la org (lectura);
--    el entrenador gestiona el contenido (plantillas de la org) ───────────────
create policy "exercise_media read" on storage.objects
  for select using (
    bucket_id = 'exercise-media'
    and (storage.foldername(name))[1] = public.current_org_id()::text
  );

create policy "exercise_media write" on storage.objects
  for all using (
    bucket_id = 'exercise-media'
    and (storage.foldername(name))[1] = public.current_org_id()::text
    and public.is_trainer()
  ) with check (
    bucket_id = 'exercise-media'
    and (storage.foldername(name))[1] = public.current_org_id()::text
    and public.is_trainer()
  );

-- ── avatars: lectura para miembros de la org; escritura el dueño o el entrenador
create policy "avatars read" on storage.objects
  for select using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = public.current_org_id()::text
  );

create policy "avatars write" on storage.objects
  for all using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = public.current_org_id()::text
    and (public.is_trainer() or storage.filename(name) like auth.uid()::text || '.%')
  ) with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = public.current_org_id()::text
    and (public.is_trainer() or storage.filename(name) like auth.uid()::text || '.%')
  );
