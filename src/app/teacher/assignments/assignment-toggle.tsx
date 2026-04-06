"use client";

import { useTransition } from "react";
import { setAssignmentActive } from "@/app/actions/assignment-actions";
import { Button } from "@/libs/components/ui/button";

export function AssignmentToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => setAssignmentActive(id, !isActive))}
    >
      {pending ? "…" : isActive ? "Đang mở → Đóng" : "Đang đóng → Mở"}
    </Button>
  );
}
