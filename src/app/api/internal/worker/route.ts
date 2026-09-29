import { processOneJob } from "@/lib/jobs/worker";
import { errorResponse, AppError } from "@/lib/errors";
import { getConfig } from "@/lib/config";
export async function POST(request: Request) { try { const secret = getConfig().WORKER_SECRET; if (!secret || request.headers.get("x-worker-secret") !== secret) throw new AppError("AUTH_REQUIRED", "Unauthorized", 401); return Response.json({ data: { processed: await processOneJob() } }); } catch (error) { return errorResponse(error); } }
