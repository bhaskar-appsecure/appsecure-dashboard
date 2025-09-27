import { AppSidebar } from '../AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-4">Main Content Area</h2>
          <p className="text-muted-foreground">
            This is where the main application content would be displayed.
          </p>
        </div>
      </div>
    </SidebarProvider>
  )
}