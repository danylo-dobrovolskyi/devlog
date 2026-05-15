import type {
  CreateSubtaskInput,
  CreateTaskInput,
  Subtask,
  Task,
  TaskQuery,
  UpdateSubtaskInput,
  UpdateTaskInput,
} from "../types";

async function request<T>(
  url: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, headers, ...rest } = init ?? {};
  const response = await fetch(url, {
    ...rest,
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      (data && typeof data === "object" && "error" in data
        ? (data as { error: { message?: string } }).error?.message
        : undefined) ?? `Request failed with ${response.status}`;
    throw new Error(message);
  }
  return data as T;
}

function buildTasksUrl(query: Partial<TaskQuery>) {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.order) params.set("order", query.order);
  if (query.page != null && query.page > 1)
    params.set("page", String(query.page));
  if (query.fetchAll === "true") params.set("fetchAll", "true");
  const qs = params.toString();
  return `/api/tasks${qs ? `?${qs}` : ""}`;
}

export type TasksPage = { tasks: Task[]; total: number };

export const tasksApi = {
  list: (query: Partial<TaskQuery>) =>
    request<TasksPage>(buildTasksUrl(query)),

  get: (id: string) =>
    request<{ task: Task }>(`/api/tasks/${id}`).then((r) => r.task),

  create: (input: CreateTaskInput) =>
    request<{ task: Task }>("/api/tasks", { method: "POST", json: input }).then(
      (r) => r.task,
    ),

  update: (id: string, input: UpdateTaskInput) =>
    request<{ task: Task }>(`/api/tasks/${id}`, {
      method: "PATCH",
      json: input,
    }).then((r) => r.task),

  remove: (id: string) =>
    request<void>(`/api/tasks/${id}`, { method: "DELETE" }),
};

export const subtasksApi = {
  list: (taskId: string) =>
    request<{ subtasks: Subtask[] }>(`/api/tasks/${taskId}/subtasks`).then(
      (r) => r.subtasks,
    ),

  create: (taskId: string, input: CreateSubtaskInput) =>
    request<{ subtask: Subtask }>(`/api/tasks/${taskId}/subtasks`, {
      method: "POST",
      json: input,
    }).then((r) => r.subtask),

  createBulk: (taskId: string, items: { title: string }[]) =>
    request<{ subtasks: Subtask[] }>(`/api/tasks/${taskId}/subtasks/bulk`, {
      method: "POST",
      json: { items },
    }).then((r) => r.subtasks),

  update: (id: string, input: UpdateSubtaskInput) =>
    request<{ subtask: Subtask }>(`/api/subtasks/${id}`, {
      method: "PATCH",
      json: input,
    }).then((r) => r.subtask),

  remove: (id: string) =>
    request<void>(`/api/subtasks/${id}`, { method: "DELETE" }),
};
