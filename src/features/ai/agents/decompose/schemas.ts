import { z } from "zod";

export const analyzeTaskInput = z.object({
  verdict: z
    .enum(["needs_breakdown", "needs_clarification", "trivial"])
    .describe("Your decision about how to handle this task."),
  reasoning: z
    .string()
    .min(10)
    .max(280)
    .describe(
      "One short sentence explaining the verdict. Mention concrete signals from the task.",
    ),
});

export const askClarifyingQuestionInput = z.object({
  question: z
    .string()
    .min(5)
    .max(280)
    .describe(
      "A single, specific question that would unblock a good breakdown. Do not ask multiple things.",
    ),
});

export const proposeSubtasksInput = z.object({
  reasoning: z
    .string()
    .min(10)
    .max(280)
    .describe(
      "One short sentence describing the sequencing or grouping logic behind the subtasks.",
    ),
  subtasks: z
    .array(
      z.object({
        title: z
          .string()
          .min(3)
          .max(200)
          .describe(
            "Concrete, verifiable action. Start with a verb. No filler.",
          ),
      }),
    )
    .min(2)
    .max(10)
    .describe("2–10 subtasks ordered for execution. Dependencies first."),
});
