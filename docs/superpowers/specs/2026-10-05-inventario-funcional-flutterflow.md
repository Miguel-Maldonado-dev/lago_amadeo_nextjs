# Anexo: inventario funcional de la app FlutterFlow

> Referencia para la migración descrita en [la especificación](./2026-10-05-migracion-flutterflow-nextjs-design.md). Se conserva en inglés tal como se levantó del código fuente (`lago_amadeo_flutterflow/lib`) y de la base de datos (consultas de solo lectura vía MCP). Nada fue modificado.

**Five things that matter most for the migration:**
- **Security is UI-only.** The role checks in the app only hide buttons. Every RLS policy is `USING true` for any authenticated user. The `create-user` edge function doesn't check the caller's role, and the CSV/TXT export functions have no JWT check at all.
- **`.order('col')` with no argument sorts descending** in postgrest-dart 2.4.2. This affects several lists (noted where it applies). supabase-js defaults to ascending, so orders must be made explicit.
- **Paying a cuota is several separate client calls with no transaction:** insert the pago, generate the PDF, save the PDF, mark the cuota Pagado.
- **The ledger is fed by a database trigger.** Each new pago automatically creates an "Ingreso" movement, and the balance is computed from movements only.
- **Role names drive the UI:** `'Administrador'` (only role that sees Usuarios) and `'Tesorero'` (can create cuotas, payments and movements alongside Administrador). `Comite` and `Vigilancia` see everything else read-only, except that any role can edit domicilios, residents, phones and cards.

**Conventions**
- Paths are relative to `lago_amadeo_flutterflow/lib/`.
- No form uses validators. Each form checks required fields in its submit button and shows the snackbar "Por favor, ingresa todos los datos obligatorios. (*)".
- Every list uses `FlutterFlowDataTable`: loads all rows, paginates in the browser (10 rows per page).
- After a dialog closes, the page re-fetches its data.
- Currency is shown as `$#,##0.00`; dates in tables as `dd/MM/y`, in forms as `d/M/y`.

---

## 1. Infrastructure

- **Supabase client**: URL `https://btwyaowauztohdglnfjm.supabase.co`, anon key hardcoded. `authFlowType: implicit`.
- **Startup**: title "Lago Amadeo". Light theme only. Splash spinner 1 s.
- **Custom functions**: `filterDomiciliosByDireccion` (case-insensitive contains on `direccion`); `getFechaVencimiento(mes, anio)` = last day of month.
- **Action block `getUserInfo`**: runs if `userName` empty; queries `users_info` where `id = currentUserUid`; sets `userName`, `userEmail`, `userRole` (= `role_name`), `isActiveUser` (= `is_active`). Throws if no row. Called on load by every page and after login.
- **API calls**:
  - `GenerarReciboPDFCall`: `POST {APIURL}/functions/v1/generar-recibo-b64`, `Authorization: Bearer {anon key}`. Body `direccion, residente, periodo, concepto, fecha_vencimiento, importe, descuento, recargo, fecha_pago, referencia`. Reads `$.file` (base64 PDF) and `$.file_name`.
  - `GenerarCuotasCall`: `POST {APIURL}/rest/v1/rpc/generar_cuotas`, headers `apikey` + `Bearer {user JWT}`. Body `{p_anio, p_mes}`.
- **No realtime, no Storage buckets.** PDFs are stored as base64 text in `pagos.file_data`.
- **Edge functions used**: `generar-recibo-b64`, `create-user`, `create-eldesgate-csv`, `create-zkteco-txt`. Deployed but unused: `generar-recibo`.
- **External endpoint**: `http://localhost:8000/print`, a local print agent for receipts.

## 2. Auth flow

- Email and password only (`signInWithPassword`). No other providers, no sign-up, no password reset. Users are created by admins through `create-user`.
- Profile: `public.users` (`id` = auth uid, `user_name`, `email`, `is_active`), `user_roles` (`user_id`, `role_id`), `roles` (`role_name`). View `users_info` = users LEFT JOIN user_roles LEFT JOIN roles: `id, email, user_name, is_active, created_at, role_name, role_id`.
- Roles: 1 Administrador, 2 Tesorero, 3 Comite, 4 Vigilancia.
- Login sequence: sign in → `getUserInfo` → if `isActiveUser` go to HomePage; else snackbar "Tu cuenta se encuentra inactiva o suspendida, por favor contacta al administrador del sistema.", `signOut()`, clear state.
- Logout (sidebar): `signOut()`, clear state, go to Login.

## 3. App state (in-memory only)

| Field | Purpose |
|---|---|
| `userName` | Sidebar footer; "already loaded" flag |
| `userEmail` | Stored only |
| `userRole` | Role gating (`'Administrador'`, `'Tesorero'`); shown in sidebar |
| `isActiveUser` | Login gate |

## 4. Routing

`/` shows HomePage if logged in, else Login. Auth-required routes redirect to `/login` saving the target.

| Name | Path | Params | requireAuth |
|---|---|---|---|
| HomePage | `/homePage` | – | yes |
| Login | `/login` | – | no |
| Domicilios | `/domicilios` | – | yes |
| DetalleDomicilio | `/detalleDomicilio` | `domicilioID` (int, query) | yes |
| Cuotas | `/cuotas` | – | yes |
| Residentes | `/residentes` | – | yes |
| Pagos | `/pagos` | – | yes |
| Movimientos | `/movimientos` | – | yes |
| Reportes | `/reportes` | – | yes |
| Usuarios | `/usuarios` | – | yes (no role check) |

## 5. Theme

Core: primary `#065F46`, secondary `#E7FBFB`, tertiary `#EE8B60`, alternate `#E0E3E7`, primaryText `#14181B`, secondaryText `#57636C`, primaryBackground `#F1F4F8`, secondaryBackground `#FFFFFF`, success `#22C55E`, warning `#F59E0B`, error `#EF4444`, info `#C5D7F6`.
Custom: iconColor `#94A3B8`, borderColor `#E2E8F0`, textColor `#4C9A9A`, headerColor `#E1E3E4`; badges success `#C8E7D7`/`#324C41`, error `#F0A6A6`/`#6A1B1B`, warning `#F1D5A3`/`#B47512`; ingresoColor `#065F3B`, egresoColor `#951C1C`.
Fonts: Inter Tight (display/headline/title), Inter (label/body). Spacing 4/8/16/24/32. Radius 8/16/24/full. Receipt dialog background `#444444`.

## 6. Sidebar and AppBar

Sidebar: width 270, hidden on phone/tablet with no alternative navigation. Header "Lago Amadeo" / "Administración". Items in order: Inicio, Domicilios, Residentes, Cuotas, Pagos, Movimientos Financieros, Reportes, Usuarios (only if `userRole == 'Administrador'`). Footer: `userName`, `userRole`, logout icon.
AppBar: static "Panel de Administración" and a bell icon with no action.

## 7. Pages

### 7.1 Login
Email, Password (show/hide). Supabase errors shown in snackbar "Error: …". Blocks login if `is_active == false`. Footer text "¿No tienes una cuenta? Contacta a tu administración" (not a link).

### 7.2 HomePage (dashboard)
Reads `resumen_financiero_completo` (first row). Cards: "RESUMEN GENERAL" → SALDO ACTUAL (`saldo_actual`), INGRESOS ACUMULADOS (`total_ingresos`), EGRESOS ACUMULADOS (`total_egresos`); "RESUMEN MES ACTUAL" → INGRESOS DEL MES, EGRESOS DEL MES; "RESUMEN MES ANTERIOR" → `ingresos_mes_anterior`, `egresos_mes_anterior`.

### 7.3 Domicilios
Reads `domicilios_info` ordered by `direccion` asc. Counter "TOTAL UNIDADES". Search "Buscar domicilio..." (client-side filter, 2000 ms debounce). Columns: Dirección, Fecha de Registro (`fecha_alta`), Residente Principal, Estatus (badge red for `'Moroso'`, green for `'Al corriente'`). "Nuevo Domicilio" → AddDomicilio. Row tap → DetalleDomicilio. No role gating.

### 7.4 DetalleDomicilio
Reads: `domicilios_info` (`id`), `residentes` (id asc), `telefonos_acceso` (id asc), `tarjetas_acceso`, `cuotas_info` (anio desc, mes desc), `pagos_info` (`domicilio_id`, `tipo_pago_id = 2`, id desc). "Recibo" on paid cuota: `pagos` where `cuota_id` → first row id → ViewRecibo.
Deletes (confirm dialogs "Eliminar Número"/"Eliminar Tarjeta"/"Eliminar Residente"): `telefonos_acceso`, `tarjetas_acceso`, `residentes` by id.
Sections:
- Header "Volver" → Domicilios.
- Info card: Dirección (edit → EditDomicilio), FECHA DE REGISTRO, TIPO DE CUOTA MENSUAL (`tipo_cuota`), estatus badge.
- "Números de Acceso": visible when `acceso_telefono ?? true`; "Agregar Número" only while < 2 phones; edit/delete per card; empty: "No hay números registrados para el acceso."
- "Acceso Peatonal": visible when `acceso_tarjeta ?? true`; "Agregar Tarjeta" only while < 3 cards; edit/delete; empty: "No hay tarjetas registradas para el acceso."
- "Residentes": "Agregar Residente"; table Nombre, Teléfono, Residente Principal (check), Acciones (edit, delete).
- "Cuotas": "Crear Cuota" → GenerarCuotaDomicilio; table Periodo, Concepto, Importe (`importe_cuota`), Vencimiento (`fecha_vencimiento_formated`), Estado (badge from stored `estatus`), Acciones: "Pagar" → RegistrarPagoCuota; edit → EditarCuota; "Recibo" (only when Pagado) → ViewRecibo.
- "Pagos Extra": "Pago Extra" → RegistrarPagoExtra(domicilioID); table Concepto, Importe, Fecha de Pago, Acciones ("Recibo").
Gating: "Crear Cuota", "Pago Extra": Administrador or Tesorero. "Pagar" and edit-cuota: Administrador or Tesorero and Estado in (Pendiente, Vencido). Everything else open.

### 7.5 Residentes
Filter dropdown from `domicilios` (value id, label `direccion`, searchable, hint "Seleccionar domicilio..."). List `residentes_info` where `domicilio_id` (optional), ordered `direccion` asc then `id` desc. Table: Dirección, Nombre, Teléfono, Residente Principal. Read-only. Bug: clear-filter resets the dropdown but doesn't reload the list.

### 7.6 Cuotas
Defaults: current year and month. Reads `cuotas_info` where `anio`, `mes`, ordered `direccion` asc. Dropdowns: `anios`, `meses` (value `id`, label `name`), `estatus` (value/label `name`). Year/month re-query; estatus filters in memory. Clear-filters resets to current period. Table: Dirección, Periodo, Concepto, Importe, Vencimiento, Estatus badge (Pendiente warning, Pagado success, Vencido error). "Generar Cuotas" → GenerarCuotas (Administrador or Tesorero).

### 7.7 Pagos
Reads `pagos_info` ordered `id` desc. Table: Referencia, Concepto, Domicilio, Importe, Fecha de Pago, Acciones ("Recibo"). "Pago Extra" → RegistrarPagoExtra() without domicilio (Administrador or Tesorero).

### 7.8 Movimientos
"SALDO ACTUAL" card from `resumen_financiero_completo.saldo_actual`. List `movimientos_info` ordered `id` desc. Table: Tipo, Descripción, Importe (Egreso `- $x` in egresoColor; else `+ $x` in ingresoColor), Fecha. "Nuevo Movimiento" → RegistrarMovimiento (Administrador or Tesorero).

### 7.9 Reportes (3 tabs, no role gating, no PDF/Excel export)
**Tab 1 "Pagos por Usuario"**: Usuario dropdown (`users_info` where `role_name` in Administrador, Tesorero; value `id`, label `user_name`); Fecha inicio (1900–today); Fecha fin (inicio–today; requires inicio first: "Primero debes seleccionar la fecha de inicio."). Search: all inputs required ("Debes seleccionar todos los filtros para poder generar el reporte."); queries `reporte_pagos_detalle` where `user_id`, `fecha_pago >= inicio`, `<= fin`, ordered `id` desc. TOTAL = sum of `importe` in browser. Table: Referencia, Usuario (`nombre_usuario`), Método de Pago (`metodo_pago_nombre`), Importe, Fecha de Pago, Acciones ("Recibo").
**Tab 2 "Acceso Vehicular"**: Año, Mes (defaults current). Search: `accesos_telefono_info` where `anio`, `mes`, ordered `direccion` asc; enables CSV if rows. "Salida" dropdown `'1'`, `'2'`, `'BOTH'` (default `'1'`). "Descargar CSV" opens `{APIURL}/functions/v1/create-eldesgate-csv?mes=&anio=&salida=`. Table: Domicilio, Teléfono 1, Teléfono 2.
**Tab 3 "Acceso Peatonal"**: Año, Mes. Search: `accesos_tarjeta_info`, ordered `direccion` asc; enables TXT if rows. "ID Inicio" (digits). "Descargar TXT" (needs rows and ID Inicio) opens `{APIURL}/functions/v1/create-zkteco-txt?mes=&anio=&inicioID=`. Table: Domicilio, Tarjeta 1, Tarjeta 2, Tarjeta 3.

Edge function details:
- `create-eldesgate-csv` (service role, no JWT): validates mes 1–12, anio ≥ 2000, salida in 1/2/BOTH. Reads `domicilios_telefonos_acceso` for month/year. Semicolon CSV, header `User Name;Tel Number;Relay No.;Sch.1…Sch.8;Year;Month;Day;Hour;Minute;Ring Counter;Ring Counter Status`; row `direccion;telefono;<salida>;0;0;0;0;0;0;0;0;;;;;;;`. File `accesos_telefonicos_{anio}_{MM}.csv`.
- `create-zkteco-txt` (service role, no JWT): validates mes, anio, inicioID. Pedestrian-only concepts → their domicilios → those with cuota `estatus_id = 2` for the period → cards from `domicilios_tarjetas_acceso`. Tab-separated, header `ID de usuario, Nombre, Apellido, Número de tarjeta, No. de departamento, Departamento, Género`; rows `currentID++, direccion, "Tarjeta N", digits, 1, "Company Name", "Masculino"`. CRLF, Windows-1252. File `accesos_tarjeta_{anio}_{MM}.txt`.

### 7.10 Usuarios
Reads `users_info` where `is_active` = dropdown (default true; Activos/Inactivos), ordered `created_at` asc. Deactivate (confirm "Desactivar Usuario"): `users` UPDATE `{is_active: false}`. Activate (no confirm): `{is_active: true}`, snackbar "El usuario fue activado correctamente." Table: Nombre, Email, Rol, Acciones. "Nuevo Usuario" → AddUser; edit → EditUser. Deactivate icon hidden for own row. Page has no role check.

## 8. Components

| Component | Purpose | Params | Reads | Writes / calls | Form fields (required = *) | Notes |
|---|---|---|---|---|---|---|
| add_domicilio | Create domicilio | – | `conceptos_pago` where `tipo_pago_id=1`; `domicilios_info` where `direccion = input` (duplicate check) | `domicilios` INSERT `{direccion, fecha_alta, observaciones, created_by}`; if cuota type picked: `domicilio_concepto` INSERT `{domicilio_id, concepto_id}` | Dirección* (UPPERCASE); Fecha de Registro* (default today); Tipo de Cuota; Observaciones | "Domicilio agregado correctamente." / "Este domicilio ya se encuentra registrado." |
| edit_domicilio | Edit domicilio | `domicilioInfo` | `conceptos_pago` (tipo 1); `domicilio_concepto` where `domicilio_id` | `domicilios` UPDATE `{direccion, fecha_alta, observaciones}`; `domicilio_concepto` INSERT if none else UPDATE `{concepto_id}` | Same, prefilled | "Domicilio actualizado correctamente." |
| add_numero | Add phone | `domicilioID` | – | `telefonos_acceso` INSERT `{domicilio_id, telefono}` | Número* digits ≤10 | Max 2 enforced on page |
| edit_numero | Edit phone | `telefonoInfo` | – | UPDATE `{telefono}` | Same | |
| add_tarjeta | Add card | `domicilioID` | – | `tarjetas_acceso` INSERT `{domicilio_id, numero}` | Número* digits ≤10 | Max 3 enforced on page |
| edit_tarjeta | Edit card | `tarjetaInfo` | – | UPDATE `{numero}` | Same | |
| add_residente | Add resident | `domicilioID` | – | `residentes` INSERT `{nombre, telefono, domicilio_id}` | Nombre* (Title Case); Teléfono digits ≤10 | Trigger makes first resident principal |
| edit_residente | Edit resident | `residenteInfo` | – | UPDATE `{nombre, telefono, es_principal}` | Nombre*, Teléfono, checkbox "Residente Principal" | Trigger un-marks others |
| add_user | Create user | – | `roles` (id asc) | POST `/functions/v1/create-user` `{email, password, user_name, role_id}` with `apikey` + user JWT; checks `$.success` | Nombre*, Email*, Contraseña*, Rol* | "Usuario creado correctamente." / "No fue posible crear el usuario…" |
| edit_user | Edit user | `userInfo` | `roles` | `users` UPDATE `{user_name}`; `user_roles` UPDATE `{role_id}` where `user_id` | Nombre*, Rol* (disabled for self) | Email/password not editable |
| editar_cuota | Discount/surcharge | `cuotaID` | `descuento_cuota`, `recargo_cuota` where `cuota_id`; `conceptos_descuento`, `conceptos_recargo` | Remove (confirm): DELETE by id. Save: INSERT `descuento_cuota {cuota_id, concepto_descuento_id}` and/or `recargo_cuota {cuota_id, concepto_recargo_id}` if none | Descuento, Recargo (optional) | Max one each. "Cuota editada correctamente." |
| generar_cuota_domicilio | One cuota | `domicilioID` | `anios`, `meses`; `cuotas` where `domicilio_id, anio, mes`; `domicilio_concepto_info` | INSERT `cuotas {domicilio_id, anio, mes, fecha_vencimiento (last day), estatus_id: 1, concepto_id, importe}` | Año*, Mes* | "Cuota generada correctamente." / "Ya existe una cuota registrada para el año y mes seleccionados." |
| generar_cuotas | Bulk cuotas | – | `anios`, `meses` | RPC `generar_cuotas(p_anio, p_mes)` | Año, Mes | "Cuotas generadas correctamente."; silent on failure |
| registrar_pago_cuota | Pay cuota + receipt | `cuotaInfo` | `metodos_pago` | (1) `pagos` INSERT `{domicilio_id, cuota_id, concepto_id, fecha_pago, metodo_pago_id, user_id, importe: importe_cuota}` returning `referencia`; (2) receipt call; (3) UPDATE `file_data`; (4) `cuotas` UPDATE `{estatus_id: 2}` always | Header: DIRECCIÓN, RESIDENTE, PERIODO, FECHA DE VENCIMIENTO, CONCEPTO, IMPORTE. Inputs: Fecha de Pago* (≤ today), Método de Pago* | Not transactional. "Pago registrado correctamente." Receipt args: `importe = importe_base`, `descuento = monto_descuento`, `recargo = monto_recargo`, `vencimiento = fecha_vencimiento_formated`, `fechaPago dd/MM/y` |
| registrar_pago_extra | Extra charge + receipt | `domicilioID?` | `domicilios_info` (by id or all), `conceptos_pago` tipo 2, `metodos_pago` | `pagos` INSERT without `cuota_id`; receipt with `direccion, residente, concepto, importe, fechaPago, referencia`; UPDATE `file_data` | Dirección* (searchable, disabled if preset), Concepto* (sets IMPORTE read-only), Fecha de Pago* (≤ today), Método de Pago* | "Pago registrado correctamente." |
| registrar_movimiento | Manual ledger entry | – | `tipos_movimientos`, `metodos_pago` | `movimientos_financieros` INSERT `{tipo_id, descripcion, importe, metodo_pago_id, user_id, fecha_movimiento}` | Tipo*, Importe* (`^[0-9.]+$`), Descripción*, Fecha* (≤ today), Método de Pago* | Title wrongly "Registrar Pago Extra". "Movimiento registrado correctamente." |
| view_recibo | View/download/print receipt | `pagoID` | `pagos` where `id` | Download `<referencia>.pdf`; Print: POST `http://localhost:8000/print` `{pdf_base64}` checks `$.success` | – | Dialog 460×662, bg `#444444`, title = referencia. "El ticket se imprimió correctamente." / "Error al imprimir el ticket." |
| empty | Placeholder | `isRounded?` | – | – | – | "Sin información disponible" / "No hay información disponible para mostrar." |
| loading | Loading GIF | – | – | – | – | |

Receipt edge function `generar-recibo-b64` (JWT verified; anon key accepted): pdf-lib, 164×450 pt (58 mm), Helvetica. Content: "Cerrada Lago Amadeo", "RECIBO DE PAGO", Dirección, Residente, Periodo (if given), Concepto, Vencimiento (if given), Fecha de Pago; Subtotal, +Recargo, −Descuento, TOTAL; Referencia text + QR; "Gracias por su pago". Returns `{file: base64, file_name: "recibo_pago.pdf"}`.

## 9. Database facts

**Lookups**: `estatus` 1 Pendiente, 2 Pagado, 3 Vencido. `tipos_movimientos` 1 Ingreso, 2 Egreso. `tipo_pago` 1 recurrente, 2 extra. `metodos_pago` 1 Efectivo, 2 Transferencia. `conceptos_pago`: 1 "Acceso Completo" $250 recurrente; 2 "Acceso Peatonal" $100 recurrente; 3 "Tarjeta de Acceso" $100 extra; 4 "2 Tarjetas de Acceso" $200 extra. `concepto_pago_acceso`: concepto 1 → phone + card; concepto 2 → card only. `conceptos_descuento`: Descuento Comité, Pago Anticipado, Descuento Proveedor ($250 each). `conceptos_recargo`: Pago Tardío $50.

**Views used by the app**
- `cuotas_info`: `periodo` = `'Ene'…'Dic'/anio`; `importe_cuota` = `importe` + recargos − descuentos; `importe_base` = `conceptos_pago.importe`; `fecha_vencimiento_formated` `DD/MM/YYYY`; `estatus` = name; `estatus_calculado` (unused by UI); `residente_principal` or `'Sin información'`.
- `domicilios_info`: principal resident, `id_concepto`, `tipo_cuota`, `acceso_telefono`/`acceso_tarjeta` (default false), `estatus` = 'Moroso' if any cuota `estatus_id = 3` else 'Al corriente'.
- `pagos_info`: pagos + `direccion`, `concepto`, `metodo_pago`, `mes`, `anio`, `tipo_pago_id`.
- `movimientos_info`: + `tipo_movimiento`, `metodo_pago`.
- `residentes_info`: + `direccion`.
- `users_info`: see §2.
- `reporte_pagos_detalle`: pagos + `nombre_usuario`, `usuario` (email), `metodo_pago_nombre`.
- `accesos_telefono_info` / `accesos_tarjeta_info`: one row per cuota with `estatus_id = 2` whose concept grants phone/card; `telefono_1..2`, `tarjeta_1..3`.
- `resumen_financiero_completo`: `total_ingresos`, `total_egresos`, `saldo_actual`, `ingresos_mes`, `egresos_mes`, `ingresos_mes_anterior`, `egresos_mes_anterior` over `movimientos_financieros`.
- `domicilio_concepto_info`: domicilio's concept with name and importe.

**Functions, triggers, cron**
- `generar_cuotas(p_anio, p_mes)`: for each `domicilio_concepto`, inserts cuota (last day of month, estatus 1, concept, `conceptos_pago.importe`) unless one exists for same domicilio, concept, year, month.
- `trg_pagos_to_movimientos` AFTER INSERT on `pagos`: inserts movement tipo 1 "Pago referencia:  <uuid>", same importe, método, referencia, user, `fecha_movimiento = fecha_pago`. Skipped if importe 0.
- `trg_residente_principal` BEFORE INSERT/UPDATE on `residentes`: null → false; first resident → principal; setting principal un-marks others.
- `trg_actualizar_cuotas_concepto` AFTER UPDATE OF `concepto_id` on `domicilio_concepto`: reprices Pendiente cuotas. Not on INSERT.
- `marcar_cuotas_vencidas()` via cron "Actualizar Estatus Cuotas" at `0 6 * * *`: sets estatus 3 where past due, not already 3, and no `pagos` row.
- `pagos.referencia`, `movimientos_financieros.referencia`: `uuid default gen_random_uuid()`.

**RLS**: enabled everywhere; one policy per table, `ALL` for `authenticated`, `USING true` / `WITH CHECK true` (`conceptos_recargo`, `tipos_movimientos` to `public`).

**`create-user` edge function** (JWT verified, no role check): validates four fields; `auth.admin.createUser({email, password, email_confirm: true})`; inserts `users {id, user_name, email, is_active: true}` and `user_roles {user_id, role_id}` with manual rollback; returns `{success: true, user_id, message}`.

## 10. Business rules

- Domicilio has one `domicilio_concepto` (Acceso Completo $250 or Acceso Peatonal $100). Concept decides access sections: phones (max 2, only Acceso Completo), cards (max 3, both). Dirección unique (app-side check on create only).
- Cuotas: monthly per domicilio; bulk via RPC or single from detail. Due date last day of month; starts Pendiente; daily cron → Vencido; paying → Pagado (by app). Domicilio "Moroso" if any Vencido cuota.
- Amount due = `importe` + surcharges − discounts; at most one each in UI, only while Pendiente/Vencido. Concept change reprices Pendiente cuotas (trigger).
- Payments: cuota payment stores `importe_cuota`; extra payment stores concept list price, no cuota. Each gets UUID `referencia`, base64 PDF in `file_data`, and (trigger) an Ingreso movement. Receipt subtotal uses `importe_base`.
- Balance = Σ Ingreso − Σ Egreso over `movimientos_financieros`.
- Exports include only domicilios whose cuota for the selected month is Pagado.
- Users soft-deleted via `is_active`.

## 11. Observed quirks

- `getUserInfo` crashes if the user has no `users_info` row.
- `.order()` defaults to descending in postgrest-dart: Pagos, Movimientos, reporte lists newest first; detail cuotas newest period first; Residentes id desc within address.
- Residentes clear-filter doesn't reload the list.
- GenerarCuotas gives no feedback on failure.
- Anon key hardcoded in two places.
