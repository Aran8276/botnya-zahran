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
import { Role } from "@prisma/client";

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
  const allNavItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: IconGauge,
      roles: [Role.ADMIN, Role.USER, Role.AWAIT_REGISTER],
    },
    {
      title: "Commands",
      href: "/commands",
      icon: IconCommand,
      roles: [Role.ADMIN, Role.USER, Role.AWAIT_REGISTER],
    },
    {
      title: "Deleted Commands",
      href: "/commands/deleted",
      icon: IconTrash,
      roles: [Role.ADMIN, Role.USER, Role.AWAIT_REGISTER],
    },
    { title: "Groups", href: "/groups", icon: IconWorld, roles: [Role.ADMIN] },
    { title: "Users", href: "/users", icon: IconUsers, roles: [Role.ADMIN] },
    {
      title: "System Stats",
      href: "/system-stats",
      icon: IconSettings,
      roles: [Role.ADMIN, Role.USER, Role.AWAIT_REGISTER],
    },
  ];

  const navMain = allNavItems.filter(
    (item) => user?.role && item.roles.includes(user.role)
  );

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
