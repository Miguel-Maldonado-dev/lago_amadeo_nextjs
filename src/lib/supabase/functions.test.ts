import { invokeEdgeFunction } from '@/lib/supabase/functions'
import { fakeSupabase } from '@/test/fake-query'

vi.mock('@/lib/supabase/env', () => ({
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_KEY: 'publishable-key',
}))

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue(new Response('ok'))
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function supabaseWithToken(accessToken: string) {
  const getSession = vi.fn().mockResolvedValue({ data: { session: { access_token: accessToken } }, error: null })
  return fakeSupabase({}, { auth: { getSession } }) as never
}

test('GET con query y headers apikey + Authorization del usuario', async () => {
  const res = await invokeEdgeFunction(supabaseWithToken('jwt-1'), 'create-eldesgate-csv', {
    query: { mes: '3', anio: '2026' },
  })

  const [url, init] = fetchMock.mock.calls[0]
  expect(String(url)).toBe('https://example.supabase.co/functions/v1/create-eldesgate-csv?mes=3&anio=2026')
  expect(init).toMatchObject({
    method: 'GET',
    headers: { apikey: 'publishable-key', Authorization: 'Bearer jwt-1' },
    body: undefined,
  })
  expect(init.headers).not.toHaveProperty('Content-Type')
  expect(await res.text()).toBe('ok')
})

test('POST envía el body como JSON', async () => {
  await invokeEdgeFunction(supabaseWithToken('jwt-2'), 'create-user', {
    method: 'POST',
    body: { email: 'a@lago.mx', role_id: 1 },
  })

  const [url, init] = fetchMock.mock.calls[0]
  expect(String(url)).toBe('https://example.supabase.co/functions/v1/create-user')
  expect(init).toMatchObject({
    method: 'POST',
    headers: { apikey: 'publishable-key', Authorization: 'Bearer jwt-2', 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'a@lago.mx', role_id: 1 }),
  })
})
