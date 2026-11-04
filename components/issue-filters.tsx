"use client";

import { type ReactNode, useState } from "react";
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
import { PriorityIcon, StatusIcon } from "@/components/issue-icons";
import {
  IssueFiltersSchema,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/issues";

// Radix Select doesn't allow "" as an item value, so "All" uses a sentinel
// that updateFilter turns into "remove this key from the URL".
const ALL = "all";

/** Type: one choice in a filter select, with an optional icon before the label. */
type FilterOption = { value: string; label: string; icon?: ReactNode };

const STATUS_FILTER_OPTIONS: FilterOption[] = STATUS_OPTIONS.map(
  ({ value, label }) => ({
    value,
    label,
    // aria-hidden: the text label already names the option
    icon: <StatusIcon status={value} aria-hidden />,
  }),
);

const PRIORITY_FILTER_OPTIONS: FilterOption[] = PRIORITY_OPTIONS.map(
  ({ value, label }) => ({
    value,
    label,
    icon: <PriorityIcon priority={value} aria-hidden />,
  }),
);

export function IssueFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Same parse as the page, so an invalid value (?status=banana) shows "All", like the list.
  const { status, priority } = IssueFiltersSchema.parse({
    status: searchParams.get("status") ?? undefined,
    priority: searchParams.get("priority") ?? undefined,
  });
  const hasFilters = status !== undefined || priority !== undefined;

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
      <FilterSelect
        id="status"
        label="Status"
        value={status ?? ALL}
        options={STATUS_FILTER_OPTIONS}
        onChange={(value) => updateFilter("status", value)}
      />
      <FilterSelect
        id="priority"
        label="Priority"
        value={priority ?? ALL}
        options={PRIORITY_FILTER_OPTIONS}
        onChange={(value) => updateFilter("priority", value)}
      />

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

/** One filter select, with "All" first. */
function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  // Mirrors the select's value so the trigger's label is in the server HTML
  // (Radix fills <SelectValue /> only after hydration).
  const [selected, setSelected] = useState(value);
  const option = options.find((opt) => opt.value === selected);

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select
        defaultValue={value}
        onValueChange={(next) => {
          setSelected(next);
          onChange(next);
        }}
      >
        <SelectTrigger id={id} className="w-36">
          <SelectValue>
            {option ? (
              <>
                {option.icon}
                {option.label}
              </>
            ) : (
              "All"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.icon}
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
