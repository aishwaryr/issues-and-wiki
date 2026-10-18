// Small initials avatar ("E2E Bob" → "EB") for places that show a person.
// Purely visual: the name is always shown next to it, so it's hidden from
// screen readers (aria-hidden) to avoid reading the name twice.

// First letter of the first two words, uppercased.
function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

export function UserAvatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-foreground"
    >
      {getInitials(name)}
    </span>
  );
}
