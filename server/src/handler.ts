/* eslint-disable @typescript-eslint/no-explicit-any */
// server/src/handler.ts
import {
  Client,
  Contact,
  GroupChat,
  Message,
  MessageMedia,
} from "whatsapp-web.js";
import { PrismaClient } from "@prisma/client";
import * as ivm from "isolated-vm";
import { inbuiltCommands } from "./commands";
import { Commands, Role } from "@prisma/client";
import { startsWithExclamation } from "./lib/regex-test";

const prisma = new PrismaClient();

let commandsCache: Commands[] = [];

export async function loadCommands() {
  try {
    commandsCache = await prisma.commands.findMany({
      where: { deletedAt: null },
    });
    console.log(`Loaded ${commandsCache.length} commands from database.`);
  } catch (error) {
    console.error("Failed to load commands from database:", error);
  }
}

setInterval(loadCommands, 5 * 60 * 1000);

export async function handleMessage(msg: Message, client: Client) {
  if (!startsWithExclamation.test(msg.body)) return;

  for (const item of inbuiltCommands) {
    if (msg.body === item.name) {
      item.action(msg, client);
      return;
    }
  }

  const contact = await msg.getContact();
  const chat = await msg.getChat();

  await upsertUser(contact, chat.isGroup ? (chat as GroupChat) : undefined);
  if (chat.isGroup) {
    await upsertGroup(chat as GroupChat);
  }

  if (chat.isGroup) {
    const group = await prisma.group.findUnique({
      where: { serializedId: chat.id._serialized },
    });
    if (group?.isIgnored) return;
  }

  const command = findCommand(msg.body);
  if (!command) return;

  try {
    switch (command.outputType) {
      case "TEXT":
        await msg.reply(command.outputText!);
        break;
      case "IMAGE":
        if (command.outputImageUrl) {
          const media = await MessageMedia.fromUrl(command.outputImageUrl);
          await msg.reply(media);
        }
        break;
      case "INBUILT_COMMAND":
        const inbuiltCmd = inbuiltCommands.find(
          (c) => c.name === command.outputInbuiltCommand
        );
        if (inbuiltCmd) await inbuiltCmd.action(msg, client);
        break;
      case "JAVASCRIPT":
        if (command.outputJavascript) {
          const result = await executeJavascript(command.outputJavascript);
          await msg.reply(result);
        }
        break;
    }

    await prisma.$transaction([
      prisma.commands.update({
        where: { id: command.id },
        data: { commandUsageCount: { increment: 1 } },
      }),
      prisma.user.updateMany({
        where: { serializedId: contact.id._serialized },
        data: { commandUsageCount: { increment: 1 } },
      }),
      prisma.systemStats.update({
        where: { id: 1 },
        data: { totalCommandOutputs: { increment: 1 } },
      }),
    ]);
  } catch (error) {
    console.error(`Error executing command '${command.input}':`, error);
    await msg.reply("An error occurred while executing the command.");
  }
}

function findCommand(messageBody: string): Commands | undefined {
  if (!messageBody) return undefined;
  const commandInput = messageBody.split(" ")[0];
  return commandsCache.find((cmd) => cmd.input === commandInput);
}

async function upsertUser(contact: Contact, groupChat?: GroupChat) {
  //   const pfp = await contact.getProfilePicUrl();
  await prisma.user.upsert({
    where: { serializedId: contact.id._serialized },
    update: { name: contact.pushname },
    create: {
      serializedId: contact.id._serialized,
      name: contact.pushname,
      role: Role.AWAIT_REGISTER,
    },
  });

  if (groupChat) {
    const group = await prisma.group.findUnique({
      where: { serializedId: groupChat.id._serialized },
      select: { id: true },
    });
    if (group) {
      await prisma.groupParticipants.upsert({
        where: { serializedId: contact.id._serialized },
        update: {
          pushName: contact.pushname,
          profilePictureUrl: "",
        },
        create: {
          serializedId: contact.id._serialized,
          pushName: contact.pushname,
          profilePictureUrl: "",
          groupId: group.id,
        },
      });
    }
  }
}

async function upsertGroup(chat: GroupChat) {
  const group = await prisma.group.findUnique({
    where: { serializedId: chat.id._serialized },
  });

  if (!group) {
    const adminParticipants = chat.participants.filter(
      (p) => p.isAdmin || p.isSuperAdmin
    );
    const adminIds = adminParticipants.map((p) => p.id._serialized);

    const newGroup = await prisma.group.create({
      data: {
        serializedId: chat.id._serialized,
        adminSerializedIds: adminIds,
        groupScheduler: { create: {} },
        groupOption: { create: {} },
      },
    });

    const participantsData = await Promise.all(
      chat.participants.map(async (p) => {
        const contact = await client.getContactById(p.id._serialized);
        const pfp = await contact.getProfilePicUrl();
        return {
          serializedId: p.id._serialized,
          pushName: contact.pushname || "Unknown",
          profilePictureUrl: pfp,
          groupId: newGroup.id,
        };
      })
    );

    await prisma.groupParticipants.createMany({
      data: participantsData,
      skipDuplicates: true,
    });
  }
}

async function executeJavascript(code: string): Promise<string> {
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
  await context.eval(
    `global.console = { log: (...args) => { _log.applyIgnored(undefined, args); } };`
  );

  try {
    const scriptToRun = `
        (function() {
            ${code}
            return doCommand();
        })();
    `;
    const result = await isolate
      .compileScript(scriptToRun)
      .then((script) => script.run(context, { timeout: 1000, copy: true }));

    const resultString = `Result:\n${JSON.stringify(result, null, 2)}`;
    const logString = `\n\nLogs:\n${logs
      .map((log) => log.map((arg: any) => JSON.stringify(arg)).join(" "))
      .join("\n")}`;
    return resultString + (logs.length > 0 ? logString : "");
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `Error: ${errorMessage}`;
  } finally {
    if (!isolate.isDisposed) {
      isolate.dispose();
    }
  }
}

let client: Client;
export function setClient(c: Client) {
  client = c;
}
