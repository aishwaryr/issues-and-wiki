import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
