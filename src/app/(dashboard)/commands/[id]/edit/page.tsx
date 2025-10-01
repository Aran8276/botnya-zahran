import CommandForm from "@/components/Commands/CommandForm";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditCommandPage({
  params,
}: {
  params: { id: string };
}) {
  const command = await prisma.commands.findUnique({
    where: { id: params.id },
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