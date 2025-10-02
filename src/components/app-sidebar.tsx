"use client";
import * as React from "react";
import {
  IconCommand,
  IconGauge,
  IconTrash,
  IconUsers,
  IconWorld,
  IconInnerShadowTop,
  IconSettings,
} from "@tabler/icons-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Session } from "next-auth";
import { ThemeSwitcher } from "./theme-switcher";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user:
    | (Session["user"] & {
        name?: string | null;
        email?: string | null;
        image?: string | null;
      })
    | undefined;
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const navMain = [
    { title: "Dashboard", href: "/", icon: IconGauge },
    { title: "Commands", href: "/commands", icon: IconCommand },
    { title: "Deleted Commands", href: "/commands/deleted", icon: IconTrash },
    { title: "Groups", href: "/groups", icon: IconWorld },
    { title: "Users", href: "/users", icon: IconUsers },
    { title: "System Stats", href: "/system-stats", icon: IconSettings },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Botnya Zahran</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} pathname={pathname} />
      </SidebarContent>
      <SidebarFooter className="flex-row items-center gap-2">
        <ThemeSwitcher />
        <div className="flex-1">
          <NavUser
            user={{
              name: user?.name ?? "Guest",
              email: user?.email ?? "",
              image: user?.image,
            }}
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
