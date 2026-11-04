import { BookCheck } from "lucide-react";
import { cn } from "cn";

/** Triagebook logo: the indigo mark plus the wordmark; `compact` shows the mark only on phones. */
export function Brand({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 font-semibold tracking-tight",
        className,
      )}
    >
      <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
        <BookCheck className="size-3.5" aria-hidden />
      </span>
      {/* sr-only, not hidden: the home link keeps "Triagebook" as its name. */}
      <span className={cn(compact && "sr-only sm:not-sr-only")}>
        Triagebook
      </span>
    </span>
  );
}
