"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChevronRight, Github, Instagram, Youtube } from "lucide-react";
import Image from "next/image";
import SocialMedia from "./SocialMedia";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                <Image src="/whatsapp.svg" width={64} height={64} alt="Logo" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">WhatsApp Bot</span>
                <span className="truncate text-xs">by Aran8276</span>
              </div>
              <ChevronRight className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <div className="flex flex-col space-y-2 p-4">
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                WhatsApp Bot
              </h3>
              <p className="text-sm">
                Sistem Aplikasi Bot WhatsApp dengan Panel Kontrol dibuat
                menggunakan Node.js, whatsapp-web.js, Next.js, Laravel, MySQL,
                shadcn/ui.
              </p>
              <p className="text-sm font-bold">
                Made by Aran8276 / Zahran SMK Negeri 6 Malang
              </p>
              <p className="text-sm font-bold">v1.0</p>
              <div className="bg-white w-full h-auto flex items-center justify-center gap-2 flex-wrap">
                <SocialMedia href="https://github.com/Aran8276/">
                  <Github />
                </SocialMedia>
                <SocialMedia href="https://www.youtube.com/@Aran8276/">
                  <Youtube />
                </SocialMedia>
                <SocialMedia href="https://www.instagram.com/aran8276/">
                  <Instagram />
                </SocialMedia>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
