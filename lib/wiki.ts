import { z } from "zod";

// Form

/** Validates the create/edit wiki page form. */
export const WikiPageSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .trim()
    .max(180, { error: "Title is too long" })
    .min(1, { error: "Title is required" }),
  body: z
    .string()
    .max(50_000, { error: "Page is too long" })
    // Browsers submit textarea line breaks as \r\n; store plain \n.
    .transform((value) => value.replace(/\r\n?/g, "\n")),
});

/** Type: parsed wiki page form values, as returned by `WikiPageSchema.parse`. */
export type WikiPageInput = z.infer<typeof WikiPageSchema>;

// Slugs

/** Slugs that a static route already owns: `/wiki/new` would never reach the page. */
const RESERVED_SLUGS = new Set(["new"]);

/** URL slug from a title: `"Getting Started!"` → `"getting-started"`, `"New"` → `"new-page"`, `""` → `"page"`. */
export function slugify(title: string) {
  const slug = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
  if (!slug) {
    return "page";
  }
  return RESERVED_SLUGS.has(slug) ? `${slug}-page` : slug;
}

/** Slug to try on attempt n when the base is taken: `getting-started`, `getting-started-2`, `-3`… */
export function slugCandidate(base: string, attempt: number) {
  return attempt === 1 ? base : `${base}-${attempt}`;
}
