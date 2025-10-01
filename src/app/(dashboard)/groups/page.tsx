import prisma from "@/lib/prisma";
import Link from "next/link";
import { deleteGroup } from "@/lib/actions";

export default async function GroupsPage() {
  const groups = await prisma.group.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Groups</h1>
        <Link
          href="/groups/new"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          New Group
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Serialized ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Is Ignored
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {groups.map((group) => (
              <tr key={group.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {group.serializedId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {group.isIgnored ? "Yes" : "No"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/groups/${group.id}`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Details
                  </Link>
                  <form
                    action={deleteGroup.bind(null, group.id)}
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
