"use client";

import { useOptimistic } from "react";

import { Button } from "@/components/ui/button";
import { UNASSIGNED } from "@/lib/issues";

/** Assign-to-me / Unassign toggle; the label flips at once and rolls back on failure. */
export function AssignIssueButton({
  assignedToMe,
  userId,
  action,
}: {
  assignedToMe: boolean;
  userId: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [optimisticAssignedToMe, setOptimisticAssignedToMe] =
    useOptimistic(assignedToMe);

  return (
    <form
      action={async (formData) => {
        setOptimisticAssignedToMe(!assignedToMe);
        await action(formData);
      }}
    >
      <input
        type="hidden"
        name="assigneeId"
        value={assignedToMe ? UNASSIGNED : userId}
      />
      <Button type="submit" variant="outline" size="sm">
        {optimisticAssignedToMe ? "Unassign" : "Assign to me"}
      </Button>
    </form>
  );
}
