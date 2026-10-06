'use client'

import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useActionState, useState } from 'react'
import { BrandLogo } from '@/components/brand-logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/features/auth/actions'
import { MSG_INACTIVO } from '../messages'

export function LoginForm({ next, error }: { next?: string; error?: string }) {
  const [state, formAction, pending] = useActionState(login, null)
  const [showPassword, setShowPassword] = useState(false)

  const message = state && !state.ok ? state.error : error === 'inactive' ? MSG_INACTIVO : null

  return (
    <Card className="w-full max-w-[440px]">
      <CardHeader className="items-center justify-items-center gap-3 text-center">
        <BrandLogo size={64} />
        <h1 className="text-2xl font-bold">Bienvenido</h1>
        <p className="text-sm text-secondary-foreground">Inicia sesión en el panel de administración</p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={next ?? ''} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          {message && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md bg-danger-light p-3 text-sm text-danger"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}
          <Button type="submit" className="w-full" loading={pending}>
            Iniciar sesión
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta? Contacta a tu administración
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
