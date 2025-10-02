/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "./prisma";
import {
  CommandSchema,
  GroupOptionsSchema,
  GroupParticipantSchema,
  GroupSchema,
  ScheduleSchema,
} from "./schemas";
import * as ivm from "isolated-vm";

export async function createCommand(values: z.infer<typeof CommandSchema>) {
  try {
    const validatedFields = CommandSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    await prisma.commands.create({ data: validatedFields.data });
    revalidatePath("/commands");
    return { success: "Command created successfully." };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "Command with this input already exists." };
    }
    return { error: "Failed to create command." };
  }
}

export async function updateCommand(
  id: string,
  values: z.infer<typeof CommandSchema>
) {
  try {
    const validatedFields = CommandSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    await prisma.commands.update({ where: { id }, data: validatedFields.data });
    revalidatePath(`/commands`);
    return { success: "Command updated successfully." };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "Command with this input already exists." };
    }
    return { error: "Failed to update command." };
  }
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
    data: { deletedAt: null, deletedAtExpiration: null },
  });
  revalidatePath("/commands");
  revalidatePath("/commands/deleted");
}

export async function deleteCommandPermanently(id: string) {
  await prisma.commands.delete({ where: { id } });
  revalidatePath("/commands/deleted");
}

export async function executeJavascript(
  code: string
): Promise<{ result: any; logs: any[] }> {
  const logs: any[] = [];
  const isolate = new ivm.Isolate({ memoryLimit: 128 });
  const context = await isolate.createContext();

  const jail = context.global;
  await jail.set("global", jail.derefInto());

  await jail.set(
    "_log",
    new ivm.Reference((...args: any[]) => {
      logs.push(args.map((arg) => arg.copy()));
    })
  );

  await context.eval(`
    global.console = {
      log: (...args) => {
        _log.applyIgnored(undefined, args);
      }
    };
  `);

  try {
    const scriptToRun = `
      ${code}
      doCommand();
    `;
    const result = await isolate
      .compileScript(scriptToRun)
      .then((script) => script.run(context, { timeout: 1000, copy: true }));
    return { result, logs };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { result: `Error: ${errorMessage}`, logs };
  } finally {
    if (!isolate.isDisposed) {
      isolate.dispose();
    }
  }
}

export async function createGroup(values: z.infer<typeof GroupSchema>) {
  try {
    const validatedFields = GroupSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }
    const { serializedId, isIgnored, adminSerializedIds } =
      validatedFields.data;

    await prisma.group.create({
      data: {
        serializedId,
        isIgnored,
        adminSerializedIds,
        groupScheduler: {
          create: {},
        },
        groupOption: {
          create: {},
        },
      },
    });

    revalidatePath("/groups");
    return { success: "Group created successfully." };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "Group with this Serialized ID already exists." };
    }
    return { error: "Failed to create group." };
  }
}

export async function updateGroup(
  id: string,
  values: z.infer<typeof GroupSchema>
) {
  try {
    const validatedFields = GroupSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }
    await prisma.group.update({
      where: { id },
      data: validatedFields.data,
    });
    revalidatePath(`/groups`);
    revalidatePath(`/groups/${id}`);
    return { success: "Group updated successfully." };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "Group with this Serialized ID already exists." };
    }
    return { error: "Failed to update group." };
  }
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
    throw new Error("Invalid fields!");
  }

  console.log((({ groupId, ...rest }) => rest)(validatedFields.data));
  await prisma.groupOptions.update({
    where: { id },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: (({ groupId, ...rest }) => rest)(validatedFields.data),
  });

  revalidatePath(`/groups/${values.groupId}`);
}

export async function createParticipant(
  groupId: string,
  values: z.infer<typeof GroupParticipantSchema>
) {
  const validatedFields = GroupParticipantSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new Error("Invalid fields!");
  }
  await prisma.groupParticipants.create({
    data: {
      ...validatedFields.data,
      groupId,
    },
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
    throw new Error("Invalid fields!");
  }

  await prisma.schedule.create({
    data: {
      ...validatedFields.data,
      groupSchedulerId,
    },
  });

  revalidatePath(`/groups/${groupId}`);
}

export async function deleteSchedule(id: string, groupId: string) {
  await prisma.schedule.delete({ where: { id } });
  revalidatePath(`/groups/${groupId}`);
}
