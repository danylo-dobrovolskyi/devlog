# DevLog

A lightweight engineering task tracker on Next.js with SQLite persistence and two **real AI agents** (multi-step workflows with tools): task decomposition into subtasks, and a “what to start today” planner over the current backlog.

---

## Getting started

**Prerequisites:** Node.js 20+, OpenAI API key for AI features.

```bash
npm install
```

Create a `.env` in the project root. Copy the variable **names** from **`.env.example`** and paste your values.

Minimal variables:

- **`OPENAI_API_KEY`** — required for the two agents  
- **`DATABASE_URL`** — SQLite path (see `.env.example`)  
- **`OPENAI_MODEL`** — optional; if you omit it, the app uses a **built-in default** (`gpt-4o-mini`), overridable when you prefer another model  

```bash
npm run db:migrate   # creates/updates the local DB (e.g. prisma/dev.db)
npm run db:seed      # optional sample data
npm run dev
```

Open **http://localhost:3000**. Useful scripts: `npm run lint`, `npm run db:studio`, `npm run build` / `npm run start`.

---

## Stack

- **Next.js 16 (App Router)** + **React 19** + **TypeScript** — UI, SSR-friendly routing, **`src/app/api/*/route.ts`** handlers for REST + streamed AI payloads.  
- **Tailwind CSS v4** + **shadcn/ui** — layout, dialogs, selects, grounded in Radix-style primitives (`components/ui`).  
- **Prisma ORM + SQLite** — `Task` / `Subtask`, migrations under `prisma/migrations`, local file DB for zero infra.  
- **TanStack Query** — server state for lists, mutations, optimistic toggles where it pays off (`tasksKeys.*` invalidation).  
- **react-hook-form + Zod** — create/edit payloads aligned with backend schemas.  
- **Vercel AI SDK (`ai`)** — `ToolLoopAgent` for multi-step server agents, streamed UI-message format consumed with **`useChat`** from **`@ai-sdk/react`** on the client; **`@ai-sdk/openai`** talks to OpenAI-compatible APIs.

---

## Repository structure

```
src/app/                 App Router: pages, layouts, API route handlers
src/components/          Shared layout and UI primitives (shadcn)
src/features/tasks/      Task domain — Zod schemas, Prisma-backed services,
                         React Query hooks, components, typed API client
src/features/ai/         Agents (prompts, tools), streaming hooks, trace UI
```

Server-side task rules stay in **`src/features/tasks/server`** so route files stay thin and logic is reusable.

**API layout (under `src/app/api/`):**

- Tasks: `GET/POST /api/tasks`, `GET/PATCH/DELETE /api/tasks/:id`  
- Subtasks: `/api/tasks/:id/subtasks` (and bulk where implemented)  
- Agents (streaming, `@ai-sdk/react`-compatible chats): **`POST /api/ai/decompose`**, **`POST /api/ai/focus`**

---

## Design decisions & trade-offs

**Next.js API Routes instead of a standalone Express backend.** Spinning up a separate Node server would be **overkill** for this footprint:same deployable, fewer moving parts in `npm run dev`. One codebase keeps Zod and types aligned between handlers and UI. If the backend ever balloons, extracting domain logic into packages is simpler than rewriting from scratch—but we did not need that ceremony here.

**SQLite.** No Docker or hosted Postgres for reviewers. Trade-off: limited concurrent writes vs a real SaaS Postgres—fine for single-team demos and laptops.

**Today’s focus does not mutate the DB.** Read-only advisory with short rationale—auto-writing model output into priorities without user intent and audit is a UX trap many teams dislike; extension path is preview + apply / calendar linkage.

**Decomposition UX.** Breakdown appears when there are **no** subtasks yet—a blind re-run appends duplicated lines. Better product lane: Replace/Merge confirmations, editable rows after AI, maybe “discard draft” snapshots.

**Subtasks are deliberately thin for this exercise.** Shipping subtasks only as **`title + done`** keeps the backlog legible during the test sprint; the richer **lifecycle** (blocked, backlog, QA, per-sub-task status transitions, SLA fields, rollup into parent **`IN_PROGRESS` / `DONE`**, optional child tasks spun out for deep work, comment threads tied to checklist lines) belongs in **real SaaS** where compliance and dashboards matter—not in a focused demo where the story is CRUD plus two credible agents.

**Filters & sort in the URL.** Shareable links + stable refreshes; filter/sort changes reset **page** so you avoid empty numbered pages after tightening filters.

**Slack-style status snippet (classic “option C”).** Left out intentionally to deepen two agent flows first; incremental add is a **`POST /api/ai/task-update`** that packs task + subtasks into Slack-flavour copy + webhook.

**Today’s-focus plan caching** sits in **`sessionStorage`** until the tab ends; Regenerate wipes it—instant revisit without recomputing, scoped to one browser tab on purpose.

**Backlog hygiene as a roadmap item (would ship as agent #3 / “smart broom”).** Engineering teams bleed time pruning near-duplicate drafts and fossils that stagnate forever. Picture a guarded flow: classify candidates (normalized title overlaps, staleness thresholds), summarize each in plain language, and require **explicit** multi-delete or snooze—not silent automation—in line with trusting humans on irreversible deletes. Fits the assignment’s spirit of agentic tooling without pretending it landed in repo **v1**.

How the codebase was scaffolded with a coding agent and what broke or changed is in **`AGENT_LOG.md`**.
