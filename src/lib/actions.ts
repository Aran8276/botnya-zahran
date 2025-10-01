/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import prisma from "./prisma";
import {
  CommandSchema,
  GroupOptionsSchema,
  GroupParticipantSchema,
  GroupSchema,
  ScheduleSchema,
} from "./schemas";

export async function createCommand(values: z.infer<typeof CommandSchema>) {
  const validatedFields = CommandSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  await prisma.commands.create({ data: validatedFields.data });
  revalidatePath("/commands");
  redirect("/commands");
}

export async function updateCommand(
  id: string,
  values: z.infer<typeof CommandSchema>
) {
  const validatedFields = CommandSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  await prisma.commands.update({ where: { id }, data: validatedFields.data });
  revalidatePath(`/commands`);
  revalidatePath(`/commands/${id}/edit`);
  redirect(`/commands`);
}

export async function softDeleteCommand(id: string) {
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + 30);
  await prisma.commands.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedAtExpiration: expiration,
    },
  });
  revalidatePath("/commands");
  revalidatePath("/commands/deleted");
}

export async function restoreCommand(id: string) {
  await prisma.commands.update({
    where: { id },
    data: {
      deletedAt: null,
      deletedAtExpiration: null,
    },
  });
  revalidatePath("/commands");
  revalidatePath("/commands/deleted");
}

export async function deleteCommandPermanently(id: string) {
  await prisma.commands.delete({ where: { id } });
  revalidatePath("/commands/deleted");
}

export async function executeJavascript(code: string): Promise<{
  result: any;
  logs: any[];
}> {
  const logs: any[] = [];
  // const vm = new VM({
  //   timeout: 1000,
  //   sandbox: {
  //     console: {
  //       log: (...args: any[]) => {
  //         logs.push(args);
  //         console.log("VM CONSOLE:", ...args);
  //       },
  //     },
  //   },
  // });

  try {
    const script = `
      ${code}
      doCommand();
    `;
    const result = "";
    return { result, logs };
  } catch (error: any) {
    return { result: `Error: ${error.message}`, logs };
  }
}

export async function createGroup(values: z.infer<typeof GroupSchema>) {
  const validatedFields = GroupSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const { serializedId, isIgnored, adminSerializedIds } = validatedFields.data;
  await prisma.group.create({
    data: {
      serializedId,
      isIgnored,
      adminSerializedIds,
      groupScheduler: { create: {} },
      groupOption: { create: {} },
    },
  });
  revalidatePath("/groups");
  redirect("/groups");
}

export async function updateGroup(
  id: string,
  values: z.infer<typeof GroupSchema>
) {
  const validatedFields = GroupSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  await prisma.group.update({ where: { id }, data: validatedFields.data });
  revalidatePath(`/groups`);
  redirect(`/groups`);
}

export async function deleteGroup(id: string) {
  await prisma.group.delete({ where: { id } });
  revalidatePath("/groups");
}

export async function updateGroupOptions(
  id: string,
  values: z.infer<typeof GroupOptionsSchema>
) {
  const validatedFields = GroupOptionsSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  await prisma.groupOptions.update({
    where: { id },
    data: validatedFields.data,
  });
  revalidatePath(`/groups/${values.groupId}`);
}

export async function createParticipant(
  groupId: string,
  values: z.infer<typeof GroupParticipantSchema>
) {
  const validatedFields = GroupParticipantSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  await prisma.groupParticipants.create({
    data: { ...validatedFields.data, groupId },
  });
  revalidatePath(`/groups/${groupId}`);
}

export async function deleteParticipant(id: string, groupId: string) {
  await prisma.groupParticipants.delete({ where: { id } });
  revalidatePath(`/groups/${groupId}`);
}

export async function createSchedule(
  groupSchedulerId: string,
  groupId: string,
  values: z.infer<typeof ScheduleSchema>
) {
  const validatedFields = ScheduleSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  await prisma.schedule.create({
    data: { ...validatedFields.data, groupSchedulerId },
  });
  revalidatePath(`/groups/${groupId}`);
}

export async function deleteSchedule(id: string, groupId: string) {
  await prisma.schedule.delete({ where: { id } });
  revalidatePath(`/groups/${groupId}`);
}
