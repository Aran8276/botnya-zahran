import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import GroupOptionsForm from "@/components/Groups/GroupOptionsForm";
import ParticipantsManager from "@/components/Groups/ParticipantsManager";
import ScheduleManager from "@/components/Groups/ScheduleManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

export default async function GroupDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

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

  const isGroupAdmin =
    session.user.role === Role.ADMIN ||
    group.adminSerializedIds.includes(session.user.serializedId);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Group Options</CardTitle>
        </CardHeader>
        <CardContent>
          <GroupOptionsForm
            groupOptions={group.groupOption}
            groupId={group.id}
            isGroupAdmin={isGroupAdmin}
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
            adminSerializedIds={group.adminSerializedIds}
            isGroupAdmin={isGroupAdmin}
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
