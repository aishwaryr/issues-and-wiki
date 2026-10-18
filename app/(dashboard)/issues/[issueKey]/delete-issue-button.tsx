"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

/** Delete button for the issue detail page; asks for confirmation first. */
export function DeleteIssueButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Delete this issue? This can't be undone.")) {
          event.preventDefault();
        }
      }}
    >
      <SubmitButton />
    </form>
  );
}

/** Submit button that shows "Deleting..." while the form is pending. */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="destructive" size="sm" disabled={pending}>
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}
