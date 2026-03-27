import type { ReactNode } from "react";

import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";

export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-12%] top-[8%] h-[420px] w-[420px] rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="absolute right-[-8%] top-[14%] h-[320px] w-[320px] rounded-full bg-amber-400/12 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[18%] h-[360px] w-[360px] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute inset-0 subtle-grid opacity-20" />
      </div>

      <Header />
      <main className="relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
