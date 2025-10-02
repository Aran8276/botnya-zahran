import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { formatDateBasic } from "@/utils/date-formatter";

export default async function SystemStatsPage() {
  let stats = await prisma.systemStats.findUnique({ where: { id: 1 } });

  if (!stats) {
    stats = await prisma.systemStats.create({
      data: {
        id: 1,
        botOwnerSerializedId: "placeholder-owner-id",
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Stats</CardTitle>
        <CardDescription>
          An overview of system-wide statistics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-muted-foreground">
              Bot Host Serialized ID
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {stats.botOwnerSerializedId}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-muted-foreground">
              Total Command Outputs
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {stats.totalCommandOutputs}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-muted-foreground">
              Total Uno Games
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {stats.totalUnoGames}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-muted-foreground">
              Total Blackjack Games
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {stats.totalBlackjackGames}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-muted-foreground">
              Total Marble Run Games
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {stats.totalMarbleRunGames}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-muted-foreground">
              First Registered
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {formatDateBasic(stats.firstRegistered)}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
