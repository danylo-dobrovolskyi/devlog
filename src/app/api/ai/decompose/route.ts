import { createAgentUIStreamResponse, type UIMessage } from "ai";

import { decomposeAgent } from "@/features/ai/agents/decompose";

// Streaming agent responses may take up to a minute on slow LLM calls.
export const maxDuration = 60;

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  return createAgentUIStreamResponse({
    agent: decomposeAgent,
    uiMessages: messages,
  });
}
