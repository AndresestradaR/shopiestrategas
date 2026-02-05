import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Loader2,
  AlertCircle,
  Save,
  Activity,
  Code,
  Info,
} from "lucide-react";
import client from "../api/client";

/* ------------------------------------------------------------------ */
/*  Pixel event reference                                              */
/* ------------------------------------------------------------------ */
const PIXEL_EVENTS = [
  { action: "Cualquier pagina", meta: "PageView", tiktok: "page" },
  { action: "Ver producto", meta: "ViewContent", tiktok: "ViewContent" },
  { action: "Abrir checkout", meta: "InitiateCheckout", tiktok: "InitiateCheckout" },
  { action: "Enviar pedido", meta: "Lead + Purchase", tiktok: "SubmitForm + CompletePayment" },
];

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function Pixels() {
  const queryClient = useQueryClient();

  const { data: config, isLoading, isError, error } = useQuery({
    queryKey: ["admin-config"],
    queryFn: async () => {
      const res = await client.get("/admin/config");
      return res.data;
    },
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      meta_pixel_id: "",
      tiktok_pixel_id: "",
      custom_scripts: "",
    },
  });

  useEffect(() => {
    if (config) {
      reset({
        meta_pixel_id: config.meta_pixel_id || "",
        tiktok_pixel_id: config.tiktok_pixel_id || "",
        custom_scripts: config.custom_scripts || "",
      });
    }
  }, [config, reset]);

  const mutation = useMutation({
    mutationFn: (data) => client.put("/admin/config", data),
    onSuccess: () => {
      toast.success("Pixeles actualizados");
      queryClient.invalidateQueries({ queryKey: ["admin-config"] });
    },
    onError: () => toast.error("Error al guardar los pixeles"),
  });

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
        <span>Error al cargar la configuracion: {error?.message || "Intenta de nuevo"}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Activity size={22} className="text-gray-500" />
          <h1 className="text-2xl font-bold text-gray-900">Pixeles y seguimiento</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Configura los pixeles de seguimiento para rastrear conversiones
        </p>
      </div>

      <div className="space-y-6">
        {/* Pixel form */}
        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="space-y-6"
        >
          {/* Meta Pixel */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-600" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Meta Pixel (Facebook)</h2>
                <p className="text-xs text-gray-500">Rastrea conversiones de Facebook e Instagram Ads</p>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">ID del Pixel de Meta</label>
              <input
                type="text"
                {...register("meta_pixel_id")}
                placeholder="Ej: 123456789012345"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
              />
              <p className="mt-1 text-xs text-gray-400">
                Encuentralo en tu Administrador de Eventos de Meta Business Suite
              </p>
            </div>
          </div>

          {/* TikTok Pixel */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.28 8.28 0 0 0 4.85 1.56V6.86a4.84 4.84 0 0 1-1.09-.17z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">TikTok Pixel</h2>
                <p className="text-xs text-gray-500">Rastrea conversiones de TikTok Ads</p>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">ID del Pixel de TikTok</label>
              <input
                type="text"
                {...register("tiktok_pixel_id")}
                placeholder="Ej: ABCDE12345"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
              />
              <p className="mt-1 text-xs text-gray-400">
                Encuentralo en tu TikTok Ads Manager &gt; Activos &gt; Eventos
              </p>
            </div>
          </div>

          {/* Custom scripts */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Code size={20} className="text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Scripts personalizados</h2>
            </div>
            <p className="mb-3 text-xs text-gray-500">
              Agrega scripts personalizados que se ejecutaran en todas las paginas de tu tienda (Google Analytics, Hotjar, etc.)
            </p>
            <textarea
              {...register("custom_scripts")}
              rows={6}
              placeholder={"<!-- Pega tu script aqui -->\n<script>\n  // Tu codigo personalizado\n</script>"}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs text-gray-700 outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
            />
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 p-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-500" />
              <p className="text-xs text-amber-700">
                Ten cuidado con los scripts que agregas. Un script mal formado puede afectar el funcionamiento de tu tienda.
              </p>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#4DBEA4] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {mutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Guardar pixeles
            </button>
          </div>
        </form>

        {/* Event reference table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-4">
            <Info size={18} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Eventos de seguimiento</h2>
          </div>
          <p className="px-6 pt-3 text-xs text-gray-500">
            Estos eventos se disparan automaticamente cuando configuras tus pixeles:
          </p>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-xs font-medium text-gray-500">Accion</th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500">Evento Meta</th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500">Evento TikTok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {PIXEL_EVENTS.map((evt) => (
                  <tr key={evt.action}>
                    <td className="px-4 py-2 text-sm text-gray-700">{evt.action}</td>
                    <td className="px-4 py-2">
                      <code className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700">{evt.meta}</code>
                    </td>
                    <td className="px-4 py-2">
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700">{evt.tiktok}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
