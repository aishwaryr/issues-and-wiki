import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { IssueFilters } from "@/components/issue-filters";
import { Button } from "@/components/ui/button";
import { listIssues } from "@/lib/dal";

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
    </div>
  );
}
