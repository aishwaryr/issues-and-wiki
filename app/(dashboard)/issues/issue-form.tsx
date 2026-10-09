"use client";

import { useActionState } from "react";
import Link from "next/link";

import { createIssue, type CreateIssueState } from "@/app/actions/issues";
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
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/lib/issues";

const initialState: CreateIssueState = {};

export function IssueForm() {
  const [state, formAction, pending] = useActionState(
    createIssue,
    initialState,
  );

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
          placeholder="Enter title"
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
          <Select name="status" defaultValue="backlog">
            <SelectTrigger
              id="status"
              className="w-full"
              aria-invalid={!!state.errors?.status}
              aria-describedby={
                state.errors?.status ? "status-error" : undefined
              }
            >
              <SelectValue />
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
          <Select name="priority" defaultValue="none">
            <SelectTrigger
              id="priority"
              className="w-full"
              aria-invalid={!!state.errors?.priority}
              aria-describedby={
                state.errors?.priority ? "priority-error" : undefined
              }
            >
              <SelectValue />
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

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/issues">Cancel</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create issue"}
        </Button>
      </div>
    </form>
  );
}
