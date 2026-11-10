# Pantalla de catálogos: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Una pantalla `/catalogos`, solo para administradores, donde se agregan y editan tipos de cuota mensual, conceptos de pago extra, descuentos y recargos.

**Architecture:** Nueva feature `src/features/catalogos/` con esquemas Zod, Server Actions envueltas en `runAction([ROLES.ADMINISTRADOR], …)`, lecturas en Server Components y diálogos de cliente sobre `FormDialog`. La página usa pestañas en la URL, igual que Reportes. La base de datos no cambia.

**Tech Stack:** Next.js 16 App Router, React 19, Supabase (`@supabase/ssr`), Zod 4, react-hook-form, shadcn/ui, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-09-catalogos-design.md`

## Global Constraints

- **No hacer commits.** El usuario hace todos los commits.
- **No levantar el servidor** (`npm run dev` / `next start`). Validar con `npm test`, `npx tsc --noEmit`, `npm run lint` y `npm run build`.
- La base es solo lectura: sin migraciones ni cambios de RLS o funciones SQL.
- No modificar `queries.ts`, `actions.ts`, `schemas.ts` ni `messages.ts` de otras features. Sí se pueden importar.
- Solo el rol `ROLES.ADMINISTRADOR` ve la pantalla y puede guardar.
- `tipo_pago_id` lo fija el servidor: `TIPO_PAGO.RECURRENTE` (1) para tipos de cuota y `TIPO_PAGO.EXTRA` (2) para conceptos extra.
- Nombre: con espacios recortados, de 1 a 80 caracteres. Importe o monto: mayor que 0, como máximo 999,999.99, con 2 decimales como máximo.
- Textos en español, en sentence case, como el resto de la app. TDD: la prueba primero, verla fallar y después implementar.

## Review Focus

1. **Elemento borrado mientras se editaba.** Si el update no afecta ninguna fila, la acción responde "El elemento ya no existe. Recarga la página." y no reporta éxito. Prueba en la tarea 2.
2. **Nombre con `%`, `_` o `\`.** La búsqueda de duplicados con `ilike` escapa esos caracteres, así que "50%" no coincide con "50 pesos". Prueba en la tarea 2.
3. **Editar sin cambiar el nombre**, aunque cambie de mayúsculas o tenga espacios extra. No cuenta como duplicado de sí mismo, porque la búsqueda excluye su propio `id`. Prueba en la tarea 2.
4. **Importe con coma** (`"250,50"`), vacío o con más de 2 decimales. El formulario rechaza el valor con un mensaje claro y no guarda. Prueba en la tarea 1.
5. **Cancelar y reabrir un diálogo de edición.** Muestra los valores guardados, no lo que se había escrito antes de cancelar. Prueba en la tarea 4.

---

### Task 1: Esquemas, mensajes y configuración de catálogos

**Files:**
- Create: `src/features/catalogos/schemas.ts`, `src/features/catalogos/messages.ts`, `src/features/catalogos/catalogos.ts`
- Test: `src/features/catalogos/schemas.test.ts`

**Interfaces:**
- Produces:
  - `catalogoSchema`: Zod object `{ nombre: string, importe: number }` cuya entrada es `{ nombre: string; importe: string | number }`.
  - `tipoCuotaSchema = catalogoSchema.extend({ accesoTelefono: z.boolean(), accesoTarjeta: z.boolean() })`.
  - Tipos: `CatalogoInput = z.input<typeof catalogoSchema>`, `TipoCuotaInput = z.input<typeof tipoCuotaSchema>`.
  - `messages.ts`:
    - `MSG_TIPO_CUOTA_GUARDADO = 'Tipo de cuota guardado correctamente.'`
    - `MSG_CONCEPTO_GUARDADO = 'Concepto guardado correctamente.'`
    - `MSG_DESCUENTO_GUARDADO = 'Descuento guardado correctamente.'`
    - `MSG_RECARGO_GUARDADO = 'Recargo guardado correctamente.'`
    - `MSG_NOMBRE_DUPLICADO = 'Ya existe un elemento con ese nombre en este catálogo.'`
    - `MSG_NO_ENCONTRADO = 'El elemento ya no existe. Recarga la página.'`
    - `AVISO_IMPORTE = 'El nuevo importe aplica a las cuotas que se generen desde ahora; las ya generadas conservan su importe.'`
    - `AVISO_NOMBRE = 'El nombre también cambia en el historial.'`
  - `catalogos.ts` (sin `'use server'`, apto para cliente):
    - `type CatalogoSimple = 'extras' | 'descuentos' | 'recargos'`
    - `type TabCatalogo = 'cuotas' | CatalogoSimple`
    - `TABS_CATALOGO: TabCatalogo[] = ['cuotas', 'extras', 'descuentos', 'recargos']`
    - `type ElementoCatalogo = { id: number; nombre: string; importe: number }`
    - `type TipoCuota = ElementoCatalogo & { accesoTelefono: boolean; accesoTarjeta: boolean }`
    - `CATALOGOS: Record<TabCatalogo, { titulo: string; tab: string; descripcion: string; singular: string; etiquetaMonto: string; guardado: string }>`, con estos valores:

| clave | titulo | tab | descripcion | singular | etiquetaMonto | guardado |
|---|---|---|---|---|---|---|
| cuotas | Tipos de cuota mensual | Tipos de cuota | Se asignan a cada domicilio y definen el importe de sus cuotas y sus accesos. | tipo de cuota | Importe mensual | `MSG_TIPO_CUOTA_GUARDADO` |
| extras | Conceptos de pago extra | Conceptos extra | Cargos únicos, como la reposición de una tarjeta. Se eligen al registrar un pago extra. | concepto | Importe | `MSG_CONCEPTO_GUARDADO` |
| descuentos | Descuentos | Descuentos | Montos que se restan a una cuota al editarla. | descuento | Monto | `MSG_DESCUENTO_GUARDADO` |
| recargos | Recargos | Recargos | Montos que se suman a una cuota al editarla. | recargo | Monto | `MSG_RECARGO_GUARDADO` |

- [ ] **Step 1: Write the failing tests** en `schemas.test.ts`:
  - `catalogoSchema.parse({ nombre: '  Acceso Total  ', importe: '250.5' })` da `{ nombre: 'Acceso Total', importe: 250.5 }`.
  - Falla con nombre `''` o `'   '`, y el mensaje es `'El nombre es obligatorio'`.
  - Falla con un nombre de 81 caracteres: `'Máximo 80 caracteres'`.
  - Falla con importe `'0'` o `'-5'`: `'El importe debe ser mayor a 0'`.
  - Falla con importe `'250,50'` o `''`: `'Ingresa un importe válido'`.
  - Falla con importe `'10.123'`: `'Máximo 2 decimales'`.
  - Falla con importe `'1000000'`: `'El importe máximo es 999,999.99'`.
  - `tipoCuotaSchema` exige `accesoTelefono` y `accesoTarjeta` booleanos.
- [ ] **Step 2: Run** `npx vitest run src/features/catalogos/schemas.test.ts`. Expected: FAIL (el módulo no existe).
- [ ] **Step 3: Implement** los tres archivos con las interfaces de arriba.
  - Para importe, usar un `z.string()` o `z.number()` que se transforme a número. Una cadena vacía o con caracteres no numéricos da `'Ingresa un importe válido'`. Usar la regex `^\d+(\.\d+)?$` sobre el texto recortado; no usar `z.coerce`, porque `''` se convertiría en 0.
  - Los dos decimales se validan con `Math.abs(n * 100 - Math.round(n * 100)) < 1e-9`.
- [ ] **Step 4: Run** el mismo comando. Expected: PASS.

### Task 2: Server Actions de guardado

**Files:**
- Create: `src/features/catalogos/actions.ts`
- Modify: `src/test/fake-query.ts`. `fakeSupabase` acepta `FakeQuery | FakeQuery[]` por tabla: con un arreglo, cada `from(tabla)` consume el siguiente elemento y el último se repite. Las pruebas existentes no cambian.
- Test: `src/features/catalogos/actions.test.ts`, `src/test/fake-query.test.ts` (crear si no existe, solo para la secuencia)

**Interfaces:**
- Consumes: `catalogoSchema`, `tipoCuotaSchema`, `CatalogoInput`, `TipoCuotaInput`, `CatalogoSimple` y los `MSG_*` de la tarea 1. También `runAction` de `@/lib/auth/run-action`, `ok`/`fail` de `@/lib/action-result`, y `ROLES`/`TIPO_PAGO` de `@/lib/constants`.
- Produces (`'use server'`):
  - `guardarTipoCuota(id: number | null, input: TipoCuotaInput): Promise<ActionResult>`
  - `guardarCatalogo(catalogo: CatalogoSimple, id: number | null, input: CatalogoInput): Promise<ActionResult>`

  Es una sola acción para los tres catálogos simples. Es equivalente a los `guardarConceptoExtra`/`guardarDescuento`/`guardarRecargo` de la especificación, pero en una sola función con un mapa de configuración.

Configuración interna:

| catalogo | tabla | columna monto | filtro extra |
|---|---|---|---|
| extras | `conceptos_pago` | `importe` | `tipo_pago_id = TIPO_PAGO.EXTRA` (en insert, duplicados y update) |
| descuentos | `conceptos_descuento` | `monto_descuento` | — |
| recargos | `conceptos_recargo` | `monto_recargo` | — |

Tipos de cuota usan `conceptos_pago` con `tipo_pago_id = TIPO_PAGO.RECURRENTE` y la tabla `concepto_pago_acceso`.

Al terminar, todas las acciones revalidan `revalidatePath('/catalogos')`, `revalidatePath('/domicilios', 'layout')`, `revalidatePath('/cuotas')` y `revalidatePath('/pagos')`.

- [ ] **Step 1: Write the failing tests** en `actions.test.ts`, con el estilo de `src/features/domicilios/actions.test.ts`: simular `createClient`, `next/cache` y `getCurrentUser`, con usuario por defecto `roleName: 'Administrador'`.
  - `guardarCatalogo` con usuario `roleName: 'Tesorero'` devuelve `{ ok: false, error: 'No tienes permiso para realizar esta acción.' }` y no llama a `from`.
  - Con datos inválidos (importe `'0'`) devuelve `fail` con el mensaje del esquema y no escribe.
  - **Crear descuento:** la búsqueda de duplicados (`ilike('nombre', 'Comité')`) devuelve `[]`. Se inserta `{ nombre: 'Comité', monto_descuento: 250 }` en `conceptos_descuento`, la acción devuelve `{ ok: true, data: undefined }` y revalida las cuatro rutas.
  - **Duplicado:** si la búsqueda devuelve `[{ id: 9 }]`, la acción devuelve `MSG_NOMBRE_DUPLICADO` y no hay insert.
  - **Comodines (Review Focus 2):** un nombre `'50%_off\\'` se busca con `ilike('nombre', '50\\%\\_off\\\\')`.
  - **Editar (Review Focus 3):** la búsqueda de duplicados incluye `neq('id', 4)`. El update es `{ nombre, monto_recargo }` con `eq('id', 4)` y `select('id')`.
  - **Extras:** el insert lleva `tipo_pago_id: 2`. El update y la búsqueda de duplicados filtran `eq('tipo_pago_id', 2)`.
  - **Elemento borrado (Review Focus 1):** si el update devuelve `data: []`, la acción devuelve `MSG_NO_ENCONTRADO`.
  - **Crear tipo de cuota:**
    - Se inserta `{ nombre, importe, tipo_pago_id: 1 }` con `.select('id').single()`, que devuelve `{ id: 5 }`.
    - Después se inserta `{ concepto_pago_id: 5, acceso_telefono: true, acceso_tarjeta: false }` en `concepto_pago_acceso`.
  - **Compensación:** si el insert de accesos devuelve `error`, se llama a `delete().eq('id', 5)` sobre `conceptos_pago` y la acción devuelve `fail` (mensaje genérico de `runAction`, `'Ocurrió un error inesperado. Intenta de nuevo.'`).
  - **Editar tipo de cuota con fila de accesos:** si la búsqueda en `concepto_pago_acceso` por `concepto_pago_id` devuelve `{ id: 1 }`, se hace un update `eq('id', 1)` y no hay insert.
  - **Editar tipo de cuota sin fila de accesos:** si la búsqueda devuelve `null`, se hace un insert con `concepto_pago_id`.
- [ ] **Step 2: Run** `npx vitest run src/features/catalogos/actions.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** la secuencia en `fakeSupabase`, con su prueba en `src/test/fake-query.test.ts`. Después implementar `actions.ts`:
  - Agregar el helper interno `escapeLike(s: string): string`, que reemplaza `\`, `%` y `_` anteponiendo `\`.
  - Para la búsqueda de duplicados, usar `.select('id').ilike('nombre', escapeLike(nombre))`, más el filtro de tipo si aplica, más `.neq('id', id)` cuando se edita, y `.limit(1)`.
  - La búsqueda de la fila de accesos usa `.select('id').eq('concepto_pago_id', id).maybeSingle()`.
  - Los errores de Supabase se lanzan (`throw new Error(error.message)`) para que `runAction` los convierta en el mensaje genérico. La excepción es el insert de accesos al crear: ahí primero se compensa y luego se lanza.
- [ ] **Step 4: Run** `npx vitest run src/features/catalogos src/test` y después `npm test`. Expected: todo PASS.

### Task 3: Lecturas

**Files:**
- Create: `src/features/catalogos/queries.ts`
- Test: `src/features/catalogos/queries.test.ts`

**Interfaces:**
- Consumes: `TipoCuota` y `ElementoCatalogo` de la tarea 1.
- Produces:
  - `listTiposCuota(supabase: SupabaseClient<Database>): Promise<TipoCuota[]>`
  - `listConceptosExtraCatalogo(supabase: SupabaseClient<Database>): Promise<ElementoCatalogo[]>`

  Lleva otro nombre para no confundirse con `listConceptosExtra` de `pagos/queries.ts`, que ordena por id.
- Descuentos y recargos: la página reutiliza `listConceptosDescuento` y `listConceptosRecargo` de `@/features/cuotas/queries` y mapea `monto_descuento` y `monto_recargo` a `importe`.

- [ ] **Step 1: Write the failing tests**, con `fakeQuery`:
  - `listTiposCuota` llama a `select('id, nombre, importe, concepto_pago_acceso(acceso_telefono, acceso_tarjeta)')`, con `eq('tipo_pago_id', 1)` y `order('nombre')`.
  - Mapea `{ id: 2, nombre: 'Acceso Peatonal', importe: 100, concepto_pago_acceso: [{ acceso_telefono: false, acceso_tarjeta: true }] }` a `{ id: 2, nombre: 'Acceso Peatonal', importe: 100, accesoTelefono: false, accesoTarjeta: true }`.
  - Sin fila de accesos (`[]`), los dos accesos quedan en `true`.
  - `listConceptosExtraCatalogo` filtra `eq('tipo_pago_id', 2)`, ordena por nombre y devuelve `{ id, nombre, importe }`.
  - Un error de Supabase lanza `Error('No se pudieron leer los tipos de cuota: …')` o `'No se pudieron leer los conceptos extra: …'`.
- [ ] **Step 2: Run** `npx vitest run src/features/catalogos/queries.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.** `concepto_pago_acceso` puede llegar como arreglo o como objeto, según cómo infiera la relación PostgREST. Normalizar con `Array.isArray(x) ? x[0] : x`.
- [ ] **Step 4: Run** el mismo comando. Expected: PASS.

### Task 4: Secciones y diálogos

**Files:**
- Create in `src/features/catalogos/components/`:
  - `tipos-cuota-section.tsx` (server)
  - `catalogo-section.tsx` (server)
  - `tipo-cuota-dialog.tsx` (client)
  - `catalogo-dialog.tsx` (client)
  - `acceso-badge.tsx`
- Test: `tipos-cuota-section.test.tsx`, `catalogo-dialog.test.tsx`, `tipo-cuota-dialog.test.tsx`

**Interfaces:**
- Consumes: `CATALOGOS`, `TipoCuota`, `ElementoCatalogo`, `CatalogoSimple`, `AVISO_IMPORTE`, `AVISO_NOMBRE` (tarea 1), y `guardarTipoCuota`, `guardarCatalogo` (tarea 2).
- Produces:
  - `TiposCuotaSection({ rows }: { rows: TipoCuota[] })`
  - `CatalogoSection({ catalogo, rows }: { catalogo: CatalogoSimple; rows: ElementoCatalogo[] })`
  - `TipoCuotaDialog({ item, trigger }: { item?: TipoCuota; trigger: ReactNode })`
  - `CatalogoDialog({ catalogo, item, trigger }: { catalogo: CatalogoSimple; item?: ElementoCatalogo; trigger: ReactNode })`
  - `AccesoBadge({ activo }: { activo: boolean })`: `Badge variant="success"` con `Check` y "Sí" cuando está activo; si no, `<span className="text-muted-foreground">—</span>`.

Diseño, con los mismos patrones que `ResidentesSection`:
- `SectionCard` con `title`, `description` e `icon`: `Receipt` para cuotas, `Banknote` para extras, `BadgePercent` para descuentos y `TriangleAlert` para recargos.
- `action`: el diálogo con un trigger `<Button size="sm"><Plus />Agregar</Button>`.
- Tabla shadcn con `<TableRow className="bg-muted hover:bg-muted">` en el encabezado. Importes con `<Money value={…} />` alineados a la derecha.
- Acción por fila: `Button variant="secondary" size="icon-sm" aria-label={`Editar ${nombre}`}` con `Pencil`.
- Sin filas, `EmptyState`: título `Sin elementos` y descripción `Agrega el primero con el botón Agregar.`
- Diálogos: `FormDialog size="sm"`, título `Agregar ${singular}` o `Editar ${singular}`, con capitalización de oración, por ejemplo "Agregar tipo de cuota".
  - Campos `Nombre *` y `${etiquetaMonto} *` con `inputMode="decimal"`.
  - En tipo de cuota, dos `Checkbox` con label: `Acceso con teléfono (vehicular)` y `Acceso con tarjeta (peatonal)`. Al crear, ambas empiezan en `true`.
  - Los avisos solo aparecen cuando hay `item` y el valor observado (`useWatch`) cambió respecto al original. `AVISO_IMPORTE` es solo para tipo de cuota; `AVISO_NOMBRE` es para todos. Se muestran como `<p className="text-xs text-warning">`.
  - Al guardar con éxito: `toast.success(CATALOGOS[x].guardado)`, cerrar el diálogo y `router.refresh()`. Con error: `toast.error(result.error)` y el diálogo queda abierto. Igual que `numero-dialog.tsx`, el formulario se reinicia con los valores de `item` al abrir.

- [ ] **Step 1: Write the failing tests.** Simular `next/navigation` (`useRouter`) y `../actions`.
  - **`tipos-cuota-section`:**
    - Muestra los encabezados `Nombre`, `Importe mensual`, `Acceso vehicular (teléfono)`, `Acceso peatonal (tarjeta)` y `Acciones`.
    - En la fila de "Acceso Peatonal", el teléfono muestra "—" y la tarjeta muestra "Sí" con `bg-success-light`.
    - Hay un botón `Editar Acceso Peatonal`.
  - **`catalogo-dialog`:**
    - Al abrir "Agregar" en descuentos y guardar con `Comité` / `250`, se llama a `guardarCatalogo('descuentos', null, { nombre: 'Comité', importe: '250' })`.
    - Con importe `'250,50'` se muestra `'Ingresa un importe válido'` y no se llama a la acción.
    - Al editar, si el nombre cambia aparece `AVISO_NOMBRE`; si no cambia, no aparece.
    - **Review Focus 5:** editar, escribir otro nombre, cancelar y reabrir muestra el nombre original.
  - **`tipo-cuota-dialog`:**
    - Al crear, las dos casillas empiezan marcadas.
    - Al editar `{ importe: 250 }` y cambiarlo a `300`, aparece `AVISO_IMPORTE`.
    - Guardar llama a `guardarTipoCuota(1, { nombre, importe: '300', accesoTelefono: true, accesoTarjeta: true })`.
- [ ] **Step 2: Run** `npx vitest run src/features/catalogos/components`. Expected: FAIL.
- [ ] **Step 3: Implement** los cinco componentes.
- [ ] **Step 4: Run** el mismo comando. Expected: PASS.

### Task 5: Página, pestañas y menú

**Files:**
- Create: `src/app/(app)/catalogos/page.tsx`, `src/app/(app)/catalogos/loading.tsx`, `src/features/catalogos/components/catalogos-tabs.tsx`
- Modify: `src/components/layout/nav-items.ts`, `src/components/layout/nav-items.test.ts`
- Test: `src/features/catalogos/components/catalogos-tabs.test.tsx`

**Interfaces:**
- Consumes: todo lo anterior, más `requireRole` y `AuthorizationError` de `@/lib/auth/require-role`, y `listConceptosDescuento` y `listConceptosRecargo` de `@/features/cuotas/queries`.
- Produces: `CatalogosTabs({ tab, children }: { tab: TabCatalogo; children: ReactNode })`. Es un componente de cliente, como `ReportesTabs`: usa `router.replace(`${pathname}?tab=${v}`)` y los triggers muestran el texto `CATALOGOS[t].tab`.

- [ ] **Step 1: Write the failing tests.**
  - En `nav-items.test.ts`, agregar `'Catálogos'` al final de `LABELS`. Administrador ve 9 ítems en ese orden; Comite y "sin rol" siguen viendo 7 y no ven `/catalogos`.
  - En `catalogos-tabs.test.tsx`, se ven las 4 pestañas con sus textos, y al hacer clic en "Descuentos" se llama a `replace('/catalogos?tab=descuentos')`.
- [ ] **Step 2: Run** `npx vitest run src/components/layout/nav-items.test.ts src/features/catalogos/components/catalogos-tabs.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - En `nav-items.ts`, agregar `{ label: 'Catálogos', href: '/catalogos', icon: Library, roles: [ROLES.ADMINISTRADOR] }` después de Usuarios.
  - **`page.tsx`:**
    - Usa el mismo `try { await requireRole(ROLES.ADMINISTRADOR) } catch → notFound()` que `usuarios/page.tsx`.
    - `tab = TABS_CATALOGO.find((t) => t === first(sp.tab)) ?? 'cuotas'`.
    - Usa `PageHeader` con título `Catálogos`, descripción `Administra los conceptos que usa la aplicación: cuotas, pagos extra, descuentos y recargos.` y breadcrumbs `[{ label: 'Catálogos' }]`.
    - Solo lee los datos de la pestaña activa y renderiza `CatalogosTabs` con un `TabsContent` por pestaña, cada uno con su sección.
  - `loading.tsx` devuelve `<PageSkeleton metrics={false} />`.
- [ ] **Step 4: Run** el mismo comando. Expected: PASS.
- [ ] **Step 5: Verificación final:**
  - `npm test`: todos los archivos pasan.
  - `npx tsc --noEmit`: sin salida.
  - `npm run lint`: sin errores.
  - `npm run build`: "Compiled successfully" y la ruta `ƒ /catalogos` en la lista.
