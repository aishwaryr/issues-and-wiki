import { carol, expectPath, signIn } from "../support/auth";

describe("logout", () => {
  before(() => {
    cy.task("seedTestUsers");
  });

  it("logs out from the navbar and locks the dashboard again", () => {
    signIn(carol);
    expectPath("/");

    cy.contains("button", "Log out").click();
    expectPath("/signin");
    cy.getCookie("session").should("not.exist");

    cy.visit("/");
    expectPath("/signin");
  });
});
