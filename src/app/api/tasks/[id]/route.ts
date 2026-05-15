import { NextResponse, type NextRequest } from "next/server";

import { updateTaskInputSchema } from "@/features/tasks/schemas";
import {
  deleteTask,
  getTask,
  updateTask,
} from "@/features/tasks/server/tasks.service";
import { toErrorResponse } from "@/lib/api-error";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const task = await getTask(id);
    return NextResponse.json({ task });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input = updateTaskInputSchema.parse(body);
    const task = await updateTask(id, input);
    return NextResponse.json({ task });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    await deleteTask(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
