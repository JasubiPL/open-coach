# Brief de Proyecto: Plataforma de Gestión para Entrenadores Personales (SaaS Open Source)

> Nota: "[Nombre del Proyecto]" es un placeholder. Sustitúyelo cuando tengas el nombre definitivo.

## 1. Resumen Ejecutivo

Open Coach es una plataforma de gestión para entrenadores personales que permite administrar clientes, membresías, rutinas de entrenamiento, planes alimenticios, seguimiento de progreso y pagos.

El proyecto nace para resolver una necesidad real (el negocio de entrenamiento personal de mi papá), pero se diseña desde el inicio como **multi-tenant** (cada entrenador es una organización independiente con sus propios clientes y configuración) y se publicará como **código abierto**, de modo que:

- Cualquier entrenador puede auto-hospedar su propia instancia (un solo tenant).
- A futuro, se puede ofrecer una versión alojada donde múltiples entrenadores se registran como organizaciones independientes dentro de la misma instancia.

## 2. Roles y Modelo Multi-Tenant

- **Organización**: representa el negocio de un entrenador. Todos los datos (clientes, rutinas, planes, pagos, etc.) están aislados por organización.
- **Entrenador / Admin de Organización**: dueño de la organización. Gestiona clientes, rutinas, planes alimenticios, asignaciones, membresías, pagos y notas.
- **Cliente / Alumno**: usuario final asociado a una organización. Visualiza sus rutinas y planes asignados, registra cumplimiento y progreso, ve el estado de su membresía.
- **Super Admin (futuro)**: rol de plataforma para gestionar organizaciones si se ofrece como SaaS alojado. Acceso exclusivamente vía web (no requiere app móvil). No es indispensable para el MVP, pero la arquitectura debe contemplarlo.

El aislamiento entre organizaciones debe garantizarse a nivel de base de datos (Row Level Security en Supabase), no solo a nivel de aplicación.

## 3. Planes de Membresía (por Organización)

Cada organización define sus propios niveles de membresía para SUS clientes (ej. "Free", "Pro", "Max"), con:

- Nombre y descripción del plan.
- Precio y periodicidad (mensual, anual, etc.).
- Beneficios/restricciones asociados (ej. acceso a rutinas, acceso a plan alimenticio, seguimiento personalizado, número de rutinas activas, etc.).

Cada cliente está vinculado a un plan de membresía dentro de su organización, con fecha de inicio, estado (activo / vencido / pendiente de pago) y forma de pago.

> Ejemplo orientativo (no es un requisito fijo, cada entrenador lo configura): Free = seguimiento básico de progreso; Pro = rutinas asignadas; Max = rutinas + plan alimenticio + seguimiento personalizado.

## 4. Módulos Funcionales

### 4.1 Gestión de Usuarios
- CRUD de clientes por parte del entrenador (alta, edición, baja/desactivación).
- Datos básicos: nombre, edad, contacto, condición médica relevante (dato sensible, ver requisitos no funcionales).
- Registro/invitación de clientes (acceso a la app móvil con su propia cuenta).
- Asociación del cliente a un plan de membresía.

### 4.2 Gestión de Rutinas
- CRUD de rutinas de entrenamiento (crear, editar, eliminar).
- Una rutina contiene ejercicios: nombre, series, repeticiones, descanso, peso/intensidad sugerida, notas, y opcionalmente referencia a video/imagen demostrativa.
- Las rutinas se crean como plantillas reutilizables y luego se asignan a clientes.

### 4.3 Gestión de Planes Alimenticios
- CRUD de planes alimenticios (crear, editar, eliminar).
- Un plan contiene comidas/secciones (ej. desayuno, comida, cena, snacks) con detalles (alimentos, porciones, macros si aplica, notas).
- Igual que las rutinas, se crean como plantillas reutilizables y luego se asignan.

### 4.4 Asignación de Rutinas y Planes Alimenticios
- El entrenador asigna una rutina o plan alimenticio existente a uno o varios clientes.
- Tipos de frecuencia/recurrencia: **Diaria, Semanal, Mensual o Personalizada** (rango de fechas específico o selección manual de días).
- Un cliente puede tener múltiples asignaciones activas simultáneamente (ej. una rutina y un plan alimenticio).
- Debe quedar registro histórico de asignaciones pasadas (no solo las activas).

### 4.5 Seguimiento de Progreso del Cliente
- Histórico de medidas corporales (peso, % de grasa, medidas específicas) con fecha de registro.
- Fotos de progreso con fecha (almacenamiento privado, accesible solo por el cliente y su entrenador).
- Datos generales: edad, condición médica, antigüedad como miembro (tiempo en la plataforma/negocio).
- Histórico de rutinas y planes alimenticios previamente asignados.

### 4.6 Seguimiento de Cumplimiento de Rutinas
- El cliente marca como completados los días/ejercicios de su rutina asignada.
- El entrenador puede visualizar el nivel de adherencia/cumplimiento por cliente (ej. % completado, calendario de cumplimiento).

### 4.7 Seguimiento de Pagos de Membresía
- Registro de pagos por cliente (manual o vía integración de pasarela de pago).
- Histórico de pagos y estado actual de la membresía (al día / vencida / próxima a vencer).
- Visibilidad clara para el entrenador de qué clientes tienen pagos pendientes.

### 4.8 Notas / Ideas
- El entrenador puede crear notas generales o asociadas a un cliente específico (tipo libreta de apuntes/ideas).
- CRUD básico de notas, con fecha de creación/edición.

## 5. Entidades de Datos Clave (alto nivel)

Esta lista es orientativa; el esquema completo (incluyendo relaciones y políticas RLS) debe definirse en el spec técnico.

- `organizations`
- `profiles` (usuarios: entrenador, cliente, super admin — vinculado a Supabase Auth)
- `membership_plans` (por organización)
- `client_memberships` (cliente ↔ plan, estado, fechas)
- `routines` / `exercises`
- `diet_plans` / `meals`
- `assignments` (rutina o plan alimenticio asignado a un cliente, con tipo de frecuencia y rango de fechas)
- `progress_logs` (peso, medidas, fotos, fecha)
- `adherence_logs` (cumplimiento de asignaciones)
- `payments`
- `notes`

## 6. Requisitos No Funcionales

- **Multi-tenancy estricta**: aislamiento de datos entre organizaciones mediante Row Level Security (RLS) de Supabase, no solo filtros a nivel de aplicación.
- **Datos sensibles**: la condición médica y las fotos de progreso son datos sensibles; deben tener políticas de acceso restringidas (solo el cliente correspondiente y su entrenador).
- **Almacenamiento de archivos**: fotos de progreso en Supabase Storage, con buckets/políticas privadas.
- **Paridad funcional multiplataforma**: tanto el entrenador como el cliente deben poder realizar todas las funciones que les correspondan desde cualquier canal (app móvil, web en navegador móvil, web en escritorio). Ninguna plataforma debe ser una versión "reducida" de la otra.
- **Diseño responsive en web**: la interfaz web debe adaptarse correctamente tanto a escritorio como a navegador móvil, ya que algunos usuarios (entrenador y/o cliente) consultarán la plataforma desde el celular sin pasar por la app nativa.
- **Móvil como canal principal**: hoy en día ~90% del uso ocurre en móvil, por lo que la app nativa debe priorizarse en UX/UI y no tratarse como un "complemento" de la web — incluyendo las funciones administrativas del entrenador (gestión de clientes, asignaciones, registro de pagos, etc.).

> Nota: los requisitos de paridad multiplataforma y diseño responsive aplican a los roles de **Entrenador** y **Cliente**. El rol de **Super Admin** (Fase 3) es exclusivamente web.
- **Open source friendly**: documentación clara de instalación/configuración (incluyendo setup de Supabase), variables de entorno bien definidas, sin credenciales hardcodeadas.
- **Escalabilidad**: la arquitectura debe soportar el crecimiento de número de organizaciones sin requerir refactors mayores.

## 7. Stack Tecnológico y Arquitectura

- **Monorepo** gestionado con Turborepo.
  - `apps/web`: Next.js (App Router) + TypeScript + Tailwind CSS — diseño responsive (escritorio y móvil), con soporte funcional completo tanto para el entrenador como para el cliente.
  - `apps/mobile`: React Native + Expo + TypeScript — paridad funcional respecto a la web para ambos roles (entrenador y cliente); es el canal de uso principal (~90% del tráfico esperado).
  - `packages/shared`: tipos compartidos, esquemas de validación (ej. Zod), lógica de negocio común, cliente de Supabase.
- **Backend**: Supabase como backend principal (Postgres + Auth + Storage + Realtime), con políticas de RLS para garantizar multi-tenancy.
- **Sin servidor de API separado**: la lógica server-only que lo requiera (ej. webhooks de Stripe, operaciones con service role key) se maneja mediante API routes / server actions de Next.js.
- **Pagos**: integración con Stripe para pagos automatizados, más opción de registro manual de pagos por parte del entrenador.
- **Autenticación**: Supabase Auth (email/password como mínimo; OAuth opcional a futuro).

## 8. Alcance: MVP y Fases Futuras

### MVP
- Arquitectura multi-tenant funcionando desde el inicio (RLS, `organization_id`), aunque inicialmente solo exista una organización activa (la de mi papá).
- Módulos completos: gestión de usuarios, rutinas, planes alimenticios, asignaciones (diaria/semanal/mensual/personalizada), seguimiento de progreso, registro manual de pagos, notas.
- **Web (responsive)** con funcionalidad completa para ambos roles: entrenador (gestión de clientes, rutinas, planes, asignaciones, pagos, notas) y cliente (consulta de rutinas/dietas, registro de progreso y cumplimiento, estado de membresía).
- **App móvil con la misma cobertura funcional**, dado que es el canal principal de uso (~90%). Si por tiempo es necesario priorizar, las funciones administrativas del entrenador (gestión de clientes, asignaciones, pagos) deben ir en la primera entrega del móvil, no diferirse a una fase posterior.

### Fase 2
- Integración de pagos vía Stripe (cobro automatizado de membresías).
- Notificaciones (recordatorios de pago, rutinas pendientes del día).
- Reportes/analítica para el entrenador (adherencia general, ingresos, etc.).
- Onboarding de nuevas organizaciones (registro de nuevos entrenadores) si se decide ofrecer una versión alojada.

### Fase 3
- **Panel de Super Admin (solo web)** para gestión de organizaciones, con un dashboard que incluya al menos:
  - **Recursos/infraestructura**: storage usado (total y por organización), tamaño de la base de datos, consumo respecto a los límites del plan actual de Supabase.
  - **Métricas de negocio**: número de organizaciones (activas/inactivas/en prueba), número total de usuarios (entrenadores + clientes), nuevas organizaciones por periodo.
  - **Engagement**: usuarios activos (diarios/mensuales) y número de visitas/sesiones — esto último idealmente vía una herramienta de analytics externa (ej. Plausible o PostHog), no calculado desde la base de datos de negocio.
  - **Gestión operativa**: listado de organizaciones con acciones (ver detalle, suspender/activar, eliminar).
- Posible modelo "open core": funcionalidades premium exclusivas de la versión alojada vs. la versión self-hosted.

## 9. Instrucciones para Claude Code

A partir de este brief, generar:

1. **Spec técnico detallado**, incluyendo:
   - Esquema completo de base de datos (tablas, relaciones, índices) y políticas de RLS para multi-tenancy en Supabase.
   - Estructura del monorepo (carpetas, paquetes compartidos, configuración de Turborepo).
   - Definición de las rutas/endpoints (API routes/server actions) necesarias.
   - Flujo de pantallas/wireframes de alto nivel para web y móvil, priorizando los módulos del MVP.
2. **Plan de implementación por fases**, alineado con la sección 8 (MVP, Fase 2, Fase 3), desglosado en tareas/sprints.
3. **Convenciones de código** y estrategia de migraciones de Supabase (versionado del esquema).
4. **Lista de decisiones abiertas** que requieran validación o input adicional antes de comenzar la implementación.
