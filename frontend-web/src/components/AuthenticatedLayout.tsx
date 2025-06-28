"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

interface SelfProps {
  children?: React.ReactNode;
  breadcrumbEditId?: string;
}

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

export default function AuthenticatedLayout(props: SelfProps) {
  const pathname = usePathname();

  const [breadcrumbArray, setBreadcrumbArray] = useState<BreadcrumbItemType[]>([
    {
      label: "WhatsApp Bot",
      href: "/",
    },
  ]);

  useEffect(() => {
    const newBreadcrumbArray: BreadcrumbItemType[] = [
      {
        label: "WhatsApp Bot",
        href: "/",
      },
    ];
    console.log(pathname);
    const pathnameArray = pathname.split("/");
    const newPathname = pathnameArray[1];
    switch (newPathname) {
      case "":
        newBreadcrumbArray.push({ label: "Perintah" });
        break;

      case "tambah":
        newBreadcrumbArray.push({ label: "Perintah", href: "/" });
        newBreadcrumbArray.push({ label: "Tambah" });
        break;

      case "edit":
        newBreadcrumbArray.push({ label: "Perintah", href: "/" });
        newBreadcrumbArray.push({ label: "Edit" });
        newBreadcrumbArray.push({
          label: `${props.breadcrumbEditId ? props.breadcrumbEditId : ""}`,
        });
        break;

      default:
        break;
    }

    setBreadcrumbArray(newBreadcrumbArray);
  }, [pathname]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbArray.map((item, index) => {
                  return (
                    <React.Fragment key={index}>
                      <BreadcrumbItem className="hidden md:block">
                        {item.href ? (
                          <BreadcrumbLink key={index} href={item.href}>
                            {item.label}
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbLink>{item.label}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index == breadcrumbArray.length - 1 ? (
                        <></>
                      ) : (
                        <BreadcrumbSeparator className="hidden md:block" />
                      )}
                    </React.Fragment>
                  );
                })}

                {/* <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">WhatsApp Bot</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Perintah</BreadcrumbPage>
                </BreadcrumbItem> */}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {props.children}
          <Toaster />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
