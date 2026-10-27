import type { Metadata } from "next";
import Link from "next/link";

import { listIssues } from "@/lib/dal";

export const metadata: Metadata = { title: "Issues" };

export default async function IssuesPage() {
  const issues = await listIssues();

  return (
    <div>
      <h1>Issues</h1>
      <Link href="/issues/new">New Issue</Link>

      {issues.length > 0 ? (
        <ul className="bg-gray-800">
          {issues.map((issue) => (
            <li key={issue.id}>
              <Link href={`/issues/${issue.number}`}>{issue.title}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No issues yet</p>
      )}
    </div>
  );
}
