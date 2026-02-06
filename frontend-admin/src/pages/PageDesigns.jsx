import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Paintbrush,
  Loader2,
  AlertCircle,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import client from "../api/client";

const PAGE_TYPE_LABELS = {
  home: "Pagina de inicio",
  product: "Template de producto",
  custom: "Pagina libre",
};

export default function PageDesigns() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);

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

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await client.post("/admin/page-designs", {
        page_type: "home",
        title: "Mi Landing",
        slug: "home",
      });
      navigate(`/designer/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al crear el diseno");
    } finally {
      setCreating(false);
    }
  };

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
          onClick={handleCreate}
          disabled={creating}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "#4DBEA4" }}
        >
          {creating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Plus size={18} />
          )}
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
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {d.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {PAGE_TYPE_LABELS[d.page_type] || d.page_type}
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
    </div>
  );
}
