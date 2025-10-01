import prisma from "@/lib/prisma";
import { restoreCommand, deleteCommandPermanently } from "@/lib/actions";

export default async function DeletedCommandsPage() {
  const commands = await prisma.commands.findMany({
    where: { NOT: { deletedAt: null } },
    orderBy: { deletedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Deleted Commands</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Input
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Deleted At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Expires At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {commands.map((command) => (
              <tr key={command.id}>
                <td className="px-6 py-4 whitespace-nowrap">{command.input}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {command.deletedAt?.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {command.deletedAtExpiration?.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <form
                    action={restoreCommand.bind(null, command.id)}
                    className="inline"
                  >
                    <button
                      type="submit"
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Restore
                    </button>
                  </form>
                  <form
                    action={deleteCommandPermanently.bind(null, command.id)}
                    className="inline"
                  >
                    <button
                      type="submit"
                      className="text-red-600 hover:text-red-900"
                    >
                      Purge
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
