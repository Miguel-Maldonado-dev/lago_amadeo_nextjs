'use client'

import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CATALOGOS, TABS_CATALOGO, type TabCatalogo } from '../catalogos'

export function CatalogosTabs({ tab, children }: { tab: TabCatalogo; children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  return (
    <Tabs value={tab} onValueChange={(v) => router.replace(`${pathname}?tab=${v}`)} className="space-y-4">
      <TabsList className="h-auto flex-wrap">
        {TABS_CATALOGO.map((t) => (
          <TabsTrigger key={t} value={t}>
            {CATALOGOS[t].tab}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  )
}
