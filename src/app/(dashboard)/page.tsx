import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import prisma from "@/lib/prisma";

async function getStats() {
  const commandCount = await prisma.commands.count();
  const groupCount = await prisma.group.count();
  const userCount = await prisma.user.count();
  const totalUsage = await prisma.commands.aggregate({
    _sum: {
      commandUsageCount: true,
    },
  });

  return {
    commandCount,
    groupCount,
    userCount,
    totalUsage: totalUsage._sum.commandUsageCount ?? 0,
  };
}

async function getCommandChartData() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const commands = await prisma.commands.findMany({
    where: {
      createdAt: {
        gte: ninetyDaysAgo,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      createdAt: true,
    },
  });

  const dataByDay: { [key: string]: number } = {};

  commands.forEach((command) => {
    const date = command.createdAt.toISOString().split("T")[0];
    if (!dataByDay[date]) {
      dataByDay[date] = 0;
    }
    dataByDay[date]++;
  });

  const chartData = Object.entries(dataByDay).map(([date, count]) => ({
    date,
    commands: count,
  }));

  return chartData;
}

export default async function DashboardPage() {
  const stats = await getStats();
  const chartData = await getCommandChartData();
  return (
    <>
      <SectionCards stats={stats} />
      <ChartAreaInteractive data={chartData} />
    </>
  );
}
