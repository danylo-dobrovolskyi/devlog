import "server-only";

import { tool } from "ai";

import { prisma } from "@/lib/db";

import { loadTasksInput, proposeFocusInput } from "./schemas";

// `loadTasks` is a server-side tool with a real `execute` — it reads the DB.
// This is what makes the agent multi-step: the LLM doesn't get tasks on input,
// it has to call this tool to fetch them, then reason about the result.
//
// `proposeFocus` echoes its input back. Its purpose is structural — the model
// commits to a final plan that the UI can render, and the echoed output is
// preserved in conversation history.

export const prioritizeTools = {
  loadTasks: tool({
    description:
      "Load the current open tasks (TODO and IN_PROGRESS) from the database. Returns id, title, description, priority, status, ageInDays, and subtasks progress. Always call this first.",
    inputSchema: loadTasksInput,
    execute: async () => {
      const tasks = await prisma.task.findMany({
        where: { status: { in: ["TODO", "IN_PROGRESS"] } },
        orderBy: { createdAt: "desc" },
        include: { subtasks: true },
      });

      // Compact view — strip fields the model doesn't need to save tokens.
      // Description is capped at 200 chars; full text would blow the context
      // window with no benefit for prioritization.
      return tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description:
          task.description.length > 200
            ? `${task.description.slice(0, 200)}…`
            : task.description,
        priority: task.priority,
        status: task.status,
        ageInDays: Math.floor(
          (Date.now() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        ),
        subtasksTotal: task.subtasks.length,
        subtasksDone: task.subtasks.filter((s) => s.done).length,
      }));
    },
  }),

  proposeFocus: tool({
    description:
      "Propose 3–5 tasks to focus on today, in order, with one-sentence reasons each. Call this once at the end.",
    inputSchema: proposeFocusInput,
    execute: async (input) => input,
  }),
};
