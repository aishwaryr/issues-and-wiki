# Issues + Wiki

A project for work tracking and shared documentation, following selected lessons from [Next.js Fundamentals](https://github.com/Hendrixer/next.js-fundamentals/tree/main/lessons).

## Current state

- Email/password auth: sign-up, sign-in and sign-out, with database-backed sessions
- Signed-in pages are protected; the dashboard at `/` is a placeholder
- Issues and wiki modules are next

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

Specs live in `tests/e2e/`, one per feature. Playwright reuses the dev server on :3000 if it is running and starts one otherwise. It runs in the locally installed Google Chrome. Sign-in, logout and guard specs use the accounts in `cypress/fixtures/users.json`, which `tests/e2e/global-setup.ts` seeds before each run.

The older Cypress suite in `cypress/e2e/` is kept for reference but is no longer maintained; new specs go in Playwright.
