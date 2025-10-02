import Whatsapp from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

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

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message_create", (msg) => {
  console.log(msg.body);
  if (msg.body == "!ping") {
    msg.reply("pong");
  }
});

client.initialize();
