"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import {
  useDeleteSubtask,
  useToggleSubtask,
} from "../hooks/use-subtask-mutations";
import type { Subtask } from "../types";

type Props = {
  subtasks: Subtask[];
};

export function SubtaskList({ subtasks }: Props) {
  const toggle = useToggleSubtask();
  const remove = useDeleteSubtask();

  if (subtasks.length === 0) return null;

  return (
    <ul className="space-y-0.5">
      {subtasks.map((subtask) => {
        const inputId = `subtask-${subtask.id}`;
        return (
          <li
            key={subtask.id}
            className="group/subtask flex items-start gap-2 rounded px-1 py-1 transition-colors hover:bg-muted/40"
          >
            <Checkbox
              id={inputId}
              checked={subtask.done}
              onCheckedChange={(checked) =>
                toggle.mutate({ id: subtask.id, done: checked === true })
              }
              className="mt-0.5"
            />
            <label
              htmlFor={inputId}
              className={cn(
                "flex-1 cursor-pointer text-sm leading-relaxed",
                subtask.done && "text-muted-foreground line-through",
              )}
            >
              {subtask.title}
            </label>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => remove.mutate(subtask.id)}
              aria-label="Delete subtask"
              className="size-6 shrink-0 opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover/subtask:opacity-100"
            >
              <X className="size-3.5" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
