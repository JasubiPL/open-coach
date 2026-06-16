# 04 — Decisiones Resueltas — Open Coach

Todas las decisiones abiertas quedaron resueltas. Este documento es ahora el **registro de decisiones**
(ADR ligero) que rige la implementación. Las marcadas como *(Fase 2/3)* están confirmadas en su
dirección pero se afinan al llegar a esa fase.

---

## A. Producto y alcance

1. ✅ **Nombre:** **Open Coach** ("coach" = entrenador). Aplica a repo, slug y branding.

2. ✅ **Moneda y zona horaria:** default `MXN` y `America/Mexico_City` (pesos mexicanos / Ciudad de
   México), configurable por organización vía `organizations.settings`.

3. ✅ **Edición de datos del cliente:** el cliente edita sus datos de contacto básicos (teléfono, foto);
   el resto lo gestiona el entrenador. `medical_notes` sólo lo edita el entrenador.

4. ✅ **Adherencia por día (no por ejercicio).** El cliente marca un único "entrené hoy" por
   asignación/día. En `adherence_logs` esto es una fila con `exercise_ref = NULL` (día completo). La
   pantalla de detalle de rutina muestra los ejercicios en modo lectura + un botón "Marcar día como
   completado". *(El esquema ya soporta granularidad por ejercicio si se quisiera activar a futuro.)*

## B. Datos y modelado

5. ✅ **Snapshot inmutable en asignaciones.** Editar la plantilla **no** altera asignaciones ya hechas;
   para actualizar se re-asigna ("actualizar asignación"). Garantiza historial fiel de lo asignado.

6. ✅ **Membresías:** una activa por cliente a la vez + filas históricas en `client_memberships`.

7. ✅ **Macros en dietas:** MVP en texto libre dentro de `meals.items` (jsonb). Estructurar
   (calorías/macros numéricos) sólo si se necesita en Fase 2.

8. ✅ **`exercise-media` privado.** Los videos/imágenes de ejercicios sólo se ven autenticado (desde
   app o web logueado), vía **signed URLs**. Mismo criterio que el resto de Storage; nada público.

## C. Multi-tenant y auth

9. ✅ **Alta de clientes por invitación de email** (link de set-password de Supabase Auth) + deep link
   a la app móvil. El entrenador dispara la invitación; el cliente fija su contraseña.

10. ✅ **1 usuario = 1 organización** en el MVP. Mantiene la RLS simple. Se revisitará sólo si surge
    la necesidad real (ej. cliente de dos entrenadores).

11. ✅ **RLS con funciones helper `SECURITY DEFINER`** (`current_org_id()`, `is_trainer()`) en el MVP.
    Migración a custom JWT claims (Access Token Hook) en Fase 2 por rendimiento.

## D. Pagos *(Fase 2)*

12. ✅ **Pagos manuales en MVP; Stripe en Fase 2.** Campos de Stripe ya previstos en `payments`. En
    Fase 2 se usarán **Stripe Subscriptions** por plan para cobro recurrente.

13. ✅ **Mapeo plan→precio de Stripe y comisiones:** decisión de negocio que se concreta al construir
    la integración de Fase 2 (cada `membership_plans` se enlazará a un `price` de Stripe). Sin impacto
    en el MVP.

## E. Plataforma / Super Admin *(Fase 3)*

14. ✅ **Analytics de engagement: PostHog (free tier).** Gratuito hasta su límite mensual, sin
    infraestructura propia, y open source (self-hostable si en algún momento se quiere). Cubre DAU/MAU
    y sesiones sin calcularlas desde la BD de negocio. *(Alternativa open source self-host: Umami.)*

15. ✅ **Métricas de infraestructura** (storage por org/total, tamaño BD, consumo vs límite): se
    obtienen vía la API de administración de Supabase y stats de Postgres. Disponibilidad según el
    plan de Supabase contratado; se valida al construir el panel de Fase 3.

16. ✅ **Modelo open core:** se publica todo el MVP como open source. La definición de qué features
    serían exclusivas de la versión alojada se decide antes de lanzar la versión SaaS (Fase 2/3); no
    condiciona la arquitectura.

## F. Operación / DevOps

17. ✅ **Hosting web: Vercel.** La instancia oficial corre en Vercel. (Quien quiera self-host puede
    desplegar el build de Next.js donde prefiera, pero no se mantiene una guía Docker dedicada por ahora.)

18. ✅ **Builds móviles: EAS Build (Expo)** desde el inicio, con distribución por TestFlight / Play
    Internal para iterar en dispositivo real.

19. ✅ **CI/CD: GitHub Actions** (lint + typecheck + build + tests de RLS).

20. ✅ **Desarrollo 100% Supabase Cloud, sin Docker.** No se usa `supabase start` / Postgres local.
    Se trabaja siempre contra el proyecto cloud vinculado: `pnpm db:push` aplica migraciones,
    `pnpm db:types` regenera tipos con `--linked`. Tests de RLS/integración contra un **preview
    branch** (o proyecto de test), no contra Docker local. Recomendado tener proyectos/branches
    separados de dev y prod para que el seed (`db:reset:linked`, destructivo) nunca toque datos
    reales. Ver flujo en `03-convenciones-y-migraciones.md §2.2`.

---

## Decisiones que se concretan en su fase (no bloquean el MVP)

- D13 — mapeo plan→Stripe price y comisiones (al construir Stripe, Fase 2).
- E15 — disponibilidad de métricas de infraestructura según plan Supabase (Fase 3).
- E16 — alcance exacto del modelo open core (antes del lanzamiento SaaS).

Todo lo demás queda fijo y la arquitectura de `01-spec-tecnico.md` ya lo refleja.
