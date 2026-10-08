import type { Metadata } from "next";

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
        <IssueForm />
      </CardContent>
    </Card>
  );
}
