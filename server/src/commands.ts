// server/src/commands.ts
import { Client, GroupChat, Message } from "whatsapp-web.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface InbuiltCommand {
  name: string;
  description: string;
  action: (msg: Message, client: Client) => Promise<void>;
}

export const inbuiltCommands: InbuiltCommand[] = [
  {
    name: "!ping",
    description: "Replies with pong.",
    action: async (msg) => {
      await msg.reply("pong");
    },
  },
  {
    name: "!everyone",
    description: "Mentions all participants in the group.",
    action: async (msg) => {
      const chat = await msg.getChat();
      const groupChatObj: GroupChat = chat as GroupChat;
      if (!chat.isGroup) {
        await msg.reply("This command can only be used in a group.");
        return;
      }

      const group = await prisma.group.findUnique({
        where: { serializedId: chat.id._serialized },
        include: { groupOption: true },
      });

      const author = await msg.getContact();
      const participant = groupChatObj.participants.find(
        (p) => p.id._serialized === author.id._serialized
      );
      const authorIsAdmin = participant?.isAdmin || participant?.isSuperAdmin;

      if (
        group?.groupOption?.disableEveryone ||
        (group?.groupOption?.lockEveryoneAdmin &&
          !authorIsAdmin &&
          !group.adminSerializedIds.includes(author.id._serialized))
      ) {
        await msg.reply("You don't have permission to use @everyone.");
        return;
      }

      const mentionsString = groupChatObj.participants
        .map((item) => `@${item.id.user}`)
        .join(" ");
      await chat.sendMessage(`${mentionsString} ${msg.body}`, {
        mentions: groupChatObj.participants.map((item) => item.id._serialized),
      });
    },
  },
];
