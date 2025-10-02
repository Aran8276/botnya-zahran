// src/app/(dashboard)/commands/deleted/page.tsx
import prisma from "@/lib/prisma";
import { DeletedCommandsDataTable } from "./client-page";

export default async function DeletedCommandsPage() {
  const commands = await prisma.commands.findMany({
    where: { NOT: { deletedAt: null } },
    orderBy: { deletedAt: "desc" },
  });

  return <DeletedCommandsDataTable data={commands} />;
}
