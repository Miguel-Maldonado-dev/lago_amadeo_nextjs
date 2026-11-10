# Pantalla de catálogos: diseño

Fecha: 2026-11-09 · Estado: pendiente de revisión

## Objetivo

Los administradores necesitan agregar y editar los catálogos que hoy solo existen en la base de datos. Hoy, cambiar el importe de una cuota o crear un concepto de pago nuevo requiere tocar la base directamente.

Éxito: un administrador puede crear y editar elementos de los cuatro catálogos desde la app. Los cambios aparecen de inmediato donde se usan: alta y edición de domicilios, generación de cuotas, pagos extra, y descuentos y recargos de cuotas. Ningún otro rol puede ver la pantalla ni guardar cambios.

## Decisiones acordadas

| Tema | Decisión |
|---|---|
| Catálogos | Los cuatro: tipos de cuota mensual, conceptos de pago extra, descuentos y recargos. |
| Operaciones | Solo agregar y editar. No se elimina. |
| Estructura | Una ruta `/configuracion` con una pestaña por catálogo. La pestaña va en la URL (`?tab=`). |
| Acceso | Solo el rol Administrador. |
| Base de datos | Sin cambios de esquema, RLS ni funciones. |

## Modelo de datos (existente)

| Catálogo | Tabla | Campos editables |
|---|---|---|
| Tipos de cuota mensual | `conceptos_pago` con `tipo_pago_id = TIPO_PAGO.RECURRENTE` (1), más `concepto_pago_acceso` | `nombre`, `importe`, y en la segunda tabla `acceso_telefono` y `acceso_tarjeta` |
| Conceptos de pago extra | `conceptos_pago` con `tipo_pago_id = TIPO_PAGO.EXTRA` (2) | `nombre`, `importe` |
| Descuentos | `conceptos_descuento` | `nombre`, `monto_descuento` |
| Recargos | `conceptos_recargo` | `nombre`, `monto_recargo` |

`tipo_pago_id` lo fija el servidor según la pestaña y nunca se edita.

Efectos de editar, que la UI debe explicar:

- **Importe de un tipo de cuota.** `generar_cuotas` copia `conceptos_pago.importe` al crear cada cuota. Por eso el cambio solo afecta a las cuotas que se generen después; las ya generadas conservan su importe.
- **Nombre.** Las vistas (`cuotas_info`, `pagos_info`, `domicilios_info`, etc.) muestran el nombre vigente del catálogo, así que un cambio de nombre se ve en todo el historial.
- **Indicadores de acceso.** Deciden si los domicilios con ese tipo de cuota muestran las secciones de números de acceso y de tarjetas en su detalle.

## Pantalla

- **Ruta.** `src/app/(app)/configuracion/page.tsx` es un Server Component. Llama a `requireRole(ROLES.ADMINISTRADOR)` y, si falla, responde `notFound()`, igual que `usuarios/page.tsx`. La pestaña llega por `searchParams.tab`, con los valores `cuotas | extras | descuentos | recargos` y `cuotas` por defecto. Solo se leen los datos de la pestaña activa.
- **Menú.** Se agrega `{ label: 'Configuración', href: '/configuracion', icon: Settings, roles: [ROLES.ADMINISTRADOR] }` en `nav-items.ts`, después de Usuarios.
- **Pestañas.** Usan el mismo patrón que `ReportesTabs`.
- **Contenido de cada pestaña.** Una `SectionCard` con título, una línea que explica el catálogo, el botón **+ Agregar** y una tabla con el encabezado gris de la app y un botón lápiz por fila (`aria-label="Editar <nombre>"`). Con la tabla vacía se muestra `EmptyState`.

| Pestaña | Título | Columnas |
|---|---|---|
| cuotas | Tipos de cuota mensual | Nombre · Importe mensual · Acceso vehicular (teléfono) · Acceso peatonal (tarjeta) · Acciones |
| extras | Conceptos de pago extra | Nombre · Importe · Acciones |
| descuentos | Descuentos | Nombre · Monto · Acciones |
| recargos | Recargos | Nombre · Monto · Acciones |

Los accesos se muestran como etiqueta "✓ Sí" en verde o "—" en gris.

## Formularios

Se usa un solo componente de diálogo por tipo de catálogo, montado sobre `FormDialog` y `react-hook-form` con Zod, igual que los formularios existentes.

- Nombre*: texto con espacios recortados, de 1 a 80 caracteres.
- Importe o Monto*: número mayor que 0 y como máximo 999,999.99, con 2 decimales como máximo.
- Tipos de cuota, además: dos casillas, *Acceso con teléfono (vehicular)* y *Acceso con tarjeta (peatonal)*. Al crear, ambas empiezan marcadas.
- Avisos que solo aparecen al editar:
  - Si cambia el importe de un tipo de cuota: "El nuevo importe aplica a las cuotas que se generen desde ahora; las ya generadas conservan su importe."
  - Si cambia el nombre: "El nombre también cambia en el historial."
- Títulos: "Agregar …" o "Editar …". Botones: Cancelar y Guardar.

## Server Actions

Archivo `src/features/configuracion/actions.ts`. Cada acción devuelve el `ActionResult` existente.

| Acción | Escritura |
|---|---|
| `guardarTipoCuota(id \| null, input)` | `conceptos_pago` (tipo 1) y `concepto_pago_acceso` |
| `guardarConceptoExtra(id \| null, input)` | `conceptos_pago` (tipo 2) |
| `guardarDescuento(id \| null, input)` | `conceptos_descuento` |
| `guardarRecargo(id \| null, input)` | `conceptos_recargo` |

Flujo común:

1. `requireRole(ROLES.ADMINISTRADOR)`. Si falla, devuelve `{ ok: false, error: 'No tienes permiso para realizar esta acción.' }`.
2. Valida con el esquema Zod en el servidor. No se confía en el cliente.
3. Revisa duplicados: lee `id, nombre` del catálogo, con el filtro de tipo si aplica, y compara en código con `trim()` y en minúsculas, excluyendo el propio `id`. Las tablas son pequeñas, y así no se depende de los comodines de `ilike`; PostgREST también trata `*` como comodín. Si hay coincidencia, devuelve "Ya existe un elemento con ese nombre en este catálogo."
4. Hace un insert o un update. En `conceptos_pago` el update filtra también por `tipo_pago_id`, para que una pestaña no pueda editar un concepto de la otra.
5. Llama a `revalidatePath` para `/configuracion`, `/domicilios`, `/cuotas` y `/pagos` (con `'layout'` en los detalles de domicilio).

Tipo de cuota, que escribe en dos tablas:

- **Crear.** Inserta el concepto y luego la fila de accesos. Si la segunda escritura falla, borra el concepto recién creado y devuelve el error. PostgREST no permite transacciones en dos tablas sin una función SQL, y la base no se modifica.
- **Editar.** Actualiza el concepto. Después actualiza `concepto_pago_acceso` filtrando por `concepto_pago_id` y solo inserta si no se actualizó ninguna fila. No se busca antes de escribir, porque dos ediciones simultáneas podrían insertar dos filas. Si falla la escritura de accesos, se revalida antes de reportar el error, porque el nombre y el importe ya quedaron guardados. `concepto_pago_acceso` no tiene restricción única sobre `concepto_pago_id`; verificado en la base el 2026-11-09. Su FK tiene `ON DELETE CASCADE`.

Los mensajes de éxito van en `src/features/configuracion/messages.ts`, por ejemplo "Tipo de cuota guardado correctamente." y "Concepto guardado correctamente.".

## Lecturas

En `src/features/configuracion/queries.ts`:

- `listTiposCuota`: `conceptos_pago` de tipo 1 con su `concepto_pago_acceso` embebido, ordenados por nombre. Si un concepto no tiene fila de accesos, sus accesos se consideran `true`, igual que en `accesos-section.tsx`.
- `listConceptosExtra`: tipo 2 ordenados por nombre. No reemplaza a la de `pagos/queries.ts`, que ordena por id para su propio uso.
- Descuentos y recargos reutilizan `listConceptosDescuento` y `listConceptosRecargo` de `cuotas/queries.ts`.

## Errores

Si algo falla, se muestra `toast.error` con el mensaje del servidor, el diálogo queda abierto y conserva lo que se escribió. Los errores de lectura de la página los maneja el `error.tsx` existente de `(app)`.

## Pruebas (TDD)

- **Esquemas.** Importe ≤ 0, más de 2 decimales, nombre vacío o largo, y recorte de espacios.
- **Acciones**, con Supabase simulado como en `*/actions.test.ts`:
  - rechaza a quien no es administrador;
  - crea y edita cada catálogo;
  - detecta nombres duplicados;
  - el update de `conceptos_pago` filtra por tipo;
  - si falla el insert de accesos, borra el concepto creado;
  - al editar, actualiza la fila de accesos si existe o la crea si no.
- **Componentes.** Las columnas y la etiqueta de acceso; el lápiz abre el formulario precargado; los avisos aparecen solo al editar y al cambiar el valor.
- **Menú.** "Catálogos" solo aparece para Administrador.

## Fuera de alcance

- Eliminar o desactivar elementos.
- Catálogos fijos del sistema: estatus, métodos de pago, tipos de movimiento, roles, años y meses.
- Cambios de esquema, RLS o funciones SQL.

## Estado verificado en la base (2026-11-09)

- Tipos de cuota: 1 "Acceso Completo" $250 (teléfono ✓, tarjeta ✓) y 2 "Acceso Peatonal" $100 (teléfono ✗, tarjeta ✓). Cada uno tiene exactamente una fila en `concepto_pago_acceso`.
- Conceptos extra: 3 "Tarjeta de Acceso" $100 y 4 "2 Tarjetas de Acceso" $200, sin filas de accesos, que es lo correcto.
- Ninguna de las cuatro tablas tiene restricción única sobre `nombre`. Los duplicados se controlan en la acción.

## Riesgo existente

La RLS actual permite que cualquier usuario autenticado escriba en estas tablas (`USING true`), así que con herramientas externas puede saltarse la app. Las acciones validan el rol en el servidor, pero la protección real requiere políticas por rol en la base. Además, la política de `conceptos_recargo` está asignada al rol `public`, no a `authenticated`, así que incluso alguien **sin sesión** podría modificar los recargos usando la llave pública. Queda como recomendación para un cambio aparte, de prioridad alta en el caso de `conceptos_recargo`.
