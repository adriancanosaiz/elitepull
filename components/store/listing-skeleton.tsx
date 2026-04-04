import { SkeletonCard } from "@/components/store/skeleton-card";

export function ListingSkeleton() {
  return (
    <section className="app-container pb-8 pt-8 md:pt-10">
      <div className="surface-panel relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
        <div className="h-4 w-36 rounded-full bg-white/10" />
        <div className="mt-6 h-4 w-32 rounded-full bg-white/10" />
        <div className="mt-5 h-12 max-w-xl rounded-[20px] bg-white/10" />
        <div className="mt-4 h-20 max-w-3xl rounded-[24px] bg-white/[0.06]" />
        <div className="mt-6 flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-10 w-28 rounded-full bg-white/[0.06]" />
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="surface-card h-fit p-5">
          <div className="h-4 w-20 rounded-full bg-white/10" />
          <div className="mt-3 h-8 w-44 rounded-[18px] bg-white/[0.06]" />
          <div className="mt-6 space-y-6">
            {Array.from({ length: 4 }).map((_, blockIndex) => (
              <div key={blockIndex}>
                <div className="mb-3 h-3 w-24 rounded-full bg-white/10" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 4 }).map((_, pillIndex) => (
                    <div
                      key={pillIndex}
                      className="h-9 w-24 rounded-full bg-white/[0.06]"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="space-y-5">
          <div className="surface-soft flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="h-4 w-48 rounded-full bg-white/10" />
            <div className="h-11 w-52 rounded-2xl bg-white/[0.06]" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
