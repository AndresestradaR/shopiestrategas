import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Loader2,
  AlertCircle,
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  Info,
  Copy,
  CheckCircle2,
  Server,
} from "lucide-react";
import client from "../api/client";

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function Domain() {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: tenant, isLoading: loadingTenant } = useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await client.get("/auth/me");
      return res.data;
    },
  });

  const { data: config, isLoading: loadingConfig } = useQuery({
    queryKey: ["admin-config"],
    queryFn: async () => {
      const res = await client.get("/admin/config");
      return res.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { domain: "" },
  });

  const addDomainMutation = useMutation({
    mutationFn: (data) =>
      client.post("/admin/config/domains", { domain: data.domain }),
    onSuccess: () => {
      toast.success("Dominio agregado. Configura el registro DNS.");
      queryClient.invalidateQueries({ queryKey: ["admin-config"] });
      reset({ domain: "" });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.detail || "Error al agregar el dominio"),
  });

  const removeDomainMutation = useMutation({
    mutationFn: (domain) =>
      client.delete("/admin/config/domains", { data: { domain } }),
    onSuccess: () => {
      toast.success("Dominio eliminado");
      queryClient.invalidateQueries({ queryKey: ["admin-config"] });
    },
    onError: () => toast.error("Error al eliminar el dominio"),
  });

  const handleRemove = (domain) => {
    if (window.confirm(`Eliminar el dominio ${domain}?`)) {
      removeDomainMutation.mutate(domain);
    }
  };

  const slug = tenant?.slug || "mi-tienda";
  const subdomain = `${slug}.minishop.co`;
  const domains = config?.custom_domains || [];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const isLoading = loadingTenant || loadingConfig;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Globe size={22} className="text-gray-500" />
          <h1 className="text-2xl font-bold text-gray-900">Dominio</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Configura el dominio de tu tienda
        </p>
      </div>

      <div className="space-y-6">
        {/* Current subdomain */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Server size={20} className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Subdominio actual</h2>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <Globe size={18} className="text-[#4DBEA4]" />
            <span className="text-sm font-medium text-gray-900">{subdomain}</span>
            <a
              href={`https://${subdomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <ExternalLink size={16} />
            </a>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Este es el subdominio gratuito de tu tienda. Siempre estara disponible.
          </p>
        </div>

        {/* DNS instructions */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <div className="mb-3 flex items-center gap-2">
            <Info size={20} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-blue-900">Instrucciones para dominio personalizado</h2>
          </div>
          <div className="space-y-3 text-sm text-blue-800">
            <p>Para conectar tu dominio personalizado, sigue estos pasos:</p>
            <ol className="ml-4 list-decimal space-y-2">
              <li>
                Ingresa a la configuracion DNS de tu proveedor de dominio (GoDaddy, Namecheap, Cloudflare, etc.)
              </li>
              <li>
                Agrega un registro <strong>CNAME</strong> con los siguientes valores:
              </li>
            </ol>
            <div className="rounded-lg border border-blue-200 bg-white p-4">
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-blue-900">Tipo</p>
                  <p className="mt-1 font-mono text-blue-700">CNAME</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Nombre / Host</p>
                  <p className="mt-1 font-mono text-blue-700">www</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Valor / Apunta a</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-blue-700">minishop.co</span>
                    <button
                      onClick={() => copyToClipboard("minishop.co")}
                      className="rounded p-0.5 text-blue-400 hover:text-blue-600"
                    >
                      {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-blue-600">
              Si quieres usar el dominio raiz (sin www), agrega un registro A apuntando a nuestra IP o configura una redireccion desde tu proveedor.
              Los cambios DNS pueden tardar hasta 48 horas en propagarse.
            </p>
          </div>
        </div>

        {/* Add custom domain */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Agregar dominio personalizado</h2>
          <form
            onSubmit={handleSubmit((data) => addDomainMutation.mutate(data))}
            className="flex flex-col gap-3 sm:flex-row sm:items-start"
          >
            <div className="flex-1">
              <input
                type="text"
                {...register("domain", {
                  required: "Ingresa un dominio",
                  pattern: {
                    value: /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/,
                    message: "Ingresa un dominio valido (ej: mitienda.com)",
                  },
                })}
                placeholder="mitienda.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
              />
              {errors.domain && (
                <p className="mt-1 text-xs text-red-500">{errors.domain.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={addDomainMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#4DBEA4] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {addDomainMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Agregar dominio
            </button>
          </form>
        </div>

        {/* Existing custom domains */}
        {domains.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Dominios personalizados</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {domains.map((domain, idx) => (
                <div key={idx} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Globe size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {typeof domain === "string" ? domain : domain.domain}
                    </span>
                    {(typeof domain === "object" && domain.verified) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        <CheckCircle2 size={12} /> Verificado
                      </span>
                    )}
                    {(typeof domain === "object" && !domain.verified) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Pendiente DNS
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://${typeof domain === "string" ? domain : domain.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <ExternalLink size={15} />
                    </a>
                    <button
                      onClick={() => handleRemove(typeof domain === "string" ? domain : domain.domain)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
