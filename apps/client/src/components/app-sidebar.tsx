"use client"

import type * as React from "react"
import {
  AudioWaveform,
  Award,
  BarChart,
  BookOpen,
  Command,
  Flag,
  GalleryVerticalEnd,
  LayoutDashboard,
  Settings2,
  ShieldHalf,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
// import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  // SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

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
      title: "Overview",
      url: "/dashboard/overview",
      icon: LayoutDashboard,
    },
    {
      title: "Practice",
      url: "/dashboard/practice",
      icon: SquareTerminal,
    },
    {
      title: "Topics",
      url: "/dashboard/topics",
      icon: BookOpen,
    },
    {
      title: "Progress",
      url: "/dashboard/progress",
      icon: BarChart
    },
    {
      title: "Achievements",
      url: "/dashboard/achievements",
      icon: Award
    },
    {
      title: "Leaderboard",
      url: "/dashboard/leadboard",
      icon: ShieldHalf
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
      <SidebarHeader>
        <NavUser  />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
