import { CheckSquare, Square } from "lucide-react";

export default function UpsellTickPreview({ tick, currencySymbol = "$" }) {
  const formatPrice = (v) => `${currencySymbol}${Number(v).toLocaleString("es-CO")}`;

  // Replace {title} and {price} in checkbox_text
  const renderCheckboxText = () => {
    const text = tick.checkbox_text || "";
    const parts = text.split(/(\{title\}|\{price\})/g);
    return parts.map((part, i) => {
      if (part === "{title}") return <strong key={i}>{tick.upsell_title || "Nombre Oferta"}</strong>;
      if (part === "{price}") return <strong key={i}>{formatPrice(tick.upsell_price || 0)}</strong>;
      return part;
    });
  };

  const boxStyle = {
    backgroundColor: tick.bg_color || "rgba(217,235,246,1)",
    border: `${tick.border_width || 1}px ${tick.border_style || "solid"} ${tick.border_color || "rgba(0,116,191,1)"}`,
    borderRadius: `${tick.border_radius || 8}px`,
  };

  return (
    <div className="space-y-3">
      <p className="text-center text-xs font-medium text-gray-500">Vista previa del checkout</p>

      {/* Fake checkout form */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        {/* Fake fields */}
        <div>
          <div className="mb-1 h-3 w-16 rounded bg-gray-200" />
          <div className="h-9 rounded-lg border border-gray-200 bg-gray-50" />
        </div>
        <div>
          <div className="mb-1 h-3 w-20 rounded bg-gray-200" />
          <div className="h-9 rounded-lg border border-gray-200 bg-gray-50" />
        </div>
        <div>
          <div className="mb-1 h-3 w-14 rounded bg-gray-200" />
          <div className="h-9 rounded-lg border border-gray-200 bg-gray-50" />
        </div>

        {/* Upsell tick box */}
        <div style={boxStyle} className="p-3">
          <div className="flex items-start gap-2.5">
            {tick.image_url && (
              <img
                src={tick.image_url}
                alt=""
                className="h-10 w-10 flex-shrink-0 rounded-md object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <label className="flex items-start gap-2 cursor-pointer">
                {tick.preselected ? (
                  <CheckSquare size={18} className="mt-0.5 flex-shrink-0 text-blue-600" />
                ) : (
                  <Square size={18} className="mt-0.5 flex-shrink-0 text-gray-400" />
                )}
                <span className="text-sm leading-snug" style={{ color: tick.text_color }}>
                  {renderCheckboxText()}
                </span>
              </label>
              {tick.description_text && (
                <p
                  className="mt-1 ml-[26px] text-xs leading-relaxed"
                  style={{ color: tick.description_color }}
                >
                  {tick.description_text}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Fake submit button */}
        <div className="h-11 rounded-lg bg-gray-800 flex items-center justify-center">
          <span className="text-xs font-semibold text-white">Confirmar pedido</span>
        </div>
      </div>
    </div>
  );
}
