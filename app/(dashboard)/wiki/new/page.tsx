import type { Metadata } from "next";

export const metadata: Metadata = { title: "New page" };

/** Create-page form at `/wiki/new`. Placeholder until wiki-05. */
export default function NewWikiPage() {
  return <h1 className="text-2xl font-semibold">New page</h1>;
}
