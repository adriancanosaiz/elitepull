import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Layers3,
  Package,
  PackageSearch,
  Plus,
  ShoppingBag,
  SlidersHorizontal,
  Tags,
  TrendingUp,
} from "lucide-react";

import { getAdminDashboardMetrics } from "@/lib/admin/dashboard";
import { Button } from "@/components/ui/button";

export default async function AdminPage() {
  const metrics = await getAdminDashboardMetrics();

  return (
    <div className="space-y-8">

      {/* Métricas principales */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 mb-4">
          Resumen actual
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Boxes className="h-5 w-5" />}
            label="Productos en la tienda"
            value={String(metrics.totalProducts)}
            sub={`${metrics.activeProducts} visibles`}
            color="cyan"
          />
          <MetricCard
            icon={<ShoppingBag className="h-5 w-5" />}
            label="Pedidos recibidos"
            value={String(metrics.totalOrders)}
            sub={`${metrics.paidOrders} pagados`}
            color="emerald"
          />
          <MetricCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Pedidos hoy"
            value={String(metrics.todayOrders)}
            sub={`${metrics.pendingOrders} pendientes`}
            color="amber"
          />
          <MetricCard
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Sin stock"
            value={String(metrics.outOfStockProducts)}
            sub="productos activos agotados"
            color="rose"
          />
        </div>
      </section>

      {/* Acciones rápidas */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 mb-4">
          Acciones rápidas
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <QuickActionCard
            href="/admin/productos/nuevo"
            icon={<Plus className="h-6 w-6" />}
            title="Añadir producto"
            description="Crea un nuevo producto y ponlo a la venta en la tienda."
            cta="Crear ahora"
            accent
          />
          <QuickActionCard
            href="/admin/productos"
            icon={<Package className="h-6 w-6" />}
            title="Ver productos"
            description={`Tienes ${metrics.totalProducts} productos. Edita precios, stock o visibilidad.`}
            cta="Ir a productos"
          />
          <QuickActionCard
            href="/admin/pedidos"
            icon={<PackageSearch className="h-6 w-6" />}
            title="Ver pedidos"
            description={
              metrics.pendingOrders > 0
                ? `Tienes ${metrics.pendingOrders} pedido${metrics.pendingOrders > 1 ? "s" : ""} sin confirmar.`
                : "Todos los pedidos están al día."
            }
            cta="Ver pedidos"
            alert={metrics.pendingOrders > 0}
          />
        </div>
      </section>

      {/* Guía del catálogo */}
      <section className="rounded-[30px] border border-white/10 bg-black/20 p-6 md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/75">
          ¿Cómo funciona el catálogo?
        </p>
        <h2 className="mt-3 font-heading text-2xl font-semibold text-white">
          Para añadir un producto nuevo sigue este orden
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          El catálogo está organizado por niveles. Antes de crear un producto, asegúrate de que
          existen la marca, la expansión y el formato correspondientes.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <CatalogStep
            step="1"
            href="/admin/catalogo/marcas"
            icon={<Tags className="h-4 w-4" />}
            title="Marcas"
            description="Los juegos que vendéis: Pokémon, One Piece, Magic…"
          />
          <CatalogStep
            step="2"
            href="/admin/catalogo/expansiones"
            icon={<Layers3 className="h-4 w-4" />}
            title="Expansiones"
            description="Los sets dentro de cada marca: Scarlet & Violet, OP09…"
          />
          <CatalogStep
            step="3"
            href="/admin/catalogo/formatos"
            icon={<Boxes className="h-4 w-4" />}
            title="Formatos"
            description="El tipo de producto: Booster Pack, ETB, Bundle…"
          />
          <CatalogStep
            step="4"
            href="/admin/catalogo/configuracion"
            icon={<SlidersHorizontal className="h-4 w-4" />}
            title="Configuración"
            description="Une expansión + formato + idioma para habilitar el producto."
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href="/admin/productos/nuevo">
              <Plus className="h-4 w-4" />
              Añadir producto
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/admin/catalogo/marcas">
              Gestionar catálogo
            </Link>
          </Button>
        </div>
      </section>

      {/* Estado rápido */}
      {metrics.outOfStockProducts > 0 && (
        <section className="rounded-[28px] border border-rose-400/20 bg-rose-500/5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
              <div>
                <p className="text-sm font-semibold text-rose-100">
                  {metrics.outOfStockProducts} {metrics.outOfStockProducts === 1 ? "producto visible está" : "productos visibles están"} sin stock
                </p>
                <p className="mt-1 text-xs text-rose-300/80">
                  Los clientes pueden verlos en la tienda pero no pueden comprarlos. Actualiza el stock desde la lista de productos.
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0 border-rose-400/30 text-rose-100 hover:bg-rose-500/10">
              <Link href="/admin/productos">Ver productos</Link>
            </Button>
          </div>
        </section>
      )}

      {metrics.outOfStockProducts === 0 && metrics.totalProducts > 0 && (
        <section className="rounded-[28px] border border-emerald-400/20 bg-emerald-500/5 p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            <p className="text-sm text-emerald-100">
              Todo en orden — todos los productos activos tienen stock disponible.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: "cyan" | "emerald" | "amber" | "rose";
}) {
  const colorMap = {
    cyan: "text-cyan-300 bg-cyan-400/10 border-cyan-400/20",
    emerald: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
    amber: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    rose: "text-rose-300 bg-rose-400/10 border-rose-400/20",
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
      <div className={`inline-flex rounded-2xl border p-2.5 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="mt-4 font-heading text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-200">{label}</p>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </div>
  );
}

function QuickActionCard({
  href,
  icon,
  title,
  description,
  cta,
  accent = false,
  alert = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  accent?: boolean;
  alert?: boolean;
}) {
  const borderClass = accent
    ? "border-amber-400/25 bg-amber-400/5"
    : alert
      ? "border-orange-400/25 bg-orange-400/5"
      : "border-white/10 bg-black/20";

  return (
    <div className={`flex flex-col rounded-[28px] border p-5 ${borderClass}`}>
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${accent ? "border-amber-400/30 bg-amber-400/10 text-amber-300" : alert ? "border-orange-400/30 bg-orange-400/10 text-orange-300" : "border-white/10 bg-white/[0.04] text-slate-300"}`}>
        {icon}
      </div>
      <p className="mt-4 font-semibold text-white">{title}</p>
      <p className="mt-1.5 flex-1 text-sm leading-6 text-slate-400">{description}</p>
      <div className="mt-4">
        <Button asChild size="sm" variant={accent ? "default" : "outline"}>
          <Link href={href}>
            {cta}
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function CatalogStep({
  step,
  href,
  icon,
  title,
  description,
}: {
  step: string;
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-[22px] border border-white/8 bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/[0.14] hover:bg-white/[0.05]"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/15 text-[11px] font-bold text-amber-200">
          {step}
        </span>
        <span className="inline-flex items-center gap-1.5 text-amber-200/80">
          {icon}
        </span>
        <span className="text-sm font-semibold text-white">{title}</span>
      </div>
      <p className="text-xs leading-5 text-slate-400">{description}</p>
    </Link>
  );
}
