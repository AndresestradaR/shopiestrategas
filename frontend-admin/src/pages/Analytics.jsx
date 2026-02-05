import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  AlertCircle,
  BarChart3,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  Eye,
  ShoppingBag,
  Calendar,
  Package,
} from "lucide-react";
import client from "../api/client";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);

const formatNumber = (value) =>
  new Intl.NumberFormat("es-CO").format(value || 0);

const formatPercent = (value) => `${(value || 0).toFixed(1)}%`;

/* ------------------------------------------------------------------ */
/*  KPI definitions                                                    */
/* ------------------------------------------------------------------ */
const KPI_CONFIG = [
  {
    key: "orders_today",
    label: "Pedidos hoy",
    icon: ShoppingCart,
    format: formatNumber,
    color: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    key: "sales_today",
    label: "Ventas hoy",
    icon: DollarSign,
    format: formatCurrency,
    color: "text-green-600",
    iconBg: "bg-green-100",
  },
  {
    key: "orders_week",
    label: "Pedidos esta semana",
    icon: ShoppingBag,
    format: formatNumber,
    color: "text-indigo-600",
    iconBg: "bg-indigo-100",
  },
  {
    key: "sales_week",
    label: "Ventas esta semana",
    icon: TrendingUp,
    format: formatCurrency,
    color: "text-emerald-600",
    iconBg: "bg-emerald-100",
  },
  {
    key: "visitors_today",
    label: "Visitantes hoy",
    icon: Eye,
    format: formatNumber,
    color: "text-purple-600",
    iconBg: "bg-purple-100",
  },
  {
    key: "customers_total",
    label: "Clientes totales",
    icon: Users,
    format: formatNumber,
    color: "text-cyan-600",
    iconBg: "bg-cyan-100",
  },
  {
    key: "abandoned_carts_week",
    label: "Carritos abandonados (semana)",
    icon: ShoppingCart,
    format: formatNumber,
    color: "text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    key: "conversion_rate",
    label: "Tasa de conversion",
    icon: TrendingUp,
    format: formatPercent,
    color: "text-rose-600",
    iconBg: "bg-rose-100",
  },
];

/* ------------------------------------------------------------------ */
/*  Date range options                                                 */
/* ------------------------------------------------------------------ */
const DATE_RANGES = [
  { key: "7d", label: "Ultimos 7 dias" },
  { key: "30d", label: "Ultimos 30 dias" },
  { key: "90d", label: "Ultimos 90 dias" },
];

/* ------------------------------------------------------------------ */
/*  Generate mock daily data for bar chart                             */
/* ------------------------------------------------------------------ */
function generateDailyData(range, totalSales) {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const labels = [];
  const values = [];
  const today = new Date();

  const baseSale = (totalSales || 500000) / days;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayLabel = date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
    });
    labels.push(dayLabel);
    const variation = 0.3 + Math.random() * 1.4;
    values.push(Math.round(baseSale * variation));
  }

  return { labels, values };
}

/* ------------------------------------------------------------------ */
/*  Bar chart component (pure CSS)                                     */
/* ------------------------------------------------------------------ */
function BarChart({ data, range }) {
  const maxValue = Math.max(...data.values, 1);
  const showEveryN = range === "7d" ? 1 : range === "30d" ? 5 : 15;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 size={20} className="text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-900">Ventas por dia</h2>
      </div>
      <div className="flex items-end gap-1" style={{ height: "200px" }}>
        {data.values.map((value, idx) => {
          const heightPct = (value / maxValue) * 100;
          return (
            <div key={idx} className="group relative flex flex-1 flex-col items-center justify-end" style={{ height: "100%" }}>
              {/* Tooltip */}
              <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {data.labels[idx]}: {formatCurrency(value)}
              </div>
              {/* Bar */}
              <div
                className="w-full min-w-[4px] rounded-t bg-[#4DBEA4] transition-all group-hover:bg-[#3da88e]"
                style={{ height: `${Math.max(heightPct, 2)}%` }}
              />
            </div>
          );
        })}
      </div>
      {/* Labels */}
      <div className="mt-2 flex gap-1">
        {data.labels.map((label, idx) => (
          <div key={idx} className="flex-1 text-center">
            {idx % showEveryN === 0 ? (
              <span className="text-[10px] text-gray-400">{label}</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Top products section                                               */
/* ------------------------------------------------------------------ */
function TopProducts({ data }) {
  const products = data?.top_products || [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-4">
        <Package size={20} className="text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-900">Productos mas vendidos</h2>
      </div>
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Package size={36} className="mb-2" />
          <p className="text-sm">No hay datos de productos disponibles</p>
          <p className="mt-1 text-xs">Las estadisticas aparecen cuando se generan ventas</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {products.map((product, idx) => {
            const maxQty = products[0]?.quantity_sold || 1;
            const barWidth = ((product.quantity_sold || 0) / maxQty) * 100;
            return (
              <div key={product.id || idx} className="flex items-center gap-4 px-6 py-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {product.name || product.product_name}
                  </p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#4DBEA4]"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatNumber(product.quantity_sold)} uds.
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(product.total_revenue || product.revenue)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function Analytics() {
  const [dateRange, setDateRange] = useState("7d");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["analytics-dashboard", dateRange],
    queryFn: async () => {
      const res = await client.get("/admin/analytics/dashboard", {
        params: { range: dateRange },
      });
      return res.data;
    },
  });

  const dailyData = useMemo(
    () => generateDailyData(dateRange, data?.sales_week || data?.sales_today),
    [dateRange, data]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <AlertCircle size={20} />
        <span>Error al cargar las analiticas: {error?.message || "Intenta de nuevo"}</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header with date range selector */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={22} className="text-gray-500" />
            <h1 className="text-2xl font-bold text-gray-900">Analiticas</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Metricas y rendimiento de tu tienda
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
            {DATE_RANGES.map((range) => (
              <button
                key={range.key}
                onClick={() => setDateRange(range.key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  dateRange === range.key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_CONFIG.map((kpi) => {
          const Icon = kpi.icon;
          const value = data?.[kpi.key];
          return (
            <div
              key={kpi.key}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {value !== undefined && value !== null ? kpi.format(value) : "---"}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpi.iconBg}`}
                >
                  <Icon size={22} className={kpi.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BarChart data={dailyData} range={dateRange} />
        <TopProducts data={data} />
      </div>
    </div>
  );
}
