import { formatSupabaseEnvErrorMessage, getSupabaseEnvStatus } from "@/lib/env";
import type { SupabaseRuntimeEnv } from "@/lib/env";

export function getRequiredPublicSupabaseEnv(): SupabaseRuntimeEnv {
  const envStatus = getSupabaseEnvStatus();

  if (envStatus.kind !== "configured") {
    throw new Error(formatSupabaseEnvErrorMessage(envStatus));
  }

  return envStatus.env;
}
