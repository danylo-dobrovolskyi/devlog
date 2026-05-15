"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DecomposeDialog } from "@/features/ai/components/decompose-dialog";
import { formatRelativeShort } from "@/lib/utils";

import { onOpenTaskDetail } from "../lib/task-events";
import { DeleteTaskDialog } from "./delete-task-dialog";
import {
  BADGE_BASE,
  PRIORITY_CLASS,
  PRIORITY_LABEL,
  STATUS_CLASS,
  STATUS_LABEL,
} from "./task-badges";
import { TaskDetailDialog } from "./task-detail-dialog";
import { TaskFormDialog } from "./task-form-dialog";
import type { Task } from "../types";

export function TaskCard({ task }: { task: Task }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const completedSubtasks = task.subtasks.filter((s) => s.done).length;

  const openDetail = () => setDetailOpen(true);

  // Listen for cross-component requests to open this task's detail (used by
  // the focus banner — see `task-events.ts`).
  useEffect(
    () =>
      onOpenTaskDetail((id) => {
        if (id === task.id) setDetailOpen(true);
      }),
    [task.id],
  );

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        onClick={openDetail}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openDetail();
          }
        }}
        className="cursor-pointer border-border/60 outline-none transition-colors hover:border-border focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg font-medium leading-snug">
              {task.title}
            </CardTitle>
            <div className="flex shrink-0 items-center gap-1.5">
              <Badge className={`${BADGE_BASE} ${STATUS_CLASS[task.status]}`}>
                {STATUS_LABEL[task.status]}
              </Badge>
              <Badge
                className={`${BADGE_BASE} ${PRIORITY_CLASS[task.priority]}`}
              >
                {PRIORITY_LABEL[task.priority]}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {task.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {task.description}
            </p>
          )}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {formatRelativeShort(new Date(task.createdAt))}
            </span>
            {task.subtasks.length > 0 && (
              <span>
                {completedSubtasks} / {task.subtasks.length} subtasks
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <TaskDetailDialog
        task={task}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
        onBreakDown={() => setBreakdownOpen(true)}
      />

      <TaskFormDialog task={task} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteTaskDialog
        task={task}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
      <DecomposeDialog
        task={task}
        open={breakdownOpen}
        onOpenChange={setBreakdownOpen}
      />
    </>
  );
}
