import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateWikiPage } from "@/app/actions/wiki";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWikiPage } from "@/lib/dal";

import { WikiPageForm } from "../../wiki-page-form";

export async function generateMetadata({
  params,
}: PageProps<"/wiki/[slug]/edit">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getWikiPage(slug);
  if (page === null) {
    notFound();
  }
  return { title: `Edit ${page.title}` };
}

/** Edit form for one wiki page at `/wiki/[slug]/edit`, prefilled with the saved values. */
export default async function EditWikiPage({
  params,
}: PageProps<"/wiki/[slug]/edit">) {
  const { slug } = await params;
  const page = await getWikiPage(slug);
  if (page === null) {
    notFound();
  }

  const pageUrl = `/wiki/${page.slug}`;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href={pageUrl}
        className="inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← {page.title}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>
            <h1>Edit page</h1>
          </CardTitle>
          <CardDescription>
            Renaming keeps the URL, so existing links still work.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <WikiPageForm
            action={updateWikiPage.bind(null, page.id)}
            initialValues={{ title: page.title, body: page.body }}
            submitLabel="Save changes"
            pendingLabel="Saving..."
            cancelHref={pageUrl}
          />
        </CardContent>
      </Card>
    </div>
  );
}
