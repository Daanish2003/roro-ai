"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@roro-ai/ui/components/ui/avatar";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@roro-ai/ui/components/ui/sidebar";
import { useSession } from "@/features/auth/auth-client";
import dynamic from "next/dynamic";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@roro-ai/ui/components/ui/dropdown-menu";
import {

  ChevronsUpDown,
} from "lucide-react";
import Profile from "./dashboard/profile";
import SettingsButton from "./dashboard/setting-button";
import LogoutButton from "./auth/logout-button";

function NavUser() {
  const { isMobile } = useSidebar();
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-transparent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-5 w-5 rounded-sm">
                <AvatarImage src={session.user.image as string} alt={session.user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{session.user.name}</span>
                <span className="truncate text-xs">{session.user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <Profile />
              <DropdownMenuSeparator />
              <SettingsButton />
              <DropdownMenuSeparator />
              <LogoutButton />
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export default dynamic(() => Promise.resolve(NavUser), { ssr: false });
