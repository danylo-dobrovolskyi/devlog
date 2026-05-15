"use client";

import { Inbox } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { TASKS_PAGE_SIZE } from "../schemas";
import { useTaskFilters } from "../hooks/use-task-filters";
import { useTasks } from "../hooks/use-tasks";
import type { TaskQuery } from "../types";
import { TaskCard } from "./task-card";

export function TaskList() {
  const { filters, setFilters } = useTaskFilters();
  const listQuery = useMemo(
    (): TaskQuery => ({
      ...filters,
      page: filters.page ?? 1,
    }),
    [filters],
  );
  const { data, isPending, isError, error, refetch } = useTasks(listQuery);

  const tasks = data?.tasks ?? [];
  const total = data?.total ?? 0;

  const page = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / TASKS_PAGE_SIZE));
  const effectivePage = Math.min(page, totalPages);
  const rangeStart =
    total === 0 ? 0 : (effectivePage - 1) * TASKS_PAGE_SIZE + 1;
  const rangeEnd = Math.min(effectivePage * TASKS_PAGE_SIZE, total);

  if (isPending) return <TaskListSkeleton />;

  if (isError) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <p className="font-medium text-destructive">Failed to load tasks</p>
        <p className="mt-1 text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 text-sm font-medium text-destructive underline-offset-2 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (tasks.length === 0 && total === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <Inbox className="size-10 text-muted-foreground" strokeWidth={1.5} />
        <p className="mt-3 text-sm font-medium">No tasks match these filters</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try clearing filters or create a new task.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-sm text-muted-foreground">
          <span>
            Showing {rangeStart}–{rangeEnd} of {total}
          </span>
          {totalPages > 1 ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={effectivePage <= 1}
                onClick={() =>
                  setFilters({
                    page: effectivePage <= 2 ? "first" : effectivePage - 1,
                  })
                }
              >
                Previous
              </Button>
              <span className="tabular-nums text-foreground">
                Page {effectivePage} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={effectivePage >= totalPages}
                onClick={() => setFilters({ page: effectivePage + 1 })}
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function TaskListSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-4 w-2/3 rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-3 w-full rounded bg-muted" />
          </CardContent>
          <CardContent>
            <div className="h-3 w-full rounded bg-muted" />
            <div className="mt-2 h-3 w-4/5 rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
