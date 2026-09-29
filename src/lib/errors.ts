import { ZodError } from "zod";
export type ErrorCode = "AUTH_REQUIRED" | "CONSENT_REQUIRED" | "INVALID_IMAGE" | "INVALID_MEASUREMENTS" | "CATEGORY_NOT_ELIGIBLE" | "DAILY_LIMIT_REACHED" | "CATEGORY_LIMIT_REACHED" | "IDEMPOTENCY_CONFLICT" | "UPLOAD_EXPIRED" | "JOB_NOT_FOUND" | "INTERNAL_ERROR";
export class AppError extends Error { constructor(public readonly code: ErrorCode, message: string, public readonly status = 400) { super(message); } }
export function errorResponse(error: unknown): Response {
  const appError = error instanceof AppError ? error : error instanceof ZodError ? new AppError("INVALID_MEASUREMENTS", "Invalid request values", 400) : error instanceof Error && ["INVALID_HEIGHT", "INVALID_WEIGHT"].includes(error.message) ? new AppError("INVALID_MEASUREMENTS", "Height or weight is outside the allowed range", 400) : new AppError("INTERNAL_ERROR", "An unexpected error occurred", 500);
  return Response.json({ error: { code: appError.code, message: appError.message } }, { status: appError.status });
}
