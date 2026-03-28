import type { ReactNode } from "react";

import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";

export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="atmosphere-drift absolute left-[-16%] top-[4%] h-[480px] w-[480px] rounded-full bg-cyan-400/10 blur-[150px]" />
        <div className="atmosphere-drift absolute right-[-10%] top-[12%] h-[360px] w-[360px] rounded-full bg-amber-300/10 blur-[140px]" />
        <div className="atmosphere-drift absolute bottom-[-16%] left-[8%] h-[420px] w-[420px] rounded-full bg-rose-500/10 blur-[160px]" />
        <div className="absolute inset-0 collector-constellation opacity-40" />
        <div className="absolute inset-0 subtle-grid opacity-[0.14]" />
        <div className="absolute inset-0 kinetic-lines opacity-[0.12]" />
        <div className="absolute inset-0 collector-vignette opacity-70" />
      </div>

      <Header />
      <main className="relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
