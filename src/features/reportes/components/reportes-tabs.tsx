'use client'

import { Car, Footprints, UserRound } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ReportesTabs({ tab, children }: { tab: string; children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  return (
    <Tabs value={tab} onValueChange={(v) => router.replace(`${pathname}?tab=${v}`)} className="space-y-4">
      <TabsList>
        <TabsTrigger value="usuario">
          <UserRound />
          Pagos por Usuario
        </TabsTrigger>
        <TabsTrigger value="vehicular">
          <Car />
          Acceso Vehicular
        </TabsTrigger>
        <TabsTrigger value="peatonal">
          <Footprints />
          Acceso Peatonal
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  )
}
