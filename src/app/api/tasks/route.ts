import { NextResponse, type NextRequest } from "next/server";

import {
  createTaskInputSchema,
  taskQuerySchema,
} from "@/features/tasks/schemas";
import {
  createTask,
  listTasks,
} from "@/features/tasks/server/tasks.service";
import { toErrorResponse } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const query = taskQuerySchema.parse(params);
    const tasks = await listTasks(query);
    return NextResponse.json({ tasks: tasks.tasks, total: tasks.total });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createTaskInputSchema.parse(body);
    const task = await createTask(input);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
