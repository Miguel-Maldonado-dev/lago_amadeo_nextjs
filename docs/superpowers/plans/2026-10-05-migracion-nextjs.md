# Plan de implementación: migración Lago Amadeo a Next.js + Supabase

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruir en Next.js la app de administración Lago Amadeo con paridad funcional, verificando roles en servidor, sobre la misma base de datos Supabase sin modificarla.

**Architecture:** App Router de Next.js 16. Server Components leen de las vistas de Supabase con el cliente de cookies (`@supabase/ssr`); Server Actions escriben tras validar con zod y verificar rol; Route Handlers sirven PDFs y exports reenviando a las edge functions existentes. `src/proxy.ts` refresca la sesión y redirige. Código organizado por dominio en `src/features/<dominio>/{queries,actions,schemas,components}`.

**Tech Stack:** Next.js 16.3.8, React 19.3, TypeScript, Tailwind CSS 4, shadcn/ui (base Radix), react-hook-form 7 + zod 4, sonner, lucide-react, `@supabase/supabase-js` 2.117.2, `@supabase/ssr` 0.12.7, Vitest 5 + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-05-migracion-flutterflow-nextjs-design.md` (anexo: `2026-10-05-inventario-funcional-flutterflow.md`). Tipos generados de la BD: `docs/superpowers/generated/database.types.ts` (se mueve a `src/lib/supabase/` en la Tarea 1).

## Decisiones del plan que precisan la spec

- **Sin TanStack Table.** Las tablas solo necesitan paginación de 10 filas en cliente; se implementa un `DataTable` propio (Tarea 5). Evita la API cambiante de la v9.
- **Fechas con `<input type="date">` nativo** en vez de Calendar/Popover. Soporta `min`/`max` y no requiere react-day-picker.
- **Selects buscables** (domicilio) con `Command` + `Popover` de shadcn en un componente `SearchableSelect`.
- **Mocks de Supabase en pruebas** con el helper `fakeQuery` (Tarea 2), un objeto encadenable y "thenable".

## Global Constraints

- **No hacer commits.** El propietario del proyecto commitea. Cada tarea termina con `git status` mostrando los cambios, no con `git commit`.
- **No levantar el servidor** (`next dev`/`next start`). Verificación: `npm run typecheck`, `npm run lint`, `npm test`, y al final `npm run build`.
- **La base de datos no se modifica.** Ninguna tarea crea tablas, políticas, funciones ni edge functions. El MCP de Supabase es de solo lectura.
- **No usar la service role key.** Solo `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- **Versiones fijadas** (sin `^`) en `package.json`; `package-lock.json` incluido.
- **Textos de interfaz en español**, copiados del anexo cuando existen (mensajes, títulos de diálogo, etiquetas).
- **Rutas Next.js 16:** `params` y `searchParams` son `Promise`; el middleware es `src/proxy.ts` con función exportada `proxy`.
- **Fechas** siempre como `YYYY-MM-DD` (string) entre cliente, servidor y BD; nunca `new Date('YYYY-MM-DD')` para mostrar. "Hoy" se calcula en zona `America/Mexico_City` con `todayISO()`.
- **Moneda** `$#,##0.00` con `formatMoney`; fechas `dd/MM/yyyy` con `formatDate`.
- **Pruebas colocadas** junto al código como `*.test.ts`/`*.test.tsx`; se ejecutan con `npm test` (Vitest, jsdom).
- **Roles:** cadenas exactas `Administrador`, `Tesorero`, `Comite`, `Vigilancia`. Gestión (`ROLES_GESTION`) = Administrador y Tesorero.
- **Formularios:** campos obligatorios marcados con `*`. Al enviar con errores de validación, además de los mensajes por campo, `toast.error('Por favor, ingresa todos los datos obligatorios. (*)')`. Tras una acción: `toast.success(mensaje)` y cerrar el diálogo si `ok`, `toast.error(error)` si no; refrescar con `router.refresh()`.

## Review Focus

1. **Sesión expirada durante una acción.** Si `getCurrentUser()` devuelve `null` dentro de una Server Action, la acción devuelve `{ ok: false, error: 'Tu sesión expiró. Inicia sesión de nuevo.' }`, nunca lanza. → prueba `runAction` en Tarea 2.
2. **Id de domicilio inválido en la URL** (`/domicilios/abc`, `/domicilios/0`, `/domicilios/999999`). La página responde 404 con `notFound()`. → prueba `parseRouteId` en Tarea 7.
3. **Desfase de zona horaria en fechas.** `formatDate('2026-03-01')` debe dar `01/03/2026` aunque el servidor esté en UTC; `todayISO()` usa `America/Mexico_City`. → pruebas en Tarea 1.
4. **Parámetros inválidos en exports** (`mes=13`, `salida=X`, `inicioID=0`). El Route Handler responde 400 antes de llamar a la edge function. → pruebas en Tarea 17.
5. **Fallo al generar el recibo PDF.** La cuota queda Pagado y el resultado trae `reciboGenerado: false`; la UI avisa. → prueba en Tarea 13.

---

## Mapa de archivos

```
src/
  proxy.ts
  app/layout.tsx, globals.css
  app/(auth)/login/page.tsx
  app/(app)/layout.tsx, page.tsx, error.tsx, not-found.tsx
  app/(app)/domicilios/page.tsx, [id]/page.tsx
  app/(app)/{residentes,cuotas,pagos,movimientos,reportes,usuarios}/page.tsx
  app/api/auth/signout/route.ts
  app/api/recibos/[pagoId]/route.ts
  app/api/exports/{eldesgate,zkteco}/route.ts
  lib/supabase/{server.ts, proxy.ts, functions.ts, database.types.ts, types.ts}
  lib/auth/{current-user.ts, require-role.ts, run-action.ts}
  lib/{constants.ts, dates.ts, format.ts, action-result.ts, route-id.ts}
  test/{fake-query.ts, setup.ts}
  components/ui/*            (shadcn)
  components/layout/{sidebar.tsx, app-bar.tsx, mobile-nav.tsx, nav-items.ts}
  components/{data-table.tsx, status-badge.tsx, empty-state.tsx, confirm-dialog.tsx, searchable-select.tsx, form-dialog.tsx, money.tsx}
  features/<dominio>/{queries.ts, actions.ts, schemas.ts, components/*}
```

---

### Tarea 1: Scaffold, tokens de diseño, utilidades base y pruebas

**Files:**
- Create: proyecto con `create-next-app` en `lago_amadeo_nextjs/` (ya contiene `.git` y `docs/`, ambos permitidos por el CLI)
- Create: `src/lib/format.ts`, `src/lib/dates.ts`, `src/lib/constants.ts`, `src/lib/action-result.ts`, `src/lib/zod.ts`, `src/lib/supabase/types.ts`
- Move: `docs/superpowers/generated/database.types.ts` → `src/lib/supabase/database.types.ts`
- Create: `vitest.config.ts`, `src/test/setup.ts`, `.env.example`, `.env.local`
- Modify: `src/app/globals.css`, `src/app/layout.tsx`, `package.json`
- Test: `src/lib/format.test.ts`, `src/lib/dates.test.ts`

**Interfaces:**
- Produces: `formatMoney(value: number | null | undefined): string`; `formatDate(iso: string | null | undefined): string`; `todayISO(): string`; `currentPeriod(): { anio: number; mes: number }`; `lastDayOfMonthISO(anio: number, mes: number): string`.
- Produces (`src/lib/zod.ts`): `isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida')`; `fechaNoFuturaSchema = isoDateSchema.refine(d => d <= todayISO(), 'La fecha no puede ser futura')`; `positiveInt = z.coerce.number().int().positive()`.
- Produces: `ROLES`, `RoleName`, `ROLES_GESTION`, `ESTATUS`, `TIPO_PAGO`, `TIPO_MOVIMIENTO`, `LIMITES`, `PRINT_AGENT_URL`, `TIME_ZONE` en `constants.ts`.
- Produces: `ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string }`, `ok<T>(data: T)`, `fail(error: string)`.
- Produces: `Database`, `Tables<T>`, `TablesInsert<T>`, `TablesUpdate<T>`, `Views<T>` en `lib/supabase/types.ts`.

- [ ] **Paso 1: Scaffold**

Ejecutar en `lago_amadeo_nextjs/`:
```bash
npx create-next-app@16.3.8 . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --disable-git --yes
```
Esperado: `package.json`, `src/app/`, `next.config.ts`, `tsconfig.json` creados; `.git` y `docs/` intactos.

- [ ] **Paso 2: Dependencias fijadas**

```bash
npm i -E @supabase/supabase-js@2.117.2 @supabase/ssr@0.12.7 zod@4.6.5 react-hook-form@7.89.0 @hookform/resolvers@5.9.1 sonner@2.0.8 lucide-react@1.52.0
npm i -D -E vitest@5.0.3 @vitejs/plugin-react@6.1.2 jsdom@30.1.2 @testing-library/react@16.3.3 @testing-library/jest-dom@7.0.1 @testing-library/user-event@14.6.7
npx shadcn@4.21.2 init -y -t next -b radix
npx shadcn@4.21.2 add -y button input label badge card dialog alert-dialog select checkbox table tabs skeleton sheet popover command separator sonner textarea
```
Si `init` pregunta por preset o color base, aceptar el default. Quitar todo `^` que quede en `package.json`.

- [ ] **Paso 3: Scripts y Vitest**

En `package.json` añadir scripts `"test": "vitest run"`, `"test:watch": "vitest"`, `"typecheck": "tsc --noEmit"`. Crear `vitest.config.ts` con `@vitejs/plugin-react`, `test.environment = 'jsdom'`, `test.globals = true`, `test.setupFiles = ['./src/test/setup.ts']`, `test.include = ['src/**/*.test.{ts,tsx}']`, alias `@` → `./src`. `src/test/setup.ts` importa `@testing-library/jest-dom/vitest`. Añadir `"types": ["vitest/globals"]` al `tsconfig.json`.

- [ ] **Paso 4: Prueba fallida de formato y fechas**

`src/lib/format.test.ts`:
```ts
test('formatMoney', () => {
  expect(formatMoney(1234.5)).toBe('$1,234.50')
  expect(formatMoney(0)).toBe('$0.00')
  expect(formatMoney(null)).toBe('$0.00')
})
```
`src/lib/dates.test.ts`:
```ts
test('formatDate no desplaza por zona horaria', () => {
  expect(formatDate('2026-03-01')).toBe('01/03/2026')
  expect(formatDate(null)).toBe('')
})
test('lastDayOfMonthISO', () => {
  expect(lastDayOfMonthISO(2026, 2)).toBe('2026-02-28')
  expect(lastDayOfMonthISO(2024, 2)).toBe('2024-02-29')
})
test('todayISO tiene formato YYYY-MM-DD', () => {
  expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
})
```
Run: `npm test` → FAIL (módulos inexistentes).

- [ ] **Paso 5: Implementar `format.ts`, `dates.ts`, `constants.ts`, `action-result.ts`, `zod.ts`, `types.ts`**

`formatMoney` usa `Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })`. `formatDate` parte el string por `-` (sin `Date`). `todayISO` usa `Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })`. `currentPeriod` deriva de `todayISO()`. Valores de `constants.ts`: `ROLES = { ADMINISTRADOR: 'Administrador', TESORERO: 'Tesorero', COMITE: 'Comite', VIGILANCIA: 'Vigilancia' } as const`; `ROLES_GESTION: RoleName[] = [ROLES.ADMINISTRADOR, ROLES.TESORERO]`; `ESTATUS = { PENDIENTE: 1, PAGADO: 2, VENCIDO: 3 }`; `TIPO_PAGO = { RECURRENTE: 1, EXTRA: 2 }`; `TIPO_MOVIMIENTO = { INGRESO: 1, EGRESO: 2 }`; `LIMITES = { TELEFONOS: 2, TARJETAS: 3 }`; `PRINT_AGENT_URL = 'http://localhost:8000/print'`; `TIME_ZONE = 'America/Mexico_City'`. `types.ts`: `Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']`, análogos `TablesInsert` (`Insert`), `TablesUpdate` (`Update`), `Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row']`. Mover el archivo de tipos generado a `src/lib/supabase/database.types.ts`.

- [ ] **Paso 6: Tokens, fuentes y layout raíz**

`globals.css`: variables en `:root` (tema claro único) con los valores de la spec §9.1 (`--primary: #065F46`, `--background: #F1F4F8`, `--card: #FFFFFF`, `--foreground: #14181B`, `--muted-foreground: #57636C`, `--border: #E2E8F0`, `--table-header: #E1E3E4`, `--badge-success: #C8E7D7`, `--badge-success-fg: #324C41`, `--badge-warning: #F1D5A3`, `--badge-warning-fg: #B47512`, `--badge-error: #F0A6A6`, `--badge-error-fg: #6A1B1B`, `--ingreso: #065F3B`, `--egreso: #951C1C`) y exponerlas en `@theme inline` como colores Tailwind (`bg-badge-success`, `text-ingreso`, etc.). Mantener las variables que shadcn generó, reasignando `--primary`, `--background`, `--card`, `--foreground`, `--border`. `src/app/layout.tsx`: `Inter` e `Inter_Tight` de `next/font/google` como variables CSS (`--font-sans`, `--font-heading`), `lang="es"`, título "Lago Amadeo", `<Toaster richColors position="top-right" />` de `@/components/ui/sonner`.

- [ ] **Paso 7: Entorno**

`.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=https://btwyaowauztohdglnfjm.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```
`.env.local` (ignorado por git) con la URL anterior y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_uujCsvadPvJU1Pee7oTNFA_NS4CRb7C`. Comprobar que `.gitignore` incluye `.env*.local` (create-next-app lo añade).

- [ ] **Paso 8: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → PASS. `git status` muestra el scaffold; no commitear.

---

### Tarea 2: Clientes Supabase, proxy, usuario actual y `runAction`

**Files:**
- Create: `src/lib/supabase/server.ts`, `src/lib/supabase/proxy.ts`, `src/proxy.ts`, `src/lib/supabase/functions.ts`
- Create: `src/lib/auth/current-user.ts`, `src/lib/auth/require-role.ts`, `src/lib/auth/run-action.ts`
- Create: `src/test/fake-query.ts`
- Test: `src/lib/supabase/proxy.test.ts`, `src/lib/auth/current-user.test.ts`, `src/lib/auth/run-action.test.ts`

**Interfaces:**
- Produces: `createClient(): Promise<SupabaseClient<Database>>` (server, cookies).
- Produces: `updateSession(request: NextRequest): Promise<NextResponse>`; rutas públicas: `/login` y las que empiezan por `/api/auth`.
- Produces: `CurrentUser = { id: string; email: string; userName: string; roleName: RoleName | null; roleId: number | null; isActive: boolean }`; `getCurrentUser(): Promise<CurrentUser | null>` (envuelto en `cache` de React).
- Produces: `AuthorizationError extends Error { code: 'NO_SESSION' | 'FORBIDDEN' }`; `requireUser(): Promise<CurrentUser>`; `requireRole(...roles: RoleName[]): Promise<CurrentUser>`; `hasRole(user: CurrentUser | null, roles: RoleName[]): boolean`.
- Produces: `runAction<T>(roles: RoleName[] | null, fn: (user: CurrentUser) => Promise<ActionResult<T>>): Promise<ActionResult<T>>`. Mensajes: `MSG_SESION = 'Tu sesión expiró. Inicia sesión de nuevo.'`, `MSG_NO_PERMISO = 'No tienes permiso para realizar esta acción.'`, `MSG_ERROR = 'Ocurrió un error inesperado. Intenta de nuevo.'`.
- Produces: `invokeEdgeFunction(supabase: SupabaseClient<Database>, slug: string, init: { method?: 'GET' | 'POST'; body?: unknown; query?: Record<string, string> }): Promise<Response>` con headers `apikey` y `Authorization: Bearer <access_token de getSession()>`.
- Produces (pruebas): `fakeQuery(result: { data?: unknown; error?: unknown; count?: number | null })` y `fakeSupabase(tables: Record<string, ReturnType<typeof fakeQuery>>, extra?: Partial<{ rpc: Mock; auth: unknown }>)`.

- [ ] **Paso 1: Helper de pruebas `fakeQuery`**

`src/test/fake-query.ts`: un `Proxy` cuyo acceso a cualquier propiedad devuelve una función que registra la llamada en `calls: Array<{ method: string; args: unknown[] }>` y devuelve el mismo proxy; `then` lo hace "thenable" resolviendo `{ data, error, count }`. `fakeSupabase(tables)` devuelve `{ from: vi.fn((t) => tables[t]), rpc: vi.fn(), auth: {} , ...extra }`. Exportar también `callsOf(q, method)` para filtrar llamadas.

- [ ] **Paso 2: Pruebas fallidas**

`proxy.test.ts` (mockear `@supabase/ssr` para que `createServerClient` devuelva `{ auth: { getClaims } }`):
```ts
test('sin sesión redirige a /login con next', async () => {
  getClaims.mockResolvedValue({ data: null })
  const res = await updateSession(new NextRequest('http://localhost/domicilios/5'))
  expect(res.status).toBe(307)
  expect(res.headers.get('location')).toBe('http://localhost/login?next=%2Fdomicilios%2F5')
})
test('con sesión en /login redirige a /', ...) // location 'http://localhost/'
test('sin sesión deja pasar /api/auth/signout', ...) // status 200
test('con sesión deja pasar la ruta', ...) // status 200
```
`current-user.test.ts` (mockear `@/lib/supabase/server`):
```ts
test('mapea users_info', ...) // claims sub 'u1' + fila {user_name:'Ana', role_name:'Tesorero', is_active:true} → { id:'u1', userName:'Ana', roleName:'Tesorero', isActive:true }
test('sin fila en users_info devuelve inactivo', ...) // isActive false, roleName null
test('sin claims devuelve null', ...)
```
`run-action.test.ts` (mockear `@/lib/auth/current-user`):
```ts
test('sin sesión devuelve MSG_SESION sin lanzar', ...)
test('usuario inactivo devuelve MSG_SESION', ...)
test('rol no permitido devuelve MSG_NO_PERMISO', ...) // roles ['Administrador'], user Comite
test('roles null solo exige sesión', ...)
test('excepción inesperada devuelve MSG_ERROR', ...) // fn lanza → ok:false, error MSG_ERROR
```
Run: `npm test` → FAIL.

- [ ] **Paso 3: Implementar `server.ts` y `proxy.ts`**

`server.ts`:
```ts
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(URL, KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => { try { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} },
    },
  })
}
```
`lib/supabase/proxy.ts` (patrón oficial de Supabase; devolver siempre `supabaseResponse` tal cual):
```ts
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient<Database>(URL, KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        list.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })
  const { data } = await supabase.auth.getClaims()
  const hasUser = Boolean(data?.claims)
  const { pathname } = request.nextUrl
  const isPublic = pathname === '/login' || pathname.startsWith('/api/auth')
  if (!hasUser && !isPublic) { const url = request.nextUrl.clone(); url.pathname = '/login'; url.search = `?next=${encodeURIComponent(pathname)}`; return NextResponse.redirect(url) }
  if (hasUser && pathname === '/login') { const url = request.nextUrl.clone(); url.pathname = '/'; url.search = ''; return NextResponse.redirect(url) }
  return supabaseResponse
}
```
`src/proxy.ts`: `export async function proxy(request: NextRequest) { return updateSession(request) }` y `export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'] }`.

- [ ] **Paso 4: Implementar `current-user.ts`, `require-role.ts`, `run-action.ts`, `functions.ts`**

`getCurrentUser = cache(async () => ...)`: `getClaims()`; sin claims → `null`; consulta `from('users_info').select('*').eq('id', sub).maybeSingle()`; sin fila → `{ id: sub, email: claims.email ?? '', userName: '', roleName: null, roleId: null, isActive: false }`. `requireUser` lanza `NO_SESSION` si `null` o `!isActive`. `requireRole` llama `requireUser` y lanza `FORBIDDEN` si el rol no está en la lista. `runAction` envuelve: `roles === null ? requireUser() : requireRole(...roles)`, ejecuta `fn`, mapea `AuthorizationError` a `fail(MSG_SESION | MSG_NO_PERMISO)`, cualquier otra excepción a `console.error` + `fail(MSG_ERROR)`. `invokeEdgeFunction` construye `${URL}/functions/v1/${slug}` + query, `fetch` con `Content-Type: application/json` cuando hay body.

- [ ] **Paso 5: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → PASS.

---

### Tarea 3: Login, logout y cierre de sesión por cuenta inactiva

**Files:**
- Create: `src/features/auth/schemas.ts`, `src/features/auth/actions.ts`, `src/features/auth/components/login-form.tsx`
- Create: `src/app/(auth)/login/page.tsx`, `src/app/api/auth/signout/route.ts`
- Test: `src/features/auth/schemas.test.ts`, `src/features/auth/components/login-form.test.tsx`, `src/app/api/auth/signout/route.test.ts`

**Interfaces:**
- Consumes: `createClient`, `ActionResult`, `fail`.
- Produces: `loginSchema = z.object({ email: z.email(), password: z.string().min(1) })`; `login(prevState: ActionResult | null, formData: FormData): Promise<ActionResult>` (redirige a `next` o `/` en éxito; en error devuelve `fail('Error: ' + mensaje)`); `logout(): Promise<never>` (signOut + redirect `/login`).
- Produces: `GET /api/auth/signout?reason=inactive` → `signOut()` y redirect 307 a `/login?error=inactive`.
- Produces: `MSG_INACTIVO = 'Tu cuenta se encuentra inactiva o suspendida, por favor contacta al administrador del sistema.'` en `features/auth/messages.ts`.

- [ ] **Paso 1: Pruebas fallidas**

`schemas.test.ts`: email inválido y password vacío fallan; `{ email: 'a@b.com', password: 'x' }` pasa.
`login-form.test.tsx`: renderiza etiquetas "Email" y "Contraseña", botón "Iniciar sesión", el ojo alterna `type` entre `password` y `text`; con `searchParams.error = 'inactive'` muestra `MSG_INACTIVO`; muestra el texto "¿No tienes una cuenta? Contacta a tu administración".
`route.test.ts` (mock `@/lib/supabase/server`): `GET` llama `auth.signOut` una vez y responde 307 con `location` terminado en `/login?error=inactive`.
Run: `npm test` → FAIL.

- [ ] **Paso 2: Implementar**

`login` usa `useActionState` en el cliente; en servidor `signInWithPassword`; si `error` → `fail('Error: ' + error.message)`; si ok → `redirect(safeNext)` donde `safeNext` es `next` solo si empieza por `/` y no por `//`. `LoginForm` es cliente, recibe `{ next?: string; error?: string }`, tarjeta centrada con título "Lago Amadeo" y subtítulo "Panel de Administración". La page lee `searchParams` (Promise) y pasa `next` y `error`.

- [ ] **Paso 3: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → PASS.

---

### Tarea 4: Shell de la app (sidebar, barra, móvil) y dashboard

**Files:**
- Create: `src/components/layout/nav-items.ts`, `sidebar.tsx`, `app-bar.tsx`, `mobile-nav.tsx`
- Create: `src/app/(app)/layout.tsx`, `src/app/(app)/page.tsx`, `src/app/(app)/error.tsx`, `src/app/(app)/not-found.tsx`, `src/app/(app)/loading.tsx`
- Create: `src/features/dashboard/queries.ts`, `src/features/dashboard/components/kpi-cards.tsx`
- Test: `src/components/layout/nav-items.test.ts`, `src/features/dashboard/components/kpi-cards.test.tsx`

**Interfaces:**
- Consumes: `getCurrentUser`, `hasRole`, `logout`, `formatMoney`.
- Produces: `NAV_ITEMS: { label: string; href: string; icon: LucideIcon; roles?: RoleName[] }[]` en orden: Inicio `/`, Domicilios `/domicilios`, Residentes `/residentes`, Cuotas `/cuotas`, Pagos `/pagos`, Movimientos Financieros `/movimientos`, Reportes `/reportes`, Usuarios `/usuarios` (`roles: ['Administrador']`); `visibleNavItems(user: CurrentUser): typeof NAV_ITEMS`.
- Produces: `getResumenFinanciero(supabase): Promise<Views<'resumen_financiero_completo'> | null>`.
- Produces: `KpiCards({ resumen })` con grupos "RESUMEN GENERAL" (SALDO ACTUAL, INGRESOS ACUMULADOS, EGRESOS ACUMULADOS), "RESUMEN MES ACTUAL" (INGRESOS DEL MES, EGRESOS DEL MES), "RESUMEN MES ANTERIOR" (INGRESOS MES ANTERIOR, EGRESOS MES ANTERIOR).

- [ ] **Paso 1: Pruebas fallidas**

`nav-items.test.ts`: `visibleNavItems` con rol Comite devuelve 7 ítems sin `/usuarios`; con Administrador devuelve 8; el orden de etiquetas coincide con la lista anterior.
`kpi-cards.test.tsx`: con `saldo_actual: 1500` muestra "$1,500.00" bajo "SALDO ACTUAL"; con `resumen = null` muestra "$0.00" en los 7 indicadores.
Run → FAIL.

- [ ] **Paso 2: Implementar layout y componentes**

`(app)/layout.tsx`: `const user = await getCurrentUser()`; `null` → `redirect('/login')`; `!user.isActive` → `redirect('/api/auth/signout?reason=inactive')`; renderiza `Sidebar` (oculto bajo `lg`, ancho 270 px, cabecera "Lago Amadeo"/"Administración", pie con `userName`, `roleName` y botón de salir que envía el form de `logout`), `AppBar` (título "Panel de Administración", botón de menú visible bajo `lg` que abre `MobileNav` en un `Sheet` con los mismos ítems), y `<main className="p-4 lg:p-8">`. El ítem activo se marca comparando `usePathname()` con `href` (exacto para `/`, prefijo para el resto). `error.tsx` muestra "Ocurrió un error" y botón "Reintentar" (`reset`). `not-found.tsx` muestra "No encontrado". `page.tsx` lee `getResumenFinanciero` dentro de `Suspense` con `Skeleton`.

- [ ] **Paso 3: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → PASS.

---

### Tarea 5: Componentes compartidos

**Files:**
- Create: `src/components/data-table.tsx`, `status-badge.tsx`, `empty-state.tsx`, `confirm-dialog.tsx`, `searchable-select.tsx`, `form-dialog.tsx`, `money.tsx`
- Test: `src/components/data-table.test.tsx`, `src/components/status-badge.test.tsx`, `src/components/searchable-select.test.tsx`

**Interfaces:**
- Produces: `Column<T> = { key: string; header: string; cell: (row: T) => ReactNode; className?: string }`; `DataTable<T>({ columns, rows, getRowKey: (row: T) => string | number, pageSize = 10, onRowClick?, emptyTitle?, emptyDescription? })` (cliente; paginación con "Anterior"/"Siguiente" y "Página X de Y"; cabecera con `bg-table-header`).
- Produces: `StatusBadge({ status: string | null })`: `Pagado`, `Al corriente` → success; `Pendiente` → warning; `Vencido`, `Moroso` → error; otro → neutral; texto = `status ?? ''`.
- Produces: `EmptyState({ title = 'Sin información disponible', description = 'No hay información disponible para mostrar.' })`.
- Produces: `ConfirmDialog({ title, description, confirmLabel = 'Confirmar', trigger: ReactNode, onConfirm: () => Promise<void> | void })` sobre `AlertDialog`, con "Cancelar".
- Produces: `SearchableSelect({ options: { value: string; label: string }[], value: string | null, onChange: (v: string | null) => void, placeholder, disabled?, allowClear? })` sobre `Popover` + `Command`.
- Produces: `FormDialog({ title, trigger, open, onOpenChange, children })` envoltorio de `Dialog` con título y cuerpo con scroll.
- Produces: `Money({ value, variant?: 'ingreso' | 'egreso' })` → `+ $x` en `text-ingreso` / `- $x` en `text-egreso`; sin variante solo `$x`.

- [ ] **Paso 1: Pruebas fallidas**

`data-table.test.tsx`: con 25 filas muestra 10, "Página 1 de 3", al pulsar "Siguiente" muestra las filas 11–20; con 0 filas muestra `EmptyState`; `onRowClick` se llama con la fila al hacer clic.
`status-badge.test.tsx`: cada estado aplica la clase esperada (`bg-badge-success`, `bg-badge-warning`, `bg-badge-error`).
`searchable-select.test.tsx`: al escribir "lago" filtra opciones por label sin distinguir mayúsculas; seleccionar llama `onChange` con el `value`.
Run → FAIL.

- [ ] **Paso 2: Implementar** los siete componentes según las interfaces.

- [ ] **Paso 3: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → PASS.

---

### Tarea 6: Domicilios: lista, búsqueda y alta

**Files:**
- Create: `src/features/domicilios/queries.ts`, `schemas.ts`, `actions.ts`
- Create: `src/features/domicilios/components/domicilios-table.tsx`, `domicilio-form.tsx`, `add-domicilio-dialog.tsx`
- Create: `src/app/(app)/domicilios/page.tsx`
- Test: `src/features/domicilios/schemas.test.ts`, `src/features/domicilios/actions.test.ts`, `src/features/domicilios/components/domicilios-table.test.tsx`

**Interfaces:**
- Consumes: `runAction`, `createClient`, `fakeSupabase`, `DataTable`, `StatusBadge`, `FormDialog`, `isoDateSchema`, `todayISO`, `TIPO_PAGO`.
- Produces: `DomicilioInfo = Views<'domicilios_info'>`; `listDomicilios(supabase): Promise<DomicilioInfo[]>` (orden `direccion` asc); `getDomicilioInfo(supabase, id: number): Promise<DomicilioInfo | null>`; `listConceptosRecurrentes(supabase): Promise<Tables<'conceptos_pago'>[]>` (`tipo_pago_id = 1`); `listDomiciliosOptions(supabase): Promise<{ id: number; direccion: string }[]>` (de `domicilios`, orden `direccion`); `getDomicilioConcepto(supabase, domicilioId): Promise<Tables<'domicilio_concepto'> | null>`.
- Produces: `domicilioSchema = z.object({ direccion: z.string().trim().min(1, 'La dirección es obligatoria').transform(s => s.toUpperCase()), fechaAlta: isoDateSchema, conceptoId: z.coerce.number().int().positive().optional(), observaciones: z.string().trim().optional() })`; `DomicilioInput = z.input<typeof domicilioSchema>`.
- Produces: `crearDomicilio(input: DomicilioInput): Promise<ActionResult<{ id: number }>>`; `actualizarDomicilio(id: number, input: DomicilioInput): Promise<ActionResult>` (Tarea 7 lo usa). Mensajes: `'Domicilio agregado correctamente.'`, `'Este domicilio ya se encuentra registrado.'`, `'Domicilio actualizado correctamente.'` exportados desde `features/domicilios/messages.ts`.
- Produces: `DomicilioForm({ defaultValues?, conceptos, onSubmit, submitLabel })` (cliente, react-hook-form + zodResolver) con campos "Dirección *", "Fecha de Registro *" (`type="date"`, default `todayISO()`), "Tipo de Cuota Mensual" (Select con opción "Sin asignar"), "Observaciones".

- [ ] **Paso 1: Pruebas fallidas**

`schemas.test.ts`: `direccion: ' calle 1 '` → `'CALLE 1'`; vacía → error; `fechaAlta: '2026/01/01'` → error; `conceptoId: '2'` → `2`.
`actions.test.ts` (mock `@/lib/supabase/server`, `@/lib/auth/current-user`, `next/cache`):
```ts
test('crearDomicilio rechaza duplicado', ...) // domicilios_info devuelve 1 fila → fail('Este domicilio ya se encuentra registrado.'), from('domicilios') no recibe insert
test('crearDomicilio inserta con created_by y concepto', ...) // insert en domicilios con { direccion, fecha_alta, observaciones, created_by: user.id }; insert en domicilio_concepto { domicilio_id: 7, concepto_id: 2 }; ok({ id: 7 }); revalidatePath('/domicilios')
test('crearDomicilio sin concepto no toca domicilio_concepto', ...)
test('actualizarDomicilio hace update y crea domicilio_concepto si no existe', ...)
test('actualizarDomicilio actualiza domicilio_concepto existente', ...) // update { concepto_id } eq id
test('cualquier rol autenticado puede crear', ...) // user Vigilancia → ok
```
`domicilios-table.test.tsx`: muestra "TOTAL UNIDADES" con el conteo; filtrar por "lago" (sin mayúsculas) reduce filas; badge rojo para `Moroso`.
Run → FAIL.

- [ ] **Paso 2: Implementar queries, schemas, actions**

Duplicado: `from('domicilios_info').select('id').eq('direccion', direccion).limit(1)`. Insert con `.select('id').single()`. Acciones con `runAction(null, ...)`. `revalidatePath('/domicilios')` y, en actualizar, también `/domicilios/${id}`.

- [ ] **Paso 3: Implementar página y componentes**

`page.tsx`: server; carga `listDomicilios` y `listConceptosRecurrentes` en paralelo; cabecera "Domicilios" con `AddDomicilioDialog` ("Nuevo Domicilio"). `DomiciliosTable` (cliente): tarjeta "TOTAL UNIDADES", input "Buscar domicilio..." con debounce de 300 ms filtrando por `direccion`, columnas Dirección, Fecha de Registro (`formatDate(fecha_alta)`), Residente Principal, Estatus (`StatusBadge`); clic en fila → `router.push('/domicilios/' + id)`. Tras éxito del diálogo: `toast.success(mensaje)` y cerrar; en error `toast.error`.

- [ ] **Paso 4: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → PASS.

---

### Tarea 7: Detalle de domicilio: página, tarjeta de información y edición

**Files:**
- Create: `src/lib/route-id.ts`, `src/app/(app)/domicilios/[id]/page.tsx`
- Create: `src/features/domicilios/components/domicilio-info-card.tsx`, `edit-domicilio-dialog.tsx`
- Test: `src/lib/route-id.test.ts`

**Interfaces:**
- Consumes: `getDomicilioInfo`, `getDomicilioConcepto`, `listConceptosRecurrentes`, `actualizarDomicilio`, `DomicilioForm`, `StatusBadge`, `getCurrentUser`.
- Produces: `parseRouteId(raw: string): number | null` (entero positivo o `null`).
- Produces: la página `[id]` renderiza, en este orden, `DomicilioInfoCard` y luego los slots de secciones que añaden las tareas 8, 9, 12 y 14: `<AccesosSection />`, `<ResidentesSection />`, `<CuotasSection />`, `<PagosExtraSection />`. Hasta que existan, la página no los importa.
- Produces: `DomicilioInfoCard({ domicilio: DomicilioInfo, conceptos, conceptoActual: number | null })` con "Volver" (link a `/domicilios`), Dirección con icono de editar que abre `EditDomicilioDialog`, "FECHA DE REGISTRO", "TIPO DE CUOTA MENSUAL" (`tipo_cuota ?? 'Sin asignar'`), `StatusBadge(estatus)`.

- [ ] **Paso 1: Prueba fallida**

`route-id.test.ts`: `'5'` → 5; `'abc'`, `'0'`, `'-1'`, `'1.5'`, `''` → `null`.
Run → FAIL.

- [ ] **Paso 2: Implementar**

`page.tsx`: `const { id } = await params`; `parseRouteId(id) ?? notFound()`; `getDomicilioInfo` nulo → `notFound()`. Carga en paralelo `getDomicilioConcepto` y `listConceptosRecurrentes`. `EditDomicilioDialog` precarga `direccion`, `fecha_alta`, `observaciones`, `conceptoActual` y llama `actualizarDomicilio(id, input)`; éxito → toast "Domicilio actualizado correctamente." y `router.refresh()`.

- [ ] **Paso 3: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → PASS.

---

### Tarea 8: Accesos: teléfonos y tarjetas del domicilio

**Files:**
- Create: `src/features/accesos/queries.ts`, `schemas.ts`, `actions.ts`, `messages.ts`
- Create: `src/features/accesos/components/accesos-section.tsx`, `acceso-item.tsx`, `numero-dialog.tsx`
- Modify: `src/app/(app)/domicilios/[id]/page.tsx` (añadir `AccesosSection`)
- Test: `src/features/accesos/schemas.test.ts`, `src/features/accesos/actions.test.ts`

**Interfaces:**
- Consumes: `runAction`, `LIMITES`, `ConfirmDialog`, `FormDialog`, `EmptyState`.
- Produces: `listTelefonos(supabase, domicilioId): Promise<Tables<'telefonos_acceso'>[]>` (orden `id` asc); `listTarjetas(supabase, domicilioId): Promise<Tables<'tarjetas_acceso'>[]>` (orden `id` asc).
- Produces: `numeroSchema = z.object({ valor: z.string().regex(/^\d{1,10}$/, 'Solo dígitos, máximo 10') })`.
- Produces: `crearTelefono(domicilioId: number, valor: string)`, `actualizarTelefono(id: number, domicilioId: number, valor: string)`, `eliminarTelefono(id: number, domicilioId: number)`, y `crearTarjeta`, `actualizarTarjeta`, `eliminarTarjeta` con las mismas firmas: todas `Promise<ActionResult>`, `runAction(null, ...)`, revalidan `/domicilios/${domicilioId}`.
- Produces: mensajes `MSG_MAX_TELEFONOS = 'Se alcanzó el máximo de 2 números de acceso.'`, `MSG_MAX_TARJETAS = 'Se alcanzó el máximo de 3 tarjetas de acceso.'`.
- Produces: `AccesosSection({ domicilio: DomicilioInfo, telefonos, tarjetas })`: bloque "Números de Acceso" visible si `acceso_telefono ?? true`, botón "Agregar Número" solo si `telefonos.length < 2`, vacío "No hay números registrados para el acceso."; bloque "Acceso Peatonal" visible si `acceso_tarjeta ?? true`, botón "Agregar Tarjeta" solo si `tarjetas.length < 3`, vacío "No hay tarjetas registradas para el acceso.". Cada ítem con editar y eliminar (confirmaciones "Eliminar Número" / "Eliminar Tarjeta").

- [ ] **Paso 1: Pruebas fallidas**

`schemas.test.ts`: `'5512345678'` pasa; `'55-1234'`, `''`, 11 dígitos fallan.
`actions.test.ts`: `crearTelefono` con 2 existentes → `fail(MSG_MAX_TELEFONOS)` sin insert; con 1 → insert `{ domicilio_id, telefono }`; `crearTarjeta` con 3 → `fail(MSG_MAX_TARJETAS)`; `eliminarTelefono(4, 9)` → delete eq id 4 y `revalidatePath('/domicilios/9')`; `actualizarTarjeta` → update `{ numero }`.
Run → FAIL.

- [ ] **Paso 2: Implementar** queries, acciones (conteo con `select('id', { count: 'exact', head: true })`), componentes, e insertar `AccesosSection` en la página de detalle con sus datos cargados en paralelo.

- [ ] **Paso 3: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → PASS.

---

### Tarea 9: Residentes: sección del domicilio y página general

**Files:**
- Create: `src/features/residentes/queries.ts`, `schemas.ts`, `actions.ts`, `messages.ts`
- Create: `src/features/residentes/components/residentes-section.tsx`, `residente-dialog.tsx`, `residentes-table.tsx`, `domicilio-filter.tsx`
- Create: `src/app/(app)/residentes/page.tsx`
- Modify: `src/app/(app)/domicilios/[id]/page.tsx` (añadir `ResidentesSection`)
- Test: `src/features/residentes/schemas.test.ts`, `src/features/residentes/actions.test.ts`

**Interfaces:**
- Consumes: `runAction`, `DataTable`, `SearchableSelect`, `listDomiciliosOptions`.
- Produces: `listResidentesDomicilio(supabase, domicilioId): Promise<Tables<'residentes'>[]>` (orden `id` asc); `listResidentesInfo(supabase, domicilioId?: number): Promise<Views<'residentes_info'>[]>` (orden `direccion` asc, `id` asc; filtro solo si se pasa id).
- Produces: `residenteSchema = z.object({ nombre: z.string().trim().min(1, 'El nombre es obligatorio').transform(toTitleCase), telefono: z.string().regex(/^\d{0,10}$/, 'Solo dígitos, máximo 10').optional(), esPrincipal: z.boolean().optional() })`; `toTitleCase(s: string): string` en `src/lib/text.ts`.
- Produces: `crearResidente(domicilioId, input)` (insert `{ nombre, telefono: telefono || null, domicilio_id }`, sin `es_principal`); `actualizarResidente(id, domicilioId, input)` (update `{ nombre, telefono, es_principal: esPrincipal ?? false }`); `eliminarResidente(id, domicilioId)`. Mensajes: `'Residente agregado correctamente.'`, `'Residente actualizado correctamente.'`, `'Residente eliminado correctamente.'`.
- Produces: `ResidentesSection({ domicilioId, residentes })`: título "Residentes", botón "Agregar Residente", tabla Nombre, Teléfono, Residente Principal (icono check si `es_principal`), Acciones (editar con checkbox "Residente Principal"; eliminar con confirmación "Eliminar Residente").
- Produces: página `/residentes?domicilio=N`: `DomicilioFilter` (cliente, `SearchableSelect` con `allowClear`; cambiar actualiza el search param con `router.replace`, limpiar lo elimina) y `ResidentesTable` con columnas Dirección, Nombre, Teléfono, Residente Principal. Solo lectura.

- [ ] **Paso 1: Pruebas fallidas**

`schemas.test.ts`: `nombre: 'juan pérez'` → `'Juan Pérez'`; `telefono: ''` pasa; `telefono: 'abc'` falla.
`actions.test.ts`: `crearResidente` no envía `es_principal`; `actualizarResidente` envía `es_principal: true` cuando `esPrincipal: true`; `eliminarResidente(3, 9)` revalida `/domicilios/9` y `/residentes`.
Run → FAIL.

- [ ] **Paso 2: Implementar** queries, acciones, sección, página y filtro. En la página, `const sp = await searchParams; const domicilioId = parseRouteId(sp.domicilio ?? '') ?? undefined`.

- [ ] **Paso 3: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → PASS.

---

### Tarea 10: Cuotas: página por periodo y generación masiva

**Files:**
- Create: `src/features/cuotas/queries.ts`, `schemas.ts`, `actions.ts`, `messages.ts`
- Create: `src/features/cuotas/components/cuotas-table.tsx`, `periodo-filter.tsx`, `generar-cuotas-dialog.tsx`
- Create: `src/app/(app)/cuotas/page.tsx`
- Test: `src/features/cuotas/schemas.test.ts`, `src/features/cuotas/actions.test.ts`, `src/features/cuotas/components/cuotas-table.test.tsx`

**Interfaces:**
- Consumes: `runAction`, `ROLES_GESTION`, `currentPeriod`, `DataTable`, `StatusBadge`, `hasRole`.
- Produces: `CuotaInfo = Views<'cuotas_info'>`; `listCuotasPeriodo(supabase, anio, mes): Promise<CuotaInfo[]>` (orden `direccion` asc); `listAnios(supabase): Promise<number[]>` (de `anios.anio`, desc); `listMeses(supabase): Promise<{ id: number; name: string }[]>`; `listEstatus(supabase): Promise<string[]>`.
- Produces: `periodoSchema = z.object({ anio: z.coerce.number().int().min(2000), mes: z.coerce.number().int().min(1).max(12) })`.
- Produces: `generarCuotas(input: { anio: number; mes: number }): Promise<ActionResult>`: `runAction(ROLES_GESTION, ...)`, `supabase.rpc('generar_cuotas', { p_anio, p_mes })`; error → `fail('No fue posible generar las cuotas: ' + error.message)`; éxito → `revalidatePath('/cuotas')`. Mensaje éxito `'Cuotas generadas correctamente.'`.
- Produces: `PeriodoFilter({ anios, meses, anio, mes, estatus?, estatusOptions? })` (cliente): Selects "Año" y "Mes" que escriben `?anio=&mes=`; Select "Estatus" con opción "Todos" guardado en estado local y pasado a la tabla vía `onEstatusChange`; icono de limpiar visible cuando hay filtro, vuelve al periodo actual.
- Produces: `CuotasTable({ rows, estatus: string | null })` columnas Dirección, Periodo, Concepto, Importe (`formatMoney(importe_cuota)`), Vencimiento (`fecha_vencimiento_formated`), Estatus (`StatusBadge`).

- [ ] **Paso 1: Pruebas fallidas**

`schemas.test.ts`: `{ anio: '2026', mes: '13' }` falla; `{ anio: '2026', mes: '2' }` → `{ anio: 2026, mes: 2 }`.
`actions.test.ts`: con rol Comite → `fail(MSG_NO_PERMISO)` y `rpc` no llamado; con Tesorero llama `rpc('generar_cuotas', { p_anio: 2026, p_mes: 3 })`; si `rpc` devuelve `error: { message: 'x' }` → `fail('No fue posible generar las cuotas: x')`.
`cuotas-table.test.tsx`: con `estatus: 'Vencido'` solo muestra las filas con ese estatus; con `null` muestra todas.
Run → FAIL.

- [ ] **Paso 2: Implementar** queries, acción, filtro, tabla y página. La página lee `searchParams`, valida con `periodoSchema.safeParse`, cae en `currentPeriod()` si falla, y muestra el botón "Generar Cuotas" solo si `hasRole(user, ROLES_GESTION)`. El diálogo tiene Selects Año y Mes (default periodo actual) y botón "Generar".

- [ ] **Paso 3: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → PASS.

---

### Tarea 11: Cuotas del domicilio: sección, cuota individual y descuento/recargo

**Files:**
- Modify: `src/features/cuotas/queries.ts`, `actions.ts`, `messages.ts`
- Create: `src/features/cuotas/components/cuotas-section.tsx`, `generar-cuota-domicilio-dialog.tsx`, `editar-cuota-dialog.tsx`
- Modify: `src/app/(app)/domicilios/[id]/page.tsx` (añadir `CuotasSection`)
- Test: `src/features/cuotas/actions.test.ts` (ampliar)

**Interfaces:**
- Consumes: `lastDayOfMonthISO`, `ESTATUS`, `ROLES_GESTION`, `ConfirmDialog`.
- Produces: `listCuotasDomicilio(supabase, domicilioId): Promise<CuotaInfo[]>` (orden `anio` desc, `mes` desc); `getCuotaInfo(supabase, id): Promise<CuotaInfo | null>`; `getDescuentoCuota(supabase, cuotaId): Promise<Tables<'descuento_cuota'> | null>`; `getRecargoCuota(supabase, cuotaId)`; `listConceptosDescuento(supabase)`; `listConceptosRecargo(supabase)`; `existeCuota(supabase, domicilioId, anio, mes): Promise<boolean>`; `getDomicilioConceptoInfo(supabase, domicilioId): Promise<Views<'domicilio_concepto_info'> | null>`.
- Produces: `generarCuotaDomicilio(domicilioId, input: { anio; mes }): Promise<ActionResult>`: `ROLES_GESTION`; si `existeCuota` → `fail('Ya existe una cuota registrada para el año y mes seleccionados.')`; sin concepto → `fail('El domicilio no tiene un tipo de cuota asignado.')`; insert `cuotas { domicilio_id, anio, mes, fecha_vencimiento: lastDayOfMonthISO(anio, mes), estatus_id: 1, concepto_id, importe }`. Éxito `'Cuota generada correctamente.'`.
- Produces: `editarCuota(cuotaId, domicilioId, input: { conceptoDescuentoId?: number; conceptoRecargoId?: number }): Promise<ActionResult>`: `ROLES_GESTION`; la cuota debe tener `estatus` Pendiente o Vencido, si no `fail('Solo se pueden editar cuotas pendientes o vencidas.')`; inserta `descuento_cuota` solo si no existe y se envió; igual `recargo_cuota`. Éxito `'Cuota editada correctamente.'`. `eliminarDescuento(id, domicilioId)`, `eliminarRecargo(id, domicilioId)`.
- Produces: `CuotasSection({ domicilioId, cuotas, puedeGestionar: boolean })`: título "Cuotas", botón "Crear Cuota" si `puedeGestionar`; tabla Periodo, Concepto, Importe (`importe_cuota`), Vencimiento, Estado (`StatusBadge(estatus)`), Acciones: "Pagar" y editar solo si `puedeGestionar` y estado ∈ {Pendiente, Vencido}; "Recibo" solo si estado Pagado. Los botones "Pagar" y "Recibo" reciben `renderPagar?: (cuota) => ReactNode` y `renderRecibo?: (cuota) => ReactNode` que la Tarea 13 conecta; hasta entonces no se renderizan.

- [ ] **Paso 1: Pruebas fallidas (ampliar `actions.test.ts`)**

`generarCuotaDomicilio` duplicada → mensaje de duplicado sin insert; sin concepto → mensaje sin insert; válida → insert con `fecha_vencimiento: '2026-02-28'` para `{ anio: 2026, mes: 2 }` y `estatus_id: 1`. `editarCuota` sobre cuota Pagado → fail; con descuento existente y `conceptoDescuentoId` → no inserta descuento pero sí recargo si se envió; rol Comite → `MSG_NO_PERMISO`.
Run → FAIL.

- [ ] **Paso 2: Implementar** queries, acciones, diálogos (Generar: Selects Año y Mes; Editar: Selects "Descuento" y "Recargo" con "Sin descuento"/"Sin recargo", y botón "Quitar" junto al existente con confirmación) y la sección; añadirla a la página de detalle con `puedeGestionar = hasRole(user, ROLES_GESTION)`.

- [ ] **Paso 3: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → PASS.

---

### Tarea 12: Recibos: Route Handler y diálogo de visualización, descarga e impresión

**Files:**
- Create: `src/features/pagos/queries.ts`, `src/features/pagos/components/recibo-dialog.tsx`, `recibo-button.tsx`
- Create: `src/app/api/recibos/[pagoId]/route.ts`
- Test: `src/app/api/recibos/[pagoId]/route.test.ts`, `src/features/pagos/components/recibo-dialog.test.tsx`

**Interfaces:**
- Consumes: `createClient`, `getCurrentUser`, `parseRouteId`, `PRINT_AGENT_URL`.
- Produces: `getPagoRecibo(supabase, pagoId): Promise<{ referencia: string; file_data: string | null } | null>`; `getPagoIdPorCuota(supabase, cuotaId): Promise<number | null>` (primer `pagos.id` con ese `cuota_id`).
- Produces: `GET /api/recibos/[pagoId]`: 401 sin usuario activo; 404 si id inválido, pago inexistente o `file_data` nulo; 200 `application/pdf`, `Content-Disposition: inline; filename="<referencia>.pdf"`, cuerpo = base64 decodificado (quitar prefijo `data:...,` si existe).
- Produces: `ReciboDialog({ pagoId: number; trigger: ReactNode })` (cliente): al abrir hace `fetch('/api/recibos/' + pagoId)`, muestra el PDF en `<iframe>` con `URL.createObjectURL(blob)` sobre fondo `#444444`, título = referencia (leída del header `Content-Disposition`), botones "Descargar" (ancla con `download="<referencia>.pdf"`) e "Imprimir" (convierte el blob a base64 y hace `POST PRINT_AGENT_URL` con `{ pdf_base64 }`; `success` → toast "El ticket se imprimió correctamente.", si no "Error al imprimir el ticket."). Si la respuesta es 404 muestra "Este pago no tiene recibo disponible."
- Produces: `ReciboButton({ pagoId })` = `ReciboDialog` con botón "Recibo".

- [ ] **Paso 1: Pruebas fallidas**

`route.test.ts` (mock `@/lib/supabase/server` y `@/lib/auth/current-user`): sin usuario → 401; `pagoId = 'x'` → 404; pago con `file_data: null` → 404; con `file_data: btoa('%PDF-1.4')` → 200, `content-type` `application/pdf`, body decodificado empieza por `%PDF`, header `content-disposition` contiene `filename="abc-123.pdf"`.
`recibo-dialog.test.tsx` (mock global `fetch`): al abrir con 404 muestra "Este pago no tiene recibo disponible."; con 200 renderiza un `iframe`.
Run → FAIL.

- [ ] **Paso 2: Implementar** route (usar `Buffer.from(b64, 'base64')`), queries y diálogo.

- [ ] **Paso 3: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → PASS.

---

### Tarea 13: Pago de cuota con recibo

**Files:**
- Create: `src/features/pagos/schemas.ts`, `actions.ts`, `recibo.ts`, `messages.ts`
- Create: `src/features/pagos/components/registrar-pago-cuota-dialog.tsx`
- Modify: `src/features/pagos/queries.ts` (añadir `listMetodosPago`), `src/features/cuotas/components/cuotas-section.tsx` y la página de detalle (conectar `renderPagar` y `renderRecibo`)
- Test: `src/features/pagos/recibo.test.ts`, `src/features/pagos/actions.test.ts`

**Interfaces:**
- Consumes: `runAction`, `ROLES_GESTION`, `invokeEdgeFunction`, `getCuotaInfo`, `todayISO`, `formatDate`, `ESTATUS`, `ReciboDialog`, `getPagoIdPorCuota`.
- Produces: `listMetodosPago(supabase): Promise<Tables<'metodos_pago'>[]>`.
- Produces: `ReciboPayload = { direccion: string; residente: string; periodo?: string; concepto: string; fecha_vencimiento?: string; importe: number; descuento?: number; recargo?: number; fecha_pago: string; referencia: string }`; `generarReciboBase64(supabase, payload: ReciboPayload): Promise<string | null>` → POST `generar-recibo-b64`, devuelve `json.file` o `null` si la respuesta no es 2xx o falla (registrar con `console.error`, nunca lanzar).
- Produces: `pagoCuotaSchema = z.object({ cuotaId: z.coerce.number().int().positive(), fechaPago: fechaNoFuturaSchema, metodoPagoId: z.coerce.number().int().positive() })`.
- Produces: `registrarPagoCuota(input: z.input<typeof pagoCuotaSchema>): Promise<ActionResult<{ pagoId: number; reciboGenerado: boolean }>>`. Orden exacto: (1) `runAction(ROLES_GESTION)`; (2) `getCuotaInfo`; inexistente → `fail('La cuota no existe.')`; `estatus === 'Pagado'` → `fail('Esta cuota ya fue pagada.')`; (3) insert `pagos { domicilio_id, cuota_id, concepto_id, fecha_pago, metodo_pago_id, user_id: user.id, importe: importe_cuota }` con `.select('id, referencia').single()`; (4) `generarReciboBase64` con `{ direccion, residente: residente_principal, periodo, concepto, fecha_vencimiento: fecha_vencimiento_formated, importe: importe_base, descuento: monto_descuento, recargo: monto_recargo, fecha_pago: formatDate(fechaPago), referencia }`; (5) si hay base64, update `pagos { file_data }`; (6) update `cuotas { estatus_id: 2 }` siempre; (7) revalidar `/domicilios/${domicilio_id}`, `/cuotas`, `/pagos`, `/movimientos`, `/`. Mensajes: `MSG_PAGO_OK = 'Pago registrado correctamente.'`, `MSG_SIN_RECIBO = 'El pago se registró pero no fue posible generar el recibo.'`.
- Produces: `RegistrarPagoCuotaDialog({ cuota: CuotaInfo, metodos, trigger })`: cabecera de solo lectura DIRECCIÓN, RESIDENTE, PERIODO, FECHA DE VENCIMIENTO, CONCEPTO, IMPORTE (`formatMoney(importe_cuota)`); campos "Fecha de Pago *" (`type="date"`, `max=todayISO()`, default hoy) y "Método de Pago *"; botón "Registrar Pago".

- [ ] **Paso 1: Pruebas fallidas**

`recibo.test.ts` (mock `invokeEdgeFunction`): respuesta 200 `{ file: 'AAA' }` → `'AAA'`; respuesta 500 → `null`; `fetch` lanza → `null`.
`actions.test.ts`:
```ts
test('rechaza cuota pagada', ...) // fail('Esta cuota ya fue pagada.'); sin insert
test('rechaza fecha futura', ...) // ok:false con mensaje de zod
test('flujo completo con recibo', ...) // insert pagos con importe 350 (importe_cuota) y user_id; recibo con importe 250 (importe_base), descuento 0, recargo 100, fecha_pago '05/10/2026'; update file_data; update cuotas estatus_id 2; ok({ pagoId: 11, reciboGenerado: true })
test('si el recibo falla igual marca pagada', ...) // generarReciboBase64 → null; no update file_data; update cuotas estatus 2; ok({ reciboGenerado: false })
test('rol Vigilancia no puede pagar', ...) // MSG_NO_PERMISO
```
Run → FAIL.

- [ ] **Paso 2: Implementar** schema, `recibo.ts`, acción y diálogo. En la sección de cuotas de la página de detalle: `renderPagar = cuota => <RegistrarPagoCuotaDialog cuota metodos trigger={<Button>Pagar</Button>} />`; `renderRecibo = cuota => <ReciboPorCuota cuotaId />` donde `ReciboPorCuota` es un server component que llama `getPagoIdPorCuota` y renderiza `ReciboButton` si hay pago. El diálogo, tras éxito, hace `toast.success(MSG_PAGO_OK)`, `toast.warning(MSG_SIN_RECIBO)` si `!reciboGenerado`, cierra y `router.refresh()`.

- [ ] **Paso 3: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → PASS.

---

### Tarea 14: Pago extra y página de Pagos

**Files:**
- Modify: `src/features/pagos/queries.ts`, `schemas.ts`, `actions.ts`
- Create: `src/features/pagos/components/registrar-pago-extra-dialog.tsx`, `pagos-table.tsx`, `pagos-extra-section.tsx`
- Create: `src/app/(app)/pagos/page.tsx`
- Modify: `src/app/(app)/domicilios/[id]/page.tsx` (añadir `PagosExtraSection`)
- Test: `src/features/pagos/actions.test.ts` (ampliar)

**Interfaces:**
- Consumes: `listDomiciliosOptions`, `getDomicilioInfo`, `SearchableSelect`, `TIPO_PAGO`, `generarReciboBase64`.
- Produces: `PagoInfo = Views<'pagos_info'>`; `listPagos(supabase): Promise<PagoInfo[]>` (orden `id` desc); `listPagosExtraDomicilio(supabase, domicilioId): Promise<PagoInfo[]>` (`tipo_pago_id = 2`, orden `id` desc); `listConceptosExtra(supabase): Promise<Tables<'conceptos_pago'>[]>` (`tipo_pago_id = 2`).
- Produces: `pagoExtraSchema = z.object({ domicilioId: positiveInt, conceptoId: positiveInt, fechaPago: fechaNoFuturaSchema, metodoPagoId: positiveInt })`.
- Produces: `registrarPagoExtra(input): Promise<ActionResult<{ pagoId: number; reciboGenerado: boolean }>>`: `ROLES_GESTION`; lee el concepto (`conceptos_pago` por id, debe tener `tipo_pago_id = 2`, si no `fail('Concepto inválido.')`) y el domicilio (`getDomicilioInfo`); insert `pagos { domicilio_id, concepto_id, fecha_pago, metodo_pago_id, user_id, importe: concepto.importe }` (sin `cuota_id`); recibo con `{ direccion, residente: residente_principal, concepto: nombre, importe, fecha_pago: formatDate(fechaPago), referencia }`; update `file_data` si hay; revalidar `/pagos`, `/domicilios/${domicilioId}`, `/movimientos`, `/`.
- Produces: `RegistrarPagoExtraDialog({ domicilioId?: number; domicilios, conceptos, metodos, trigger })`: "Dirección *" (`SearchableSelect`, deshabilitado y preseleccionado si viene `domicilioId`), "Concepto *" (al elegir muestra IMPORTE de solo lectura), "Fecha de Pago *" (≤ hoy), "Método de Pago *"; botón "Registrar Pago".
- Produces: `PagosTable({ rows })` columnas Referencia, Concepto, Domicilio (`direccion`), Importe, Fecha de Pago (`formatDate(fecha_pago)`), Acciones (`ReciboButton`). `PagosExtraSection({ domicilioId, pagos, puedeGestionar, domicilios, conceptos, metodos })`: título "Pagos Extra", botón "Pago Extra" si `puedeGestionar`, tabla Concepto, Importe, Fecha de Pago, Acciones ("Recibo").

- [ ] **Paso 1: Pruebas fallidas (ampliar `actions.test.ts`)**

`registrarPagoExtra` con concepto de `tipo_pago_id = 1` → `fail('Concepto inválido.')`; válido → insert sin `cuota_id` e `importe` igual al del concepto (200) aunque el input no traiga importe; recibo sin `periodo` ni `fecha_vencimiento`; `reciboGenerado` según el resultado.
Run → FAIL.

- [ ] **Paso 2: Implementar** queries, schema, acción, diálogos, tabla, sección y página `/pagos` (botón "Pago Extra" solo con `ROLES_GESTION`, sin `domicilioId`).

- [ ] **Paso 3: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → PASS.

---

### Tarea 15: Movimientos financieros

**Files:**
- Create: `src/features/movimientos/queries.ts`, `schemas.ts`, `actions.ts`, `messages.ts`
- Create: `src/features/movimientos/components/movimientos-table.tsx`, `registrar-movimiento-dialog.tsx`, `saldo-card.tsx`
- Create: `src/app/(app)/movimientos/page.tsx`
- Test: `src/features/movimientos/schemas.test.ts`, `src/features/movimientos/actions.test.ts`, `src/features/movimientos/components/movimientos-table.test.tsx`

**Interfaces:**
- Consumes: `getResumenFinanciero`, `listMetodosPago`, `Money`, `TIPO_MOVIMIENTO`.
- Produces: `listMovimientos(supabase): Promise<Views<'movimientos_info'>[]>` (orden `id` desc); `listTiposMovimiento(supabase): Promise<Tables<'tipos_movimientos'>[]>`.
- Produces: `movimientoSchema = z.object({ tipoId: positiveInt, descripcion: z.string().trim().min(1, 'La descripción es obligatoria'), importe: z.coerce.number().positive('El importe debe ser mayor a 0'), metodoPagoId: positiveInt, fechaMovimiento: fechaNoFuturaSchema })`.
- Produces: `registrarMovimiento(input): Promise<ActionResult>`: `ROLES_GESTION`; insert `movimientos_financieros { tipo_id, descripcion, importe, metodo_pago_id, user_id, fecha_movimiento }`; revalidar `/movimientos`, `/`. Éxito `'Movimiento registrado correctamente.'`.
- Produces: `SaldoCard({ saldo })` "SALDO ACTUAL"; `MovimientosTable({ rows })` columnas Tipo, Descripción, Importe (`Money` con `variant` egreso si `tipo_id === 2`, si no ingreso), Fecha (`formatDate(fecha_movimiento)`); `RegistrarMovimientoDialog` con título "Registrar Movimiento" y campos "Tipo de Movimiento *", "Importe *" (`inputMode="decimal"`), "Descripción *", "Fecha de Movimiento *" (≤ hoy, default hoy), "Método de Pago *".

- [ ] **Paso 1: Pruebas fallidas**

`schemas.test.ts`: `importe: '0'` falla; `importe: '150.50'` → 150.5; descripción vacía falla.
`actions.test.ts`: insert con `user_id` del usuario; rol Comite → `MSG_NO_PERMISO`.
`movimientos-table.test.tsx`: fila Egreso de 100 muestra "- $100.00" con clase `text-egreso`; fila Ingreso muestra "+ $100.00" con `text-ingreso`.
Run → FAIL.

- [ ] **Paso 2: Implementar** y montar la página (saldo + botón "Nuevo Movimiento" para `ROLES_GESTION` + tabla).

- [ ] **Paso 3: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → PASS.

---

### Tarea 16: Reportes: pestaña "Pagos por Usuario"

**Files:**
- Create: `src/features/reportes/queries.ts`, `schemas.ts`
- Create: `src/features/reportes/components/reportes-tabs.tsx`, `pagos-usuario-tab.tsx`, `pagos-usuario-filtros.tsx`
- Create: `src/app/(app)/reportes/page.tsx`
- Test: `src/features/reportes/schemas.test.ts`, `src/features/reportes/components/pagos-usuario-tab.test.tsx`

**Interfaces:**
- Consumes: `DataTable`, `ReciboButton`, `formatMoney`, `Tabs`.
- Produces: `listUsuariosReporte(supabase): Promise<{ id: string; user_name: string }[]>` (`users_info` con `role_name` in Administrador, Tesorero); `listPagosPorUsuario(supabase, f: { userId: string; inicio: string; fin: string }): Promise<Views<'reporte_pagos_detalle'>[]>` (`fecha_pago >= inicio`, `<= fin`, orden `id` desc).
- Produces: `pagosUsuarioFiltroSchema = z.object({ usuario: z.uuid(), inicio: isoDateSchema, fin: isoDateSchema }).refine(f => f.inicio <= f.fin, 'La fecha fin debe ser posterior a la fecha inicio')`; `totalImporte(rows: { importe: number | null }[]): number`.
- Produces: página `/reportes?tab=usuario|vehicular|peatonal` (default `usuario`) con `ReportesTabs` (cliente, cambia `tab` en la URL) y una pestaña por tarea. `PagosUsuarioFiltros` (cliente): Select "Usuario", inputs date "Fecha inicio" y "Fecha fin" (`max` hoy; `fin.min = inicio`), botón de buscar que valida en cliente: faltan filtros → `toast.error('Debes seleccionar todos los filtros para poder generar el reporte.')`; fin sin inicio → `toast.error('Primero debes seleccionar la fecha de inicio.')`; si ok escribe `usuario`, `inicio`, `fin` en la URL. `PagosUsuarioTab` (server) ejecuta la consulta solo si los tres params validan; muestra tarjeta "TOTAL" con `formatMoney(totalImporte(rows))` y tabla Referencia, Usuario (`nombre_usuario`), Método de Pago (`metodo_pago_nombre`), Importe, Fecha de Pago, Acciones (`ReciboButton`).

- [ ] **Paso 1: Pruebas fallidas**

`schemas.test.ts`: `inicio > fin` falla; uuid inválido falla; `totalImporte([{ importe: 100 }, { importe: null }, { importe: 50.5 }])` → 150.5.
`pagos-usuario-tab.test.tsx`: con `rows` de 100 y 50 muestra "TOTAL" "$150.00"; con `rows = []` muestra el `EmptyState`.
Run → FAIL.

- [ ] **Paso 2: Implementar** y montar página con `Tabs` (pestañas "Pagos por Usuario", "Acceso Vehicular", "Acceso Peatonal"; las dos últimas quedan con un placeholder "Próximamente" hasta la Tarea 17).

- [ ] **Paso 3: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → PASS.

---

### Tarea 17: Reportes: accesos vehicular y peatonal con exports

**Files:**
- Modify: `src/features/reportes/queries.ts`, `schemas.ts`
- Create: `src/features/reportes/components/acceso-vehicular-tab.tsx`, `acceso-peatonal-tab.tsx`, `periodo-reporte-filtros.tsx`
- Create: `src/app/api/exports/eldesgate/route.ts`, `src/app/api/exports/zkteco/route.ts`
- Modify: `src/app/(app)/reportes/page.tsx` (reemplazar placeholders)
- Test: `src/features/reportes/schemas.test.ts` (ampliar), `src/app/api/exports/eldesgate/route.test.ts`, `src/app/api/exports/zkteco/route.test.ts`

**Interfaces:**
- Consumes: `invokeEdgeFunction`, `createClient`, `getCurrentUser`, `periodoSchema`, `currentPeriod`, `listAnios`, `listMeses`.
- Produces: `listAccesosTelefono(supabase, anio, mes): Promise<Views<'accesos_telefono_info'>[]>`; `listAccesosTarjeta(supabase, anio, mes): Promise<Views<'accesos_tarjeta_info'>[]>` (ambas orden `direccion` asc).
- Produces: `eldesgateParamsSchema = periodoSchema.extend({ salida: z.enum(['1', '2', 'BOTH']) })`; `zktecoParamsSchema = periodoSchema.extend({ inicioID: z.coerce.number().int().min(1) })`.
- Produces: `GET /api/exports/eldesgate?mes&anio&salida`: 401 sin usuario activo; 400 si el schema falla (cuerpo JSON `{ error }`); si ok, `invokeEdgeFunction(supabase, 'create-eldesgate-csv', { query: { mes, anio, salida } })`; respuesta no 2xx → 502 con el texto de la función; 2xx → reenviar `body`, `Content-Type` y `Content-Disposition` tal cual. `GET /api/exports/zkteco?mes&anio&inicioID` igual contra `create-zkteco-txt`.
- Produces: `PeriodoReporteFiltros({ anios, meses, anio, mes, extra?: ReactNode })` (cliente, Selects que escriben `anio`, `mes` en la URL y botón de buscar que añade `buscar=1`). `AccesoVehicularTab`: consulta solo si `buscar=1`; tabla Domicilio, Teléfono 1, Teléfono 2; Select "Salida" (`1`, `2`, `BOTH`, default `1`) y enlace-botón "Descargar CSV" a `/api/exports/eldesgate?...` habilitado solo si hay filas. `AccesoPeatonalTab`: tabla Domicilio, Tarjeta 1, Tarjeta 2, Tarjeta 3; input "ID Inicio" (dígitos) y "Descargar TXT" a `/api/exports/zkteco?...` habilitado solo si hay filas e ID Inicio ≥ 1.

- [ ] **Paso 1: Pruebas fallidas**

`schemas.test.ts`: `salida: 'X'` falla; `inicioID: '0'` falla; `{ mes: '3', anio: '2026', inicioID: '100' }` → `{ mes: 3, anio: 2026, inicioID: 100 }`.
`eldesgate/route.test.ts` (mock `invokeEdgeFunction`): sin usuario → 401; `mes=13` → 400 y función no llamada; función responde 200 con `Content-Disposition: attachment; filename="accesos_telefonicos_2026_03.csv"` → la respuesta conserva ese header y el body; función responde 404 "No existen..." → 502.
`zkteco/route.test.ts`: `inicioID=0` → 400; válido → llama con `query { mes: '3', anio: '2026', inicioID: '100' }`.
Run → FAIL.

- [ ] **Paso 2: Implementar** routes, queries, filtros y pestañas; reemplazar placeholders en la página.

- [ ] **Paso 3: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → PASS.

---

### Tarea 18: Usuarios

**Files:**
- Create: `src/features/usuarios/queries.ts`, `schemas.ts`, `actions.ts`, `messages.ts`
- Create: `src/features/usuarios/components/usuarios-table.tsx`, `estado-filter.tsx`, `add-user-dialog.tsx`, `edit-user-dialog.tsx`
- Create: `src/app/(app)/usuarios/page.tsx`
- Test: `src/features/usuarios/schemas.test.ts`, `src/features/usuarios/actions.test.ts`

**Interfaces:**
- Consumes: `requireRole`, `runAction`, `ROLES`, `invokeEdgeFunction`, `ConfirmDialog`.
- Produces: `listUsuarios(supabase, activos: boolean): Promise<Views<'users_info'>[]>` (`is_active`, orden `created_at` asc); `listRoles(supabase): Promise<Tables<'roles'>[]>` (orden `id` asc).
- Produces: `nuevoUsuarioSchema = z.object({ userName: z.string().trim().min(1).transform(toTitleCase), email: z.email(), password: z.string().min(6, 'Mínimo 6 caracteres'), roleId: positiveInt })`; `editarUsuarioSchema = z.object({ userName: ..., roleId: positiveInt })`.
- Produces: `crearUsuario(input): Promise<ActionResult>`: `runAction([ROLES.ADMINISTRADOR])`; `invokeEdgeFunction(supabase, 'create-user', { method: 'POST', body: { email, password, user_name, role_id } })`; respuesta con `success: true` → ok y `'Usuario creado correctamente.'`; si no → `fail('No fue posible crear el usuario: ' + (json.error ?? 'error desconocido'))`. `actualizarUsuario(id, input)`: update `users { user_name }` y `user_roles { role_id }` por `user_id`. `cambiarEstadoUsuario(id, isActive)`: si `id === user.id` → `fail('No puedes desactivar tu propio usuario.')`; update `users { is_active }`. Éxito activar `'El usuario fue activado correctamente.'`, desactivar `'El usuario fue desactivado correctamente.'`. Todas revalidan `/usuarios`.
- Produces: página `/usuarios?estado=activos|inactivos` (default `activos`): `await requireRole(ROLES.ADMINISTRADOR)` dentro de `try`, `AuthorizationError` → `notFound()`. `EstadoFilter` (Select Activos/Inactivos → URL). Tabla Nombre, Email, Rol, Acciones: editar (`EditUserDialog`, Select de rol deshabilitado si es el usuario actual), desactivar (icono papelera, solo si activo y no es el usuario actual, confirmación "Desactivar Usuario"), activar (icono redo, solo si inactivo, sin confirmación). Botón "Nuevo Usuario" → `AddUserDialog` con "Nombre *", "Email *", "Contraseña *" (mostrar/ocultar), "Rol de Usuario *".

- [ ] **Paso 1: Pruebas fallidas**

`schemas.test.ts`: password de 5 falla; email inválido falla; `userName: 'ana lopez'` → `'Ana Lopez'`.
`actions.test.ts`: `crearUsuario` con rol Tesorero → `MSG_NO_PERMISO` y función no llamada; con Administrador llama con body `{ email, password, user_name, role_id }`; respuesta `{ error: 'dup' }` → `fail('No fue posible crear el usuario: dup')`; `cambiarEstadoUsuario(user.id, false)` → fail propio usuario; `actualizarUsuario` hace ambos updates.
Run → FAIL.

- [ ] **Paso 2: Implementar.**

- [ ] **Paso 3: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → PASS.

---

### Tarea 19: Cierre: build, README y lista de comprobación manual

**Files:**
- Create: `README.md`
- Modify: lo necesario para que `npm run build` pase sin advertencias de tipos ni lint

- [ ] **Paso 1: Build**

Run: `npm run build` → termina sin errores. Corregir cualquier error de tipos o de reglas de Next.js (por ejemplo, `searchParams` sin `await`).

- [ ] **Paso 2: README**

Contenido: requisitos (Node 24), `cp .env.example .env.local` y rellenar la llave publicable, `npm install`, `npm run dev`, `npm test`, `npm run build`; estructura de carpetas (`features`, `lib`, `components`); nota de que la BD, RLS y edge functions no se tocan; enlace a la spec y al anexo; y la lista de comprobación manual siguiente.

- [ ] **Paso 3: Lista de comprobación manual (para el propietario, con el servidor levantado)**

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

- [ ] **Paso 4: Estado final**

Run: `npm test && npm run typecheck && npm run lint && git status` → todo verde y los cambios sin commitear, listos para que el propietario los revise.
