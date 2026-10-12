"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { flattenError } from "zod";

import { db } from "@/db";
import { issues } from "@/db/schema";
import { requireUser } from "@/lib/dal";
import { readForm } from "@/lib/form-data";
import { IssueSchema, type IssueInput } from "@/lib/issues";

const ISSUE_FIELDS = ["title", "description", "status", "priority"] as const;

type IssueField = keyof IssueInput;

// DONE issu-04: renamed CreateIssueState → IssueFormState. createIssue AND
//   updateIssue now return it, because both feed the same <IssueForm>.
//   `values` has a second job now: the edit page passes the issue's current
//   values as the form's INITIAL state, so the inputs start filled in.
/** Type: createIssue/updateIssue result for useActionState — errors, plus raw values to refill the form. */
export type IssueFormState = {
  errors?: Partial<Record<IssueField, string[]>>;
  message?: string;
  values?: Record<IssueField, string>;
};

/** Validates the new-issue form and creates the issue. */
export async function createIssue(
  _prevState: IssueFormState,
  formData: FormData,
): Promise<IssueFormState> {
  await requireUser();

  const values = readForm(formData, ISSUE_FIELDS);
  const result = IssueSchema.safeParse(values);

  if (!result.success) {
    return { errors: flattenError(result.error).fieldErrors, values };
  }

  // TODO(you) issu-03: now that /issues/[id] exists, open the new issue after
  //   create, not the list:
  //     const [created] = await db.insert(issues).values(result.data)
  //       .returning({ number: issues.number });
  //     ...then below: redirect(`/issues/${created.number}`)
  //   `created` must be declared outside the try (let), because redirect()
  //   stays outside the try (it throws NEXT_REDIRECT).
  //   Also update tests/e2e/create-issue.spec.ts: it expects the /issues URL.
  try {
    await db.insert(issues).values(result.data);
  } catch (error) {
    console.error("createIssue failed", error);
    return { message: "Could not create the issue. Try again.", values };
  }

  revalidatePath("/issues");
  redirect("/issues");
}

// =============================================================================
// updateIssue (issu-04-2)
//
// LAYER: Server Action ("use server" at the top of this file). It runs on the
// server. The browser only gets a reference to it, never the code or the DB.
//
// FLOW:
//   edit page: updateIssue.bind(null, issue.id)  → a new function with `id` fixed
//   <IssueForm action={thatFunction}>            → useActionState wraps it
//   submit → React POSTs the FormData            → Next.js calls:
//     updateIssue(id, prevState, formData)
//       ↑ bound  ↑ from useActionState  ↑ from the <form>
//
// STATUS: DONE = happy flow only (valid input, issue exists, DB is up).
//         TODO(you) = every check. Same order as createIssue above.
// =============================================================================

/** Validates the edit-issue form and saves the changes. */
export async function updateIssue(
  // DONE: the bound argument comes FIRST, before useActionState's two.
  //   It is the UUID (issues.id), the real primary key.
  // Interviewer asks: "Is a bound id safe? The user can't see it."
  // You answer: "No. The id is serialized into the page and sent back with
  //   the POST. Anyone can replay the action with another id. The server
  //   must check auth, and that the row exists, every time."
  id: string,
  _prevState: IssueFormState,
  formData: FormData,
): Promise<IssueFormState> {
  // TODO(you) SECURITY — do this one first: `await requireUser();`
  //   A Server Action is a public POST endpoint. Anyone can call it directly,
  //   without the page. Without this line, a signed-out visitor can edit
  //   issues. createIssue has the same line at the top.

  // DONE: FormData → plain strings. Same helper and field list as createIssue.
  const values = readForm(formData, ISSUE_FIELDS);

  // DONE (happy flow): .parse() returns the clean data, or THROWS on bad input.
  //   A throw here shows the error page. Fine for the happy flow only.
  // TODO(you) validation: switch to safeParse, exactly like createIssue:
  //     const result = IssueSchema.safeParse(values);
  //     if (!result.success) {
  //       return { errors: flattenError(result.error).fieldErrors, values };
  //     }
  //   Returning `values` refills the form, so the user keeps what they typed.
  const data = IssueSchema.parse(values);

  // DONE: UPDATE issues SET ... WHERE id = $1 RETURNING number
  //   - `description: data.description ?? null`
  //     IssueSchema turns an empty description into `undefined`. Drizzle
  //     SKIPS undefined keys in .set(). So clearing the textarea would
  //     silently keep the old text. `?? null` writes NULL instead.
  //     (createIssue doesn't need this: on INSERT, a missing value is NULL.)
  //   - `updatedAt: new Date()`
  //     The schema only has defaultNow() (set on INSERT). Nothing updates it
  //     on UPDATE, so the action must set it.
  //   - `.returning({ number })`
  //     The redirect needs the issue NUMBER for the URL, but we only have the
  //     UUID. RETURNING gets it in the same query (no second SELECT).
  // TODO(you) error handling: wrap it in try/catch like createIssue. On error,
  //   console.error it and return { message: "Could not save the issue. Try again.", values }.
  //   Keep redirect() OUTSIDE the try (it throws NEXT_REDIRECT).
  const [updated] = await db
    .update(issues)
    .set({
      ...data,
      description: data.description ?? null,
      updatedAt: new Date(),
    })
    .where(eq(issues.id, id))
    .returning({ number: issues.number });

  // TODO(you) missing row: if `updated` is undefined, no row matched the id
  //   (deleted in another tab, or a forged id). Call notFound() (import it
  //   from "next/navigation"), or return { message: "This issue no longer exists." }.
  //   After the check, delete the `!` below.

  // DONE: clear the cached pages that show this issue:
  //   - /issues            → the list (title, status, priority)
  //   - /issues/<number>   → the detail page
  //   - /                  → the dashboard (dash-02 will show issue counts)
  revalidatePath("/issues");
  revalidatePath(`/issues/${updated!.number}`);
  revalidatePath("/");

  // DONE: back to the detail page, which now shows the new values.
  redirect(`/issues/${updated!.number}`);
}
