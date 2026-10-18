import users from "../fixtures/users.json";
import { sql } from "./db";

/** Type: a test wiki page as the UI sees it — its title, slug and URL. */
export type TestWikiPage = { title: string; slug: string; url: string };

/**
 * Inserts a wiki page straight into the database, authored by E2E Alice, so
 * specs for one feature don't depend on the create form. Same prefix rule as
 * insertIssue: each spec deletes only the rows with its own prefix.
 */
export async function insertWikiPage(
  titlePrefix: string,
  values: { body?: string } = {},
): Promise<TestWikiPage> {
  const title = `${titlePrefix} ${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  await sql`
    insert into wiki_pages (title, slug, body, author_id)
    values (${title}, ${slug}, ${values.body ?? ""},
      (select id from users where email = ${users[0].email}))`;
  return { title, slug, url: `/wiki/${slug}` };
}

/** Deletes every wiki page whose title starts with the prefix. */
export async function deleteWikiPages(titlePrefix: string) {
  await sql`delete from wiki_pages where title like ${`${titlePrefix}%`}`;
}
