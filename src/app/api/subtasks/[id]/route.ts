import { NextResponse, type NextRequest } from "next/server";

import { updateSubtaskInputSchema } from "@/features/tasks/schemas";
import {
  deleteSubtask,
  updateSubtask,
} from "@/features/tasks/server/subtasks.service";
import { toErrorResponse } from "@/lib/api-error";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input = updateSubtaskInputSchema.parse(body);
    const subtask = await updateSubtask(id, input);
    return NextResponse.json({ subtask });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    await deleteSubtask(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
