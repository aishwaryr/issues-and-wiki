import { expectPath, newAccount, signUp } from "../support/auth";

describe("sign-up", () => {
  it("creates an account and lands on the dashboard", () => {
    signUp(newAccount());

    expectPath("/");
  });
});
