require("dotenv").config();

const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { default: axios } = require("axios");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  webVersionCache: {
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/refs/heads/main/html/2.3000.1017920117-alpha.html",
    type: "remote",
  },
});

const rotateArrays = (endDate, startDate) => {
  const contents = require("./data");
  // Calculate the number of weeks between the startDate and endDate
  const msInWeek = 7 * 24 * 60 * 60 * 1000;
  const rotateBy = Math.floor((endDate - startDate) / msInWeek);

  // Normalize the rotateBy value to ensure it's within the bounds of the array length
  const normalizedRotateBy = rotateBy % contents.length;

  // Rotate the array
  const rotatedContents = contents
    .slice(-normalizedRotateBy)
    .concat(contents.slice(0, -normalizedRotateBy));

  // Get the current date details
  const currentYear = startDate.getFullYear();
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const currentMonth = months[endDate.getMonth()];
  const startOfMonth = new Date(currentYear, endDate.getMonth(), 1);
  const pastDaysOfMonth = (endDate - startOfMonth) / 86400000;
  const week = Math.ceil((pastDaysOfMonth + startOfMonth.getDay() + 1) / 7);

  // Generate the header
  const header = `◎ ════ Jadwal Piket ― Minggu ke-${week} ${currentMonth} ${currentYear} ════ ◎`;

  // Generate the output for each day
  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  const generateDays = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  const hours = endDate.getHours().toString().padStart(2, "0");
  const minutes = endDate.getMinutes().toString().padStart(2, "0");

  let output = `${header}\n`;

  rotatedContents.forEach((item, index) => {
    if (index < days.length) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + index + rotateBy * 7);
      const day = currentDate.getDate();
      const month = months[currentDate.getMonth()];
      output += `${days[index]}, ${day} ${month}  (Tim ${item.tim.no}, ${item.tim.nama})\n`;
      item.siswa.forEach((student) => {
        output += `- ${student}\n`;
      });
      output += "\n";
    }
  });

  return `${output}\nPesan ini dibuat otomatis melalui web-js-bot Aran8276 pada\n*${
    generateDays[endDate.getDay()]
  }, ${endDate.getDate()} ${currentMonth} ${currentYear} ${hours}:${minutes}*`;
};

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready! (try !ping or !cat)");
});

client.on("message_create", async (message) => {
  const regex = /^!\w+/;
  const isPossibleCommand = regex.test(message.body);
  if (!isPossibleCommand) {
    return;
  }
  switch (message.body) {
    case "!piket":
      const startDate = new Date("2024-11-04");
      const endDate = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
      );
      message.reply(rotateArrays(endDate, startDate));
      break;
    case "!help":
      message.reply(
        `🌟 **Daftar Perintah** 🌟\n*!piket* - Lihat Jadwal Piket 🧹.\n*!ping* - Uji respons bot dengan balasan "pong" 🏓 klasik.\n*!bro* - Reaksi dengan 💀.\n*!pin* - Pin pesan selama 10 detik. 📌\n*!toyota* - Terima gambar keren dari mobil Toyota. 🚗\n*!cat* - Terima gambar random kucing dari API 🐱\n*!star* - Tandai pesan dengan bintang. ⭐\nWritten by Aran8276`
      );
      break;
    case "!ping":
      message.reply("pong");
      break;
    case "!bro":
      message.react("💀");
      break;
    case "!pin":
      message.pin(10);
      break;
    case "!toyota":
      const media = await MessageMedia.fromUrl(
        "https://platform.cstatic-images.com/large/in/v2/stock_photos/941643fc-5200-45f4-8368-4505e79ec7c4/db3d4c61-ec9a-45b8-a099-686fb28fbf90.png"
      );
      message.reply(media);
      break;
    case "!star":
      message.star();
      break;
    case "!cat":
      try {
        const response = await axios.get(
          "https://api.thecatapi.com/v1/images/search"
        );
        const url = response.data[0].url;
        const media = await MessageMedia.fromUrl(url);
        message.reply(media);
      } catch (error) {
        console.error("Error fetching cat image:", error);
        message.reply(
          "Gagal memuat gambar dari API, silahkan lihat log di https://portainer.aran8276.site/ dan login sebagai admin."
        );
      }
      break;
    default:
      try {
        const response = await axios.get(
          `${process.env.LARAVEL_URL}/api/public-responses`
        );
        if (response.data.success) {
          const customResponses = response.data.responses;
          const customResponse = customResponses.find(
            (response) => response.case === message.body
          );
          if (customResponse) {
            message.reply(customResponse.reply);
          } else {
            message.reply(
              "Perintah ini tidak ditemukan untuk ini.\n\nKetik `!help` untuk lihat daftar (bot aktif)."
            );
          }
        }
      } catch (error) {
        console.error("Error fetching custom responses:", error);
        message.reply(
          "Perintah tidak ditemukan:\n\nGagal memuat daftar perintah custom dari API (apakah API down?)."
        );
      }
      break;
  }
});

client.initialize();
