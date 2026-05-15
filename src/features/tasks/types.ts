import type { z } from "zod";

import type {
  createSubtaskInputSchema,
  createTaskInputSchema,
  subtaskSchema,
  taskPrioritySchema,
  taskQuerySchema,
  taskSchema,
  taskStatusSchema,
  updateSubtaskInputSchema,
  updateTaskInputSchema,
} from "./schemas";

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

export type Task = z.infer<typeof taskSchema>;
export type Subtask = z.infer<typeof subtaskSchema>;

export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;

export type CreateSubtaskInput = z.infer<typeof createSubtaskInputSchema>;
export type UpdateSubtaskInput = z.infer<typeof updateSubtaskInputSchema>;
