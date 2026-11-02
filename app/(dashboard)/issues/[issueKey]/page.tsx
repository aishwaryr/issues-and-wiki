import type { Metadata } from "next";
import Link from "next/link";
import { FileText, X } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { addComment } from "@/app/actions/comments";
import {
  assignIssue,
  deleteIssue,
  linkWikiPage,
  unlinkWikiPage,
} from "@/app/actions/issues";
import { PriorityIcon, StatusIcon } from "@/components/issue-icons";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getIssueByKey,
  listComments,
  listLinkedWikiPages,
  listUsers,
  listWikiPages,
  requireUser,
} from "@/lib/dal";
import { formatDate, formatRelative } from "@/lib/dates";
import { formatIssueKey, PRIORITY_CONFIG, STATUS_CONFIG } from "@/lib/issues";

import { AssignIssueButton } from "./assign-issue-button";
import { AssigneePicker } from "./assignee-picker";
import { CommentForm } from "./comment-form";
import { DeleteIssueButton } from "./delete-issue-button";
import { LinkWikiPageForm } from "./link-wiki-page-form";

export async function generateMetadata({
  params,
}: PageProps<"/issues/[issueKey]">): Promise<Metadata> {
  const { issueKey } = await params;
  const issue = await getIssueByKey(issueKey);
  if (issue === null) {
    notFound();
  }
  return { title: `${formatIssueKey(issue.number)} · ${issue.title}` };
}

export default async function IssuePage({
  params,
}: PageProps<"/issues/[issueKey]">) {
  const { issueKey } = await params;
  const issue = await getIssueByKey(issueKey);
  if (issue === null) {
    notFound();
  }
  if (issueKey !== formatIssueKey(issue.number)) {
    redirect(`/issues/${formatIssueKey(issue.number)}`);
  }

  const [user, linkedPages, allPages, users, comments] = await Promise.all([
    requireUser(),
    listLinkedWikiPages(issue.id),
    listWikiPages(),
    listUsers(),
    listComments(issue.id),
  ]);
  const assignIssueWithId = assignIssue.bind(null, issue.id);
  const assignedToMe = issue.assigneeId === user.id;
  const linkedIds = new Set(linkedPages.map((page) => page.id));
  const linkablePages = allPages.filter((page) => !linkedIds.has(page.id));

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
          <h1 className="text-2xl font-semibold tracking-tight wrap-break-word">
            {issue.title}
          </h1>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/issues/${issueKey}/edit`}>Edit</Link>
          </Button>
          <AssignIssueButton
            assignedToMe={assignedToMe}
            userId={user.id}
            action={assignIssueWithId}
          />
          <DeleteIssueButton action={deleteIssue.bind(null, issue.id)} />
        </div>
      </header>

      <div className="grid items-start gap-6 md:grid-cols-[1fr_18rem]">
        <div className="space-y-6">
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

          <section aria-labelledby="wiki-pages-heading">
            <Card>
              <CardContent className="space-y-4">
                <h2
                  id="wiki-pages-heading"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Wiki pages
                </h2>

                {linkedPages.length === 0 ? (
                  <p className="text-muted-foreground">No linked pages</p>
                ) : (
                  <ul className="space-y-1">
                    {linkedPages.map((page) => (
                      <li
                        key={page.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <Link
                          href={`/wiki/${page.slug}`}
                          className="flex min-w-0 items-center gap-2 hover:underline"
                        >
                          <FileText
                            aria-hidden
                            className="size-4 shrink-0 text-muted-foreground"
                          />
                          <span className="truncate">{page.title}</span>
                        </Link>
                        <form
                          action={unlinkWikiPage.bind(null, issue.id, page.id)}
                        >
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            aria-label={`Unlink ${page.title}`}
                          >
                            <X />
                          </Button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}

                {allPages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No wiki pages yet.{" "}
                    <Link href="/wiki/new" className="underline">
                      Write one
                    </Link>
                  </p>
                ) : (
                  linkablePages.length > 0 && (
                    <LinkWikiPageForm
                      // Remount after each link so the picker resets to empty.
                      key={linkedPages.length}
                      pages={linkablePages}
                      action={linkWikiPage.bind(null, issue.id)}
                    />
                  )
                )}
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="comments-heading" className="space-y-4">
            <h2
              id="comments-heading"
              className="flex items-center gap-2 text-sm font-medium"
            >
              Comments
              <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground tabular-nums">
                {comments.length}
              </span>
            </h2>
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet</p>
            ) : (
              // A thin rail on the left ties the comments into one timeline, like Linear's activity feed.
              <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-3.5 before:w-px before:bg-border">
                {comments.map((comment) => {
                  const author = comment.authorName ?? "Deleted user";
                  return (
                    <li key={comment.id} className="relative flex gap-3">
                      <span className="rounded-full ring-4 ring-background">
                        <UserAvatar name={author} size="md" />
                      </span>
                      <div className="min-w-0 flex-1 rounded-lg border bg-card px-3.5 py-2.5 shadow-xs">
                        <p className="flex items-baseline gap-2 text-sm">
                          <span className="font-medium">{author}</span>
                          <time
                            dateTime={comment.createdAt.toISOString()}
                            title={formatDate(comment.createdAt)}
                            className="text-xs text-muted-foreground"
                          >
                            {formatRelative(comment.createdAt)}
                          </time>
                        </p>
                        <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
                          {comment.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
            <CommentForm action={addComment.bind(null, issue.id)} />
          </section>
        </div>

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
            <div className="mt-4 border-t pt-4">
              <AssigneePicker
                key={issue.assigneeId ?? "none"}
                users={users}
                assigneeId={issue.assigneeId}
                action={assignIssueWithId}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </article>
  );
}
