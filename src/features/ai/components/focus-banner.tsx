"use client";

import { ChevronDown, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { openTaskDetail } from "@/features/tasks/lib/task-events";
import { cn } from "@/lib/utils";

import type { PrioritizeUIMessage } from "@/features/ai/agents/prioritize";
import { useFocusChat } from "../hooks/use-focus-chat";
import { FocusTrace } from "./focus-trace";

// Cached plan survives page refresh within the same browser tab but is
// dropped when the tab closes — fits the "plan for today, don't waste tokens
// re-generating" use case without persisting stale plans across sessions.
const CACHE_KEY = "devlog:focus-plan";
const COLLAPSED_KEY = "devlog:focus-banner-collapsed";
const INITIAL_PROMPT = "Plan my focus for today based on the current task list.";

function readBannerExpandedFromStorage(): boolean {
  if (typeof window === "undefined") return true;
  return sessionStorage.getItem(COLLAPSED_KEY) !== "1";
}

export function FocusBanner() {
  const [expanded, setExpanded] = useState(readBannerExpandedFromStorage);

  // Full list so focus picks resolve titles even when tasks span multiple pages on the grid.
  const tasksQuery = useTasks({
    sortBy: "createdAt",
    order: "desc",
    fetchAll: "true",
  });
  const { messages, sendMessage, setMessages, status, error } = useFocusChat();

  // Restore cached plan once on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return;
    try {
      const parsed = JSON.parse(cached) as PrioritizeUIMessage[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setMessages(parsed);
      }
    } catch {
      sessionStorage.removeItem(CACHE_KEY);
    }
    // We intentionally run once on mount — re-running on every setMessages
    // change would create an update loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isStreaming = status === "submitted" || status === "streaming";
  const panelOpen = expanded || isStreaming;

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        sessionStorage.setItem(COLLAPSED_KEY, next ? "0" : "1");
      }
      return next;
    });
  }, []);

  // Persist the plan only after the agent finishes — caching streaming chunks
  // would replay a half-built plan on refresh.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStreaming) return;
    if (messages.length === 0) return;
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(messages));
  }, [messages, isStreaming]);

  const start = useCallback(() => {
    sendMessage({ text: INITIAL_PROMPT });
  }, [sendMessage]);

  const regenerate = useCallback(() => {
    sessionStorage.removeItem(CACHE_KEY);
    setMessages([]);
    sendMessage({ text: INITIAL_PROMPT });
  }, [sendMessage, setMessages]);

  const tasksById = useMemo(
    () =>
      new Map((tasksQuery.data?.tasks ?? []).map((task) => [task.id, task])),
    [tasksQuery.data?.tasks],
  );

  const openTasksCount = useMemo(
    () =>
      (tasksQuery.data?.tasks ?? []).filter((t) => t.status !== "DONE")
        .length,
    [tasksQuery.data?.tasks],
  );

  const lastAssistantMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return messages[i];
    }
    return undefined;
  }, [messages]);

  const focusStreamStatus = useMemo<
    null | "Starting agent" | "Loading tasks"
  >(() => {
    if (!isStreaming) return null;
    const parts = lastAssistantMessage?.parts;
    if (!Array.isArray(parts) || parts.length === 0) {
      return "Starting agent";
    }
    const reachedPrioritizeTool = parts.some(
      (p) => p.type === "tool-loadTasks" || p.type === "tool-proposeFocus",
    );
    if (!reachedPrioritizeTool) return "Starting agent";
    return "Loading tasks";
  }, [isStreaming, lastAssistantMessage]);

  // Nothing to plan — hide the banner entirely.
  if (tasksQuery.isSuccess && openTasksCount === 0) return null;

  const hasMessages = messages.length > 0;

  return (
    <div
      suppressHydrationWarning
      className={cn(
        "relative mb-6 cursor-pointer overflow-hidden rounded-xl border border-primary/25",
        "bg-linear-to-br from-muted via-card to-primary/[0.14]",
        "p-5 shadow-lg shadow-black/20 ring-1 ring-inset ring-primary/15",
      )}
      onClick={toggleExpanded}
    >
      {/* Decorative wash — anchors the accent so the corner doesn’t look flat on dark BG */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/25 to-transparent"
      />

      <div suppressHydrationWarning className="relative z-10">
        <div className="flex w-full items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 py-0.5 text-left">
            <Sparkles className="size-4 shrink-0 text-primary" />
            <h3 className="shrink-0 text-sm font-medium">Today&apos;s focus</h3>
            {focusStreamStatus ? (
              <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 shrink-0 animate-spin" />
                <span className="truncate">{focusStreamStatus}</span>
              </span>
            ) : null}
            {!panelOpen && hasMessages && !isStreaming && (
              <span className="truncate text-xs text-muted-foreground">
                · Plan ready — expand to view
              </span>
            )}
            {!panelOpen && error && (
              <span className="truncate text-xs text-destructive">
                · Error — expand
              </span>
            )}
          </div>
          {hasMessages && !isStreaming && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                regenerate();
              }}
              className="h-7 shrink-0 cursor-pointer"
            >
              <RefreshCw className="size-3" />
              Regenerate
            </Button>
          )}
          <ChevronDown
            suppressHydrationWarning
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              panelOpen ? "rotate-0" : "-rotate-90",
            )}
            aria-hidden
          />
        </div>

        <div
          suppressHydrationWarning
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
            panelOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className="mt-3 cursor-auto space-y-3 border-t border-primary/15 pt-3"
              onClick={(event) => event.stopPropagation()}
            >
              {!hasMessages && !isStreaming && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Let AI scan your tasks and suggest where to start today.
                  </p>
                  <Button
                    size="sm"
                    type="button"
                    className="cursor-pointer"
                    onClick={(event) => {
                      event.stopPropagation();
                      start();
                    }}
                    disabled={!tasksQuery.isSuccess}
                  >
                    <Sparkles className="size-3.5" />
                    Plan my day
                  </Button>
                </div>
              )}

              {hasMessages && (
                <div className="space-y-2">
                  {messages.map((message) => {
                    const last = messages[messages.length - 1];
                    const isActiveTurn =
                      isStreaming &&
                      last != null &&
                      message.role === "assistant" &&
                      message.id === last.id;

                    return (
                      <FocusTrace
                        key={message.id}
                        message={message}
                        tasksById={tasksById}
                        onSelectTask={openTaskDetail}
                        isActivelyStreaming={isActiveTurn}
                      />
                    );
                  })}
                </div>
              )}

              {error && (
                <div className="text-xs text-destructive">{error.message}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
