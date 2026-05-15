import type { TaskPriority, TaskStatus } from "../types";

export const BADGE_BASE =
  "font-mono uppercase text-[10px] tracking-wider border px-1.5 py-0 h-5";

export const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "todo",
  IN_PROGRESS: "in progress",
  DONE: "done",
};

export const STATUS_CLASS: Record<TaskStatus, string> = {
  TODO: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  IN_PROGRESS: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  DONE: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

export const PRIORITY_CLASS: Record<TaskPriority, string> = {
  LOW: "bg-muted/40 text-muted-foreground border-border",
  MEDIUM: "bg-orange-500/10 text-orange-300 border-orange-500/30",
  HIGH: "bg-rose-500/10 text-rose-300 border-rose-500/30",
};
