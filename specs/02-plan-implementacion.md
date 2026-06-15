# 02 — Plan de Implementación por Fases — Open Coach

Alineado con la sección 8 del brief. Sprints orientativos de ~1–2 semanas. El móvil **no** se difiere:
sus funciones de entrenador entran en el MVP (requisito explícito del brief).

Leyenda: **[BE]** backend/Supabase · **[SH]** packages/shared · **[W]** web · **[M]** móvil.

---

## FASE 0 — Fundaciones (Sprint 0) ✅ COMPLETADA

Objetivo: monorepo arrancando, Supabase, auth básica end-to-end.

- [x] Inicializar Turborepo + pnpm workspaces (`apps/web`, `apps/mobile`, `packages/shared`).
- [x] Configurar `config-eslint`, `config-typescript`, Prettier, Tailwind/NativeWind.
- [x] Proyecto Supabase + CLI + vínculo al proyecto cloud (`open-coach`, `db push`).
- [x] **[BE]** Migración 0001: `organizations`, `profiles`, trigger `handle_new_user`, helpers RLS.
- [x] **[BE]** `database.types.ts` → `packages/shared` (placeholder de 0001; regenerar con `db:types`).
- [x] **[SH]** Factory de cliente Supabase (server / browser / native).
- [x] **[W]** Next.js App Router + `@supabase/ssr` + middleware (refresh sesión + guard por rol).
- [x] **[M]** Expo + Expo Router + cliente Supabase (AsyncStorage) + flujo login.
- [x] CI mínimo (lint + typecheck + build + test) en GitHub Actions.

**Criterio de salida:** ✅ scaffold validado (lint/typecheck/build/test en verde), migración aplicada
en cloud y conectividad con RLS verificada (GET `organizations` → 200, RLS activa).
Pendiente de probar en runtime con usuarios reales: registro/login end-to-end y aislamiento con 2 orgs
(se cubrirá al sembrar usuarios demo en el Sprint 1).

---

## FASE 1 — MVP

### Sprint 1 — Esquema completo + gestión de clientes

- [ ] **[BE]** Migraciones del resto del esquema (§3 del spec) con sus índices.
- [ ] **[BE]** Habilitar RLS y políticas A/B/C en todas las tablas (§4). Tests de RLS (pgTAP o script).
- [ ] **[BE]** `seed.sql`: 1 org demo, 1 entrenador, 3 clientes, planes Free/Pro/Max.
- [ ] **[SH]** Zod schemas + queries de clientes, perfiles y planes.
- [ ] **[W][M]** CRUD de clientes (alta/edición/baja) + invitación de cliente (Route Handler `service_role`).
- [ ] **[W][M]** Planes de membresía (CRUD) + asignar plan a cliente.

### Sprint 2 — Rutinas y dietas (plantillas)

- [ ] **[SH]** Schemas/queries de `routines`, `routine_exercises`, `diet_plans`, `meals`.
- [ ] **[W][M]** Editor de rutina (ejercicios, reordenar).
- [ ] **[W][M]** Editor de dieta (comidas/items) — análogo.
- [ ] **[SH]** `buildRoutineSnapshot` / `buildDietSnapshot` en `domain/`.

### Sprint 3 — Asignaciones + cumplimiento

- [ ] **[BE/SH]** `assignRoutine` / `assignDiet` (Route Handler): arma `content_snapshot`, multi-cliente.
- [ ] **[SH]** `resolveAssignmentForDate`, `getTodaysAssignments` (daily/weekly/monthly/custom).
- [ ] **[W][M]** Pantalla de asignación (frecuencia, rango, multi-selección).
- [ ] **[M]** Cliente: dashboard de hoy, detalle de rutina con checkboxes, dieta.
- [ ] **[SH]** `toggleAdherence` + `computeAdherence`.
- [ ] **[W][M]** Entrenador: vista de adherencia por cliente (% + calendario).

### Sprint 4 — Progreso

- [ ] **[BE]** Bucket `progress-photos` privado + políticas de Storage (§5).
- [ ] **[SH]** Queries de progreso + subida con signed URL.
- [ ] **[M][W]** Cliente: registrar peso/medidas, galería de fotos, gráfica de peso.
- [ ] **[W][M]** Entrenador: ver progreso del cliente en su perfil.

### Sprint 5 — Pagos manuales + notas + cierre MVP

- [ ] **[SH]** Queries de `payments` + `membershipStatus` (al día / próximo / vencido).
- [ ] **[W][M]** Registro manual de pagos + board de pendientes.
- [ ] **[M]** Cliente: estado de membresía e historial de pagos.
- [ ] **[W][M]** Notas (general / por cliente).
- [ ] **[W][M]** Dashboards: entrenador y versión web sidebar/tabla.
- [ ] **[QA]** Pruebas de paridad web/móvil para ambos roles; pruebas de RLS de extremo a extremo.
- [ ] **[DOCS]** README de instalación open source (setup Supabase, `.env`, migraciones, seed).

**Criterio de salida MVP:** entrenador y cliente realizan **todas** sus funciones en web y móvil;
multi-tenancy verificada por RLS; despliegue en Vercel + Supabase documentado; datos sensibles protegidos.

---

## FASE 2 — Automatización y crecimiento

- [ ] **[BE/W]** Stripe: `checkout`, `webhook` (idempotente, valida firma), conciliación con `payments`.
- [ ] **[BE]** Suscripciones/cobro automatizado de membresías; actualizar `client_memberships.status`.
- [ ] **[BE]** Notificaciones: recordatorios de pago y de rutina del día (push Expo + email/Supabase
      Edge Functions o cron `pg_cron`).
- [ ] **[W][M]** Reportes/analítica para el entrenador (adherencia general, ingresos por periodo).
- [ ] **[BE/W]** Onboarding de nuevas organizaciones (signup de entrenadores) si se ofrece versión alojada.
- [ ] Optimización RLS: mover `org_id`/`role` a custom claims del JWT (Access Token Hook).

---

## FASE 3 — Plataforma / Super Admin (sólo web)

- [ ] **[BE]** Rol `super_admin` + políticas de lectura global ya previstas (§4).
- [ ] **[W]** Panel Super Admin: orgs activas/inactivas/trial, #usuarios, crecimiento.
- [ ] **[BE/W]** Métricas de infraestructura: storage por org y total, tamaño BD, consumo vs límite
      (API de administración de Supabase / `pg_*` stats).
- [ ] **[W]** Engagement (DAU/MAU, sesiones) vía PostHog (free tier).
- [ ] **[W]** Gestión operativa: ver detalle, suspender/activar, eliminar organización.
- [ ] Valorar modelo "open core" (features premium de la versión alojada vs self-host).

---

## Dependencias y orden crítico

```
Fase 0 (auth + RLS base)
  └─> Sprint 1 (esquema + RLS completa)   ← desbloquea todo lo demás
        ├─> Sprint 2 (plantillas)
        │     └─> Sprint 3 (asignaciones + cumplimiento)
        ├─> Sprint 4 (progreso)
        └─> Sprint 5 (pagos + notas + dashboards)  → cierre MVP
Stripe (F2) depende de payments (Sprint 5)
Super Admin (F3) depende de métricas + rol super_admin
```

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Paridad móvil se queda atrás | Desarrollar web y móvil **en paralelo por sprint**, no secuencial; lógica en `shared` |
| RLS mal configurada filtra datos | Suite de tests de RLS con 2+ orgs desde Sprint 1; revisión obligatoria por PR |
| Snapshot desincronizado del template | Documentar que el snapshot es inmutable a propósito; opción "re-asignar" para actualizar |
| Datos médicos/fotos expuestos | Buckets privados + signed URLs + políticas probadas; nunca URLs públicas de progreso |
