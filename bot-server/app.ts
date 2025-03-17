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
import { students } from "./src/data/data";
import qrcode from "qrcode-terminal";
import { server } from "./src/config/server";
import { client } from "./src/config/client";
import { createGroups } from "./src/controller/group/group";
import { getAdmin } from "./src/controller/admin/admin";

interface Piket {
  target: string | null;
}

interface Motd {
  target: string | null;
  schedule: Date | null;
  body: string | null;
}

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

// Generate QR
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

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

  if (!groups || !groups.groups) {
    return;
  }

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

client.once("ready", async () => {
  const groups: AllGroupsResponse = await getGroup();
  const pikets: Piket[] = [];
  if (!groups || !groups.groups) {
    return;
  }

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

    if (!groups || !groups.groups) {
      return;
    }

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
    case "!shouldi":
      message.reply(Math.random() < 0.5 ? "Yes ✅" : "Nah ❌");
      break;
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
*!shouldi* - Dapatkan respon random iya atau tidak. ✅❌
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
              groupPfp: profilPicUrl || "null",
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
              groupPfp: profilPicUrl || "null",
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
        const apiKey = process.env.CLOUDFLARE_WORKERS_API_KEY;
        message.reply(`Asking AI question: ${response}`);
        const res = await axios.post(
          `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`,
          {
            messages: [
              {
                role: "system",
                content: "You are a friendly assistant",
              },
              {
                role: "user",
                content: response,
              },
            ],
            raw: true,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );
        const data = res.data;
        const reply = data.result.response.split("</think>");
        message.reply(`*Thinking:* \n${reply[0]}`);
        message.reply(`${reply[1]}`);
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
