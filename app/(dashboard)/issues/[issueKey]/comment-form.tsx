"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-2">
      <Label htmlFor="body">Add a comment</Label>
      <Textarea
        id="body"
        name="body"
        rows={3}
        required
        defaultValue={state.values?.body}
        aria-invalid={!!state.errors?.body}
        aria-describedby={state.errors?.body ? "body-error" : undefined}
      />
      {state.errors?.body && (
        <p id="body-error" role="alert" className="text-sm text-destructive">
          {state.errors.body[0]}
        </p>
      )}
      {state.message && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Posting..." : "Comment"}
        </Button>
      </div>
    </form>
  );
}
