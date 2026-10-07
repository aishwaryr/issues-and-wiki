import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { IssueFilters } from "@/components/issue-filters";
import { PriorityIcon, StatusIcon } from "@/components/issue-icons";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listIssues } from "@/lib/dal";
import { formatIssueKey } from "@/lib/issues";

export const metadata: Metadata = { title: "Issues" };

export default async function IssuesPage() {
  const issues = await listIssues();

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
          <h1 className="text-2xl font-semibold">Issues</h1>
          <p className="text-sm text-muted-foreground">
            {issues.length} {issues.length === 1 ? "issue" : "issues"}
          </p>
        </div>
        {newIssueButton}
      </div>

      {/* filters */}
      <IssueFilters />

      {/* list */}
      {issues.length === 0 ? (
        <EmptyState
          title="No issues yet"
          description="Create the first one to start tracking work."
          action={newIssueButton}
        />
      ) : (
        <ul className="space-y-2">
          {issues.map((issue) => (
            <li key={issue.id}>
              {/* The whole card is the link: a bigger click target, and one tab stop
                  per issue. The focus ring sits on the link, since it's what gets focus. */}
              <Link
                href={`/issues/${issue.number}`}
                className="block rounded-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {/* One Linear-style row: priority, key, status, title, then
                    assignee and date pushed right. flex-row/py-2.5 override the
                    Card's roomy column default so the list reads like rows. */}
                <Card className="flex-row items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50">
                  <PriorityIcon priority={issue.priority} />
                  {/* Key monospace + muted, like Jira/Linear (ISS-12) */}
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {formatIssueKey(issue.number)}
                  </span>
                  <StatusIcon status={issue.status} />
                  {/* truncate = one line with "…"; min-w-0 lets it shrink inside flex */}
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {issue.title}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
                    {/* assigneeName is null when unassigned (left join) */}
                    {issue.assigneeName && (
                      <UserAvatar name={issue.assigneeName} />
                    )}
                    {issue.assigneeName ?? "Unassigned"} ·{" "}
                    {/* Fixed locale + format so the date looks the same everywhere */}
                    {issue.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
