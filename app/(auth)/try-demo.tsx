"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";

import { type DemoSignInState, signInAsDemo } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

const initialState: DemoSignInState = {};

/** "or" divider + Try Demo button, below the sign-in and sign-up forms. */
export function TryDemo() {
  const [state, formAction, pending] = useActionState(
    signInAsDemo,
    initialState,
  );

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={formAction} className="space-y-2">
        {state.message && (
          <p className="text-sm text-destructive" role="alert">
            {state.message}
          </p>
        )}
        <Button
          type="submit"
          variant="outline"
          size="lg"
          className="w-full"
          disabled={pending}
        >
          <Sparkles aria-hidden className="text-primary" />
          {pending ? "Opening demo..." : "Try Demo"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Explore Triagebook without signing up.
        </p>
      </form>
    </div>
  );
}
