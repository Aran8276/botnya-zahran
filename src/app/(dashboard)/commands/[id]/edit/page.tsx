import CommandForm from "@/components/Commands/CommandForm";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CommandWithOwner } from "../../page";

export default async function EditCommandPage({
  params,
}: {
  params: { id: string };
}) {
  const command: CommandWithOwner | null = await prisma.commands.findUnique({
    where: { id: params.id },
    include: { owner: true },
  });

  if (!command) {
    return notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Command</h1>
      <CommandForm command={command} />
    </div>
  );
}
