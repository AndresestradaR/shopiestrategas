import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Loader2,
  AlertCircle,
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
  { type: "variants", position: 1, enabled: true },
  { type: "price_summary", position: 2, enabled: true },
  { type: "field", position: 3, enabled: true, field_key: "customer_first_name", label: "Nombre", placeholder: "Nombre", required: true, icon: "user" },
  { type: "field", position: 4, enabled: true, field_key: "customer_last_name", label: "Apellido", placeholder: "Apellido", required: true, icon: "user" },
  { type: "field", position: 5, enabled: true, field_key: "customer_phone", label: "Telefono", placeholder: "WhatsApp", required: true, icon: "phone", input_type: "tel" },
  { type: "field", position: 6, enabled: true, field_key: "address", label: "Direccion", placeholder: "Calle carrera #casa", required: true, icon: "map-pin" },
  { type: "field", position: 7, enabled: true, field_key: "address_extra", label: "Complemento direccion", placeholder: "Barrio y punto de referencia", required: false, icon: "map-pin" },
  { type: "field", position: 8, enabled: true, field_key: "state", label: "Departamento", placeholder: "Departamento", required: true, icon: "map-pin" },
  { type: "field", position: 9, enabled: true, field_key: "city", label: "Ciudad", placeholder: "Ciudad", required: true, icon: "map-pin" },
  { type: "field", position: 10, enabled: true, field_key: "email", label: "Correo electronico", placeholder: "email@ejemplo.com", required: false, icon: "mail", input_type: "email" },
  { type: "field", position: 11, enabled: true, field_key: "notes", label: "Notas adicionales", placeholder: "Indicaciones especiales para la entrega...", required: false, icon: "note", input_type: "textarea" },
  { type: "trust_badge", position: 12, enabled: true },
  { type: "submit_button", position: 13, enabled: true },
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
  cta_subtitle_font_size: 12,
  cta_font_family: "Inter, sans-serif",
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
  show_shipping_method: false,
  country: "CO",
};

/* ------------------------------------------------------------------ */
/*  Main Checkout page                                                 */
/* ------------------------------------------------------------------ */

export default function Checkout() {
  const queryClient = useQueryClient();
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

      {/* Editor panels */}
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
    </div>
  );
}
