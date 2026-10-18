import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteWikiPage } from "@/app/actions/wiki";
import { Markdown } from "@/components/markdown";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getWikiPage } from "@/lib/dal";
import { formatDate } from "@/lib/dates";

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
    </article>
  );
}
