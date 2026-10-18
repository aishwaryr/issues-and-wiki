/** Short date for lists and detail pages: `Oct 18, 2026`. Fixed locale, so server and client match. */
export function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
