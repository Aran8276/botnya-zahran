import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Welcome to Botnya Zahran Reboot</h1>
        <p className="text-lg text-center sm:text-left">
          Manage your bot settings, commands, and more.
        </p>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          {session ? (
            <Link
              href="/commands"
              className="rounded-full bg-foreground text-background px-5 py-3 text-base font-medium"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full bg-foreground text-background px-5 py-3 text-base font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] px-5 py-3 text-base font-medium"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}