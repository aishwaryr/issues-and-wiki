import type { Metadata } from "next";

import { createIssue } from "@/app/actions/issues";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { IssueForm } from "../issue-form";

export const metadata: Metadata = { title: "New issue" };

export default function NewIssuePage() {
  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>
          <h1>New issue</h1>
        </CardTitle>
        <CardDescription>Track a bug, task or idea.</CardDescription>
      </CardHeader>

      <CardContent>
        {/* DONE issu-04: IssueForm is shared now. This page passes what used
            to be hard-coded inside it. Same text as before, so the
            create-issue e2e spec still matches "Create issue". */}
        <IssueForm
          action={createIssue}
          submitLabel="Create issue"
          pendingLabel="Creating..."
          cancelHref="/issues"
        />
      </CardContent>
    </Card>
  );
}
