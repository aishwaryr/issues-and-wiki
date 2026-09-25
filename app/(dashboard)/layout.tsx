import type { ReactNode } from "react";

import { Navbar } from "@/components/navbar";
import { requireUser } from "@/lib/dal";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireUser();
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </>
  );
}
