import { bob, expectPath, signIn } from "../support/auth";

describe("route guards", () => {
  before(() => {
    cy.task("seedTestUsers");
  });

  it("sends signed-out visitors from / to /signin", () => {
    cy.visit("/");

    expectPath("/signin");
  });

  it("sends signed-in users away from /signin and /signup", () => {
    signIn(bob);
    expectPath("/");

    cy.visit("/signin");
    expectPath("/");

    cy.visit("/signup");
    expectPath("/");
  });
});
