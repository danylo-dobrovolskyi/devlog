import "server-only";

import { tool } from "ai";
import { z } from "zod";

import {
  analyzeTaskInput,
  askClarifyingQuestionInput,
  proposeSubtasksInput,
} from "./schemas";

// `analyzeTask` and `proposeSubtasks` are server-side tools whose `execute`
// simply echoes the input back. They function as a structured scratchpad —
// the model commits to a verdict / plan that the UI can render, and the
// tool result is fed back into the model's context for the next step.
//
// `askClarifyingQuestion` has NO `execute`. That makes it a client-side tool:
// the agent loop pauses, the UI shows the question, the user answers, and
// `addToolOutput` feeds the answer back to the agent.

export const decomposeTools = {
  analyzeTask: tool({
    description:
      "Record your assessment of the task. ALWAYS call this first, before any other tool. The verdict drives the next action.",
    inputSchema: analyzeTaskInput,
    execute: async (input) => input,
  }),

  askClarifyingQuestion: tool({
    description:
      "Ask the user ONE focused question. Use only when verdict is 'needs_clarification'. Do not break down until you get the answer.",
    inputSchema: askClarifyingQuestionInput,
    // No `execute` — this is a client-side tool. The agent loop pauses, the
    // UI shows the question, and the user's typed answer is fed back via
    // `addToolOutput`. The schema below tells TS (and the model) that the
    // answer is a plain string.
    outputSchema: z.string(),
  }),

  proposeSubtasks: tool({
    description:
      "Propose the final list of subtasks. Only call when verdict is 'needs_breakdown' (after any clarification answers are in).",
    inputSchema: proposeSubtasksInput,
    execute: async (input) => input,
  }),
};
