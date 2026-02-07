import { X, ShoppingCart, Clock, Minus, Plus } from "lucide-react";
import { useState } from "react";

const getImageUrl = (imgUrl) => {
  if (!imgUrl) return null;
  if (imgUrl.startsWith("http")) return imgUrl;
  const apiBase = import.meta.env.VITE_API_URL || "";
  if (apiBase) return `${apiBase}${imgUrl}`;
  return imgUrl.replace(/^\/uploads/, "/api/uploads");
};

const ANIMATIONS = {
  none: "",
  pulse: "animate-pulse",
  shake: "animate-[shake_0.5s_ease-in-out_infinite]",
  bounce: "animate-bounce",
};

export default function UpsellPopupPreview({ upsell, product }) {
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50 p-8">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl">
            ⚠️
          </div>
          <p className="text-sm font-medium text-amber-700">
            Selecciona el producto para el upsell para ver la vista previa.
          </p>
        </div>
      </div>
    );
  }

  const productName = upsell.product_title_override || product.name;
  const productDesc = upsell.product_description_override || product.description || "";
  const productPrice = product.price || 0;
  const imgUrl = product.image_url || null;

  // Apply discount
  let finalPrice = productPrice;
  if (upsell.discount_type === "percentage" && upsell.discount_value > 0) {
    finalPrice = productPrice * (1 - upsell.discount_value / 100);
  } else if (upsell.discount_type === "fixed" && upsell.discount_value > 0) {
    finalPrice = Math.max(0, productPrice - upsell.discount_value);
  }
  const hasDiscount = finalPrice < productPrice;

  // Replace variables in title/subtitle
  const replaceVars = (text) =>
    (text || "")
      .replace(/\{product_name\}/g, product.name)
      .replace(/\{first_name\}/g, "Cliente");

  const title = replaceVars(upsell.title);
  const subtitle = replaceVars(upsell.subtitle);

  const hasCountdown =
    upsell.countdown_hours > 0 ||
    upsell.countdown_minutes > 0 ||
    upsell.countdown_seconds > 0;

  const addBtnStyle = {
    backgroundColor: upsell.add_button_bg_color,
    color: upsell.add_button_text_color,
    fontSize: `${upsell.add_button_font_size}px`,
    borderRadius: `${upsell.add_button_border_radius}px`,
    borderWidth: `${upsell.add_button_border_width}px`,
    borderColor: upsell.add_button_border_color,
    borderStyle: upsell.add_button_border_width > 0 ? "solid" : "none",
    boxShadow:
      upsell.add_button_shadow > 0
        ? `0 ${Math.round(upsell.add_button_shadow * 10)}px ${Math.round(upsell.add_button_shadow * 20)}px rgba(0,0,0,${upsell.add_button_shadow * 0.3})`
        : "none",
  };

  const decBtnStyle = {
    backgroundColor: upsell.decline_button_bg_color,
    color: upsell.decline_button_text_color,
    fontSize: `${upsell.decline_button_font_size}px`,
    borderRadius: `${upsell.decline_button_border_radius}px`,
    borderWidth: `${upsell.decline_button_border_width}px`,
    borderColor: upsell.decline_button_border_color,
    borderStyle: upsell.decline_button_border_width > 0 ? "solid" : "none",
    boxShadow:
      upsell.decline_button_shadow > 0
        ? `0 ${Math.round(upsell.decline_button_shadow * 10)}px ${Math.round(upsell.decline_button_shadow * 20)}px rgba(0,0,0,${upsell.decline_button_shadow * 0.3})`
        : "none",
  };

  const addBtnAnimation = ANIMATIONS[upsell.add_button_animation] || "";

  const formatPrice = (v) => `$${Math.round(v).toLocaleString("es-CO")}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
      {/* Overlay header bar */}
      <div className="relative bg-gray-800/5 px-4 py-3">
        {!upsell.hide_close_icon && (
          <button className="absolute right-3 top-3 rounded-full bg-gray-200/60 p-1">
            <X size={16} className="text-gray-500" />
          </button>
        )}
        {title && (
          <h3
            className="pr-8 text-center text-lg font-bold leading-snug"
            style={{ color: upsell.title_color }}
          >
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="mt-1 text-center text-sm text-gray-500">{subtitle}</p>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Product image */}
        {imgUrl && (
          <div className="mx-auto w-40 h-40 overflow-hidden rounded-xl bg-gray-100">
            <img
              src={getImageUrl(imgUrl)}
              alt={productName}
              className="h-full w-full object-contain"
            />
          </div>
        )}

        {/* Product name */}
        <h4 className="text-center text-base font-semibold text-gray-800">
          {productName}
        </h4>

        {/* Description */}
        {productDesc && (
          <p className="text-center text-sm text-gray-500 line-clamp-3">
            {productDesc}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-center gap-2">
          <span
            className="text-xl font-bold"
            style={{ color: upsell.product_price_color }}
          >
            {formatPrice(finalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(productPrice)}
            </span>
          )}
        </div>

        {/* Variant selector placeholder */}
        {!upsell.hide_variant_selector && product.variants?.length > 0 && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Variante</label>
            <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
              {product.variants.map((v, i) => (
                <option key={i}>{v.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Quantity selector */}
        {upsell.show_quantity_selector && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center font-semibold">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50"
            >
              <Plus size={14} />
            </button>
          </div>
        )}

        {/* Countdown */}
        {hasCountdown && (
          <div className="text-center">
            {upsell.countdown_label && (
              <p className="mb-1 text-xs font-medium text-gray-500">
                {upsell.countdown_label}
              </p>
            )}
            <div className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5">
              <Clock size={14} className="text-red-500" />
              <span className="font-mono text-sm font-bold text-red-600">
                {String(upsell.countdown_hours).padStart(2, "0")}:
                {String(upsell.countdown_minutes).padStart(2, "0")}:
                {String(upsell.countdown_seconds).padStart(2, "0")}
              </span>
            </div>
          </div>
        )}

        {/* Add button */}
        <button
          className={`w-full py-3 font-semibold transition-all ${addBtnAnimation}`}
          style={addBtnStyle}
        >
          {upsell.add_button_icon === "cart" && (
            <ShoppingCart size={16} className="mr-2 inline" />
          )}
          {upsell.add_button_text}
        </button>

        {/* Decline button */}
        <button className="w-full py-2.5 font-medium transition-all" style={decBtnStyle}>
          {upsell.decline_button_text}
        </button>
      </div>
    </div>
  );
}
