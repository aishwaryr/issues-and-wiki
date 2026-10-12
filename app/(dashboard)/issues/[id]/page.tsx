// =============================================================================
// Issue detail page: /issues/[id]   (issu-03)
//
// LAYER: Server Component. It runs only on the server. No "use client" here.
// It reads the database through the DAL (lib/dal.ts) and sends finished HTML
// to the browser. No API route and no useEffect fetch.
//
// FLOW (one request):
//   URL /issues/12
//     → Next.js matches the folder [id] → params = Promise<{ id: "12" }>
//     → generateMetadata() runs → <title>ISS-12 · <title> · Issues + Wiki</title>
//     → IssuePage() runs        → the HTML below
//
// STATUS OF THIS FILE:
//   DONE  = Claude wrote it (happy flow: a valid number, and the issue exists).
//   TODO(you) = your part. The checks and the styling are yours.
//
// Basic HTML on purpose: no Tailwind classes yet. Read the structure first.
// =============================================================================

import type { Metadata } from "next";
import Link from "next/link";

// TODO(you) 03-2b: also import `notFound` from "next/navigation".
//   notFound() throws. Next.js catches it and renders the nearest
//   not-found.tsx. Here that is the root app/not-found.tsx (no navbar),
//   because (dashboard) has no not-found.tsx of its own.

import { getIssue } from "@/lib/dal";
import { formatIssueKey, PRIORITY_CONFIG, STATUS_CONFIG } from "@/lib/issues";

// -----------------------------------------------------------------------------
// Metadata (03-2c)
// -----------------------------------------------------------------------------

// DONE: generateMetadata replaces the old `export const metadata = { title: "Issue" }`.
//   - A static `metadata` object can't read the URL. This function can.
//   - Next.js does not allow both exports in one file.
//   - The root layout has the template "%s · Issues + Wiki", so the tab shows
//     "ISS-12 · Login button does nothing · Issues + Wiki".
//   - PageProps<"/issues/[id]"> is a global type that Next.js generates from
//     the folder names. It types `params` as Promise<{ id: string }>.
export async function generateMetadata({
  params,
}: PageProps<"/issues/[id]">): Promise<Metadata> {
  // DONE: params is a Promise in Next 16. Await it before you read it.
  const { id } = await params;

  // DONE (happy flow): Number("12") → 12.
  // TODO(you) 03-2a/b: use parseIssueNumber(id) here too (same as the page).
  //   If it returns null, call notFound(). Then a bad URL never reaches the DB.
  const number = Number(id);

  // DONE: getIssue runs requireUser() inside, so a signed-out visitor is
  //   redirected to /signin before any issue data loads.
  // NOTE: the page below calls getIssue(number) again. That is a second DB
  //   query for the same row. See the TODO above getIssue in lib/dal.ts.
  // `!` = "TypeScript, trust me: this is not null". It is only true on the
  //   happy flow.
  // TODO(you) 03-2b: replace the `!` with a real check:
  //     const issue = await getIssue(number);
  //     if (!issue) notFound();
  //   After notFound() TypeScript knows `issue` is not null (notFound returns
  //   `never`), so you can delete the `!`.
  const issue = (await getIssue(number))!;

  return { title: `${formatIssueKey(issue.number)} · ${issue.title}` };
}

// -----------------------------------------------------------------------------
// Page (03-2 data flow + 03-3 layout + 03-4 action bar)
// -----------------------------------------------------------------------------

export default async function IssuePage({ params }: PageProps<"/issues/[id]">) {
  // DONE: the folder name [id] becomes params.id. It is always a string,
  //   because it comes from the URL. The value is the issue NUMBER (12 in
  //   ISS-12), not the UUID. The list page links to /issues/${issue.number}.
  const { id } = await params;

  // DONE (happy flow): turn "12" into 12.
  // TODO(you) 03-2a: write parseIssueNumber(id) in lib/issues.ts (spec is
  //   there) and use it here instead of Number(id).
  //   Why: Number() accepts "1e3" (→ 1000), " 12" (→ 12) and "1.5". A huge
  //   value like 99999999999 makes Postgres throw "out of range for type
  //   integer" → the error page (500), not a 404.
  // TODO(you) 03-2b: if parseIssueNumber returns null → notFound(), BEFORE you
  //   call getIssue. Route params are untrusted user input. Reject bad input
  //   early, and don't spend a DB query on it.
  const number = Number(id);

  // DONE: one query. LEFT JOIN users → assigneeName (null when unassigned).
  // TODO(you) 03-2b: no row → notFound(). Same pattern as in generateMetadata,
  //   then delete the `!`.
  const issue = (await getIssue(number))!;

  // DONE: computed once, used in the header.
  const key = formatIssueKey(issue.number);

  return (
    // DONE: <article> = one self-contained thing (one issue).
    // TODO(you) styling: add Tailwind at the end (e.g. "space-y-6" here).
    <article>
      {/* ------------------------------------------------------------------
          Back link (03-3)
          DONE: <Link> from next/link = client-side navigation (no full
          page reload). Use a plain <a> only for external URLs.
          ------------------------------------------------------------------ */}
      <p>
        <Link href="/issues">← All issues</Link>
      </p>

      {/* ------------------------------------------------------------------
          Header: key + title (03-3)
          DONE: <header> groups the heading of the article.
          One <h1> per page = the issue title (good for screen readers + SEO).
          ------------------------------------------------------------------ */}
      <header>
        <p>{key}</p>
        <h1>{issue.title}</h1>
      </header>

      {/* ------------------------------------------------------------------
          Action bar (03-4): BUTTONS ONLY. Nothing is wired yet.
          ------------------------------------------------------------------ */}
      <div>
        {/* DONE: Edit is navigation, so it is a Link, not a <button>.
            The /issues/[id]/edit page is still a placeholder (issu-04). */}
        <Link href={`/issues/${issue.number}/edit`}>Edit</Link>{" "}
        {/* TODO(you) issu-05: Delete.
              - Wrap it in <form action={deleteIssue.bind(null, issue.id)}>
                and make it type="submit".
              - Server action: requireUser → delete → revalidatePath("/issues")
                → redirect("/issues").
              - Ask for confirmation first (a client component with
                window.confirm, or a shadcn AlertDialog).
            type="button" = it does nothing yet, and it can't submit a form by
            accident. */}
        <button type="button">Delete</button>{" "}
        {/* TODO(you) issu-06: Assign to me / Unassign.
              - The page needs the signed-in user: const user = await requireUser().
                (getIssue already calls it. requireUser reads getCurrentUser,
                which is wrapped in React cache(), so the second call does not
                query the DB again.)
              - issue.assigneeId === user.id → show "Unassign", else "Assign to me".
              - Same <form action={...bind(null, issue.id)}> pattern as Delete. */}
        <button type="button">Assign to me</button>
      </div>

      {/* ------------------------------------------------------------------
          Properties (03-3)
          DONE: <dl> = a description list, made for label/value pairs.
          <dt> = the label, <dd> = the value. Screen readers announce them
          as pairs. Better than a pile of <div>s.
          ------------------------------------------------------------------ */}
      <dl>
        <dt>Status</dt>
        {/* DONE: STATUS_CONFIG maps the DB value ("in_progress") to its label
            ("In progress"). One source of truth, shared with the list page.
            TODO(you) styling: the list page shows <StatusIcon status=... />
            from @/components/issue-icons. Add it next to the label. */}
        <dd>{STATUS_CONFIG[issue.status].label}</dd>

        <dt>Priority</dt>
        {/* DONE: same idea as status, via PRIORITY_CONFIG.
            TODO(you) styling: <PriorityIcon priority=... /> next to it. */}
        <dd>{PRIORITY_CONFIG[issue.priority].label}</dd>

        <dt>Assignee</dt>
        {/* DONE: assigneeName is null when nobody is assigned (LEFT JOIN).
            `??` shows "Unassigned" only for null/undefined, not for "".
            TODO(you) styling: the list page uses <UserAvatar name=... />. */}
        <dd>{issue.assigneeName ?? "Unassigned"}</dd>

        <dt>Created</dt>
        <dd>
          {/* DONE: <time dateTime="2026-10-12T..."> = a machine-readable date
              for browsers, screen readers and search engines. The text in
              between is for humans.
              Fixed "en-US" locale, the same as on the list page, so the
              server and the browser show the same text.
              TODO(you) refactor: this date format is now in 2 files. Move it
              to one helper, e.g. formatIssueDate(date) in lib/issues.ts. */}
          <time dateTime={issue.createdAt.toISOString()}>
            {issue.createdAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </dd>

        <dt>Updated</dt>
        <dd>
          {/* DONE: same as Created.
              NOTE: updatedAt only changes when updateIssue sets it (issu-04
              plans `updatedAt: new Date()`). Until then it equals createdAt. */}
          <time dateTime={issue.updatedAt.toISOString()}>
            {issue.updatedAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </dd>
      </dl>

      {/* ------------------------------------------------------------------
          Description (03-3)
          DONE: <section> + <h2> = a titled part of the article.
          aria-labelledby names the section with its own heading.
          ------------------------------------------------------------------ */}
      <section aria-labelledby="description-heading">
        <h2 id="description-heading">Description</h2>
        {/* DONE: React renders null as nothing, so this does not crash when
            there is no description.
            React escapes the text. A description like "<script>" shows as
            text and never runs. Never use dangerouslySetInnerHTML for user
            text.
            TODO(you) empty state: description is null when the form field was
            empty (IssueSchema turns "" into undefined → NULL in the DB).
            Show "No description" in that case.
            TODO(you) styling: add `whitespace-pre-wrap`. Without it, the line
            breaks the user typed collapse into one line. */}
        <p>{issue.description}</p>
      </section>
    </article>
  );
}
