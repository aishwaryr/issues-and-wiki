"use client";

import { useActionState } from "react";
import Link from "next/link";

import type { WikiPageFormState } from "@/app/actions/wiki";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** Type: props for WikiPageForm — which action to call, and what differs between new and edit. */
type WikiPageFormProps = {
  action: (
    state: WikiPageFormState,
    formData: FormData,
  ) => Promise<WikiPageFormState>;
  initialValues?: WikiPageFormState["values"];
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
};

/** The wiki page form (title + markdown body), shared by the new and edit pages. */
export function WikiPageForm({
  action,
  initialValues,
  submitLabel,
  pendingLabel,
  cancelHref,
}: WikiPageFormProps) {
  const [state, formAction, pending] = useActionState(action, {
    values: initialValues,
  });

  return (
    <form className="space-y-6" action={formAction}>
      {state.message && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          name="title"
          id="title"
          required
          maxLength={180}
          autoFocus
          placeholder="Getting started"
          defaultValue={state.values?.title}
          aria-invalid={!!state.errors?.title}
          aria-describedby={state.errors?.title ? "title-error" : undefined}
        />
        {state.errors?.title && (
          <p id="title-error" role="alert" className="text-sm text-destructive">
            {state.errors.title[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Content</Label>
        <Textarea
          name="body"
          id="body"
          rows={18}
          maxLength={50_000}
          placeholder={
            "## Heading\n\nWrite in markdown: **bold**, lists, `code`, [links](/wiki)."
          }
          defaultValue={state.values?.body}
          className="font-mono text-sm"
          aria-invalid={!!state.errors?.body}
          aria-describedby={state.errors?.body ? "body-error" : "body-hint"}
        />
        {state.errors?.body ? (
          <p id="body-error" role="alert" className="text-sm text-destructive">
            {state.errors.body[0]}
          </p>
        ) : (
          <p id="body-hint" className="text-sm text-muted-foreground">
            Markdown is supported. HTML is shown as plain text.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
