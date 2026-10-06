import {
  Banknote,
  BarChart3,
  Home,
  Landmark,
  Receipt,
  UserCog,
  Users,
  Building2,
  type LucideIcon,
} from 'lucide-react'
import { ROLES, type RoleName } from '@/lib/constants'

export type NavItem = { label: string; href: string; icon: LucideIcon; roles?: RoleName[] }

export const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', href: '/', icon: Home },
  { label: 'Domicilios', href: '/domicilios', icon: Building2 },
  { label: 'Residentes', href: '/residentes', icon: Users },
  { label: 'Cuotas', href: '/cuotas', icon: Receipt },
  { label: 'Pagos', href: '/pagos', icon: Banknote },
  { label: 'Movimientos Financieros', href: '/movimientos', icon: Landmark },
  { label: 'Reportes', href: '/reportes', icon: BarChart3 },
  { label: 'Usuarios', href: '/usuarios', icon: UserCog, roles: [ROLES.ADMINISTRADOR] },
]

/**
 * Ítems visibles para un rol. Recibe solo el nombre del rol (string serializable)
 * para poder usarse en componentes cliente: los iconos son componentes y no pueden
 * cruzar la frontera servidor→cliente como props.
 */
export function visibleNavItems(roleName: RoleName | null): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || (roleName !== null && item.roles.includes(roleName)))
}
