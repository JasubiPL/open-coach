# 03 — Convenciones de Código y Estrategia de Migraciones — Open Coach

---

## 1. Convenciones de código

### 1.1 General

- **Lenguaje:** TypeScript en todo el monorepo. `strict: true`. Prohibido `any` (usar `unknown` + Zod).
- **Gestor de paquetes:** pnpm. Versiones fijadas; una sola versión de React/RN/Next por workspace.
- **Lint/format:** ESLint (config compartida en `packages/config-eslint`) + Prettier. CI bloquea si falla.
- **Imports:** alias por workspace (`@open-coach/shared`, `@open-coach/ui`). Sin imports relativos
  profundos entre apps.
- **No secretos en el código.** Todo por variables de entorno (§3). `service_role` jamás en cliente.

### 1.2 Nomenclatura

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Tablas / columnas BD | `snake_case` | `client_memberships`, `organization_id` |
| Tipos / componentes TS | `PascalCase` | `ClientProfile`, `RoutineEditor` |
| Funciones / variables | `camelCase` | `getTodaysAssignments` |
| Constantes | `UPPER_SNAKE` | `DEFAULT_CURRENCY` |
| Archivos de componentes | `PascalCase.tsx` | `ClientCard.tsx` |
| Archivos util/query | `kebab` o `camel` consistente | `client-queries.ts` |
| Zod schemas | sufijo `Schema` | `createClientSchema` |
| Branches | `tipo/descripcion` | `feat/assignments`, `fix/rls-payments` |

### 1.3 Capas y responsabilidades

- `packages/shared/schemas` — **única** fuente de validación (Zod). Web y móvil importan de aquí.
- `packages/shared/queries` — acceso a datos. Reciben el cliente Supabase por parámetro (inyección)
  para correr en server, browser y native. **No** acceden a `process.env` directamente.
- `packages/shared/domain` — lógica de negocio pura y testeable (sin I/O): fechas, adherencia, estados.
- `apps/*` — sólo presentación, navegación y orquestación (Server Actions / hooks de TanStack Query).

> Regla: si una pieza de lógica podría necesitarse en móvil, **va en `shared`**, no en la app.

### 1.4 Datos y dinero

- Importes en **centavos** (`int`) + `currency` ISO-4217. Formateo sólo en la capa de UI.
- Fechas de negocio (`logged_at`, `start_date`) como `date`; timestamps de auditoría como `timestamptz`.
- Nunca confiar en el `organization_id` enviado por el cliente para autorización: la **RLS** manda.

### 1.5 Commits y PRs

- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`.
- Cada PR: descripción, checklist de paridad web/móvil (si aplica) y, si toca el esquema, mención
  explícita de la migración y de cambios de RLS.
- Toda nueva tabla o columna sensible **debe** venir con su política RLS en la misma PR.

### 1.6 Testing

| Nivel | Herramienta | Qué |
|-------|-------------|-----|
| Dominio | Vitest | `resolveAssignmentForDate`, `computeAdherence`, `membershipStatus` |
| RLS | pgTAP / script SQL con 2 orgs | aislamiento, acceso cliente vs entrenador, datos sensibles |
| Integración | Vitest + Supabase local | queries reales contra BD efímera |
| E2E (post-MVP) | Playwright (web) / Detox o Maestro (móvil) | flujos críticos |

**Innegociable:** suite de RLS que pruebe que la org A no ve datos de la org B y que un cliente no ve
datos de otro cliente. Corre en CI.

---

## 2. Estrategia de migraciones de Supabase

### 2.1 Principio: la BD se versiona como código

La **fuente de verdad** del esquema es `supabase/migrations/`. Nada de cambios manuales en el
dashboard que no queden reflejados en una migración. Flujo:

```
supabase/
├─ migrations/
│  ├─ 0001_init_org_profiles.sql
│  ├─ 0002_schema_core.sql           # planes, rutinas, dietas, asignaciones...
│  ├─ 0003_rls_policies.sql
│  ├─ 0004_storage_buckets.sql
│  └─ 0005_...                        # cada cambio = nueva migración inmutable
├─ seed.sql
└─ config.toml
```

### 2.2 Flujo de trabajo

1. **Desarrollo local:** `supabase start` (Postgres local en Docker).
2. Crear migración: `supabase migration new <nombre>` y escribir el SQL (o
   `supabase db diff -f <nombre>` para capturar cambios hechos en local).
3. Aplicar local: `supabase db reset` (recrea desde 0 + corre `seed.sql`) — verifica que la cadena
   de migraciones es reproducible.
4. Regenerar tipos: `supabase gen types typescript --local > packages/shared/src/types/database.types.ts`.
5. PR. En CI: levantar Supabase, aplicar migraciones, correr tests (incl. RLS).
6. **Deploy:** `supabase db push` aplica migraciones pendientes al proyecto remoto (dev → prod).

### 2.3 Reglas

- **Migraciones inmutables:** una vez mergeada, no se edita; se crea otra para corregir.
- **Forward-only:** no se asume rollback automático. Cambios destructivos (drop/rename) van con plan
  explícito y, si hay datos, migración de datos incluida.
- **RLS junto al esquema:** habilitar RLS y crear políticas en migración (no en el dashboard).
- **Idempotencia donde aplique:** usar `if not exists` / `create or replace` en funciones y triggers.
- **Orden:** prefijo numérico/timestamp garantiza orden determinista.

### 2.4 Tipos generados

`database.types.ts` se **genera**, no se edita a mano. Se commitea para que web y móvil compilen sin
necesitar Supabase local. Regenerar en cada cambio de esquema (paso 4) — CI valida que esté al día.

### 2.5 Seed y datos demo

`seed.sql` crea una org demo, un entrenador, clientes, planes y un par de rutinas/dietas/asignaciones
para desarrollo y para que un nuevo contribuidor open source tenga datos al instante tras `db reset`.
No incluye datos reales ni sensibles.

---

## 3. Variables de entorno (open source friendly)

`.env.example` en la raíz y por app. Documentadas en el README. Sin credenciales hardcodeadas.

```bash
# Supabase (públicas — seguras en cliente)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# Server-only (NUNCA expuestas al cliente)
SUPABASE_SERVICE_ROLE_KEY=

# Fase 2 — Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Fase 3 — Analytics (PostHog, free tier)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
EXPO_PUBLIC_POSTHOG_KEY=
```

Regla: prefijo `NEXT_PUBLIC_` / `EXPO_PUBLIC_` **sólo** para valores realmente públicos. Todo lo
demás es server-only y se lee únicamente en Server Actions / Route Handlers.

---

## 4. Documentación open source mínima (para publicar)

- `README.md`: qué es, captura, stack, **guía de setup** (crear proyecto Supabase, correr migraciones,
  seed, `.env`, levantar web y móvil).
- `CONTRIBUTING.md`: flujo de PR, convenciones de commit, cómo correr tests.
- `docs/deployment.md`: desplegar en **Vercel** (web) + Supabase, y EAS para builds móviles.
- `LICENSE` (ya existe en el repo).
- `.env.example` completos.
