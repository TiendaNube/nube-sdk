import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '12rem',
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <main className="flex-1 h-screen">{children}</main>
    </SidebarProvider>
  )
}
