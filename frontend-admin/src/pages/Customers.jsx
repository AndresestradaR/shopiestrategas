import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  AlertCircle,
  Users,
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
  }).format(d);
};

export default function Customers() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["customers", page],
    queryFn: async () => {
      const res = await client.get("/admin/carts", { params: { page, limit } });
      return res.data;
    },
    keepPreviousData: true,
  });

  // Aggregate cart data by customer (phone or email as unique key)
  const rawItems = data?.items || data?.carts || data || [];
  const totalPages = data?.total_pages || data?.pages || Math.ceil((data?.total || 0) / limit) || 1;

  // Build a de-duplicated customer list from cart data
  const customerMap = new Map();
  rawItems.forEach((cart) => {
    const key = cart.customer_phone || cart.customer_email || cart.id;
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        name: cart.customer_name || "---",
        phone: cart.customer_phone || "---",
        city: cart.city || cart.customer_city || "---",
        total_orders: 0,
        total_spent: 0,
        last_order: cart.created_at,
      });
    }
    const customer = customerMap.get(key);
    customer.total_orders += 1;
    customer.total_spent += cart.total_value || cart.total || 0;
    if (cart.created_at && cart.created_at > (customer.last_order || "")) {
      customer.last_order = cart.created_at;
    }
  });
  const customers = Array.from(customerMap.values());

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Listado de clientes que han interactuado con tu tienda
        </p>
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Esta seccion muestra datos preliminares basados en carritos capturados.
          Un modulo de clientes completo estara disponible proximamente.
        </div>
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
            <span>Error al cargar los clientes: {error?.message}</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Users size={40} className="mb-3" />
            <p className="text-sm">No hay clientes registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 font-medium text-gray-500">Nombre</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Telefono</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Ciudad</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Interacciones</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Valor total</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Ultima actividad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {customer.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{customer.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{customer.city}</td>
                    <td className="px-4 py-3 text-gray-700">{customer.total_orders}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatCurrency(customer.total_spent)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(customer.last_order)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && customers.length > 0 && (
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
