import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Loader2,
  AlertCircle,
  Save,
  MessageCircle,
  Mic,
  Timer,
  Package,
  MessageSquareQuote,
  Puzzle,
} from "lucide-react";
import client from "../api/client";

/* ------------------------------------------------------------------ */
/*  Available apps with metadata                                       */
/* ------------------------------------------------------------------ */
const APP_CATALOG = [
  {
    slug: "whatsapp-button",
    name: "Boton de WhatsApp",
    description: "Muestra un boton flotante de WhatsApp para que tus clientes te contacten facilmente.",
    icon: MessageCircle,
    color: "bg-green-100 text-green-600",
    fields: [
      { key: "phone_number", label: "Numero de WhatsApp", type: "text", placeholder: "+57 300 123 4567" },
      { key: "welcome_message", label: "Mensaje de bienvenida", type: "text", placeholder: "Hola! En que te puedo ayudar?" },
      { key: "position", label: "Posicion", type: "select", options: [
        { value: "bottom-right", label: "Abajo derecha" },
        { value: "bottom-left", label: "Abajo izquierda" },
      ]},
    ],
  },
  {
    slug: "voice-widget",
    name: "Widget de voz",
    description: "Agrega un widget de notas de voz para que tus clientes dejen mensajes de audio.",
    icon: Mic,
    color: "bg-blue-100 text-blue-600",
    fields: [
      { key: "max_duration", label: "Duracion maxima (segundos)", type: "number", placeholder: "30" },
      { key: "auto_play", label: "Reproducir automaticamente", type: "checkbox" },
    ],
  },
  {
    slug: "countdown-timer",
    name: "Temporizador de cuenta regresiva",
    description: "Muestra un temporizador de urgencia en el checkout o paginas de producto.",
    icon: Timer,
    color: "bg-red-100 text-red-600",
    fields: [
      { key: "minutes", label: "Minutos", type: "number", placeholder: "15" },
      { key: "message", label: "Mensaje", type: "text", placeholder: "La oferta termina en..." },
      { key: "show_on_checkout", label: "Mostrar en checkout", type: "checkbox" },
      { key: "show_on_product", label: "Mostrar en producto", type: "checkbox" },
    ],
  },
  {
    slug: "stock-counter",
    name: "Contador de stock",
    description: "Muestra un indicador de unidades disponibles para generar urgencia de compra.",
    icon: Package,
    color: "bg-amber-100 text-amber-600",
    fields: [
      { key: "low_stock_threshold", label: "Umbral de stock bajo", type: "number", placeholder: "5" },
      { key: "message_template", label: "Mensaje", type: "text", placeholder: "Solo quedan {count} unidades!" },
    ],
  },
  {
    slug: "testimonials",
    name: "Testimonios",
    description: "Muestra testimonios y resenas de clientes en tu tienda para generar confianza.",
    icon: MessageSquareQuote,
    color: "bg-purple-100 text-purple-600",
    fields: [
      { key: "display_count", label: "Cantidad a mostrar", type: "number", placeholder: "6" },
      { key: "layout", label: "Diseno", type: "select", options: [
        { value: "grid", label: "Cuadricula" },
        { value: "carousel", label: "Carrusel" },
        { value: "list", label: "Lista" },
      ]},
      { key: "show_rating", label: "Mostrar calificacion", type: "checkbox" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Config panel for an app                                            */
/* ------------------------------------------------------------------ */
function AppConfigPanel({ app, appData }) {
  const queryClient = useQueryClient();
  const catalogApp = APP_CATALOG.find((a) => a.slug === app.slug) || APP_CATALOG.find((a) => a.slug === app);
  const fields = catalogApp?.fields || [];

  const defaults = {};
  fields.forEach((f) => {
    defaults[f.key] = appData?.config?.[f.key] || (f.type === "checkbox" ? false : "");
  });

  const { register, handleSubmit, reset } = useForm({ defaultValues: defaults });

  useEffect(() => {
    const vals = {};
    fields.forEach((f) => {
      vals[f.key] = appData?.config?.[f.key] || (f.type === "checkbox" ? false : "");
    });
    reset(vals);
  }, [appData, reset]);

  const mutation = useMutation({
    mutationFn: (data) =>
      client.put(`/admin/apps/${catalogApp.slug}`, {
        is_active: true,
        config: data,
      }),
    onSuccess: () => {
      toast.success("Configuracion guardada");
      queryClient.invalidateQueries({ queryKey: ["admin-apps"] });
    },
    onError: () => toast.error("Error al guardar"),
  });

  if (fields.length === 0) {
    return (
      <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
        <p className="text-sm text-gray-500">Esta app no requiere configuracion adicional.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="space-y-4 border-t border-gray-100 bg-gray-50 px-6 py-4"
    >
      <h4 className="text-sm font-semibold text-gray-700">Configuracion</h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          if (field.type === "checkbox") {
            return (
              <label key={field.key} className="flex items-center gap-2 cursor-pointer sm:col-span-2">
                <input
                  type="checkbox"
                  {...register(field.key)}
                  className="h-4 w-4 rounded border-gray-300 text-[#4DBEA4] focus:ring-[#4DBEA4]"
                />
                <span className="text-sm text-gray-700">{field.label}</span>
              </label>
            );
          }
          if (field.type === "select") {
            return (
              <div key={field.key}>
                <label className="mb-1 block text-sm font-medium text-gray-700">{field.label}</label>
                <select
                  {...register(field.key)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                >
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }
          return (
            <div key={field.key}>
              <label className="mb-1 block text-sm font-medium text-gray-700">{field.label}</label>
              <input
                type={field.type}
                {...register(field.key)}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-[#4DBEA4] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Guardar configuracion
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  App card                                                           */
/* ------------------------------------------------------------------ */
function AppCard({ catalogApp, appData }) {
  const queryClient = useQueryClient();
  const isActive = appData?.is_active || false;
  const Icon = catalogApp.icon;

  const toggleMutation = useMutation({
    mutationFn: () =>
      client.put(`/admin/apps/${catalogApp.slug}`, {
        is_active: !isActive,
        config: appData?.config || {},
      }),
    onSuccess: () => {
      toast.success(isActive ? "App desactivada" : "App activada");
      queryClient.invalidateQueries({ queryKey: ["admin-apps"] });
    },
    onError: () => toast.error("Error al actualizar la app"),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start gap-4 p-5">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${catalogApp.color}`}>
          <Icon size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{catalogApp.name}</h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">{catalogApp.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              disabled={toggleMutation.isPending}
              onClick={() => toggleMutation.mutate()}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-50 ${
                isActive ? "bg-[#4DBEA4]" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          {isActive && (
            <span className="mt-2 inline-block rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
              Activa
            </span>
          )}
        </div>
      </div>
      {isActive && <AppConfigPanel app={catalogApp} appData={appData} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function Apps() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-apps"],
    queryFn: async () => {
      const res = await client.get("/admin/apps");
      return res.data;
    },
  });

  const appsList = Array.isArray(data) ? data : data?.items || [];
  const appsMap = {};
  appsList.forEach((a) => {
    appsMap[a.slug] = a;
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
        <span>Error al cargar las apps: {error?.message || "Intenta de nuevo"}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Puzzle size={22} className="text-gray-500" />
          <h1 className="text-2xl font-bold text-gray-900">Aplicaciones</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Activa y configura las apps disponibles para tu tienda
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {APP_CATALOG.map((catalogApp) => (
          <AppCard
            key={catalogApp.slug}
            catalogApp={catalogApp}
            appData={appsMap[catalogApp.slug]}
          />
        ))}
      </div>
    </div>
  );
}
