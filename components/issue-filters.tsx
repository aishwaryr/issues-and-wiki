"use client";

import {
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ASSIGNEE_ME,
  type AssigneeOption,
  IssueFiltersSchema,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  UNASSIGNED,
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

/** Type: a URL key the filter bar writes. */
type FilterKey = "status" | "priority" | "assignee" | "q";

/** Status, priority and assignee selects plus a search box; all state lives in the URL. */
export function IssueFilters({ users }: { users: AssigneeOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // The search box is uncontrolled; Reset empties it through this ref.
  const searchInput = useRef<HTMLInputElement>(null);

  // Same parse as the page, so an invalid value (?status=banana) shows "All", like the list.
  const { status, priority, assignee, q } = IssueFiltersSchema.parse({
    status: searchParams.get("status") ?? undefined,
    priority: searchParams.get("priority") ?? undefined,
    assignee: searchParams.get("assignee") ?? undefined,
    q: searchParams.get("q") ?? undefined,
  });
  const hasFilters =
    status !== undefined ||
    priority !== undefined ||
    assignee !== undefined ||
    q !== undefined;

  const assigneeOptions: FilterOption[] = [
    { value: ASSIGNEE_ME, label: "Me" },
    { value: UNASSIGNED, label: "Unassigned" },
    ...users.map((user) => ({ value: user.id, label: user.name })),
  ];

  function updateFilter(key: FilterKey, value: string) {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value === ALL || value === "") {
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
    <div className="flex flex-wrap items-end gap-3">
      {/* Outside the keyed group below: remounting it on every URL change would drop
          focus mid-typing. */}
      <SearchBox
        inputRef={searchInput}
        defaultValue={q ?? ""}
        onSearch={(value) => updateFilter("q", value)}
      />
      {/* Selects are uncontrolled (defaultValue); keying on the URL remounts them
          whenever it changes, so Reset and back/forward show the current filters. */}
      <div key={searchParams.toString()} className="contents">
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
        <FilterSelect
          id="assignee"
          label="Assignee"
          value={assignee ?? ALL}
          options={assigneeOptions}
          onChange={(value) => updateFilter("assignee", value)}
        />
      </div>

      {hasFilters && (
        <Button
          onClick={() => {
            if (searchInput.current) {
              searchInput.current.value = "";
            }
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

const SEARCH_DEBOUNCE_MS = 300;

/** Search box; writes ?q= once typing pauses, so each keystroke isn't a server render. */
function SearchBox({
  inputRef,
  defaultValue,
  onSearch,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  defaultValue: string;
  onSearch: (value: string) => void;
}) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // A pending search shouldn't fire after the box is gone.
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="grid w-full gap-1.5 sm:w-64">
      <Label htmlFor="q">Search</Label>
      <Input
        ref={inputRef}
        id="q"
        type="search"
        placeholder="Words in the title or description"
        defaultValue={defaultValue}
        onChange={(event) => {
          const value = event.target.value.trim();
          clearTimeout(timer.current);
          timer.current = setTimeout(() => onSearch(value), SEARCH_DEBOUNCE_MS);
        }}
      />
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
