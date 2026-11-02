import type { Metadata } from "next";

import { createIssue } from "@/app/actions/issues";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listUsers } from "@/lib/dal";

import { IssueForm } from "../issue-form";

export const metadata: Metadata = { title: "New issue" };

export default async function NewIssuePage() {
  const users = await listUsers();
  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>
          <h1>New issue</h1>
        </CardTitle>
        <CardDescription>Track a bug, task or idea.</CardDescription>
      </CardHeader>

      <CardContent>
        <IssueForm
          action={createIssue}
          users={users}
          submitLabel="Create issue"
          pendingLabel="Creating..."
          cancelHref="/issues"
        />
      </CardContent>
    </Card>
  );
}
