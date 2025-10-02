"use client";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

function getTitleFromPathname(pathname: string): string {
  if (pathname === "/") return "Dashboard";

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "Dashboard";

  const lastPart = parts[parts.length - 1];

  if (lastPart === "edit" && parts.length > 1) {
    const parent = parts[parts.length - 2];
    return `Edit ${parent.charAt(0).toUpperCase() + parent.slice(1)}`;
  }

  // Very basic check for CUID/UUID
  if (
    parts.length > 1 &&
    lastPart.length > 20 &&
    !isNaN(Date.parse(lastPart)) === false
  ) {
    const parent = parts[parts.length - 2];
    return `${
      parent.charAt(0).toUpperCase() + parent.slice(1).replace(/s$/, "")
    } Details`;
  }

  return lastPart
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function SiteHeader() {
  const pathname = usePathname();
  const title = getTitleFromPathname(pathname);

  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[var(--header-height)]">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
      </div>
    </header>
  );
}
