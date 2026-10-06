import { vi, type Mock } from 'vitest'

export type FakeCall = { method: string; args: unknown[] }
export type FakeResult = { data: unknown; error: unknown; count: number | null }

type Chain = { [method: string]: (...args: unknown[]) => FakeQuery }

/** Query builder falso: cualquier método encadena y registra la llamada; `await` resuelve el resultado. */
export type FakeQuery = Chain & PromiseLike<FakeResult> & { readonly calls: FakeCall[] }

/** Propiedades que inspeccionan Vitest/pretty-format; no deben parecer métodos del builder. */
const NOT_METHODS = new Set(['asymmetricMatch', 'toJSON', 'nodeType'])

export function fakeQuery(result: { data?: unknown; error?: unknown; count?: number | null } = {}): FakeQuery {
  const resolved: FakeResult = {
    data: result.data ?? null,
    error: result.error ?? null,
    count: result.count ?? null,
  }
  const calls: FakeCall[] = []

  const query: FakeQuery = new Proxy({} as FakeQuery, {
    get(_target, prop) {
      if (prop === 'calls') return calls
      if (prop === 'then') {
        return (onFulfilled?: (value: FakeResult) => unknown, onRejected?: (reason: unknown) => unknown) =>
          Promise.resolve(resolved).then(onFulfilled, onRejected)
      }
      if (typeof prop !== 'string' || !/^[a-z]/.test(prop) || NOT_METHODS.has(prop)) return undefined
      return (...args: unknown[]) => {
        calls.push({ method: prop, args })
        return query
      }
    },
  })
  return query
}

export function callsOf(query: FakeQuery, method: string): FakeCall[] {
  return query.calls.filter((call) => call.method === method)
}

export function fakeSupabase(
  tables: Record<string, FakeQuery>,
  extra: Partial<{ rpc: Mock; auth: unknown }> = {},
) {
  return {
    from: vi.fn((table: string) => {
      const query = tables[table]
      if (!query) throw new Error(`fakeSupabase: tabla "${table}" no configurada`)
      return query
    }),
    rpc: vi.fn(),
    auth: {} as unknown,
    ...extra,
  }
}
