import { redirect } from 'next/navigation'
import { AppBar } from '@/components/layout/app-bar'
import { Sidebar } from '@/components/layout/sidebar'
import { getCurrentUser } from '@/lib/auth/current-user'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!user.isActive) redirect('/api/auth/signout?reason=inactive')

  // Solo datos serializables cruzan a los componentes cliente del shell;
  // los ítems de navegación (con iconos) se resuelven en el cliente a partir del rol.
  const shellUser = { userName: user.userName, roleName: user.roleName }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={shellUser} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppBar user={shellUser} />
        <main className="mx-auto w-full max-w-[1400px] p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
