import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { assignIssue, deleteIssue } from "@/app/actions/issues";
import { PriorityIcon, StatusIcon } from "@/components/issue-icons";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getIssue, requireUser } from "@/lib/dal";
import {
  formatIssueKey,
  parseIssueKey,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
} from "@/lib/issues";

import { AssignIssueButton } from "./assign-issue-button";
import { DeleteIssueButton } from "./delete-issue-button";

export async function generateMetadata({
  params,
}: PageProps<"/issues/[issueKey]">): Promise<Metadata> {
  const { issueKey } = await params;
  const issueNumber = parseIssueKey(issueKey);
  if (issueNumber === null) {
    notFound();
  }
  const issue = await getIssue(issueNumber);
  if (issue === null) {
    notFound();
  }
  return { title: `${formatIssueKey(issue.number)} · ${issue.title}` };
}

export default async function IssuePage({
  params,
}: PageProps<"/issues/[issueKey]">) {
  const { issueKey } = await params;
  const issueNumber = parseIssueKey(issueKey);
  if (issueNumber === null) {
    notFound();
  }
  if (issueKey !== formatIssueKey(issueNumber)) {
    redirect(`/issues/${formatIssueKey(issueNumber)}`);
  }
  const issue = await getIssue(issueNumber);
  if (issue === null) {
    notFound();
  }

  const user = await requireUser();
  const assignedToMe = issue.assigneeId === user.id;

  return (
    <article className="space-y-6">
      <Link
        href="/issues"
        className="inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← All issues
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="font-mono text-sm text-muted-foreground">{issueKey}</p>
          <h1 className="text-2xl font-semibold wrap-break-word">
            {issue.title}
          </h1>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/issues/${issueKey}/edit`}>Edit</Link>
          </Button>
          <AssignIssueButton
            assignedToMe={assignedToMe}
            action={assignIssue.bind(null, issue.id, !assignedToMe)}
          />
          <DeleteIssueButton action={deleteIssue.bind(null, issue.id)} />
        </div>
      </header>

      <div className="grid items-start gap-6 md:grid-cols-[1fr_18rem]">
        <section aria-labelledby="description-heading">
          <Card>
            <CardContent className="space-y-3">
              <h2
                id="description-heading"
                className="text-sm font-medium text-muted-foreground"
              >
                Description
              </h2>
              {issue.description ? (
                <p className="whitespace-pre-wrap">{issue.description}</p>
              ) : (
                <p className="text-muted-foreground">No description</p>
              )}
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="flex items-center gap-2">
                <StatusIcon status={issue.status} aria-hidden />
                {STATUS_CONFIG[issue.status].label}
              </dd>

              <dt className="text-muted-foreground">Priority</dt>
              <dd className="flex items-center gap-2">
                <PriorityIcon priority={issue.priority} aria-hidden />
                {PRIORITY_CONFIG[issue.priority].label}
              </dd>

              <dt className="text-muted-foreground">Assignee</dt>
              <dd className="flex items-center gap-2">
                {issue.assigneeName && <UserAvatar name={issue.assigneeName} />}
                {issue.assigneeName ?? "Unassigned"}
              </dd>

              <dt className="text-muted-foreground">Created</dt>
              <dd>
                <time dateTime={issue.createdAt.toISOString()}>
                  {issue.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </dd>

              <dt className="text-muted-foreground">Updated</dt>
              <dd>
                <time dateTime={issue.updatedAt.toISOString()}>
                  {issue.updatedAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </dd>
            </dl>
          </CardContent>
        </Card>
      </div>
    </article>
  );
}
