const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
  },
  webVersionCache: {
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/refs/heads/main/html/2.3000.1017920117-alpha.html",
    type: "remote",
  },
});

const rotateArrays = (endDate, startDate) => {
  const contents = [
    {
      tim: {
        nama: "Esa",
        no: 4,
      },
      siswa: [
        "Brilliant Ozora Himmatana",
        "Rafa Chadhijah Syafitri",
        "Ahmad Danial Adzimmi",
        "Vanya Namira Aisyah",
        "Rangga Pratama",
        "Rahma Cahya Kamila",
        "Dewi Retna Arum Sasi",
      ],
    },
    {
      tim: {
        nama: "Brilliant Ozora David Muklis",
        no: 5,
      },
      siswa: [
        "Teguh Sugiharto Santoso",
        "Nikmatus Solihah",
        "Rasya Eka Ayu Yulistya",
        "Marsha Hera Ayunda",
        "Fahmi Nur Yudisyah",
        "Dafan Zain Pratama",
      ],
    },
    {
      tim: {
        nama: "Vanya",
        no: 1,
      },
      siswa: [
        "Firdaus Andhika Pamungkas",
        "Yora Nisbunan",
        "Salva Vidominna",
        "Aura Septiarsya",
        "Dilla Ayuhan",
        "Dewi Afifatuz Zahro",
        "Zahran Zaidan Nasution",
      ],
    },
    {
      tim: {
        nama: "Bintang",
        no: 2,
      },
      siswa: [
        "Andaraka Putra Risriyana",
        "Najwa Istighfara",
        "Aryya Agata Dikawasistha",
        "Erlyta Zeva Ditya",
        "Rodifatuz Zamaniah",
        "Daffa Aziz Ghiffari",
        "Daifan Nur Amali",
      ],
    },
    {
      tim: {
        nama: "Dewi A",
        no: 3,
      },
      siswa: [
        "Irma Lisnawati",
        "Esa Raditya Mantovany",
        "Bintang Rafif Avecinna",
        "Muhammad Alliffian Fakhri Effendi",
        "Zahra Marjannah",
        "Navila El Khairina",
        "Putri Velani",
      ],
    },
  ];

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

  return output;
};

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message_create", async (message) => {
  if (message.body === "!piket") {
    const startDate = new Date("2024-11-04");
    const endDate = new Date();
    message.reply(rotateArrays(endDate, startDate));
  } else if (message.body === "!help") {
    message.reply("Node.js is very cool 🔥🔥🔥 https://wwebjs.dev/");
  } else if (message.body == "!ping") {
    message.reply("pong");
  } else if (message.body == "bruh") {
    message.react("💀");
  } else if (message.body == "!pin") {
    message.pin(10);
  } else if (message.body == "toyota") {
    const media = await MessageMedia.fromUrl(
      "https://platform.cstatic-images.com/large/in/v2/stock_photos/941643fc-5200-45f4-8368-4505e79ec7c4/db3d4c61-ec9a-45b8-a099-686fb28fbf90.png"
    );
    message.reply(media);
  } else if (message.body == "!star") {
    message.star();
  }
});

client.initialize();
