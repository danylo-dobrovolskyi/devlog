"use client";

// Lightweight pub/sub for opening a task's detail dialog from anywhere in
// the app. Used by the focus banner to open a card's Detail dialog without
// prop-drilling state through TaskList → TaskCard.
//
// Implementation note: a single in-memory EventTarget is simpler than a
// React Context here, because the consumers (TaskCard) are listeners that
// only care about their own taskId.

const target =
  typeof window === "undefined" ? new EventTarget() : new EventTarget();
const OPEN_DETAIL_EVENT = "devlog:open-task-detail";

export function openTaskDetail(taskId: string) {
  target.dispatchEvent(
    new CustomEvent<string>(OPEN_DETAIL_EVENT, { detail: taskId }),
  );
}

export function onOpenTaskDetail(handler: (taskId: string) => void) {
  const listener = (event: Event) => {
    const ce = event as CustomEvent<string>;
    handler(ce.detail);
  };
  target.addEventListener(OPEN_DETAIL_EVENT, listener);
  return () => target.removeEventListener(OPEN_DETAIL_EVENT, listener);
}
