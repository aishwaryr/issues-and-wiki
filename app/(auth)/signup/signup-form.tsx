"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { signUp, type SignUpState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

const initialState: SignUpState = {};

export function SignUpForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(signUp, initialState);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const firstInvalid = state.errors && Object.keys(state.errors)[0];
    if (!firstInvalid) return;

    formRef.current
      ?.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)
      ?.focus();
  }, [state]);

  return (
    <form action={formAction} className="space-y-6" ref={formRef}>
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
        <InputGroup>
          <InputGroupInput
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            // for password managers to suggest new password
            autoComplete="new-password"
            required
            minLength={8}
            aria-invalid={!!state.errors?.password}
            aria-describedby={
              state.errors?.password ? "password-error" : undefined
            }
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
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
