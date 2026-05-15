"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { useTaskFilters } from "../hooks/use-task-filters";
import type { TaskQuery, TaskStatus } from "../types";

const STATUS_OPTIONS: { value: TaskStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "TODO", label: "Todo" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DONE", label: "Done" },
];

const SORT_OPTIONS: {
  value: `${TaskQuery["sortBy"]}:${TaskQuery["order"]}`;
  label: string;
}[] = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "priority:desc", label: "Priority: high → low" },
  { value: "priority:asc", label: "Priority: low → high" },
];

export function TaskFilters() {
  const { filters, setFilters, clearFilters } = useTaskFilters();

  const isFiltered =
    filters.status !== undefined ||
    filters.sortBy !== "createdAt" ||
    filters.order !== "desc" ||
    (filters.page ?? 1) > 1;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={filters.status ?? "ALL"}
        onValueChange={(value) =>
          setFilters({ status: value as TaskStatus | "ALL" })
        }
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={`${filters.sortBy}:${filters.order}`}
        onValueChange={(value) => {
          const [sortBy, order] = value.split(":") as [
            TaskQuery["sortBy"],
            TaskQuery["order"],
          ];
          setFilters({ sortBy, order });
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isFiltered && (
        <Button variant="secondary" onClick={clearFilters}>
          Reset
        </Button>
      )}
    </div>
  );
}
