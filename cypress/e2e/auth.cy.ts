// Runs against the dev server and the dev database, so every run uses a fresh email.
const password = "hunter2hunter2";
const uniqueEmail = () => `e2e+${Date.now()}@example.com`;

// First request to a route compiles it in dev, which can take several seconds.
const REDIRECT_TIMEOUT = 20_000;

function signUp(email: string) {
  cy.visit("/signup");
  cy.get("#name").type("E2E User");
  cy.get("#email").type(email);
  cy.get("#password").type(password);
  cy.contains("button", "Sign up").click();
}

describe("auth happy paths", () => {
  it("signs up and lands on the home page", () => {
    signUp(uniqueEmail());

    cy.location("pathname", { timeout: REDIRECT_TIMEOUT }).should("eq", "/");
  });

  it("signs in with an existing account and lands on the home page", () => {
    const email = uniqueEmail();
    signUp(email);
    cy.location("pathname", { timeout: REDIRECT_TIMEOUT }).should("eq", "/");

    cy.clearCookies();

    cy.visit("/signin");
    cy.get("#email").type(email);
    cy.get("#password").type(password);
    cy.contains("button", "Sign in").click();

    cy.location("pathname", { timeout: REDIRECT_TIMEOUT }).should("eq", "/");
  });
});
