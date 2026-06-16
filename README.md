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
- [Supabase CLI](https://supabase.com/docs/guides/cli)

> **Desarrollo 100% en la nube — sin Docker.** Open Coach no usa Supabase local; se trabaja siempre
> contra un proyecto Supabase cloud vinculado. Ver `specs/03-convenciones-y-migraciones.md §2.2`.

## Setup

```bash
# 1. Dependencias
pnpm install

# 2. Variables de entorno
cp .env.example .env   # rellenar con las claves de tu proyecto Supabase cloud

# 3. Vincular el proyecto Supabase y aplicar el esquema
pnpm dlx supabase link --project-ref <ref>
pnpm db:push                    # aplica supabase/migrations/ al proyecto remoto
pnpm db:types                   # regenera los tipos desde el remoto (--linked)
# Seed (opcional, datos demo): pega supabase/seed.sql en el SQL Editor del dashboard.

# 4. Desarrollo
pnpm dev                        # web + (opcional) móvil vía Turborepo
# o por app:
pnpm --filter @open-coach/web dev
pnpm --filter @open-coach/mobile dev
```

Pon en `.env` la URL y la publishable key del proyecto (`NEXT_PUBLIC_*` y `EXPO_PUBLIC_*`), y la
`SUPABASE_SECRET_KEY` (server-only) para operaciones privilegiadas (invitaciones, etc.).

## Scripts (raíz)

| Script | Acción |
|--------|--------|
| `pnpm dev` | Levanta apps en modo desarrollo (Turborepo) |
| `pnpm build` | Build de todas las apps |
| `pnpm lint` | ESLint en todo el monorepo |
| `pnpm typecheck` | `tsc --noEmit` en todos los paquetes |
| `pnpm test` | Tests (Vitest) |
| `pnpm db:push` | Aplica migraciones al proyecto Supabase remoto vinculado |
| `pnpm db:types` | Regenera los tipos desde el remoto (`gen types --linked`) |
| `pnpm db:reset:linked` | ⚠️ Recrea el remoto desde migraciones + seed (DESTRUCTIVO, solo dev/preview) |

## Estado

**Fase 0 completada** (fundaciones): monorepo, auth básica web/móvil, RLS de
`organizations`/`profiles`, CI. Siguiente: Sprint 1 (esquema completo + gestión de clientes).
Ver el [plan de implementación](./specs/02-plan-implementacion.md).

## Licencia

MIT — ver [`LICENSE`](./LICENSE).
