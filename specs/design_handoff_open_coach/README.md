# Handoff: Open Coach — UI completa (cliente móvil, entrenador web, super admin)

## Overview
Open Coach es una plataforma SaaS **multi-tenant** para la gestión de entrenadores personales (web Next.js + móvil Expo + backend Supabase). Este paquete contiene las propuestas de pantalla de alta fidelidad para tres superficies:

1. **App móvil del cliente** — Inicio, Rutina, Dieta, Progreso, Membresía (+ 2 variaciones de Inicio).
2. **Web del entrenador (escritorio)** — Dashboard, Clientes, editor de Rutinas, editor de Dietas, Asignación de plan.
3. **Acceso y administración** — Login móvil, Login web, Dashboard de Super Admin (multi-tenant).

## About the Design Files
Los archivos de este bundle son **referencias de diseño hechas en HTML** (prototipos que muestran el aspecto y comportamiento previstos), **no código de producción para copiar tal cual**.

El archivo `Open Coach.dc.html` es un *Design Component* — un único HTML que renderiza todas las pantallas como "frames" sobre un lienzo gris, agrupadas por sección. Necesita su runtime `support.js` (incluido) para abrirse en el navegador; **no lo portes a tu app**, úsalo solo como referencia visual. Ábrelo en un navegador para inspeccionar medidas, colores y copy exactos.

La tarea es **recrear estos diseños en el entorno real de Open Coach** (Next.js + React para web, Expo/React Native para móvil), usando los componentes, tokens y patrones ya establecidos en el repo. Si una parte aún no tiene base de componentes, elige el patrón más consistente con el resto del código.

## Fidelity
**Alta fidelidad (hi-fi).** Colores, tipografía, espaciado y estados son finales y deben recrearse con fidelidad de píxel, adaptándolos a los componentes existentes del codebase. Los datos (nombres, montos en MXN, fechas) son de ejemplo.

---

## Design Tokens

### Color
| Token | Hex | Uso |
|---|---|---|
| Acento (lima) | `#A3E635` | CTA primarios, activos, datos positivos, marca |
| Lima claro | `#BEF264` | gradientes de marca |
| Lima oscuro | `#65A30D` / `#84CC16` | gradientes, hover |
| Fondo base | `#0A0A0A` | fondo de app / superficies oscuras |
| Superficie 1 | `#0F0F11` | sidebars, inputs internos |
| Superficie 2 | `#18181B` | tarjetas, filas |
| Superficie 3 (head tabla) | `#1C1C1F` | cabeceras de tabla |
| Borde | `#27272A` / `#232326` | bordes de tarjeta e inputs |
| Borde sutil | `#1F1F22` / `#1C1C1F` | divisores |
| Texto principal | `#FAFAFA` | títulos y valores |
| Texto secundario | `#A1A1AA` | descripciones |
| Texto terciario | `#71717A` | labels, metadatos |
| Texto deshabilitado | `#52525B` | inactivo, iconos apagados |
| Ámbar (alerta/macros grasa) | `#FBBF24` | pendiente, en riesgo, grasas |
| Azul (carbohidratos) | `#60A5FA` | macro carbohidratos |
| Rojo (peligro/churn) | `#EF4444` | vencido, churn, eliminar |
| Avatares (gradientes) | rosa `#F472B6→#BE185D`, azul `#60A5FA→#1D4ED8`, naranja `#FB923C→#C2410C`, violeta `#A78BFA→#6D28D9` | iniciales de usuario |

Gradiente de marca/hero: `linear-gradient(150deg,#1A2E05 0%,#0F1503 55%,#0A0A0A 100%)` con halo `radial-gradient(circle, rgba(163,230,53,.2), transparent 70%)`.
Tintes de acento sobre oscuro: relleno `rgba(163,230,53,.10–.14)`, borde `rgba(163,230,53,.25–.30)`.

### Tipografía
- **Display / números / títulos UI:** `Space Grotesk` (500–700). Títulos con `letter-spacing:-0.02em`.
- **Cuerpo / texto general:** `Plus Jakarta Sans` (400–800).
- Escala observada: valores KPI 28px/700; títulos de sección 20–24px/700; títulos de tarjeta 14–15px/600; cuerpo 13–14px; labels 11–12px/700 con `letter-spacing:.03–.04em` y a veces `text-transform:uppercase`.
- Labels de móvil de tab: 10px/600–700.

### Radio de borde
- Tarjetas: 16–22px · Inputs/botones: 11–15px · Píldoras/badges: 999px · Marco de teléfono: 38px interno / 46px externo · Iconos en cuadro: 9–14px.

### Sombra
- Frames (teléfono/navegador): `0 40px 80px -30px rgba(0,0,0,.5)` (web) y `0 0 0 2px #2A2A2A, 0 40px 70px -28px rgba(0,0,0,.55)` (teléfono).
- FAB lima: `0 10px 24px -6px rgba(163,230,53,.5)`.
- Modal: `0 40px 90px -20px rgba(0,0,0,.7)`.

### Espaciado
Padding de tarjeta 14–18px; gap entre tarjetas 12–14px; padding de pantalla móvil 18px lateral; padding de contenido web 24–26px. Sidebar web 230px de ancho; topbar 64px de alto; chrome de navegador 42px.

### Iconografía
SVG outline, `stroke-width` 1.9–2, `stroke-linecap/linejoin:round`, viewBox 24×24. (En implementación, sustituir por la librería de iconos del repo — p. ej. lucide-react — manteniendo el estilo outline.)

---

## Screens / Views

### A. App móvil del cliente (marco 360×760, tabs inferiores)
Tab bar fija: **Inicio · Rutina · Dieta · Progreso · Membresía**. Item activo en `#A3E635`, inactivos en `#52525B`. Barra superior de estado simulada (9:41 + iconos). Indicador de gesto inferior 120×4px `#3F3F46`.

1. **Inicio — Opción A (tarjetas).** Saludo + avatar; tarjeta de estado de membresía ("Plan Pro · vence 28 jun" + badge "Al día"); **hero de rutina de hoy** sobre gradiente lima-oscuro con CTA lima "Abrir rutina"; dos tarjetas (Dieta hoy / Mi progreso).
2. **Inicio — Opción B (cabecera lima).** Bloque superior lima (`linear-gradient(160deg,#BEF264,#A3E635,#84CC16)`) con saludo, badge de plan y **anillo de adherencia semanal** (conic-gradient, "5/6"); cuerpo en lista (rutina/dieta como filas) + tira de adherencia semanal (L–D con checks). *Las opciones A y B son variaciones del mismo Inicio: elegir una.*
3. **Detalle de rutina.** Header con back; chips (6 ejercicios / 45 min / Pendiente); lista de ejercicios con series/reps/descanso (solo lectura para el cliente); CTA lima "Marcar día como completado".
4. **Dieta.** Header "Definición — 1 850 kcal"; barras de macros P/C/G; comidas (una expandida con alimentos+gramaje, resto colapsadas con kcal).
5. **Progreso.** Tarjeta de peso con **gráfica de área** (SVG) y delta "−2.4 kg · 30 días"; registro rápido (peso/cintura/fecha); galería de fotos de progreso (3 columnas, aspect 3/4); FAB lima para añadir registro. Badge "Privado".
6. **Membresía.** Tarjeta de plan sobre gradiente ("Pro", "$650 MXN/mes", próximo pago); historial de pagos (filas con check, fecha, método, monto).

### B. Web del entrenador (ventana de navegador 1340px de ancho, alto 760)
Layout: chrome de navegador → sidebar 230px (`#0F0F11`) + main. Sidebar: logo, nav (**Dashboard · Clientes(24) · Plantillas · Pagos · Mensajes**), tarjeta de perfil al pie ("Carlos Méndez · Entrenador", avatar lima). Item activo con fondo `rgba(163,230,53,.12)` y texto lima. Topbar 64px con buscador/breadcrumb + acciones.

1. **Dashboard.** Saludo + botón lima "Nuevo cliente". 4 KPIs (Clientes activos 24, Ingresos del mes $15 600 MXN, Adherencia 81%, Pagos pendientes 3). Grid: **gráfica de barras de ingresos a 6 meses** (barras grises → última en lima) + panel "Pagos por vencer" (lista con avatar y monto, CTA secundario).
2. **Clientes.** Buscador + botón "Nuevo". Tabs de segmento (Todos 24 / Activos 21 / En riesgo 2 / Inactivos 1) como píldoras (activa lima sólida). **Tabla**: columnas `2.2fr 1.1fr 1.4fr 1.1fr 0.9fr 40px` → Cliente (avatar+nombre+email), Plan, **Adherencia (barra + %)**, Próximo pago, Estado (badge), menú "⋮". Fila inactiva atenuada.
3. **Rutinas (editor de plantilla).** Breadcrumb Plantillas › Rutinas; acciones "Vista previa" + "Guardar plantilla". Rail de días 212px (input de nombre, lista de días 1–4, "Añadir día"). Panel de ejercicios: grid `30px 1fr 70px 70px 80px 34px` con handle de arrastre, nombre, **series/reps/descanso como inputs** (cajas `#0F0F11`), eliminar; botón punteado "Añadir ejercicio".
4. **Dietas (editor de plantilla).** Input de nombre + objetivos de macros (P/C/G en cajas de color). Comidas colapsables; comida expandida con filas `1fr 90px 34px` (alimento / cantidad / eliminar) y "Añadir alimento"; "Añadir comida".
5. **Asignar a cliente.** **Modal centrado 620px** sobre página atenuada (overlay `rgba(0,0,0,.6)` + blur). Header con avatar y nombre del cliente; selects de **Rutina** y **Dieta** (borde lima activo, icono+título+metadatos); fila de **Inicia** (fecha) + **Duración** (semanas); toggle "Notificar por la app" (activo, lima); footer Cancelar / **Asignar plan** (lima, 2:1).

### C. Acceso y administración
1. **Login móvil (360×760).** Bloque superior con logo lima en cuadro 72px y tagline; formulario (correo, contraseña con ojo, "¿Olvidaste tu contraseña?"); CTA lima "Iniciar sesión"; separador "o"; botón "Continuar con Google"; pie "Pide tu invitación".
2. **Login web (920px).** Split: panel de marca 46% (gradiente lima-oscuro, logo, tagline grande en Space Grotesk, 2 stats) + panel de formulario (correo, contraseña, "Recordarme" + olvido, CTA lima). Chrome de navegador, alto 580.
3. **Super Admin · Dashboard (1340px).** Sidebar con **badge "SUPER ADMIN"** (estrella, lima); nav (**Resumen · Tenants(38) · Usuarios · Facturación · Sistema**); perfil "Soporte OC · Administrador". Topbar con badge "Sistemas operativos" + selector de rango. 4 KPIs (Tenants activos 38, Usuarios totales 1 284, MRR $45 600 MXN, Churn 2.1% con icono rojo). **Tabla de tenants** (`2fr 1.2fr 1fr 1fr 0.9fr`): Tenant (avatar+nombre+email), Plan (Studio/Solo), Clientes, Alta, Estado (Activo/Prueba/Suspendido).

---

## Interactions & Behavior
- **Navegación móvil:** tabs inferiores cambian de pantalla; el item activo se pinta lima.
- **CTAs primarios:** fondo `#A3E635`, texto `#0A0A0A`, Space Grotesk 700. Hover sugerido: oscurecer ~6% (`#94D426`) o bajar opacidad a .92.
- **Filas de tabla:** hover sugerido fondo `#1C1C1F`; menú "⋮" abre acciones (editar/asignar/archivar).
- **Editor de rutina/dieta:** filas reordenables (handle de 6 puntos), inputs numéricos inline, botones punteados para añadir, "Guardar plantilla" persiste.
- **Asignación:** modal con overlay; selects abren picker de plantillas; toggle de notificación; "Asignar plan" confirma y cierra.
- **Adherencia:** representada como barra `height:6px` con relleno lima (o ámbar si <50%, gris si inactivo) y % en Space Grotesk 700.
- **Estados de badge:** Activo = lima; Pendiente/En riesgo/Prueba = ámbar; Inactivo/Suspendido = gris (`#27272A` + borde `#3F3F46`); Vencido = rojo.

## State Management (orientativo, ajustar al repo)
- **Cliente:** rutina/dieta del día, % adherencia semanal, registros de progreso (peso/medidas/fotos), estado de membresía y próximo pago.
- **Entrenador:** lista de clientes (con plan, adherencia, próximo pago, estado), plantillas de rutina (días→ejercicios) y dieta (comidas→alimentos+macros), asignaciones (cliente + rutina + dieta + fechas), KPIs e ingresos.
- **Super Admin:** tenants (plan, nº clientes, estado, alta), métricas de plataforma (MRR, churn, usuarios).
- Datos vía Supabase con RLS por tenant (ver specs del repo). Las cifras del mock son placeholders.

## Assets
- **Fuentes:** Space Grotesk y Plus Jakarta Sans (Google Fonts). En producción, cargarlas con `next/font` o el equivalente del repo.
- **Iconos:** todos son SVG outline inline (mancuerna/logo, casa, dumbbell, hoja/dieta, gráfica, tarjeta, usuarios, edificio/tenant, campana, engranaje, estrella, etc.). Sustituir por la librería de iconos del proyecto manteniendo el estilo outline 2px.
- **Imágenes:** ninguna real; las fotos de progreso son placeholders con gradiente — reemplazar por imágenes subidas por el usuario.
- **Logo:** marca tipográfica "Open Coach" + glifo de mancuerna en cuadro lima.

## Files
- `Open Coach.dc.html` — todas las pantallas (referencia visual; ábrelo en navegador).
- `support.js` — runtime necesario solo para abrir el HTML. No portar.

> Recomendación: abre `Open Coach.dc.html` en el navegador y usa las DevTools para copiar valores exactos (paddings, hex, tamaños) de cualquier elemento mientras implementas.
