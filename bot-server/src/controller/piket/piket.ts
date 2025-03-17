import { studentContents } from "../../data/data";

// Piket System
export const rotateArrays = (endDate: Date, startDate: Date) => {
  // Calculate the number of weeks between the startDate and endDate
  const msInWeek = 7 * 24 * 60 * 60 * 1000;
  const rotateBy = Math.floor(
    (endDate.getTime() - startDate.getTime()) / msInWeek
  );

  // Normalize the rotateBy value to ensure it's within the bounds of the array length
  const normalizedRotateBy = rotateBy % studentContents.length;

  // Rotate the array
  const rotatedContents = studentContents
    .slice(-normalizedRotateBy)
    .concat(studentContents.slice(0, -normalizedRotateBy));

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
  )} ${currentMonth} 2025 ════ ◎`;

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
  }, ${endDate.getDate()} ${currentMonth} 2025 ${hours}:${minutes}*`;
};

