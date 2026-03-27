export function ProductDetailSkeleton() {
  return (
    <section className="app-container animate-pulse pb-8 pt-8 md:pt-10">
      <div className="h-4 w-64 rounded-full bg-white/10" />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="surface-card p-4">
            <div className="h-[420px] rounded-[28px] bg-white/[0.06] md:h-[560px]" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="surface-soft h-28 rounded-[22px] bg-white/[0.06]" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex gap-2">
            <div className="h-7 w-24 rounded-full bg-white/[0.08]" />
            <div className="h-7 w-28 rounded-full bg-white/[0.08]" />
          </div>
          <div>
            <div className="h-12 max-w-xl rounded-[20px] bg-white/[0.08]" />
            <div className="mt-4 h-24 rounded-[24px] bg-white/[0.06]" />
          </div>
          <div className="grid gap-3 rounded-[26px] border border-white/10 bg-white/[0.03] p-5 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index}>
                <div className="h-3 w-20 rounded-full bg-white/10" />
                <div className="mt-2 h-5 w-28 rounded-full bg-white/[0.06]" />
              </div>
            ))}
          </div>
          <div className="surface-card p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="h-10 w-32 rounded-[18px] bg-white/[0.08]" />
                <div className="mt-3 h-4 w-44 rounded-full bg-white/[0.06]" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-28 rounded-full bg-white/[0.08]" />
                <div className="h-12 w-40 rounded-2xl bg-white/[0.08]" />
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="h-24 rounded-[22px] bg-white/[0.06]" />
              <div className="h-24 rounded-[22px] bg-white/[0.06]" />
            </div>
          </div>
          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
            <div className="h-7 w-28 rounded-[14px] bg-white/[0.08]" />
            <div className="mt-3 h-24 rounded-[20px] bg-white/[0.06]" />
            <div className="mt-6 h-7 w-20 rounded-[14px] bg-white/[0.08]" />
            <div className="mt-3 flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-9 w-24 rounded-full bg-white/[0.06]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
