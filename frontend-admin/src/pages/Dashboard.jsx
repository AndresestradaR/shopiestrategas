import { useQuery } from "@tanstack/react-query";
import {
  ShoppingCart,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import client from "../api/client";

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
    value || 0
  );

const formatPercent = (value) =>
  `${(value || 0).toFixed(1)}%`;

const KPI_CONFIG = [
  {
    key: "orders_today",
    label: "Pedidos hoy",
    icon: ShoppingCart,
    format: (v) => v ?? 0,
    color: "bg-blue-50 text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    key: "sales_today",
    label: "Ventas hoy",
    icon: DollarSign,
    format: formatCurrency,
    color: "bg-green-50 text-green-600",
    iconBg: "bg-green-100",
  },
  {
    key: "abandoned_carts_week",
    label: "Carritos abandonados (semana)",
    icon: ShoppingBag,
    format: (v) => v ?? 0,
    color: "bg-amber-50 text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    key: "conversion_rate",
    label: "Tasa de conversion",
    icon: TrendingUp,
    format: formatPercent,
    color: "bg-purple-50 text-purple-600",
    iconBg: "bg-purple-100",
  },
];

export default function Dashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: async () => {
      const res = await client.get("/admin/analytics/dashboard");
      return res.data;
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Resumen general de tu tienda
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} />
          <span>Error al cargar los datos: {error?.message || "Intenta de nuevo"}</span>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {KPI_CONFIG.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.key}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {kpi.format(data[kpi.key])}
                    </p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpi.iconBg}`}>
                    <Icon size={22} className={kpi.color.split(" ")[1]} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
