/* eslint-disable @typescript-eslint/no-unused-vars */
// src/lib/actions.ts
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
import { auth } from "./auth";
import { Role } from "@prisma/client";

export async function createCommand(values: z.infer<typeof CommandSchema>) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { _count: { select: { ownedCommands: true } } },
    });

    if (!user) {
      return { error: "User not found." };
    }

    if (user.role === Role.AWAIT_REGISTER && user._count.ownedCommands >= 5) {
      return {
        error:
          "Guest users can only create up to 5 commands. Please register for more.",
      };
    }

    if (user.role === Role.USER && user._count.ownedCommands >= 25) {
      return { error: "You have reached the maximum command limit of 25." };
    }

    const validatedFields = CommandSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }
    const data = { ...validatedFields.data, ownerId: session.user.id };

    await prisma.commands.create({ data });
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
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const command = await prisma.commands.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!command) {
      return { error: "Command not found." };
    }

    const canModify =
      session.user.role === Role.ADMIN ||
      !command.owner || // Anyone can edit if there is no owner
      command.owner?.role === Role.AWAIT_REGISTER || // Anyone can edit if owner is a guest
      session.user.id === command.ownerId;

    if (!canModify) {
      return { error: "You don't have permission to edit this command." };
    }

    const validatedFields = CommandSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    await prisma.commands.update({ where: { id }, data: validatedFields.data });
    revalidatePath(`/commands`);
    revalidatePath(`/commands/${id}/edit`);
    return { success: "Command updated successfully." };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "Command with this input already exists." };
    }
    return { error: "Failed to update command." };
  }
}

export async function softDeleteCommand(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const command = await prisma.commands.findUnique({
    where: { id },
    include: { owner: true },
  });

  if (!command) {
    throw new Error("Command not found.");
  }

  const canModify =
    session.user.role === Role.ADMIN ||
    !command.owner || // Anyone can delete if there is no owner
    command.owner?.role === Role.AWAIT_REGISTER || // Anyone can delete if owner is a guest
    session.user.id === command.ownerId;

  if (!canModify) {
    throw new Error("You don't have permission to delete this command.");
  }

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

export async function updateUserRole(id: string, role: Role) {
  try {
    await prisma.user.update({
      where: { id },
      data: { role },
    });
    revalidatePath("/users");
    return { success: "User role updated." };
  } catch (error) {
    return { error: "Failed to update user role." };
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath("/users");
    return { success: "User deleted." };
  } catch (error) {
    return { error: "Failed to delete user." };
  }
}

export async function toggleGroupAdmin(
  groupId: string,
  participantSerializedId: string
) {
  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { adminSerializedIds: true },
    });

    if (!group) {
      return { error: "Group not found." };
    }

    const isAdmin = group.adminSerializedIds.includes(participantSerializedId);
    const newAdminIds = isAdmin
      ? group.adminSerializedIds.filter((id) => id !== participantSerializedId)
      : [...group.adminSerializedIds, participantSerializedId];

    await prisma.group.update({
      where: { id: groupId },
      data: { adminSerializedIds: newAdminIds },
    });

    revalidatePath(`/groups/${groupId}`);
    return { success: "Admin status updated." };
  } catch (error) {
    return { error: "Failed to update admin status." };
  }
}
