import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import {
  canUseMockFallbacks,
  formatSupabaseEnvErrorMessage,
  getSupabaseEnvStatus,
} from "@/lib/env";
import { hasSupabaseEnv } from "@/lib/supabase/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type AuthProfile = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "email" | "full_name" | "role"
>;

const ADMIN_ROLES = new Set<AppRole>(["admin", "staff"]);

export function canAccessAdmin(role?: AppRole | null) {
  return role ? ADMIN_ROLES.has(role) : false;
}

function isMissingAuthSessionError(message?: string) {
  return message?.toLowerCase().includes("auth session missing") ?? false;
}

export async function getCurrentSessionProfile() {
  if (!hasSupabaseEnv()) {
    const envStatus = getSupabaseEnvStatus();

    if (canUseMockFallbacks()) {
      return {
        user: null,
        profile: null,
      };
    }

    if (envStatus.kind !== "configured") {
      throw new Error(formatSupabaseEnvErrorMessage(envStatus));
    }
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    if (isMissingAuthSessionError(userError.message)) {
      return {
        user: null,
        profile: null,
      };
    }

    throw new Error(`[auth] No se pudo resolver la sesion actual: ${userError.message}`);
  }

  if (!user) {
    return {
      user: null,
      profile: null,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`[auth] No se pudo cargar el profile actual: ${profileError.message}`);
  }

  return {
    user,
    profile: (profile ?? null) as AuthProfile | null,
  };
}

export async function requireAdminAccess(): Promise<{
  user: User;
  profile: AuthProfile;
}> {
  const { user, profile } = await getCurrentSessionProfile();

  if (!user) {
    redirect("/login");
  }

  if (!profile || !canAccessAdmin(profile.role)) {
    redirect("/");
  }

  return {
    user,
    profile,
  };
}
