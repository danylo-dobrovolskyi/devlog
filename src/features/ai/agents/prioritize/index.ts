import "server-only";

import { ToolLoopAgent, stepCountIs, type InferAgentUIMessage } from "ai";

import { openai } from "@/features/ai/lib/openai";
import { DEFAULT_MODEL } from "@/features/ai/lib/models";

import { prioritizeSystemPrompt } from "./prompts";
import { prioritizeTools } from "./tools";

export const prioritizeAgent = new ToolLoopAgent({
  model: openai(DEFAULT_MODEL),
  instructions: prioritizeSystemPrompt,
  tools: prioritizeTools,
  // The agent uses 2 tools sequentially (loadTasks → proposeFocus).
  // Headroom for one retry if the model misbehaves on first attempt.
  stopWhen: stepCountIs(6),
});

export type PrioritizeUIMessage = InferAgentUIMessage<typeof prioritizeAgent>;
