import { BadgeCheck, MessageSquareMore, ShieldCheck, Truck } from "lucide-react";

import { benefits } from "@/data/site";

const icons = {
  shipping: Truck,
  stock: BadgeCheck,
  secure: ShieldCheck,
  support: MessageSquareMore,
} as const;

export function BenefitStrip() {
  return (
    <section className="app-container py-10">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {benefits.map((benefit) => {
          const Icon = icons[benefit.id as keyof typeof icons];

          return (
            <div key={benefit.id} className="surface-soft px-5 py-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold text-white">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{benefit.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
