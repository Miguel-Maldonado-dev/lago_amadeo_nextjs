import { beforeEach, describe, expect, test, vi } from 'vitest'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { login } from './actions'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

const signInWithPassword = vi.fn()

function form(next: string) {
  const data = new FormData()
  data.set('email', 'ana@lago.mx')
  data.set('password', 'secreta')
  data.set('next', next)
  return data
}

beforeEach(() => {
  vi.clearAllMocks()
  signInWithPassword.mockResolvedValue({ error: null })
  vi.mocked(createClient).mockResolvedValue({ auth: { signInWithPassword } } as never)
})

describe('login', () => {
  test.each(['//evil.com', '/\\evil.com', '/\\/evil.com', 'https://evil.com', ''])(
    'next=%j fuera del sitio: redirige a /',
    async (next) => {
      await login(null, form(next))
      expect(redirect).toHaveBeenCalledWith('/')
    },
  )

  test('next relativo válido: redirige a esa ruta con su query', async () => {
    await login(null, form('/pagos?x=1'))
    expect(signInWithPassword).toHaveBeenCalledWith({ email: 'ana@lago.mx', password: 'secreta' })
    expect(redirect).toHaveBeenCalledWith('/pagos?x=1')
  })

  test('credenciales inválidas: devuelve el error y no redirige', async () => {
    signInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } })
    const r = await login(null, form('/pagos'))
    expect(r).toEqual({ ok: false, error: 'Error: Invalid login credentials' })
    expect(redirect).not.toHaveBeenCalled()
  })
})
