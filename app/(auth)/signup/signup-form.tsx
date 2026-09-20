"use client";

import Link from "next/link";

import { useActionState, useEffect, useRef } from "react";
import { signUp, type SignUpState } from "@/app/actions/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: SignUpState = {};

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // after a failed submit, move focus to the first field that errored
  useEffect(() => {
    const firstInvalid = state.errors && Object.keys(state.errors)[0];
    if (!firstInvalid) return;
    formRef.current
      ?.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)
      ?.focus();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {state.message && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          autoFocus
          maxLength={120}
          defaultValue={state.values?.name}
          aria-invalid={!!state.errors?.name}
          aria-describedby={state.errors?.name ? "name-error" : undefined}
        />
        {state.errors?.name && (
          <p id="name-error" role="alert" className="text-sm text-destructive">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          maxLength={255}
          defaultValue={state.values?.email}
          aria-invalid={!!state.errors?.email}
          aria-describedby={state.errors?.email ? "email-error" : undefined}
        />
        {state.errors?.email && (
          <p className="text-sm text-destructive" role="alert" id="email-error">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          // for password managers to suggest new password
          autoComplete="new-password"
          required
          minLength={8}
          aria-invalid={!!state.errors?.password}
          aria-describedby={
            state.errors?.password ? "password-error" : undefined
          }
        />
        {state.errors?.password && (
          <p
            className="text-sm text-destructive"
            role="alert"
            id="password-error"
          >
            {state.errors.password[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          aria-invalid={!!state.errors?.confirmPassword}
          aria-describedby={
            state.errors?.confirmPassword ? "confirmPassword-error" : undefined
          }
        />
        {state.errors?.confirmPassword && (
          <p
            className="text-sm text-destructive"
            role="alert"
            id="confirmPassword-error"
          >
            {state.errors.confirmPassword[0]}
          </p>
        )}
      </div>

      <Button className="w-full" type="submit" disabled={pending}>
        {pending ? "Creating account..." : "Sign up"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          className="text-primary underline-offset-4 hover:underline font-medium"
          href="/signin"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
