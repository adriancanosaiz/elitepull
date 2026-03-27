"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { StoreShell } from "@/components/store/store-shell";

function isStandalonePath(pathname: string | null) {
  if (!pathname) {
    return false;
  }

  return pathname === "/login" || pathname.startsWith("/admin");
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isStandalonePath(pathname)) {
    return <div className="relative min-h-screen overflow-x-clip">{children}</div>;
  }

  return <StoreShell>{children}</StoreShell>;
}
