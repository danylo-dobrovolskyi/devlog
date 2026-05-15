import { z } from "zod";

/** Page size for the task grid (keep in sync with `listTasks`). */
export const TASKS_PAGE_SIZE = 10;

export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const subtaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  done: z.boolean(),
  order: z.number().int(),
  createdAt: z.iso.datetime(),
  taskId: z.string(),
});

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  subtasks: z.array(subtaskSchema),
});

export const createTaskInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().min(1, "Description is required").max(2000),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
});

export const updateTaskInputSchema = createTaskInputSchema.partial();

export const taskQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  sortBy: z.enum(["priority", "createdAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).optional(),
  /** When `"true"`, return all matching tasks for board consumers (focus banner map). Skips paging. */
  fetchAll: z.literal("true").optional(),
});

export const createSubtaskInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  order: z.number().int().min(0).optional(),
});

export const updateSubtaskInputSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  done: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});
