export function SkeletonCard() {
  return (
    <div className="surface-card flex h-full min-h-[500px] flex-col overflow-hidden border border-white/[0.08] bg-[linear-gradient(180deg,rgba(12,16,27,0.98),rgba(10,14,23,0.88))] p-0 shadow-[0_14px_36px_rgba(4,8,18,0.18)] rounded-[24px]">
      <div className="relative flex aspect-[4/5] m-4 mb-0 items-center justify-center overflow-hidden rounded-[20px] border border-white/[0.08] bg-white/[0.02]">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
      
      <div className="flex flex-1 flex-col p-5">
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full bg-white/5" />
          <div className="h-5 w-20 rounded-full bg-white/5" />
        </div>
        
        <div className="mt-4 h-6 w-3/4 rounded-lg bg-white/5" />
        <div className="mt-2 h-6 w-1/2 rounded-lg bg-white/5" />
        
        <div className="mt-4 h-4 w-full rounded-lg bg-white/5" />
        <div className="mt-2 h-4 w-4/5 rounded-lg bg-white/5" />
        
        <div className="mt-auto flex items-end justify-between pt-5">
          <div className="h-8 w-24 rounded-lg bg-white/5" />
          <div className="h-8 w-24 rounded-full bg-white/5" />
        </div>
      </div>
    </div>
  );
}
