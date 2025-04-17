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
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@roro-ai/ui/components/ui/sidebar"
import Link from "next/link"

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
  const { state } = useSidebar()
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="bg-background border-b">
      <div className={`${state === "expanded" ?  "py-2" : "py-0"}`}>
      <Link href="/" className="flex items-center gap-2">
      <div className="rounded-full bg-gradient-to-r from-green-500 to-green-700 p-1 shadow-lg shadow-green-500/20">
        <div className="h-6 w-6 rounded-full bg-background flex items-center justify-center">
          <span className="text-green-500 font-bold">R</span>
        </div>
      </div>
      {state === 'expanded' && (
        <span className="font-bold text-xl">Roro AI</span>
      )}
    </Link>
      </div>
      </SidebarHeader>
      <SidebarContent className="bg-background">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter className="bg-background border-t">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}