import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  canUseMockFallbacks,
  formatSupabaseEnvErrorMessage,
  getSupabaseEnvStatus,
} from "@/lib/env";
import { getRequiredPublicSupabaseEnv } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function updateSession(request: NextRequest) {
  const envStatus = getSupabaseEnvStatus();

  if (envStatus.kind !== "configured") {
    if (canUseMockFallbacks()) {
      return NextResponse.next({
        request,
      });
    }

    throw new Error(formatSupabaseEnvErrorMessage(envStatus));
  }

  let response = NextResponse.next({
    request,
  });
  const env = getRequiredPublicSupabaseEnv();

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  await supabase.auth.getUser();

  return response;
}
