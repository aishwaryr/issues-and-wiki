import Link from "next/link";
import { LogOut } from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { getCurrentUser } from "@/lib/dal";
import { NavLinks } from "./nav-links";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      {/* Phones (< 640px): logo mark, avatar and a log-out icon only, so everything fits in one row at 320px. */}
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/" className="shrink-0 rounded-md">
            <Brand compact />
          </Link>
          <NavLinks loggedIn={user !== null} />
        </div>

        {user && (
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserAvatar name={user.name} />
              <span className="sr-only sm:not-sr-only">{user.name}</span>
            </span>
            <form action={signOut}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="px-2 sm:px-3"
              >
                <LogOut aria-hidden className="sm:hidden" />
                {/* sr-only on phones: the icon button keeps "Log out" as its name. */}
                <span className="sr-only sm:not-sr-only">Log out</span>
              </Button>
            </form>
          </div>
        )}
      </nav>
    </header>
  );
}
