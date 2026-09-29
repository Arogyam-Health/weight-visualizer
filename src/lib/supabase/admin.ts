import { createClient } from "@supabase/supabase-js";
import { getConfig } from "@/lib/config";

export function getAdminClient() {
  const config = getConfig();
  return createClient(config.NEXT_PUBLIC_SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
}
