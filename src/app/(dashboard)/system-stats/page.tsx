import prisma from "@/lib/prisma";

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
    <div>
      <h1 className="text-3xl font-bold mb-8">System Stats</h1>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Bot Owner Serialized ID
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {stats.botOwnerSerializedId}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Command Outputs
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {stats.totalCommandOutputs}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Uno Games
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {stats.totalUnoGames}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Blackjack Games
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {stats.totalBlackjackGames}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Marble Run Games
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {stats.totalMarbleRunGames}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              First Registered
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {stats.firstRegistered.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
