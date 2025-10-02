import prisma from "@/lib/prisma";
import { DeletedCommandsDataTable } from "./client-page";
import { Commands, User } from "@prisma/client";

export type CommandWithOwner = Commands & { owner: User | null };

export default async function DeletedCommandsPage() {
  const commands: CommandWithOwner[] = await prisma.commands.findMany({
    where: { NOT: { deletedAt: null } },
    orderBy: { deletedAt: "desc" },
    include: {
      owner: true,
    },
  });
  return <DeletedCommandsDataTable data={commands} />;
}
