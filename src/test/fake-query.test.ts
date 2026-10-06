import { callsOf, fakeQuery, fakeSupabase } from '@/test/fake-query'

test('una cadena encadenada resuelve el resultado configurado', async () => {
  const q = fakeQuery({ data: { id: 1 }, count: 3 })

  const result = await q.select('*').eq('id', 1).maybeSingle()

  expect(result).toEqual({ data: { id: 1 }, error: null, count: 3 })
  expect(q.calls).toEqual([
    { method: 'select', args: ['*'] },
    { method: 'eq', args: ['id', 1] },
    { method: 'maybeSingle', args: [] },
  ])
})

test('callsOf filtra las llamadas por método', async () => {
  const q = fakeQuery({ error: { message: 'boom' } })
  const supabase = fakeSupabase({ pagos: q })

  const result = await supabase.from('pagos').insert({ importe: 10 }).select('id')

  expect(result).toEqual({ data: null, error: { message: 'boom' }, count: null })
  expect(supabase.from).toHaveBeenCalledWith('pagos')
  expect(callsOf(q, 'insert')).toEqual([{ method: 'insert', args: [{ importe: 10 }] }])
})

test('fakeSupabase falla con un mensaje claro si la tabla no está configurada', () => {
  const supabase = fakeSupabase({})

  expect(() => supabase.from('cuotas')).toThrow('fakeSupabase: tabla "cuotas" no configurada')
})
