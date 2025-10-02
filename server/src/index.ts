/* eslint-disable @typescript-eslint/no-explicit-any */
// server/src/index.ts
import Whatsapp from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { PrismaClient } from "@prisma/client";
import { handleMessage, loadCommands, setClient } from "./handler";
import { initializeScheduler } from "./scheduler";

const prisma = new PrismaClient();

const { Client, LocalAuth } = Whatsapp;

process.on("uncaughtException", (err, origin) => {
  console.error("----- Uncaught exception -----");
  console.error(err);
  console.error("----- Exception origin -----");
  console.error(origin);
  console.error("----- Bot will continue running -----");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("----- Unhandled Rejection at -----");
  console.error(promise);
  console.error("----- Reason -----");
  console.error(reason);
  console.error("----- Bot will continue running -----");
});

const client = new Client({
  authStrategy: new LocalAuth(),
  webVersionCache: {
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/refs/heads/main/html/2.3000.1027891093-alpha",
    type: "remote",
  },
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

setClient(client);

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("Client is ready!");
  const botHost = await client.getContactById(client.info.wid._serialized);
  await prisma.systemStats.upsert({
    where: { id: 1 },
    update: { botOwnerSerializedId: botHost.id._serialized },
    create: {
      id: 1,
      botOwnerSerializedId: botHost.id._serialized,
    },
  });
  await loadCommands();
  initializeScheduler(client);
});

client.on("message_create", async (msg) => {
  await handleMessage(msg, client);
});

client.on("group_join", async (notification: any) => {
  try {
    const groupChat = await notification.getChat();
    if (!groupChat.isGroup) return;

    const group = await prisma.group.findUnique({
      where: { serializedId: groupChat.id._serialized },
      include: { groupOption: true },
    });

    if (
      !group ||
      !group.groupOption ||
      !group.groupOption.enableWelcomeMessage ||
      !group.groupOption.welcomeMessage
    ) {
      return;
    }

    const newParticipants = await notification.getRecipients();
    const mentions = [];
    let mentionText = "";

    for (const participant of newParticipants) {
      mentions.push(participant);
      mentionText += `@${participant.id.user} `;
    }

    const welcomeMessage = group.groupOption.welcomeMessage.replace(
      /{@user}/g,
      mentionText.trim()
    );

    await groupChat.sendMessage(welcomeMessage, {
      mentions,
    });
  } catch (error) {
    console.error("Error handling group_join event:", error);
  }
});

client.on("group_leave", async (notification: any) => {
  try {
    const groupChat = await notification.getChat();
    if (!groupChat.isGroup) return;

    const group = await prisma.group.findUnique({
      where: { serializedId: groupChat.id._serialized },
      include: { groupOption: true },
    });

    if (
      !group ||
      !group.groupOption ||
      !group.groupOption.enableGoodbyeMessage ||
      !group.groupOption.goodbyeMessage
    ) {
      return;
    }

    const leftParticipantContact = await notification.getContact();

    const goodbyeMessage = group.groupOption.goodbyeMessage.replace(
      /{@user}/g,
      `@${leftParticipantContact.id.user}`
    );

    await groupChat.sendMessage(goodbyeMessage, {
      mentions: [leftParticipantContact],
    });
  } catch (error) {
    console.error("Error handling group_leave event:", error);
  }
});

client.initialize();
