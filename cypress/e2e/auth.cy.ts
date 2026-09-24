// Runs against the dev server and the dev database, so every run uses a fresh account.
const password = "hunter2hunter2";

// base36 timestamp: short, unique per run. Name shows its last 4 chars, so
// "E2E User k9x2" lines up with e2e+mf3k9x2@example.com in the users table.
function newAccount() {
  const id = Date.now().toString(36);
  return { name: `E2E User ${id.slice(-4)}`, email: `e2e+${id}@example.com` };
}

// First request to a route compiles it in dev, which can take several seconds.
const REDIRECT_TIMEOUT = 20_000;

function signUp({ name, email }: { name: string; email: string }) {
  cy.visit("/signup");
  cy.get("#name").type(name);
  cy.get("#email").type(email);
  cy.get("#password").type(password);
  cy.contains("button", "Sign up").click();
}

describe("auth happy paths", () => {
  it("signs up and lands on the home page", () => {
    signUp(newAccount());

    cy.location("pathname", { timeout: REDIRECT_TIMEOUT }).should("eq", "/");
  });

  it("signs in with an existing account and lands on the home page", () => {
    const account = newAccount();
    const { email } = account;
    signUp(account);
    cy.location("pathname", { timeout: REDIRECT_TIMEOUT }).should("eq", "/");

    cy.clearCookies();

    cy.visit("/signin");
    cy.get("#email").type(email);
    cy.get("#password").type(password);
    cy.contains("button", "Sign in").click();

    cy.location("pathname", { timeout: REDIRECT_TIMEOUT }).should("eq", "/");
  });
});

describe("route guards", () => {
  it("sends signed-out visitors from / to /signin", () => {
    cy.visit("/");

    cy.location("pathname", { timeout: REDIRECT_TIMEOUT }).should(
      "eq",
      "/signin",
    );
  });

  it("sends signed-in users away from /signin and /signup", () => {
    signUp(newAccount());
    cy.location("pathname", { timeout: REDIRECT_TIMEOUT }).should("eq", "/");

    cy.visit("/signin");
    cy.location("pathname", { timeout: REDIRECT_TIMEOUT }).should("eq", "/");

    cy.visit("/signup");
    cy.location("pathname", { timeout: REDIRECT_TIMEOUT }).should("eq", "/");
  });
});

describe("logout", () => {
  it("logs out from the navbar and locks the dashboard again", () => {
    signUp(newAccount());
    cy.location("pathname", { timeout: REDIRECT_TIMEOUT }).should("eq", "/");

    cy.contains("button", "Log out").click();
    cy.location("pathname", { timeout: REDIRECT_TIMEOUT }).should(
      "eq",
      "/signin",
    );
    cy.getCookie("session").should("not.exist");

    cy.visit("/");
    cy.location("pathname", { timeout: REDIRECT_TIMEOUT }).should(
      "eq",
      "/signin",
    );
  });
});
