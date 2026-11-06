"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";

import { PriorityIcon, StatusIcon } from "@/components/issue-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFocusFirstError } from "@/components/use-focus-first-error";
import {
  type AssigneeOption,
  type IssueFormState,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  UNASSIGNED,
} from "@/lib/issues";

/** Type: props for IssueForm — which action to call, and what differs between new and edit. */
type IssueFormProps = {
  action: (
    state: IssueFormState,
    formData: FormData,
  ) => Promise<IssueFormState>;
  initialValues?: IssueFormState["values"];
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
  users: AssigneeOption[];
};

/** The issue form, shared by the new and edit pages. */
export function IssueForm({
  action,
  initialValues,
  submitLabel,
  pendingLabel,
  cancelHref,
  users,
}: IssueFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(action, {
    values: initialValues,
  });
  useFocusFirstError(formRef, state);

  // Radix fills <SelectValue /> only after hydration, so the server HTML showed empty
  // selects. These mirror each select's value so its label renders on the server too.
  const [status, setStatus] = useState(initialValues?.status ?? "backlog");
  const [priority, setPriority] = useState(initialValues?.priority ?? "none");
  const [assigneeId, setAssigneeId] = useState(
    initialValues?.assigneeId || UNASSIGNED,
  );
  const statusOption = STATUS_OPTIONS.find((st) => st.value === status);
  const priorityOption = PRIORITY_OPTIONS.find((pr) => pr.value === priority);
  const assignee = users.find((user) => user.id === assigneeId);

  return (
    <form className="space-y-6" action={formAction} ref={formRef}>
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
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          name="title"
          id="title"
          required
          maxLength={180}
          autoFocus
          placeholder="Enter title"
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
        <Label htmlFor="description">Description</Label>
        <Textarea
          name="description"
          id="description"
          rows={6}
          maxLength={10_000}
          placeholder="Describe your issue"
          defaultValue={state.values?.description}
          aria-invalid={!!state.errors?.description}
          aria-describedby={
            state.errors?.description ? "description-error" : undefined
          }
        />
        {state.errors?.description && (
          <p
            id="description-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {state.errors.description[0]}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            key={state.values?.status}
            name="status"
            defaultValue={state.values?.status ?? "backlog"}
            onValueChange={setStatus}
          >
            <SelectTrigger
              id="status"
              className="w-full"
              aria-invalid={!!state.errors?.status}
              aria-describedby={
                state.errors?.status ? "status-error" : undefined
              }
            >
              <SelectValue>
                {statusOption && (
                  <>
                    <StatusIcon status={statusOption.value} aria-hidden />
                    {statusOption.label}
                  </>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((st) => (
                <SelectItem key={st.value} value={st.value}>
                  <StatusIcon status={st.value} aria-hidden />
                  {st.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.status && (
            <p
              id="status-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {state.errors.status[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            key={state.values?.priority}
            name="priority"
            defaultValue={state.values?.priority ?? "none"}
            onValueChange={setPriority}
          >
            <SelectTrigger
              id="priority"
              className="w-full"
              aria-invalid={!!state.errors?.priority}
              aria-describedby={
                state.errors?.priority ? "priority-error" : undefined
              }
            >
              <SelectValue>
                {priorityOption && (
                  <>
                    <PriorityIcon priority={priorityOption.value} aria-hidden />
                    {priorityOption.label}
                  </>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((pr) => (
                <SelectItem key={pr.value} value={pr.value}>
                  <PriorityIcon priority={pr.value} aria-hidden />
                  {pr.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.priority && (
            <p
              id="priority-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {state.errors.priority[0]}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assigneeId">Assignee</Label>
        <Select
          key={state.values?.assigneeId}
          name="assigneeId"
          defaultValue={state.values?.assigneeId || UNASSIGNED}
          onValueChange={setAssigneeId}
        >
          <SelectTrigger
            id="assigneeId"
            className="w-full"
            aria-invalid={!!state.errors?.assigneeId}
            aria-describedby={
              state.errors?.assigneeId ? "assigneeId-error" : undefined
            }
          >
            <SelectValue>{assignee?.name ?? "Unassigned"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
                <span className="text-muted-foreground">{user.email}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.errors?.assigneeId && (
          <p
            id="assigneeId-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {state.errors.assigneeId[0]}
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
