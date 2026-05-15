import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tasks = [
  {
    title: "Fix flaky checkout integration test",
    description:
      "Test fails ~30% of CI runs near payment-redirect step. Suspect timing issue with stripe webhook stub. Stabilize before next release.",
    status: "IN_PROGRESS",
    priority: "HIGH",
  },
  {
    title: "Migrate logger from winston to pino",
    description:
      "winston is the slowest part of request lifecycle. Pino benchmarks are 4-5x faster. Touch every service that imports logger.",
    status: "TODO",
    priority: "MEDIUM",
  },
  {
    title: "Investigate 500s on /api/orders for EU region",
    description:
      "Sentry shows a spike of 500s starting last Thursday, only in eu-central-1. Root cause likely DB connection pool exhaustion.",
    status: "TODO",
    priority: "HIGH",
  },
  {
    title: "Update onboarding docs for new SDK release",
    description:
      "SDK v4 ships next week. Code samples and migration guide need updating in /docs.",
    status: "TODO",
    priority: "LOW",
  },
  {
    title: "Fix typo in dashboard empty state",
    description: "Says 'Their's nothing here yet' instead of 'There's'.",
    status: "TODO",
    priority: "LOW",
  },
  {
    title: "Add rate limiting to /api/auth/login",
    description:
      "Security audit flagged unbounded login attempts. Add token bucket per IP, 5 attempts / minute.",
    status: "TODO",
    priority: "HIGH",
  },
  {
    title: "Refactor TaskCard component",
    description:
      "Currently 400 LOC, mixes data fetching with presentation. Extract to container + presentational components.",
    status: "DONE",
    priority: "MEDIUM",
  },
] as const;

async function main() {
  await prisma.subtask.deleteMany();
  await prisma.task.deleteMany();

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log(`Seeded ${tasks.length} tasks.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
