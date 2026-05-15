"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { TaskFormDialog } from "./task-form-dialog";

export function NewTaskButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        New task
      </Button>
      <TaskFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
