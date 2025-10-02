import * as React from "react";
import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Session } from "next-auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        user={
          session?.user as Session["user"] & {
            name?: string;
            email?: string;
            image?: string;
          }
        }
      />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 p-8 bg-background">{children}</main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
