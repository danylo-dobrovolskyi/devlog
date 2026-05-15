import "server-only";

import { ToolLoopAgent, stepCountIs, type InferAgentUIMessage } from "ai";

import { openai } from "@/features/ai/lib/openai";
import { DEFAULT_MODEL } from "@/features/ai/lib/models";

import { decomposeSystemPrompt } from "./prompts";
import { decomposeTools } from "./tools";

export const decomposeAgent = new ToolLoopAgent({
  model: openai(DEFAULT_MODEL),
  instructions: decomposeSystemPrompt,
  tools: decomposeTools,
  // Hard ceiling on the loop. In practice the agent finishes in 2–4 steps.
  stopWhen: stepCountIs(8),
});

export type DecomposeUIMessage = InferAgentUIMessage<typeof decomposeAgent>;
