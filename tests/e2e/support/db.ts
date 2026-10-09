import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";

// Specs run outside Next, so .env.local has to be loaded by hand (same as global-setup.ts).
loadEnvConfig(process.cwd());

/** Raw SQL client for test setup and cleanup — never for assertions the UI can make. */
export const sql = neon(process.env.DATABASE_URL!);
