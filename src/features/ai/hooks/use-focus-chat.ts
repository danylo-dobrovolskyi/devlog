"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import type { PrioritizeUIMessage } from "@/features/ai/agents/prioritize";

// Thin typed wrapper around useChat for the prioritize agent. Unlike the
// decompose chat, there's no clarifying-question loop here — the agent runs
// straight through loadTasks → proposeFocus and stops.
export function useFocusChat() {
  return useChat<PrioritizeUIMessage>({
    transport: new DefaultChatTransport({
      api: "/api/ai/focus",
    }),
  });
}
