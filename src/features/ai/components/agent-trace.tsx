"use client";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageCircleQuestion,
  Send,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type { DecomposeUIMessage } from "@/features/ai/agents/decompose";

type Props = {
  message: DecomposeUIMessage;
  onAnswerClarification: (toolCallId: string, answer: string) => void;
  onSaveSubtasks: (items: { title: string }[]) => void;
  isSaving: boolean;
};

const VERDICT_LABEL = {
  needs_breakdown: "Needs breakdown",
  needs_clarification: "Needs clarification",
  trivial: "Trivial",
} as const;

const VERDICT_CLASS = {
  needs_breakdown:
    "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  needs_clarification:
    "bg-amber-500/10 text-amber-300 border-amber-500/30",
  trivial: "bg-muted/50 text-muted-foreground border-border",
} as const;

export function AgentTrace({
  message,
  onAnswerClarification,
  onSaveSubtasks,
  isSaving,
}: Props) {
  if (message.role !== "assistant") return null;

  return (
    <div className="space-y-3">
      {message.parts.map((part, index) => {
        const key = `${message.id}-${index}`;

        switch (part.type) {
          // Free-form text from the model is intentionally hidden — the
          // structured tool outputs (Analysis, Summary, Subtasks) already
          // convey everything; raw text just duplicates the Summary block.
          case "text":
            return null;

          case "tool-analyzeTask":
            switch (part.state) {
              case "input-streaming":
                return <ThinkingRow key={key} label="Analyzing task" />;
              case "input-available":
              case "output-available":
                return (
                  <AnalyzeCard
                    key={key}
                    verdict={part.input.verdict}
                    reasoning={part.input.reasoning}
                  />
                );
              case "output-error":
                return <ErrorRow key={key} text={part.errorText} />;
            }
            return null;

          case "tool-askClarifyingQuestion": {
            const question = part.input?.question ?? "";
            switch (part.state) {
              case "input-streaming":
                return <ThinkingRow key={key} label="Thinking of a question" />;
              case "input-available":
                return (
                  <ClarificationForm
                    key={key}
                    question={question}
                    onSubmit={(answer) =>
                      onAnswerClarification(part.toolCallId, answer)
                    }
                  />
                );
              case "output-available":
                return (
                  <ClarificationDone
                    key={key}
                    question={question}
                    answer={String(part.output ?? "")}
                  />
                );
              case "output-error":
                return <ErrorRow key={key} text={part.errorText} />;
            }
            return null;
          }

          case "tool-proposeSubtasks":
            switch (part.state) {
              case "input-streaming":
                return <ThinkingRow key={key} label="Drafting subtasks" />;
              case "input-available":
              case "output-available": {
                const subtasks = part.input?.subtasks ?? [];
                if (subtasks.length === 0) return null;
                return (
                  <SubtasksCard
                    key={key}
                    reasoning={part.input?.reasoning ?? ""}
                    subtasks={subtasks}
                    onSave={onSaveSubtasks}
                    isSaving={isSaving}
                    finalized={part.state === "output-available"}
                  />
                );
              }
              case "output-error":
                return <ErrorRow key={key} text={part.errorText} />;
            }
            return null;

          default:
            return null;
        }
      })}
    </div>
  );
}

// — Building blocks —

function ThinkingRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Loader2 className="size-3.5 animate-spin" />
      <span>{label}…</span>
    </div>
  );
}

function ErrorRow({ text }: { text?: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
      <span>{text ?? "Something went wrong"}</span>
    </div>
  );
}

function AnalyzeCard({
  verdict,
  reasoning,
}: {
  verdict: keyof typeof VERDICT_LABEL;
  reasoning: string;
}) {
  return (
    <div className="rounded-md border border-border/60 bg-card/50 p-3">
      <div className="flex items-center gap-2 text-xs">
        <Sparkles className="size-3.5 text-muted-foreground" />
        <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
          Analysis
        </span>
        <span
          className={cn(
            "ml-auto rounded border px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase",
            VERDICT_CLASS[verdict],
          )}
        >
          {VERDICT_LABEL[verdict]}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed">{reasoning}</p>
    </div>
  );
}

function ClarificationForm({
  question,
  onSubmit,
}: {
  question: string;
  onSubmit: (answer: string) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
      <div className="flex items-start gap-2">
        <MessageCircleQuestion className="mt-0.5 size-4 shrink-0 text-amber-300" />
        <p className="text-sm leading-relaxed">{question}</p>
      </div>
      <form
        className="mt-3 flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = value.trim();
          if (!trimmed) return;
          onSubmit(trimmed);
        }}
      >
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Type your answer…"
          autoFocus
          className="h-8 text-sm"
        />
        <Button type="submit" size="sm" disabled={!value.trim()}>
          <Send className="size-3.5" />
          Send
        </Button>
      </form>
    </div>
  );
}

function ClarificationDone({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div className="rounded-md border border-border/60 bg-card/50 p-3">
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <MessageCircleQuestion className="mt-0.5 size-4 shrink-0" />
        <span>{question}</span>
      </div>
      <div className="mt-2 flex items-start gap-2 text-sm">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
        <span className="font-medium">{answer}</span>
      </div>
    </div>
  );
}

function SubtasksCard({
  reasoning,
  subtasks,
  onSave,
  isSaving,
  finalized,
}: {
  reasoning: string;
  subtasks: { title: string }[];
  onSave: (items: { title: string }[]) => void;
  isSaving: boolean;
  finalized: boolean;
}) {
  // Track *unselected* indices instead of selected — proposed subtasks have
  // no stable IDs, and the agent may still be streaming new items in. Storing
  // opt-outs keeps "select all" as the default and lets new streamed items
  // stay selected without any effect/sync code.
  const [unselected, setUnselected] = useState<Set<number>>(() => new Set());

  const toggleIndex = (i: number) =>
    setUnselected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const isSelected = (i: number) => !unselected.has(i);
  const selectedItems = subtasks.filter((_, i) => isSelected(i));
  const selectedCount = selectedItems.length;
  const allSelected = unselected.size === 0;

  const handleSave = () => {
    if (selectedItems.length === 0) return;
    onSave(selectedItems);
  };

  return (
    <div className="rounded-md border border-border/60 bg-card/50 p-3">
      <div className="flex items-center gap-2 text-xs">
        <Sparkles className="size-3.5 text-muted-foreground" />
        <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
          Suggested subtasks
        </span>
        {finalized && subtasks.length > 1 && (
          <button
            type="button"
            onClick={() =>
              allSelected
                ? setUnselected(new Set(subtasks.map((_, i) => i)))
                : setUnselected(new Set())
            }
            className="ml-auto cursor-pointer text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        )}
      </div>

      <ul className="mt-3 space-y-1.5 text-sm">
        {subtasks.map((subtask, i) => {
          const inputId = `proposed-subtask-${i}`;
          const selected = isSelected(i);
          return (
            <li key={i} className="flex items-start gap-2 leading-relaxed">
              {finalized ? (
                <Checkbox
                  id={inputId}
                  checked={selected}
                  onCheckedChange={() => toggleIndex(i)}
                  className="mt-0.5"
                />
              ) : (
                <span className="mt-0.5 inline-block w-5 shrink-0 font-mono text-xs text-muted-foreground">
                  {i + 1}.
                </span>
              )}
              <label
                htmlFor={finalized ? inputId : undefined}
                className={cn(
                  "flex-1",
                  finalized && "cursor-pointer",
                  finalized && !selected && "text-muted-foreground line-through",
                )}
              >
                {subtask.title}
              </label>
            </li>
          );
        })}
      </ul>

      {reasoning && (
        <div className="mt-3 space-y-1">
          <div className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            Summary
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {reasoning}
          </p>
        </div>
      )}

      {finalized && (
        <div className="mt-3 flex justify-end">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || selectedCount === 0}
          >
            {isSaving
              ? "Adding…"
              : `Add ${selectedCount} ${selectedCount === 1 ? "subtask" : "subtasks"}`}
          </Button>
        </div>
      )}
    </div>
  );
}
