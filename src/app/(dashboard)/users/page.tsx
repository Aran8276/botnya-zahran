import prisma from "@/lib/prisma";
import { UsersDataTable } from "./client-page";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) {
    redirect("/");
  }
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return <UsersDataTable data={users} />;
}
