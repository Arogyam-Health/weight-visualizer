import { requireStoredUser } from "@/lib/auth/server-auth";
import { errorResponse, AppError } from "@/lib/errors";
import { getConfig } from "@/lib/config";
import { getAdminClient } from "@/lib/supabase/admin";
import { getStorageProvider } from "@/lib/storage/factory";
export async function GET(request: Request, context: { params: Promise<{ jobId: string }> }) { try { const user = await requireStoredUser(request); const { jobId } = await context.params; const { data, error } = await getAdminClient().from("wv_generation_jobs").select("*").eq("id", jobId).eq("user_id", user.id).single(); if (error || !data) throw new AppError("JOB_NOT_FOUND", "Job not found", 404); let resultUrl: string | undefined; if (data.status === "SUCCEEDED" && data.result_storage_key && new Date(data.expires_at) > new Date()) resultUrl = await getStorageProvider().getSecureUrl(data.result_storage_key, getConfig().SECURE_URL_TTL_SECONDS); return Response.json({ data: { ...data, resultUrl } }); } catch (error) { return errorResponse(error); } }
