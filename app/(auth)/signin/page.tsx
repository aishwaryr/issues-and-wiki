import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>Welcome back</h1>
        </CardTitle>
        <CardDescription>Sign in to your account to continue.</CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              // for password managers to fill saved password
              autoComplete="current-password"
              required
            />
          </div>

          <Button className="w-full" type="button">
            Sign in
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              className="text-primary underline-offset-4 hover:underline font-medium"
              href="/signup"
            >
              Sign up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
