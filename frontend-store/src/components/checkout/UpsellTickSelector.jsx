import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

const getImageUrl = (imgUrl) => {
  if (!imgUrl) return null;
  if (imgUrl.startsWith('http')) return imgUrl;
  const apiBase = import.meta.env.VITE_API_URL || '';
  if (apiBase) return `${apiBase}${imgUrl}`;
  return imgUrl.replace(/^\/uploads/, '/api/uploads');
};

export default function UpsellTickSelector({
  slug,
  productId,
  currency,
  country,
  formatPriceFn,
  onTicksChange,
}) {
  const API_BASE = import.meta.env.VITE_API_URL || '';

  const { data: ticks = [] } = useQuery({
    queryKey: ['upsell-ticks', slug, productId],
    queryFn: async () => {
      if (!slug || !productId) return [];
      const res = await fetch(
        `${API_BASE}/api/store/${slug}/upsell-ticks/${productId}`
      );
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!slug && !!productId,
    staleTime: 5 * 60 * 1000,
  });

  const [selected, setSelected] = useState({});
  const initialized = useRef(false);

  // Initialize selected state from preselected when ticks load
  useEffect(() => {
    if (ticks.length > 0 && !initialized.current) {
      const initial = {};
      for (const tick of ticks) {
        initial[tick.id] = tick.preselected || false;
      }
      setSelected(initial);
      initialized.current = true;
    }
  }, [ticks]);

  // Notify parent when selection changes
  useEffect(() => {
    if (ticks.length === 0) return;
    const items = ticks
      .filter((t) => selected[t.id])
      .map((t) => ({
        is_upsell_tick: true,
        upsell_tick_id: t.id,
        tick_name: t.upsell_title,
        tick_price: t.upsell_price,
        product_id: t.linked_product?.id || null,
        quantity: 1,
      }));
    onTicksChange?.(items);
  }, [selected, ticks, onTicksChange]);

  if (ticks.length === 0) return null;

  const toggle = (tickId) => {
    setSelected((prev) => ({ ...prev, [tickId]: !prev[tickId] }));
  };

  const renderCheckboxText = (tick) => {
    const text = tick.checkbox_text || '';
    const parts = text.split(/(\{title\}|\{price\})/g);
    return parts.map((part, i) => {
      if (part === '{title}')
        return <strong key={i}>{tick.upsell_title}</strong>;
      if (part === '{price}')
        return (
          <strong key={i}>
            {formatPriceFn(tick.upsell_price, currency, country)}
          </strong>
        );
      return part;
    });
  };

  return (
    <div className="space-y-3">
      {ticks.map((tick) => {
        const isSelected = selected[tick.id] || false;
        const imgUrl = getImageUrl(tick.image_url);

        const boxStyle = {
          backgroundColor: tick.bg_color || 'rgba(217,235,246,1)',
          border: `${tick.border_width || 1}px ${tick.border_style || 'solid'} ${tick.border_color || 'rgba(0,116,191,1)'}`,
          borderRadius: `${tick.border_radius || 8}px`,
        };

        return (
          <div
            key={tick.id}
            style={boxStyle}
            className="p-3 cursor-pointer"
            onClick={() => toggle(tick.id)}
          >
            <div className="flex items-start gap-2.5">
              {imgUrl && (
                <img
                  src={imgUrl}
                  alt=""
                  className="h-10 w-10 flex-shrink-0 rounded-md object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(tick.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300"
                    style={{
                      accentColor:
                        tick.border_color || 'rgba(0,116,191,1)',
                    }}
                  />
                  <span
                    className="text-sm leading-snug"
                    style={{ color: tick.text_color }}
                  >
                    {renderCheckboxText(tick)}
                  </span>
                </label>
                {tick.description_text && (
                  <p
                    className="mt-1 ml-6 text-xs leading-relaxed"
                    style={{ color: tick.description_color }}
                  >
                    {tick.description_text}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
