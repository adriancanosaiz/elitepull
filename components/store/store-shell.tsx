import type { ReactNode } from "react";

import { BottomNav } from "@/components/store/bottom-nav";
import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";

export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.04),transparent_26%),linear-gradient(180deg,rgba(9,12,19,0.2),transparent_34%)] md:hidden" />
        <div className="atmosphere-drift absolute left-[-16%] top-[4%] hidden h-[480px] w-[480px] rounded-full bg-cyan-400/10 blur-[150px] md:block" />
        <div className="atmosphere-drift absolute right-[-10%] top-[12%] hidden h-[360px] w-[360px] rounded-full bg-amber-300/10 blur-[140px] lg:block" />
        <div className="atmosphere-drift absolute bottom-[-16%] left-[8%] hidden h-[420px] w-[420px] rounded-full bg-rose-500/10 blur-[160px] xl:block" />
        <div className="absolute inset-0 hidden collector-constellation opacity-40 md:block" />
        <div className="absolute inset-0 hidden subtle-grid opacity-[0.14] md:block" />
        <div className="absolute inset-0 hidden kinetic-lines opacity-[0.12] lg:block" />
        <div className="absolute inset-0 collector-vignette opacity-70" />
      </div>

      <Header />
      <main className="relative z-10 pb-[76px] xl:pb-0">
        {children}
        <Footer />
      </main>
      <BottomNav />
    </div>
  );
}

