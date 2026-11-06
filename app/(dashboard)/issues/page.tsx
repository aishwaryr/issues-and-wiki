import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { IssueFilters } from "@/components/issue-filters";
import { PriorityIcon, StatusIcon } from "@/components/issue-icons";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { listIssues, listUsers } from "@/lib/dal";
import { formatDate } from "@/lib/dates";
import { formatIssueKey, IssueFiltersSchema } from "@/lib/issues";

export const metadata: Metadata = { title: "Issues" };

export default async function IssuesPage({
  searchParams,
}: PageProps<"/issues">) {
  const filters = IssueFiltersSchema.parse(await searchParams);
  const hasFilters = Object.values(filters).some(
    (value) => value !== undefined,
  );
  const [issues, users] = await Promise.all([listIssues(filters), listUsers()]);

  const newIssueButton = (
    <Button asChild>
      <Link href="/issues/new">
        <Plus />
        New issue
      </Link>
    </Button>
  );

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Issues</h1>
          <p className="text-sm text-muted-foreground">
            {issues.length} {issues.length === 1 ? "issue" : "issues"}
          </p>
        </div>
        {newIssueButton}
      </div>

      {/* filters */}
      <IssueFilters users={users} />

      {/* list */}
      {issues.length === 0 && hasFilters ? (
        <EmptyState
          title="No issues match these filters"
          description="Try other words or another filter."
          action={
            <Button variant="outline" asChild>
              <Link href="/issues">Reset filters</Link>
            </Button>
          }
        />
      ) : issues.length === 0 ? (
        <EmptyState
          title="No issues yet"
          description="Create the first one to start tracking work."
          action={newIssueButton}
        />
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-card shadow-xs">
          {issues.map((issue) => (
            <li key={issue.id}>
              {/* The whole row is the link: a bigger click target, and one tab stop
                  per issue. The focus ring is inset, so the list's rounded border clips nothing. */}
              <Link
                href={`/issues/${formatIssueKey(issue.number)}`}
                className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50"
              >
                <PriorityIcon priority={issue.priority} />
                <span className="w-14 shrink-0 font-mono text-xs text-muted-foreground">
                  {formatIssueKey(issue.number)}
                </span>
                <StatusIcon status={issue.status} />
                {/* truncate = one line with "…"; min-w-0 lets it shrink inside flex */}
                <span className="min-w-0 flex-1 truncate font-medium">
                  {issue.title}
                </span>
                <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                  {/* assigneeName is null when unassigned (left join) */}
                  {issue.assigneeName && (
                    <UserAvatar name={issue.assigneeName} />
                  )}
                  <span className="hidden sm:inline">
                    {issue.assigneeName ?? "Unassigned"}
                  </span>
                  <span aria-hidden>·</span>
                  <time dateTime={issue.createdAt.toISOString()}>
                    {formatDate(issue.createdAt)}
                  </time>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
