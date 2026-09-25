import { defineConfig } from "cypress";
import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

import testUsers from "./cypress/fixtures/users.json";

loadEnvConfig(process.cwd());

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: false,
    setupNodeEvents(on) {
      on("task", {
        // Upserts the fixture accounts so sign-in specs never have to sign up first.
        // Cost 4 keeps it fast; bcrypt.compare reads the cost from the hash, so it
        // verifies exactly like the app's cost-12 hashes.
        async seedTestUsers() {
          const sql = neon(process.env.DATABASE_URL!);
          for (const user of testUsers) {
            const passwordHash = await bcrypt.hash(user.password, 4);
            await sql`
              insert into users (name, email, password_hash)
              values (${user.name}, ${user.email}, ${passwordHash})
              on conflict (email) do update
                set name = excluded.name, password_hash = excluded.password_hash`;
          }
          return null;
        },
      });
    },
  },
});
