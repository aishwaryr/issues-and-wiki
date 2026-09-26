import Link from "next/link";
import { LayoutList } from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/dal";
import { NavLinks } from "./nav-links";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <LayoutList className="size-5" />
            Issues + Wiki
          </Link>
          <NavLinks loggedIn={user !== null} />
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                Log out
              </Button>
            </form>
          </div>
        )}
      </nav>
    </header>
  );
}
