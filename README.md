# Lago Amadeo — Panel de Administración

Migración de la app FlutterFlow de Lago Amadeo a Next.js 16 (App Router) + Supabase. Usa la misma base de datos productiva: no se modifica el esquema, las políticas RLS, las funciones ni las edge functions. Los roles se verifican en el servidor.

## Requisitos

- Node 24
- npm 11
- Acceso al proyecto Supabase

## Configuración

1. `cp .env.example .env.local` y rellenar `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` con la llave publicable del dashboard de Supabase (nunca la service role).
2. `npm install`

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm test` | Pruebas con Vitest |
| `npm run typecheck` | Verificación de tipos con TypeScript |
| `npm run lint` | ESLint |
| `npm run build` | Build de producción |
| `npm start` | Sirve el build de producción |

## Estructura

- `src/app`: rutas de la aplicación, con los grupos `(auth)` y `(app)` y los endpoints en `api/`.
- `src/features/<dominio>/{queries,actions,schemas,messages,components}`: lógica y UI de cada dominio (consultas, server actions, esquemas zod, mensajes y componentes).
- `src/lib`: clientes de Supabase, autenticación y utilidades.
- `src/components`: componentes `ui` de shadcn, de layout y compartidos.
- `src/proxy.ts`: sesión y redirecciones.

## Sistema de diseño

Spec completa: [`docs/superpowers/specs/2026-10-06-rediseno-visual-design.md`](docs/superpowers/specs/2026-10-06-rediseno-visual-design.md).

**Tokens** (definidos en `src/app/globals.css`, usados como utilidades Tailwind):

| Token | Valor | Utilidad |
| --- | --- | --- |
| Primario / hover / claro | `#065F46` / `#054E39` / `#E6F4EF` | `bg-primary`, `hover:bg-primary-hover`, `bg-primary-light` |
| Éxito | `#15803D` / `#DCFCE7` | `text-success`, `bg-success-light` |
| Peligro | `#B91C1C` / `#FEE2E2` | `text-danger`, `bg-danger-light` |
| Advertencia | `#B45309` / `#FEF3C7` | `text-warning`, `bg-warning-light` |
| Información | `#1D4ED8` / `#DBEAFE` | `text-info`, `bg-info-light` |
| Fondo / superficie | `#F6F8FA` / `#FFFFFF` | `bg-background`, `bg-card` |
| Texto | `#111827` | `text-foreground` |
| Texto secundario | `#4B5563` | `text-secondary-foreground` (no `text-secondary`, que es blanco en shadcn) |
| Texto atenuado | `#6B7280` | `text-muted-foreground` |
| Borde | `#E5E7EB` | `border-border` |

**Tipografía:** una sola familia, Inter (pesos 400-700, variable `--font-sans`). Escala resumida: título de página 30 px bold, título de sección y diálogo 18 px semibold, valor de métrica 28 px bold, cuerpo 14 px, etiquetas y ayudas 12-13 px, importes con cifras tabulares. Sin mayúsculas sostenidas, salvo el campo Dirección, que se captura en mayúsculas porque así se almacena.

**Componentes compartidos** (`src/components/*`):

- `PageHeader`: breadcrumb, título, descripción y acciones de la página.
- `MetricCard`, `MetricGroup`, `MetricStrip`: tarjeta de métrica y sus agrupaciones.
- `FilterBar`: contenedor de filtros de lista.
- `SearchInput`: campo de búsqueda con icono.
- `LabeledSelect`: select nativo con etiqueta accesible.
- `SearchableSelect`: selector con búsqueda y botón de limpiar.
- `DataTable`: tabla con orden (`aria-sort`), columnas `hideBelow` y paginación.
- `RowActions`: menú de acciones por fila.
- `FormDialog`: diálogo de formulario con pie de acciones.
- `ConfirmDialog`: diálogo de confirmación.
- `StatusBadge`: insignia de estado.
- `Money`: importe formateado con color por signo.
- `Avatar`: iniciales en círculo.
- `PersonCell`: avatar con nombre y dato secundario.
- `EmptyState`, `ErrorState`: estados vacío y de error.
- `Skeletons`: marcadores de carga.
- `SectionCard`: tarjeta de sección con título y acciones.
- `CopyButton`: copiar al portapapeles.
- `BrandLogo`: logotipo de la marca.
- `DonutChart`: dona de estado de cuotas.

**Patrón de página:** breadcrumb, título, acciones, métricas, filtros y tabla.

## Roles

- **Administrador**: acceso a todo, incluido Usuarios.
- **Tesorero**: gestión de cuotas, pagos y movimientos.
- **Comite** y **Vigilancia**: consulta, más edición de domicilios, residentes y accesos.

## Documentación

- [Especificación de diseño](docs/superpowers/specs/2026-10-05-migracion-flutterflow-nextjs-design.md)
- [Anexo: inventario funcional de FlutterFlow](docs/superpowers/specs/2026-10-05-inventario-funcional-flutterflow.md)
- [Plan de implementación](docs/superpowers/plans/2026-10-05-migracion-nextjs.md)

## Limitaciones conocidas

- El pago no es transaccional (varias escrituras); se mitiga con un guard de pago existente.
- El recibo se guarda en base64 en `pagos.file_data`.
- Las edge functions de exportación no verifican JWT; la app las protege mediante `/api/exports/*`.
- El RLS de la base de datos es permisivo; la app verifica los roles en el servidor.
- La impresión de recibos requiere el agente local en `http://localhost:8000/print`.

## Lista de comprobación manual

1. Login con credenciales malas muestra "Error: …"; con usuario inactivo muestra el mensaje de cuenta inactiva; con usuario válido entra al dashboard y las 7 tarjetas muestran importes.
2. Un usuario Comite no ve "Usuarios" en el sidebar y `/usuarios` le da 404; un Administrador sí entra.
3. Domicilios: búsqueda filtra; alta rechaza dirección duplicada; clic en fila abre el detalle; URL inválida da 404.
4. Detalle: editar domicilio y cambiar tipo de cuota; agregar hasta 2 teléfonos y 3 tarjetas (el botón desaparece al llegar al máximo); agregar, editar (principal) y eliminar residente.
5. Cuotas: cambiar año/mes re-consulta; estatus filtra en cliente; "Generar Cuotas" (Tesorero) muestra éxito o error.
6. Detalle: "Crear Cuota" rechaza duplicado; editar cuota añade y quita descuento/recargo; "Pagar" registra pago, la cuota pasa a Pagado y aparece "Recibo"; el recibo abre, descarga e imprime (con el agente local activo).
7. Pagos: "Pago Extra" desde la lista (elige domicilio) y desde el detalle (domicilio fijo); ambos generan recibo.
8. Movimientos: el saldo refleja el pago anterior (trigger); "Nuevo Movimiento" egreso resta.
9. Reportes: pestaña 1 exige los tres filtros y muestra TOTAL; pestaña 2 descarga CSV; pestaña 3 exige ID Inicio y descarga TXT.
10. Usuarios: crear usuario y verificar que aparece; editar rol; desactivar (no al propio) y activar.
11. En una ventana estrecha, el menú móvil abre el sidebar.
12. Sidebar y header en móvil (drawer), métricas y filtros en cada lista, orden y filas por página en tablas, dona de estado de cuotas en Inicio.
