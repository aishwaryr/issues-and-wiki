"use client";

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
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/lib/issues";

export function IssueForm() {
  return (
    // TODO(02-4): action={formAction} from useActionState(createIssue)
    <form className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          name="title"
          id="title"
          required
          maxLength={180}
          autoFocus
          placeholder="Enter title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          name="description"
          id="description"
          rows={6}
          placeholder="Describe your issue"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue="backlog">
            <SelectTrigger id="status" className="w-full">
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select name="priority" defaultValue="none">
            <SelectTrigger id="priority" className="w-full">
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
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/issues">Cancel</Link>
        </Button>
        <Button type="submit">Create issue</Button>
      </div>
    </form>
  );
}
