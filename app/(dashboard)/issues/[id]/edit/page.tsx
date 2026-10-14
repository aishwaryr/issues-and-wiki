// =============================================================================
// Edit issue page: /issues/[id]/edit   (issu-04-1)
//
// LAYER: Server Component. It loads the issue on the server and renders the
// shared <IssueForm> (a Client Component) with the issue's current values.
//
// FLOW:
//   GET /issues/12/edit
//     → params = Promise<{ id: "12" }>
//     → getIssue(12) → the current row
//     → updateIssue.bind(null, issue.id) → an action that knows WHICH issue
//     → <IssueForm action=… initialValues=…> → inputs start filled in
//   Submit → updateIssue(id, prevState, formData) on the server
//     → UPDATE → revalidatePath → redirect to /issues/12
//
// STATUS: DONE = happy flow. TODO(you) = the checks.
// LAYOUT: the same Card as /issues/new, so both form pages look alike:
//   ← ISS-12
//   ┌ Card (max-w-2xl, centered) ─────────┐
//   │ Edit ISS-12                         │
//   │ <short description>                 │
//   │ [ the shared IssueForm ]            │
//   └─────────────────────────────────────┘
// =============================================================================

import type { Metadata } from "next";
import Link from "next/link";

// TODO(you) 04-1: import `notFound` from "next/navigation" (for the checks below).

import { updateIssue } from "@/app/actions/issues";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getIssue } from "@/lib/dal";
import { formatIssueKey } from "@/lib/issues";

import { IssueForm } from "../../issue-form";

// DONE: a static title is enough here. The tab shows "Edit issue · Issues + Wiki".
// TODO(you) optional: switch to generateMetadata (like [id]/page.tsx) for
//   "Edit ISS-12 · Issues + Wiki". Do the getIssue cache() TODO in lib/dal.ts
//   first, or it costs a second query.
export const metadata: Metadata = { title: "Edit issue" };

export default async function EditIssuePage({
  params,
}: PageProps<"/issues/[id]/edit">) {
  // DONE: same start as the detail page. params is a Promise in Next 16.
  const { id } = await params;

  // DONE (happy flow): "12" → 12.
  // TODO(you): the same 2 checks as [id]/page.tsx (03-2a/b):
  //   1. parseIssueNumber(id) instead of Number(id). null → notFound().
  //   2. getIssue returns null → notFound(). Then delete the `!`.
  //   Tip: a bad edit URL must 404 too. Never show an empty form for an
  //   issue that doesn't exist.
  const issueNumber = Number(id);
  const issue = (await getIssue(issueNumber))!;

  // DONE: .bind(null, issue.id) makes a NEW function with the first argument
  //   fixed. `null` is the `this` value (not used). React then calls it as
  //   (prevState, formData), and updateIssue receives (id, prevState, formData).
  //   Why bind and not <input type="hidden" name="id">? Both work, and both
  //   are client-controlled. bind keeps the id out of FormData, so
  //   readForm/IssueSchema only see the 4 real fields.
  const updateIssueWithId = updateIssue.bind(null, issue.id);

  // DONE: the DB row → the form's string values.
  //   - description is null in the DB when empty. A textarea needs a string,
  //     so `?? ""`.
  //   - status/priority are enum strings already ("todo", "high").
  //   The shape must match IssueFormState["values"] (TypeScript checks it).
  const initialValues = {
    title: issue.title,
    description: issue.description ?? "",
    status: issue.status,
    priority: issue.priority,
  };

  const key = formatIssueKey(issue.number);

  return (
    // DONE (layout): mx-auto + max-w-2xl = a centered column, the same width
    //   as /issues/new. A form wider than ~2xl gets hard to read.
    <div className="mx-auto max-w-2xl space-y-4">
      {/* DONE: back to the detail page of THIS issue.
          DONE (layout): small + muted, like the detail page's back link. */}
      <Link
        href={`/issues/${issue.number}`}
        className="inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← {key}
      </Link>

      {/* DONE (layout): the same Card structure as new/page.tsx.
          CardTitle renders a <div>, so the real <h1> goes inside it.
          One <h1> per page; the key tells the user which issue this is. */}
      <Card>
        <CardHeader>
          <CardTitle>
            <h1>Edit {key}</h1>
          </CardTitle>
          <CardDescription>
            Change the title, description, status or priority.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* DONE: the same form as /issues/new, with different props.
              - action: the BOUND updateIssue (it knows the issue id).
              - initialValues: pre-fills title, description, status, priority.
              - Cancel goes back to the detail page, not the list. */}
          <IssueForm
            action={updateIssueWithId}
            initialValues={initialValues}
            submitLabel="Save changes"
            pendingLabel="Saving..."
            cancelHref={`/issues/${issue.number}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
