import type { Metadata } from "next";

export const metadata: Metadata = { title: "Wiki" };

export default function WikiPage() {
  return <h1 className="text-2xl font-semibold">Wiki</h1>;
}
