// src/app/(dashboard)/commands/page.tsx
import prisma from "@/lib/prisma";
import { CommandsDataTable } from "./client-page";

export default async function CommandsPage() {
  const commands = await prisma.commands.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return <CommandsDataTable data={commands} />;
}
