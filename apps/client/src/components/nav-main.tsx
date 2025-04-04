"use client"

import type { LucideIcon } from "lucide-react"


import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@roro-ai/ui/components/ui/sidebar"
import Link from "next/link"
import React from "react"
import { usePathname } from "next/navigation"


export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}) {

  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarMenu className="gap-y-2">
        {items.map((item) => {
          const isActive = pathname === item.url
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive} size={"lg"}>
                <Link href={item.url} className="h-[34]">
                  {item.icon && React.createElement(item.icon, { className: "w-5 h-5" })}
                  {item.title}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}