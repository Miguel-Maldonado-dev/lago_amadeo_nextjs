'use client'

import { Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { FilterBar } from '@/components/filter-bar'
import { LabeledSelect } from '@/components/labeled-select'
import { SearchInput } from '@/components/search-input'
import { Card } from '@/components/ui/card'
import { matches } from '@/lib/search'
import type { Tables, Views } from '@/lib/supabase/types'
import { useDebouncedValue } from '@/lib/use-debounced-value'
import { UsuariosTable } from './usuarios-table'

const ESTADO_OPTIONS = [
  { value: 'activos', label: 'Activos' },
  { value: 'inactivos', label: 'Inactivos' },
]

export function UsuariosView({
  rows,
  roles,
  currentUserId,
  estado,
}: {
  rows: Views<'users_info'>[]
  roles: Tables<'roles'>[]
  currentUserId: string
  estado: 'activos' | 'inactivos'
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 300)
  const filtradas = useMemo(
    () => rows.filter((r) => matches([r.user_name, r.email], debouncedQuery)),
    [rows, debouncedQuery],
  )

  return (
    <div className="space-y-6">
      <FilterBar
        onClear={() => {
          setQuery('')
          router.replace('/usuarios')
        }}
      >
        <SearchInput id="usr-q" value={query} onChange={setQuery} placeholder="Buscar por nombre o email..." />
        <LabeledSelect
          id="usr-estado"
          label="Estado"
          icon={Users}
          options={ESTADO_OPTIONS}
          value={estado}
          onChange={(v) => router.replace('/usuarios?estado=' + (v ?? 'activos'))}
        />
      </FilterBar>
      <Card className="p-0">
        <UsuariosTable rows={filtradas} roles={roles} currentUserId={currentUserId} />
      </Card>
    </div>
  )
}
