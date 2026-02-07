import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  Pencil,
  X,
  Star,
  ShoppingCart,
  Palette,
  RotateCcw,
} from "lucide-react";
import client from "../api/client";
import CTAButtonEditor from "../components/checkout/CTAButtonEditor";
import FormBlocksEditor from "../components/checkout/FormBlocksEditor";
import FormStyleEditor from "../components/checkout/FormStyleEditor";
import TextsEditor from "../components/checkout/TextsEditor";
import OptionsEditor from "../components/checkout/OptionsEditor";
import CheckoutPreview from "../components/checkout/CheckoutPreview";

/* ------------------------------------------------------------------ */
/*  Default blocks (matches backend DEFAULT_BLOCKS)                    */
/* ------------------------------------------------------------------ */
const DEFAULT_BLOCKS = [
  { type: "product_card", position: 0, enabled: true },
  { type: "offers", position: 1, enabled: true },
  { type: "variants", position: 2, enabled: true },
  { type: "price_summary", position: 3, enabled: true },
  { type: "field", position: 4, enabled: true, field_key: "customer_first_name", label: "Nombre", placeholder: "Nombre", required: true, icon: "user" },
  { type: "field", position: 5, enabled: true, field_key: "customer_last_name", label: "Apellido", placeholder: "Apellido", required: true, icon: "user" },
  { type: "field", position: 6, enabled: true, field_key: "customer_phone", label: "Telefono", placeholder: "WhatsApp", required: true, icon: "phone", input_type: "tel" },
  { type: "field", position: 7, enabled: true, field_key: "address", label: "Direccion", placeholder: "Calle carrera #casa", required: true, icon: "map-pin" },
  { type: "field", position: 8, enabled: true, field_key: "address_extra", label: "Complemento direccion", placeholder: "Barrio y punto de referencia", required: false, icon: "map-pin" },
  { type: "field", position: 9, enabled: true, field_key: "state", label: "Departamento", placeholder: "Departamento", required: true, icon: "map-pin" },
  { type: "field", position: 10, enabled: true, field_key: "city", label: "Ciudad", placeholder: "Ciudad", required: true, icon: "map-pin" },
  { type: "field", position: 11, enabled: true, field_key: "email", label: "Correo electronico", placeholder: "email@ejemplo.com", required: false, icon: "mail", input_type: "email" },
  { type: "field", position: 12, enabled: true, field_key: "notes", label: "Notas adicionales", placeholder: "Indicaciones especiales para la entrega...", required: false, icon: "note", input_type: "textarea" },
  { type: "trust_badge", position: 13, enabled: true },
  { type: "shipping_info", position: 14, enabled: true },
  { type: "payment_method", position: 15, enabled: true },
  { type: "submit_button", position: 16, enabled: true },
];

const DEFAULT_CONFIG = {
  cta_text: "Completar pedido - {order_total}",
  cta_subtitle: null,
  cta_animation: "none",
  cta_icon: null,
  cta_sticky: true,
  cta_sticky_position: "bottom",
  cta_bg_color: "#F59E0B",
  cta_text_color: "#FFFFFF",
  cta_font_size: 18,
  cta_border_radius: 12,
  cta_border_width: 0,
  cta_border_color: "#000000",
  cta_shadow: "lg",
  cta_sticky_mobile: true,
  form_bg_color: "#FFFFFF",
  form_text_color: "#1F2937",
  form_font_size: 14,
  form_border_radius: 12,
  form_border_width: 1,
  form_border_color: "#E5E7EB",
  form_shadow: "sm",
  form_input_style: "outline",
  form_blocks: DEFAULT_BLOCKS,
  custom_fields: null,
  form_title: "Datos de envio",
  success_message: "Tu pedido ha sido recibido con exito.",
  shipping_text: "Envio gratis",
  payment_method_text: "Pago contraentrega",
  trust_badge_text: "Pago seguro contraentrega",
  show_product_image: true,
  show_price_summary: true,
  show_trust_badges: true,
  show_shipping_method: true,
  country: "CO",
};

/* ------------------------------------------------------------------ */
/*  Offers Section (preserved from existing code)                      */
/* ------------------------------------------------------------------ */
function OfferRow({ offer, onEdit, onDelete }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-900">{offer.quantity}</td>
      <td className="px-4 py-3 text-sm text-gray-900">
        ${Number(offer.price).toLocaleString("es-CO")}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">{offer.label || "---"}</td>
      <td className="px-4 py-3">
        {offer.is_highlighted ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            <Star size={12} /> Destacada
          </span>
        ) : (
          <span className="text-xs text-gray-400">No</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(offer)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <Pencil size={15} />
          </button>
          <button onClick={() => onDelete(offer.id)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500">
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function OfferFormModal({ offer, onClose }) {
  const queryClient = useQueryClient();
  const isEdit = !!offer?.id;

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      quantity: offer?.quantity || 1,
      price: offer?.price || "",
      label: offer?.label || "",
      is_highlighted: offer?.is_highlighted || false,
      name: offer?.name || "",
      rules: offer?.rules ? JSON.stringify(offer.rules, null, 2) : "[]",
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        quantity: Number(data.quantity),
        price: Number(data.price),
        rules: JSON.parse(data.rules || "[]"),
      };
      if (isEdit) {
        return client.put(`/admin/checkout/offers/${offer.id}`, payload);
      }
      return client.post("/admin/checkout/offers", payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Oferta actualizada" : "Oferta creada");
      queryClient.invalidateQueries({ queryKey: ["checkout-offers"] });
      onClose();
    },
    onError: () => toast.error("Error al guardar la oferta"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Editar oferta" : "Nueva oferta"}
          </h3>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nombre de la oferta</label>
            <input
              {...register("name")}
              placeholder="Ej: Oferta x2"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Cantidad</label>
              <input
                type="number"
                min={1}
                {...register("quantity", { required: "Requerido" })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
              />
              {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Precio</label>
              <input
                type="number"
                min={0}
                {...register("price", { required: "Requerido" })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
              />
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Etiqueta</label>
            <input
              {...register("label")}
              placeholder="Ej: Mas popular"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register("is_highlighted")} className="h-4 w-4 rounded border-gray-300 text-[#4DBEA4] focus:ring-[#4DBEA4]" />
            <span className="text-sm text-gray-700">Destacar esta oferta</span>
          </label>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Reglas (JSON)</label>
            <textarea
              {...register("rules")}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
            />
          </div>
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

function OffersSection() {
  const queryClient = useQueryClient();
  const [editingOffer, setEditingOffer] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: offers, isLoading } = useQuery({
    queryKey: ["checkout-offers"],
    queryFn: async () => {
      const res = await client.get("/admin/checkout/offers");
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => client.delete(`/admin/checkout/offers/${id}`),
    onSuccess: () => {
      toast.success("Oferta eliminada");
      queryClient.invalidateQueries({ queryKey: ["checkout-offers"] });
    },
    onError: () => toast.error("Error al eliminar la oferta"),
  });

  const handleDelete = (id) => {
    if (window.confirm("Estas seguro de eliminar esta oferta?")) {
      deleteMutation.mutate(id);
    }
  };

  const offerList = Array.isArray(offers) ? offers : offers?.items || [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 p-6">
        <div className="flex items-center gap-2">
          <ShoppingCart size={20} className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Ofertas por cantidad</h2>
        </div>
        <button
          onClick={() => { setEditingOffer(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-lg bg-[#4DBEA4] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          Agregar oferta
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : offerList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <ShoppingCart size={36} className="mb-2" />
          <p className="text-sm">No hay ofertas configuradas</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-500">Cantidad</th>
                <th className="px-4 py-3 font-medium text-gray-500">Precio</th>
                <th className="px-4 py-3 font-medium text-gray-500">Etiqueta</th>
                <th className="px-4 py-3 font-medium text-gray-500">Destacada</th>
                <th className="px-4 py-3 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {offerList.map((offer) => (
                <OfferRow
                  key={offer.id}
                  offer={offer}
                  onEdit={(o) => { setEditingOffer(o); setShowForm(true); }}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <OfferFormModal
          offer={editingOffer}
          onClose={() => { setShowForm(false); setEditingOffer(null); }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Checkout page                                                 */
/* ------------------------------------------------------------------ */
const TABS = [
  { key: "design", label: "Diseno del Formulario", icon: Palette },
  { key: "offers", label: "Ofertas por Cantidad", icon: ShoppingCart },
];

export default function Checkout() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("design");
  const [localConfig, setLocalConfig] = useState(null);
  const debounceRef = useRef(null);

  // Fetch checkout config
  const { data: fetchedConfig, isLoading, isError, error } = useQuery({
    queryKey: ["checkout-config"],
    queryFn: async () => {
      const res = await client.get("/admin/checkout-config");
      return res.data;
    },
  });

  // Initialize local config when fetched
  useEffect(() => {
    if (fetchedConfig && !localConfig) {
      const merged = { ...DEFAULT_CONFIG };
      for (const key of Object.keys(merged)) {
        if (fetchedConfig[key] !== undefined && fetchedConfig[key] !== null) {
          merged[key] = fetchedConfig[key];
        }
      }
      if (!merged.form_blocks || merged.form_blocks.length === 0) {
        merged.form_blocks = DEFAULT_BLOCKS;
      }
      setLocalConfig(merged);
    }
  }, [fetchedConfig, localConfig]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data) => client.put("/admin/checkout-config", data),
    onSuccess: () => {
      toast.success("Guardado", { duration: 1500 });
      queryClient.invalidateQueries({ queryKey: ["checkout-config"] });
    },
    onError: () => toast.error("Error al guardar"),
  });

  // Reset mutation
  const resetMutation = useMutation({
    mutationFn: () => client.post("/admin/checkout-config/reset"),
    onSuccess: (res) => {
      const data = res.data;
      const merged = { ...DEFAULT_CONFIG };
      for (const key of Object.keys(merged)) {
        if (data[key] !== undefined && data[key] !== null) {
          merged[key] = data[key];
        }
      }
      setLocalConfig(merged);
      toast.success("Configuracion restablecida");
      queryClient.invalidateQueries({ queryKey: ["checkout-config"] });
    },
    onError: () => toast.error("Error al restablecer"),
  });

  // Debounced save
  const debouncedSave = useCallback(
    (updates) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveMutation.mutate(updates);
      }, 800);
    },
    [saveMutation]
  );

  // Handle config changes from editors
  const handleConfigChange = useCallback(
    (updates) => {
      setLocalConfig((prev) => {
        const next = { ...prev, ...updates };
        debouncedSave(updates);
        return next;
      });
    },
    [debouncedSave]
  );

  // Handle blocks change (special case since it updates form_blocks)
  const handleBlocksChange = useCallback(
    (newBlocks) => {
      // Strip _id before saving
      const clean = newBlocks.map(({ _id, ...rest }) => rest);
      handleConfigChange({ form_blocks: clean });
    },
    [handleConfigChange]
  );

  const handleReset = () => {
    if (window.confirm("Restablecer toda la configuracion del checkout a los valores predeterminados?")) {
      resetMutation.mutate();
    }
  };

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

  const cfg = localConfig || DEFAULT_CONFIG;

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-1 text-sm text-gray-500">
            Personaliza el diseno, campos y ofertas de tu checkout
          </p>
        </div>
        <button
          onClick={handleReset}
          disabled={resetMutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          <RotateCcw size={14} />
          Restablecer
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "design" && (
        <div className="flex gap-6">
          {/* Left: editor panels */}
          <div className="flex-1 min-w-0 space-y-5">
            <CTAButtonEditor config={cfg} onChange={handleConfigChange} />
            <FormBlocksEditor blocks={cfg.form_blocks} onChange={handleBlocksChange} />
            <FormStyleEditor config={cfg} onChange={handleConfigChange} />
            <TextsEditor config={cfg} onChange={handleConfigChange} />
            <OptionsEditor config={cfg} onChange={handleConfigChange} />
          </div>
          {/* Right: live preview (hidden on small screens) */}
          <div className="hidden xl:block sticky top-6 self-start">
            <CheckoutPreview config={cfg} />
          </div>
        </div>
      )}

      {activeTab === "offers" && (
        <div className="space-y-6">
          <OffersSection />
        </div>
      )}
    </div>
  );
}
