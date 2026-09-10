<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project

Issues + Wiki: a work-tracking and shared-documentation app, built while following lessons from [Next.js Fundamentals](https://github.com/Hendrixer/next.js-fundamentals/tree/main/lessons).

**Stack:** Next.js App Router (v16, webpack dev/build), React 19, TypeScript, Tailwind CSS v4, shadcn/ui (`new-york` style, `neutral` base, Lucide icons — see `components.json`), Drizzle ORM + Neon Postgres (`db/schema.ts`, `db/index.ts`).

**Current state:** early scaffold, not a working app yet.
- `app/page.tsx` is still the default create-next-app homepage.
- `app/(auth)/signin` and `/signup` are stub pages with no real logic.
- No auth, issue tracking, or wiki features are implemented.
- The schema defines `users` and `issues` (with `issue_status`/`issue_priority` enums), but nothing reads/writes it yet. `DATABASE_URL` isn't required for `npm run dev`.

**Commands:** `npm run dev` / `build` / `start` / `lint`; `npm run db:generate` / `db:migrate` / `db:push` / `db:studio` (Drizzle Kit).

**Conventions:** use the `@/components`, `@/components/ui`, `@/lib` path aliases from `components.json`; add new UI primitives via the shadcn CLI to stay consistent with the `new-york` style already in use.

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
