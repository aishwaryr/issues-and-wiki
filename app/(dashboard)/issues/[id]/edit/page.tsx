import type { Metadata } from "next";

import { ISSUE_KEY_PREFIX } from "@/lib/issues";

export const metadata: Metadata = { title: "Edit issue" };

// [id] carries the issue number (/issues/12), not the UUID.
// Placeholder until issu-04 adds the edit form. params is a Promise in Next 16.
export default async function EditIssuePage({
  params,
}: PageProps<"/issues/[id]/edit">) {
  const { id } = await params;
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold">Edit issue</h1>
      <p className="text-sm text-muted-foreground">
        {ISSUE_KEY_PREFIX}-{id}
      </p>
    </div>
  );
}
