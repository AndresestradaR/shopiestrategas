import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Package,
} from "lucide-react";
import client from "../api/client";

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);

const getImageUrl = (imgUrl) => {
  if (!imgUrl) return '';
  if (imgUrl.startsWith('http')) return imgUrl;
  const apiBase = import.meta.env.VITE_API_URL || '';
  if (apiBase) return `${apiBase}${imgUrl}`;
  return imgUrl.replace(/^\/uploads/, '/api/uploads');
};

const STATUS_TABS = [
  { key: "all", label: "Todos" },
  { key: "active", label: "Activos" },
  { key: "draft", label: "Borradores" },
];

export default function Products() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const limit = 15;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", page, search, statusFilter],
    queryFn: async () => {
      const params = { page, limit };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await client.get("/admin/products", { params });
      return res.data;
    },
    keepPreviousData: true,
  });

  const products = data?.items || data?.products || data || [];
  const totalPages = data?.total_pages || data?.pages || Math.ceil((data?.total || 0) / limit) || 1;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="mt-1 text-sm text-gray-500">Gestiona el catalogo de tu tienda</p>
        </div>
        <Link
          to="/products/new"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#4DBEA4" }}
        >
          <Plus size={18} />
          Agregar producto
        </Link>
      </div>

      {/* Search + Filter Tabs */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
          />
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
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
            <span>Error al cargar productos: {error?.message}</span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package size={40} className="mb-3" />
            <p className="text-sm">No se encontraron productos</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-500">Imagen</th>
                <th className="px-4 py-3 font-medium text-gray-500">Nombre</th>
                <th className="px-4 py-3 font-medium text-gray-500">Precio</th>
                <th className="px-4 py-3 font-medium text-gray-500">Stock</th>
                <th className="px-4 py-3 font-medium text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => {
                const image =
                  product.images?.[0]?.image_url ||
                  product.image_url ||
                  product.thumbnail ||
                  null;
                const isActive = product.is_active || product.status === "active";

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <td className="px-4 py-3">
                      {image ? (
                        <img
                          src={getImageUrl(image)}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                          <Package size={18} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {product.stock ?? "---"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {isActive ? "Activo" : "Borrador"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!isLoading && products.length > 0 && (
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
