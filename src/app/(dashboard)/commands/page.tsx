import prisma from "@/lib/prisma";
import { CommandsDataTable } from "./client-page";
import { Commands, User } from "@prisma/client";

export type CommandWithOwner = Commands & { owner: User | null };

export default async function CommandsPage() {
  const commands: CommandWithOwner[] = await prisma.commands.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      owner: true,
    },
  });
  return <CommandsDataTable data={commands} />;
}
