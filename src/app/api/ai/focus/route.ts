import { createAgentUIStreamResponse, type UIMessage } from "ai";

import { prioritizeAgent } from "@/features/ai/agents/prioritize";

export const maxDuration = 60;

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  return createAgentUIStreamResponse({
    agent: prioritizeAgent,
    uiMessages: messages,
  });
}
