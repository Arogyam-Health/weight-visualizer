import { getAdminClient } from "@/lib/supabase/admin";
import { AppError } from "@/lib/errors";

export async function requireStoredUser(request: Request, supplied?: { userId?: unknown; phone?: unknown }): Promise<{ id: string; phone: string }> {
  const userId = typeof supplied?.userId === "string" ? supplied.userId : request.headers.get("x-user-id");
  const phone = typeof supplied?.phone === "string" ? supplied.phone : request.headers.get("x-phone");
  if (!userId || !phone) throw new AppError("AUTH_REQUIRED", "user_id and phone are required", 401);
  const { data, error } = await getAdminClient().from("users").select("id,phone").eq("id", userId).eq("phone", phone).maybeSingle();
  if (error || !data) throw new AppError("AUTH_REQUIRED", "User identity could not be verified", 401);
  return { id: data.id as string, phone: data.phone as string };
}
