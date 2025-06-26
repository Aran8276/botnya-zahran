import axios, { AxiosError } from "axios";
import {
  Message,
  Chat,
  GroupChat,
  MessageMedia,
  Contact,
} from "whatsapp-web.js";
import { rotateArrays, createGroups, generateRandomSeed } from "./controller";
import { students } from "../data";
import {
  OTPLoginResponse,
  CheckIfGroupRegisteredResponse,
  CheckIfGroupHasPwResponse,
  FindResponsesTypeResponse,
  Deck,
} from "./type";
import { client } from "../main";

export const activeReminders = {};

const COLORS = {
  RED: "🟥 RED",
  GREEN: "🟩 GREEN",
  BLUE: "🟦 BLUE",
  YELLOW: "🟨 YELLOW",
  WILD: "⬛ WILD",
};

const VALUES = {
  ZERO: "0",
  ONE: "1",
  TWO: "2",
  THREE: "3",
  FOUR: "4",
  FIVE: "5",
  SIX: "6",
  SEVEN: "7",
  EIGHT: "8",
  NINE: "9",

  SKIP: "SKIP",
  REVERSE: "REVERSE",
  DRAW_TWO: "DRAW_TWO",

  WILD: "WILD",
  WILD_DRAW_FOUR: "WILD_DRAW_FOUR",
};

let unoGameSession = createNewUnoSession();

interface Card {
  color: string;
  value: string;
}

interface UnoGameSession {
  isInLobby: boolean;
  isGameStarted: boolean;
  players: string[];
  host: string;
  currentPlayerIndex: number;
  playerHands: Record<string, Card[]>;
  deck: Card[];
  discardPile: Card[];
  currentColor: string;
  direction: 1 | -1;
  cardsToDraw: number;
  inactivityTimer: NodeJS.Timeout | null;
}

function createNewUnoSession(): UnoGameSession {
  return {
    isInLobby: false,
    isGameStarted: false,
    players: [],
    host: "",
    currentPlayerIndex: 0,
    playerHands: {},
    deck: [],
    discardPile: [],
    currentColor: "",
    direction: 1,
    cardsToDraw: 0,
    inactivityTimer: null,
  };
}

/**
 * Clears any existing inactivity timer and sets a new one.
 * If the timer runs out, the game is automatically ended.
 * @param {any} chat - The chat object to send the end message to.
 */
function resetInactivityTimer(chat) {
  if (unoGameSession.inactivityTimer) {
    clearTimeout(unoGameSession.inactivityTimer);
  }

  const THREE_MINUTES_MS = 10 * 60 * 1000;

  unoGameSession.inactivityTimer = setTimeout(() => {
    if (unoGameSession.isGameStarted) {
      chat.sendMessage(
        "⏰ Permainan UNO telah berakhir karena tidak ada aktivitas setelah 10 menit."
      );

      unoGameSession = createNewUnoSession();
    }
  }, THREE_MINUTES_MS);
}

function createUnoDeck() {
  const deck: Deck[] = [];
  const colors = [COLORS.RED, COLORS.GREEN, COLORS.BLUE, COLORS.YELLOW];

  for (const color of colors) {
    deck.push({ color, value: VALUES.ZERO });

    for (let i = 1; i <= 9; i++) {
      deck.push({ color, value: String(i) });
      deck.push({ color, value: String(i) });
    }

    for (const action of [VALUES.SKIP, VALUES.REVERSE, VALUES.DRAW_TWO]) {
      deck.push({ color, value: action });
      deck.push({ color, value: action });
    }
  }

  for (let i = 0; i < 4; i++) {
    deck.push({ color: COLORS.WILD, value: VALUES.WILD });
    deck.push({ color: COLORS.WILD, value: VALUES.WILD_DRAW_FOUR });
  }

  return deck;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function formatCard(card) {
  if (!card) return "No Card";
  return `${card.color} ${card.value}`;
}

function getTopCard() {
  if (unoGameSession.discardPile.length === 0) return null;
  return unoGameSession.discardPile[unoGameSession.discardPile.length - 1];
}

async function advanceTurn(chat, extraSkip = 0) {
  const numPlayers = unoGameSession.players.length;
  unoGameSession.currentPlayerIndex =
    (unoGameSession.currentPlayerIndex +
      unoGameSession.direction * (1 + extraSkip) +
      numPlayers) %
    numPlayers;

  const nextPlayerId =
    unoGameSession.players[unoGameSession.currentPlayerIndex];
  const contact = await client.getContactById(nextPlayerId);

  let turnMessage = `Kartu teratas: *${formatCard(getTopCard())}*\n`;
  turnMessage += `Sekarang giliran @${contact.id.user}.`;

  if (unoGameSession.cardsToDraw > 0) {
    turnMessage += ` Anda harus draw kartu *${unoGameSession.cardsToDraw}*  atau menaruh Draw card yang sama.`;
  }

  await chat.sendMessage(turnMessage, { mentions: [contact] });

  resetInactivityTimer(chat);
}

const parseTime = (timeArg) => {
  const unit = timeArg.slice(-1);
  const value = parseInt(timeArg.slice(0, -1));

  if (isNaN(value)) return null;

  switch (unit) {
    case "m":
      return value * 60 * 1000; // menit
    case "h":
      return value * 60 * 60 * 1000; // jam
    case "d":
      return value * 24 * 60 * 60 * 1000; // hari
    default:
      return null;
  }
};

export const handleCommand = async (message: Message, client: any) => {
  const laravelUrl = process.env.LARAVEL_URL;
  const nextJsUrl = process.env.FRONTEND_URL;
  const requestHeader = {
    headers: {
      Authorization: `Bearer ${process.env.SUPERADMIN_BEARER_TOKEN}`,
    },
  };

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
    case "!ping":
      message.reply("pong");
      break;
    case "!bro":
      message.react("💀");
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
    case "!unocreate":
      if (unoGameSession.isInLobby || unoGameSession.isGameStarted) {
        message.reply(
          "Ada orang lagi main UNO nih. Pakai `!unoend` utk dihentikan dulu ya."
        );
        return;
      }
      unoGameSession = createNewUnoSession();
      unoGameSession.isInLobby = true;
      const hostContact = await message.getContact();
      unoGameSession.host = hostContact.id._serialized;
      unoGameSession.players.push(hostContact.id._serialized);

      chat.sendMessage(
        `Lobi UNO dibuat oleh @${hostContact.id.user}!\nKetik *!unojoin* to gabung.`,
        {
          mentions: [hostContact.id._serialized],
        }
      );
      break;
    case "!unojoin":
      if (!unoGameSession.isInLobby) {
        message.reply("Tidak ada sesi UNO yang jalan sekarang. ❌");
        return;
      }
      if (unoGameSession.isGameStarted) {
        message.reply("Game sudah berjalan. Anda tidak bisa gabung ❌.");
        return;
      }

      const newPlayerContact = await message.getContact();
      const newPlayerId = newPlayerContact.id._serialized;

      if (unoGameSession.players.includes(newPlayerId)) {
        message.reply("Anda sudah gabung!");
        return;
      }

      unoGameSession.players.push(newPlayerId);
      chat.sendMessage(
        `@${newPlayerContact.id.user} telah bergabung di permainan UNO!`,
        {
          mentions: [newPlayerContact.id._serialized],
        }
      );
      break;
    case "!unostart":
      const requesterId2 = (await message.getContact()).id._serialized;
      if (requesterId2 !== unoGameSession.host) {
        message.reply("Hanya host yang bisa memulai game.");
        return;
      }

      if (!unoGameSession.isInLobby) {
        message.reply("Tidak ada lobi UNO. Buat baru dengan `!unocreate`.");
        return;
      }
      if (unoGameSession.isGameStarted) {
        message.reply("Game sedang berjalan!");
        return;
      }
      if (unoGameSession.players.length < 2) {
        message.reply(
          "Anda membutuhkan minimal 2 pemain untuk menjalankan UNO."
        );
        return;
      }

      unoGameSession.isInLobby = false;
      unoGameSession.isGameStarted = true;
      unoGameSession.deck = createUnoDeck();
      shuffle(unoGameSession.deck);
      shuffle(unoGameSession.players);

      unoGameSession.players.forEach((pId) => {
        unoGameSession.playerHands[pId] = unoGameSession.deck.splice(0, 7);
      });

      let firstCard = unoGameSession.deck.pop();

      while (firstCard?.value === VALUES.WILD_DRAW_FOUR) {
        unoGameSession.deck.push(firstCard);
        shuffle(unoGameSession.deck);
        firstCard = unoGameSession.deck.pop();
      }

      unoGameSession.discardPile.push(
        firstCard || { color: "RED", value: "1" }
      );
      unoGameSession.currentColor = firstCard?.color || "RED";

      let startMessage = "🎉 Permainan UNO telah dimulai! 🎉\n\n";
      startMessage += `Urutan pemain:\n${unoGameSession.players
        .map((p, i) => `${i + 1}. @${p.split("@")[0]}`)
        .join("\n")}\n\n`;

      const firstPlayerContact = await client.getContactById(
        unoGameSession.players[0]
      );
      startMessage += `Kartu Teratas: *${formatCard(
        firstCard
      )}*\nSaatnya giliran @${firstPlayerContact.id.user}`;

      let extraSkip = 0;
      if (firstCard?.value === VALUES.SKIP) {
        startMessage += `\n...Kartu pertama adalah SKIP! Melewati @${firstPlayerContact.id.user}.`;
        extraSkip = 1;
      } else if (firstCard?.value === VALUES.REVERSE) {
        unoGameSession.direction = -1;
        unoGameSession.currentPlayerIndex = unoGameSession.players.length;
        startMessage += `\n...Kartu pertama adalah REVERSE! Urutan sekarang dibalik!`;
      } else if (firstCard?.value === VALUES.DRAW_TWO) {
        unoGameSession.cardsToDraw = 2;
        startMessage += `\n...Dan pemain pertama harus @${firstPlayerContact.id.user} draw 2!`;
      }

      const playerMentions = await Promise.all(
        unoGameSession.players.map((pId) => client.getContactById(pId))
      );
      const startMsgSent = await chat.sendMessage(startMessage, {
        mentions: playerMentions,
      });

      if (extraSkip > 0) {
        await advanceTurn(chat, extraSkip - 1);
      } else {
        resetInactivityTimer(chat);
      }
      break;
    case "!hand":
      if (!unoGameSession.isGameStarted) {
        message.reply("Game belum dimulai.");
        return;
      }

      const playerContact = await message.getContact();
      const playerId = playerContact.id._serialized;
      const playerHand = unoGameSession.playerHands[playerId];

      if (!playerHand || playerHand.length === 0) {
        message.reply("Anda tidak bermain game ini atau tidak memiliki kartu.");
        return;
      }

      const handMessage =
        `Kartu di tangan anda (${playerHand.length}):\n\n` +
        playerHand
          .map((card, i) => `${i + 1}. *${formatCard(card)}*`)
          .join("\n") +
        "\n\n_Pesan ini hanya bisa dilihat oleh anda._";

      if (message.fromMe) {
        message.reply(handMessage);
        return;
      }

      try {
        const privateChat = await playerContact.getChat();
        await privateChat.sendMessage(handMessage);
      } catch (e) {
        console.error("Failed to send private message:", e);
      }
      break;
    case "!draw":
      if (!unoGameSession.isGameStarted) return;

      const drawPlayerId = (await message.getContact()).id._serialized;
      if (
        unoGameSession.players[unoGameSession.currentPlayerIndex] !==
        drawPlayerId
      ) {
        message.reply("Bukan giliran mu!");
        return;
      }

      const cardsToDraw = unoGameSession.cardsToDraw || 1;
      if (unoGameSession.deck.length < cardsToDraw) {
        const top = unoGameSession.discardPile.pop();
        unoGameSession.deck.push(...unoGameSession.discardPile);
        unoGameSession.discardPile = [top || { color: "RED", value: "1" }];
        shuffle(unoGameSession.deck);
      }

      const drawnCards = unoGameSession.deck.splice(0, cardsToDraw);
      unoGameSession.playerHands[drawPlayerId].push(...drawnCards);
      unoGameSession.cardsToDraw = 0;

      await message.reply(`Anda melakukan draw kartu ${cardsToDraw}.`);
      await advanceTurn(chat);
      break;
    case "!unoend":
      if (!unoGameSession.isInLobby && !unoGameSession.isGameStarted) {
        message.reply("Tidak ada game aktif untuk dihentikan.");
        return;
      }

      const requesterId = (await message.getContact()).id._serialized;
      if (requesterId !== unoGameSession.host) {
        message.reply("Hanya host yang bisa menghentikan game.");
        return;
      }

      unoGameSession = createNewUnoSession();
      chat.sendMessage("Permainan UNO game telah dihentikan oleh host 👋");
      break;
    case "!unostatus":
      if (!unoGameSession.isGameStarted) {
        message.reply("Tidak ada game UNO yang sekarang yang jalan.");
        return;
      }

      const topCard = getTopCard();
      const currentPlayerId =
        unoGameSession.players[unoGameSession.currentPlayerIndex];
      const currentContact = await client.getContactById(currentPlayerId);

      let statusMsg = `*UNO Status Game*\n\n`;
      statusMsg += `Kartu Top: *${formatCard(topCard)}*\n`;
      statusMsg += `Warna Sekarang: *${unoGameSession.currentColor}*\n`;
      statusMsg += `Giliran Pemain: @${currentContact.id.user}\n`;
      statusMsg += `Arah: ${
        unoGameSession.direction === 1
          ? "Searah Jarum Jam ➡️"
          : "Berlawanan Jarum Jam ⬅️"
      }\n`;
      statusMsg += `Kartu dalam Deck: ${unoGameSession.deck.length}\n\n`;
      statusMsg +=
        `Pemain:\n` +
        unoGameSession.players
          .map((pId) => {
            const name = pId.split("@")[0];
            const cardCount = unoGameSession.playerHands[pId].length;
            return `- @${name} (*${cardCount}* kartu)`;
          })
          .join("\n");

      const allPlayerMentions = await Promise.all(
        unoGameSession.players.map((pId) => client.getContactById(pId))
      );
      const statusMsgSent = await chat.sendMessage(statusMsg, {
        mentions: allPlayerMentions,
      });

      break;

    default:
      if (command === "!remindme") {
        let timeArg = args[0];
        let reminderText = args.slice(1).join(" ");

        if (!timeArg) {
          return message.reply(
            "Format salah. Contoh: `!remindme 1h beli sosis`"
          );
        }

        let delay;
        if (timeArg === "week_day_before") {
          // 1 minggu dikurangi 1 hari = 6 hari
          delay = 6 * 24 * 60 * 60 * 1000;
          if (!reminderText) {
            reminderText = args.slice(0).join(" ");
          }
        } else {
          delay = parseTime(timeArg);
        }

        if (!delay) {
          return message.reply(
            "Argumen waktu tidak valid. Gunakan `m` untuk menit, `h` untuk jam, atau `d` untuk hari."
          );
        }

        if (!reminderText) {
          return message.reply("Tolong berikan pesan pengingat.");
        }

        const reminder = setTimeout(() => {
          message.reply(reminderText);
          delete activeReminders[message.id._serialized];
        }, delay);

        activeReminders[message.id._serialized] = {
          timer: reminder,
          author: message.author || message.from,
        };

        message.react("⏲️");

        return;
      }

      if (command === "!place") {
        if (!unoGameSession.isGameStarted) return;

        const placePlayerId = (await message.getContact()).id._serialized;
        if (
          unoGameSession.players[unoGameSession.currentPlayerIndex] !==
          placePlayerId
        ) {
          message.reply("Bukan giliranmu!");
          return;
        }

        if (args.length === 0) {
          message.reply(
            "Perintah tidak lengkap. Contoh: `!place red 7` atau `!place 3`"
          );
          return;
        }

        const playerHand = unoGameSession.playerHands[placePlayerId];
        const topCard = getTopCard();
        let cardToPlay;
        let cardIndex = -1;

        const handIndex = parseInt(args[0], 10) - 1;
        if (
          !isNaN(handIndex) &&
          handIndex >= 0 &&
          handIndex < playerHand.length
        ) {
          cardToPlay = playerHand[handIndex];
          cardIndex = handIndex;
        } else {
          const firstArg = args[0].toUpperCase();

          if (firstArg === "WILD" || firstArg === "WILD_DRAW_FOUR") {
            const valueToFind = VALUES[firstArg];
            cardIndex = playerHand.findIndex((c) => c.value === valueToFind);
          }

          if (cardIndex === -1) {
            const secondArg = args[1]?.toUpperCase();

            cardIndex = playerHand.findIndex(
              (c) =>
                (c.color.includes(firstArg) && c.value === secondArg) ||
                c.value === firstArg
            );
          }

          if (cardIndex !== -1) {
            cardToPlay = playerHand[cardIndex];
          }
        }

        if (!cardToPlay) {
          message.reply(
            "Anda tidak memiliki kartu itu. Coba lihat kartu anda lagi dengan `!hand`."
          );
          return;
        }

        const isForcedDraw = unoGameSession.cardsToDraw > 0;
        if (isForcedDraw) {
          if (
            cardToPlay.value !== VALUES.DRAW_TWO &&
            cardToPlay.value !== VALUES.WILD_DRAW_FOUR
          ) {
            message.reply(
              `Anda harus mengambil ${unoGameSession.cardsToDraw} kartu atau memainkan kartu Draw lainnya.`
            );
            return;
          }
        } else {
          const isValidPlay =
            cardToPlay.color === COLORS.WILD ||
            cardToPlay.color === unoGameSession.currentColor ||
            cardToPlay.value === topCard?.value;
          if (!isValidPlay) {
            message.reply(
              `Gerakan tidak sah. Anda harus memainkan kartu *${unoGameSession.currentColor}*, kartu dengan nilai *${topCard?.value}*, atau Wild card.`
            );
            return;
          }
        }

        playerHand.splice(cardIndex, 1);
        unoGameSession.discardPile.push(cardToPlay);
        const playerContact = await message.getContact();
        chat.sendMessage(
          `@${playerContact.id.user} memainkan *${formatCard(cardToPlay)}*`,
          { mentions: [playerContact.id._serialized] }
        );

        if (playerHand.length === 0) {
          chat.sendMessage(
            `🎉 @${playerContact.id.user} telah memainkan kartu terakhirnya dan MENANG! 🎉`,
            { mentions: [playerContact.id._serialized] }
          );
          if (unoGameSession.inactivityTimer)
            clearTimeout(unoGameSession.inactivityTimer);
          unoGameSession = createNewUnoSession();
          return;
        }

        if (playerHand.length === 1) {
          chat.sendMessage(
            `*UNO!* @${playerContact.id.user} hanya punya 1 kartu tersisa!`,
            { mentions: [playerContact.id._serialized] }
          );
        }

        let extraSkip = 0;
        unoGameSession.currentColor = cardToPlay.color;

        switch (cardToPlay.value) {
          case VALUES.DRAW_TWO:
            unoGameSession.cardsToDraw += 2;
            break;
          case VALUES.WILD_DRAW_FOUR:
            unoGameSession.cardsToDraw += 4;

          case VALUES.WILD:
            const chosenColor = args[1]?.toUpperCase();
            const validColors = ["RED", "GREEN", "BLUE", "YELLOW"];
            if (!chosenColor || !validColors.includes(chosenColor)) {
              playerHand.splice(cardIndex, 0, cardToPlay);
              unoGameSession.discardPile.pop();
              message.reply(
                "Anda memainkan Wild card! Anda harus memilih warna. Contoh: `!place wild red`"
              );
              return;
            }
            unoGameSession.currentColor = COLORS[chosenColor];
            await chat.sendMessage(
              `Warna baru adalah *${unoGameSession.currentColor}*`
            );
            break;
          case VALUES.SKIP:
            extraSkip = 1;
            break;
          case VALUES.REVERSE:
            unoGameSession.direction *= -1;
            if (unoGameSession.players.length === 2) {
              extraSkip = 1;
            }
            break;
        }

        await advanceTurn(chat, extraSkip);
        return;
      }

      if (command == "!test") {
        const response = args.join(" ");
        message.reply(`Ada berkata: ${response}`);
        return;
      }

      if (command == "!shouldi") {
        const response = args.join(" ");
        message.reply(
          `${response && `Should I ${response}?`} ${
            Math.random() < 0.5 ? "Yes ✅" : "Nah ❌"
          }`
        );
        return;
      }

      if (command == "!pin") {
        message.pin(604800);
        return;
      }

      if (command == "!help") {
        const response = args.join(" ");

        if (!response) {
          message.reply(
            `🌟 **Daftar Perintah Botnya Zahran** 🌟
**🛠️ Alat Utilities 🛠️**
*!everyone <pesan>* - Mention semua peserta dalam grup chat. 📢
*!piket* - Lihat Jadwal Piket 🧹.
*!login* Masuk dan tambahkan perintah bot baru. 🔧
*!group* - Cek dan daftar grup pada bot. 👥
*!spin <jumlah kelompok>* - Buat kelompok berdasarkan jumlah yang diberikan. 🔄

**🚗 Fun Stuff & Random Shit 💥**
*!ping* - Test respons bot dengan balasan "pong" 🏓 klasik.
*!shouldi* - Dapatkan respon random iya atau tidak. ✅❌
*!test <pesan>* - Cek apa yang anda katakan. 🗣️
*!toyota* - Terima gambar keren dari mobil Toyota. 🚗
*!cat* - Terima gambar random kucing dari API. 🐱
*!bro* - Reaksi dengan 💀.
*!pin* - Pin pesan selama 10 detik. 📌
*!star* - Tandai pesan dengan bintang. ⭐

**🤖 Alat AI 🤖**
*!buatgambar <pesan>* - Buat gambar AI berdasarkan prompt yang diberikan. 🎨
*!deteksigambar <pesan>* - Deteksi konten gambar yang diunggah. 🖼️
*!ai <pesan>* - Ajukan pertanyaan ke AI dan terima balasan. 🤖
*!aicepat <pesan>* - Ajukan pertanyaan cepat ke AI dan terima balasan. ⚡
*!aicoding <pesan>* - Ajukan pertanyaan pemrograman ke AI dan terima balasan. 💻

**🎮 Game 🕹️**
*!help uno* - Lihat detail pemainan UNO (iya main UNO di WhatsApp) 🎴.

Botnya Zahran v2.0.`
          );
          return;
        }

        if (response == "uno") {
          message.reply(
            `🌟 **Cara Bermain UNO di WhatsApp** 🌟
*!unocreate*: 🎮 Memulai lobi permainan baru.
*!unojoin*: 🙋‍♂️ Bergabung ke lobi yang sedang terbuka.
*!unostart*: 🚀 Memulai permainan (hanya bisa dilakukan oleh host/pembuat lobi).
*!hand*: 🃏 Melihat kartu di tanganmu (kartu akan dikirim lewat chat pribadi/DM).
*!draw*: ➕ Mengambil satu kartu dari tumpukan (dan mengakhiri giliranmu).
*!place*: 👇 Memainkan kartu dari tangan. Ada beberapa cara:
    - *!place <warna> <nilai>* (Contoh: !place red 7)
    - *!place <aksi>* (Contoh: !place skip atau !place reverse)
    - *!place <index>* (Contoh: !place 3 untuk memainkan kartu ke-3 di tanganmu)
    - *!place wild <warna>* 🎨 (Contoh: !place wild blue)
    - *!place wild_draw_four <warna>* 🔥 (Contoh: !place wild_draw_four green)
*!unostatus*: ℹ️ Melihat status permainan saat ini (giliran siapa, kartu teratas, dll).
*!unoend:* 🛑 Menghentikan permainan yang sedang berjalan secara paksa.

**Peringatan: Pemilik bot harus pm dirinya sendiri jika menggunakan !hand**

Botnya Zahran v2.0.`
          );
          return;
        } else {
          message.react("❌");
        }

        return;
      }

      if (command == "!ai") {
        const response = args.join(" ");
        const apiKey = process.env.CLOUDFLARE_WORKERS_API_KEY;
        message.react("👍");
        const res = await axios.post(
          `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`,
          {
            messages: [
              { role: "system", content: "You are a friendly assistant" },
              { role: "user", content: response },
            ],
            raw: true,
          },
          { headers: { Authorization: `Bearer ${apiKey}` } }
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
              { role: "user", content: response },
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
              { role: "user", content: response },
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
            { prompt: response, height: 1024, width: 1024 },
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
                  { type: "text", text: response },
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
        if (number > students.length || isNaN(number) || number < 1) {
          message.reply(
            `Argumen salah.\n\nContoh Penggunaan: !spin <jumlah kelompok (1-${students.length})>`
          );
          return;
        }
        const kelompok = createGroups(students, number);
        message.reply(
          `*Spin Kelompok*\n${kelompok
            .map(
              (item, index) =>
                `Kelompok ${index + 1} (${
                  item.numberOfParticipants
                } orang):\n${item.participants
                  .map((participant) => `- ${participant}`)
                  .join("\n")}`
            )
            .join("\n\n")}`
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
            const orString = data.responses.reply;
            const currentMsg = await message.reply("​");
            const typingPromises = orString.split("").map((char, index) => {
              return new Promise<void>((resolve) =>
                setTimeout(async () => {
                  const content = orString.substring(0, index + 1);
                  await currentMsg.edit(content);
                  resolve();
                }, index * 120)
              );
            });
            await Promise.all(typingPromises);
            await currentMsg.edit(orString);
            break;
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
          message.react("❓");
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
};
