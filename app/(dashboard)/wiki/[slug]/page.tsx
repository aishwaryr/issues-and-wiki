import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteWikiPage } from "@/app/actions/wiki";
import { StatusIcon } from "@/components/issue-icons";
import { Markdown } from "@/components/markdown";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getWikiPage, listLinkedIssues } from "@/lib/dal";
import { formatDate } from "@/lib/dates";
import { formatIssueKey } from "@/lib/issues";

import { DeleteWikiPageButton } from "./delete-wiki-page-button";

export async function generateMetadata({
  params,
}: PageProps<"/wiki/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getWikiPage(slug);
  if (page === null) {
    notFound();
  }
  return { title: page.title };
}

/** One wiki page at `/wiki/[slug]`: title, author, actions and the rendered markdown. */
export default async function WikiPageDetail({
  params,
}: PageProps<"/wiki/[slug]">) {
  const { slug } = await params;
  const page = await getWikiPage(slug);
  if (page === null) {
    notFound();
  }
  const linkedIssues = await listLinkedIssues(page.id);

  return (
    <article className="space-y-6">
      <Link
        href="/wiki"
        className="inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← All pages
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold wrap-break-word">
            {page.title}
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {page.authorName && <UserAvatar name={page.authorName} />}
            {page.authorName ?? "Unknown author"} · Updated{" "}
            <time dateTime={page.updatedAt.toISOString()}>
              {formatDate(page.updatedAt)}
            </time>
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/wiki/${page.slug}/edit`}>Edit</Link>
          </Button>
          <DeleteWikiPageButton action={deleteWikiPage.bind(null, page.id)} />
        </div>
      </header>

      <Card>
        <CardContent>
          {page.body.trim() ? (
            <Markdown>{page.body}</Markdown>
          ) : (
            <p className="text-muted-foreground">This page is empty.</p>
          )}
        </CardContent>
      </Card>

      <section aria-labelledby="linked-issues-heading">
        <Card>
          <CardContent className="space-y-3">
            <h2
              id="linked-issues-heading"
              className="text-sm font-medium text-muted-foreground"
            >
              Linked issues
            </h2>
            {linkedIssues.length === 0 ? (
              <p className="text-muted-foreground">
                No linked issues. Link this page from an issue.
              </p>
            ) : (
              <ul className="space-y-1">
                {linkedIssues.map((issue) => (
                  <li key={issue.id}>
                    <Link
                      href={`/issues/${formatIssueKey(issue.number)}`}
                      className="flex min-w-0 items-center gap-2 hover:underline"
                    >
                      <StatusIcon status={issue.status} />
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {formatIssueKey(issue.number)}
                      </span>
                      <span className="truncate">{issue.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
