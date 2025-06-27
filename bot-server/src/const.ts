export const COLORS = {
  RED: "🟥 RED",
  GREEN: "🟩 GREEN",
  BLUE: "🟦 BLUE",
  YELLOW: "🟨 YELLOW",
  WILD: "⬛ WILD",
};

export const VALUES = {
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

export const laravelUrl = process.env.LARAVEL_URL;
export const nextJsUrl = process.env.FRONTEND_URL;
export const requestHeader = {
  headers: {
    Authorization: `Bearer ${process.env.SUPERADMIN_BEARER_TOKEN}`,
  },
};
