import users from "../fixtures/users.json";

export type TestUser = { name: string; email: string; password: string };

// Seeded by the seedTestUsers task — use these for anything that needs an account.
export const [alice, bob, carol]: TestUser[] = users;

// First request to a route compiles it in dev, which can take several seconds.
export const REDIRECT_TIMEOUT = 20_000;

export function expectPath(pathname: string) {
  cy.location("pathname", { timeout: REDIRECT_TIMEOUT }).should("eq", pathname);
}

export function signIn({ email, password }: TestUser) {
  cy.visit("/signin");
  cy.get("#email").type(email);
  cy.get("#password").type(password);
  cy.contains("button", "Sign in").click();
}

// Only for the sign-up spec. base36 timestamp: short and unique per run; the name shows
// its last 4 chars, so "E2E User k9x2" lines up with e2e+mf3k9x2@example.com.
export function newAccount(): TestUser {
  const id = Date.now().toString(36);
  return {
    name: `E2E User ${id.slice(-4)}`,
    email: `e2e+${id}@example.com`,
    password: "hunter2hunter2",
  };
}

export function signUp({ name, email, password }: TestUser) {
  cy.visit("/signup");
  cy.get("#name").type(name);
  cy.get("#email").type(email);
  cy.get("#password").type(password);
  cy.contains("button", "Sign up").click();
}
