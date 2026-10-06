'use server'

import { redirect } from 'next/navigation'
import { fail, type ActionResult } from '@/lib/action-result'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from './schemas'

export async function login(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return fail('Error: Ingresa un email y una contraseña válidos.')

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return fail('Error: ' + error.message)

  const next = formData.get('next')
  const safeNext = typeof next === 'string' && /^\/(?![\/\\])/.test(next) ? next : '/'
  redirect(safeNext)
}

export async function logout(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
