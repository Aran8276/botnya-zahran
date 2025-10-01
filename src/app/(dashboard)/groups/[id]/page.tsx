import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import GroupOptionsForm from "@/components/Groups/GroupOptionsForm";
import ParticipantsManager from "@/components/Groups/ParticipantsManager";
import ScheduleManager from "@/components/Groups/ScheduleManager";

export default async function GroupDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const group = await prisma.group.findUnique({
    where: { id: params.id },
    include: {
      groupOption: true,
      groupParticipants: true,
      groupScheduler: {
        include: {
          schedules: true,
        },
      },
    },
  });

  if (!group || !group.groupOption || !group.groupScheduler) {
    return notFound();
  }

  return (
    <div className="space-y-12">
      <h1 className="text-3xl font-bold">Group: {group.serializedId}</h1>
      
      <GroupOptionsForm groupOptions={group.groupOption} groupId={group.id} />
      
      <ParticipantsManager participants={group.groupParticipants} groupId={group.id} />
      
      <ScheduleManager scheduler={group.groupScheduler} groupId={group.id} />
    </div>
  );
}