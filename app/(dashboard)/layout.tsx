import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { Navbar } from "@/components/navbar";
import { getCurrentUser } from "@/lib/dal";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!(await getCurrentUser())) {
    redirect("/signin");
  }
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </>
  );
}
