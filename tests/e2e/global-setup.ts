import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

import testUsers from "../../cypress/fixtures/users.json";

// Upserts the fixture accounts once per run, so sign-in specs never sign up first.
// Cost 4 keeps it fast; bcrypt.compare reads the cost from the hash.
export default async function globalSetup() {
  loadEnvConfig(process.cwd());
  const sql = neon(process.env.DATABASE_URL!);

  for (const user of testUsers) {
    const passwordHash = await bcrypt.hash(user.password, 4);
    await sql`
      insert into users (name, email, password_hash)
      values (${user.name}, ${user.email}, ${passwordHash})
      on conflict (email) do update
        set name = excluded.name, password_hash = excluded.password_hash`;
  }
}
