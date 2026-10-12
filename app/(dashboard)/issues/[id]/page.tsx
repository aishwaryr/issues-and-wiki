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
//   TODO(you) = your part. The checks and the styling polish are yours.
//
// LAYOUT (structural Tailwind only, so the page has its final shape):
//   ← All issues
//   ISS-12                                   [Edit] [Assign to me] [Delete]
//   Title (h1)
//   ┌ Description card ──────────────────┐  ┌ Properties card ┐
//   │ text                               │  │ Status   …      │
//   └────────────────────────────────────┘  │ Priority …      │
//                                           └─────────────────┘
//   On narrow screens the properties card drops below the description.
//   Polish (icons, avatar, pre-wrap) is still TODO(you), marked below.
// =============================================================================

import type { Metadata } from "next";
import Link from "next/link";

// TODO(you) 03-2b: also import `notFound` from "next/navigation".
//   notFound() throws. Next.js catches it and renders the nearest
//   not-found.tsx. Here that is the root app/not-found.tsx (no navbar),
//   because (dashboard) has no not-found.tsx of its own.

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    // DONE (layout): `space-y-6` = 1.5rem gap between the direct children.
    //   The dashboard layout already limits the width (max-w-7xl) and adds
    //   the page padding, so nothing else is needed here.
    <article className="space-y-6">
      {/* ------------------------------------------------------------------
          Back link (03-3)
          DONE: <Link> from next/link = client-side navigation (no full
          page reload). Use a plain <a> only for external URLs.
          DONE (layout): small + muted, so it doesn't compete with the title.
          `inline-block` keeps the click area to the text only.
          ------------------------------------------------------------------ */}
      <Link
        href="/issues"
        className="inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← All issues
      </Link>

      {/* ------------------------------------------------------------------
          Header: key + title on the left, action bar on the right (03-3/03-4)
          DONE: <header> groups the heading of the article.
          One <h1> per page = the issue title (good for screen readers + SEO).
          DONE (layout):
            flex + justify-between → key/title left, buttons right.
            flex-wrap + gap-4      → the buttons wrap below on narrow screens.
            items-start            → buttons align with the top of the title.
            min-w-0 on the left    → a long title can shrink instead of
                                     pushing the buttons off screen.
          ------------------------------------------------------------------ */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          {/* DONE (layout): mono + muted key, the same look as the list rows. */}
          <p className="font-mono text-sm text-muted-foreground">{key}</p>
          {/* DONE (layout): break-words so one very long word can't overflow. */}
          <h1 className="text-2xl font-semibold break-words">{issue.title}</h1>
        </div>

        {/* ----------------------------------------------------------------
            Action bar (03-4): BUTTONS ONLY. Nothing is wired yet.
            DONE (layout): shadcn <Button> in a row with a small gap.
            `shrink-0` keeps the row from being squeezed by the title.
            ---------------------------------------------------------------- */}
        <div className="flex shrink-0 gap-2">
          {/* DONE: Edit is navigation, so it is a Link, not a <button>.
              `asChild` = Button passes its classes to the child <Link>, so
              the link LOOKS like a button but is still an <a> in the HTML. */}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/issues/${issue.number}/edit`}>Edit</Link>
          </Button>
          {/* TODO(you) issu-06: Assign to me / Unassign.
                - The page needs the signed-in user: const user = await requireUser().
                  (getIssue already calls it. requireUser reads getCurrentUser,
                  which is wrapped in React cache(), so the second call does not
                  query the DB again.)
                - issue.assigneeId === user.id → show "Unassign", else "Assign to me".
                - Same <form action={...bind(null, issue.id)}> pattern as Delete. */}
          <Button type="button" variant="outline" size="sm">
            Assign to me
          </Button>
          {/* TODO(you) issu-05: Delete.
                - Wrap it in <form action={deleteIssue.bind(null, issue.id)}>
                  and make it type="submit".
                - Server action: requireUser → delete → revalidatePath("/issues")
                  → redirect("/issues").
                - Ask for confirmation first (a client component with
                  window.confirm, or a shadcn AlertDialog).
              type="button" = it does nothing yet, and it can't submit a form by
              accident.
              DONE (layout): variant="destructive" = red, the usual signal
              for an action you can't undo. */}
          <Button type="button" variant="destructive" size="sm">
            Delete
          </Button>
        </div>
      </header>

      {/* ------------------------------------------------------------------
          Body: description (main) + properties (side)
          DONE (layout): CSS grid.
            mobile:  1 column  → description, then properties below.
            md+:     2 columns → `md:grid-cols-[1fr_18rem]`
                     = description takes the rest, properties a fixed 18rem.
            items-start → each card is only as tall as its content.
          ------------------------------------------------------------------ */}
      <div className="grid items-start gap-6 md:grid-cols-[1fr_18rem]">
        {/* ----------------------------------------------------------------
            Description (03-3)
            DONE: <section> + <h2> = a titled part of the article.
            aria-labelledby names the section with its own heading.
            DONE (layout): the Card goes INSIDE the <section>. Card renders a
            plain <div>, so the <section> keeps the meaning, and the Card
            only adds the look (border, padding, shadow).
            ---------------------------------------------------------------- */}
        <section aria-labelledby="description-heading">
          <Card>
            <CardContent className="space-y-3">
              <h2
                id="description-heading"
                className="text-sm font-medium text-muted-foreground"
              >
                Description
              </h2>
              {/* DONE: React renders null as nothing, so this does not crash when
                there is no description.
                React escapes the text. A description like "<script>" shows as
                text and never runs. Never use dangerouslySetInnerHTML for user
                text.
                TODO(you) empty state: description is null when the form field
                was empty (IssueSchema turns "" into undefined → NULL in the DB).
                Show "No description" (muted) in that case.
                TODO(you) styling: add `whitespace-pre-wrap`. Without it, the
                line breaks the user typed collapse into one line. */}
              <p>{issue.description}</p>
            </CardContent>
          </Card>
        </section>

        {/* ----------------------------------------------------------------
            Properties (03-3)
            DONE: <dl> = a description list, made for label/value pairs.
            <dt> = the label, <dd> = the value. Screen readers announce them
            as pairs. Better than a pile of <div>s.
            DONE (layout): a 2-column grid INSIDE the <dl>:
              grid-cols-[auto_1fr] → labels as wide as the longest label,
                                     values take the rest.
              gap-x-4 gap-y-3      → space between columns / rows.
            Each <dt> + <dd> pair fills one row automatically.
            ---------------------------------------------------------------- */}
        <Card>
          <CardContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Status</dt>
              {/* DONE: STATUS_CONFIG maps the DB value ("in_progress") to its
                  label ("In progress"). One source of truth, shared with the
                  list page.
                  TODO(you) styling: add <StatusIcon status={issue.status} />
                  from @/components/issue-icons before the label (make the
                  <dd> "flex items-center gap-2"). */}
              <dd>{STATUS_CONFIG[issue.status].label}</dd>

              <dt className="text-muted-foreground">Priority</dt>
              {/* DONE: same idea as status, via PRIORITY_CONFIG.
                  TODO(you) styling: <PriorityIcon priority={issue.priority} />. */}
              <dd>{PRIORITY_CONFIG[issue.priority].label}</dd>

              <dt className="text-muted-foreground">Assignee</dt>
              {/* DONE: assigneeName is null when nobody is assigned (LEFT JOIN).
                  `??` shows "Unassigned" only for null/undefined, not for "".
                  TODO(you) styling: <UserAvatar name=... /> when assigned
                  (see the list page). */}
              <dd>{issue.assigneeName ?? "Unassigned"}</dd>

              <dt className="text-muted-foreground">Created</dt>
              <dd>
                {/* DONE: <time dateTime="2026-10-12T..."> = a machine-readable
                    date for browsers, screen readers and search engines. The
                    text in between is for humans.
                    Fixed "en-US" locale, the same as on the list page, so the
                    server and the browser show the same text.
                    TODO(you) refactor: this date format is now in 2 files.
                    Move it to one helper, e.g. formatIssueDate(date) in
                    lib/issues.ts. */}
                <time dateTime={issue.createdAt.toISOString()}>
                  {issue.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </dd>

              <dt className="text-muted-foreground">Updated</dt>
              <dd>
                {/* DONE: same as Created. updateIssue (issu-04) sets
                    updatedAt, so this changes after an edit. */}
                <time dateTime={issue.updatedAt.toISOString()}>
                  {issue.updatedAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </dd>
            </dl>
          </CardContent>
        </Card>
      </div>
    </article>
  );
}
