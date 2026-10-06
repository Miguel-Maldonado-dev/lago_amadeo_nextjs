# Plan de implementación: rediseño visual SaaS de Lago Amadeo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar a la app Next.js de Lago Amadeo la apariencia de un SaaS administrativo profesional (tokens, primitivas, shell y las 10 pantallas) conservando intacta toda la funcionalidad.

**Architecture:** Refactor en sitio. Nuevos tokens en `globals.css`; primitivas shadcn reestilizadas; componentes compartidos nuevos (`PageHeader`, `MetricCard`, `FilterBar`, `DataTable` v2, `RowActions`, `Avatar`…) con la misma API que los actuales más props opcionales; cada página se migra al patrón breadcrumb → título → acciones → métricas → filtros → tabla. Toda mejora funcional es cálculo o filtro en cliente sobre datos ya cargados, o lecturas con funciones de consulta que ya existen.

**Tech Stack:** Next.js 16.3.8, React 19, Tailwind CSS 4, shadcn/ui (Radix), lucide-react, sonner, Vitest 5 + Testing Library. Sin dependencias nuevas salvo 4 primitivas shadcn.

**Spec:** `docs/superpowers/specs/2026-10-06-rediseno-visual-design.md` (base funcional: `2026-10-05-migracion-flutterflow-nextjs-design.md`).

## Global Constraints

- **No hacer commits ni `git add`**; no levantar el servidor. Verificación: `npm test && npm run typecheck && npm run lint` por tarea; `npm run build` en la última.
- **No cambian** `src/features/**/{queries,actions,schemas,messages}.ts`, `src/app/api/**`, `src/proxy.ts`, `src/lib/auth/**`, `src/lib/supabase/**`, rutas, roles ni BD. Un cambio de comportamiento detectado se documenta como PROBLEMA / IMPACTO / PROPUESTA en el reporte y no se implementa.
- **Toda prueba existente sigue en verde** (44 archivos / 196 tests al inicio). Solo se editan pruebas que afirman clases visuales antiguas (`bg-badge-*`, `text-ingreso`, `text-egreso`) o props eliminadas (`onRowClick`).
- **Textos de usuario intactos**: toasts, confirmaciones, errores de validación, etiquetas de botones existentes. Textos nuevos (descripciones de página, placeholders) son los de la spec, en español y sentence case.
- **Tokens** (spec §2.1), Tailwind: `bg-primary`, `hover:bg-primary-hover`, `bg-primary-light`, `text-success`/`bg-success-light`, `text-danger`/`bg-danger-light`, `text-warning`/`bg-warning-light`, `text-info`/`bg-info-light`, `text-secondary`, `text-muted-foreground`, `bg-muted`, `border-border`, `bg-background`, `bg-card`. Prohibidos tras la Tarea 2: `bg-badge-*`, `text-badge-*`, `bg-table-header`, `text-ingreso`, `text-egreso`, `font-heading`.
- **Tipografía**: una sola familia Inter (`--font-sans`); escala de la spec §2.2; sin mayúsculas sostenidas.
- **Radios**: inputs/botones `rounded-md` (8), cards/diálogos `rounded-lg` (12), badges/avatares `rounded-full`, ítems del sidebar `rounded-[10px]`. **Sombras**: cards sin sombra; popovers/diálogos `shadow-elevated`.
- **Foco**: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` en todo control. **Movimiento**: solo en respuesta a acciones; `motion-reduce:transition-none`.
- **Frontera servidor→cliente**: nunca pasar iconos (`LucideIcon`) ni funciones como props de un componente servidor a uno cliente. `MetricCard`, `RowActions`, `DonutChart`, `Column.cell` se usan desde servidor sin `'use client'` o desde clientes que importan sus propios iconos.
- **Rendimiento** (skill `vercel-react-best-practices`, leer `.claude/skills/vercel-react-best-practices/SKILL.md` antes de escribir componentes cliente): derivados con `useMemo`, sin `useEffect` para derivar estado, iconos importados por nombre, cargas de página en `Promise.all`.
- **Accesibilidad**: labels con `htmlFor`/`id`, botones de icono con `aria-label`, cabeceras ordenables con `aria-sort` y `button`, áreas táctiles ≥ 40 px.
- **Pruebas colocadas** `*.test.tsx`; Testing Library; polyfills Radix ya en `src/test/setup.ts`.

## Review Focus

1. **Porcentajes con 0 registros**: métricas de Domicilios, Cuotas y Pagos con `rows = []` muestran `0` y ningún badge, sin `NaN %`. → prueba en Tarea 6 (`domicilios-metrics`).
2. **Búsqueda sin acentos ni mayúsculas**: `"hernandez"` encuentra "Miguel Hernández". → prueba `normalize` en Tarea 6.
3. **Orden con nulos**: filas con `sortValue` nulo van al final en asc y desc. → prueba en Tarea 4.
4. **Filtro de fecha en frontera**: "Último mes" incluye exactamente la fecha de hace un mes y excluye la de hace un mes y un día, con reloj fijo. → prueba en Tarea 6.
5. **Iniciales con nombres irregulares**: `"  ana   lopez "` → `"AL"`, `"ulises"` → `"U"`, `null` → `"?"`. → prueba en Tarea 2.

---

## Mapa de archivos

```
src/app/globals.css, src/app/layout.tsx
src/components/ui/{button,input,textarea,select,badge,card,dialog,sheet,table,tabs,sonner}.tsx   (reestilizar)
src/components/ui/{dropdown-menu,avatar,breadcrumb,tooltip}.tsx                                  (añadir con shadcn)
src/components/{status-badge,money,empty-state,error-state,avatar,person-cell,brand-logo,copy-button,section-card,skeletons}.tsx
src/components/{page-header,metric-card,metric-group,metric-strip,filter-bar,search-input,labeled-select,searchable-select}.tsx
src/components/{data-table,row-actions,form-dialog,confirm-dialog,donut-chart}.tsx
src/components/layout/{sidebar,sidebar-content,nav-list,mobile-nav,app-bar}.tsx
src/lib/{initials,percent,search}.ts
src/app/(app)/{layout,loading,error,not-found}.tsx y un loading.tsx por ruta
src/features/<dominio>/components/*  (tablas, filtros, diálogos, secciones) y *-filters.ts puros
```

---

### Tarea 1: Tokens, tipografía y primitivas shadcn

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`
- Modify: `src/components/ui/{button,input,textarea,select,badge,card,dialog,sheet,table,tabs,sonner}.tsx`
- Create (shadcn): `src/components/ui/{dropdown-menu,avatar,breadcrumb,tooltip}.tsx`
- Test: `src/app/globals.test.ts`

**Interfaces:**
- Produces: variables CSS de la spec §2.1 en `:root` y sus colores Tailwind en `@theme inline` (`--color-primary-hover`, `--color-primary-light`, `--color-success`, `--color-success-light`, `--color-danger`, `--color-danger-light`, `--color-warning`, `--color-warning-light`, `--color-info`, `--color-info-light`, `--color-text-secondary` → clase `text-secondary`), `--shadow-elevated` → `shadow-elevated`, `--radius` = `12px` con `--radius-md` = 8 px y `--radius-sm` = 6 px.
- Produces: `Button` variantes `default | secondary | ghost | destructive | link` (se elimina `outline`; `secondary` = blanco con borde) y tamaños `default` (h-10) | `sm` (h-9) | `icon` (size-10) | `icon-sm` (size-9); prop `loading?: boolean`.
- Produces: `Badge` variantes `success | danger | warning | info | neutral | primary` + prop `dot?: boolean`.
- Produces: `Input`/`Textarea`/`SelectTrigger` de 40 px; `Table` con cabecera `bg-muted` y filas de 48 px; `Tabs` variante segmentada (`TabsList` sin fondo, `TabsTrigger` blanco con borde, activo `bg-primary text-primary-foreground`); `Dialog` radio lg + `shadow-elevated` + móvil `w-[calc(100%-32px)] max-h-[85vh]`; `Toaster` con `closeButton`.

- [ ] **Paso 1: Prueba fallida de tokens**

`src/app/globals.test.ts` (Node, lee el archivo con `fs`):
```ts
test('globals.css define los tokens del sistema', () => {
  const css = readFileSync(fileURLToPath(new URL('./globals.css', import.meta.url)), 'utf8')
  for (const [name, value] of [['--primary', '#065F46'], ['--primary-hover', '#054E39'], ['--primary-light', '#E6F4EF'], ['--success', '#15803D'], ['--success-light', '#DCFCE7'], ['--danger', '#B91C1C'], ['--danger-light', '#FEE2E2'], ['--warning', '#B45309'], ['--warning-light', '#FEF3C7'], ['--info', '#1D4ED8'], ['--info-light', '#DBEAFE'], ['--background', '#F6F8FA'], ['--foreground', '#111827'], ['--text-secondary', '#4B5563'], ['--muted-foreground', '#6B7280'], ['--border', '#E5E7EB'], ['--muted', '#F3F4F6']])
    expect(css).toMatch(new RegExp(`${name}:\\s*${value}`, 'i'))
  for (const old of ['--badge-success', '--table-header', '--ingreso', '--egreso', '--font-heading', '.dark {'])
    expect(css).not.toContain(old)
})
```
Run: `npx vitest run src/app/globals.test.ts` → FAIL.

- [ ] **Paso 2: Tokens y fuente**

`globals.css`: reescribir `:root` con la tabla de la spec §2.1 (hex exactos), `--radius: 12px`, `--shadow-elevated: 0 4px 12px rgb(16 24 40 / 0.08)`, `--ring: rgb(6 95 70 / 0.4)`, `--destructive: #B91C1C`, `--input: #E5E7EB`, `--accent: #F3F4F6`, `--secondary: #FFFFFF`, `--popover: #FFFFFF`; `@theme inline` con los nuevos `--color-*`, `--shadow-elevated`, `--radius-sm: 6px`, `--radius-md: 8px`, `--radius-lg: 12px` (quitar los `calc`), eliminar `--font-heading`, `--color-badge-*`, `--color-table-header`, `--color-ingreso`, `--color-egreso`, `@custom-variant dark` y cualquier bloque `.dark`. Pares de avatar como `--avatar-1-bg/fg … --avatar-6-bg/fg` (valores spec §2.1) expuestos como `--color-avatar-N` / `--color-avatar-N-foreground`. `body { @apply bg-background text-foreground; }`.
`layout.tsx`: solo `Inter({ variable: '--font-sans', subsets: ['latin'], weight: ['400','500','600','700'] })`; quitar `Inter_Tight`; `Toaster` con `richColors closeButton position="top-right"`.

- [ ] **Paso 3: Primitivas**

```bash
npx shadcn@4.21.2 add -y dropdown-menu avatar breadcrumb tooltip
```
Reestilizar según Interfaces: `button.tsx` (variantes/tamaños indicados; `secondary` = `border-border bg-card text-foreground hover:bg-muted`; `destructive` = `bg-danger text-white hover:bg-danger/90`; `loading` muestra `<Loader2 className="animate-spin" />` y `disabled`), `input.tsx`/`textarea.tsx`/`select.tsx` (`h-10 rounded-md border-border bg-card placeholder:text-muted-foreground`, foco del Global Constraints), `badge.tsx` (cva con las 6 variantes `bg-*-light text-*`, `primary` = `bg-primary-light text-primary`, `neutral` = `bg-muted text-secondary`; `rounded-full px-2.5 py-0.5 text-xs font-medium`; `dot` renderiza `<span className="size-1.5 rounded-full bg-current" />`), `card.tsx` (`rounded-lg border border-border bg-card shadow-none`), `dialog.tsx`, `sheet.tsx`, `table.tsx` (`TableHeader` `bg-muted` + `TableHead` `h-11 text-[13px] font-medium text-secondary`; `TableRow` `h-12 border-b border-border hover:bg-muted/60 last:border-0`), `tabs.tsx` (variante segmentada por defecto), `sonner.tsx`. Cualquier referencia a `dark:` en estos archivos se elimina.

- [ ] **Paso 4: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → PASS (las pruebas que afirman `bg-badge-*`/`text-ingreso` siguen pasando porque `StatusBadge`/`Money` aún no cambian).

---

### Tarea 2: Compartidos de identidad y estado

**Files:**
- Create: `src/lib/initials.ts`, `src/components/{avatar,person-cell,brand-logo,copy-button,section-card,skeletons,error-state}.tsx`
- Modify: `src/components/{status-badge,money,empty-state}.tsx`
- Test: `src/lib/initials.test.ts`, `src/components/{status-badge,money,empty-state,error-state,copy-button}.test.tsx`; actualizar `src/features/domicilios/components/domicilios-table.test.tsx:46` y `src/features/movimientos/components/movimientos-table.test.tsx` a las clases nuevas.

**Interfaces:**
- Produces (`src/lib/initials.ts`): `initialsOf(name: string | null | undefined): string` (dos primeras palabras → primera letra mayúscula de cada una; una palabra → una letra; vacío/nulo → `'?'`; espacios múltiples y bordes ignorados); `avatarTone(name: string | null | undefined): 1 | 2 | 3 | 4 | 5 | 6` (hash determinista: suma de `charCode` módulo 6 más 1; nulo → 6).
- Produces: `Avatar({ name, size = 'md' })` → `span` circular `bg-avatar-N text-avatar-N-foreground` 28/36/44 px con `aria-hidden` y `title={name}`; `PersonCell({ name, secondary? })` (sin avatar y en `text-muted-foreground` cuando `name` es nulo o `'Sin información'`).
- Produces: `StatusBadge({ status })` sobre `Badge dot` con el mapeo de la spec §3.2 (`Pagado`, `Al corriente`, `Activo`, `Ingreso` → `success`; `Pendiente` → `warning`; `Vencido`, `Moroso`, `Inactivo`, `Egreso` → `danger`; `Administrador` → `primary`; `Tesorero` → `info`; otro → `neutral`); exporta `statusVariant(status): BadgeVariant`.
- Produces: `Money({ value, variant? })` misma API; clases `text-success` / `text-danger`, `font-medium tabular-nums`.
- Produces: `EmptyState({ title?, description?, icon?: LucideIcon, action?: ReactNode })` (defaults actuales; icono por defecto `Inbox`); `ErrorState({ title = 'Ocurrió un error', description = 'No fue posible cargar la información. Intenta de nuevo.', onRetry? })` con botón "Reintentar" secondary.
- Produces: `SectionCard({ title, description?, action?, children, className? })`; `CopyButton({ value, label = 'Copiar' })` (`navigator.clipboard.writeText`, icono `Copy` → `Check` 1500 ms, `aria-label`); `BrandLogo({ size = 40, withText = false })` SVG inline (círculo `fill-primary`, montaña blanca, lago `fill-primary-light`), texto "Lago Amadeo" / "Administración".
- Produces: `TableSkeleton({ rows = 8, columns = 5 })`, `MetricsSkeleton({ count = 3 })`, `PageSkeleton({ metrics = true })` en `skeletons.tsx`.

- [ ] **Paso 1: Pruebas fallidas**

`initials.test.ts`: `'Miguel Hernández'` → `'MH'`; `'Ulises'` → `'U'`; `'  ana   lopez '` → `'AL'`; `''`, `null` → `'?'`; `avatarTone('Ana') === avatarTone('Ana')` y está en 1..6; `avatarTone(null) === 6`.
`status-badge.test.tsx`: reescribir la tabla a `['Pagado','bg-success-light'], ['Al corriente','bg-success-light'], ['Activo','bg-success-light'], ['Pendiente','bg-warning-light'], ['Vencido','bg-danger-light'], ['Moroso','bg-danger-light'], ['Inactivo','bg-danger-light'], ['Administrador','bg-primary-light'], ['Tesorero','bg-info-light']`; otro → `bg-muted`; null → texto vacío.
`money.test.tsx`: `text-ingreso` → `text-success`, `text-egreso` → `text-danger`.
`empty-state.test.tsx`: renderiza título, descripción y `action`. `error-state.test.tsx`: "Reintentar" llama `onRetry`. `copy-button.test.tsx`: mock `navigator.clipboard.writeText`, click → llamado con `value`.
Actualizar `domicilios-table.test.tsx:46` a `bg-danger-light` y `movimientos-table.test.tsx` a `text-danger`/`text-success`.
Run → FAIL.

- [ ] **Paso 2: Implementar** los archivos listados.

- [ ] **Paso 3: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → PASS. `grep -rn "bg-badge\|text-ingreso\|text-egreso\|bg-table-header" src` → sin resultados en `src/components`.

---

### Tarea 3: Encabezado, métricas y filtros compartidos

**Files:**
- Create: `src/lib/percent.ts`, `src/components/{page-header,metric-card,metric-group,metric-strip,filter-bar,search-input,labeled-select}.tsx`
- Modify: `src/components/searchable-select.tsx`
- Test: `src/lib/percent.test.ts`, `src/components/{page-header,metric-card,filter-bar,labeled-select}.test.tsx`

**Interfaces:**
- Produces (`percent.ts`): `percentOf(part: number, total: number): number | null` (`null` si `total <= 0`; redondeo a 1 decimal); `formatPercent(value: number | null, { sign = false } = {}): string` (`null` → `'—'`; `96.2` → `'96.2 %'`; con `sign`: `'+5.2 %'`, `'-3.1 %'`, `0` → `'0 %'`); `variation(current: number, previous: number): number | null` (`null` si `previous === 0`; `(current - previous) / |previous| * 100`).
- Produces: `PageHeader({ title, description?, breadcrumbs, actions? })` — breadcrumb shadcn con primer ítem `Home` → `/` (`aria-label="Inicio"`), ítems `{ label, href? }`, último sin enlace; `h1` 30/700 `tracking-tight`; acciones `flex-col sm:flex-row` a la derecha en `md+`.
- Produces: `MetricCard({ label, value, helper?, icon, tone = 'primary', badge? })` (`tone` ∈ `primary | success | danger | info | neutral`; icono 56 px `bg-{tone}-light text-{tone}`, neutral = `bg-muted text-secondary`; badge `Badge` sin dot con `tone` `success | danger | neutral`); `MetricGroup({ items, columns = 3 })` grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-{columns}`; `MetricStrip({ featured, items })`.
- Produces: `FilterBar({ children, onClear?, clearLabel = 'Limpiar filtros' })`; `SearchInput({ value, onChange, placeholder, delay = 300, id?, 'aria-label'? })`; `LabeledSelect({ id, label, icon?, value, onChange, options, placeholder = 'Seleccionar', allLabel? })` (valor `__all__` ↔ `null`, label con `htmlFor={id}`).
- Produces: `SearchableSelect` misma API más `id?` y `'aria-labelledby'?`.

- [ ] **Paso 1: Pruebas fallidas**

`percent.test.ts`: `percentOf(152, 158) === 96.2`; `percentOf(0, 0) === null`; `formatPercent(3.8) === '3.8 %'`; `formatPercent(5.23, { sign: true }) === '+5.2 %'`; `formatPercent(-3.14, { sign: true }) === '-3.1 %'`; `formatPercent(null) === '—'`; `variation(105, 100) === 5`; `variation(50, 0) === null`.
`page-header.test.tsx`: renderiza `h1` "Domicilios", breadcrumb con enlace "Inicio" a `/` y texto "Domicilios"; `actions` presente.
`metric-card.test.tsx`: label "Al corriente", valor "152", badge "96.2 %" con clase `bg-success-light`; sin `badge` no renderiza badge.
`filter-bar.test.tsx`: con `onClear` muestra "Limpiar filtros" y lo llama al click; sin `onClear` no hay botón.
`labeled-select.test.tsx`: label asociado por `htmlFor`; con `allLabel: 'Todos los estatus'` seleccionar esa opción llama `onChange(null)`.
Run → FAIL.

- [ ] **Paso 2: Implementar.** `SearchInput` usa `useDebouncedValue` de `src/lib/use-debounced-value.ts`.

- [ ] **Paso 3: Verificar** → `npm test && npm run typecheck && npm run lint` PASS.

---

### Tarea 4: DataTable v2, RowActions y diálogos base

**Files:**
- Modify: `src/components/{data-table,form-dialog,confirm-dialog}.tsx`
- Create: `src/components/row-actions.tsx`
- Modify: `src/features/domicilios/components/domicilios-table.tsx` (sustituir `onRowClick` por columna Acciones con `RowActions` "Ver detalle")
- Test: `src/components/{data-table,row-actions,confirm-dialog}.test.tsx`, `src/features/domicilios/components/domicilios-table.test.tsx`

**Interfaces:**
- Produces: `Column<T> = { key: string; header: string; cell: (row: T) => ReactNode; className?: string; sortValue?: (row: T) => string | number | null; align?: 'left' | 'right'; hideBelow?: 'md' | 'lg' }`.
- Produces: `DataTable<T>({ columns, rows, getRowKey, pageSize = 10, pageSizeOptions = [10, 25, 50], entityLabel = 'registros', emptyTitle?, emptyDescription?, emptyAction?, toolbar? })` (`entityLabel` opcional con default para que las tablas existentes sigan compilando; las Tareas 6–12 lo fijan en cada tabla). Orden: click en cabecera con `sortValue` alterna asc → desc → sin orden; nulos al final en ambos sentidos; comparación `localeCompare('es', { numeric: true })` para strings. Pie: "Mostrando {desde} a {hasta} de {total} {entityLabel}" (total 0 → `EmptyState`), `LabeledSelect`-like "Filas por página", botones `icon-sm` secondary primero/anterior/siguiente/último (`ChevronsLeft`, `ChevronLeft`, `ChevronRight`, `ChevronsRight`, `aria-label`s "Primera página", "Página anterior", "Página siguiente", "Última página"), páginas numéricas (ventana: actual ±2, siempre 1 y última, `…` como texto), activa `bg-primary text-primary-foreground`. Bajo `md` solo anterior / "Página X de Y" / siguiente. Reinicia a página 1 al cambiar `rows`, orden o tamaño. Sin `onRowClick`.
- Produces: `RowActions({ items, label = 'Acciones' })` con `items: { label; icon?; onSelect?; href?; tone?: 'default' | 'danger'; disabled? }[]`; trigger `Button size="icon-sm" variant="ghost"` con `MoreVertical` y `aria-label={label}`; `DropdownMenuItem` con `asChild` + `Link` cuando hay `href`; `tone: 'danger'` → `text-danger`.
- Produces: `FormDialog({ title, description?, trigger?, open, onOpenChange, children, footer?, size = 'md' })` (anchos `sm:max-w-[440px] | [560px] | [720px]`; `footer` en `DialogFooter` con `border-t`); `ConfirmDialog` misma API + `tone = 'danger'` (icono `AlertTriangle` en círculo `bg-danger-light text-danger`; botón `destructive` cuando danger, `default` si no).

- [ ] **Paso 1: Pruebas fallidas**

`data-table.test.tsx` (mantener las actuales de paginación y vacío; cambiar `onRowClick` por nada; añadir): orden por columna "Nombre" asc → primera fila "Ana", desc → "Zoe", nulos al final en ambos; `pageSizeOptions` → elegir 25 muestra 25 filas de 30 y "Mostrando 1 a 25 de 30 domicilios"; `entityLabel` en el pie; botón "Última página" lleva a la última; `hideBelow: 'md'` añade `hidden md:table-cell` a cabecera y celda.
`row-actions.test.tsx`: abre el menú, muestra "Ver detalle" como enlace con `href="/domicilios/5"`, y un ítem con `onSelect` lo invoca.
`confirm-dialog.test.tsx` (mantener 2 actuales; añadir): con `tone="danger"` el botón de confirmar tiene `data-variant="destructive"`.
`domicilios-table.test.tsx`: sustituir la prueba de click en fila por "la fila muestra un menú de acciones con Ver detalle".
Run → FAIL.

- [ ] **Paso 2: Implementar.** En `domicilios-table.tsx` solo cambiar `onRowClick` → columna Acciones con `RowActions` (el rediseño completo de la tabla es la Tarea 6). Las demás tablas no se tocan: siguen compilando gracias al default de `entityLabel`.

- [ ] **Paso 3: Verificar** → PASS.

---

### Tarea 5: Shell, estados globales y login

**Files:**
- Modify: `src/components/layout/{sidebar,sidebar-content,nav-list,mobile-nav,app-bar}.tsx`, `src/app/(app)/{layout,loading,error,not-found}.tsx`, `src/features/auth/components/login-form.tsx`, `src/app/(auth)/login/page.tsx`
- Test: `src/components/layout/sidebar-content.test.tsx`, `src/features/auth/components/login-form.test.tsx` (ajustar textos nuevos)

**Interfaces:**
- Consumes: `BrandLogo`, `Avatar`, `ErrorState`, `EmptyState`, `PageSkeleton`, `Tooltip`, `Sheet`, `visibleNavItems(roleName)`, `ShellUser`.
- Produces: `SidebarContent({ user, onNavigate? })` con cabecera `BrandLogo withText`, `NavList` (ítems 44 px, `rounded-[10px]`, activo `bg-primary text-primary-foreground`, inactivo `text-secondary [&_svg]:text-muted-foreground hover:bg-muted`), pie con `Avatar md`, nombre, rol y botón logout `aria-label="Cerrar sesión"`. `AppBar({ user })`: hamburguesa `lg:hidden` (`aria-label="Abrir menú"`), "Panel de Administración" (`hidden sm:block`), `Avatar sm` con `Tooltip` "{userName} · {roleName}". Layout: `<main className="mx-auto w-full max-w-[1400px] p-4 md:p-6 lg:p-8">`.
- Produces: `error.tsx` → `ErrorState onRetry={reset}`; `not-found.tsx` → `EmptyState` título "No encontrado", descripción "La página que buscas no existe o fue movida.", acción `Button asChild` "Volver al inicio"; `loading.tsx` → `PageSkeleton`.
- Produces: login: card 440 px, `BrandLogo size={64}` centrado, "Bienvenido" 24/700, "Inicia sesión en el panel de administración", campos con `Label`, botón `loading` ancho completo, error en bloque `bg-danger-light text-danger` con `AlertCircle`; textos de error y pie actuales intactos.

- [ ] **Paso 1: Pruebas fallidas**

`sidebar-content.test.tsx` (mock `next/navigation` `usePathname` → `/domicilios`): muestra "Lago Amadeo", "Administración", nombre y rol; el enlace "Domicilios" tiene `aria-current="page"` y clase `bg-primary`; con rol Comite no hay enlace "Usuarios".
`login-form.test.tsx`: mantener las aserciones actuales; añadir que renderiza "Bienvenido".
Run → FAIL.

- [ ] **Paso 2: Implementar.**

- [ ] **Paso 3: Verificar** → PASS.

---

### Tarea 6: Domicilios (pantalla patrón)

**Files:**
- Create: `src/lib/search.ts`, `src/features/domicilios/components/domicilios-filters.ts`, `src/features/domicilios/components/domicilios-view.tsx`, `src/app/(app)/domicilios/loading.tsx`
- Modify: `src/features/domicilios/components/{domicilios-table,add-domicilio-dialog,domicilio-form}.tsx`, `src/app/(app)/domicilios/page.tsx`
- Test: `src/lib/search.test.ts`, `src/features/domicilios/components/domicilios-filters.test.ts`, `domicilios-table.test.tsx`

**Interfaces:**
- Produces (`src/lib/search.ts`): `normalize(s: string | null | undefined): string` (minúsculas, sin diacríticos vía `normalize('NFD')` + quitar `\p{M}`, espacios colapsados); `matches(haystack: (string | null | undefined)[], query: string): boolean` (query vacía → `true`).
- Produces (`domicilios-filters.ts`, puro): `type FechaFiltro = 'todas' | 'ultimo-mes' | 'ultimo-anio'`; `filterDomicilios(rows: DomicilioInfo[], f: { query: string; estatus: string | null; fecha: FechaFiltro; today: string }): DomicilioInfo[]` (fecha: `fecha_alta >= shiftISO(today, { months: -1 })` / `{ years: -1 }`, inclusivo; `shiftISO` interno sobre partes de la fecha sin `Date` de zona horaria); `domiciliosMetrics(rows): { total: number; alCorriente: number; morosos: number; pctAlCorriente: number | null; pctMorosos: number | null }`.
- Produces: `DomiciliosView({ rows, conceptos })` (cliente): estado `query`, `estatus`, `fecha`; `useMemo` para filtradas y métricas; renderiza `MetricGroup` (Total de unidades `Building2` primary; Al corriente `Home` success + badge `formatPercent(pctAlCorriente)`; Morosos `Home` danger + badge `formatPercent(pctMorosos)` tono danger si > 0), `FilterBar` (`SearchInput` "Buscar por dirección o residente...", `LabeledSelect` "Estatus" `allLabel="Todos los estatus"` opciones Al corriente/Moroso, `LabeledSelect` "Fecha de registro" opciones Todas las fechas/Último mes/Último año, `onClear`), y `DomiciliosTable rows={filtradas}`.
- Produces: `DomiciliosTable({ rows })`: columnas Dirección (`sortValue` direccion), Fecha de Registro (`formatDate`, `sortValue` fecha_alta, `hideBelow 'md'`), Residente Principal (`PersonCell`, `sortValue`), Estatus (`StatusBadge`, `sortValue`), Acciones (`RowActions` "Ver detalle" href `/domicilios/{id}`, icono `Eye`); `entityLabel="domicilios"`; `emptyAction` = `AddDomicilioDialog` no (la acción vive en el header) → `emptyDescription` "Registra el primer domicilio con el botón Nuevo Domicilio."
- Page: `PageHeader` (breadcrumb Domicilios, descripción spec §4.2, `actions={<AddDomicilioDialog conceptos />}`) + `DomiciliosView`. `AddDomicilioDialog` usa `FormDialog` con `footer` (Cancelar + "Guardar" `loading`); `DomicilioForm` recibe `formId` y renderiza en grid 2 columnas en `md` (Dirección y Observaciones a ancho completo); su botón interno se retira y el footer envía con `form={formId}`.

- [ ] **Paso 1: Pruebas fallidas**

`search.test.ts`: `normalize('  Miguel  Hernández ') === 'miguel hernandez'`; `matches(['AMADEO 1006','Ever Hernandez'], 'hernandez') === true`; `matches(['x'], '') === true`.
`domicilios-filters.test.ts` (today `'2026-10-05'`): `filterDomicilios` con `estatus: 'Moroso'` deja solo morosos; `query: 'hernández'` encuentra residente "Ever Hernandez"; `fecha: 'ultimo-mes'` incluye `fecha_alta: '2026-09-05'` y excluye `'2026-09-04'`; `fecha: 'ultimo-anio'` incluye `'2025-10-05'` y excluye `'2025-10-04'`; `domiciliosMetrics([])` → `{ total: 0, alCorriente: 0, morosos: 0, pctAlCorriente: null, pctMorosos: null }`; con 152 al corriente y 6 morosos → `pctAlCorriente 96.2`, `pctMorosos 3.8`.
`domicilios-table.test.tsx`: columnas presentes; badge Moroso `bg-danger-light`; ordenar por Dirección invierte el orden; menú "Ver detalle".
Run → FAIL.

- [ ] **Paso 2: Implementar** + `loading.tsx` con `PageSkeleton`.

- [ ] **Paso 3: Verificar** → PASS.

---

### Tarea 7: Diálogos de formulario al patrón FormDialog v2

**Files:**
- Modify: `src/features/domicilios/components/edit-domicilio-dialog.tsx`, `src/features/accesos/components/numero-dialog.tsx`, `src/features/residentes/components/residente-dialog.tsx`, `src/features/cuotas/components/{generar-cuotas-dialog,generar-cuota-domicilio-dialog,editar-cuota-dialog}.tsx`, `src/features/pagos/components/{registrar-pago-cuota-dialog,registrar-pago-extra-dialog,recibo-dialog}.tsx`, `src/features/movimientos/components/registrar-movimiento-dialog.tsx`, `src/features/usuarios/components/{add-user-dialog,edit-user-dialog}.tsx`
- Test: `src/features/pagos/components/recibo-dialog.test.tsx` (mantener), `src/features/domicilios/components/domicilio-form.test.tsx` (mantener)

**Interfaces:**
- Consumes: `FormDialog` con `footer`, `Button loading`, `Label`, `Input`, `Select`, `Textarea`.
- Patrón (idéntico en los 12 diálogos; sin tocar lógica, mensajes, acciones ni validaciones): `form id` único por diálogo; campos en `grid gap-4` (2 columnas en `md` cuando hay ≥ 4 campos cortos); `Label` 12/500 con `*` en `text-danger` para obligatorios; error 12 `text-danger` bajo el campo; footer con `Button variant="secondary"` "Cancelar" (cierra) y el botón primario con su texto actual, `type="submit" form={formId} loading={isSubmitting}`. Cabeceras de solo lectura (pago cuota/extra) en bloque `rounded-md bg-muted p-4 grid grid-cols-2 gap-3` con labels 12 y valores 14/500. `ReciboDialog`: `size="lg"`, cuerpo `bg-[#444444]` solo alrededor del iframe, footer con "Descargar" (secondary) e "Imprimir" (default). `EditarCuotaDialog` muestra el descuento/recargo aplicado como `Badge neutral` con botón "Quitar" `destructive` `sm`.

- [ ] **Paso 1: Prueba de guarda** — correr la suite completa antes de tocar nada: `npm test` → 100 % verde (línea base).
- [ ] **Paso 2: Refactorizar** los 12 diálogos al patrón, uno por uno, corriendo `npx vitest run <su test>` cuando exista.
- [ ] **Paso 3: Verificar** → `npm test && npm run typecheck && npm run lint` PASS; `grep -rn "DialogFooter\|<Button type=\"submit\"" src/features` muestra que todos los submit viven en el footer de `FormDialog`.

---

### Tarea 8: Detalle de domicilio

**Files:**
- Modify: `src/app/(app)/domicilios/[id]/page.tsx`, `src/features/domicilios/components/domicilio-info-card.tsx`, `src/features/accesos/components/{accesos-section,acceso-item}.tsx`, `src/features/residentes/components/{residentes-section,residente-actions}.tsx`, `src/features/cuotas/components/cuotas-section.tsx`, `src/features/pagos/components/pagos-extra-section.tsx`
- Create: `src/app/(app)/domicilios/[id]/loading.tsx`

**Interfaces:**
- Consumes: `PageHeader`, `SectionCard`, `StatusBadge`, `Money`, `RowActions`, `Table` reestilizada, `EmptyState`, `EditDomicilioDialog`.
- Page: `PageHeader` breadcrumbs `[{ label: 'Domicilios', href: '/domicilios' }, { label: direccion }]`, título `direccion`, descripción "Detalle del domicilio y su historial.", acción `EditDomicilioDialog` con trigger `Button variant="secondary"` + `Pencil` "Editar". `DomicilioInfoCard` → `Card` con grid `sm:grid-cols-2 lg:grid-cols-4` de pares label/valor: Fecha de registro, Tipo de cuota mensual (`?? 'Sin asignar'`), Estatus (`StatusBadge`), Observaciones (`?? 'Sin observaciones'`); sin botón "Volver" (lo sustituye el breadcrumb). Secciones como `SectionCard` con `action` = botón existente (Agregar Número/Tarjeta/Residente, Crear Cuota, Pago Extra) respetando `puedeGestionar` y límites; accesos como lista de chips (`rounded-md border bg-card px-3 py-2` con icono `Phone`/`CreditCard`, valor 14/500 `tabular-nums`, botones `icon-sm` ghost lápiz y papelera); tablas de residentes/cuotas/pagos extra con `Table` reestilizada, `PersonCell` en Residentes, `Money` en importes, acciones por fila con botones `icon-sm` ghost (`aria-label`) y los botones "Pagar" (`default sm`) / "Recibo" (`secondary sm`) actuales. Textos y gating intactos.

- [ ] **Paso 1: Línea base** → `npm test` verde.
- [ ] **Paso 2: Implementar** página, info card, cuatro secciones y `loading.tsx` (`PageSkeleton metrics={false}`).
- [ ] **Paso 3: Verificar** → PASS; `grep -n "Volver" "src/app/(app)/domicilios/[id]/page.tsx" src/features/domicilios/components/domicilio-info-card.tsx` sin resultados.

---

### Tarea 9: Residentes y Cuotas

**Files:**
- Create: `src/features/residentes/components/residentes-view.tsx`, `src/features/cuotas/components/cuotas-metrics.ts`, `src/app/(app)/residentes/loading.tsx`, `src/app/(app)/cuotas/loading.tsx`
- Modify: `src/features/residentes/components/{residentes-table,domicilio-filter}.tsx`, `src/app/(app)/residentes/page.tsx`, `src/features/cuotas/components/{cuotas-table,periodo-filter,cuotas-view}.tsx`, `src/app/(app)/cuotas/page.tsx`
- Test: `src/features/cuotas/components/cuotas-metrics.test.ts`, `cuotas-table.test.tsx` (mantener + orden), `src/features/residentes/components/residentes-view.test.tsx`

**Interfaces:**
- Produces: `ResidentesView({ rows, domicilios, domicilioId })` (cliente): `SearchInput` "Buscar por nombre, teléfono o domicilio..." (`matches` sobre `nombre`, `telefono`, `direccion`), `SearchableSelect` de domicilio (URL, como hoy, `allowClear`), `FilterBar onClear` (limpia texto y navega a `/residentes`); `ResidentesTable({ rows })` columnas Dirección (sort), Residente (`PersonCell`, sort), Teléfono (`?? '—'`), Principal (`hideBelow 'md'`; `Check` en círculo `bg-success-light text-success` si `es_principal`); `entityLabel="residentes"`.
- Produces (`cuotas-metrics.ts`): `cuotasMetrics(rows: CuotaInfo[]): { total: number; importeTotal: number; pendientes: number; pctPendientes: number | null }` (pendientes = `estatus` ∈ {Pendiente, Vencido}; importe = suma de `importe_cuota ?? 0`).
- `CuotasView`: `MetricGroup` (Total de registros `FileText` primary helper "del periodo seleccionado"; Importe total `CircleDollarSign` success helper "{Mes} {Año}" con el nombre de mes de `meses`; Pendientes `AlertCircle` danger badge `formatPercent(pctPendientes)`), métricas sobre las filas filtradas por estatus; `PeriodoFilter` dentro de `FilterBar` con `LabeledSelect` Año (`Calendar`), Mes (`Calendar`), Estatus (`ListFilter`, `allLabel="Todos"`), `onClear` = comportamiento actual de limpiar. `CuotasTable` columnas Dirección (sort), Periodo (sort por `anio*100+mes`), Concepto (`hideBelow 'md'`), Importe (`Money`, `align 'right'`, sort), Vencimiento (`hideBelow 'lg'`), Estatus (`StatusBadge`, sort); `entityLabel="cuotas"`.
- Pages: `PageHeader` con los textos de la spec §4.2; Cuotas conserva el gating de "Generar Cuotas".

- [ ] **Paso 1: Pruebas fallidas**

`cuotas-metrics.test.ts`: `[]` → `{ total: 0, importeTotal: 0, pendientes: 0, pctPendientes: null }`; 5 filas (3 Pagado, 1 Pendiente, 1 Vencido, importes 250 cada una) → `total 5`, `importeTotal 1250`, `pendientes 2`, `pctPendientes 40`.
`residentes-view.test.tsx` (mock `next/navigation`): escribir "hernandez" deja solo la fila de "Ever Hernandez"; "Limpiar filtros" vacía el buscador.
`cuotas-table.test.tsx`: mantener filtro por estatus; añadir orden por Importe desc → primera fila la de mayor importe.
Run → FAIL.

- [ ] **Paso 2: Implementar** + dos `loading.tsx`.
- [ ] **Paso 3: Verificar** → PASS.

---

### Tarea 10: Pagos y Movimientos

**Files:**
- Create: `src/features/pagos/components/{pagos-filters.ts,pagos-view.tsx}`, `src/features/movimientos/components/{movimientos-filters.ts,movimientos-view.tsx}`, `src/app/(app)/pagos/loading.tsx`, `src/app/(app)/movimientos/loading.tsx`
- Modify: `src/features/pagos/components/{pagos-table,recibo-button}.tsx`, `src/app/(app)/pagos/page.tsx`, `src/features/movimientos/components/{movimientos-table,saldo-card}.tsx` (saldo-card se elimina y lo sustituye `MetricStrip`), `src/app/(app)/movimientos/page.tsx`
- Test: `pagos-filters.test.ts`, `movimientos-filters.test.ts`, `movimientos-table.test.tsx` (mantener), `pagos-table.test.tsx` (nuevo)

**Interfaces:**
- Produces (`pagos-filters.ts`): `type PeriodoFiltro = { anio: number | null; mes: number | null }`; `aniosDisponibles(rows: PagoInfo[]): number[]` (desc, de `fecha_pago`); `conceptosDisponibles(rows): string[]` (orden alfabético); `filterPagos(rows, f: { query: string; anio: number | null; mes: number | null; concepto: string | null }): PagoInfo[]` (`query` sobre `referencia`, `concepto`, `direccion`; año/mes de `fecha_pago.slice(0,4)` / `slice(5,7)`); `pagosMetrics(rows): { total: number; importe: number; extras: number }` (`extras` = `tipo_pago_id === 2`).
- Produces (`movimientos-filters.ts`): `aniosDisponibles`, `filterMovimientos(rows, f: { query; anio; mes; tipo: number | null })` (`query` sobre `referencia`, `descripcion`; `tipo` contra `tipo_id`), `movimientosMetrics(rows): { ingresos: number; egresos: number; total: number }`.
- `PagosView({ rows, puedeGestionar, …props del diálogo })`: `MetricGroup` (Total de pagos `CreditCard` primary; Importe recaudado `DollarSign` success; Pagos extra `FileText` info; helper "del conjunto filtrado"); `FilterBar` (`SearchInput` "Buscar por referencia, concepto o domicilio...", `LabeledSelect` Año (`Calendar`, `allLabel="Todos"`), Mes (`Calendar`, `allLabel="Todos"`, nombres de mes de `MESES_CORTOS` en `src/lib/constants.ts` si existe, si no array local `['Enero',…,'Diciembre']` en `src/lib/months.ts`), Concepto (`Tag`, `allLabel="Todos los conceptos"`), `onClear`); `PagosTable`: Referencia (`<span title={ref} className="font-mono text-[13px]">{ref.slice(0,8)}…</span>` + `CopyButton`), Concepto (sort), Domicilio (sort), Importe (`Money`, right, sort), Fecha de Pago (`hideBelow 'md'`, sort), Acciones (`ReciboButton` → `Button variant="secondary" size="sm"` con `FileText` "Recibo"); `entityLabel="pagos"`.
- `MovimientosView({ rows, saldo, puedeGestionar, …props })`: `MetricStrip` (featured Saldo actual `Landmark` con `saldo`; items Ingresos del conjunto `ArrowUp` success, Egresos del conjunto `ArrowDown` danger, Total de movimientos `FileText` neutral); `FilterBar` (`SearchInput` "Buscar por referencia o descripción...", Año, Mes, `LabeledSelect` Tipo (`ArrowUpDown`, `allLabel="Todos"`, opciones Ingreso/Egreso por `tipo_id`), `onClear`); `MovimientosTable`: Tipo (icono `ArrowUp`/`ArrowDown` en círculo 32 px `bg-success-light`/`bg-danger-light` + `StatusBadge(tipo_movimiento)`), Descripción (truncada a 60 con `title`, sort), Importe (`Money`, right, sort), Fecha (`hideBelow 'md'`, sort); `entityLabel="movimientos"`.

- [ ] **Paso 1: Pruebas fallidas**

`pagos-filters.test.ts`: `aniosDisponibles` → `[2026, 2025]` desc y sin duplicados; `filterPagos` con `anio: 2026, mes: 9` deja solo septiembre 2026; `concepto: 'Tarjeta de Acceso'` filtra; `query: 'amadeo 1068'` encuentra por dirección; `pagosMetrics` suma importes y cuenta `tipo_pago_id === 2`; `pagosMetrics([])` → ceros.
`movimientos-filters.test.ts`: `tipo: 2` deja egresos; `movimientosMetrics` → `ingresos` (tipo 1), `egresos` (tipo 2), `total`.
`pagos-table.test.tsx`: referencia truncada a 8 + "…", botón "Copiar" presente, "Recibo" presente.
Run → FAIL.

- [ ] **Paso 2: Implementar** + `loading.tsx` ×2; eliminar `saldo-card.tsx`.
- [ ] **Paso 3: Verificar** → PASS.

---

### Tarea 11: Reportes y Usuarios

**Files:**
- Modify: `src/features/reportes/components/{reportes-tabs,pagos-usuario-filtros,pagos-usuario-resultado,pagos-usuario-tabla,periodo-reporte-filtros,salida-export,inicio-id-export,accesos-telefono-tabla,accesos-tarjeta-tabla,acceso-vehicular-tab,acceso-peatonal-tab,pagos-usuario-tab}.tsx`, `src/app/(app)/reportes/page.tsx`
- Create: `src/features/usuarios/components/usuarios-view.tsx`, `src/app/(app)/reportes/loading.tsx`, `src/app/(app)/usuarios/loading.tsx`
- Modify: `src/features/usuarios/components/{usuarios-table,usuario-actions,estado-filter}.tsx`, `src/app/(app)/usuarios/page.tsx`
- Test: `src/features/reportes/components/pagos-usuario-tab.test.tsx` (mantener), `src/features/usuarios/components/usuarios-view.test.tsx`

**Interfaces:**
- Reportes: `ReportesTabs` con `TabsTrigger` segmentados e iconos `UserRound` / `Car` / `Footprints`; filtros de cada pestaña en `FilterBar` con `LabeledSelect` (Usuario `UserRound`, Año/Mes `Calendar`) e inputs `type="date"` con `Label` ("Fecha inicio", "Fecha fin"); botón "Buscar" `default` con `Search`; `onClear` = limpiar filtros (navega a `/reportes?tab=…`); `SalidaExport`/`InicioIdExport` a la derecha con `Button variant="secondary"` + `Download`. `PagosUsuarioResultado`: `MetricCard` (label "Total", `Receipt`, primary, helper "en el periodo seleccionado") y `PagosUsuarioTabla` con columnas Referencia (`FileText` + ref completa `font-mono text-[13px]`), Usuario, Método de Pago (`hideBelow 'md'`), Importe (`Money variant={importe > 0 ? 'ingreso' : undefined}`, right), Fecha de Pago (`hideBelow 'lg'`), Acciones (`ReciboButton`); `entityLabel="pagos"`. Tablas de accesos: Domicilio + Teléfono 1/2 (`hideBelow 'md'` el 2) y Tarjeta 1/2/3 (`hideBelow 'md'` 2 y 3); `entityLabel="domicilios"`.
- Usuarios: `UsuariosView({ rows, roles, currentUserId, estado })` (cliente): `FilterBar` (`SearchInput` "Buscar por nombre o email..." sobre `user_name`, `email`; `EstadoFilter` como `LabeledSelect` "Estado" `Users`; `onClear` limpia texto y navega a `/usuarios`); `UsuariosTable`: Nombre (`PersonCell name secondary={email solo bajo md}`, sort), Email (`hideBelow 'md'`, sort), Rol (`StatusBadge(role_name)`, sort), Estatus (`StatusBadge(is_active ? 'Activo' : 'Inactivo')`), Acciones (`usuario-actions` con botones `icon-sm` ghost: `Pencil` editar; `Trash2` desactivar en `text-danger` solo activos y no el propio; `RotateCcw` activar solo inactivos; `aria-label`s "Editar usuario", "Desactivar usuario", "Activar usuario"); `entityLabel="usuarios"`.
- Pages: `PageHeader` con textos de la spec §4.2; Usuarios mantiene `requireRole` → 404 y la acción "Nuevo Usuario".

- [ ] **Paso 1: Pruebas fallidas**

`usuarios-view.test.tsx` (mock `next/navigation`): escribir "obed" deja una fila; badge "Tesorero" con `bg-info-light`; badge "Activo" con `bg-success-light`; la fila del usuario actual no muestra "Desactivar usuario".
`pagos-usuario-tab.test.tsx`: mantener aserciones ("TOTAL" pasa a "Total": actualizar el texto esperado a `'Total'`).
Run → FAIL.

- [ ] **Paso 2: Implementar** + `loading.tsx` ×2.
- [ ] **Paso 3: Verificar** → PASS.

---

### Tarea 12: Inicio (dashboard)

**Files:**
- Create: `src/features/dashboard/components/{dashboard-metrics.ts,resumen-cards.tsx,ultimos-movimientos.tsx,estado-cuotas.tsx}`, `src/components/donut-chart.tsx`
- Modify: `src/app/(app)/page.tsx`, `src/app/(app)/loading.tsx`
- Delete: `src/features/dashboard/components/{kpi-cards,kpi-skeleton}.tsx` y `kpi-cards.test.tsx`
- Test: `dashboard-metrics.test.ts`, `donut-chart.test.tsx`, `resumen-cards.test.tsx`

**Interfaces:**
- Consumes: `getResumenFinanciero`, `listMovimientos`, `listDomicilios` (existentes), `variation`, `formatPercent`, `MetricGroup`, `SectionCard`, `StatusBadge`, `Money`, `Table`.
- Produces (`dashboard-metrics.ts`): `type Resumen = Views<'resumen_financiero_completo'> | null`; `dashboardMetrics(resumen: Resumen, totalUnidades: number): { saldo: number; ingresos: number; egresos: number; unidades: number; varSaldo: number | null; varIngresos: number | null; varEgresos: number | null }` donde `varSaldo = variation(ingresos_mes - egresos_mes, ingresos_mes_anterior - egresos_mes_anterior)`, `varIngresos = variation(ingresos_mes, ingresos_mes_anterior)`, `varEgresos = variation(egresos_mes, egresos_mes_anterior)` (nulos → 0 antes de calcular); `trendBadge(v: number | null, { lowerIsBetter = false } = {}): { text: string; tone: 'success' | 'danger' | 'neutral' } | undefined` (`null` → `undefined`; `0` → neutral `'0 %'`; tono success cuando `v > 0` salvo `lowerIsBetter`, que lo invierte); `estadoCuotas(rows: DomicilioInfo[]): { alCorriente: number; morosos: number; total: number }`.
- Produces: `ResumenCards({ resumen, totalUnidades })` → `MetricGroup columns=4` (Saldo actual `Wallet` primary; Ingresos acumulados `ArrowUp` success; Egresos acumulados `ArrowDown` danger con `lowerIsBetter`; Unidades totales `Building2` info sin badge); helper "vs. mes anterior" cuando hay badge, "Sin datos del mes anterior" cuando `variation` es `null`.
- Produces: `UltimosMovimientos({ rows })` (`SectionCard` "Últimos movimientos", acción `Button asChild variant="secondary" size="sm"` "Ver todos" → `/movimientos` con `ArrowRight`; `Table` de 5 filas: Fecha, Concepto (truncado a 40, `title`), Tipo (`StatusBadge`), Importe (`Money`)); `EstadoCuotas({ rows })` (`SectionCard` "Estado de cuotas", acción "Ver todas" → `/domicilios`; `DonutChart` segments Al corriente success / Morosos danger, `centerValue` total, `centerLabel` "Unidades").
- Produces: `DonutChart({ segments, total, centerLabel, centerValue })` SVG 180 px, `strokeWidth` 22, `role="img"` con `aria-label` que lista "{label}: {value} ({pct})"; leyenda con punto, label, valor y `formatPercent`.
- Page: `Promise.all([getResumenFinanciero, listMovimientos, listDomicilios])`; `PageHeader` "Inicio" / "Resumen general del fraccionamiento Lago Amadeo."; `ResumenCards`; grid `lg:grid-cols-[3fr_2fr]` con `UltimosMovimientos rows={movimientos.slice(0,5)}` y `EstadoCuotas rows={domicilios}`. `loading.tsx` → `PageSkeleton`.

- [ ] **Paso 1: Pruebas fallidas**

`dashboard-metrics.test.ts`: `dashboardMetrics(null, 158)` → ceros, `unidades 158`, variaciones `null`; con `ingresos_mes 1124, ingresos_mes_anterior 1000` → `varIngresos 12.4`; `trendBadge(12.4)` → `{ text: '+12.4 %', tone: 'success' }`; `trendBadge(8.1, { lowerIsBetter: true })` → tone `danger`; `trendBadge(null)` → `undefined`; `estadoCuotas` cuenta `estatus === 'Moroso'` vs resto.
`donut-chart.test.tsx`: renderiza `svg[role=img]` con `aria-label` que contiene "Al corriente: 152 (96.2 %)" y la leyenda muestra "Morosos".
`resumen-cards.test.tsx`: con `resumen = null` muestra "$0.00" tres veces (saldo, ingresos, egresos) y "158" en Unidades totales, sin badges y con helper "Sin datos del mes anterior"; con `ingresos_mes 1124` / `ingresos_mes_anterior 1000` muestra "+12.4 %" y "vs. mes anterior".
Run → FAIL.

- [ ] **Paso 2: Implementar**; borrar `kpi-cards*` y `kpi-skeleton.tsx`.
- [ ] **Paso 3: Verificar** → PASS.

---

### Tarea 13: Revisión global, consistencia y validación

**Files:**
- Modify: lo necesario en `src/**` tras la barrida; `README.md` (sección "Sistema de diseño")

- [ ] **Paso 1: Barrida de tokens y restos**

Run y corregir hasta cero resultados:
```bash
grep -rn "bg-badge\|text-badge\|bg-table-header\|text-ingreso\|text-egreso\|font-heading\|Inter_Tight\|dark:" src --include='*.tsx' --include='*.ts' --include='*.css'
grep -rn "variant=\"outline\"" src
grep -rl "icon={\|onSelect=" src/features src/app --include='*.tsx' | xargs grep -L "'use client'"   # cada archivo listado es un componente servidor que pasa iconos o funciones: comprobar a mano que el receptor NO es un componente cliente
```

- [ ] **Paso 2: Accesibilidad y responsive (revisión de código)**

Comprobar en cada tabla `hideBelow` en columnas secundarias; cada `Button size="icon*"` con `aria-label`; cada `Label` con `htmlFor`; `aria-sort` en cabeceras ordenables; `max-w-[1400px]` en el layout; diálogos con `max-h-[85vh]`. Anotar en el reporte lo corregido.

- [ ] **Paso 3: README**

Añadir sección "Sistema de diseño": tokens (tabla breve), tipografía, componentes compartidos y su ubicación, patrón de página, enlace a la spec del rediseño. Actualizar la lista de comprobación manual con: "Sidebar y header en móvil (drawer), métricas y filtros en cada lista, orden y filas por página en tablas, dona de estado de cuotas en Inicio".

- [ ] **Paso 4: Validación final**

Run: `npm test && npm run typecheck && npm run lint && npm run build` → todo verde; `rm -rf .next && npm run typecheck` verde; `npm run build` de nuevo para dejar `.next`. `git status --short` sin commitear.

- [ ] **Paso 5: Entrega**

Escribir en el reporte el resumen de la spec §"Entrega final" del brief: sistema creado, componentes creados y modificados, pantallas rediseñadas, mejoras responsive y UX, problemas encontrados (PROBLEMA / IMPACTO / PROPUESTA), problemas no modificados y por qué, validaciones y resultado del build.
