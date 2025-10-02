export const formatDate = (date: Date, lang: "en" | "id" = "en"): string => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 0) {
    return date.toLocaleString(lang === "id" ? "id-ID" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }

  const translations = {
    en: {
      year: "year",
      month: "month",
      day: "day",
      hour: "hour",
      minute: "minute",
      second: "second",
      ago: "ago",
    },
    id: {
      year: "tahun",
      month: "bulan",
      day: "hari",
      hour: "jam",
      minute: "menit",
      second: "detik",
      ago: "yang lalu",
    },
  };

  const t = translations[lang];

  const intervals = [
    { label: t.year, seconds: 31536000 },
    { label: t.month, seconds: 2592000 },
    { label: t.day, seconds: 86400 },
    { label: t.hour, seconds: 3600 },
    { label: t.minute, seconds: 60 },
    { label: t.second, seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      if (interval.label === t.year) {
        return date.toLocaleString(lang === "id" ? "id-ID" : "en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
        });
      }
      const plural = lang === "en" && count > 1 ? "s" : "";
      return `${count} ${interval.label}${plural} ${t.ago}`;
    }
  }

  const plural = lang === "en" ? "s" : "";
  return `0 ${t.second}${plural} ${t.ago}`;
};

export const formatDateBasic = (date: Date) =>
  date.toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

export const formatTime = (date: Date): string =>
  date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
