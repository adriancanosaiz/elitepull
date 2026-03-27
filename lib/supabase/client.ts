import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  canUseMockFallbacks,
  formatSupabaseEnvErrorMessage,
  getSupabaseEnvStatus,
  type SupabaseRuntimeEnv,
} from "../env";
import { getRequiredPublicSupabaseEnv } from "./config";
import type { Database } from "./database.types";

export type AppSupabaseClient = SupabaseClient<Database>;

function createSupabaseServerClient(env: SupabaseRuntimeEnv): AppSupabaseClient {
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        "X-Client-Info": "elitepull-web",
      },
    },
  });
}

export function hasSupabaseEnv() {
  return getSupabaseEnvStatus().kind === "configured";
}

export function getSupabasePublicClient(): AppSupabaseClient {
  return createSupabaseServerClient(getRequiredPublicSupabaseEnv());
}

export function getSupabaseServerClient(): AppSupabaseClient | null {
  const envStatus = getSupabaseEnvStatus();

  if (envStatus.kind === "configured") {
    return createSupabaseServerClient(envStatus.env);
  }

  if (!canUseMockFallbacks()) {
    throw new Error(formatSupabaseEnvErrorMessage(envStatus));
  }

  return null;
}
