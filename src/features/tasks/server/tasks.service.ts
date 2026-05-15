import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { notFound } from "@/lib/api-error";

import type {
  CreateTaskInput,
  TaskQuery,
  UpdateTaskInput,
} from "../types";

import { TASKS_PAGE_SIZE } from "../schemas";

const PRIORITY_RANK: Record<string, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const taskInclude = {
  subtasks: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
} satisfies Prisma.TaskInclude;

type ListedTask = Prisma.TaskGetPayload<{ include: typeof taskInclude }>;

export async function listTasks(query: TaskQuery): Promise<{
  tasks: ListedTask[];
  total: number;
}> {
  const where: Prisma.TaskWhereInput = query.status
    ? { status: query.status }
    : {};

  const orderBy: Prisma.TaskOrderByWithRelationInput =
    query.sortBy === "createdAt"
      ? { createdAt: query.order }
      : { createdAt: "desc" };

  if (query.fetchAll === "true") {
    const tasks = await prisma.task.findMany({
      where,
      orderBy,
      include: taskInclude,
    });

    if (query.sortBy === "priority") {
      const direction = query.order === "asc" ? 1 : -1;
      tasks.sort(
        (a, b) =>
          direction * (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]),
      );
    }

    return { tasks, total: tasks.length };
  }

  const requestedPage = query.page ?? 1;

  if (query.sortBy === "createdAt") {
    const total = await prisma.task.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / TASKS_PAGE_SIZE));
    const page = Math.min(requestedPage, totalPages);
    const skip = (page - 1) * TASKS_PAGE_SIZE;

    const tasks = await prisma.task.findMany({
      where,
      orderBy,
      skip,
      take: TASKS_PAGE_SIZE,
      include: taskInclude,
    });
    return { tasks, total };
  }

  const lite = await prisma.task.findMany({
    where,
    select: { id: true, priority: true },
  });

  const direction = query.order === "asc" ? 1 : -1;
  lite.sort(
    (a, b) =>
      direction * (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]),
  );

  const total = lite.length;
  const totalPages = Math.max(1, Math.ceil(total / TASKS_PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * TASKS_PAGE_SIZE;
  const ids = lite.slice(skip, skip + TASKS_PAGE_SIZE).map((row) => row.id);

  if (ids.length === 0) {
    return { tasks: [], total };
  }

  const unordered = await prisma.task.findMany({
    where: { id: { in: ids } },
    include: taskInclude,
  });
  const byId = new Map(unordered.map((t) => [t.id, t]));
  const tasks = ids
    .map((id) => byId.get(id))
    .filter((t): t is NonNullable<typeof t> => t != null);

  return { tasks, total };
}

export async function getTask(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: taskInclude,
  });

  if (!task) throw notFound("Task");
  return task;
}

export async function createTask(input: CreateTaskInput) {
  return prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      status: input.status ?? "TODO",
      priority: input.priority ?? "MEDIUM",
    },
    include: taskInclude,
  });
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  try {
    return await prisma.task.update({
      where: { id },
      data: input,
      include: taskInclude,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw notFound("Task");
    }
    throw error;
  }
}

export async function deleteTask(id: string) {
  try {
    await prisma.task.delete({ where: { id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw notFound("Task");
    }
    throw error;
  }
}
