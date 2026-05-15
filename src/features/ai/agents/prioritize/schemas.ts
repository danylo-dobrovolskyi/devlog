import { z } from "zod";

// `loadTasks` takes no parameters — the agent calls it to fetch the current
// open tasks. An empty object keeps the JSON schema valid.
export const loadTasksInput = z.object({});

export const proposeFocusInput = z.object({
  items: z
    .array(
      z.object({
        taskId: z
          .string()
          .describe("Must match an id returned by loadTasks."),
        reason: z
          .string()
          .min(5)
          .max(160)
          .describe(
            "One short sentence — why this task belongs in today's focus. Reference concrete signals (age, status, momentum, blocking impact). NOT just 'high priority'.",
          ),
      }),
    )
    .min(1)
    .max(5)
    .describe(
      "1–5 tasks for today, ordered by suggested execution order. Aim for 3–5 unless the open list is shorter.",
    ),
  summary: z
    .string()
    .min(10)
    .max(280)
    .describe(
      "One short sentence on the overall plan. E.g. 'Critical bug first, then continue the auth migration that's already moving.'",
    ),
});
