import { cleanupExpired } from "@/lib/jobs/cleanup";
import { errorResponse, AppError } from "@/lib/errors";
import { getConfig } from "@/lib/config";
export async function POST(request: Request) { try { const secret = getConfig().CLEANUP_SECRET; if (!secret || request.headers.get("x-cleanup-secret") !== secret) throw new AppError("AUTH_REQUIRED", "Unauthorized", 401); await cleanupExpired(); return Response.json({ data: { cleaned: true } }); } catch (error) { return errorResponse(error); } }
