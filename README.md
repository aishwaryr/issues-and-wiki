# Issues + Wiki

A project for work tracking and shared documentation, following selected lessons from [Next.js Fundamentals](https://github.com/Hendrixer/next.js-fundamentals/tree/main/lessons).

## Current state

- Email/password auth: sign-up, sign-in and sign-out, with database-backed sessions
- Signed-in pages are protected; the dashboard at `/` is a placeholder
- Issues: create, list, filter by status and priority, view, edit, assign to yourself, delete. Each issue has a readable key and URL (`/issues/ISS-12`)
- Wiki: markdown pages with readable URLs (`/wiki/getting-started`): create, list, view, edit, delete. Raw HTML in a page is shown as text, never run
- Issues and wiki pages link to each other: an issue lists its pages, a page lists its issues

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Drizzle ORM, Neon Postgres, zod, Playwright.

## Run locally

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to a Postgres connection string (Neon works).
2. Install, run the migrations, start the dev server:

```bash
npm install
npm run db:migrate
npm run dev
```

Open http://localhost:3000. Node 24 is pinned in `.nvmrc`.

## Checks

```bash
npm run lint
npm run pw:run   # all end-to-end tests (Playwright)
npx playwright test tests/e2e/signin.spec.ts   # one feature
```

Specs live in `tests/e2e/`, one per feature. Playwright builds the app and runs it with `next start` on :3100 for each run, so the dev server on :3000 can keep running. The HTML report opens with `npx playwright show-report`. It runs in the locally installed Google Chrome. Sign-in, logout and guard specs use the accounts in `tests/e2e/fixtures/users.json`, which `tests/e2e/global-setup.ts` seeds before each run.
