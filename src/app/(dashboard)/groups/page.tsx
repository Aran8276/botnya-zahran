// src/app/(dashboard)/groups/page.tsx
import prisma from "@/lib/prisma";
import { GroupsDataTable } from "./client-page";

export default async function GroupsPage() {
  const groups = await prisma.group.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return <GroupsDataTable data={groups} />;
}
