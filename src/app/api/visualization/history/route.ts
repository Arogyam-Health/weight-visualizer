import { requireStoredUser } from "@/lib/auth/server-auth";
import { errorResponse } from "@/lib/errors";
import { getConfig } from "@/lib/config";
import { getAdminClient } from "@/lib/supabase/admin";
import { getStorageProvider } from "@/lib/storage/factory";

type HistoryJob = { status?: string; result_storage_key?: string | null; expires_at?: string; [key: string]: unknown };

export async function GET(request: Request) {
  try {
    const user = await requireStoredUser(request);
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 50);
    const cursor = url.searchParams.get("before");
    let query = getAdminClient().from("wv_image_uploads").select("*,wv_generation_jobs(*)").eq("user_id", user.id).eq("status", "ACTIVE").gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false }).limit(limit);
    if (cursor) query = query.lt("created_at", cursor);
    const { data, error } = await query;
    if (error) throw error;

    const storage = getStorageProvider();
    const ttl = getConfig().SECURE_URL_TTL_SECONDS;
    const history = await Promise.all((data ?? []).map(async (upload) => {
      const originalUrl = await storage.getSecureUrl(upload.storage_key, ttl);
      const jobs: HistoryJob[] = (Array.isArray(upload.wv_generation_jobs) ? upload.wv_generation_jobs : upload.wv_generation_jobs ? [upload.wv_generation_jobs] : []) as HistoryJob[];
      const generations = await Promise.all(jobs.map(async (job) => {
        const resultUrl = job.status === "SUCCEEDED" && job.result_storage_key && job.expires_at && new Date(job.expires_at) > new Date()
          ? await storage.getSecureUrl(job.result_storage_key, ttl)
          : undefined;
        return { ...job, resultUrl };
      }));
      return { ...upload, originalUrl, wv_generation_jobs: generations };
    }));

    return Response.json({ data: history });
  } catch (error) {
    return errorResponse(error);
  }
}
