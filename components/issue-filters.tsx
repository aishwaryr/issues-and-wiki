"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/lib/issues";

const selectClassName =
  "h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function IssueFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") ?? "";
  const priority = searchParams.get("priority") ?? "";
  const hasFilters = status.length > 0 || priority.length > 0;

  function updateFilter(key: "status" | "priority", value: string) {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value === "") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    const newQuery = newParams.toString();
    if (newQuery !== "") {
      router.replace(`${pathname}?${newQuery}`);
    } else {
      router.replace(pathname);
    }
  }

  return (
    // Selects are uncontrolled (defaultValue); keying on the URL remounts them
    // whenever it changes, so Reset and back/forward show the current filters.
    <div
      key={searchParams.toString()}
      className="flex flex-wrap items-end gap-3"
    >
      <div className="grid gap-1.5">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          defaultValue={status}
          onChange={(e) => updateFilter("status", e.target.value)}
          className={selectClassName}
        >
          <option value="">All</option>
          {STATUS_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="priority">Priority</Label>
        <select
          id="priority"
          defaultValue={priority}
          onChange={(e) => updateFilter("priority", e.target.value)}
          className={selectClassName}
        >
          <option value="">All</option>
          {PRIORITY_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <Button
          onClick={() => {
            router.replace(pathname);
          }}
          variant="ghost"
        >
          Reset
        </Button>
      )}
    </div>
  );
}
