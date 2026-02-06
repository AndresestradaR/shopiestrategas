import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Paintbrush,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  X,
  ShoppingBag,
  Home,
  ExternalLink,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";
import client from "../api/client";

const PAGE_TYPE_LABELS = {
  home: "Pagina de inicio",
  product: "Landing de producto",
  custom: "Pagina libre",
};

export default function PageDesigns() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data: tenant } = useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await client.get("/auth/me");
      return res.data;
    },
  });
  const tenantSlug = tenant?.slug;

  const { data: designs, isLoading, isError, error } = useQuery({
    queryKey: ["pageDesigns"],
    queryFn: async () => {
      const res = await client.get("/admin/page-designs");
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => client.delete(`/admin/page-designs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageDesigns"] });
      toast.success("Diseno eliminado");
    },
    onError: () => toast.error("Error al eliminar"),
  });

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Eliminar este diseno? Esta accion no se puede deshacer.")) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "---";
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disenar tienda</h1>
          <p className="mt-1 text-sm text-gray-500">
            Crea landing pages de venta con el constructor visual
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "#4DBEA4" }}
        >
          <Plus size={18} />
          Crear landing
        </button>
      </div>

      {/* Content */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : isError ? (
          <div className="flex items-center gap-3 p-6 text-sm text-red-600">
            <AlertCircle size={20} />
            <span>Error al cargar disenos: {error?.message}</span>
          </div>
        ) : !designs || designs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Paintbrush size={40} className="mb-3" />
            <p className="text-sm">No tienes disenos todavia</p>
            <p className="mt-1 text-xs text-gray-400">
              Crea tu primera landing page para empezar a vender
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-500">Titulo</th>
                <th className="px-4 py-3 font-medium text-gray-500">Tipo</th>
                <th className="px-4 py-3 font-medium text-gray-500">Producto</th>
                <th className="px-4 py-3 font-medium text-gray-500">Estado</th>
                <th className="px-4 py-3 font-medium text-gray-500">Fecha</th>
                <th className="px-4 py-3 font-medium text-gray-500" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {designs.map((d) => (
                <tr
                  key={d.id}
                  className="cursor-pointer transition-colors hover:bg-gray-50"
                  onClick={() => navigate(`/designer/${d.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{d.title}</div>
                    <div className="text-xs text-gray-400">/{d.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {PAGE_TYPE_LABELS[d.page_type] || d.page_type}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {d.product_name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {d.is_published ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        <Eye size={12} />
                        Publicada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        <EyeOff size={12} />
                        Borrador
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(d.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {d.is_published && tenantSlug && (
                        <>
                          <a
                            href={`/tienda/${tenantSlug}/${d.page_type === "home" ? "" : `landing/${d.slug}`}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
                          >
                            <ExternalLink size={12} />
                            Ver
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const url = `${window.location.origin}/tienda/${tenantSlug}/${d.page_type === "home" ? "" : `landing/${d.slug}`}`;
                              navigator.clipboard.writeText(url);
                              toast.success("URL copiada");
                            }}
                            className="text-xs text-gray-400 hover:text-gray-600"
                            title="Copiar URL"
                          >
                            <Copy size={12} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/designer/${d.id}`);
                        }}
                        className="text-xs text-[#4DBEA4] hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={(e) => handleDelete(d.id, e)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <CreateLandingModal
          onClose={() => setShowModal(false)}
          onCreated={(id) => {
            setShowModal(false);
            navigate(`/designer/${id}`);
          }}
        />
      )}
    </div>
  );
}

/* ─── Creation Modal ─── */

function CreateLandingModal({ onClose, onCreated }) {
  const [pageType, setPageType] = useState("product");
  const [productId, setProductId] = useState("");
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products-for-landing"],
    queryFn: async () => {
      const res = await client.get("/admin/products");
      // Backend returns paginated response: { items: [...], total, page, per_page }
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (data?.items && Array.isArray(data.items)) return data.items;
      return [];
    },
  });

  const selectedProduct = (products || []).find((p) => p.id === productId);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const payload = {
        page_type: pageType,
        title: title || (pageType === "home" ? "Mi Landing" : `Landing - ${selectedProduct?.name || "Producto"}`),
      };
      if (pageType === "product" && productId) {
        payload.product_id = productId;
      }
      const res = await client.post("/admin/page-designs", payload);
      toast.success("Landing creada");
      onCreated(res.data.id);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al crear la landing");
    } finally {
      setCreating(false);
    }
  };

  const canCreate =
    pageType === "home" ||
    (pageType === "product" && productId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="mb-1 text-lg font-bold text-gray-900">Crear nueva landing</h2>
        <p className="mb-5 text-sm text-gray-500">Selecciona el tipo de pagina que quieres crear</p>

        {/* Type selector */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => setPageType("home")}
            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
              pageType === "home"
                ? "border-[#4DBEA4] bg-[#4DBEA4]/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Home size={24} className={pageType === "home" ? "text-[#4DBEA4]" : "text-gray-400"} />
            <span className={`text-sm font-medium ${pageType === "home" ? "text-[#4DBEA4]" : "text-gray-600"}`}>
              Pagina de inicio
            </span>
            <span className="text-xs text-gray-400">Landing principal</span>
          </button>
          <button
            onClick={() => setPageType("product")}
            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
              pageType === "product"
                ? "border-[#4DBEA4] bg-[#4DBEA4]/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <ShoppingBag size={24} className={pageType === "product" ? "text-[#4DBEA4]" : "text-gray-400"} />
            <span className={`text-sm font-medium ${pageType === "product" ? "text-[#4DBEA4]" : "text-gray-600"}`}>
              Landing de producto
            </span>
            <span className="text-xs text-gray-400">Vinculada a producto</span>
          </button>
        </div>

        {/* Product selector (only for product type) */}
        {pageType === "product" && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Producto vinculado
            </label>
            {loadingProducts ? (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 size={14} className="animate-spin" />
                Cargando productos...
              </div>
            ) : !products?.length ? (
              <p className="text-sm text-red-500">No tienes productos. Crea uno primero.</p>
            ) : (
              <select
                value={productId}
                onChange={(e) => {
                  setProductId(e.target.value);
                  const prod = (products || []).find((p) => p.id === e.target.value);
                  if (prod && !title) {
                    setTitle(`Landing - ${prod.name}`);
                  }
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#4DBEA4] focus:outline-none focus:ring-1 focus:ring-[#4DBEA4]"
              >
                <option value="">Selecciona un producto...</option>
                {(products || []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Title */}
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Titulo (opcional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={pageType === "home" ? "Mi Landing" : "Landing - Producto"}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#4DBEA4] focus:outline-none focus:ring-1 focus:ring-[#4DBEA4]"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={!canCreate || creating}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#4DBEA4" }}
          >
            {creating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Crear landing
          </button>
        </div>
      </div>
    </div>
  );
}
