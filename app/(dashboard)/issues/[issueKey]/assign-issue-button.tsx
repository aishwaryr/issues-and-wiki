"use client";

import { useOptimistic } from "react";

import { Button } from "@/components/ui/button";

/** Assign-to-me / Unassign toggle; the label flips at once and rolls back on failure. */
export function AssignIssueButton({
  assignedToMe,
  action,
}: {
  assignedToMe: boolean;
  action: () => Promise<void>;
}) {
  const [optimisticAssignedToMe, setOptimisticAssignedToMe] =
    useOptimistic(assignedToMe);

  return (
    <form
      action={async () => {
        setOptimisticAssignedToMe(!assignedToMe);
        await action();
      }}
    >
      <Button type="submit" variant="outline" size="sm">
        {optimisticAssignedToMe ? "Unassign" : "Assign to me"}
      </Button>
    </form>
  );
}
