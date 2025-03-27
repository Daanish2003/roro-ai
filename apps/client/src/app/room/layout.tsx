import Controller from '@/components/room/controller'
import Join from '@/components/room/join'
import { SidebarInset, SidebarProvider } from '@roro-ai/ui/components/ui/sidebar'
import type React from 'react'

export default function RoomLayout({children}: {children: React.ReactNode}) {
  return (
    <SidebarProvider>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">{children}</div>
          <div className="w-full flex items-center justify-center py-4 border-t">
            <Controller />
          </div>
        </div>
      </SidebarInset>
      <Join />
    </SidebarProvider>
  )
}