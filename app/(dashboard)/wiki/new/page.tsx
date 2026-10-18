import type { Metadata } from "next";

import { createWikiPage } from "@/app/actions/wiki";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { WikiPageForm } from "../wiki-page-form";

export const metadata: Metadata = { title: "New page" };

/** Create-page form at `/wiki/new`. */
export default function NewWikiPage() {
  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>
          <h1>New page</h1>
        </CardTitle>
        <CardDescription>
          Write docs, guides or notes for the team.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <WikiPageForm
          action={createWikiPage}
          submitLabel="Create page"
          pendingLabel="Creating..."
          cancelHref="/wiki"
        />
      </CardContent>
    </Card>
  );
}
