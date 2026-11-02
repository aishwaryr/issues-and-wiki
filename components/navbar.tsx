import Link from "next/link";

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
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="rounded-md">
            <Brand />
          </Link>
          <NavLinks loggedIn={user !== null} />
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserAvatar name={user.name} />
              {user.name}
            </span>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                Log out
              </Button>
            </form>
          </div>
        )}
      </nav>
    </header>
  );
}
