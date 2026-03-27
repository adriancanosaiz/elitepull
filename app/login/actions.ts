"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  canUseMockFallbacks,
  formatSupabaseEnvErrorMessage,
  getSupabaseEnvStatus,
} from "@/lib/env";
import { canAccessAdmin } from "@/lib/auth/admin";
import { hasSupabaseEnv } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().trim().email("Introduce un email valido."),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres."),
});

function buildLoginRedirect(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const query = searchParams.toString();

  return query ? `/login?${query}` : "/login";
}

export async function loginAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    const envStatus = getSupabaseEnvStatus();

    if (canUseMockFallbacks()) {
      redirect(
        buildLoginRedirect({
          error: "Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para usar login.",
        }),
      );
    }

    if (envStatus.kind !== "configured") {
      throw new Error(formatSupabaseEnvErrorMessage(envStatus));
    }
  }

  const parsedCredentials = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedCredentials.success) {
    redirect(
      buildLoginRedirect({
        error: parsedCredentials.error.issues[0]?.message ?? "Revisa tus credenciales.",
      }),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { email, password } = parsedCredentials.data;
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(
      buildLoginRedirect({
        error: "No hemos podido iniciar sesion con esas credenciales.",
      }),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      buildLoginRedirect({
        error: "La sesion no se ha podido establecer correctamente.",
      }),
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const profileRole = (profile as Pick<
    Database["public"]["Tables"]["profiles"]["Row"],
    "role"
  > | null)?.role;

  if (canAccessAdmin(profileRole)) {
    redirect("/admin");
  }

  redirect(
    buildLoginRedirect({
      notice: "Sesion iniciada, pero tu cuenta no tiene acceso al area admin.",
    }),
  );
}

export async function logoutAction() {
  if (!hasSupabaseEnv()) {
    const envStatus = getSupabaseEnvStatus();

    if (canUseMockFallbacks()) {
      redirect("/login");
    }

    if (envStatus.kind !== "configured") {
      throw new Error(formatSupabaseEnvErrorMessage(envStatus));
    }
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
