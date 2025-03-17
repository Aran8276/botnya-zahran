import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";

// Bot Configs
export const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});
