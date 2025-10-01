import prisma from "@/lib/prisma";
import Link from "next/link";
import { softDeleteCommand } from "@/lib/actions";

export default async function CommandsPage() {
  const commands = await prisma.commands.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Commands</h1>
        <Link
          href="/commands/new"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          New Command
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Input
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Output Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Usage Count
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
                  {command.outputType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {command.commandUsageCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/commands/${command.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </Link>
                  <form
                    action={softDeleteCommand.bind(null, command.id)}
                    className="inline"
                  >
                    <button
                      type="submit"
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
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
