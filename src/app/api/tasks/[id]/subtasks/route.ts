import { NextResponse, type NextRequest } from "next/server";

import { createSubtaskInputSchema } from "@/features/tasks/schemas";
import {
  createSubtask,
  listSubtasks,
} from "@/features/tasks/server/subtasks.service";
import { toErrorResponse } from "@/lib/api-error";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const subtasks = await listSubtasks(id);
    return NextResponse.json({ subtasks });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input = createSubtaskInputSchema.parse(body);
    const subtask = await createSubtask(id, input);
    return NextResponse.json({ subtask }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
