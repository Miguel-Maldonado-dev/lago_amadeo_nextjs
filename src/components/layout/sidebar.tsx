import { SidebarContent, type ShellUser } from './sidebar-content'

export function Sidebar({ user }: { user: ShellUser }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[270px] shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
      <SidebarContent user={user} />
    </aside>
  )
}
