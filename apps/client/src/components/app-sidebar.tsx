"use client"

import type * as React from "react"
import {
  AudioWaveform,
  Command,
  Flag,
  GalleryVerticalEnd,
  History,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@roro-ai/ui/components/ui/sidebar"
import LogoutButton from "./auth/logout-button"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Practice",
      url: "/dashboard/practice",
      icon: SquareTerminal,
    },
    {
      title: "History",
      url: "/dashboard/history",
      icon: History,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
    },
    {
      title: "Feedback",
      url: "/dashboard/feedback",
      icon: Flag
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="bg-card border-b">
        <NavUser />
      </SidebarHeader>
      <SidebarContent className="bg-card">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <LogoutButton />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}