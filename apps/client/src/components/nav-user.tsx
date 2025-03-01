"use client"


import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@roro-ai/ui/components/ui/avatar"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@roro-ai/ui/components/ui/sidebar"
import { useSession } from "@/lib/auth-client"
import dynamic from "next/dynamic"


function NavUser() {
  const { data: session } = useSession()

  if(!session) {
    return null
  }


  return (
    <SidebarMenu>
      <SidebarMenuItem>
      <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-background data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-5 w-5 rounded-lg">
                <AvatarImage src={session.user.image as string} alt={session.user.name} />
                <AvatarFallback className="rounded-lg bg-primary">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{session.user.name}</span>
                <span className="truncate text-xs">{session?.user.email}</span>
              </div>
            </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default dynamic(() => Promise.resolve(NavUser), { ssr: false });