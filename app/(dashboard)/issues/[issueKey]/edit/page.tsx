import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

import { updateIssue } from "@/app/actions/issues";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getIssueByKey } from "@/lib/dal";
import { formatIssueKey } from "@/lib/issues";

import { IssueForm } from "../../issue-form";

export async function generateMetadata({
  params,
}: PageProps<"/issues/[issueKey]/edit">): Promise<Metadata> {
  const { issueKey } = await params;
  const issue = await getIssueByKey(issueKey);
  if (issue === null) {
    notFound();
  }
  return { title: `Edit ${formatIssueKey(issue.number)}` };
}

export default async function EditIssuePage({
  params,
}: PageProps<"/issues/[issueKey]/edit">) {
  const { issueKey } = await params;

  const issue = await getIssueByKey(issueKey);
  if (issue === null) {
    notFound();
  }
  if (issueKey !== formatIssueKey(issue.number)) {
    redirect(`/issues/${formatIssueKey(issue.number)}/edit`);
  }
  const updateIssueWithId = updateIssue.bind(null, issue.id);

  const initialValues = {
    title: issue.title,
    description: issue.description ?? "",
    status: issue.status,
    priority: issue.priority,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        href={`/issues/${issueKey}`}
        className="inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← {issueKey}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>
            <h1>Edit {issueKey}</h1>
          </CardTitle>
          <CardDescription>
            Change the title, description, status or priority.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <IssueForm
            action={updateIssueWithId}
            initialValues={initialValues}
            submitLabel="Save changes"
            pendingLabel="Saving..."
            cancelHref={`/issues/${issueKey}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
