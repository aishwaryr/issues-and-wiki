import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { IssueFilters } from "@/components/issue-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listIssues } from "@/lib/dal";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/issues";

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
                href={`/issues/${issue.id}`}
                className="block rounded-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {/* shadcn Card defaults to roomy page-panel spacing (py-6 gap-6);
                    tightened here so the list reads like rows. */}
                <Card className="gap-2 px-4 py-3 transition-colors hover:bg-muted/50">
                  {/* truncate = one line with "…"; min-w-0 lets it shrink inside flex */}
                  <p className="min-w-0 truncate font-medium">{issue.title}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {STATUS_LABELS[issue.status]}
                      </Badge>
                      <Badge variant="secondary">
                        {PRIORITY_LABELS[issue.priority]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {/* assigneeName is null when unassigned (left join) */}
                      {issue.assigneeName ?? "Unassigned"} ·{" "}
                      {/* Fixed locale + format so the date looks the same everywhere */}
                      {issue.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
