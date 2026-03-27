import { z } from "zod";

const nodeEnvSchema = z.enum(["development", "test", "production"]).default("development");

const supabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .trim()
    .url("NEXT_PUBLIC_SUPABASE_URL debe ser una URL valida"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .trim()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY no puede estar vacia"),
});

export type SupabaseRuntimeEnv = z.infer<typeof supabaseEnvSchema>;

export type SupabaseEnvStatus =
  | {
      kind: "configured";
      env: SupabaseRuntimeEnv;
    }
  | {
      kind: "missing";
      issues: string[];
    }
  | {
      kind: "invalid";
      issues: string[];
    };

export function getNodeEnv() {
  return nodeEnvSchema.parse(process.env.NODE_ENV);
}

export function isProductionEnvironment() {
  return getNodeEnv() === "production";
}

export function isDevelopmentEnvironment() {
  return getNodeEnv() === "development";
}

export function isBuildEnvironment() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

export function canUseMockFallbacks() {
  return isDevelopmentEnvironment() || isBuildEnvironment();
}

export function getSupabaseEnvStatus(): SupabaseEnvStatus {
  const rawEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  const missingKeys = Object.entries(rawEnv)
    .filter(([, value]) => !value?.trim())
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    return {
      kind: "missing",
      issues: missingKeys.map((key) => `Falta la variable ${key}`),
    };
  }

  const parsedEnv = supabaseEnvSchema.safeParse(rawEnv);

  if (!parsedEnv.success) {
    return {
      kind: "invalid",
      issues: parsedEnv.error.issues.map((issue) => issue.message),
    };
  }

  return {
    kind: "configured",
    env: parsedEnv.data,
  };
}

export function formatSupabaseEnvErrorMessage(
  status: Exclude<SupabaseEnvStatus, { kind: "configured" }>,
) {
  const details = status.issues.join(". ");

  return `[supabase] Configuracion invalida para el catalogo publico. ${details}.`;
}
