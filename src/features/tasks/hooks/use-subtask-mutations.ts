"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { subtasksApi, type TasksPage } from "../api/tasks.client";
import type { Task } from "../types";
import { tasksKeys } from "./use-tasks";

type TasksCache = TasksPage | Task[];

function patchTasksList(
  data: TasksCache | undefined,
  patchTaskList: (tasks: Task[]) => Task[],
): TasksCache | undefined {
  if (data === undefined) return undefined;
  if (Array.isArray(data)) return patchTaskList(data);
  return { ...data, tasks: patchTaskList(data.tasks) };
}

export function useCreateSubtasksBulk(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: { title: string }[]) =>
      subtasksApi.createBulk(taskId, items),
    onSuccess: (subtasks) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
      toast.success(
        `${subtasks.length} ${subtasks.length === 1 ? "subtask" : "subtasks"} added`,
      );
    },
    onError: (error) => toast.error(error.message),
  });
}

// Removing a subtask must feel instant too — same optimistic pattern as toggle:
// drop the subtask from every cached task list, roll back if the request fails.
export function useDeleteSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subtasksApi.remove(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: tasksKeys.all });

      const previous = queryClient.getQueriesData<TasksCache>({
        queryKey: tasksKeys.all,
      });

      queryClient.setQueriesData<TasksCache>(
        { queryKey: tasksKeys.all },
        (cached) =>
          patchTasksList(cached, (tasks) =>
            tasks.map((task) => ({
              ...task,
              subtasks: task.subtasks.filter((subtask) => subtask.id !== id),
            })),
          ),
      );

      return { previous };
    },

    onError: (error, _id, context) => {
      if (context?.previous) {
        for (const [queryKey, data] of context.previous) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error(error.message);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
    },
  });
}

// Checkbox toggles must feel instant. Optimistically flip the subtask in every
// cached task list, then reconcile with the server. On error — roll back.
export function useToggleSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) =>
      subtasksApi.update(id, { done }),

    onMutate: async ({ id, done }) => {
      await queryClient.cancelQueries({ queryKey: tasksKeys.all });

      const previous = queryClient.getQueriesData<TasksCache>({
        queryKey: tasksKeys.all,
      });

      queryClient.setQueriesData<TasksCache>(
        { queryKey: tasksKeys.all },
        (cached) =>
          patchTasksList(cached, (tasks) =>
            tasks.map((task) => ({
              ...task,
              subtasks: task.subtasks.map((subtask) =>
                subtask.id === id ? { ...subtask, done } : subtask,
              ),
            })),
          ),
      );

      return { previous };
    },

    onError: (error, _variables, context) => {
      if (context?.previous) {
        for (const [queryKey, data] of context.previous) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error(error.message);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
    },
  });
}
