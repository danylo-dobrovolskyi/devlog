import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { notFound } from "@/lib/api-error";

import type {
  CreateSubtaskInput,
  UpdateSubtaskInput,
} from "../types";

export async function listSubtasks(taskId: string) {
  return prisma.subtask.findMany({
    where: { taskId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
}

export async function createSubtask(taskId: string, input: CreateSubtaskInput) {
  await assertTaskExists(taskId);

  const nextOrder =
    input.order ??
    ((await prisma.subtask.aggregate({
      where: { taskId },
      _max: { order: true },
    }))._max.order ?? -1) + 1;

  return prisma.subtask.create({
    data: { taskId, title: input.title, order: nextOrder },
  });
}

export async function createSubtasksBulk(
  taskId: string,
  items: { title: string }[],
) {
  await assertTaskExists(taskId);

  const baseOrder =
    ((await prisma.subtask.aggregate({
      where: { taskId },
      _max: { order: true },
    }))._max.order ?? -1) + 1;

  await prisma.subtask.createMany({
    data: items.map((item, index) => ({
      taskId,
      title: item.title,
      order: baseOrder + index,
    })),
  });

  return listSubtasks(taskId);
}

export async function updateSubtask(
  id: string,
  input: UpdateSubtaskInput,
) {
  try {
    return await prisma.subtask.update({ where: { id }, data: input });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw notFound("Subtask");
    }
    throw error;
  }
}

export async function deleteSubtask(id: string) {
  try {
    await prisma.subtask.delete({ where: { id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw notFound("Subtask");
    }
    throw error;
  }
}

async function assertTaskExists(taskId: string) {
  const exists = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true },
  });
  if (!exists) throw notFound("Task");
}
