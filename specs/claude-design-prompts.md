# Prompts de Diseño (Claude Design) — Open Coach

Prompts para generar las pantallas de Open Coach con **Claude** (artifacts / diseño de UI).
Alineados con la arquitectura de [`01-spec-tecnico.md`](./01-spec-tecnico.md) y las decisiones de
[`04-decisiones-abiertas.md`](./04-decisiones-abiertas.md).

## Cómo usarlos

1. Empieza por el **Prompt 0** (sistema de diseño y contexto). Define la identidad visual.
2. Continúa con los demás prompts **uno por uno, en la misma conversación**, para mantener
   coherencia visual entre pantallas.
3. Refina con instrucciones de seguimiento si hace falta (ej. "más minimalista", "más espacio en
   blanco", "agranda el botón principal").

> Sistema de diseño de referencia (ya reflejado en el código): tema **oscuro** base, acento **verde
> lima `#A3E635`** (`accent` en Tailwind/NativeWind), tipografía sans-serif, bordes redondeados,
> tarjetas espaciadas. Moneda **MXN**.

---

## Navegación (information architecture)

Coincide con `01-spec-tecnico.md §7`.

- **Cliente (móvil):** bottom tabs → `Inicio · Rutina · Dieta · Progreso · Membresía`
- **Entrenador (móvil):** bottom tabs → `Dashboard · Clientes · Plantillas · Pagos · Notas`
- **Web (ambos roles):** sidebar en escritorio (en vez de tabs); listas largas como **tabla**.
- **Super Admin:** sólo web (sidebar).

---

## Prompt 0 — Contexto general y sistema de diseño

```
Estoy diseñando la app móvil y web de Open Coach, una plataforma de gestión para
entrenadores personales (SaaS multi-tenant, open source).

Dos roles principales:
- Entrenador: gestiona clientes, rutinas, planes alimenticios, asignaciones,
  pagos y notas.
- Cliente/Alumno: consulta sus rutinas y planes asignados, registra su progreso
  (medidas, fotos, peso), marca su entrenamiento del día y ve el estado de su
  membresía.

Estilo visual: moderno y energético, orientado a fitness, diseño limpio tipo
dashboard. Modo oscuro como tema principal, con acento en verde lima (#A3E635)
para botones, indicadores de progreso y elementos de acción. Tipografía
sans-serif, bordes redondeados, tarjetas con buen espaciado, iconografía simple
tipo outline. Moneda en pesos mexicanos (MXN).

El móvil es el canal principal (~90% del uso): priorízalo. La interfaz debe
sentirse motivadora y profesional para uso diario en celular y consulta
ocasional en escritorio.
```

---

## Pantallas para Cliente (app móvil — prioridad principal)

### Prompt 1 — Home / Dashboard del cliente
```
Diseña la pantalla de inicio del Cliente en la app móvil de Open Coach. Debe
mostrar: saludo personalizado con el nombre, estado de la membresía (plan actual
y fecha de vencimiento con un badge de color), la rutina asignada para hoy con un
botón destacado para abrirla, un resumen del plan alimenticio del día, y un
acceso rápido a "Mi progreso". Usa tarjetas con jerarquía clara, priorizando la
rutina de hoy como elemento principal. Navegación inferior con 5 tabs: Inicio,
Rutina, Dieta, Progreso, Membresía.
```

### Prompt 2 — Detalle de rutina asignada
```
Diseña la pantalla de detalle de una rutina asignada al cliente. Muestra el
nombre de la rutina y la lista de ejercicios con series, repeticiones, descanso y
notas, en modo lectura (no editable por el cliente). En la parte inferior, un
botón grande y destacado "Marcar día como completado" que registra el
cumplimiento del día (no hay checkbox por ejercicio: la adherencia se mide por
día). Incluye un indicador de si el día de hoy ya fue marcado como completado.
```

### Prompt 3 — Plan alimenticio asignado
```
Diseña la pantalla de detalle del plan alimenticio asignado al cliente,
organizada por comidas (desayuno, comida, cena, snacks), mostrando alimentos y
porciones de cada una. Usa tarjetas o una lista expandible por comida, con iconos
representando los tipos de alimento. Contenido en modo lectura.
```

### Prompt 4 — Mi progreso (registro y gráficas)
```
Diseña la pantalla de seguimiento de progreso del cliente. Incluye: un formulario
rápido para registrar peso y medidas corporales con fecha, una galería de fotos
de progreso ordenadas cronológicamente (privadas), y una gráfica de línea con la
evolución del peso en el tiempo. Un botón flotante destacado para "Agregar nuevo
registro".
```

### Prompt 5 — Membresía y pagos (cliente)
```
Diseña la pantalla de estado de membresía del cliente. Muestra el plan actual
(ej. "Pro"), la fecha del próximo pago, el estado de la membresía (al día /
próximo a vencer / vencido, con badge de color) y un historial de pagos en lista.
```

---

## Pantallas para Entrenador (app móvil — uso principal hoy)

### Prompt 6 — Dashboard del entrenador
```
Diseña el dashboard principal del Entrenador en la app móvil de Open Coach.
Tarjetas de métricas arriba: número de clientes activos, clientes con pagos
pendientes (destacados en color de alerta) y adherencia promedio a las rutinas.
Debajo, accesos rápidos a Clientes, Plantillas, Pagos y Notas. Navegación inferior
con 5 tabs: Dashboard, Clientes, Plantillas, Pagos, Notas.
```

### Prompt 7 — Lista y perfil de cliente
```
Diseña dos pantallas conectadas para el Entrenador:
1. Lista de clientes: foto, nombre, plan de membresía y estado de pago (badge:
   al día / vencido / próximo a vencer).
2. Perfil del cliente (por pestañas): datos generales (edad, condición médica —
   dato sensible), rutina y plan alimenticio asignados actualmente, progreso
   (medidas y fotos), adherencia (% y calendario) e historial de pagos.
```

### Prompt 8 — Crear/editar rutina (plantilla)
```
Diseña la pantalla para crear o editar una rutina de entrenamiento como plantilla
reutilizable. Permite agregar ejercicios uno por uno (nombre, series,
repeticiones, descanso, peso/intensidad sugerida, notas, y opcionalmente
referencia a video/imagen), reordenarlos con drag and drop, y guardar la rutina
con un nombre.
```

### Prompt 9 — Asignar rutina/plan a cliente
```
Diseña la pantalla para asignar una rutina o plan alimenticio existente a uno o
varios clientes. Permite: seleccionar la plantilla de una lista, elegir uno o
varios clientes (selección múltiple) y definir la frecuencia: diaria, semanal,
mensual o personalizada (selector de rango de fechas o de días específicos de la
semana). Nota visual de que el contenido se "congela" al asignar (la asignación
guarda una copia).
```

### Prompt 10 — Registro de pagos
```
Diseña la pantalla de gestión de pagos del Entrenador: lista de clientes con su
estado de membresía (al día / vencido / próximo a vencer) resaltado con color, y
junto a cada cliente un botón rápido "Registrar pago" que abre un formulario
simple con monto (MXN), fecha y método de pago (efectivo, transferencia, etc.).
```

### Prompt 11 — Notas / ideas
```
Diseña la pantalla de notas del Entrenador: lista de notas (generales o asociadas
a un cliente) tipo libreta, con buscador arriba y botón flotante para crear una
nota. Cada nota muestra título, fecha y un fragmento del contenido.
```

---

## Versión web responsive

### Prompt 12 — Dashboard y lista de clientes (escritorio)
```
A partir del Dashboard del Entrenador y la Lista de clientes ya diseñados, genera
la versión web/escritorio responsive de Open Coach: barra de navegación lateral
(sidebar) en lugar de tabs inferiores, y aprovecha el ancho mostrando la lista de
clientes como tabla con columnas (nombre, plan, estado de pago, adherencia,
acciones) en vez de tarjetas apiladas. En móvil web se conserva el layout de tabs.
```

---

## Super Admin (sólo web — Fase 3)

### Prompt 13 — Dashboard de Super Admin
```
Diseña el dashboard de Super Admin (sólo web) de Open Coach. Incluye: tarjetas de
métricas arriba (organizaciones activas, total de usuarios de la plataforma,
storage usado vs. límite del plan), una gráfica de línea con el crecimiento de
organizaciones en el tiempo, y una tabla con el listado de organizaciones
(columnas: nombre, plan, usuarios, estado) y acciones (ver detalle,
suspender/activar, eliminar). Navegación lateral (sidebar).
```
