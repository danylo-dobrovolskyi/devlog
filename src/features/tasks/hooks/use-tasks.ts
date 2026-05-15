"use client";

import { useQuery } from "@tanstack/react-query";

import { tasksApi } from "../api/tasks.client";
import type { TaskQuery } from "../types";

export const tasksKeys = {
  all: ["tasks"] as const,
  list: (query: TaskQuery) => [...tasksKeys.all, "list", query] as const,
  detail: (id: string) => [...tasksKeys.all, "detail", id] as const,
};

export function useTasks(query: TaskQuery) {
  return useQuery({
    queryKey: tasksKeys.list(query),
    queryFn: () => tasksApi.list(query),
  });
}
