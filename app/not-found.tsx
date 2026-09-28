import Link from "next/link";

import { Button } from "@/components/ui/button";

// Rendered for unknown URLs and whenever a page calls notFound().
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or was removed.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Back to dashboard</Link>
      </Button>
    </main>
  );
}
