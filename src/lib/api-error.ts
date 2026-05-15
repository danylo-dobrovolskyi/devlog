import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const notFound = (resource = "Resource") =>
  new AppError(404, `${resource} not found`, "not_found");

export const badRequest = (message: string) =>
  new AppError(400, message, "bad_request");

type ErrorBody = {
  error: { message: string; code?: string; details?: unknown };
};

export function toErrorResponse(error: unknown): NextResponse<ErrorBody> {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code } },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          message: "Validation failed",
          code: "validation_error",
          details: error.issues,
        },
      },
      { status: 400 },
    );
  }

  console.error("Unhandled API error:", error);
  return NextResponse.json(
    { error: { message: "Internal server error", code: "internal_error" } },
    { status: 500 },
  );
}
