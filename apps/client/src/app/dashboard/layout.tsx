import { AppSidebar } from '@/components/app-sidebar'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import { SidebarInset, SidebarProvider } from '@roro-ai/ui/components/ui/sidebar'
import type React from 'react'

export default function DashboardLayout({children}: {children: React.ReactNode}) {
    
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}