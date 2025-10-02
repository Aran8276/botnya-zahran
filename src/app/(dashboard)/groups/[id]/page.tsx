// src/app/(dashboard)/groups/[id]/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import GroupOptionsForm from "@/components/Groups/GroupOptionsForm";
import ParticipantsManager from "@/components/Groups/ParticipantsManager";
import ScheduleManager from "@/components/Groups/ScheduleManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Group Details</h1>

      <Card>
        <CardHeader>
          <CardTitle>Group Options</CardTitle>
        </CardHeader>
        <CardContent>
          <GroupOptionsForm
            groupOptions={group.groupOption}
            groupId={group.id}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <ParticipantsManager
            participants={group.groupParticipants}
            groupId={group.id}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduler</CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleManager
            scheduler={group.groupScheduler}
            groupId={group.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
