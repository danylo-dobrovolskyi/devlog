"use client";

import { AlertCircle, ArrowRight, Loader2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  BADGE_BASE,
  PRIORITY_CLASS,
  PRIORITY_LABEL,
} from "@/features/tasks/components/task-badges";
import type { Task } from "@/features/tasks/types";

import type { PrioritizeUIMessage } from "@/features/ai/agents/prioritize";
import { cn } from "@/lib/utils";

type Props = {
  message: PrioritizeUIMessage;
  tasksById: Map<string, Task>;
  onSelectTask: (taskId: string) => void;
  /** True while this message is still receiving streamed tokens (usually the last assistant turn). */
  isActivelyStreaming?: boolean;
};

export function FocusTrace({
  message,
  tasksById,
  onSelectTask,
  isActivelyStreaming = false,
}: Props) {
  if (message.role !== "assistant") return null;

  return (
    <div className="space-y-3">
      {message.parts.map((part, index) => {
        const key = `${message.id}-${index}`;

        switch (part.type) {
          case "text":
            return null;

          case "tool-loadTasks":
            switch (part.state) {
              case "input-streaming":
              case "input-available":
                /* Status text lives in FocusBanner header */
                return null;
              case "output-available":
                /* Step completes silently; proposeFocus renders the next line. */
                return null;
              case "output-error":
                return <ErrorRow key={key} text={part.errorText} />;
            }
            return null;

          case "tool-proposeFocus":
            switch (part.state) {
              case "input-streaming":
                return <FocusCardSkeleton key={key} />;
              case "input-available":
              case "output-available": {
                const items = part.input?.items ?? [];
                const summary = part.input?.summary ?? "";
                if (items.length === 0) {
                  // Model is still assembling the structured list — show the card shell plus loaders.
                  if (part.state === "input-available" && isActivelyStreaming) {
                    return <FocusCardSkeleton key={key} />;
                  }
                  return null;
                }
                return (
                  <FocusCard
                    key={key}
                    items={items}
                    summary={summary}
                    tasksById={tasksById}
                    onSelectTask={onSelectTask}
                    isActivelyStreaming={isActivelyStreaming}
                    footerLoading={
                      isActivelyStreaming &&
                      part.state === "input-available" &&
                      !summary.trim()
                    }
                  />
                );
              }
              case "output-error":
                return <ErrorRow key={key} text={part.errorText} />;
            }
            return null;

          default:
            return null;
        }
      })}
    </div>
  );
}

// — Building blocks —

function ErrorRow({ text }: { text?: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
      <span>{text ?? "Something went wrong"}</span>
    </div>
  );
}

function FocusCardSkeleton() {
  return (
    <div
      className="rounded-md border border-border/60 bg-card/50 p-3"
      aria-busy
      aria-label="Loading today's focus"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="size-3.5 shrink-0 text-muted-foreground/60" />
        <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
          Today&apos;s focus
        </span>
      </div>
      <ul className="mt-3 space-y-2.5" role="presentation">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-0.5 h-4 w-5 shrink-0 rounded bg-muted/60 animate-pulse" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-[72%] max-w-md rounded bg-muted/60 animate-pulse" />
              <div className="h-3 w-[55%] max-w-sm rounded bg-muted/40 animate-pulse" />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 h-3 w-full max-w-lg rounded bg-muted/35 animate-pulse" />
    </div>
  );
}

function FocusCard({
  items,
  summary,
  tasksById,
  onSelectTask,
  footerLoading,
  isActivelyStreaming,
}: {
  items: { taskId: string; reason?: string }[];
  summary: string;
  tasksById: Map<string, Task>;
  onSelectTask: (taskId: string) => void;
  footerLoading?: boolean;
  /** Stream still open — IDs may arrive before client task list catches up. */
  isActivelyStreaming?: boolean;
}) {
  const waitingForTasks =
    isActivelyStreaming &&
    items.length > 0 &&
    items.every((item) => !tasksById.has(item.taskId));

  return (
    <div
      className={cn(
        "rounded-md border border-border/60 bg-card/50 p-3",
        footerLoading && "ring-1 ring-primary/20",
      )}
    >
      <div className="flex items-center gap-2">
        {/* Spinner only below when writing summary — avoids two spinners in one card */}
        <Sparkles
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground",
            footerLoading && "opacity-50",
          )}
        />
        <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
          Today&apos;s focus
        </span>
      </div>

      <ol className="mt-3 space-y-1">
        {waitingForTasks ? (
          <li className="flex items-center gap-2 rounded px-1 py-3 text-xs text-muted-foreground">
            <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
            <span>Matching tasks to your board…</span>
          </li>
        ) : (
          items.map((item, i) => {
            const task = tasksById.get(item.taskId);
            if (!task) {
              if (!isActivelyStreaming) return null;
              return (
                <li
                  key={`${item.taskId}-${i}`}
                  className="flex items-start gap-2 rounded px-1 py-2"
                >
                  <span className="mt-0.5 inline-block w-5 shrink-0 font-mono text-xs text-muted-foreground">
                    {i + 1}.
                  </span>
                  <div className="flex min-w-0 flex-1 items-center gap-2 py-1">
                    <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" />
                    <span className="h-4 flex-1 max-w-[70%] rounded bg-muted/50 animate-pulse" />
                  </div>
                </li>
              );
            }
            return (
            <li
              key={item.taskId}
              className="group/focus -mx-1 flex cursor-pointer items-start gap-2 rounded px-1 py-1.5 transition-colors hover:bg-muted/40"
              onClick={() => onSelectTask(item.taskId)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectTask(item.taskId);
                }
              }}
            >
              <span className="mt-0.5 inline-block w-5 shrink-0 font-mono text-xs text-muted-foreground">
                {i + 1}.
              </span>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium leading-snug">
                    {task.title}
                  </span>
                  <Badge
                    className={`${BADGE_BASE} ${PRIORITY_CLASS[task.priority]}`}
                  >
                    {PRIORITY_LABEL[task.priority]}
                  </Badge>
                </div>
                {item.reason && (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {item.reason}
                  </p>
                )}
              </div>
              <ArrowRight className="mt-1.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/focus:opacity-100" />
            </li>
            );
          })
        )}
      </ol>

      {footerLoading && (
        <div className="mt-3 flex items-center gap-2 border-t border-border/40 pt-3 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" />
          <span>Almost done — writing summary…</span>
        </div>
      )}
      {!footerLoading && summary && (
        <p className="mt-3 border-t border-border/40 pt-3 text-xs leading-relaxed text-muted-foreground">
          {summary}
        </p>
      )}
    </div>
  );
}
