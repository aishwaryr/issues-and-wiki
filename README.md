# Issues + Wiki

A project for work tracking and shared documentation, following selected lessons from [Next.js Fundamentals](https://github.com/Hendrixer/next.js-fundamentals/tree/main/lessons).

## Current state

- Default create-next-app home page
- Next.js App Router, React, TypeScript, and Tailwind CSS
- shadcn configuration and utility dependencies are present; the components folder is empty
- Database schema, migrations, and Drizzle/Neon configuration are scaffolded for later lessons
- Login, issue tracking, and wiki features are not implemented yet

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Checks

```bash
npm run lint
```

## Database

Database setup is deferred. The starter page does not require a database connection. `.env.example` contains only a placeholder connection string; it is not a working database configuration.
