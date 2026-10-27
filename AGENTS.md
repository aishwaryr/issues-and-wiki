<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project

Issues + Wiki: a work-tracking and shared-documentation app, built while following lessons from [Next.js Fundamentals](https://github.com/Hendrixer/next.js-fundamentals/tree/main/lessons).

**Stack:** Next.js App Router (v16, webpack dev/build), React 19, TypeScript, Tailwind CSS v4, shadcn/ui (`new-york` style, `neutral` base, Lucide icons — see `components.json`), Drizzle ORM + Neon Postgres (`db/schema.ts`, `db/index.ts`).

**Current state:** auth, issues and wiki are done; the dashboard (`/`) and deploy are next.
- Auth: sign-up, sign-in and sign-out server actions in `app/actions/auth.ts`; database sessions in `lib/session.ts`, bcrypt in `lib/password.ts`, a server-only data access layer in `lib/dal.ts`.
- Issues: CRUD, URL filters, `ISS-n` keys and assign; actions in `app/actions/issues.ts`, schemas and key helpers in `lib/issues.ts`.
- Wiki: markdown pages at `/wiki/[slug]` (`components/markdown.tsx`, no raw HTML); slugs come from titles and never change (`lib/wiki.ts`); actions in `app/actions/wiki.ts`. Issues ↔ pages links live in a join table; link/unlink actions are in `app/actions/issues.ts`.
- Routes: `app/(auth)` is public and redirects signed-in users to `/`; `app/(dashboard)` is guarded and renders the navbar. `/` is a placeholder dashboard.
- Schema: `users`, `issues`, `sessions`, `wiki_pages`, `issue_wiki_links`, with migrations in `drizzle/`. `DATABASE_URL` in `.env.local` is required — every page reads the session.

**Commands:** `npm run dev` / `build` / `start` / `lint`; `npm run db:generate` / `db:migrate` / `db:push` / `db:studio` (Drizzle Kit); `npm run pw:run` (all Playwright e2e in `tests/e2e/`, against a fresh production build on :3100) or `npx playwright test tests/e2e/<feature>.spec.ts` for one feature. Playwright is the only e2e suite. Node 24 via `.nvmrc`.

**Conventions:** use the `@/components`, `@/components/ui`, `@/lib` path aliases from `components.json`; add new UI primitives via the shadcn CLI to stay consistent with the `new-york` style already in use.

## Feature layers

Every feature is built in the same six layers. "Layer N" in a request means this list. Build a new feature bottom up, one layer at a time.

1. **Schema:** `db/schema.ts` (shared). Tables, columns and pg enums; the source of the TS row types. Change it, then `npm run db:generate` for a migration.
2. **DAL:** `lib/dal.ts` (shared, `import "server-only"`). Reads only. Every query calls `requireUser()` first; one-row reads are wrapped in React `cache()`.
3. **Rules:** `lib/<feature>.ts`. Enum values and union types, Zod schemas (`<X>FormSchema`, `<X>FiltersSchema`), key/slug helpers. No database calls. The form state type and field list belong here too; issues and wiki still keep `<X>FormState` in their actions file.
4. **Actions:** `app/actions/<feature>.ts`. Only `"use server"` async functions: `requireUser()` → `safeParse` → write in `try/catch` → `revalidatePath` → `redirect` (outside the `try`). Create/update return `<X>FormState`; delete/assign/link return `void` and throw on failure.
5. **Pages:** `app/(dashboard)/<feature>/**/page.tsx`. Async Server Components: await the DAL, type props with `PageProps<"/route">`, call `notFound()` for bad params, bind actions with `.bind(null, id)`.
6. **Forms (client):** `app/(dashboard)/<feature>/<feature>-form.tsx` and small client buttons next to their page. `"use client"` + `useActionState`. The only layer that runs in the browser.

Read path: 5 → 2 → DB. Write path: 6 → 4 (→ 3 for validation) → DB → revalidate → 5.

## Git commit and push approval workflow

For every future request to commit or push code:
1. Inspect the repository status, current branch, remotes, staged changes, unstaged changes, and untracked files before staging anything.
2. Review every proposed commit file for secrets, credentials, private data, generated output, dependencies, caches, logs, and unrelated files that should not be published.
3. Review .gitignore and verify that appropriate files are ignored. Check tracked files too, since ignore rules do not exclude files already tracked. Propose any necessary corrections for review.
4. Show the user a concrete summary of the proposed commit, exclusions, relevant validation results, the exact commit message, and the destination repository and branch. Disclose any pending file corrections.
5. Ask for explicit confirmation. A request to push starts this review; it is not approval to stage, commit, or push. Wait for the user's yes before staging, committing, or pushing.
6. After approval, verify the files still match the reviewed scope, apply only approved corrections, stage only approved files, inspect the staged diff, commit with the approved message, and push only when approved. If material new changes appear, review them with the user again.
7. Report the resulting commit and push outcome. Never bypass this workflow or force-push without separate explicit authorization.

## Git preferences

- Use `master` as the default branch, unless the user explicitly requests another branch.
- Do not describe this project as a portfolio project in commit messages.
