const adminModules = [
  {
    id: "productos",
    eyebrow: "Productos",
    title: "Catalogo y estructura de producto",
    description:
      "Aqui conectaremos CRUD, stock, featured, preventas y sincronizacion editorial del storefront.",
  },
  {
    id: "pedidos",
    eyebrow: "Pedidos",
    title: "Pipeline de pedidos",
    description:
      "Listado y detalle V1 para revisar email, total, estado, stripe ids e items snapshot.",
  },
  {
    id: "clientes",
    eyebrow: "Clientes",
    title: "Profiles y permisos",
    description:
      "Base preparada para consultar perfiles, roles y gestionar acceso interno sin mezclarlo con el storefront.",
  },
  {
    id: "media-catalogo",
    eyebrow: "Media / catalogo",
    title: "Uploads, storage y seeds",
    description:
      "Punto natural para enlazar la operativa de media, catalog.json e importaciones futuras desde el admin.",
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-3">
        <DashboardMetric
          label="Auth"
          value="Supabase SSR"
          description="Sesion por cookies y proteccion server-side."
        />
        <DashboardMetric
          label="Roles"
          value="admin / staff / customer"
          description="Autorizacion simple con `profiles.role`."
        />
        <DashboardMetric
          label="Estado"
          value="Shell listo"
          description="Base operativa preparada para crecer."
        />
      </section>

      <section className="surface-panel p-6 md:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Siguiente fase
        </p>
        <h2 className="mt-3 font-heading text-2xl font-semibold text-white">
          El area admin ya tiene autenticacion, sesion SSR y cierre de acceso por rol
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Todavia no hay CRUD completo ni panel avanzado, pero la base ya es correcta: login con
          Supabase, proteccion centralizada de `/admin`, role guard y shell interno listo para
          crecer sin rehacer nada esencial.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {adminModules.map((module) => (
          <div
            key={module.id}
            id={module.id}
            className="rounded-[30px] border border-white/10 bg-black/20 p-6 shadow-[0_22px_60px_rgba(2,6,23,0.18)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/75">
              {module.eyebrow}
            </p>
            <h3 className="mt-3 font-heading text-2xl font-semibold text-white">
              {module.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">{module.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function DashboardMetric({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 font-heading text-2xl font-semibold text-white">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}
