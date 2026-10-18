"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { flattenError } from "zod";

import { db } from "@/db";
import { wikiPages } from "@/db/schema";
import { requireUser } from "@/lib/dal";
import { readForm } from "@/lib/form-data";
import {
  slugCandidate,
  slugify,
  WikiPageSchema,
  type WikiPageInput,
} from "@/lib/wiki";

const WIKI_PAGE_FIELDS = ["title", "body"] as const;

/** How many slugs (`x`, `x-2` … `x-20`) createWikiPage tries before giving up. */
const MAX_SLUG_ATTEMPTS = 20;

type WikiPageField = keyof WikiPageInput;

/** Type: create/update wiki page result for useActionState — errors, plus raw values to refill the form. */
export type WikiPageFormState = {
  errors?: Partial<Record<WikiPageField, string[]>>;
  message?: string;
  values?: Record<WikiPageField, string>;
};

// Create

/** Validates the new-page form, creates the page under a free slug, and opens it. */
export async function createWikiPage(
  _prevState: WikiPageFormState,
  formData: FormData,
): Promise<WikiPageFormState> {
  const user = await requireUser();

  const values = readForm(formData, WIKI_PAGE_FIELDS);
  const result = WikiPageSchema.safeParse(values);
  if (!result.success) {
    return { errors: flattenError(result.error).fieldErrors, values };
  }

  // The unique constraint picks the slug, not a "does it exist?" query first: two
  // requests with the same title can't both pass a check and then collide.
  // A conflict on the slug returns no row, so the loop tries the next suffix.
  const base = slugify(result.data.title);
  let created: { slug: string } | undefined;
  try {
    for (let attempt = 1; !created && attempt <= MAX_SLUG_ATTEMPTS; attempt++) {
      [created] = await db
        .insert(wikiPages)
        .values({
          ...result.data,
          slug: slugCandidate(base, attempt),
          authorId: user.id,
        })
        .onConflictDoNothing({ target: wikiPages.slug })
        .returning({ slug: wikiPages.slug });
    }
  } catch (error) {
    console.error("createWikiPage failed", error);
    return { message: "Could not create the page. Try again.", values };
  }

  if (!created) {
    return {
      message: "Too many pages share this title. Choose another one.",
      values,
    };
  }

  revalidatePath("/wiki");
  redirect(`/wiki/${created.slug}`);
}

// Update

/** Validates the edit-page form and saves it. The slug stays the same, so links keep working. */
export async function updateWikiPage(
  id: string,
  _prevState: WikiPageFormState,
  formData: FormData,
): Promise<WikiPageFormState> {
  await requireUser();

  const values = readForm(formData, WIKI_PAGE_FIELDS);
  const result = WikiPageSchema.safeParse(values);
  if (!result.success) {
    return { errors: flattenError(result.error).fieldErrors, values };
  }

  let updated: { slug: string } | undefined;
  try {
    [updated] = await db
      .update(wikiPages)
      .set({ ...result.data, updatedAt: new Date() })
      .where(eq(wikiPages.id, id))
      .returning({ slug: wikiPages.slug });
  } catch (error) {
    console.error("updateWikiPage failed", error);
    return { message: "Could not save the page. Try again.", values };
  }

  if (!updated) {
    return { message: "This page no longer exists.", values };
  }

  revalidatePath("/wiki");
  revalidatePath(`/wiki/${updated.slug}`);
  redirect(`/wiki/${updated.slug}`);
}

// Delete

/** Deletes a wiki page and returns to the list. */
export async function deleteWikiPage(id: string): Promise<void> {
  await requireUser();

  try {
    await db.delete(wikiPages).where(eq(wikiPages.id, id));
  } catch (error) {
    console.error("deleteWikiPage failed", error);
    throw new Error("Could not delete the page. Try again.");
  }

  revalidatePath("/wiki");
  redirect("/wiki");
}
