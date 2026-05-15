import { Suspense } from "react";

import { Header } from "@/components/layout/header";
import { FocusBanner } from "@/features/ai/components/focus-banner";
import { NewTaskButton } from "@/features/tasks/components/new-task-button";
import { TaskFilters } from "@/features/tasks/components/task-filters";
import { TaskList } from "@/features/tasks/components/task-list";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything your team is working on right now.
            </p>
          </div>
          <NewTaskButton />
        </div>

        <FocusBanner />

        <Suspense fallback={null}>
          <div className="mb-4">
            <TaskFilters />
          </div>
          <TaskList />
        </Suspense>
      </main>
    </>
  );
}
