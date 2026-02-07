import { useState, useEffect } from 'react';
import { formatPrice } from '../ProductCard';

export default function QuantityOfferSelector({
  offer,
  basePrice,
  currency = 'COP',
  country = 'CO',
  onSelect,
  getImageUrl,
}) {
  if (!offer || !offer.tiers || offer.tiers.length === 0) return null;

  const sortedTiers = [...offer.tiers].sort((a, b) => a.position - b.position);

  const [selectedIdx, setSelectedIdx] = useState(() => {
    const pre = sortedTiers.findIndex((t) => t.is_preselected);
    return pre >= 0 ? pre : 0;
  });

  useEffect(() => {
    const pre = sortedTiers.findIndex((t) => t.is_preselected);
    if (pre >= 0) setSelectedIdx(pre);
  }, [offer.id]);

  // Notify parent on mount and selection change
  useEffect(() => {
    const tier = sortedTiers[selectedIdx];
    if (!tier) return;
    const discounted = calcDiscountedPrice(basePrice, tier);
    onSelect({
      quantity: tier.quantity,
      unitPrice: discounted,
      totalPrice: discounted * tier.quantity,
      tierId: tier.id,
    });
  }, [selectedIdx, basePrice]);

  const handleSelect = (idx) => {
    setSelectedIdx(idx);
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div
        className="rounded-lg px-3 py-2 text-center text-sm font-bold"
        style={{ backgroundColor: offer.header_bg_color, color: offer.header_text_color }}
      >
        {offer.header_text || 'Selecciona la cantidad'}
      </div>

      {/* Tier cards */}
      <div className="space-y-2">
        {sortedTiers.map((tier, idx) => {
          const isSelected = idx === selectedIdx;
          const discounted = calcDiscountedPrice(basePrice, tier);
          const total = discounted * tier.quantity;
          const savings = (basePrice - discounted) * tier.quantity;

          return (
            <button
              key={tier.id || idx}
              type="button"
              onClick={() => handleSelect(idx)}
              className="relative flex w-full items-center justify-between rounded-xl border-2 p-3.5 text-left transition-all"
              style={{
                backgroundColor: offer.bg_color || '#FFFFFF',
                borderColor: isSelected
                  ? offer.selected_border_color || 'var(--color-primary)'
                  : offer.border_color || '#E5E7EB',
                boxShadow: isSelected ? `0 0 0 1px ${offer.selected_border_color || 'var(--color-primary)'}` : 'none',
              }}
            >
              {/* Top label badge */}
              {tier.label_text && (
                <span
                  className={`absolute -top-2.5 ${tier.label_top_position === 'right' ? 'right-3' : 'left-3'} rounded-full px-2.5 py-0.5 text-[10px] font-bold`}
                  style={{
                    backgroundColor: tier.label_bg_color || '#F59E0B',
                    color: tier.label_text_color || '#FFFFFF',
                  }}
                >
                  {tier.label_text}
                </span>
              )}

              <div className="flex items-center gap-3">
                {/* Radio indicator */}
                <div
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                  style={{
                    borderColor: isSelected
                      ? offer.selected_border_color || 'var(--color-primary)'
                      : '#D1D5DB',
                  }}
                >
                  {isSelected && (
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: offer.selected_border_color || 'var(--color-primary)' }}
                    />
                  )}
                </div>

                {/* Image */}
                {!offer.hide_product_image && tier.image_url && (
                  <img
                    src={getImageUrl ? getImageUrl(tier.image_url) : tier.image_url}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                )}

                {/* Title + inner label + per unit */}
                <div>
                  <span className="font-bold text-gray-800">
                    {tier.title || `${tier.quantity} ${tier.quantity === 1 ? 'unidad' : 'unidades'}`}
                  </span>
                  {tier.label_inner_text && (
                    <span
                      className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        backgroundColor: tier.label_inner_bg_color || '#6B7280',
                        color: tier.label_inner_text_color || '#FFFFFF',
                      }}
                    >
                      {tier.label_inner_text}
                    </span>
                  )}
                  {offer.show_per_unit && (
                    <div className="text-xs text-gray-400">
                      {formatPrice(discounted, currency, country)} c/u
                    </div>
                  )}
                </div>
              </div>

              {/* Price + savings */}
              <div className="text-right">
                <div
                  className="text-lg font-bold"
                  style={{ color: tier.price_color || '#059669' }}
                >
                  {formatPrice(total, currency, country)}
                </div>
                {offer.show_savings && savings > 0 && (
                  <div className="text-[11px] font-semibold text-green-600">
                    Ahorras {formatPrice(savings, currency, country)}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function calcDiscountedPrice(basePrice, tier) {
  const val = Number(tier.discount_value) || 0;
  if (val <= 0) return basePrice;
  if (tier.discount_type === 'percentage') {
    return basePrice * (1 - val / 100);
  }
  if (tier.discount_type === 'fixed') {
    return Math.max(0, basePrice - val);
  }
  return basePrice;
}
