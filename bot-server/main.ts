import axios, { AxiosError } from "axios";
import { Message } from "whatsapp-web.js";
import {
  getAdmin,
  getGroup,
  scheduleFunction,
  startAdminPfpTimeout,
  startGroupPiket,
} from "./src/controller";
import { activeReminders, handleCommand } from "./src/command";
import { APICheckResponse, AllGroupsResponse, Motd, Piket } from "./src/type";
require("dotenv").config();

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

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const server = express();
const port = process.env.EXPRESS_PORT;
const laravelUrl = process.env.LARAVEL_URL;

let adminPfpTimeout: NodeJS.Timeout | null;
let groupMotdTimeouts: NodeJS.Timeout[] = [];
let groupPiketTimeout: NodeJS.Timeout | null;
let hasRunThisMonday = { value: false };

server.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const requestHeader = {
  headers: {
    Authorization: `Bearer ${process.env.SUPERADMIN_BEARER_TOKEN}`,
  },
};

export const client = new Client({
  authStrategy: new LocalAuth(),
  webVersionCache: {
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/refs/heads/main/html/2.3000.1024212402-alpha.html",
    type: "remote",
  },
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  const testApi = async () => {
    try {
      const res = await axios.get(`${laravelUrl}`, requestHeader);
      const data: APICheckResponse = res.data;
      if (data.success) {
        return "Client is ready! (API Is Healthy)";
      }
      return "Client is ready! (WARN: API IS NOT HEALTHY)";
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
        return `Client is ready! (WARN: API IS NOT HEALTHY: ${JSON.stringify(
          error,
          null,
          2
        )})`;
      }
    }
  };
  console.log(await testApi());
});

const initializeAdminPfp = async () => {
  adminPfpTimeout = await startAdminPfpTimeout(client, laravelUrl, () =>
    getAdmin(laravelUrl, requestHeader)
  );
};

const initializeGroupFeatures = async () => {
  console.log("Clearing previous scheduled group features...");

  if (groupPiketTimeout) {
    clearInterval(groupPiketTimeout);
    groupPiketTimeout = null;
    console.log("Cleared existing Piket schedule.");
  }

  if (groupMotdTimeouts.length > 0) {
    const clearedCount = groupMotdTimeouts.length;
    groupMotdTimeouts.forEach(clearTimeout);
    groupMotdTimeouts = [];
    console.log(`Cleared ${clearedCount} existing MOTD schedules.`);
  }

  console.log("Fetching new group configurations...");
  const groups: AllGroupsResponse = await getGroup(laravelUrl, requestHeader);
  if (!groups || !groups.groups) {
    console.log("No group data found. No new schedules will be set.");
    return;
  }

  const motds: Motd[] = [];
  const pikets: Piket[] = [];

  groups.groups.forEach((item) => {
    if (
      item.group_user_id &&
      item.broadcaster.motd_time &&
      item.broadcaster.motd
    ) {
      motds.push({
        target: `${item.group_user_id}@g.us`,
        schedule: new Date(item.broadcaster.motd_time),
        body: item.broadcaster.motd,
      });
    }
    if (item.group_user_id && item.group_settings.schedule_piket) {
      pikets.push({
        target: `${item.group_user_id}`,
      });
    }
  });

  console.log("Initializing MOTDs:", motds);
  motds.forEach(async (item) => {
    if (item.schedule && item.target && item.body) {
      scheduleFunction(
        item.schedule.getHours(),
        item.schedule.getMinutes(),
        () => {
          client.sendMessage(item.target, item.body);
        },
        (timeoutId) => {
          groupMotdTimeouts.push(timeoutId);
        }
      );
    }
  });

  console.log("Initializing Pikets:", pikets);
  pikets.forEach((item) => {
    if (item.target) {
      groupPiketTimeout = startGroupPiket(
        client,
        item.target,
        hasRunThisMonday
      );
    }
  });
};

client.once("ready", async () => {
  try {
    await initializeAdminPfp();
    await initializeGroupFeatures();
  } catch (error) {
    console.error("An error occurred during initial setup:", error);
  }
});

server.get("/", async (req, res) => {
  try {
    if (adminPfpTimeout) {
      clearInterval(adminPfpTimeout);
    }
    await initializeAdminPfp();
    res.send({
      success: true,
      msg: "OK",
      status: 200,
    });
  } catch (error) {
    console.error("Error in / route:", error);
    res.status(500).send({
      success: false,
      msg: "Error occurred:",
      error: error,
    });
  }
});

server.get("/group", async (req, res) => {
  try {
    await initializeGroupFeatures();

    res.send({
      success: true,
      msg: "OK",
      status: 200,
    });
  } catch (error) {
    console.error("Error in /group route:", error);
    res.status(500).send({
      success: false,
      msg: "Error occurred:",
      error: error,
    });
  }
});

client.on("message_create", async (message: Message) => {
  try {
    const regex = /^!\w+/;
    if (regex.test(message.body)) {
      await handleCommand(message, client);
    }
  } catch (error) {
    console.error("An error occurred while handling a message:", error);
  }
});

client.on("message_reaction", async (reaction) => {
  if (reaction.reaction === "❌") {
    const messageId = reaction.id._serialized;
    const reminderData = activeReminders[messageId];
    // console.log(activeReminders);

    if (reminderData) {
      const reactionAuthor = reaction.senderId;

      console.log(reactionAuthor);
      if (reactionAuthor === reminderData.author) {
        clearTimeout(reminderData.timer);
        delete activeReminders[messageId];

        const chat = await reaction.getChat();
        chat.sendMessage("Pengingat dibatalkan.");
      }
    }
  }
});

server.listen(port, () => {
  console.log(`Express.js Botnya Zahran. Port Express.js jalan di ${port}`);
});

client.initialize();
