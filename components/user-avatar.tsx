import { cn } from "cn";

// Small initials avatar ("E2E Bob" → "EB") for places that show a person.
// Purely visual: the name is always shown next to it, so it's hidden from
// screen readers (aria-hidden) to avoid reading the name twice.

// Soft tints, one per person, picked from the name so a user keeps one color everywhere.
const TINTS = [
  "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  "bg-violet-500/15 text-violet-700 dark:text-violet-300",
];

// First letter of the first two words, uppercased.
function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

// Same name → same tint, on every page and every render.
function getTint(name: string) {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return TINTS[hash % TINTS.length];
}

/** Initials avatar tinted per person; `md` for comments, `sm` for rows. */
export function UserAvatar({
  name,
  size = "sm",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium",
        size === "sm" ? "size-5 text-[10px]" : "size-7 text-xs",
        getTint(name),
      )}
    >
      {getInitials(name)}
    </span>
  );
}
