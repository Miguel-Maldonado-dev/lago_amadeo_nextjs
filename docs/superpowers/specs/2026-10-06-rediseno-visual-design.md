# Rediseño visual: Lago Amadeo como SaaS administrativo

Fecha: 2026-10-06
Estado: aprobado en conversación, pendiente de revisión escrita
Proyecto: `lago_amadeo_nextjs/` (Next.js 16, Tailwind 4, shadcn/ui)
Base funcional: [spec de la migración](./2026-10-05-migracion-flutterflow-nextjs-design.md). Esta spec cambia solo la capa visual.
Referencias: 8 capturas aportadas por el propietario (Domicilios, Residentes, Cuotas, Pagos, Movimientos, Reportes, Usuarios, Inicio) que definen la dirección visual: sidebar blanco con ítem activo verde, header ligero, cards blancas con borde sutil sobre fondo gris claro, metric cards con icono tintado, barra de filtros, tablas limpias con avatares, badges con punto y paginación numérica.

## 1. Objetivo y reglas

Transformar la interfaz en un producto SaaS administrativo profesional, moderno y consistente, conservando el 100 % de la funcionalidad.

Reglas fundamentales (inamovibles):
- No cambian `queries.ts`, `actions.ts`, `schemas.ts`, `messages.ts`, rutas, roles, permisos, autenticación, `proxy.ts`, Route Handlers, ni la base de datos.
- No se elimina ninguna funcionalidad ni texto de mensaje de usuario (toasts, confirmaciones, errores).
- Toda mejora funcional se limita a cálculos y filtros en cliente sobre datos ya cargados, o a lecturas con funciones de consulta que ya existen (sección 6.1).
- Antes de crear un componente, se reutiliza o refactoriza el existente conservando su API; se permiten props opcionales nuevas.
- Si durante la implementación aparece un problema que requiera cambiar comportamiento, se documenta como PROBLEMA / IMPACTO / PROPUESTA en el reporte de la tarea y no se corrige.

## 2. Tokens del sistema de diseño

Definidos como variables CSS en `src/app/globals.css` (`:root`) y expuestos a Tailwind en `@theme inline`. Tema claro único. Se eliminan los tokens `--badge-*`, `--table-header`, `--ingreso`, `--egreso` y los valores `oklch` del scaffold que no se usen; se mantienen los nombres que shadcn requiere (`--primary`, `--background`, `--card`, `--border`, `--input`, `--ring`, `--muted`, `--accent`, `--destructive`, `--popover`, `--secondary`) reasignados a esta paleta.

### 2.1 Color

| Token | Valor | Uso |
|---|---|---|
| `--primary` | `#065F46` | Botón primario, ítem activo, enlaces, saldo destacado |
| `--primary-hover` | `#054E39` | Hover de primario |
| `--primary-light` | `#E6F4EF` | Fondo tintado de iconos verdes, hover suave de filas activas |
| `--primary-foreground` | `#FFFFFF` | Texto sobre primario |
| `--success` | `#15803D` | Texto de badge e iconos positivos |
| `--success-light` | `#DCFCE7` | Fondo de badge e icono positivo |
| `--danger` | `#B91C1C` | Texto de badge negativo, botón danger, importes de egreso |
| `--danger-light` | `#FEE2E2` | Fondo de badge e icono negativo |
| `--warning` | `#B45309` | Texto de badge pendiente |
| `--warning-light` | `#FEF3C7` | Fondo de badge pendiente |
| `--info` | `#1D4ED8` | Texto de badge informativo (rol Tesorero), iconos informativos |
| `--info-light` | `#DBEAFE` | Fondo de badge e icono informativo |
| `--background` | `#F6F8FA` | Fondo de página |
| `--card` / surface | `#FFFFFF` | Cards, tablas, sidebar, header, diálogos |
| `--foreground` / text | `#111827` | Texto principal |
| `--text-secondary` | `#4B5563` | Descripciones, celdas secundarias |
| `--muted-foreground` / text muted | `#6B7280` | Labels, captions, placeholders, iconos inactivos |
| `--border` | `#E5E7EB` | Bordes de cards, inputs, separadores de filas |
| `--muted` | `#F3F4F6` | Cabecera de tabla, hover de filas, fondo de inputs deshabilitados |
| `--ring` | `#065F46` (sólido; cumple 3:1 de contraste no textual) | Anillo de foco |
| `--destructive` | `#B91C1C` | Alias de danger para shadcn |

Avatares de iniciales: 6 pares fondo/texto pastel, elegidos por hash del nombre: verde (`#DCFCE7`/`#166534`), azul (`#DBEAFE`/`#1E40AF`), violeta (`#EDE9FE`/`#5B21B6`), ámbar (`#FEF3C7`/`#92400E`), rosa (`#FCE7F3`/`#9D174D`), gris (`#F3F4F6`/`#374151`).

Clases Tailwind resultantes: `bg-primary`, `hover:bg-primary-hover`, `bg-primary-light`, `text-success`, `bg-success-light`, `text-danger`, `bg-danger-light`, `text-warning`, `bg-warning-light`, `text-info`, `bg-info-light`, `text-secondary`, `text-muted-foreground`, `bg-muted`, `border-border`.

### 2.2 Tipografía

Una sola familia: Inter (`next/font/google`, pesos 400, 500, 600, 700) en `--font-sans`. Se retira Inter Tight y la variable `--font-heading` (los componentes que la usaban pasan a `font-sans` con el peso correspondiente).

| Rol | Tamaño / interlineado | Peso | Notas |
|---|---|---|---|
| Título de página | 30 / 36 | 700 | `tracking-tight` (-0.02em) |
| Título de sección y card | 18 / 28 | 600 | |
| Título de diálogo | 18 / 28 | 600 | |
| Valor de métrica | 28 / 32 | 700 | `tabular-nums` |
| Cuerpo | 14 / 20 | 400 | Celdas, descripciones de diálogo |
| Small | 13 / 18 | 400 | Texto auxiliar de métricas, pie de tabla |
| Caption y labels | 12 / 16 | 500 | Labels de formulario y de filtros, cabecera de tabla (13 / 18, 500) |
| Botón | 14 / 20 | 500 | |
| Breadcrumb | 13 / 18 | 400 | Último segmento en `text-foreground` |

Sentence case en todas las etiquetas; sin mayúsculas sostenidas (las referencias usan "Total de unidades", no "TOTAL UNIDADES").

### 2.3 Espaciado, radios, sombras

- Escala de 4 px. Padding de página: 16 px en móvil, 24 px en tablet, 32 px en desktop. Padding de card 20 px (24 px en métricas). Gaps: 16 px entre métricas y controles, 24 px entre bloques de página.
- Radios: `--radius-sm` 6 px (badges rectangulares, chips), `--radius-md` 8 px (inputs, botones, celdas de menú), `--radius-lg` 12 px (cards, diálogos, popovers), pill `9999px` (badges de estado, avatares, ítems del sidebar usan 10 px).
- Sombras: cards sin sombra (solo borde). `--shadow-elevated: 0 4px 12px rgb(16 24 40 / 0.08)` para popovers, menús y diálogos. Botón primario sin sombra.
- Foco: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background` en todo control interactivo.
- Movimiento: solo el que responde a acciones (apertura de diálogos, menús y drawer con `tw-animate-css` ya instalado, 150–200 ms). Sin animaciones de entrada por sección. Respetar `prefers-reduced-motion` (clase `motion-reduce:transition-none` en los elementos animados).

## 3. Componentes

### 3.1 Primitivas shadcn (reestilizar en `src/components/ui/*`)

- **Button**: variantes `default` (primary, hover `primary-hover`), `secondary` (fondo blanco, borde `border`, texto `foreground`, hover `bg-muted`), `ghost`, `destructive` (danger, hover más oscuro), `link`. Tamaños: `default` 40 px, `sm` 36 px, `icon` 40×40, `icon-sm` 36×36 visuales con área de toque extendida a 40×40 (pseudo-elemento). Estado `disabled` al 50 % sin pointer. Prop `loading?: boolean` opcional que muestra un spinner (`Loader2` de lucide) y deshabilita.
- **Input, Textarea, Select trigger**: 40 px de alto, radio md, borde `border`, fondo blanco, placeholder `muted-foreground`, foco con anillo. Select con icono opcional a la izquierda (prop `icon?` en un wrapper `LabeledSelect`, sección 3.2).
- **Badge**: variantes `success`, `danger`, `warning`, `info`, `neutral`, `primary`; pill; 12 / 16 medium; prop `dot?: boolean` dibuja el punto de estado a la izquierda del mismo color del texto.
- **Card**: borde `border`, radio lg, sin sombra; `CardHeader` con título 18/600 y acción opcional a la derecha.
- **Dialog**: contenido radio lg, sombra elevada, botón cerrar en la esquina; en móvil ocupa `w-[calc(100%-32px)]` y `max-h-[85vh]` con scroll interno.
- **Sheet** (drawer del sidebar): 270 px, sin padding.
- **Table**: cabecera `bg-muted` texto 13/500 `text-secondary`; filas 48 px con separador `border-b border-border`, hover `bg-muted/60`; última fila sin borde. Sin bordes verticales.
- **Tabs**: variante segmentada: lista con gap 8; trigger inactivo blanco con borde, activo `bg-primary text-primary-foreground`; icono a la izquierda.
- **Tooltip**, **DropdownMenu**, **Avatar**, **Breadcrumb**: se añaden con `npx shadcn add`.
- **Sonner Toaster**: `theme="light"`, `richColors`, `closeButton`, posición superior derecha; iconos de lucide por variante.

### 3.2 Compartidos (`src/components/*`)

| Componente | API | Comportamiento |
|---|---|---|
| `PageHeader` | `{ title: string; description?: string; breadcrumbs: { label: string; href?: string }[]; actions?: ReactNode }` | Breadcrumb con icono `Home` enlazando a `/` como primer ítem, luego los dados; título 30/700; descripción 14 `text-secondary`; acciones a la derecha en desktop y debajo del título en móvil. |
| `MetricCard` | `{ label: string; value: string; helper?: string; icon: LucideIcon; tone?: 'primary' \| 'success' \| 'danger' \| 'info' \| 'neutral'; badge?: { text: string; tone: 'success' \| 'danger' \| 'neutral' } }` | Card con icono en círculo de 56 px tintado (`*-light` de fondo, color del tono), label 13 `text-muted-foreground`, valor 28/700, helper 13; badge de porcentaje a la derecha cuando existe. |
| `MetricGroup` | `{ items: MetricCardProps[]; columns?: 3 \| 4 }` | Grid responsive 1 / 2 / `columns`. |
| `MetricStrip` | `{ featured: MetricCardProps; items: { label; value; icon; tone }[] }` | Variante en una sola card con el valor destacado a la izquierda (valor 32/700 en `text-primary`) y los demás separados por `border-l` (solo Movimientos). En móvil se apila. |
| `FilterBar` | `{ children: ReactNode; onClear?: () => void; clearLabel?: string }` | Card con `flex-wrap gap-3`; el buscador crece (`flex-1 min-w-[240px]`); botón secundario "Limpiar filtros" (icono `FilterX`) solo si `onClear`. |
| `SearchInput` | `{ value; onChange; placeholder; id? }` | Input controlado con icono `Search`, 40 px, sin debounce interno: cada vista aplica `useDebouncedValue` al filtrar, de modo que "Limpiar" vacía el texto al instante. |
| `LabeledSelect` | `{ label: string; icon?: LucideIcon; value: string \| null; onChange; options: { value; label }[]; placeholder?; allLabel?: string }` | Label 12/500 arriba del Select; `allLabel` crea la opción "Todos" (valor `__all__` → `null`). |
| `Avatar` (wrapper) | `{ name: string \| null; size?: 'sm' \| 'md' \| 'lg' }` | Iniciales (primera letra de las dos primeras palabras; una si solo hay una; "?" si vacío) sobre el par de color por hash; 28 / 36 / 44 px. Exporta `initialsOf(name)` y `avatarTone(name)` puros para pruebas. |
| `PersonCell` | `{ name: string \| null; secondary?: string }` | Avatar `sm` + nombre (14/500) + texto secundario opcional. "Sin información" en `text-muted-foreground` sin avatar cuando `name` es nulo o igual a `'Sin información'`. |
| `StatusBadge` | `{ status: string \| null }` (misma API) | Mapea sobre `Badge dot`: `Pagado`, `Al corriente`, `Activo`, `Ingreso` → success; `Pendiente` → warning; `Vencido`, `Moroso`, `Inactivo`, `Egreso` → danger; `Administrador` → primary; `Tesorero` → info; otro → neutral. Texto = status. |
| `Money` | misma API | Mismo contrato (`+ $x` success, `- $x` danger, `$x`), 14/500 `tabular-nums`. |
| `DataTable<T>` | `{ columns: Column<T>[]; rows: T[]; getRowKey; pageSize?: 10; pageSizeOptions?: [10, 25, 50]; entityLabel: string; emptyTitle?; emptyDescription?; emptyAction?: ReactNode; toolbar?: ReactNode }` con `Column<T> = { key; header; cell; className?; sortValue?: (row: T) => string \| number \| null; align?: 'left' \| 'right'; hideBelow?: 'md' \| 'lg' }` | Orden por columna cuando `sortValue` existe (icono `ChevronsUpDown`/`ChevronUp`/`ChevronDown`, click en cabecera, `aria-sort`); selector "Filas por página"; pie "Mostrando X a Y de N {entityLabel}"; paginación numérica con primero, anterior, páginas (ventana de 5 con elipsis), siguiente, último; en móvil (`md:hidden`) solo anterior, "Página X de Y", siguiente. Reinicia a página 1 al cambiar `rows` o el orden. `hideBelow` añade `hidden md:table-cell` / `hidden lg:table-cell` a cabecera y celdas. Contenedor con `overflow-x-auto`. Vacío → `EmptyState` con `emptyAction`. Se elimina `onRowClick` (la navegación va en `RowActions`). |
| `RowActions` | `{ items: { label: string; icon?: LucideIcon; onSelect?: () => void; href?: string; tone?: 'default' \| 'danger'; disabled?: boolean }[]; label?: string }` | Botón `icon-sm` ghost con `MoreVertical` y `DropdownMenu` alineado a la derecha; ítems con `href` renderizan `Link`. |
| `FormDialog` | `{ title; description?; trigger?; open; onOpenChange; children; footer?: ReactNode; size?: 'sm' \| 'md' \| 'lg' }` | Header (título, descripción), cuerpo con scroll, footer con borde superior donde los diálogos colocan "Cancelar" (secondary) y la acción primaria. Anchos 440 / 560 / 720. |
| `ConfirmDialog` | misma API + `tone?: 'danger' \| 'default'` (default `danger`) | Botón de confirmación `destructive` cuando `tone === 'danger'`; icono `AlertTriangle` en círculo `danger-light` junto al título. |
| `EmptyState` | `{ title?; description?; icon?: LucideIcon; action?: ReactNode }` | Icono en círculo `bg-muted` 48 px, título 16/600, descripción 14 `text-secondary`, acción debajo. Defaults actuales se conservan. |
| `ErrorState` | `{ title?: string; description?: string; onRetry?: () => void }` | Icono `AlertCircle` en `danger-light`; botón "Reintentar" secondary. Usado por `error.tsx`. |
| `TableSkeleton` / `MetricsSkeleton` / `PageSkeleton` | `{ rows?: number; columns?: number }` / `{ count?: 3 \| 4 }` / `{ metrics?: boolean }` | Esqueletos para `loading.tsx` de cada ruta. |
| `SectionCard` | `{ title: string; description?: string; action?: ReactNode; children }` | Card para secciones del detalle de domicilio y bloques de reportes. |
| `CopyButton` | `{ value: string; label?: string }` | Botón `icon-sm` ghost con `Copy`, copia al portapapeles y muestra `Check` 1,5 s; toast no. |
| `SearchableSelect` | misma API | Reestilizado con los tokens (trigger 40 px, popover con sombra elevada). |
| `DonutChart` | `{ segments: { label: string; value: number; color: 'success' \| 'danger' \| 'info' \| 'warning' }[]; total: number; centerLabel: string; centerValue: string }` | SVG inline (sin librería), 180 px, grosor 22, leyenda a la derecha con valor y porcentaje. Solo se usa en Inicio. |
| `BrandLogo` | `{ size?: number; withText?: boolean }` | SVG inline: círculo `primary` con silueta de montaña blanca y lago en `primary-light`; texto "Lago Amadeo" 18/600 `text-primary` y "Administración" 13 `text-muted-foreground`. |

Patrón de diálogos de formulario (sin cambiar lógica): el cuerpo lleva los campos en `grid gap-4` (dos columnas en `md` cuando hay 4 o más campos cortos), labels 12/500 con asterisco en `text-danger`, errores 12 en `text-danger`; el footer lleva "Cancelar" + botón primario con `loading` mientras envía. Los textos de botones existentes se conservan.

## 4. Layout

### 4.1 Shell

- **Sidebar** (`lg+`): 270 px, `bg-card`, `border-r`. Cabecera con `BrandLogo withText` (padding 24). Nav con padding horizontal 12, ítems de 44 px, radio 10 px, icono 20 px a la izquierda, texto 14/500 `text-secondary`, icono `text-muted-foreground`; hover `bg-muted`; activo `bg-primary text-primary-foreground` (icono blanco). Pie con `border-t`: `Avatar md` del usuario, nombre 14/500, rol 12 `text-muted-foreground`, botón ghost `LogOut` con `aria-label="Cerrar sesión"` (form de la acción `logout` existente).
- **Header**: 64 px, `bg-card`, `border-b`. Izquierda: botón hamburguesa (`lg:hidden`) que abre el `Sheet` con el mismo contenido del sidebar; título "Panel de Administración" 16/600 (oculto bajo `sm` cuando no cabe, se muestra `BrandLogo` compacto). Derecha: `Avatar sm` del usuario con `Tooltip` que muestra nombre y rol. Sin buscador ni notificaciones (no existen en la arquitectura).
- **Contenido**: `bg-background`, `max-w-[1400px] mx-auto`, padding 16 / 24 / 32, `space-y-6`.
- `loading.tsx` de `(app)` usa `PageSkeleton`; cada ruta añade su propio `loading.tsx` con el esqueleto adecuado (métricas + tabla, o tabla sola).
- `error.tsx` usa `ErrorState` con "Ocurrió un error" / "Reintentar". `not-found.tsx` usa `EmptyState` con "No encontrado" y acción "Volver al inicio".

### 4.2 Estructura de página

Todas las páginas de lista: `PageHeader` → métricas (si aplica) → `FilterBar` → card de tabla (`DataTable` dentro de `Card` sin padding). Textos de descripción por página:

| Página | Título | Descripción | Acción primaria (misma lógica y gating actual) |
|---|---|---|---|
| `/` | Inicio | Resumen general del fraccionamiento Lago Amadeo. | — |
| `/domicilios` | Domicilios | Gestiona los domicilios del fraccionamiento Lago Amadeo. | + Nuevo Domicilio |
| `/domicilios/[id]` | `direccion` | Detalle del domicilio y su historial. | Editar (abre `EditDomicilioDialog`) |
| `/residentes` | Residentes | Consulta los residentes del fraccionamiento Lago Amadeo. | — |
| `/cuotas` | Cuotas | Gestiona las cuotas de mantenimiento del fraccionamiento Lago Amadeo. | + Generar Cuotas (Administrador, Tesorero) |
| `/pagos` | Pagos | Consulta y administra los pagos del fraccionamiento Lago Amadeo. | + Pago Extra (Administrador, Tesorero) |
| `/movimientos` | Movimientos Financieros | Consulta y administra los movimientos financieros del fraccionamiento Lago Amadeo. | + Nuevo Movimiento (Administrador, Tesorero) |
| `/reportes` | Reportes | Consulta y genera reportes del fraccionamiento Lago Amadeo. | — |
| `/usuarios` | Usuarios | Gestiona los usuarios del sistema Lago Amadeo. | + Nuevo Usuario |

Breadcrumbs: Inicio (icono) / Título de página; en el detalle: Inicio / Domicilios / `direccion`.

## 5. Pantallas

### 5.1 Inicio
- `MetricGroup columns=4`: Saldo actual (`saldo_actual`, tono primary, icono `Wallet`), Ingresos acumulados (`total_ingresos`, success, `ArrowUp`), Egresos acumulados (`total_egresos`, danger, `ArrowDown`), Unidades totales (conteo de `domicilios_info`, info, `Building2`). Las tres primeras muestran badge de variación "vs. mes anterior" calculada en cliente: `ingresos_mes` contra `ingresos_mes_anterior` y `egresos_mes` contra `egresos_mes_anterior`; para el saldo, la variación neta del mes (`(ingresos_mes - egresos_mes)` contra `(ingresos_mes_anterior - egresos_mes_anterior)`). Formato `+5.2 %` / `-3.1 %`; cuando el mes anterior es 0, se muestra "Sin datos del mes anterior" en el helper y no hay badge. El tono del badge es success si la variación favorece (ingresos y saldo suben, egresos bajan) y danger en caso contrario.
- Fila de dos cards: **Últimos movimientos** (`SectionCard` con acción "Ver todos" → `/movimientos`; tabla compacta de 5 filas: Fecha, Concepto (descripción truncada a 40 caracteres con `title`), Tipo (`StatusBadge`), Importe (`Money`)) y **Estado de cuotas** (`DonutChart` con segmentos "Al corriente" y "Morosos" a partir de `estatus` de `domicilios_info`; centro: total y "Unidades"; acción "Ver todas" → `/domicilios`).
- Lecturas: `getResumenFinanciero`, `listMovimientos` (se toman las 5 primeras, ya vienen ordenadas por id desc), `listDomicilios`. Todas existen; se cargan en paralelo.

### 5.2 Domicilios
- Métricas (3) calculadas sobre `rows`: Total de unidades (`Building2`, primary), Al corriente (`Home`, success, badge `% = alCorriente/total`), Morosos (`Home`, danger, badge `%`). Con 0 filas: valores 0 y sin badges.
- `FilterBar`: `SearchInput` "Buscar por dirección o residente..." (filtra `direccion` y `residente_principal`, sin acentos ni mayúsculas), `LabeledSelect` Estatus (Todos los estatus / Al corriente / Moroso), `LabeledSelect` Fecha de registro (Todas las fechas / Último mes / Último año, sobre `fecha_alta` comparado con `todayISO()`), "Limpiar".
- Tabla: Dirección (orden), Fecha de Registro (`formatDate`, orden por `fecha_alta`, `hideBelow md`), Residente Principal (`PersonCell`, orden), Estatus (`StatusBadge`, orden), Acciones (`RowActions` con "Ver detalle" → `/domicilios/{id}`). `entityLabel="domicilios"`. Las métricas usan las filas filtradas.
- Diálogo "Nuevo Domicilio" con el patrón de formulario (2 columnas en `md`: Dirección ocupa fila completa; Fecha de Registro y Tipo de Cuota Mensual lado a lado; Observaciones fila completa).

### 5.3 Detalle de domicilio
- `PageHeader` con breadcrumb de tres niveles, título = `direccion`, descripción fija, acción "Editar" (secondary, icono `Pencil`) que abre el diálogo de edición existente.
- Card de información en grid de 4 datos: Fecha de registro, Tipo de cuota mensual, Estatus (`StatusBadge`), Observaciones (o "Sin observaciones").
- Secciones como `SectionCard` en este orden y con sus acciones actuales: Accesos (dos sub-bloques "Números de acceso" y "Acceso peatonal" lado a lado en `md`, ítems como chips con `Phone`/`CreditCard`, lápiz y papelera), Residentes, Cuotas, Pagos extra. Las tablas de secciones usan el mismo estilo de `Table` (sin paginación, como hoy) y `RowActions` o botones `icon-sm` ghost para editar/eliminar; "Pagar" y "Recibo" se mantienen como botones `sm` (primary y secondary respectivamente).
- Gating por rol intacto.

### 5.4 Residentes
- `FilterBar`: `SearchInput` "Buscar por nombre, teléfono o domicilio..." (cliente), `SearchableSelect` de domicilio (URL, como hoy), "Limpiar filtros" (limpia texto y URL).
- Tabla: Dirección (orden), Residente (`PersonCell`, orden), Teléfono (`—` si nulo), Principal (`Check` en círculo `success-light` cuando `es_principal`; `hideBelow md`). Sin columna de estatus ni acciones. `entityLabel="residentes"`.

### 5.5 Cuotas
- Métricas (3) sobre las filas filtradas por estatus: Total de registros (`FileText`, primary, helper "del periodo seleccionado"), Importe total (`CircleDollarSign`, success, suma de `importe_cuota`, helper "Mes Año" del periodo), Pendientes (`AlertCircle`, danger, conteo de `estatus === 'Pendiente' || 'Vencido'`, badge `%`).
- `FilterBar`: `LabeledSelect` Año y Mes (URL, como hoy), `LabeledSelect` Estatus (cliente, como hoy), "Limpiar filtros" (reinicia a periodo actual).
- Tabla: Dirección, Periodo, Concepto (`hideBelow md`), Importe (`Money`, derecha), Vencimiento (`hideBelow lg`), Estatus (`StatusBadge`). Orden en todas. Sin acciones (como hoy). `entityLabel="cuotas"`.
- Diálogo "Generar Cuotas" con el patrón de formulario.

### 5.6 Pagos
- Métricas (3) sobre las filas filtradas: Total de pagos (`CreditCard`, primary), Importe recaudado (`DollarSign`, success, suma de `importe`), Pagos extra (`FileText`, info, conteo `tipo_pago_id === 2`). Helper "del conjunto filtrado".
- `FilterBar`: `SearchInput` "Buscar por referencia, concepto o domicilio...", `LabeledSelect` Año y Mes derivados de `fecha_pago` (opciones = años presentes en las filas; meses 1–12 con nombre), `LabeledSelect` Concepto (opciones = conceptos distintos presentes), "Limpiar filtros". Todo en cliente.
- Tabla: Referencia (truncada a 8 caracteres + "…" con `title` completo y `CopyButton`), Concepto, Domicilio, Importe (`Money`, derecha), Fecha de Pago (`hideBelow md`), Acciones (botón "Recibo" secondary `sm` con icono `FileText` = `ReciboButton` reestilizado). `entityLabel="pagos"`.
- Diálogos de pago (cuota y extra) con el patrón: cabecera de datos de solo lectura en grid de 2 columnas dentro de un bloque `bg-muted` con radio md; campos debajo.

### 5.7 Movimientos
- `MetricStrip`: destacado Saldo actual (`Landmark`, `saldo_actual` de la vista, siempre global); ítems Ingresos del conjunto (`ArrowUp`, success), Egresos del conjunto (`ArrowDown`, danger), Total de movimientos (`FileText`, neutral), calculados sobre las filas filtradas.
- `FilterBar`: `SearchInput` "Buscar por referencia o descripción...", `LabeledSelect` Año, Mes (de `fecha_movimiento`), Tipo (Ingreso / Egreso), "Limpiar filtros".
- Tabla: Tipo (icono `ArrowUp`/`ArrowDown` en círculo tintado + `StatusBadge`), Descripción (truncada a 60 con `title`), Importe (`Money`, derecha), Fecha (`hideBelow md`). Sin acciones. `entityLabel="movimientos"`.

### 5.8 Reportes
- `Tabs` segmentadas con iconos: `UserRound` Pagos por Usuario, `Car` Acceso Vehicular, `Footprints` Acceso Peatonal. Misma lógica de URL.
- Filtros de cada pestaña dentro de `FilterBar` con `LabeledSelect` (Usuario, Año, Mes) e inputs de fecha con label; botón "Buscar" primary con icono `Search`; "Limpiar filtros" secondary. Controles de export ("Salida" + "Descargar CSV", "ID Inicio" + "Descargar TXT") a la derecha de la barra, con los mismos estados habilitado/deshabilitado.
- Pestaña 1: `MetricCard` Total (`Receipt`, primary, helper "en el periodo seleccionado") y tabla Referencia (icono `FileText` + referencia completa en 13 `tabular-nums`), Usuario, Método de Pago, Importe (`Money` con `variant="ingreso"` cuando `importe > 0`, sin variante si es 0), Fecha de Pago, Acciones (Recibo). Pestañas 2 y 3: tablas con `hideBelow` en las columnas secundarias.

### 5.9 Usuarios
- `FilterBar`: `SearchInput` "Buscar por nombre o email..." (cliente), `LabeledSelect` Estado (Activos / Inactivos, URL como hoy), "Limpiar filtros".
- Tabla: Nombre (`PersonCell` con email como secundario en móvil; columna Email separada en `md+`), Rol (`StatusBadge` del rol), Estatus (`StatusBadge` "Activo"/"Inactivo" derivado de `is_active`), Acciones: lápiz (editar), papelera (desactivar, solo activos y no el propio usuario; `ConfirmDialog` danger), `RotateCcw` (activar, solo inactivos). Mismos permisos y mensajes.

### 5.10 Login
- Fondo `background`; card de 440 px con `BrandLogo` grande centrado, título "Bienvenido" 24/700, subtítulo "Inicia sesión en el panel de administración", campos con labels, botón primario de ancho completo con `loading`, mensaje de error en bloque `danger-light` con icono. Textos de error y pie actuales se conservan.

## 6. Reglas de implementación

### 6.1 Lecturas y cálculos permitidos
- Permitido: filtrar, ordenar, agrupar, sumar y contar en cliente sobre filas ya cargadas; leer en una página con funciones de `queries.ts` que ya existen (Inicio añade `listMovimientos` y `listDomicilios`).
- Prohibido: funciones de consulta nuevas, cambios en SQL, nuevas tablas o vistas, cambios en `actions.ts`.

### 6.2 Compatibilidad
- Todas las pruebas existentes siguen pasando. Las que afirman clases concretas de badge se actualizan a las nuevas (`bg-success-light`, etc.).
- `StatusBadge`, `Money`, `EmptyState`, `FormDialog`, `ConfirmDialog`, `SearchableSelect`, `DataTable` conservan sus props actuales; `DataTable` elimina `onRowClick` (único consumidor: Domicilios, que pasa a `RowActions`) y exige `entityLabel`.
- Los mensajes de usuario (toasts, confirmaciones, errores de validación) no cambian de texto.
- Frontera servidor→cliente: los componentes que reciben iconos (`LucideIcon`) o funciones (`MetricCard`, `RowActions`, `Column.cell`, `DonutChart`) se instancian desde componentes servidor sin `'use client'` o desde componentes cliente que importan ellos mismos los iconos. Nunca se pasa un icono ni una función como prop de un componente servidor a uno cliente (lección del bug del shell: solo datos serializables cruzan la frontera).

### 6.3 Responsive
- Breakpoints Tailwind: `sm` 640, `md` 768, `lg` 1024. Sidebar visible desde `lg`. Métricas 1 / 2 / N columnas. `FilterBar` apila bajo `md`. Tablas con `overflow-x-auto` y `hideBelow`. Diálogos a ancho completo bajo `sm`. Botón de acción primaria de `PageHeader` a ancho completo bajo `sm`.

### 6.4 Accesibilidad
- Contraste mínimo 4.5:1 en texto (los pares de color de 2.1 lo cumplen). Foco visible en todos los controles. Labels asociados con `htmlFor`/`id` (incluido `SearchableSelect` vía `aria-labelledby`). Botones de icono con `aria-label`. Cabeceras ordenables con `aria-sort` y accionables por teclado. Áreas táctiles mínimas de 40 px.

### 6.5 Rendimiento
- Sin librerías nuevas salvo las 4 primitivas shadcn. Filtros y métricas memoizados con `useMemo`. Iconos importados por nombre desde `lucide-react`. Sin imágenes raster; el logotipo es SVG inline.

## 7. Pruebas

- Nuevas: `avatar.test.tsx` (`initialsOf`: "Miguel Hernández" → "MH", "Ulises" → "U", "" → "?"; `avatarTone` determinista), `metric-card.test.tsx` (label, valor, badge), `page-header.test.tsx` (breadcrumbs y título), `data-table.test.tsx` ampliado (orden asc/desc por `sortValue`, cambio de filas por página a 25 muestra 25, texto "Mostrando 1 a 10 de 25 domicilios", paginación móvil), `status-badge.test.tsx` actualizado con los nuevos estados y clases, `row-actions.test.tsx` (abre menú y ejecuta `onSelect`), `filter-bar.test.tsx` (botón limpiar llama `onClear`).
- Páginas con filtros en cliente: pruebas de las funciones puras de filtrado y métricas extraídas a `features/<dominio>/components/*-filters.ts` (Domicilios: estatus y fecha; Pagos: año/mes/concepto y sumas; Movimientos: tipo y sumas; Cuotas: métricas; Inicio: variación porcentual).
- Validación final: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.

## 8. Fuera de alcance

Buscador global, notificaciones, estatus de residentes, alta de residentes desde `/residentes`, botón Recibo en Movimientos, distribución de egresos por categoría, gráficas mensuales, drawers laterales, modo oscuro, cambios en consultas, acciones, esquemas, rutas, roles o base de datos.

## 9. Orden de implementación

1. Tokens, tipografía y primitivas shadcn (Button, Input, Select, Badge, Card, Dialog, Table, Tabs, Sonner) + nuevas primitivas.
2. Componentes compartidos nuevos y refactor de los existentes, con pruebas.
3. Shell: sidebar, header, drawer, `BrandLogo`, estados globales (`loading`, `error`, `not-found`), login.
4. Domicilios (lista) como pantalla patrón.
5. Detalle de domicilio y sus secciones.
6. Residentes, Cuotas.
7. Pagos, Movimientos.
8. Reportes, Usuarios.
9. Inicio.
10. Revisión global de consistencia, accesibilidad, responsive y validaciones.
