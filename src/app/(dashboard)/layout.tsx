import { auth, signOut } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
        <nav className="flex flex-col space-y-2">
          <Link href="/commands" className="hover:underline">
            Commands
          </Link>
          <Link href="/commands/deleted" className="hover:underline">
            Deleted Commands
          </Link>
          <Link href="/groups" className="hover:underline">
            Groups
          </Link>
          <Link href="/system-stats" className="hover:underline">
            System Stats
          </Link>
        </nav>
        <div className="mt-auto">
          <p className="text-sm">Signed in as {session?.user?.name}</p>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button
              type="submit"
              className="w-full text-left mt-2 hover:underline"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8 bg-white dark:bg-gray-900">{children}</main>
    </div>
  );
}
