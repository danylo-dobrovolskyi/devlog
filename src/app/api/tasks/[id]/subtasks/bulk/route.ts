import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createSubtasksBulk } from "@/features/tasks/server/subtasks.service";
import { toErrorResponse } from "@/lib/api-error";

const bulkInputSchema = z.object({
  items: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(200),
      }),
    )
    .min(1)
    .max(20),
});

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { items } = bulkInputSchema.parse(body);
    const subtasks = await createSubtasksBulk(id, items);
    return NextResponse.json({ subtasks }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
