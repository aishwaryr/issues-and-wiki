import type { Metadata } from "next";

import { ISSUE_KEY_PREFIX } from "@/lib/issues";

export const metadata: Metadata = { title: "Issue" };

// [id] carries the issue number (/issues/12), not the UUID.
// Placeholder until issu-03 adds the detail page. params is a Promise in Next 16.
export default async function IssuePage({ params }: PageProps<"/issues/[id]">) {
  const { id } = await params;
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold">Issue</h1>
      <p className="text-sm text-muted-foreground">
        {ISSUE_KEY_PREFIX}-{id}
      </p>
    </div>
  );
}
