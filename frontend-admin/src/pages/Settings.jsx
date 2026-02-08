import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Loader2,
  AlertCircle,
  Save,
  Settings as SettingsIcon,
  Store,
  Globe,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import client from "../api/client";

/* ------------------------------------------------------------------ */
/*  Country / currency mapping                                         */
/* ------------------------------------------------------------------ */
const COUNTRIES = [
  { code: "CO", name: "Colombia", currency: "COP", symbol: "$" },
  { code: "MX", name: "Mexico", currency: "MXN", symbol: "$" },
  { code: "GT", name: "Guatemala", currency: "GTQ", symbol: "Q" },
  { code: "PE", name: "Peru", currency: "PEN", symbol: "S/" },
  { code: "EC", name: "Ecuador", currency: "USD", symbol: "$" },
  { code: "CL", name: "Chile", currency: "CLP", symbol: "$" },
];

function getCurrencyForCountry(code) {
  const country = COUNTRIES.find((c) => c.code === code);
  return country ? `${country.currency} (${country.symbol})` : "";
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function Settings() {
  const queryClient = useQueryClient();

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

  const [showApiKey, setShowApiKey] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      whatsapp_number: "",
      country: "CO",
      currency: "COP ($)",
      gemini_api_key: "",
    },
  });

  const watchCountry = watch("country");

  useEffect(() => {
    if (config) {
      reset({
        whatsapp_number: config.whatsapp_number || "",
        country: config.country || "CO",
        currency: getCurrencyForCountry(config.country || "CO"),
        gemini_api_key: config.gemini_api_key || "",
      });
    }
  }, [config, reset]);

  useEffect(() => {
    setValue("currency", getCurrencyForCountry(watchCountry));
  }, [watchCountry, setValue]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const country = COUNTRIES.find((c) => c.code === data.country);
      return client.put("/admin/config", {
        whatsapp_number: data.whatsapp_number,
        country: data.country,
        currency: country?.currency || "COP",
        gemini_api_key: data.gemini_api_key || null,
      });
    },
    onSuccess: () => {
      toast.success("Configuracion guardada");
      queryClient.invalidateQueries({ queryKey: ["admin-config"] });
    },
    onError: () => toast.error("Error al guardar la configuracion"),
  });

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
          <SettingsIcon size={22} className="text-gray-500" />
          <h1 className="text-2xl font-bold text-gray-900">Configuracion</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Configuracion general de tu tienda
        </p>
      </div>

      <div className="space-y-6">
        {/* Store info (read-only) */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Store size={20} className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Informacion de la tienda</h2>
          </div>
          <p className="mb-4 text-xs text-gray-400">
            Estos campos son de solo lectura. Contacta soporte para modificarlos.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nombre de la tienda</label>
              <input
                type="text"
                value={tenant?.store_name || tenant?.name || ""}
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
              <input
                type="text"
                value={tenant?.slug || ""}
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="text"
                value={tenant?.email || ""}
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 outline-none cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Editable settings */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Globe size={20} className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Configuracion de la tienda</h2>
          </div>
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Numero de WhatsApp</label>
                <input
                  type="text"
                  {...register("whatsapp_number")}
                  placeholder="+57 300 123 4567"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                />
                <p className="mt-1 text-xs text-gray-400">Incluye el codigo de pais</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Pais</label>
                <select
                  {...register("country")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Moneda</label>
                <input
                  type="text"
                  {...register("currency")}
                  readOnly
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 outline-none cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-400">Se asigna automaticamente segun el pais</p>
              </div>
            </div>
            {/* Gemini API Key */}
            <div className="border-t border-gray-100 pt-4 mt-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles size={18} className="text-purple-500" />
                <h3 className="text-sm font-semibold text-gray-800">Escritura Magica con IA</h3>
              </div>
              <p className="mb-3 text-xs text-gray-400">
                Conecta tu API Key de Google Gemini para generar textos persuasivos automaticamente en tus upsells.
              </p>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">API Key de Gemini</label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    {...register("gemini_api_key")}
                    placeholder="AIzaSy..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm text-gray-700 outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Obten tu API Key en{" "}
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-500 underline">
                    Google AI Studio
                  </a>
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
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
                Guardar configuracion
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
