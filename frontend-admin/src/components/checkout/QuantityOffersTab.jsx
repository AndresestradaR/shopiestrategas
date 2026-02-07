import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Loader2,
  Plus,
  Trash2,
  Pencil,
  X,
  Copy,
  ChevronUp,
  ChevronDown,
  Search,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  Package,
  ShoppingCart,
} from "lucide-react";
import client from "../../api/client";
import CheckoutPreview from "./CheckoutPreview";

const getImageUrl = (imgUrl) => {
  if (!imgUrl) return null;
  if (imgUrl.startsWith('http')) return imgUrl;
  const apiBase = import.meta.env.VITE_API_URL || '';
  return `${apiBase}${imgUrl}`;
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const PALETTES = [
  { name: "Verde natural", bg: "#FFFFFF", border: "#E5E7EB", selected: "#059669", header_bg: "#F0FDF4", header_text: "#065F46", label_bg: "#059669", label_text: "#FFFFFF", price: "#059669" },
  { name: "Azul confianza", bg: "#FFFFFF", border: "#E5E7EB", selected: "#2563EB", header_bg: "#EFF6FF", header_text: "#1E40AF", label_bg: "#2563EB", label_text: "#FFFFFF", price: "#2563EB" },
  { name: "Naranja urgente", bg: "#FFFFFF", border: "#E5E7EB", selected: "#EA580C", header_bg: "#FFF7ED", header_text: "#9A3412", label_bg: "#EA580C", label_text: "#FFFFFF", price: "#EA580C" },
  { name: "Rojo fuego", bg: "#FFFFFF", border: "#E5E7EB", selected: "#DC2626", header_bg: "#FEF2F2", header_text: "#991B1B", label_bg: "#DC2626", label_text: "#FFFFFF", price: "#DC2626" },
  { name: "Morado premium", bg: "#FFFFFF", border: "#E5E7EB", selected: "#7C3AED", header_bg: "#F5F3FF", header_text: "#5B21B6", label_bg: "#7C3AED", label_text: "#FFFFFF", price: "#7C3AED" },
  { name: "Dorado lujo", bg: "#FFFBEB", border: "#FDE68A", selected: "#D97706", header_bg: "#FFFBEB", header_text: "#92400E", label_bg: "#D97706", label_text: "#FFFFFF", price: "#B45309" },
  { name: "Oscuro elegante", bg: "#1F2937", border: "#374151", selected: "#4DBEA4", header_bg: "#111827", header_text: "#F9FAFB", label_bg: "#4DBEA4", label_text: "#FFFFFF", price: "#4DBEA4" },
  { name: "Rosa suave", bg: "#FFF1F2", border: "#FECDD3", selected: "#E11D48", header_bg: "#FFF1F2", header_text: "#9F1239", label_bg: "#E11D48", label_text: "#FFFFFF", price: "#BE123C" },
];

const DEFAULT_TIERS = [
  { title: "1 unidad", quantity: 1, position: 0, is_preselected: false, discount_type: "percentage", discount_value: 0, label_text: null, label_bg_color: "#F59E0B", label_text_color: "#FFFFFF", label_top_position: "left", label_inner_text: null, label_inner_bg_color: "#6B7280", label_inner_text_color: "#FFFFFF", price_color: "#059669", hide_compare_price: false, image_url: null },
  { title: "2 unidades", quantity: 2, position: 1, is_preselected: true, discount_type: "percentage", discount_value: 10, label_text: "Mas popular", label_bg_color: "#F59E0B", label_text_color: "#FFFFFF", label_top_position: "left", label_inner_text: "Ahorra 10%", label_inner_bg_color: "#2563EB", label_inner_text_color: "#FFFFFF", price_color: "#059669", hide_compare_price: false, image_url: null },
  { title: "3 unidades", quantity: 3, position: 2, is_preselected: false, discount_type: "percentage", discount_value: 20, label_text: "Mejor oferta", label_bg_color: "#059669", label_text_color: "#FFFFFF", label_top_position: "left", label_inner_text: "Ahorra 20%", label_inner_bg_color: "#059669", label_inner_text_color: "#FFFFFF", price_color: "#059669", hide_compare_price: false, image_url: null },
];

/* ------------------------------------------------------------------ */
/*  RGBA Color Helpers                                                 */
/* ------------------------------------------------------------------ */
function hexToRgba(hex, alpha = 1) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return `rgba(0,0,0,${alpha})`;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`;
}

function rgbaToHexAndAlpha(rgba) {
  if (!rgba) return { hex: "#000000", alpha: 1 };
  // Handle hex input
  if (rgba.startsWith("#")) return { hex: rgba.slice(0, 7), alpha: 1 };
  const m = rgba.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (!m) return { hex: "#000000", alpha: 1 };
  const r = parseInt(m[1]).toString(16).padStart(2, "0");
  const g = parseInt(m[2]).toString(16).padStart(2, "0");
  const b = parseInt(m[3]).toString(16).padStart(2, "0");
  return { hex: `#${r}${g}${b}`, alpha: m[4] !== undefined ? parseFloat(m[4]) : 1 };
}

/* ------------------------------------------------------------------ */
/*  RGBA Color Input                                                   */
/* ------------------------------------------------------------------ */
function RgbaColorInput({ label, value, onChange }) {
  const { hex, alpha } = rgbaToHexAndAlpha(value || "#000000");

  const handleHexChange = (newHex) => {
    onChange(hexToRgba(newHex, alpha));
  };

  const handleAlphaChange = (newAlpha) => {
    onChange(hexToRgba(hex, newAlpha));
  };

  const handleTextChange = (text) => {
    onChange(text);
  };

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => handleHexChange(e.target.value)}
          className="h-8 w-8 shrink-0 cursor-pointer rounded border border-gray-200"
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full rounded border border-gray-200 px-2 py-1 text-xs font-mono outline-none focus:border-[#4DBEA4]"
          placeholder="rgba(0,0,0,1) o #hex"
        />
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-[10px] text-gray-400">Opacidad</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={alpha}
          onChange={(e) => handleAlphaChange(parseFloat(e.target.value))}
          className="h-1 flex-1 cursor-pointer accent-[#4DBEA4]"
        />
        <span className="text-[10px] font-mono text-gray-500 w-8 text-right">{Math.round(alpha * 100)}%</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Simple Color Input (hex only, for offer-level colors)              */
/* ------------------------------------------------------------------ */
function ColorInput({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 shrink-0 cursor-pointer rounded border border-gray-200"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded border border-gray-200 px-2 py-1 text-xs font-mono outline-none focus:border-[#4DBEA4]"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Product Selector Modal (with images)                               */
/* ------------------------------------------------------------------ */
function ProductSelectorModal({ selectedIds, onConfirm, onClose }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set(selectedIds || []));

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products-all"],
    queryFn: async () => {
      const res = await client.get("/admin/products?per_page=500");
      return res.data?.items || res.data || [];
    },
    staleTime: 60000,
  });

  const filtered = (products || []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const getProductImage = (product) => {
    if (!product.images || product.images.length === 0) return null;
    const primary = product.images.find((img) => img.is_primary);
    return (primary || product.images[0])?.image_url || null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900">Seleccionar productos</h3>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
            />
          </div>
          <div className="max-h-80 overflow-y-auto space-y-1">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
            ) : filtered.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">No se encontraron productos</p>
            ) : (
              filtered.map((p) => {
                const imgUrl = getProductImage(p);
                return (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                      selected.has(p.id) ? "bg-[#4DBEA4]/5 border border-[#4DBEA4]/20" : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                      className="h-4 w-4 rounded border-gray-300 text-[#4DBEA4] focus:ring-[#4DBEA4]"
                    />
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={p.name}
                        className="h-10 w-10 rounded-lg object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 border border-gray-200">
                        <Package size={16} className="text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">${Number(p.price).toLocaleString("es-CO")}</p>
                    </div>
                    {selected.has(p.id) && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4DBEA4] text-white">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                    )}
                  </label>
                );
              })
            )}
          </div>
        </div>
        <div className="flex justify-between border-t border-gray-200 p-4">
          <span className="text-sm text-gray-500">{selected.size} seleccionados</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button
              onClick={() => onConfirm([...selected])}
              className="rounded-lg bg-[#4DBEA4] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tier Accordion Card (Releasit-style)                               */
/* ------------------------------------------------------------------ */
function TierCard({ tier, index, onChange, onDelete, expanded, onToggleExpand }) {
  const update = (field, value) => {
    onChange(index, { ...tier, [field]: value });
  };

  const headerTitle = tier.title || `${tier.quantity} ${tier.quantity === 1 ? "unidad" : "unidades"}`;

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Accordion header */}
      <button
        type="button"
        onClick={() => onToggleExpand(index)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-bold text-gray-800 truncate">{headerTitle}</span>
          <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">
            x{tier.quantity}
          </span>
          {tier.is_preselected && (
            <span className="shrink-0 rounded bg-[#4DBEA4]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#4DBEA4]">
              Pre-sel.
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(index); }}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {/* Accordion body */}
      {expanded && (
        <div className="border-t border-gray-200 px-4 py-4 space-y-4">
          {/* Titulo + Cantidad */}
          <div className="grid grid-cols-[1fr_100px] gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Titulo</label>
              <input
                type="text"
                value={tier.title || ""}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Ej: Compra 2 unidades con descuento"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
              />
              <p className="mt-1 text-xs text-gray-400 italic">
                Usa {"{product_name}"} para insertar el nombre del producto
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Cantidad</label>
              <input
                type="number"
                min={1}
                value={tier.quantity}
                onChange={(e) => update("quantity", parseInt(e.target.value) || 1)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={tier.is_preselected}
                onChange={(e) => update("is_preselected", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#4DBEA4] focus:ring-[#4DBEA4]"
              />
              <span className="text-sm text-gray-700">Preseleccionar esta oferta</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={tier.hide_compare_price || false}
                onChange={(e) => update("hide_compare_price", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#4DBEA4] focus:ring-[#4DBEA4]"
              />
              <span className="text-sm text-gray-700">Oculta el precio de comparacion en la oferta</span>
            </label>
          </div>

          {/* Tipo de descuento + Valor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tipo de descuento</label>
              <select
                value={tier.discount_type}
                onChange={(e) => update("discount_type", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
              >
                <option value="percentage">Porcentaje</option>
                <option value="fixed">Monto fijo</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Valor del descuento</label>
              <input
                type="number"
                min={0}
                step={tier.discount_type === "percentage" ? 1 : 100}
                value={tier.discount_value}
                onChange={(e) => update("discount_value", parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
              />
            </div>
          </div>

          {/* Precio color */}
          <RgbaColorInput
            label="Precio color"
            value={tier.price_color}
            onChange={(v) => update("price_color", v)}
          />

          {/* Etiqueta superior */}
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Etiqueta superior</p>
            <div className="grid grid-cols-[1fr_120px] gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Texto</label>
                <input
                  type="text"
                  value={tier.label_text || ""}
                  onChange={(e) => update("label_text", e.target.value || null)}
                  placeholder="Ej: Mas popular"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Posicion</label>
                <select
                  value={tier.label_top_position || "left"}
                  onChange={(e) => update("label_top_position", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                >
                  <option value="left">Izquierda</option>
                  <option value="right">Derecha</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <RgbaColorInput
                label="Color del texto"
                value={tier.label_text_color}
                onChange={(v) => update("label_text_color", v)}
              />
              <RgbaColorInput
                label="Color del fondo"
                value={tier.label_bg_color}
                onChange={(v) => update("label_bg_color", v)}
              />
            </div>
          </div>

          {/* Etiqueta interna */}
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Etiqueta interna</p>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Texto</label>
              <input
                type="text"
                value={tier.label_inner_text || ""}
                onChange={(e) => update("label_inner_text", e.target.value || null)}
                placeholder="Ej: Ahorra 25%"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <RgbaColorInput
                label="Color del texto"
                value={tier.label_inner_text_color}
                onChange={(v) => update("label_inner_text_color", v)}
              />
              <RgbaColorInput
                label="Color del fondo"
                value={tier.label_inner_bg_color}
                onChange={(v) => update("label_inner_bg_color", v)}
              />
            </div>
          </div>

          {/* URL de la imagen */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">URL de la imagen</label>
            <input
              type="text"
              value={tier.image_url || ""}
              onChange={(e) => update("image_url", e.target.value || null)}
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Editor View                                                        */
/* ------------------------------------------------------------------ */
function OfferEditor({ offer, onBack, onSaved, checkoutConfig }) {
  const queryClient = useQueryClient();
  const isNew = !offer;

  const [form, setForm] = useState(() => {
    if (offer) {
      return {
        name: offer.name,
        is_active: offer.is_active,
        product_ids: offer.product_ids || [],
        bg_color: offer.bg_color,
        border_color: offer.border_color,
        selected_border_color: offer.selected_border_color,
        header_text: offer.header_text,
        header_bg_color: offer.header_bg_color,
        header_text_color: offer.header_text_color,
        hide_product_image: offer.hide_product_image,
        show_savings: offer.show_savings,
        show_per_unit: offer.show_per_unit,
        priority: offer.priority || 0,
      };
    }
    return {
      name: "",
      is_active: true,
      product_ids: [],
      bg_color: "#FFFFFF",
      border_color: "#E5E7EB",
      selected_border_color: "#4DBEA4",
      header_text: "Selecciona la cantidad",
      header_bg_color: "#F9FAFB",
      header_text_color: "#374151",
      hide_product_image: false,
      show_savings: true,
      show_per_unit: true,
      priority: 0,
    };
  });

  const [tiers, setTiers] = useState(() => {
    if (offer?.tiers?.length > 0) {
      return offer.tiers.map((t) => ({
        title: t.title,
        quantity: t.quantity,
        position: t.position,
        is_preselected: t.is_preselected,
        discount_type: t.discount_type,
        discount_value: Number(t.discount_value),
        label_text: t.label_text,
        label_bg_color: t.label_bg_color,
        label_text_color: t.label_text_color,
        label_top_position: t.label_top_position || "left",
        label_inner_text: t.label_inner_text,
        label_inner_bg_color: t.label_inner_bg_color || "#6B7280",
        label_inner_text_color: t.label_inner_text_color || "#FFFFFF",
        price_color: t.price_color,
        hide_compare_price: t.hide_compare_price || false,
        image_url: t.image_url,
      }));
    }
    return [...DEFAULT_TIERS];
  });

  const [showProductModal, setShowProductModal] = useState(false);
  const [expandedTier, setExpandedTier] = useState(null);

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleTierChange = (idx, updated) => {
    setTiers((prev) => prev.map((t, i) => (i === idx ? updated : t)));
  };

  const handleTierDelete = (idx) => {
    setTiers((prev) => prev.filter((_, i) => i !== idx));
    if (expandedTier === idx) setExpandedTier(null);
    else if (expandedTier > idx) setExpandedTier(expandedTier - 1);
  };

  const toggleExpandTier = (idx) => {
    setExpandedTier(expandedTier === idx ? null : idx);
  };

  const addTier = () => {
    const nextQty = tiers.length > 0 ? Math.max(...tiers.map((t) => t.quantity)) + 1 : 1;
    setTiers((prev) => [
      ...prev,
      {
        title: `${nextQty} unidades`,
        quantity: nextQty,
        position: prev.length,
        is_preselected: false,
        discount_type: "percentage",
        discount_value: 0,
        label_text: null,
        label_bg_color: "#F59E0B",
        label_text_color: "#FFFFFF",
        label_top_position: "left",
        label_inner_text: null,
        label_inner_bg_color: "#6B7280",
        label_inner_text_color: "#FFFFFF",
        price_color: "#059669",
        hide_compare_price: false,
        image_url: null,
      },
    ]);
  };

  const applyPalette = (p) => {
    setForm((prev) => ({
      ...prev,
      bg_color: p.bg,
      border_color: p.border,
      selected_border_color: p.selected,
      header_bg_color: p.header_bg,
      header_text_color: p.header_text,
    }));
    setTiers((prev) =>
      prev.map((t) => ({
        ...t,
        label_bg_color: p.label_bg,
        label_text_color: p.label_text,
        price_color: p.price,
      }))
    );
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (isNew) {
        return client.post("/admin/checkout/offers", payload);
      }
      return client.put(`/admin/checkout/offers/${offer.id}`, payload);
    },
    onSuccess: () => {
      toast.success(isNew ? "Oferta creada" : "Oferta actualizada");
      queryClient.invalidateQueries({ queryKey: ["quantity-offers"] });
      onSaved();
    },
    onError: () => toast.error("Error al guardar"),
  });

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (tiers.length === 0) {
      toast.error("Agrega al menos un nivel");
      return;
    }
    const payload = {
      ...form,
      tiers: tiers.map((t, i) => ({ ...t, position: i })),
    };
    saveMutation.mutate(payload);
  };

  // Fetch products for display
  const { data: allProducts } = useQuery({
    queryKey: ["admin-products-all"],
    queryFn: async () => {
      const res = await client.get("/admin/products?per_page=500");
      return res.data?.items || res.data || [];
    },
    staleTime: 60000,
  });

  const selectedProducts = (allProducts || []).filter((p) => form.product_ids.includes(p.id));

  // Get first product data for preview
  const firstProduct = selectedProducts.length > 0 ? selectedProducts[0] : null;
  const rawImageUrl = firstProduct?.images?.length > 0
    ? (firstProduct.images.find((img) => img.is_primary) || firstProduct.images[0])?.image_url
    : null;
  const productImage = getImageUrl(rawImageUrl);
  const productName = firstProduct?.name || null;
  const productPrice = firstProduct ? Number(firstProduct.price) : null;

  return (
    <div>
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} />
          Volver a la lista
        </button>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-[#4DBEA4] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
        >
          {saveMutation.isPending && <Loader2 size={16} className="animate-spin" />}
          {isNew ? "Crear oferta" : "Guardar cambios"}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Left column: form */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Section 1: Configurar oferta */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-gray-900">Configurar oferta</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nombre de la oferta</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="Ej: Oferta 2+1"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <span className="text-sm font-medium text-gray-700">Oferta activa</span>
                <button
                  type="button"
                  onClick={() => updateForm("is_active", !form.is_active)}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${form.is_active ? "bg-[#4DBEA4]" : "bg-gray-200"}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${form.is_active ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Productos asignados ({form.product_ids.length})
                </label>
                {selectedProducts.length > 0 && (
                  <div className="mb-2 space-y-1.5">
                    {selectedProducts.map((p) => {
                      const imgUrl = p.images?.length > 0
                        ? (p.images.find((img) => img.is_primary) || p.images[0])?.image_url
                        : null;
                      return (
                        <div key={p.id} className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2">
                          {imgUrl ? (
                            <img src={imgUrl} alt={p.name} className="h-8 w-8 rounded object-cover border border-gray-200" />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-200">
                              <Package size={14} className="text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">{p.name}</p>
                            <p className="text-xs text-gray-400">${Number(p.price).toLocaleString("es-CO")}</p>
                          </div>
                          <button
                            onClick={() => updateForm("product_ids", form.product_ids.filter((id) => id !== p.id))}
                            className="rounded p-1 text-gray-400 hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowProductModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 hover:border-[#4DBEA4] hover:text-[#4DBEA4]"
                >
                  <Plus size={14} />
                  Seleccionar productos
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Tiers */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Niveles de cantidad</h3>
              <button
                onClick={addTier}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
              >
                <Plus size={13} />
                Agregar nivel
              </button>
            </div>
            {tiers.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">No hay niveles. Agrega al menos uno.</p>
            ) : (
              <div className="space-y-2">
                {tiers.map((tier, idx) => (
                  <TierCard
                    key={idx}
                    tier={tier}
                    index={idx}
                    onChange={handleTierChange}
                    onDelete={handleTierDelete}
                    expanded={expandedTier === idx}
                    onToggleExpand={toggleExpandTier}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Design */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-gray-900">Personalizacion visual</h3>

            {/* Palettes */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">Paletas predefinidas</label>
              <div className="grid grid-cols-4 gap-2">
                {PALETTES.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyPalette(p)}
                    className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 p-2 text-center hover:border-[#4DBEA4] hover:shadow-sm transition-all"
                  >
                    <div className="flex gap-0.5">
                      <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: p.selected }} />
                      <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: p.label_bg }} />
                      <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: p.header_bg }} />
                    </div>
                    <span className="text-[10px] text-gray-500">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual colors */}
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Texto del encabezado</label>
                <input
                  type="text"
                  value={form.header_text}
                  onChange={(e) => updateForm("header_text", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <ColorInput label="Fondo" value={form.bg_color} onChange={(v) => updateForm("bg_color", v)} />
                <ColorInput label="Borde" value={form.border_color} onChange={(v) => updateForm("border_color", v)} />
                <ColorInput label="Seleccionado" value={form.selected_border_color} onChange={(v) => updateForm("selected_border_color", v)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ColorInput label="Fondo encabezado" value={form.header_bg_color} onChange={(v) => updateForm("header_bg_color", v)} />
                <ColorInput label="Texto encabezado" value={form.header_text_color} onChange={(v) => updateForm("header_text_color", v)} />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <span className="text-sm text-gray-700">Mostrar ahorro</span>
                <input type="checkbox" checked={form.show_savings} onChange={(e) => updateForm("show_savings", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#4DBEA4] focus:ring-[#4DBEA4]" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <span className="text-sm text-gray-700">Mostrar precio por unidad</span>
                <input type="checkbox" checked={form.show_per_unit} onChange={(e) => updateForm("show_per_unit", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#4DBEA4] focus:ring-[#4DBEA4]" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <span className="text-sm text-gray-700">Ocultar imagen del producto</span>
                <input type="checkbox" checked={form.hide_product_image} onChange={(e) => updateForm("hide_product_image", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#4DBEA4] focus:ring-[#4DBEA4]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Full checkout preview with offer */}
        {checkoutConfig && (
          <div className="hidden xl:block shrink-0 sticky top-6 self-start">
            <CheckoutPreview
              config={checkoutConfig}
              quantityOffer={{ ...form, tiers }}
              productImage={productImage}
              productName={productName}
              productPrice={productPrice}
            />
          </div>
        )}
      </div>

      {showProductModal && (
        <ProductSelectorModal
          selectedIds={form.product_ids}
          onConfirm={(ids) => {
            updateForm("product_ids", ids);
            setShowProductModal(false);
          }}
          onClose={() => setShowProductModal(false)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Offer List Item                                                    */
/* ------------------------------------------------------------------ */
function OfferListItem({ offer, onEdit, onToggle, onDuplicate, onDelete, onPriority }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition-all hover:shadow-md">
      {/* Priority arrows */}
      <div className="flex flex-col gap-0.5">
        <button onClick={() => onPriority(offer.id, "up")} className="rounded p-0.5 text-gray-300 hover:bg-gray-100 hover:text-gray-600">
          <ChevronUp size={14} />
        </button>
        <button onClick={() => onPriority(offer.id, "down")} className="rounded p-0.5 text-gray-300 hover:bg-gray-100 hover:text-gray-600">
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Toggle */}
      <button
        onClick={() => onToggle(offer.id)}
        className="shrink-0"
        title={offer.is_active ? "Desactivar" : "Activar"}
      >
        {offer.is_active ? (
          <ToggleRight size={28} className="text-[#4DBEA4]" />
        ) : (
          <ToggleLeft size={28} className="text-gray-300" />
        )}
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{offer.name}</span>
          {!offer.is_active && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">Inactiva</span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
          <span>{offer.tiers?.length || 0} niveles</span>
          <span>{(offer.product_ids || []).length} productos</span>
          <span>{offer.impressions || 0} vistas</span>
          <span>{offer.orders_count || 0} pedidos</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button onClick={() => onEdit(offer)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="Editar">
          <Pencil size={15} />
        </button>
        <button onClick={() => onDuplicate(offer.id)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="Duplicar">
          <Copy size={15} />
        </button>
        <button onClick={() => onDelete(offer.id)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500" title="Eliminar">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Tab Component                                                 */
/* ------------------------------------------------------------------ */
export default function QuantityOffersTab({ checkoutConfig }) {
  const queryClient = useQueryClient();
  const [view, setView] = useState("list"); // list | editor
  const [editingOffer, setEditingOffer] = useState(null);
  const [search, setSearch] = useState("");

  // Fetch offers
  const { data: offers, isLoading } = useQuery({
    queryKey: ["quantity-offers"],
    queryFn: async () => {
      const res = await client.get("/admin/checkout/offers");
      return res.data;
    },
  });

  // Mutations
  const toggleMutation = useMutation({
    mutationFn: (id) => client.patch(`/admin/checkout/offers/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quantity-offers"] });
    },
  });

  const priorityMutation = useMutation({
    mutationFn: ({ id, direction }) =>
      client.patch(`/admin/checkout/offers/${id}/priority?direction=${direction}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quantity-offers"] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id) => client.post(`/admin/checkout/offers/${id}/duplicate`),
    onSuccess: () => {
      toast.success("Oferta duplicada");
      queryClient.invalidateQueries({ queryKey: ["quantity-offers"] });
    },
    onError: () => toast.error("Error al duplicar"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => client.delete(`/admin/checkout/offers/${id}`),
    onSuccess: () => {
      toast.success("Oferta eliminada");
      queryClient.invalidateQueries({ queryKey: ["quantity-offers"] });
    },
    onError: () => toast.error("Error al eliminar"),
  });

  const handleDelete = (id) => {
    if (window.confirm("Eliminar esta oferta?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setView("editor");
  };

  const handleNew = () => {
    setEditingOffer(null);
    setView("editor");
  };

  const handleBack = () => {
    setView("list");
    setEditingOffer(null);
  };

  const offerList = Array.isArray(offers) ? offers : [];
  const filtered = offerList.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  // Editor view
  if (view === "editor") {
    return (
      <OfferEditor
        offer={editingOffer}
        onBack={handleBack}
        onSaved={handleBack}
        checkoutConfig={checkoutConfig}
      />
    );
  }

  // List view
  return (
    <div>
      {/* New offer button + search */}
      <div className="mb-4 flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          {offerList.length > 0 && (
            <>
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar oferta..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
              />
            </>
          )}
        </div>
        <button
          onClick={handleNew}
          className="inline-flex items-center gap-2 rounded-lg bg-[#4DBEA4] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          <Plus size={16} />
          Nueva oferta
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-gray-400">
          <ShoppingCart size={40} className="mb-3" />
          <p className="mb-1 text-base font-medium">No hay ofertas de cantidad</p>
          <p className="mb-4 text-sm">Crea tu primera oferta para aumentar el ticket promedio</p>
          <button
            onClick={handleNew}
            className="inline-flex items-center gap-2 rounded-lg bg-[#4DBEA4] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            <Plus size={16} />
            Crear oferta
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((offer) => (
            <OfferListItem
              key={offer.id}
              offer={offer}
              onEdit={handleEdit}
              onToggle={(id) => toggleMutation.mutate(id)}
              onDuplicate={(id) => duplicateMutation.mutate(id)}
              onDelete={handleDelete}
              onPriority={(id, dir) => priorityMutation.mutate({ id, direction: dir })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
