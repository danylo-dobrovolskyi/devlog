"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";

import type { DecomposeUIMessage } from "@/features/ai/agents/decompose";

// Thin typed wrapper around useChat. The agent's UI message type is inferred
// from the server-side ToolLoopAgent definition, so part.type values like
// `tool-analyzeTask` are fully typed on the client.
export function useDecomposeChat() {
  return useChat<DecomposeUIMessage>({
    transport: new DefaultChatTransport({
      api: "/api/ai/decompose",
    }),
    // After the user answers a clarifying question (`addToolOutput`), the
    // chat auto-submits so the agent loop continues without manual nudges.
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });
}
