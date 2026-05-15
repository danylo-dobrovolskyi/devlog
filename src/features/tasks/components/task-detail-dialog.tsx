"use client";

import { Clock, Pencil, Sparkles, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatRelativeShort } from "@/lib/utils";

import { SubtaskList } from "./subtask-list";
import {
  BADGE_BASE,
  PRIORITY_CLASS,
  PRIORITY_LABEL,
  STATUS_CLASS,
  STATUS_LABEL,
} from "./task-badges";
import type { Task } from "../types";

type Props = {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onBreakDown: () => void;
};

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onBreakDown,
}: Props) {
  const completed = task.subtasks.filter((s) => s.done).length;
  // Hide "Break down" once a task already has a decomposition — re-running
  // would create duplicates. To regenerate, user deletes existing subtasks.
  // (See AGENT_LOG for the trade-off discussion.)
  const hasSubtasks = task.subtasks.length > 0;

  // Action buttons close the detail view first so the next dialog opens on a
  // clean state — avoids two modals stacked at once.
  const runAction = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base leading-snug pr-8">
            {task.title}
          </DialogTitle>
          <div className="flex items-center gap-1.5">
            <Badge className={`${BADGE_BASE} ${STATUS_CLASS[task.status]}`}>
              {STATUS_LABEL[task.status]}
            </Badge>
            <Badge className={`${BADGE_BASE} ${PRIORITY_CLASS[task.priority]}`}>
              {PRIORITY_LABEL[task.priority]}
            </Badge>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-5 overflow-y-auto">
          {task.description && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {task.description}
            </p>
          )}

          {task.subtasks.length > 0 && (
            <div className="space-y-2">
              <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Subtasks ({completed}/{task.subtasks.length})
              </div>
              <SubtaskList subtasks={task.subtasks} />
            </div>
          )}

          <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="size-3" />
            Created {formatRelativeShort(new Date(task.createdAt))}
          </div>
        </div>

        <DialogFooter
          className={cn(hasSubtasks ? "sm:justify-end" : "sm:justify-between")}
        >
          {!hasSubtasks && (
            <Button variant="outline" onClick={() => runAction(onBreakDown)}>
              <Sparkles className="size-4" />
              Break down
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => runAction(onEdit)}>
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => runAction(onDelete)}>
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
