import { BookCheck } from "lucide-react";
import { cn } from "cn";

/** Triagebook logo: the indigo mark plus the wordmark. */
export function Brand({ className }: { className?: string }) {
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
      Triagebook
    </span>
  );
}
