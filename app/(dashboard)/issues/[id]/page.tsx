import type { Metadata } from "next";

export const metadata: Metadata = { title: "Issue" };

// Placeholder until issu-03 adds the detail page. params is a Promise in Next 16.
export default async function IssuePage({ params }: PageProps<"/issues/[id]">) {
  const { id } = await params;
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold">Issue</h1>
      <p className="text-sm text-muted-foreground">{id}</p>
    </div>
  );
}
