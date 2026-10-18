import type { ComponentProps, ReactNode } from "react";
import { cn } from "cn";

import {
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  type IssuePriority,
  type IssueStatus,
} from "@/lib/issues";

// Linear-style 16×16 icons. Shapes are drawn with currentColor, so the color
// class from STATUS_CONFIG / PRIORITY_CONFIG sets the whole icon's color.

type IconProps = Omit<ComponentProps<"svg">, "children">;

/**
 * Shared <svg> wrapper: sizing, color, and an accessible name.
 * `role="img"` + `<title>` names the icon for screen readers and shows a hover
 * tooltip. Pass `aria-hidden` when a visible label sits next to the icon.
 */
function IconSvg({
  label,
  color,
  className,
  children,
  ...props
}: IconProps & { label: string; color: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      role="img"
      className={cn("size-4 shrink-0", color, className)}
      {...props}
    >
      <title>{label}</title>
      {children}
    </svg>
  );
}

// Status

/** Status icon: dashed / empty / half-filled / checked / crossed-out circle. */
export function StatusIcon({
  status,
  ...props
}: IconProps & { status: IssueStatus }) {
  const { label, color } = STATUS_CONFIG[status];
  return (
    <IconSvg label={label} color={color} {...props}>
      {status === "backlog" && (
        <circle
          cx="8"
          cy="8"
          r="6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="1.6 1.6"
        />
      )}
      {status === "todo" && (
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      )}
      {status === "in_progress" && (
        <>
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 4a4 4 0 0 1 0 8z" fill="currentColor" />
        </>
      )}
      {status === "done" && (
        <>
          <circle cx="8" cy="8" r="7" fill="currentColor" />
          <path
            d="M5 8.2l2 2 4-4.2"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {status === "canceled" && (
        <>
          <circle cx="8" cy="8" r="7" fill="currentColor" />
          <path
            d="M5.75 5.75l4.5 4.5m0-4.5l-4.5 4.5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
    </IconSvg>
  );
}

// Priority

/** Number of filled bars per signal-bar priority. */
const PRIORITY_BARS = { low: 1, medium: 2, high: 3 } as const;

/** Priority icon: three dashes (none), signal bars (low–high), or a "!" box (urgent). */
export function PriorityIcon({
  priority,
  ...props
}: IconProps & { priority: IssuePriority }) {
  const { label, color } = PRIORITY_CONFIG[priority];
  return (
    <IconSvg label={label} color={color} {...props}>
      {priority === "none" &&
        [1.5, 6.5, 11.5].map((x) => (
          <rect
            key={x}
            x={x}
            y="7.25"
            width="3"
            height="1.5"
            rx="0.75"
            fill="currentColor"
          />
        ))}
      {(priority === "low" || priority === "medium" || priority === "high") &&
        [6, 9, 12].map((height, i) => (
          <rect
            key={height}
            x={1.5 + i * 5}
            y={14 - height}
            width="3"
            height={height}
            rx="1"
            fill="currentColor"
            opacity={i < PRIORITY_BARS[priority] ? 1 : 0.3}
          />
        ))}
      {priority === "urgent" && (
        <>
          <rect x="1" y="1" width="14" height="14" rx="3" fill="currentColor" />
          <rect x="7.25" y="4" width="1.5" height="5" rx="0.75" fill="white" />
          <rect
            x="7.25"
            y="10.5"
            width="1.5"
            height="1.5"
            rx="0.75"
            fill="white"
          />
        </>
      )}
    </IconSvg>
  );
}
