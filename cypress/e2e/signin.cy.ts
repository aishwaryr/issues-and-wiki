import { alice, expectPath, signIn } from "../support/auth";

describe("sign-in", () => {
  before(() => {
    cy.task("seedTestUsers");
  });

  it("signs in an existing account and lands on the dashboard", () => {
    signIn(alice);

    expectPath("/");
  });
});
