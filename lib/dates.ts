/** Short date for lists and detail pages: `Oct 18, 2026`. Fixed locale, so server and client match. */
export function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const relative = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** Relative time for activity feeds: `just now`, `5 minutes ago`, `yesterday`. Server-rendered. */
export function formatRelative(date: Date, now: Date = new Date()) {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) {
      return relative.format(Math.round(seconds / size), unit);
    }
  }
  return "just now";
}

/** The last `count` UTC days as `YYYY-MM-DD`, oldest first, ending today. */
export function lastDays(count: number, today: Date = new Date()) {
  return Array.from({ length: count }, (_, index) => {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - (count - 1 - index));
    return day.toISOString().slice(0, 10);
  });
}
