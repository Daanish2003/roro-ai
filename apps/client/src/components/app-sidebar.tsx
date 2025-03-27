"use client"

import type * as React from "react"
import {
  AudioWaveform,
  CircleHelp,
  Command,
  GalleryVerticalEnd,
  History,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import NavUser from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@roro-ai/ui/components/ui/sidebar"

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
      url: "/practice",
      icon: SquareTerminal,
    },
    {
      title: "History",
      url: "/history",
      icon: History,
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: CircleHelp
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="bg-background border-b">
        <NavUser />
      </SidebarHeader>
      <SidebarContent className="bg-background">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}