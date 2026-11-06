/** Type: one day's count for the column chart. */
type DayCount = { date: string; count: number };

// "2026-11-02" → "Nov 2". UTC, so the label matches the UTC day it counts.
function formatDay(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Single-series column chart of issues created per day. Plain HTML, no chart
 * library: one hue (`--chart-1`), columns capped at 24px, a value on the tallest
 * column only, a hover/focus tooltip per day, and a screen-reader table.
 */
export function CreatedChart({ days }: { days: DayCount[] }) {
  const max = Math.max(1, ...days.map((day) => day.count));
  const peak = days.findLastIndex((day) => day.count === max);
  const labelled = new Set([
    0,
    Math.floor((days.length - 1) / 2),
    days.length - 1,
  ]);

  return (
    <figure>
      {/* Not aria-hidden: the bars are focusable, and a focusable element inside aria-hidden
          is unreachable for screen readers. role="img" + a label reads like the tooltip. */}
      <div className="flex h-40 items-end gap-0.5 border-b">
        {days.map((day, index) => (
          <div
            key={day.date}
            tabIndex={0}
            role="img"
            aria-label={`${formatDay(day.date)}: ${day.count} ${day.count === 1 ? "issue" : "issues"}`}
            className="group relative flex h-full flex-1 items-end justify-center rounded-sm outline-none hover:bg-accent/60 focus-visible:bg-accent/60"
          >
            {index === peak && day.count > 0 && (
              <span
                className="absolute text-xs font-medium tabular-nums text-muted-foreground"
                style={{ bottom: `calc(${(day.count / max) * 100}% + 4px)` }}
              >
                {day.count}
              </span>
            )}
            {day.count > 0 && (
              <div
                className="w-full max-w-6 rounded-t-[4px] bg-chart-1"
                style={{ height: `${(day.count / max) * 100}%` }}
              />
            )}
            <div className="pointer-events-none absolute bottom-full z-10 mb-1 hidden rounded-md border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-md group-hover:block group-focus-visible:block">
              {formatDay(day.date)} ·{" "}
              <span className="font-medium tabular-nums">{day.count}</span>{" "}
              {day.count === 1 ? "issue" : "issues"}
            </div>
          </div>
        ))}
      </div>
      <div
        className="mt-2 flex gap-0.5 text-xs text-muted-foreground"
        aria-hidden
      >
        {days.map((day, index) => (
          <span key={day.date} className="flex-1 text-center">
            {labelled.has(index) ? formatDay(day.date) : ""}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>Issues created per day</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Issues created</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.date}>
              <td>{formatDay(day.date)}</td>
              <td>{day.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
