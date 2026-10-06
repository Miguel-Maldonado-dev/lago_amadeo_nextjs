# Migración Lago Amadeo: FlutterFlow → Next.js + Supabase

Fecha: 2026-10-05
Estado: aprobado en conversación, pendiente de revisión escrita
Repositorio destino: `lago_amadeo_nextjs/` (git iniciado, sin commits)
Fuente: `lago_amadeo_flutterflow/` (Flutter web generado por FlutterFlow)
Anexo: [Inventario funcional de la app Flutter](./2026-10-05-inventario-funcional-flutterflow.md)

## 1. Contexto

Lago Amadeo es un panel de administración interno para una cerrada residencial. Gestiona domicilios, residentes, accesos (teléfonos y tarjetas), cuotas mensuales, pagos con recibo PDF, un libro de movimientos financieros, reportes con exportación a sistemas de control de acceso, y usuarios con roles.

La app actual es Flutter web generada con FlutterFlow. El backend es un proyecto Supabase (`btwyaowauztohdglnfjm`) con datos productivos. Toda la lógica de negocio relevante vive ya en Postgres (vistas, triggers, función `generar_cuotas`, cron diario) y en cuatro edge functions. Esa capa se reutiliza sin cambios.

## 2. Objetivos

1. Un usuario actual puede hacer en la app Next.js todo lo que hace hoy, con los mismos datos y los mismos textos en español.
2. Los permisos por rol se verifican en el servidor, no solo en la interfaz.
3. La base de datos, sus políticas RLS y las edge functions no se modifican.
4. No se usa la service role key en ningún punto del proyecto.

## 3. Fuera de alcance

- Cambios de esquema, RLS, funciones SQL, cron o edge functions.
- Registro de usuarios y recuperación de contraseña (hoy tampoco existen).
- Modo oscuro, tiempo real, notificaciones (el icono de campana de hoy no hace nada y se omite).
- Migración de datos: es la misma base de datos.
- Pruebas end-to-end que escriban en la base de datos.
- El componente `add_c_o_m_p` (prototipo sin uso) y la edge function `generar-recibo` (sin uso).

## 4. Restricciones de trabajo

- El MCP de Supabase está en modo solo lectura; se usa para consultar esquema y generar tipos.
- No se hacen commits ni se levanta el servidor de desarrollo; eso lo hace el propietario del proyecto.
- Dependencias con versión fijada y lockfile incluido.

## 5. Arquitectura

### 5.1 Decisión

Next.js App Router con capa de servidor:

- **Server Components** para todas las lecturas, usando el cliente Supabase de servidor con la sesión del usuario en cookies. La base de datos ve al usuario real y RLS aplica igual que hoy.
- **Server Actions** para todas las escrituras. Cada acción valida entrada con zod y verifica rol antes de tocar datos.
- **Route Handlers** para respuestas binarias: recibos PDF y exports CSV/TXT. Exigen sesión y reenvían a las edge functions.
- **`proxy.ts`** (equivalente de middleware en Next.js 16) para refrescar la sesión y redirigir.

Alternativas descartadas: SPA en cliente (roles solo en UI, contradice el objetivo 2) y capa API con service role (anula RLS y obliga a pasar `user_id` manualmente).

### 5.2 Stack

| Pieza | Elección |
|---|---|
| Framework | Next.js 16.x, React 19, TypeScript estricto |
| Estilos | Tailwind CSS 4 |
| Componentes | shadcn/ui (Radix): Dialog, AlertDialog, Select, Tabs, Popover, Calendar, Sheet, Badge, Button, Input, Checkbox, Skeleton, Table |
| Tablas | TanStack Table (paginación en cliente de 10 filas, ordenamiento) |
| Formularios | react-hook-form + zod |
| Avisos | sonner (toasts) |
| Supabase | `@supabase/supabase-js` 2.x y `@supabase/ssr` 0.12.x, fijadas |
| Tipos BD | `src/lib/supabase/database.types.ts`, generados con el MCP (`generate_typescript_types`) |
| Fuentes | Inter e Inter Tight vía `next/font/google` |
| Iconos | lucide-react |
| PDF | Sin librería: `iframe` sobre blob URL |
| Pruebas | Vitest, React Testing Library, `tsc --noEmit`, ESLint |

### 5.3 Estructura del proyecto

```
lago_amadeo_nextjs/
  src/
    app/
      layout.tsx                 # html, fuentes, Toaster
      (auth)/login/page.tsx
      (app)/layout.tsx           # exige sesión y usuario activo; sidebar + barra superior
      (app)/page.tsx             # dashboard
      (app)/domicilios/page.tsx
      (app)/domicilios/[id]/page.tsx
      (app)/cuotas/page.tsx
      (app)/residentes/page.tsx
      (app)/pagos/page.tsx
      (app)/movimientos/page.tsx
      (app)/reportes/page.tsx
      (app)/usuarios/page.tsx    # requireRole('Administrador'), 404 para otros
      (app)/error.tsx, not-found.tsx
      api/auth/signout/route.ts  # cierra sesión y redirige a /login (usado para cuentas inactivas)
      api/recibos/[pagoId]/route.ts
      api/exports/eldesgate/route.ts
      api/exports/zkteco/route.ts
    proxy.ts
    lib/
      supabase/server.ts         # createServerClient con cookies (React cache por request)
      supabase/proxy.ts          # helper updateSession para proxy.ts
      supabase/database.types.ts
      auth/current-user.ts       # getCurrentUser(): claims + fila de users_info
      auth/require-role.ts       # requireRole(...roles) y constantes de roles
      format.ts                  # moneda $#,##0.00, fechas dd/MM/yyyy
      constants.ts               # ids de estatus, tipos de pago, tipos de movimiento
      action-result.ts           # tipo ActionResult<T> = { ok: true, data } | { ok: false, error }
    features/
      auth/        actions.ts (login, logout), components/login-form.tsx
      dashboard/   queries.ts, components/kpi-cards.tsx
      domicilios/  queries.ts, actions.ts, schemas.ts, components/*
      residentes/  queries.ts, actions.ts, schemas.ts, components/*
      accesos/     actions.ts, schemas.ts, components/* (teléfonos y tarjetas)
      cuotas/      queries.ts, actions.ts, schemas.ts, components/*
      pagos/       queries.ts, actions.ts, schemas.ts, components/* (pago cuota, pago extra, recibo)
      movimientos/ queries.ts, actions.ts, schemas.ts, components/*
      reportes/    queries.ts, components/*
      usuarios/    queries.ts, actions.ts, schemas.ts, components/*
    components/
      ui/*                       # shadcn
      layout/sidebar.tsx, app-bar.tsx, mobile-nav.tsx
      data-table/data-table.tsx, pagination.tsx
      status-badge.tsx, empty-state.tsx, confirm-dialog.tsx, date-field.tsx, money.tsx
  docs/superpowers/specs/
  .env.example
```

Cada `features/<dominio>/queries.ts` exporta funciones tipadas que reciben el cliente de servidor y devuelven filas de las vistas. Cada `actions.ts` lleva `'use server'`, valida con el schema de `schemas.ts`, llama a `requireRole` cuando aplica, escribe, hace `revalidatePath` y devuelve `ActionResult`.

## 6. Rutas

| Flutter | Next.js | Acceso |
|---|---|---|
| `/` y `/homePage` | `/` | Sesión |
| `/login` | `/login` | Público; con sesión redirige a `/` |
| `/domicilios` | `/domicilios` | Sesión |
| `/detalleDomicilio?domicilioID=N` | `/domicilios/[id]` | Sesión; id inválido o inexistente → 404 |
| `/residentes` | `/residentes?domicilio=N` | Sesión |
| `/cuotas` | `/cuotas?anio=&mes=` | Sesión |
| `/pagos` | `/pagos` | Sesión |
| `/movimientos` | `/movimientos` | Sesión |
| `/reportes` | `/reportes?tab=usuario\|vehicular\|peatonal` + filtros | Sesión |
| `/usuarios` | `/usuarios?estado=activos\|inactivos` | Administrador |

Redirección tras login: `proxy.ts` guarda la ruta solicitada en `?next=` al mandar a `/login`, y el login vuelve ahí tras autenticar.

## 7. Autenticación y autorización

### 7.1 Sesión

- Login: Server Action `login(email, password)` → `supabase.auth.signInWithPassword`. Las cookies las escribe `@supabase/ssr`. Error de credenciales → mensaje "Error: <mensaje de Supabase>" como hoy.
- `proxy.ts`: para cada petición (excepto estáticos) crea el cliente, llama `getClaims()`, refresca cookies; sin usuario y ruta no pública → `/login?next=`; con usuario y ruta `/login` → `/`.
- Logout: Server Action `logout()` → `signOut()` → redirect `/login`. El Route Handler `/api/auth/signout` hace lo mismo para el caso de cuenta inactiva.

### 7.2 Usuario actual

`getCurrentUser()` (en `lib/auth/current-user.ts`, envuelto en `React.cache`):
1. `supabase.auth.getClaims()`; sin claims → `null`.
2. Consulta `users_info` por `id = sub`. Devuelve `{ id, email, userName, roleName, roleId, isActive }`.
3. Si no hay fila en `users_info`, se trata como usuario inactivo (hoy la app explota; aquí se cierra sesión con mensaje).

El layout `(app)/layout.tsx` llama `getCurrentUser()`. Si es `null` → redirect `/login`. Si `isActive` es falso → redirect a `/api/auth/signout?reason=inactive`. Ese Route Handler hace `signOut()` (un layout no puede modificar cookies) y redirige a `/login?error=inactive`, donde el formulario muestra "Tu cuenta se encuentra inactiva o suspendida, por favor contacta al administrador del sistema."

### 7.3 Roles

Constantes: `Administrador`, `Tesorero`, `Comite`, `Vigilancia`. `requireRole(...roles)` obtiene el usuario actual y lanza un error de autorización si no coincide; en páginas se traduce a `notFound()`, en acciones a `{ ok: false, error: 'No tienes permiso para realizar esta acción.' }`.

| Operación | Roles permitidos |
|---|---|
| Ver `/usuarios`, crear, editar, activar, desactivar usuarios | Administrador |
| Generar cuotas (masivo y por domicilio), editar cuota (descuento y recargo) | Administrador, Tesorero |
| Registrar pago de cuota, pago extra, movimiento | Administrador, Tesorero |
| Todo lo demás (domicilios, residentes, teléfonos, tarjetas, ver recibos, reportes, exports) | Cualquier rol autenticado |

La interfaz además oculta los botones que el rol no puede usar, igual que hoy. La verificación en servidor es la que manda.

Nota: hoy la página de usuarios no verifica rol y las acciones de activar/desactivar tampoco. Se endurecen a Administrador, que es el único rol que ve el enlace.

## 8. Acceso a datos

### 8.1 Lecturas

Server Components con el cliente de cookies. Vistas y filtros, preservando el orden que ve el usuario hoy:

| Pantalla | Fuente | Filtro | Orden |
|---|---|---|---|
| Dashboard | `resumen_financiero_completo` | primera fila | — |
| Domicilios | `domicilios_info` | — | `direccion` asc |
| Detalle domicilio | `domicilios_info` (`id`), `residentes`, `telefonos_acceso`, `tarjetas_acceso`, `cuotas_info`, `pagos_info` (`tipo_pago_id = 2`) | `domicilio_id` | residentes/teléfonos/tarjetas `id` asc; cuotas `anio` desc, `mes` desc; pagos extra `id` desc |
| Residentes | `residentes_info`; opciones de `domicilios` | `domicilio_id` opcional | `direccion` asc, `id` asc |
| Cuotas | `cuotas_info`; opciones de `anios`, `meses`, `estatus` | `anio`, `mes` (default: actuales) | `direccion` asc |
| Pagos | `pagos_info` | — | `id` desc |
| Movimientos | `movimientos_info` + `resumen_financiero_completo.saldo_actual` | — | `id` desc |
| Reportes / usuario | `reporte_pagos_detalle`; opciones `users_info` con rol Administrador o Tesorero | `user_id`, `fecha_pago` entre inicio y fin | `id` desc |
| Reportes / vehicular | `accesos_telefono_info` | `anio`, `mes` | `direccion` asc |
| Reportes / peatonal | `accesos_tarjeta_info` | `anio`, `mes` | `direccion` asc |
| Usuarios | `users_info`; opciones `roles` | `is_active` (default true) | `created_at` asc |

Filtros que hoy re-consultan van en search params y re-renderizan en servidor. Filtros que hoy aplican en memoria (estatus en Cuotas, texto en Domicilios) se aplican en cliente sobre las filas ya cargadas, con debounce corto en la búsqueda.

### 8.2 Escrituras

Server Actions, una por operación, con las mismas tablas y columnas que hoy. Tras escribir: `revalidatePath` de la ruta afectada. Lista completa en el anexo, sección 8. Reglas relevantes:

- `domicilios` INSERT incluye `created_by = usuario actual`. Antes se verifica duplicado por `direccion` en `domicilios_info`.
- `domicilio_concepto`: INSERT si el domicilio no tiene; UPDATE de `concepto_id` si ya tiene. El trigger de la BD repreciará las cuotas pendientes.
- `residentes` INSERT sin `es_principal`; el trigger decide. UPDATE sí envía `es_principal`.
- Teléfonos: máximo 2 por domicilio; tarjetas: máximo 3. El límite se valida también en la acción, no solo ocultando el botón.
- Cuota individual: duplicado por `domicilio_id`, `anio`, `mes`. Si el domicilio no tiene concepto, la acción falla con "El domicilio no tiene un tipo de cuota asignado." (hoy inserta nulos y la BD rechaza).
- Editar cuota: solo si estatus es Pendiente o Vencido; máximo un descuento y un recargo.
- Usuarios: desactivar exige que no sea el propio usuario; activar y desactivar actualizan `users.is_active`.

### 8.3 Flujos compuestos

**Registrar pago de cuota** (`registrarPagoCuota`):
1. `requireRole(Administrador, Tesorero)`; validar `cuotaId`, `fechaPago` (≤ hoy), `metodoPagoId`.
2. Leer `cuotas_info` por id; rechazar si estatus es Pagado.
3. INSERT `pagos { domicilio_id, cuota_id, concepto_id, fecha_pago, metodo_pago_id, user_id, importe: importe_cuota }` con `select()` para obtener `referencia`.
4. POST a `{SUPABASE_URL}/functions/v1/generar-recibo-b64` con `Authorization: Bearer <JWT del usuario>` y `apikey`, cuerpo `{ direccion, residente, periodo, concepto, fecha_vencimiento, importe: importe_base, descuento, recargo, fecha_pago, referencia }`.
5. Si responde `file`: UPDATE `pagos.file_data`.
6. UPDATE `cuotas.estatus_id = 2` siempre, aunque el PDF falle.
7. Resultado: `ok` con `pagoId` y bandera `reciboGenerado`. La UI muestra "Pago registrado correctamente." y, si no hubo recibo, un aviso adicional.

El trigger `trg_pagos_to_movimientos` crea el movimiento de ingreso; la acción no lo hace.

**Registrar pago extra** (`registrarPagoExtra`): igual, sin `cuota_id`, con `importe` tomado de `conceptos_pago` en servidor (no del cliente), y cuerpo del recibo sin periodo, vencimiento, descuento ni recargo.

**Generar cuotas** (`generarCuotas`): `requireRole` → `supabase.rpc('generar_cuotas', { p_anio, p_mes })`. Error → mensaje visible (hoy falla en silencio).

**Crear usuario** (`crearUsuario`): `requireRole(Administrador)` → POST a `/functions/v1/create-user` con JWT del usuario y JSON serializado con `JSON.stringify`. Error de la función → se muestra su mensaje.

### 8.4 Route Handlers

- `GET /api/recibos/[pagoId]`: exige sesión; lee `pagos.file_data`; sin dato → 404; devuelve `application/pdf` con `Content-Disposition: inline; filename="<referencia>.pdf"`.
- `GET /api/exports/eldesgate?mes&anio&salida`: exige sesión; valida parámetros con zod; reenvía a `create-eldesgate-csv` y devuelve cuerpo, `Content-Type` y `Content-Disposition` de la función.
- `GET /api/exports/zkteco?mes&anio&inicioID`: igual contra `create-zkteco-txt`.

Limitación conocida: las edge functions de export no verifican JWT y siguen siendo accesibles directamente por URL. Cerrarlo requiere redesplegarlas, fuera de alcance.

### 8.5 Impresión local

El botón "Imprimir" del recibo hace POST desde el navegador a `http://localhost:8000/print` con `{ pdf_base64 }`, como hoy, porque el agente de impresión corre en la máquina del usuario. El base64 se obtiene en el navegador leyendo el blob de `/api/recibos/[id]`; no se expone `file_data` en props. No se necesita cliente Supabase en el navegador. Mensajes: "El ticket se imprimió correctamente." / "Error al imprimir el ticket."

## 9. Interfaz

### 9.1 Tokens

Tema claro único, definidos como variables CSS en `globals.css` y mapeados a Tailwind:

| Token | Valor | Uso |
|---|---|---|
| primary | `#065F46` | botones principales, enlaces activos |
| secondary | `#E7FBFB` | fondos suaves |
| tertiary | `#EE8B60` | acentos |
| background | `#F1F4F8` | fondo de página |
| surface | `#FFFFFF` | tarjetas, tablas |
| text | `#14181B` / `#57636C` | primario / secundario |
| border | `#E2E8F0` | bordes |
| header | `#E1E3E4` | cabecera de tablas |
| success badge | fondo `#C8E7D7`, texto `#324C41` | Pagado, Al corriente |
| warning badge | fondo `#F1D5A3`, texto `#B47512` | Pendiente |
| error badge | fondo `#F0A6A6`, texto `#6A1B1B` | Vencido, Moroso |
| ingreso / egreso | `#065F3B` / `#951C1C` | importes en movimientos |

Tipografía: Inter Tight para títulos, Inter para texto. Radios 8/16/24. Sombras suaves.

### 9.2 Layout

- Escritorio: sidebar fijo de 270 px con "Lago Amadeo / Administración", los 8 ítems en el orden actual (Usuarios solo para Administrador), pie con nombre, rol y botón de salir. Barra superior con "Panel de Administración".
- Móvil y tablet: el sidebar se convierte en un `Sheet` lateral abierto desde un botón en la barra superior. Es una mejora sobre la app actual, que no tenía navegación móvil.
- Tablas con scroll horizontal en pantallas estrechas.

### 9.3 Patrones

- Diálogos de alta y edición con shadcn `Dialog`; confirmaciones de borrado con `AlertDialog` y los títulos actuales ("Eliminar Número", "Eliminar Tarjeta", "Eliminar Residente", "Desactivar Usuario").
- Avisos con sonner usando los textos actuales (ver anexo).
- Campos obligatorios marcados con `*`; mensaje genérico "Por favor, ingresa todos los datos obligatorios. (*)" más mensajes por campo de zod.
- Estados vacíos con los textos actuales; carga con `Suspense` y skeletons por sección.
- Moneda `$#,##0.00` con `Intl.NumberFormat('es-MX')`; fechas `dd/MM/yyyy`.
- El diálogo de movimiento se titula "Registrar Movimiento" (corrige el título copiado de pago extra).

## 10. Manejo de errores

- Server Actions nunca lanzan hacia el cliente: devuelven `ActionResult`. Errores de Supabase se registran en servidor y se muestran al usuario como mensaje genérico salvo los casos con texto definido.
- Páginas: `error.tsx` por grupo con botón de reintentar; `not-found.tsx` para ids inválidos.
- Route Handlers: 401 sin sesión, 400 en parámetros inválidos, 404 sin recibo, 502 si la edge function falla.

## 11. Pruebas y verificación

- Unitarias con Vitest: `format.ts`, `schemas.ts` de cada dominio, `requireRole`, y las acciones compuestas (`registrarPagoCuota`, `registrarPagoExtra`, `crearUsuario`) con el cliente de Supabase y `fetch` simulados, cubriendo el orden de pasos y el comportamiento cuando el PDF falla.
- Componentes: pruebas de render de `StatusBadge`, `DataTable` (paginación) y del formulario de login.
- Estáticas: `tsc --noEmit`, ESLint, `next build`.
- Verificación funcional en navegador la hace el propietario al levantar el servidor. El plan de implementación incluirá una lista de comprobación manual por pantalla.

## 12. Configuración

`.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=https://btwyaowauztohdglnfjm.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Se usa la llave publicable (o la anon legacy si la publicable no está habilitada). El `.env.local` real no se versiona.

## 13. Correcciones incluidas respecto a la app actual

1. Limpiar el filtro en Residentes recarga la lista.
2. Título correcto en el diálogo de movimiento.
3. Error visible al fallar la generación masiva de cuotas.
4. `/usuarios` y sus acciones exigen rol Administrador en servidor.
5. Cuota individual sin concepto devuelve mensaje claro en vez de error de base de datos.
6. Usuario sin fila en `users_info` ve mensaje de cuenta inactiva en vez de un fallo.
7. Importe del pago extra se toma en servidor del concepto, no del formulario.
8. Residentes se ordenan por `id` ascendente dentro de cada dirección (hoy descendente por un default de la librería Dart).

## 14. Limitaciones conocidas que se mantienen

- El pago no es transaccional (varias escrituras sin transacción) porque no se modifica la BD.
- El recibo usa `importe_base` (precio actual del concepto) como subtotal, igual que hoy.
- RLS permisivo: cualquier usuario autenticado puede, con herramientas externas, escribir en cualquier tabla. La app lo mitiga en su propia capa.
- Edge functions de export sin verificación de JWT.
- El PDF se guarda en base64 dentro de `pagos.file_data`.

## 15. Secuencia de entrega sugerida

1. Scaffold, tokens, Supabase SSR, login, layout, dashboard.
2. Domicilios y detalle (residentes, teléfonos, tarjetas).
3. Cuotas (lista, generar masivo, generar individual, editar).
4. Pagos (pago cuota, pago extra, recibo con visor, descarga e impresión).
5. Movimientos.
6. Reportes y exports.
7. Usuarios.
8. Pruebas, lint, build, `.env.example`, README de arranque.
