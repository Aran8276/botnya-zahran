"use client";

import { LogOut } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import axios, { AxiosError } from "axios";
import {
  deleteLaravelAccessToken,
  laravelUrl,
  requestHeader,
} from "./GlobalValues";

export function NavProjects() {
  const logout = async () => {
    try {
      await axios.delete(`${laravelUrl}/api/destroy-token`, requestHeader());
      deleteLaravelAccessToken();
      window.location.replace("/login");
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
    }
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Akun</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={logout}>
            <LogOut />
            <span>Keluar</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
