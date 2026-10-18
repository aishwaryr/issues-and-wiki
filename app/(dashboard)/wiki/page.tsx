import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listWikiPages } from "@/lib/dal";
import { formatDate } from "@/lib/dates";

export const metadata: Metadata = { title: "Wiki" };

/** Wiki page list at `/wiki`, most recently updated first. */
export default async function WikiPage() {
  const pages = await listWikiPages();

  const newPageButton = (
    <Button asChild>
      <Link href="/wiki/new">
        <Plus />
        New page
      </Link>
    </Button>
  );

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Wiki</h1>
          <p className="text-sm text-muted-foreground">
            {pages.length} {pages.length === 1 ? "page" : "pages"}
          </p>
        </div>
        {newPageButton}
      </div>

      {/* list */}
      {pages.length === 0 ? (
        <EmptyState
          title="No pages yet"
          description="Write the first page to start the team's docs."
          action={newPageButton}
        />
      ) : (
        <ul className="space-y-2">
          {pages.map((page) => (
            <li key={page.id}>
              <Link
                href={`/wiki/${page.slug}`}
                className="block rounded-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <Card className="flex-row items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50">
                  <FileText
                    aria-hidden
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {page.title}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
                    {page.authorName && <UserAvatar name={page.authorName} />}
                    {page.authorName ?? "Unknown author"} · Updated{" "}
                    <time dateTime={page.updatedAt.toISOString()}>
                      {formatDate(page.updatedAt)}
                    </time>
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
