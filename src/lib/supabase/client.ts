import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database.types";

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://avssqxjtmcrbsmgoudod.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_GOm4to5aHKHp9whcCCSBpA_kqfla5VG";

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
