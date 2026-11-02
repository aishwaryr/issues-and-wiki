"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type AssigneeOption, UNASSIGNED } from "@/lib/issues";

/** Assignee select + "Save" button; sends a user id or UNASSIGNED to the action. */
export function AssigneePicker({
  users,
  assigneeId,
  action,
}: {
  users: AssigneeOption[];
  assigneeId: string | null;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="space-y-2">
      <Label htmlFor="assigneeId">Assign to</Label>
      <div className="flex gap-2">
        <Select name="assigneeId" defaultValue={assigneeId ?? UNASSIGNED}>
          <SelectTrigger id="assigneeId" className="min-w-0 flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
                <span className="text-muted-foreground">{user.email}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <SubmitButton />
      </div>
    </form>
  );
}

/** Submit button that shows "Saving..." while the form is pending. */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}
