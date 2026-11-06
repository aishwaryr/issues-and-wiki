"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFocusFirstError } from "@/components/use-focus-first-error";
import type { CommentFormState } from "@/lib/comments";

/** New-comment form under the comment list; it clears after a successful post. */
export function CommentForm({
  action,
}: {
  action: (
    state: CommentFormState,
    formData: FormData,
  ) => Promise<CommentFormState>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(action, {});
  useFocusFirstError(formRef, state);

  return (
    <form action={formAction} className="space-y-2" ref={formRef}>
      {/* Composer: the textarea and its button share one bordered box, like Linear. */}
      <div className="rounded-lg border bg-card shadow-xs transition-shadow focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/20">
        <Label htmlFor="body" className="sr-only">
          Add a comment
        </Label>
        <Textarea
          id="body"
          name="body"
          rows={3}
          required
          placeholder="Leave a comment…"
          defaultValue={state.values?.body}
          aria-invalid={!!state.errors?.body}
          aria-describedby={state.errors?.body ? "body-error" : undefined}
          className="min-h-20 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        <div className="flex justify-end px-2 pb-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Posting..." : "Comment"}
          </Button>
        </div>
      </div>
      {state.errors?.body && (
        <p id="body-error" role="alert" className="text-sm text-destructive">
          {state.errors.body[0]}
        </p>
      )}
      {state.message && (
        <p
          data-form-message
          tabIndex={-1}
          role="alert"
          className="text-sm text-destructive outline-none"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
