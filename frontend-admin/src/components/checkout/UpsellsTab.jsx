import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ChevronRight,
  ShoppingCart,
  CheckSquare,
  Zap,
  Plus,
  Pencil,
  Copy,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Info,
  Package,
  X,
  Sparkles,
} from "lucide-react";
import client from "../../api/client";
import ColorPicker from "./ColorPicker";
import SliderControl from "./SliderControl";
import ProductSelectorModal from "./ProductSelectorModal";
import UpsellPopupPreview from "./UpsellPopupPreview";

const getImageUrl = (imgUrl) => {
  if (!imgUrl) return null;
  if (imgUrl.startsWith("http")) return imgUrl;
  const apiBase = import.meta.env.VITE_API_URL || "";
  if (apiBase) return `${apiBase}${imgUrl}`;
  return imgUrl.replace(/^\/uploads/, "/api/uploads");
};

/* ─── Default upsell data ──────────────────────────────────────────── */
const DEFAULT_UPSELL = {
  name: "Nuevo upsell",
  is_active: true,
  priority: 0,
  trigger_type: "all",
  trigger_product_ids: [],
  upsell_product_id: null,
  discount_type: "none",
  discount_value: 0,
  title: "Agregar {product_name} a tu pedido!",
  title_color: "rgba(0,0,0,1)",
  subtitle: "",
  product_title_override: "",
  product_description_override: "",
  product_price_color: "rgba(0,0,0,1)",
  show_quantity_selector: false,
  hide_close_icon: false,
  hide_variant_selector: false,
  countdown_label: "",
  countdown_hours: 0,
  countdown_minutes: 0,
  countdown_seconds: 0,
  add_button_text: "Agregar a tu pedido",
  add_button_animation: "none",
  add_button_icon: null,
  add_button_bg_color: "rgba(0,0,0,1)",
  add_button_text_color: "rgba(255,255,255,1)",
  add_button_font_size: 16,
  add_button_border_radius: 8,
  add_button_border_width: 0,
  add_button_border_color: "rgba(0,0,0,1)",
  add_button_shadow: 0,
  decline_button_text: "No gracias, completar mi pedido",
  decline_button_bg_color: "rgba(255,255,255,1)",
  decline_button_text_color: "rgba(0,0,0,1)",
  decline_button_font_size: 14,
  decline_button_border_radius: 8,
  decline_button_border_width: 1,
  decline_button_border_color: "rgba(0,0,0,1)",
  decline_button_shadow: 0,
};

/* ─── Section wrapper ──────────────────────────────────────────────── */
function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <span className="text-sm font-bold text-gray-800">{title}</span>
        <ChevronRight
          size={16}
          className={`text-gray-400 transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && <div className="border-t px-5 pb-5 pt-4 space-y-4">{children}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                    */
/* ═══════════════════════════════════════════════════════════════════ */
export default function UpsellsTab() {
  const queryClient = useQueryClient();

  // View: "cards" | "config" | "editor"
  const [view, setView] = useState("cards");
  const [editingUpsell, setEditingUpsell] = useState(null); // null = creating new
  const [localUpsell, setLocalUpsell] = useState({ ...DEFAULT_UPSELL });
  const [upsellProduct, setUpsellProduct] = useState(null); // product info for preview
  const [triggerProducts, setTriggerProducts] = useState([]); // products for trigger display
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState("upsell"); // "upsell" | "trigger"

  /* ── Queries ─────────────────────────────────────────────────────── */
  const { data: upsellConfig, isLoading: configLoading } = useQuery({
    queryKey: ["upsell-config"],
    queryFn: async () => (await client.get("/admin/upsells/config")).data,
  });

  const { data: upsells = [], isLoading: upsellsLoading } = useQuery({
    queryKey: ["upsells"],
    queryFn: async () => {
      const res = await client.get("/admin/upsells");
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  /* ── Mutations ───────────────────────────────────────────────────── */
  const updateConfigMut = useMutation({
    mutationFn: (data) => client.put("/admin/upsells/config", data),
    onSuccess: () => {
      toast.success("Configuracion guardada");
      queryClient.invalidateQueries({ queryKey: ["upsell-config"] });
    },
    onError: () => toast.error("Error al guardar"),
  });

  const createUpsellMut = useMutation({
    mutationFn: (data) => client.post("/admin/upsells", data),
    onSuccess: () => {
      toast.success("Upsell creado");
      queryClient.invalidateQueries({ queryKey: ["upsells"] });
      setView("config");
    },
    onError: () => toast.error("Error al crear upsell"),
  });

  const updateUpsellMut = useMutation({
    mutationFn: ({ id, data }) => client.put(`/admin/upsells/${id}`, data),
    onSuccess: () => {
      toast.success("Upsell guardado");
      queryClient.invalidateQueries({ queryKey: ["upsells"] });
      setView("config");
    },
    onError: () => toast.error("Error al guardar upsell"),
  });

  const toggleMut = useMutation({
    mutationFn: (id) => client.patch(`/admin/upsells/${id}/toggle`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["upsells"] }),
  });

  const duplicateMut = useMutation({
    mutationFn: (id) => client.post(`/admin/upsells/${id}/duplicate`),
    onSuccess: () => {
      toast.success("Upsell duplicado");
      queryClient.invalidateQueries({ queryKey: ["upsells"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => client.delete(`/admin/upsells/${id}`),
    onSuccess: () => {
      toast.success("Upsell eliminado");
      queryClient.invalidateQueries({ queryKey: ["upsells"] });
    },
  });

  /* ── AI text generation ──────────────────────────────────────────── */
  const [aiLoading, setAiLoading] = useState(null); // field being generated

  const generateAiText = async (field) => {
    if (!upsellProduct) {
      toast.error("Selecciona un producto upsell primero");
      return;
    }
    setAiLoading(field);
    try {
      const res = await client.post("/admin/ai/generate-upsell-text", {
        field,
        product_name: "producto del cliente",
        upsell_product_name: upsellProduct.name,
        upsell_product_description: upsellProduct.description || "",
        current_text: field === "title" ? localUpsell.title : field === "subtitle" ? localUpsell.subtitle : localUpsell.product_description_override,
      });
      const text = res.data.text;
      if (field === "title") handleChange({ title: text });
      else if (field === "subtitle") handleChange({ subtitle: text });
      else if (field === "description") handleChange({ product_description_override: text });
      toast.success("Texto generado");
    } catch (err) {
      const msg = err.response?.data?.detail || "Error al generar texto";
      toast.error(msg);
    } finally {
      setAiLoading(null);
    }
  };

  /* ── Handlers ────────────────────────────────────────────────────── */
  const handleChange = (updates) => {
    setLocalUpsell((prev) => ({ ...prev, ...updates }));
  };

  const openEditor = (upsell = null) => {
    if (upsell) {
      setEditingUpsell(upsell);
      setLocalUpsell({ ...DEFAULT_UPSELL, ...upsell });
      setUpsellProduct(upsell.upsell_product || null);
      // We'll load trigger product names from IDs
      setTriggerProducts([]);
    } else {
      setEditingUpsell(null);
      setLocalUpsell({ ...DEFAULT_UPSELL });
      setUpsellProduct(null);
      setTriggerProducts([]);
    }
    setView("editor");
  };

  const handleSaveUpsell = () => {
    const data = { ...localUpsell };
    data.upsell_product_id = data.upsell_product_id ? String(data.upsell_product_id) : null;
    data.trigger_product_ids = (data.trigger_product_ids || []).map(String);

    if (editingUpsell) {
      updateUpsellMut.mutate({ id: editingUpsell.id, data });
    } else {
      createUpsellMut.mutate(data);
    }
  };

  const handleProductSelect = (products) => {
    if (productModalMode === "upsell" && products.length > 0) {
      const p = products[0];
      const imgUrl = p.images?.[0]?.image_url || p.images?.[0]?.url || p.images?.[0] || null;
      setUpsellProduct({
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description || "",
        image_url: imgUrl,
        variants: p.variants || [],
      });
      handleChange({ upsell_product_id: String(p.id) });
    } else if (productModalMode === "trigger") {
      setTriggerProducts(products);
      handleChange({ trigger_product_ids: products.map((p) => String(p.id)) });
    }
  };

  /* ─── VIEW: Cards (main landing) ──────────────────────────────── */
  if (view === "cards") {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Upsells & Downsells</h2>

        {/* Card 1: Upsells 1-Click */}
        <div className="flex items-start gap-5 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShoppingCart size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900">Upsells 1-Click</h3>
            <p className="mt-1 text-sm text-gray-500">
              Estos upsells apareceran en un popup antes o despues de que tus clientes
              compren en el formulario COD. Se pueden usar para vender productos
              relacionados a tus clientes para aumentar tu AOV.
            </p>
            <button
              onClick={() => setView("config")}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#4DBEA4] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3da88e] transition-colors"
            >
              Configurar Upsells 1-Click
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Card 2: Upsells 1-Tick (disabled) */}
        <div className="flex items-start gap-5 rounded-2xl border border-gray-200 bg-white p-6 opacity-60">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
            <CheckSquare size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900">Upsells 1-Tick</h3>
            <p className="mt-1 text-sm text-gray-500">
              Estos upsells apareceran dentro de tu formulario COD y puede usarlos para
              aumentar tu AOV con complementos. Ejemplos: Proteccion de envio,
              Envoltorio de regalo, Garantia ampliada.
            </p>
            <button
              disabled
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
            >
              Configurar Upsells 1-Tick
              <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
                PRONTO
              </span>
            </button>
          </div>
        </div>

        {/* Card 3: Downsells (disabled) */}
        <div className="flex items-start gap-5 rounded-2xl border border-gray-200 bg-white p-6 opacity-60">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
            <Zap size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900">Downsells</h3>
            <p className="mt-1 text-sm text-gray-500">
              Los downsell son popups que ofrecen un descuento a sus clientes para
              completar su pedido cuando cierran el formulario. Puede usarlos para
              recuperar las ventas de los clientes que abrieron el formulario pero
              luego lo cerraron.
            </p>
            <button
              disabled
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
            >
              Configurar Downsells
              <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
                PRONTO
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── VIEW: Config (upsells 1-click settings + list) ──────────── */
  if (view === "config") {
    const cfg = upsellConfig || { upsell_type: "post_purchase", max_upsells_per_order: 2, is_active: true };
    const isLoading = configLoading || upsellsLoading;

    return (
      <div className="space-y-5">
        {/* Back header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("cards")}
            className="rounded-lg p-1.5 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-900">Upsells 1-Click</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Section 1: Modalidad */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
              <h3 className="text-sm font-bold text-gray-800">
                Selecciona la modalidad de tus upsells
              </h3>

              {/* Type toggle */}
              <div className="flex gap-2">
                {["pre_purchase", "post_purchase"].map((type) => (
                  <button
                    key={type}
                    onClick={() => updateConfigMut.mutate({ upsell_type: type })}
                    className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                      cfg.upsell_type === type
                        ? "bg-[#4DBEA4] text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {type === "pre_purchase" ? "Pre-compra" : "Post-compra"}
                  </button>
                ))}
              </div>

              {/* Info box */}
              <div className="flex gap-2 rounded-lg bg-blue-50 p-3">
                <Info size={16} className="mt-0.5 flex-shrink-0 text-blue-500" />
                <p className="text-sm text-blue-700">
                  {cfg.upsell_type === "post_purchase"
                    ? "Post-Purchase Upsells — El popup de upsells aparecera despues de que tus clientes completen su pedido."
                    : "Pre-Purchase Upsells — El popup de upsells aparecera antes de que tus clientes completen su pedido."}
                </p>
              </div>

              <hr />

              {/* Max per order */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Numero maximo de upsells por pedido:
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      onClick={() => updateConfigMut.mutate({ max_upsells_per_order: n })}
                      className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
                        cfg.max_upsells_per_order === n
                          ? "bg-[#4DBEA4] text-white"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Upsells list */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">Crea tus upsells</h3>
                <button
                  onClick={() => openEditor(null)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#4DBEA4] px-3 py-2 text-sm font-semibold text-white hover:bg-[#3da88e]"
                >
                  <Plus size={16} />
                  Anadir upsell
                </button>
              </div>

              {upsells.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12">
                  <Package size={40} className="mb-3 text-gray-300" />
                  <p className="mb-1 text-sm font-medium text-gray-500">
                    No tienes upsells creados
                  </p>
                  <p className="mb-4 text-xs text-gray-400">
                    Crea tu primer upsell para aumentar tu AOV
                  </p>
                  <button
                    onClick={() => openEditor(null)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#4DBEA4] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3da88e]"
                  >
                    <Plus size={16} />
                    Anadir upsell
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upsells.map((u) => {
                    const productImg = u.upsell_product?.image_url;
                    return (
                      <div
                        key={u.id}
                        className="flex items-center gap-4 rounded-xl border border-gray-200 p-4"
                      >
                        {/* Product image */}
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {productImg ? (
                            <img src={getImageUrl(productImg)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-300">
                              <Package size={20} />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-800">
                            {u.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {u.trigger_type === "all" ? "Todos los productos" : "Productos especificos"}
                            {" → "}
                            {u.upsell_product?.name || "Sin producto"}
                          </p>
                        </div>

                        {/* Toggle */}
                        <button
                          onClick={() => toggleMut.mutate(u.id)}
                          className="flex-shrink-0"
                        >
                          {u.is_active ? (
                            <ToggleRight size={28} className="text-[#4DBEA4]" />
                          ) : (
                            <ToggleLeft size={28} className="text-gray-300" />
                          )}
                        </button>

                        {/* Actions */}
                        <div className="flex flex-shrink-0 gap-1">
                          <button
                            onClick={() => openEditor(u)}
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => duplicateMut.mutate(u.id)}
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            title="Duplicar"
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("Eliminar este upsell?")) deleteMut.mutate(u.id);
                            }}
                            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                            title="Eliminar"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  /* ─── VIEW: Editor (create/edit upsell) ───────────────────────── */
  const saving = createUpsellMut.isPending || updateUpsellMut.isPending;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("config")} className="rounded-lg p-1.5 hover:bg-gray-100">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-900">
            {editingUpsell ? "Editar upsell" : "Crear upsell"}
          </h2>
        </div>
        <button
          onClick={handleSaveUpsell}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#4DBEA4] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3da88e] disabled:opacity-50"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Guardar
        </button>
      </div>

      <div className="flex gap-6">
        {/* Left: form */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Section: Config */}
          <Section title="Configura tu upsell">
            {/* Name */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Nombre del upsell</label>
              <input
                type="text"
                value={localUpsell.name}
                onChange={(e) => handleChange({ name: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#4DBEA4] focus:outline-none focus:ring-2 focus:ring-[#4DBEA4]/20"
              />
            </div>

            {/* Trigger */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-600">
                Si tus clientes estan comprando uno de estos productos:
              </label>
              <div className="flex gap-2 mb-3">
                {["all", "specific"].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleChange({ trigger_type: t })}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      localUpsell.trigger_type === t
                        ? "bg-[#4DBEA4] text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {t === "all" ? "Todos los productos" : "Productos especificos"}
                  </button>
                ))}
              </div>
              {localUpsell.trigger_type === "specific" && (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setProductModalMode("trigger");
                      setProductModalOpen(true);
                    }}
                    className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 hover:border-[#4DBEA4] hover:text-[#4DBEA4]"
                  >
                    + Selecciona los productos
                  </button>
                  {triggerProducts.length > 0 && (
                    <div className="space-y-1">
                      {triggerProducts.map((p) => {
                        const imgUrl = p.images?.[0]?.image_url || p.images?.[0]?.url || p.images?.[0] || p.image_url || null;
                        return (
                          <div key={p.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                            <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
                              {imgUrl ? (
                                <img src={getImageUrl(imgUrl)} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                  <Package size={14} />
                                </div>
                              )}
                            </div>
                            <span className="flex-1 truncate text-sm text-gray-700">{p.name}</span>
                            <button
                              onClick={() => {
                                const filtered = triggerProducts.filter((tp) => tp.id !== p.id);
                                setTriggerProducts(filtered);
                                handleChange({ trigger_product_ids: filtered.map((tp) => String(tp.id)) });
                              }}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Upsell product */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-600">
                Upsell el siguiente producto:
              </label>
              {upsellProduct ? (
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {upsellProduct.image_url ? (
                      <img src={getImageUrl(upsellProduct.image_url)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-300"><Package size={16} /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{upsellProduct.name}</p>
                    <p className="text-xs text-gray-400">${Number(upsellProduct.price).toLocaleString("es-CO")}</p>
                  </div>
                  <button
                    onClick={() => {
                      setProductModalMode("upsell");
                      setProductModalOpen(true);
                    }}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cambiar
                  </button>
                  <button
                    onClick={() => {
                      setUpsellProduct(null);
                      handleChange({ upsell_product_id: null });
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setProductModalMode("upsell");
                    setProductModalOpen(true);
                  }}
                  className="w-full rounded-lg border-2 border-dashed border-gray-300 py-6 text-sm text-gray-400 hover:border-[#4DBEA4] hover:text-[#4DBEA4]"
                >
                  + Seleccionar producto
                </button>
              )}
            </div>

            {/* Discount */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Descuento al producto en upsell
              </label>
              <select
                value={localUpsell.discount_type}
                onChange={(e) => handleChange({ discount_type: e.target.value, discount_value: 0 })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#4DBEA4] focus:outline-none"
              >
                <option value="none">Sin descuento</option>
                <option value="fixed">Valor fijo</option>
                <option value="percentage">Porcentaje</option>
              </select>
              {localUpsell.discount_type !== "none" && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={localUpsell.discount_type === "percentage" ? 100 : undefined}
                    value={localUpsell.discount_value}
                    onChange={(e) => handleChange({ discount_value: Number(e.target.value) })}
                    className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#4DBEA4] focus:outline-none"
                  />
                  <span className="text-sm text-gray-500">
                    {localUpsell.discount_type === "percentage" ? "%" : "$"}
                  </span>
                </div>
              )}
            </div>
          </Section>

          {/* Section: Design */}
          <Section title="Personaliza el diseno">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600">Titulo</label>
                <button
                  type="button"
                  onClick={() => generateAiText("title")}
                  disabled={aiLoading === "title"}
                  className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-1 text-[11px] font-medium text-purple-600 hover:bg-purple-100 disabled:opacity-50"
                  title="Generar con IA"
                >
                  {aiLoading === "title" ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Escritura magica
                </button>
              </div>
              <input
                type="text"
                value={localUpsell.title}
                onChange={(e) => handleChange({ title: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#4DBEA4] focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Codigos: {"{product_name}"} para nombre del producto, {"{first_name}"} para nombre del cliente
              </p>
            </div>
            <ColorPicker label="Color del titulo" value={localUpsell.title_color} onChange={(v) => handleChange({ title_color: v })} />
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600">Subtitulo</label>
                <button
                  type="button"
                  onClick={() => generateAiText("subtitle")}
                  disabled={aiLoading === "subtitle"}
                  className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-1 text-[11px] font-medium text-purple-600 hover:bg-purple-100 disabled:opacity-50"
                  title="Generar con IA"
                >
                  {aiLoading === "subtitle" ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Escritura magica
                </button>
              </div>
              <input
                type="text"
                value={localUpsell.subtitle}
                onChange={(e) => handleChange({ subtitle: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#4DBEA4] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Titulo del producto (override)</label>
              <input
                type="text"
                placeholder="Si deja este campo vacio, la aplicacion utilizara el titulo del producto"
                value={localUpsell.product_title_override || ""}
                onChange={(e) => handleChange({ product_title_override: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#4DBEA4] focus:outline-none"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600">Descripcion del producto (override)</label>
                <button
                  type="button"
                  onClick={() => generateAiText("description")}
                  disabled={aiLoading === "description"}
                  className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-1 text-[11px] font-medium text-purple-600 hover:bg-purple-100 disabled:opacity-50"
                  title="Generar con IA"
                >
                  {aiLoading === "description" ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Escritura magica
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="Si dejas este campo en blanco, la aplicacion utilizara la descripcion del producto"
                value={localUpsell.product_description_override || ""}
                onChange={(e) => handleChange({ product_description_override: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#4DBEA4] focus:outline-none"
              />
            </div>
            <ColorPicker label="Color del precio" value={localUpsell.product_price_color} onChange={(v) => handleChange({ product_price_color: v })} />
            {/* Checkboxes */}
            <div className="space-y-2">
              {[
                { key: "show_quantity_selector", label: "Habilitar el selector de cantidad" },
                { key: "hide_close_icon", label: "Ocultar el icono de cierre X" },
                { key: "hide_variant_selector", label: "Ocultar el selector de variantes" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localUpsell[key]}
                    onChange={(e) => handleChange({ [key]: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-[#4DBEA4] focus:ring-[#4DBEA4]"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </Section>

          {/* Section: Countdown */}
          <Section title="Cuenta atras" defaultOpen={false}>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Etiqueta cuenta atras</label>
              <input
                type="text"
                value={localUpsell.countdown_label}
                onChange={(e) => handleChange({ countdown_label: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#4DBEA4] focus:outline-none"
                placeholder="Ej: Esta oferta expira en"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "countdown_hours", label: "Horas" },
                { key: "countdown_minutes", label: "Minutos" },
                { key: "countdown_seconds", label: "Segundos" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
                  <input
                    type="number"
                    min={0}
                    value={localUpsell[key]}
                    onChange={(e) => handleChange({ [key]: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#4DBEA4] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </Section>

          {/* Section: Add button */}
          <Section title="Boton de agregar al pedido" defaultOpen={false}>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Texto del boton</label>
              <input
                type="text"
                value={localUpsell.add_button_text}
                onChange={(e) => handleChange({ add_button_text: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#4DBEA4] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Animacion</label>
              <select
                value={localUpsell.add_button_animation}
                onChange={(e) => handleChange({ add_button_animation: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="none">Ninguna</option>
                <option value="pulse">Pulso</option>
                <option value="shake">Sacudida</option>
                <option value="bounce">Rebotar</option>
                <option value="glow">Brillar</option>
                <option value="wiggle">Tambalear</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Icono</label>
              <select
                value={localUpsell.add_button_icon || ""}
                onChange={(e) => handleChange({ add_button_icon: e.target.value || null })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">Sin icono</option>
                <option value="cart">Carrito</option>
                <option value="gift">Regalo</option>
                <option value="star">Estrella</option>
                <option value="fire">Fuego</option>
                <option value="tag">Etiqueta</option>
                <option value="heart">Corazon</option>
                <option value="check">Check</option>
                <option value="zap">Rayo</option>
              </select>
            </div>
            <ColorPicker label="Color del fondo" value={localUpsell.add_button_bg_color} onChange={(v) => handleChange({ add_button_bg_color: v })} />
            <ColorPicker label="Color del texto" value={localUpsell.add_button_text_color} onChange={(v) => handleChange({ add_button_text_color: v })} />
            <SliderControl label="Tamano del texto" value={localUpsell.add_button_font_size} onChange={(v) => handleChange({ add_button_font_size: v })} min={10} max={24} unit="px" />
            <SliderControl label="Radio del borde" value={localUpsell.add_button_border_radius} onChange={(v) => handleChange({ add_button_border_radius: v })} min={0} max={30} unit="px" />
            <SliderControl label="Ancho del borde" value={localUpsell.add_button_border_width} onChange={(v) => handleChange({ add_button_border_width: v })} min={0} max={5} unit="px" />
            <ColorPicker label="Color del borde" value={localUpsell.add_button_border_color} onChange={(v) => handleChange({ add_button_border_color: v })} />
            <SliderControl label="Sombra" value={localUpsell.add_button_shadow} onChange={(v) => handleChange({ add_button_shadow: v })} min={0} max={1} step={0.1} />
          </Section>

          {/* Section: Decline button */}
          <Section title="Boton no gracias" defaultOpen={false}>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Texto del boton</label>
              <input
                type="text"
                value={localUpsell.decline_button_text}
                onChange={(e) => handleChange({ decline_button_text: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#4DBEA4] focus:outline-none"
              />
            </div>
            <ColorPicker label="Color del fondo" value={localUpsell.decline_button_bg_color} onChange={(v) => handleChange({ decline_button_bg_color: v })} />
            <ColorPicker label="Color del texto" value={localUpsell.decline_button_text_color} onChange={(v) => handleChange({ decline_button_text_color: v })} />
            <SliderControl label="Tamano del texto" value={localUpsell.decline_button_font_size} onChange={(v) => handleChange({ decline_button_font_size: v })} min={10} max={24} unit="px" />
            <SliderControl label="Radio del borde" value={localUpsell.decline_button_border_radius} onChange={(v) => handleChange({ decline_button_border_radius: v })} min={0} max={30} unit="px" />
            <SliderControl label="Ancho del borde" value={localUpsell.decline_button_border_width} onChange={(v) => handleChange({ decline_button_border_width: v })} min={0} max={5} unit="px" />
            <ColorPicker label="Color del borde" value={localUpsell.decline_button_border_color} onChange={(v) => handleChange({ decline_button_border_color: v })} />
            <SliderControl label="Sombra" value={localUpsell.decline_button_shadow} onChange={(v) => handleChange({ decline_button_shadow: v })} min={0} max={1} step={0.1} />
          </Section>
        </div>

        {/* Right: preview */}
        <div className="hidden xl:block w-[380px] flex-shrink-0 sticky top-6 self-start">
          <div className="rounded-2xl border border-gray-200 bg-gray-100 p-4">
            <p className="mb-3 text-center text-xs font-medium text-gray-500">Vista previa del popup</p>
            <UpsellPopupPreview upsell={localUpsell} product={upsellProduct} />
          </div>
        </div>
      </div>

      {/* Product selector modal */}
      <ProductSelectorModal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onConfirm={handleProductSelect}
        multi={productModalMode === "trigger"}
        selectedIds={
          productModalMode === "trigger"
            ? (localUpsell.trigger_product_ids || [])
            : localUpsell.upsell_product_id
            ? [localUpsell.upsell_product_id]
            : []
        }
        title={
          productModalMode === "trigger"
            ? "Selecciona productos trigger"
            : "Selecciona el producto upsell"
        }
      />
    </div>
  );
}
