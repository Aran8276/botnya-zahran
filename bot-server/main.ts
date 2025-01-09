import axios, { AxiosError } from "axios";
import {
  AdminDetailResponse,
  AdminShufflePfpResponse,
  AllGroupsResponse,
  APICheckResponse,
  CheckIfGroupHasPwResponse,
  CheckIfGroupRegisteredResponse,
  FindResponsesTypeResponse,
  GroupKelompok,
  GroupShufflePfpResponse,
  OTPLoginResponse,
} from "./type";
import { Chat, Contact, GroupChat, Message } from "whatsapp-web.js";
import { contents, students } from "./data";
require("dotenv").config();

interface Pfp {
  target: string | null;
  interval: number | null;
}

interface Piket {
  target: string | null;
}

interface Motd {
  target: string | null;
  schedule: Date | null;
  body: string | null;
}

const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const server = express();
const port = process.env.EXPRESS_PORT;
const laravelUrl = process.env.LARAVEL_URL;
const nextJsUrl = process.env.FRONTEND_URL;
let botDelay = 10000000;
let adminPfpTimeout: NodeJS.Timeout;
let groupPfpTimeouts: { [key: string]: NodeJS.Timeout } = {};
let groupMotdTimeout;
let groupPiketTimeout: NodeJS.Timeout;
let hasRunThisMonday = false;

// CORS configuration headers
server.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Super admin Laravel API Authorization headers
const requestHeader = {
  headers: {
    Authorization: `Bearer ${process.env.SUPERADMIN_BEARER_TOKEN}`,
  },
};

// Bot Configs
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

// Piket System
const rotateArrays = (endDate: Date, startDate: Date) => {
  // Calculate the number of weeks between the startDate and endDate
  const msInWeek = 7 * 24 * 60 * 60 * 1000;
  const rotateBy = Math.floor(
    (endDate.getTime() - startDate.getTime()) / msInWeek
  );

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
  const pastDaysOfMonth =
    (endDate.getTime() - startOfMonth.getTime()) / 86400000;
  // const week = Math.ceil((pastDaysOfMonth + startOfMonth.getDay() + 1) / 7);

  const getWeek = (date) => {
    var onejan = new Date(date.getFullYear(), 0, 1);
    var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    var dayOfYear = (today.getTime() - onejan.getTime() + 86400000) / 86400000;
    return Math.ceil(dayOfYear / 7);
  };

  // Generate the header
  const header = `◎ ════ Jadwal Piket ― Minggu ke-${getWeek(
    endDate
  )} ${currentMonth} ${currentYear} ════ ◎`;

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

// Seed Generator
const generateRandomSeed = () => {
  let randomNumber = "";
  for (let i = 0; i < 16; i++) {
    randomNumber += Math.floor(Math.random() * 10);
  }
  return randomNumber;
};

// Generate QR
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

const getAdmin = async () => {
  try {
    const res = await axios.get(
      `${laravelUrl}/api/admin/get-detail`,
      requestHeader
    );

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error);
    }
    console.log(error);
  }
};

const getGroup = async () => {
  try {
    const res = await axios.get(
      `${laravelUrl}/api/group/get-groups`,
      requestHeader
    );

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error);
    }
    console.log(error);
  }
};

const scheduleFunction = async (
  hour: number,
  minute: number,
  callback: () => void
) => {
  const now = new Date();
  const next = new Date();

  next.setHours(hour, minute, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  const delay = next.getTime() - now.getTime();

  groupMotdTimeout = setTimeout(function () {
    callback();
    scheduleFunction(hour, minute, callback);
  }, delay);
};

const startAdminPfpTimeout = async () => {
  const data: AdminDetailResponse = await getAdmin();

  if (!data || !data.group) {
    console.log("no group");
    return;
  }

  if (!data.group.admin_broadcaster.pfpslide_enabled) {
    return;
  }

  const botDelay = data.group.admin_broadcaster.pfpslide_interval * 1000;
  console.log(botDelay);
  adminPfpTimeout = setInterval(async () => {
    try {
      const res = await axios.get(
        `${laravelUrl}/api/admin/broadcast/pfp-slide`
      );

      const data: AdminShufflePfpResponse = res.data;
      console.log(
        `Set admin pfp image from: ${process.env.LARAVEL_URL}${data.image}`
      );
      if (!data.image || !data) {
        console.log("Warning: image or data is null, cancelling.");
        return;
      }
      const url = `${laravelUrl}${data.image}`;
      client.setProfilePicture(await MessageMedia.fromUrl(url));
      // message.reply(await MessageMedia.fromUrl(url));
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
      console.log(error);
    }
  }, botDelay);
};

const startGroupPfpTimeout = async (interval: number, target: string) => {
  const botDelay = interval * 1000;
  console.log(botDelay);
  groupPfpTimeouts[target] = setInterval(async () => {
    try {
      const res = await axios.get(
        `${laravelUrl}/api/group/broadcast/pfp-slide/${target}`
      );

      const data: GroupShufflePfpResponse = res.data;
      console.log(`${data.image} : ${target}`);
      const url = `${laravelUrl}${data.image}`;
      const groupChat: GroupChat = await client.getChatById(`${target}@g.us`);
      const a = await groupChat.setPicture(await MessageMedia.fromUrl(url));
      console.log(a);
      // message.reply(await MessageMedia.fromUrl(url));
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
      console.log(error);
    }
  }, botDelay);
};

const startGroupPiket = async (target: string) => {
  groupPiketTimeout = setInterval(async () => {
    try {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

      if (dayOfWeek === 1 && !hasRunThisMonday) {
        client.sendMessage(`${target}@g.us`, "!piket");
        hasRunThisMonday = true;
      }

      if (dayOfWeek !== 1) {
        hasRunThisMonday = false;
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
      console.log(error);
    }
  }, 60 * 60 * 1000);
};

const createGroups = (
  students: string[],
  numGroups: number
): GroupKelompok[] => {
  const shuffleArray = (array: string[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  shuffleArray(students);

  const groups: GroupKelompok[] = [];
  const groupSize = Math.floor(students.length / numGroups);
  const remainder = students.length % numGroups;

  let studentIndex = 0;

  for (let i = 0; i < numGroups; i++) {
    const currentGroupSize = groupSize + (i < remainder ? 1 : 0);
    groups.push({
      participants: students.slice(
        studentIndex,
        studentIndex + currentGroupSize
      ),
      numberOfParticipants: currentGroupSize,
    });
    studentIndex += currentGroupSize;
  }

  return groups;
};

// Ready Message
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

// Admin pfp initializer
client.once("ready", async () => {
  await startAdminPfpTimeout();
});

// Group motd initializer
client.once("ready", async () => {
  const groups: AllGroupsResponse = await getGroup();
  const motds: Motd[] = [];
  groups.groups.map((item) => {
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
  });

  console.log(motds);

  motds.map(async (item) => {
    scheduleFunction(
      item.schedule?.getHours() || 0,
      item.schedule?.getMinutes() || 0,
      () => {
        client.sendMessage(item.target, item.body);
      }
    );
  });
});

// Group piket initializer
// client.once("ready", async () => {
//   const groups: AllGroupsResponse = await getGroup();
//   const pfps: Pfp[] = [];
//   groups.groups.map((item) => {
//     if (item.group_user_id && item.broadcaster.pfp_slide_interval) {
//       pfps.push({
//         target: `${item.group_user_id}`,
//         interval: Number(`${item.broadcaster.pfp_slide_interval}`),
//       });
//     }
//   });

//   console.log(pfps);

//   pfps.map((item) => {
//     item.interval &&
//       item.target &&
//       startGroupPfpTimeout(item.interval, item.target);
//   });
// });
client.once("ready", async () => {
  const groups: AllGroupsResponse = await getGroup();
  const pikets: Piket[] = [];
  groups.groups.map((item) => {
    if (item.group_user_id && item.group_settings.schedule_piket) {
      pikets.push({
        target: `${item.group_user_id}`,
      });
    }
  });

  console.log(pikets);
  pikets.map((item) => {
    if (item.target) {
      startGroupPiket(item.target);
    }
  });
});

// Admin pfp API refresh handler
server.get("/", async (req, res) => {
  try {
    clearInterval(adminPfpTimeout);
    const data: AdminDetailResponse = await getAdmin();
    botDelay = data.group.admin_broadcaster.pfpslide_interval * 1000;
    console.log(botDelay);

    await startAdminPfpTimeout();
    res.send({
      success: true,
      msg: "OK",
      status: 200,
    });
  } catch (error) {
    res.send({
      success: false,
      msg: "Error occurred:",
      error: error,
      status: 500,
    });
  }
});

// Group motd API refresh handler
server.get("/group", async (req, res) => {
  try {
    clearTimeout(groupPiketTimeout);
    clearTimeout(groupMotdTimeout);
    const groups: AllGroupsResponse = await getGroup();
    const pikets: Piket[] = [];
    groups.groups.map((item) => {
      if (item.group_user_id && item.group_settings.schedule_piket) {
        pikets.push({
          target: `${item.group_user_id}`,
        });
      }
    });

    console.log(pikets);
    pikets.map((item) => {
      if (item.target) {
        startGroupPiket(item.target);
      }
    });

    const groupMotd: AllGroupsResponse = await getGroup();
    const motds: Motd[] = [];
    groupMotd.groups.map((item) => {
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
    });

    console.log(motds);

    motds.map(async (item) => {
      scheduleFunction(
        item.schedule?.getHours() || 0,
        item.schedule?.getMinutes() || 0,
        () => {
          client.sendMessage(item.target, item.body);
        }
      );
    });

    res.send({
      success: true,
      msg: "OK",
      status: 200,
    });
  } catch (error) {
    res.send({
      success: false,
      msg: "Error occurred:",
      error: error,
      status: 500,
    });
  }
});

// Catch all messages from anywhere starting with `!` (for example `!hello`)
client.on("message_create", async (message: Message) => {
  const regex = /^!\w+/;
  const isPossibleCommand = regex.test(message.body);
  if (!isPossibleCommand) {
    return;
  }

  const [command, ...args] = message.body.split(" ");
  const chat: Chat = await message.getChat();
  const groupChatObj: GroupChat = chat as GroupChat;

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
        `🌟 **Daftar Perintah WhatsApp Web JS** 🌟
*!piket* - Lihat Jadwal Piket 🧹.
*!ping* - Uji respons bot dengan balasan "pong" 🏓 klasik.
*!bro* - Reaksi dengan 💀.
*!pin* - Pin pesan selama 10 detik. 📌
*!toyota* - Terima gambar keren dari mobil Toyota. 🚗
*!cat* - Terima gambar random kucing dari API. 🐱
*!star* - Tandai pesan dengan bintang. ⭐
*!login* Masuk dan tambahkan perintah bot baru. 🔧
*!group* - Cek dan daftar grup pada bot. 👥
*!test <pesan>* - Cek apa yang anda katakan. 🗣️
*!ai <pesan>* - Ajukan pertanyaan ke AI dan terima balasan. 🤖
*!aicepat <pesan>* - Ajukan pertanyaan cepat ke AI dan terima balasan. ⚡
*!aicoding <pesan>* - Ajukan pertanyaan pemrograman ke AI dan terima balasan. 💻
*!buatgambar <pesan>* - Buat gambar AI berdasarkan prompt yang diberikan. 🎨
*!deteksigambar <pesan>* - Deteksi konten gambar yang diunggah. 🖼️
*!spin <jumlah kelompok>* - Buat kelompok berdasarkan jumlah yang diberikan. 🔄
*!everyone <pesan>* - Mention semua peserta dalam grup chat. 📢

Dibuat oleh Aran8276.
Versi: v1.0
`
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
      try {
        const media = await MessageMedia.fromUrl(
          `${process.env.LARAVEL_URL}/toyota.png`
        );
        message.reply(media);
      } catch (error) {
        "Gagal memuat gambar: \n" + JSON.stringify(error, null, 2);
      }
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
        console.error("Gagal memuat gambar dari API:", error);
        message.reply(
          "Gagal memuat gambar dari API: \n" + JSON.stringify(error, null, 2)
        );
      }
      break;
    case "!login":
      try {
        const res = await axios.get(`${laravelUrl}/api/get-otp`, requestHeader);
        const data: OTPLoginResponse = res.data;
        if (data.success) {
          message.reply(
            `Login Manajemen Perintah WhatsApp Bot

Kode OTP: ${data.otp}
URL Login: ${nextJsUrl}/login

Kode OTP akan kadaluarsa dalam 15 menit.`
          );
        }
      } catch (error) {
        console.error("Gagal mendapatkan OTP:", JSON.stringify(error, null, 2));
        message.reply(
          "Gagal mendapatkan OTP: \n" + JSON.stringify(error, null, 2)
        );
      }
      break;
    case "!group":
      if (!chat.isGroup) {
        await chat.sendMessage("Ini bukan group");
        return;
      }

      const checkIfRegistered = async () => {
        try {
          const res = await axios.get(
            `${laravelUrl}/api/group/check-registered/${groupChatObj.id.user}`,
            requestHeader
          );

          const data: CheckIfGroupRegisteredResponse = res.data;

          if (data.success) {
            return data.value;
          }
        } catch (error) {
          console.error(
            "Gagal memuat info group:",
            JSON.stringify(error, null, 2)
          );
          message.reply(
            "Gagal memuat info group: \n" + JSON.stringify(error, null, 2)
          );
          if (error instanceof AxiosError) {
            message.reply(error.response?.data);
          }
          return true;
        }
      };

      const fetchParticipantDetails = async () => {
        const participants = groupChatObj.participants;
        const participantDetail: Contact[] = [];

        const promises = participants.map(async (item) => {
          const contact: Contact = await client.getContactById(
            item.id._serialized
          );

          const image: string = await contact.getProfilePicUrl();
          const data = {
            ...contact,
            image: image,
          };

          participantDetail.push(data);
        });

        await Promise.all(promises);
        return participantDetail;
      };

      const createNewGroup = async () => {
        try {
          const groupContact: Contact = await groupChatObj.getContact();
          const profilPicUrl = await groupContact.getProfilePicUrl();
          const participants = await fetchParticipantDetails();

          await axios.post(
            `${laravelUrl}/api/group/register`,
            {
              groupUserId: groupChatObj.id.user,
              groupName: groupChatObj.name,
              hasPassword: false,
              groupPfp: profilPicUrl,
              participants: participants,
            },
            requestHeader
          );
        } catch (error) {
          console.log(error);
          console.error(
            "Gagal memuat info group:",
            JSON.stringify(error, null, 2)
          );
          message.reply(
            "Gagal memuat info group: \n" + JSON.stringify(error, null, 2)
          );
          return true;
        }
      };

      const refreshGroup = async () => {
        try {
          const groupContact: Contact = await groupChatObj.getContact();
          const profilPicUrl = await groupContact.getProfilePicUrl();
          const participants = await fetchParticipantDetails();

          await axios.post(
            `${laravelUrl}/api/group/set-group/${groupChatObj.id.user}`,
            {
              groupName: groupChatObj.name,
              groupPfp: profilPicUrl,
              participants: participants,
            },
            requestHeader
          );
        } catch (error) {
          console.log(error);
          console.error(
            "Gagal memuat info group:",
            JSON.stringify(error, null, 2)
          );
          message.reply(
            "Gagal memuat info group: \n" + JSON.stringify(error, null, 2)
          );
          return true;
        }
      };

      const checkPassword = async () => {
        try {
          const res = await axios.post(
            `${laravelUrl}/api/group/check-password/check/`,
            {
              groupUserId: groupChatObj.id.user,
            },
            requestHeader
          );

          const data: CheckIfGroupHasPwResponse = res.data;

          if (data.success) {
            return data.value;
          }
        } catch (error) {
          if (error instanceof AxiosError) {
            console.error(
              "Gagal memuat info group:",
              JSON.stringify(error, null, 2)
            );
            message.reply(
              "Gagal memuat info group: \n" + JSON.stringify(error, null, 2)
            );

            return false;
          }
        }
      };

      const fetchPostData = async () => {
        const hasPassword = await checkPassword();
        const isRegistered = await checkIfRegistered();
        if (!isRegistered) {
          await createNewGroup();
          message.reply(
            `Group "${groupChatObj.name}" berhasil di registrasi:

Group ID: ${groupChatObj.id.user}
Login: ${nextJsUrl}/login?tab=group`
          );
          return;
        }
        await refreshGroup();

        message.reply(
          `
Login Group "${groupChatObj.name}":

Group ID: ${groupChatObj.id.user}
Login: ${nextJsUrl}/login?tab=group
Ada Password?: ${hasPassword ? `Iya` : `Tidak`}
          `
        );
      };

      fetchPostData();
      break;
    default:
      if (command == "!test") {
        const response = args.join(" ");

        message.reply(`Ada berkata: ${response}`);
        return;
      }

      if (command == "!ai") {
        const response = args.join(" ");
        const apiKey = process.env.SAMBANOVA_API_KEY;
        const res = await axios.post(
          `https://api.sambanova.ai/v1/chat/completions`,
          {
            stream: false,
            model: "Meta-Llama-3.3-70B-Instruct",
            messages: [
              {
                role: "system",
                content: `You are a helpful assistant. This is a seed for randomizing responses: ${generateRandomSeed()}`,
              },
              {
                role: "user",
                content: response,
              },
            ],
          },
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );
        const data = res.data;
        console.log(`Asked AI question: ${message.body} by ${message.author}`);
        message.reply(`${data?.choices[0].message.content}`);
        return;
      }

      if (command == "!aicepat") {
        const response = args.join(" ");
        const apiKey = process.env.SAMBANOVA_API_KEY;
        const res = await axios.post(
          `https://api.sambanova.ai/v1/chat/completions`,
          {
            stream: false,
            model: "Meta-Llama-3.2-1B-Instruct",
            messages: [
              {
                role: "system",
                content: `You are a helpful assistant. This is a seed for randomizing responses: ${generateRandomSeed()}`,
              },
              {
                role: "user",
                content: response,
              },
            ],
          },
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );
        const data = res.data;
        console.log(
          `Asked fast AI question: ${message.body} by ${message.author}`
        );
        message.reply(`${data?.choices[0].message.content}`);
        return;
      }

      if (command == "!aicoding") {
        const response = args.join(" ");
        const apiKey = process.env.SAMBANOVA_API_KEY;
        const res = await axios.post(
          `https://api.sambanova.ai/v1/chat/completions`,

          {
            stream: false,
            model: "Qwen2.5-Coder-32B-Instruct",
            messages: [
              {
                role: "system",
                content: `You are a helpful AI programmer, giving the user most correct and in-depth programming tips, code generation, and explanation. This is a seed for randomizing responses: ${generateRandomSeed()}`,
              },
              {
                role: "user",
                content: response,
              },
            ],
          },
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );
        const data = res.data;
        console.log(
          `Asked coding AI question: ${message.body} by ${message.author}`
        );
        message.reply(
          `${data?.choices[0].message.content}\n\n**Tip: Gunakan AI ini dengan potensi full di ${process.env.FRONTEND_URL}/ai-coding !**`
        );

        return;
      }

      if (command == "!buatgambar") {
        try {
          const response = args.join(" ");
          console.log(
            `Generate AI Image: ${message.body} by ${message.author}`
          );
          const apiKey = process.env.CLOUDFLARE_WORKERS_API_KEY;

          message.reply(`(Membuat Gambar, Sabar Yah)`);
          const res = await axios.post(
            `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
            {
              prompt: response,
              height: 1024,
              width: 1024,
            },
            {
              headers: {
                Accept: "image/png",
                Authorization: `Bearer ${apiKey}`,
              },
              responseType: "arraybuffer",
            }
          );

          const data = res.data;

          const base64Image = Buffer.from(data, "binary").toString("base64");

          message.reply(new MessageMedia("image/png", base64Image));
        } catch (error) {
          message.reply(
            `Gagal membuat gambar: ${JSON.stringify(error, null, 2)}`
          );
        }
        return;
      }

      if (command == "!deteksigambar") {
        const response = args.join(" ");
        console.log(response);
        const image = await message.downloadMedia();
        const apiKey = process.env.SAMBANOVA_API_KEY;
        const res = await axios.post(
          `https://api.sambanova.ai/v1/chat/completions`,
          {
            stream: false,
            model: "Llama-3.2-11B-Vision-Instruct",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: response,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${image.mimetype};base64,${image.data}`,
                    },
                  },
                ],
              },
            ],
          },
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );

        const data = res.data;
        message.reply(data.choices[0].message.content);
        return;
      }

      if (command == "!spin") {
        const response = args.join(" ");
        const number = Number(response);
        if (number > students.length) {
          message.reply(
            `Argumen salah.\n\nContoh Penggunaan: !spin <jumlah kelompok (1-${students.length})>`
          );
          return;
        }
        const kelompok = createGroups(students, number);
        if (!isNaN(number) || number < 1) {
          message.reply(`*Spin Kelompok*
${kelompok
  .map(
    (item, index) =>
      `Kelompok ${index + 1} (${
        item.numberOfParticipants
      } orang):\n${item.participants
        .map((participant) => `- ${participant}`)
        .join("\n")}`
  )
  .join("\n\n")}
`);
          return;
        }

        message.reply(
          `Argumen salah.\n\nContoh Penggunaan: !spin <jumlah kelompok (1-${students.length})>`
        );
        return;
      }

      if (command == "!everyone") {
        if (!chat.isGroup) {
          await chat.sendMessage("Ini bukan group");
          return;
        }
        const response = args.join(" ");

        const mentionsString = groupChatObj.participants
          .map((item) => `@${item.id.user}`)
          .join(" ");

        await chat.sendMessage(`${mentionsString} ${response}`, {
          mentions: groupChatObj.participants.map(
            (item) => item.id._serialized
          ),
        });
        return;
      }

      if (command == "!set_pw") {
        const response = args.join(" ");
        const manipulatedString = response.split(" ");

        const myContact: Contact = await client.getContactById(
          chat.id._serialized
        );
        if (!myContact.isMe) {
          return;
        }
        if (!(manipulatedString.length == 2)) {
          message.reply(
            "Bad command usage.\n\nUsage: `!set_pw <email> <password>`"
          );
          return;
        }

        const data = {
          email: manipulatedString[0],
          password: manipulatedString[1],
        };

        const request = {
          userId: "123",
          email: data.email,
          password: data.password,
          groupList: [],
        };

        try {
          await axios.post(
            `${laravelUrl}/api/admin/set-credentials`,
            request,
            requestHeader
          );
          message.reply(`Success:\n ${JSON.stringify(request, null, 2)}`);
        } catch (error) {
          if (error instanceof AxiosError) {
            console.log(error.message);
          }
          console.error("Gagal :", JSON.stringify(error, null, 2));
          message.reply("Gagal: \n" + JSON.stringify(error, null, 2));
          console.log(error);
        }
        return;
      }

      try {
        const res = await axios.get(
          `${process.env.LARAVEL_URL}/api/responses/public-responses/case?find=${message.body}`
        );

        const data: FindResponsesTypeResponse = res.data;
        if (data.success && data.responses) {
          if (data.responses.reply) {
            message.reply(data.responses.reply);
          }
          if (data.responses.images) {
            console.log(data.responses.images);
            const parsedImages = JSON.parse(data.responses.images);
            parsedImages.map(async (item) => {
              const url = `${laravelUrl}/storage/${item}`;
              console.log(url);
              message.reply(await MessageMedia.fromUrl(url));
            });
          }
        } else {
          message.reply(
            "Perintah ini tidak ditemukan.\n\nKetik `!help` untuk lihat daftar atau tambahkan perintah baru melalui login `!login`.\n\v1.0"
          );
        }
      } catch (error) {
        console.error("Error fetching custom responses:", error);
        message.reply(
          "Perintah tidak ditemukan:\n\nGagal memuat daftar perintah custom dari API (apakah API down?): \n" +
            JSON.stringify(error, null, 2)
        );
      }
      break;
  }
});

// Initialize express API
server.listen(port, () => {
  console.log(`Express server is listening on port ${port}`);
});

// Initialize bot
client.initialize();
