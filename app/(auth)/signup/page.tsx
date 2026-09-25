import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SignUpForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Create an account",
};

export default function SignUpPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>Create an account</h1>
        </CardTitle>
        <CardDescription>Enter your details to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
    </Card>
  );
}
