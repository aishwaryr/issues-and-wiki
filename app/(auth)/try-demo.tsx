"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";

import { type DemoSignInState, signInAsDemo } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

const initialState: DemoSignInState = {};

/** Try Demo button + "or" divider, above the sign-in and sign-up forms. */
export function TryDemo() {
  const [state, formAction, pending] = useActionState(
    signInAsDemo,
    initialState,
  );

  return (
    <div className="mb-6 space-y-6">
      <form action={formAction} className="space-y-3">
        <p className="text-center font-medium text-balance">
          Explore Triagebook without signing up.
        </p>
        {state.message && (
          <p className="text-center text-sm text-destructive" role="alert">
            {state.message}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          className="h-11 w-full text-base"
          disabled={pending}
        >
          <Sparkles aria-hidden />
          {pending ? "Opening demo..." : "Try Demo"}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
