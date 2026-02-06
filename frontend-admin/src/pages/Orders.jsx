import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";
import toast from "react-hot-toast";
import client from "../api/client";

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return "---";
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "CONFIRMADO", label: "Confirmado" },
  { value: "ENVIADO", label: "Enviado" },
  { value: "ENTREGADO", label: "Entregado" },
  { value: "CANCELADO", label: "Cancelado" },
];

const STATUS_COLORS = {
  PENDIENTE: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMADO: "bg-blue-50 text-blue-700 border-blue-200",
  ENVIADO: "bg-purple-50 text-purple-700 border-purple-200",
  ENTREGADO: "bg-green-50 text-green-700 border-green-200",
  CANCELADO: "bg-red-50 text-red-700 border-red-200",
};

export default function Orders() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [exporting, setExporting] = useState(false);
  const limit = 20;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["orders", page, statusFilter],
    queryFn: async () => {
      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      const res = await client.get("/admin/orders", { params });
      return res.data;
    },
    keepPreviousData: true,
  });

  const orders = data?.items || data?.orders || data || [];
  const totalPages = data?.total_pages || data?.pages || Math.ceil((data?.total || 0) / limit) || 1;

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await client.get("/admin/orders/export", {
        responseType: "blob",
        params: statusFilter ? { status: statusFilter } : {},
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      const filename =
        res.headers["content-disposition"]?.match(/filename="?(.+)"?/)?.[1] ||
        `pedidos-${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Archivo exportado exitosamente");
    } catch (err) {
      toast.error("Error al exportar los pedidos");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona y da seguimiento a los pedidos de tu tienda
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          Exportar Excel
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : isError ? (
          <div className="flex items-center gap-3 p-6 text-sm text-red-600">
            <AlertCircle size={20} />
            <span>Error al cargar pedidos: {error?.message}</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ShoppingCart size={40} className="mb-3" />
            <p className="text-sm">No se encontraron pedidos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 font-medium text-gray-500">No. Pedido</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Fecha</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Cliente</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Telefono</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Ciudad</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Total</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      #{order.order_number || order.id}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {order.customer_name || "---"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.customer_phone || "---"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.city || "---"}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatCurrency(order.total || order.total_price)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {order.status || "---"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && orders.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-sm text-gray-500">
              Pagina {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                Siguiente
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
