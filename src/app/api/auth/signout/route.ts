import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const inactive = request.nextUrl.searchParams.get('reason') === 'inactive'
  return NextResponse.redirect(
    new URL(inactive ? '/login?error=inactive' : '/login', request.url),
    307,
  )
}
