# Open Coach

Plataforma de gestión para entrenadores personales (SaaS multi-tenant, open source).
Web (Next.js) + móvil (Expo) + Supabase (Postgres, Auth, Storage, RLS).

> 📄 Especificación técnica en [`specs/`](./specs/00-indice.md).

## Stack

- **Monorepo:** Turborepo + pnpm
- **Web:** `apps/web` — Next.js (App Router) + TypeScript + Tailwind
- **Móvil:** `apps/mobile` — Expo + Expo Router + NativeWind
- **Compartido:** `packages/shared` — tipos, Zod, lógica de dominio, cliente Supabase
- **Backend:** Supabase (Postgres + Auth + Storage + Realtime, con RLS)

## Estructura

```
apps/
  web/                 Next.js (entrenador + cliente + super admin web)
  mobile/              Expo (entrenador + cliente)
packages/
  shared/              tipos · schemas Zod · domain · cliente Supabase
  config-eslint/       config ESLint compartida
  config-typescript/   tsconfig compartidos
supabase/
  migrations/          esquema versionado (fuente de verdad)
  seed.sql             datos demo
```

## Requisitos

- Node ≥ 20
- pnpm 9 (`corepack enable && corepack prepare pnpm@9.15.0 --activate`)
- [Supabase CLI](https://supabase.com/docs/guides/cli) + Docker (para entorno local)

## Setup

```bash
# 1. Dependencias
pnpm install

# 2. Variables de entorno
cp .env.example .env   # rellenar con tus claves de Supabase

# 3. Base de datos (local con Docker)
pnpm dlx supabase start         # levanta Postgres/Auth/Storage local
pnpm dlx supabase db reset      # aplica migrations/ + seed.sql
pnpm db:types                   # genera packages/shared/src/types/database.types.ts

# 4. Desarrollo
pnpm dev                        # web + (opcional) móvil vía Turborepo
# o por app:
pnpm --filter @open-coach/web dev
pnpm --filter @open-coach/mobile dev
```

### Conectar a un proyecto Supabase en la nube

```bash
pnpm dlx supabase link --project-ref <ref>
pnpm db:push   # aplica las migraciones al proyecto remoto
```

Pon en `.env` la URL y la anon key del proyecto (`NEXT_PUBLIC_*` y `EXPO_PUBLIC_*`).

## Scripts (raíz)

| Script | Acción |
|--------|--------|
| `pnpm dev` | Levanta apps en modo desarrollo (Turborepo) |
| `pnpm build` | Build de todas las apps |
| `pnpm lint` | ESLint en todo el monorepo |
| `pnpm typecheck` | `tsc --noEmit` en todos los paquetes |
| `pnpm test` | Tests (Vitest) |
| `pnpm db:reset` | Recrea la BD local desde migraciones + seed |
| `pnpm db:push` | Aplica migraciones al proyecto Supabase remoto |
| `pnpm db:types` | Regenera los tipos de la BD |

## Estado

**Fase 0 completada** (fundaciones): monorepo, auth básica web/móvil, RLS de
`organizations`/`profiles`, CI. Siguiente: Sprint 1 (esquema completo + gestión de clientes).
Ver el [plan de implementación](./specs/02-plan-implementacion.md).

## Licencia

MIT — ver [`LICENSE`](./LICENSE).
