import axios, { AxiosError } from "axios";
import { MessageMedia } from "whatsapp-web.js";
import { contents, students } from "../data";
import {
  AdminDetailResponse,
  AdminShufflePfpResponse,
  GroupKelompok,
} from "./type";

export const rotateArrays = (endDate: Date, startDate: Date) => {
  const msInWeek = 7 * 24 * 60 * 60 * 1000;
  const rotateBy = Math.floor(
    (endDate.getTime() - startDate.getTime()) / msInWeek
  );

  const normalizedRotateBy = rotateBy % contents.length;

  const rotatedContents = contents
    .slice(-normalizedRotateBy)
    .concat(contents.slice(0, -normalizedRotateBy));

  const currentYear = new Date().getFullYear();
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

  const getWeek = (date) => {
    var onejan = new Date(date.getFullYear(), 0, 1);
    var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    var dayOfYear = (today.getTime() - onejan.getTime() + 86400000) / 86400000;
    return Math.ceil(dayOfYear / 7);
  };

  const header = `◎ ════ Jadwal Piket ― Minggu ke-${getWeek(
    endDate
  )} ${currentMonth} ${currentYear} ════ ◎`;

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

export const generateRandomSeed = () => {
  let randomNumber = "";
  for (let i = 0; i < 16; i++) {
    randomNumber += Math.floor(Math.random() * 10);
  }
  return randomNumber;
};

export const getAdmin = async (laravelUrl, requestHeader) => {
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

export const getGroup = async (laravelUrl, requestHeader) => {
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

export const scheduleFunction = async (
  hour: number,
  minute: number,
  callback: () => void,
  onSchedule: (timeoutId: NodeJS.Timeout) => void
) => {
  const now = new Date();
  const next = new Date();

  next.setHours(hour, minute, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  const delay = next.getTime() - now.getTime();

  const timeoutId = setTimeout(function () {
    callback();
    scheduleFunction(hour, minute, callback, onSchedule);
  }, delay);
  onSchedule(timeoutId);
};

export const startAdminPfpTimeout = async (
  client,
  laravelUrl,
  getAdminFunc
) => {
  const data: AdminDetailResponse = await getAdminFunc();

  if (!data || !data.group) {
    console.log("no group");
    return null;
  }

  if (!data.group.admin_broadcaster.pfpslide_enabled) {
    return null;
  }

  const botDelay = data.group.admin_broadcaster.pfpslide_interval * 1000;
  console.log(botDelay);
  return setInterval(async () => {
    try {
      const res = await axios.get(
        `${laravelUrl}/api/admin/broadcast/pfp-slide`
      );

      const resData: AdminShufflePfpResponse = res.data;
      console.log(
        `Set admin pfp image from: ${process.env.LARAVEL_URL}${resData.image}`
      );
      if (!resData.image || !resData) {
        console.log("Warning: image or data is null, cancelling.");
        return;
      }
      const url = `${laravelUrl}${resData.image}`;
      client.setProfilePicture(await MessageMedia.fromUrl(url));
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
      console.log(error);
    }
  }, botDelay);
};

export const startGroupPiket = (
  client,
  target: string,
  hasRunThisMondayRef
) => {
  return setInterval(async () => {
    try {
      const now = new Date();
      const dayOfWeek = now.getDay();

      if (dayOfWeek === 1 && !hasRunThisMondayRef.value) {
        client.sendMessage(`${target}@g.us`, "!piket");
        hasRunThisMondayRef.value = true;
      }

      if (dayOfWeek !== 1) {
        hasRunThisMondayRef.value = false;
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
      console.log(error);
    }
  }, 60 * 60 * 1000);
};

export const createGroups = (
  studentsList: string[],
  numGroups: number
): GroupKelompok[] => {
  const shuffleArray = (array: string[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const studentsCopy = [...studentsList];
  shuffleArray(studentsCopy);

  const groups: GroupKelompok[] = [];
  const groupSize = Math.floor(studentsCopy.length / numGroups);
  const remainder = studentsCopy.length % numGroups;

  let studentIndex = 0;

  for (let i = 0; i < numGroups; i++) {
    const currentGroupSize = groupSize + (i < remainder ? 1 : 0);
    groups.push({
      participants: studentsCopy.slice(
        studentIndex,
        studentIndex + currentGroupSize
      ),
      numberOfParticipants: currentGroupSize,
    });
    studentIndex += currentGroupSize;
  }

  return groups;
};
