import { LoginForm } from '@/features/auth/components/login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <LoginForm next={next} error={error} />
    </main>
  )
}
