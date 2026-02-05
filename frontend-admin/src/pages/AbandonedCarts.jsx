import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  AlertCircle,
  ShoppingBag,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

const STATUS_COLORS = {
  ABANDONED: "bg-red-50 text-red-700",
  RECOVERED: "bg-green-50 text-green-700",
  PENDING: "bg-yellow-50 text-yellow-700",
};

const STATUS_LABELS = {
  ABANDONED: "Abandonado",
  RECOVERED: "Recuperado",
  PENDING: "Pendiente",
};

export default function AbandonedCarts() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["abandoned-carts", page],
    queryFn: async () => {
      const res = await client.get("/admin/carts", { params: { page, limit } });
      return res.data;
    },
    keepPreviousData: true,
  });

  const carts = data?.items || data?.carts || data || [];
  const totalPages = data?.total_pages || data?.pages || Math.ceil((data?.total || 0) / limit) || 1;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Carritos abandonados</h1>
        <p className="mt-1 text-sm text-gray-500">
          Recupera ventas contactando a los clientes que no completaron su compra
        </p>
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
            <span>Error al cargar los carritos: {error?.message}</span>
          </div>
        ) : carts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ShoppingBag size={40} className="mb-3" />
            <p className="text-sm">No hay carritos abandonados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 font-medium text-gray-500">Fecha</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Cliente</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Telefono</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Producto</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Valor</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Estado</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {carts.map((cart) => {
                  const phone = (cart.customer_phone || "").replace(/\D/g, "");
                  const whatsappUrl = phone ? `https://wa.me/${phone}` : null;
                  const status = cart.status || "ABANDONED";

                  return (
                    <tr key={cart.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(cart.created_at)}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {cart.customer_name || "---"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {cart.customer_phone || "---"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {cart.customer_email || "---"}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {cart.product_name ||
                          cart.items?.[0]?.product_name ||
                          "---"}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {formatCurrency(
                          cart.total_value || cart.total || cart.items?.[0]?.price || 0
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            STATUS_COLORS[status] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {STATUS_LABELS[status] || status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {whatsappUrl ? (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-600"
                          >
                            <MessageCircle size={14} />
                            WhatsApp
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">Sin telefono</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && carts.length > 0 && (
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
