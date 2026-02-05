import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Loader2,
  AlertCircle,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import client from "../api/client";

/* ------------------------------------------------------------------ */
/*  Create / Edit modal                                                */
/* ------------------------------------------------------------------ */
function PageFormModal({ page, onClose }) {
  const queryClient = useQueryClient();
  const isEdit = !!page?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: page?.title || "",
      slug: page?.slug || "",
      content: page?.content || "",
      is_published: page?.is_published ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEdit) {
        return client.put(`/admin/pages/${page.id}`, data);
      }
      return client.post("/admin/pages", data);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Pagina actualizada" : "Pagina creada");
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      onClose();
    },
    onError: () => toast.error("Error al guardar la pagina"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Editar pagina" : "Nueva pagina"}
          </h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Titulo</label>
              <input
                {...register("title", { required: "El titulo es requerido" })}
                placeholder="Ej: Politica de privacidad"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Slug (URL)</label>
              <input
                {...register("slug", { required: "El slug es requerido" })}
                placeholder="Ej: politica-de-privacidad"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
              />
              {errors.slug && (
                <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>
              )}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Contenido</label>
            <textarea
              {...register("content")}
              rows={12}
              placeholder="Escribe el contenido de la pagina aqui..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("is_published")}
              className="h-4 w-4 rounded border-gray-300 text-[#4DBEA4] focus:ring-[#4DBEA4]"
            />
            <span className="text-sm text-gray-700">Publicada</span>
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#4DBEA4] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
              {isEdit ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline editor for expanded page                                    */
/* ------------------------------------------------------------------ */
function InlineEditor({ page }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: page.title,
      content: page.content || "",
      is_published: page.is_published,
    },
  });

  useEffect(() => {
    reset({
      title: page.title,
      content: page.content || "",
      is_published: page.is_published,
    });
  }, [page, reset]);

  const mutation = useMutation({
    mutationFn: (data) => client.put(`/admin/pages/${page.id}`, data),
    onSuccess: () => {
      toast.success("Pagina actualizada");
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
    },
    onError: () => toast.error("Error al guardar"),
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-3 border-t border-gray-100 bg-gray-50 p-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Titulo</label>
        <input
          {...register("title")}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Contenido</label>
        <textarea
          {...register("content")}
          rows={8}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register("is_published")}
            className="h-4 w-4 rounded border-gray-300 text-[#4DBEA4] focus:ring-[#4DBEA4]"
          />
          <span className="text-sm text-gray-700">Publicada</span>
        </label>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-[#4DBEA4] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Guardar
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function Policies() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const res = await client.get("/admin/pages");
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => client.delete(`/admin/pages/${id}`),
    onSuccess: () => {
      toast.success("Pagina eliminada");
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
    },
    onError: () => toast.error("Error al eliminar"),
  });

  const handleDelete = (id) => {
    if (window.confirm("Estas seguro de eliminar esta pagina?")) {
      deleteMutation.mutate(id);
    }
  };

  const pages = Array.isArray(data) ? data : data?.items || [];

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
        <span>Error al cargar las paginas: {error?.message || "Intenta de nuevo"}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paginas y politicas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra las paginas legales y de informacion de tu tienda
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#4DBEA4] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus size={18} />
          Nueva pagina
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 text-gray-400">
          <FileText size={40} className="mb-3" />
          <p className="text-sm">No hay paginas creadas</p>
          <p className="mt-1 text-xs">Crea tu primera pagina de politicas o informacion</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <div key={page.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-gray-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{page.title}</h3>
                    <p className="text-xs text-gray-400">/{page.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      page.is_published
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {page.is_published ? (
                      <><Eye size={12} /> Publicada</>
                    ) : (
                      <><EyeOff size={12} /> Borrador</>
                    )}
                  </span>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === page.id ? null : page.id)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    {expandedId === page.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>
              {expandedId === page.id && <InlineEditor page={page} />}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <PageFormModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
