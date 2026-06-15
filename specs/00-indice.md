# Especificación Técnica — Open Coach

Documentación técnica derivada de [`brief-open-coach.md`](./brief-open-coach.md).

Responde a la sección 9 del brief ("Instrucciones para Claude Code").

> Prompts de diseño de pantallas (Claude Design): [`claude-design-prompts.md`](./claude-design-prompts.md),
> ya alineados con la arquitectura. Los flujos de pantalla también están autocontenidos en
> [`01-spec-tecnico.md §7`](./01-spec-tecnico.md).

## Índice de documentos

1. [`01-spec-tecnico.md`](./01-spec-tecnico.md) — **Spec técnico detallado**
   - Visión de arquitectura y decisiones de diseño
   - Estructura del monorepo (Turborepo)
   - Esquema completo de base de datos (tablas, relaciones, índices)
   - Políticas de Row Level Security (RLS) para multi-tenancy
   - Storage (buckets y políticas)
   - Server Actions / API routes
   - Flujo de pantallas e information architecture (web + móvil)

2. [`02-plan-implementacion.md`](./02-plan-implementacion.md) — **Plan de implementación por fases**
   - MVP, Fase 2 y Fase 3 desglosados en sprints y tareas

3. [`03-convenciones-y-migraciones.md`](./03-convenciones-y-migraciones.md) — **Convenciones y migraciones**
   - Convenciones de código y estructura
   - Estrategia de migraciones de Supabase (versionado del esquema)
   - Variables de entorno y setup open source

4. [`04-decisiones-abiertas.md`](./04-decisiones-abiertas.md) — **Decisiones abiertas**
   - Preguntas que requieren validación antes de implementar

## Resumen de decisiones de arquitectura tomadas en este spec

| Tema | Decisión | Dónde |
|------|----------|-------|
| Aislamiento de tenants | `organization_id` en todas las tablas + RLS basada en funciones helper `SECURITY DEFINER` | 01 §4 |
| Historial de asignaciones | Snapshot JSONB del contenido al asignar (`content_snapshot`) además del FK al template | 01 §3.7 |
| Acceso del cliente a rutinas/dietas | El cliente lee la **asignación** (con snapshot), no las tablas de plantilla → RLS más simple | 01 §4 |
| Datos sensibles | `medical_notes` y fotos de progreso con políticas restringidas (cliente + su entrenador) | 01 §4 |
| Pagos | Registro manual desde MVP; Stripe en Fase 2 (campos ya previstos en `payments`) | 01 §3.10 |
| Backend | Sin API server separado; Server Actions + Route Handlers de Next.js para lógica server-only | 01 §6 |
