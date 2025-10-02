export const toTitleCase = (str: string): string =>
  str
    .toLowerCase()
    .split("_")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
