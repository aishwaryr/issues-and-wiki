import type { Metadata } from "next";
import Link from "next/link";
import { CircleDot, CircleCheck, Loader, Plus, UserRound } from "lucide-react";

import { CreatedChart } from "@/components/created-chart";
import { EmptyState } from "@/components/empty-state";
import { PriorityIcon, StatusIcon } from "@/components/issue-icons";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  countIssuesCreatedPerDay,
  getIssueStats,
  listRecentIssues,
  requireUser,
} from "@/lib/dal";
import { formatRelative } from "@/lib/dates";
import {
  formatIssueKey,
  ISSUE_STATUSES,
  type IssueStatus,
  STATUS_CONFIG,
} from "@/lib/issues";

export const metadata: Metadata = { title: "Dashboard" };

const CHART_DAYS = 14;
const OPEN_STATUSES: IssueStatus[] = ["backlog", "todo", "in_progress"];

export default async function DashboardPage() {
  const [user, stats, createdPerDay, recent] = await Promise.all([
    requireUser(),
    getIssueStats(),
    countIssuesCreatedPerDay(CHART_DAYS),
    listRecentIssues(5),
  ]);

  // Every status gets a count, 0 when no issue has it.
  const byStatus = Object.fromEntries(
    ISSUE_STATUSES.map((status) => [
      status,
      stats.byStatus.find((row) => row.status === status)?.count ?? 0,
    ]),
  ) as Record<IssueStatus, number>;
  const total = ISSUE_STATUSES.reduce((sum, s) => sum + byStatus[s], 0);
  const open = OPEN_STATUSES.reduce((sum, s) => sum + byStatus[s], 0);
  const createdTotal = createdPerDay.reduce((sum, day) => sum + day.count, 0);
  const firstName = user.name.split(/\s+/)[0];

  const tiles = [
    { label: "Open", value: open, href: "/issues", icon: CircleDot },
    {
      label: "In progress",
      value: byStatus.in_progress,
      href: "/issues?status=in_progress",
      icon: Loader,
    },
    {
      label: "Done",
      value: byStatus.done,
      href: "/issues?status=done",
      icon: CircleCheck,
    },
    {
      label: "Assigned to you",
      value: stats.assignedToMe,
      href: "/issues",
      icon: UserRound,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Hi {firstName}, here&apos;s where things stand.
          </p>
        </div>
        <Button asChild>
          <Link href="/issues/new">
            <Plus />
            New issue
          </Link>
        </Button>
      </div>

      {total === 0 ? (
        <EmptyState
          title="No issues yet"
          description="Create the first one and this page fills in."
          action={
            <Button asChild>
              <Link href="/issues/new">Create your first issue</Link>
            </Button>
          }
        />
      ) : (
        <>
          <ul
            aria-label="Summary"
            className="grid grid-cols-2 gap-3 lg:grid-cols-4"
          >
            {tiles.map((tile) => (
              <li key={tile.label}>
                <Link
                  href={tile.href}
                  className="block rounded-xl border bg-card p-4 shadow-xs transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <tile.icon className="size-3.5" aria-hidden />
                    {tile.label}
                  </span>
                  <span className="mt-2 block text-3xl font-semibold tracking-tight tabular-nums">
                    {tile.value}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
            <section aria-labelledby="created-heading">
              <Card>
                <CardContent className="space-y-4">
                  <div>
                    <h2 id="created-heading" className="text-sm font-medium">
                      Issues created
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Last {CHART_DAYS} days · {createdTotal} total
                    </p>
                  </div>
                  <CreatedChart days={createdPerDay} />
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="status-heading">
              <Card>
                <CardContent className="space-y-4">
                  <h2 id="status-heading" className="text-sm font-medium">
                    By status
                  </h2>
                  <ul className="space-y-3">
                    {ISSUE_STATUSES.map((status) => (
                      <li key={status} className="space-y-1.5">
                        <Link
                          href={`/issues?status=${status}`}
                          className="flex items-center gap-2 text-sm hover:underline"
                        >
                          <StatusIcon status={status} aria-hidden />
                          <span className="flex-1">
                            {STATUS_CONFIG[status].label}
                          </span>
                          <span className="text-muted-foreground tabular-nums">
                            {byStatus[status]}
                          </span>
                        </Link>
                        <div className="h-1.5 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-chart-1"
                            style={{
                              width: `${(byStatus[status] / total) * 100}%`,
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>
          </div>

          <section aria-labelledby="recent-heading" className="space-y-3">
            <h2 id="recent-heading" className="text-sm font-medium">
              Recently updated
            </h2>
            <ul className="divide-y overflow-hidden rounded-xl border bg-card shadow-xs">
              {recent.map((issue) => (
                <li key={issue.id}>
                  <Link
                    href={`/issues/${formatIssueKey(issue.number)}`}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50"
                  >
                    <PriorityIcon priority={issue.priority} />
                    <span className="w-14 shrink-0 font-mono text-xs text-muted-foreground">
                      {formatIssueKey(issue.number)}
                    </span>
                    <StatusIcon status={issue.status} />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {issue.title}
                    </span>
                    {issue.assigneeName && (
                      <UserAvatar name={issue.assigneeName} />
                    )}
                    <time
                      dateTime={issue.updatedAt.toISOString()}
                      className="shrink-0 text-xs text-muted-foreground"
                    >
                      {formatRelative(issue.updatedAt)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
