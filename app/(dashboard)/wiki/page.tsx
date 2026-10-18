import type { Metadata } from "next";

export const metadata: Metadata = { title: "Wiki" };

/** Wiki page list at `/wiki`. Placeholder until wiki-03. */
export default function WikiPage() {
  return <h1 className="text-2xl font-semibold">Wiki</h1>;
}
