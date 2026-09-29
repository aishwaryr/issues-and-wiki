"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/lib/issues";

// Radix Select doesn't allow "" as an item value, so "All" uses a sentinel
// that updateFilter turns into "remove this key from the URL".
const ALL = "all";

export function IssueFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") ?? "";
  const priority = searchParams.get("priority") ?? "";
  const hasFilters = status.length > 0 || priority.length > 0;

  function updateFilter(key: "status" | "priority", value: string) {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value === ALL) {
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
        <Select
          defaultValue={status || ALL}
          onValueChange={(value) => updateFilter("status", value)}
        >
          <SelectTrigger id="status" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All</SelectItem>
            {STATUS_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="priority">Priority</Label>
        <Select
          defaultValue={priority || ALL}
          onValueChange={(value) => updateFilter("priority", value)}
        >
          <SelectTrigger id="priority" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All</SelectItem>
            {PRIORITY_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
