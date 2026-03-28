import type { ReactNode } from "react";

type LegalSection = {
  title: string;
  paragraphs: string[];
};

export function LegalPageShell({
  eyebrow,
  title,
  intro,
  sections,
  aside,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  aside?: ReactNode;
}) {
  return (
    <section className="app-container py-10 md:py-12">
      <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-[32px] border border-white/10 bg-black/20 p-6 md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/80">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-heading text-4xl font-semibold text-white md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 md:text-base">
            {intro}
          </p>

          <div className="mt-8 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-heading text-2xl font-semibold text-white">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-8 text-slate-300 md:text-base">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>

        <aside className="rounded-[32px] border border-white/10 bg-black/20 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Revision
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Estos textos son una base operativa para preproduccion. Sustituyelos por su version
            legal definitiva antes de lanzar pagos reales en produccion.
          </p>

          {aside ? <div className="mt-6">{aside}</div> : null}
        </aside>
      </div>
    </section>
  );
}
