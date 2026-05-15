"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateSubtasksBulk } from "@/features/tasks/hooks/use-subtask-mutations";
import type { Task } from "@/features/tasks/types";

import { useDecomposeChat } from "../hooks/use-decompose-chat";
import { AgentTrace } from "./agent-trace";

type Props = {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DecomposeDialog({ task, open, onOpenChange }: Props) {
  const { messages, sendMessage, addToolOutput, setMessages, status, error } =
    useDecomposeChat();
  const saveMutation = useCreateSubtasksBulk(task.id);

  // Kick off the agent on first open, reset state on close.
  useEffect(() => {
    if (!open) {
      setMessages([]);
      return;
    }
    if (messages.length > 0) return;
    sendMessage({
      text: [
        "Break down this task.",
        "",
        `Title: ${task.title}`,
        `Description: ${task.description}`,
      ].join("\n"),
    });
  }, [open, messages.length, task, sendMessage, setMessages]);

  const isStreaming = status === "submitted" || status === "streaming";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Break down task
            {isStreaming && (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            )}
          </DialogTitle>
          <DialogDescription className="line-clamp-2">
            {task.title}
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-1 max-h-[60vh] space-y-3 overflow-y-auto px-1 py-1">
          {messages.length === 0 && isStreaming && (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Starting agent…
            </div>
          )}

          {messages.map((message) => (
            <AgentTrace
              key={message.id}
              message={message}
              onAnswerClarification={(toolCallId, answer) =>
                addToolOutput({
                  tool: "askClarifyingQuestion",
                  toolCallId,
                  output: answer,
                })
              }
              onSaveSubtasks={async (items) => {
                await saveMutation.mutateAsync(items);
                onOpenChange(false);
              }}
              isSaving={saveMutation.isPending}
            />
          ))}

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error.message}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
