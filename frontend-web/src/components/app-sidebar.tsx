"use client";

import * as React from "react";
import { BotMessageSquare, Shield, SquareTerminal, Users } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = {
    navMain: [
      {
        title: "Perintah",
        url: "/",
        icon: SquareTerminal,
        items: [
          {
            title: "Daftar Perintah",
            url: "/",
          },
          {
            title: "Tambahkan Perintah",
            url: "/tambah",
          },
        ],
      },
      {
        title: "Group",
        url: "/group",
        icon: Users,
        items: [
          {
            title: "Info Group",
            url: "/group",
          },
        ],
      },
      {
        title: "AI Chat",
        url: "/ai-coding",
        icon: BotMessageSquare,
        items: [
          // {
          //   title: "General",
          //   url: "/group",
          // },
          {
            title: "Coding",
            url: "/ai-coding",
          },
          // {
          //   title: "Fun",
          //   url: "/group",
          // },
        ],
      },
      {
        title: "Admin",
        url: "#",
        icon: Shield,
        items: [
          {
            title: "Setelan",
            url: "/admin",
          },
        ],
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
