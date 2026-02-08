import { useState, useEffect, useCallback } from 'react';

const getImageUrl = (imgUrl) => {
  if (!imgUrl) return '';
  if (imgUrl.startsWith('http')) return imgUrl;
  const apiBase = import.meta.env.VITE_API_URL || '';
  if (apiBase) return `${apiBase}${imgUrl}`;
  return imgUrl.replace(/^\/uploads/, '/api/uploads');
};

const ANIMATIONS = {
  none: '',
  pulse: 'animate-pulse',
  shake: 'animate-[shake_0.5s_ease-in-out_infinite]',
  bounce: 'animate-bounce',
  glow: 'animate-[glow_1.5s_ease-in-out_infinite]',
  wiggle: 'animate-[wiggle_1s_ease-in-out_infinite]',
};

/* Inline SVG icons to avoid lucide-react dependency */
const IconX = ({ size = 16, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);
const IconClock = ({ size = 14, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconCart = ({ size = 16, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);
const IconGift = ({ size = 16, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
  </svg>
);
const IconStar = ({ size = 16, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconFire = ({ size = 16, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);
const IconTag = ({ size = 16, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
  </svg>
);
const IconHeart = ({ size = 16, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);
const IconCheck = ({ size = 16, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const IconZap = ({ size = 16, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  </svg>
);
const BUTTON_ICONS = { cart: IconCart, gift: IconGift, star: IconStar, fire: IconFire, tag: IconTag, heart: IconHeart, check: IconCheck, zap: IconZap };
const IconMinus = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
);
const IconPlus = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);

function CountdownTimer({ hours, minutes, seconds, label }) {
  const totalSecs = hours * 3600 + minutes * 60 + seconds;
  const [remaining, setRemaining] = useState(totalSecs);

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(interval);
  }, [remaining]);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;

  if (totalSecs <= 0) return null;

  return (
    <div className="text-center">
      {label && <p className="mb-1 text-xs font-medium text-gray-500">{label}</p>}
      <div className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5">
        <IconClock size={14} className="text-red-500" />
        <span className="font-mono text-sm font-bold text-red-600">
          {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

function UpsellCard({ upsell, product, onAccept, onDecline, customerName, formatPriceFn, currency, country }) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (product.variants?.length > 0 && !selectedVariant) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product, selectedVariant]);

  const productName = upsell.product_title_override || product.name;
  const productDesc = upsell.product_description_override || product.description || '';
  const basePrice = selectedVariant?.price_override || product.price || 0;

  let finalPrice = basePrice;
  if (upsell.discount_type === 'percentage' && upsell.discount_value > 0) {
    finalPrice = basePrice * (1 - upsell.discount_value / 100);
  } else if (upsell.discount_type === 'fixed' && upsell.discount_value > 0) {
    finalPrice = Math.max(0, basePrice - upsell.discount_value);
  }
  const hasDiscount = finalPrice < basePrice;

  const replaceVars = (text) =>
    (text || '')
      .replace(/\{product_name\}/g, product.name)
      .replace(/\{first_name\}/g, customerName || 'Cliente');

  const title = replaceVars(upsell.title);
  const subtitle = replaceVars(upsell.subtitle);

  const addBtnStyle = {
    backgroundColor: upsell.add_button_bg_color,
    color: upsell.add_button_text_color,
    fontSize: `${upsell.add_button_font_size}px`,
    borderRadius: `${upsell.add_button_border_radius}px`,
    borderWidth: `${upsell.add_button_border_width}px`,
    borderColor: upsell.add_button_border_color,
    borderStyle: upsell.add_button_border_width > 0 ? 'solid' : 'none',
    boxShadow:
      upsell.add_button_shadow > 0
        ? `0 ${Math.round(upsell.add_button_shadow * 10)}px ${Math.round(upsell.add_button_shadow * 20)}px rgba(0,0,0,${upsell.add_button_shadow * 0.3})`
        : 'none',
  };

  const decBtnStyle = {
    backgroundColor: upsell.decline_button_bg_color,
    color: upsell.decline_button_text_color,
    fontSize: `${upsell.decline_button_font_size}px`,
    borderRadius: `${upsell.decline_button_border_radius}px`,
    borderWidth: `${upsell.decline_button_border_width}px`,
    borderColor: upsell.decline_button_border_color,
    borderStyle: upsell.decline_button_border_width > 0 ? 'solid' : 'none',
    boxShadow:
      upsell.decline_button_shadow > 0
        ? `0 ${Math.round(upsell.decline_button_shadow * 10)}px ${Math.round(upsell.decline_button_shadow * 20)}px rgba(0,0,0,${upsell.decline_button_shadow * 0.3})`
        : 'none',
  };

  const hasCountdown =
    upsell.countdown_hours > 0 || upsell.countdown_minutes > 0 || upsell.countdown_seconds > 0;

  const handleAccept = () => {
    onAccept({
      product_id: product.id,
      variant_id: selectedVariant?.id || null,
      quantity: qty,
      upsell_id: upsell.id,
      unit_price: finalPrice,
      product_name: productName,
    });
  };

  return (
    <div className="animate-[fadeSlideUp_0.3s_ease-out] mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
      {/* Header */}
      <div className="relative px-5 py-4">
        {!upsell.hide_close_icon && (
          <button
            onClick={onDecline}
            className="absolute right-3 top-3 rounded-full bg-gray-100 p-1.5 transition-colors hover:bg-gray-200"
          >
            <IconX size={16} className="text-gray-500" />
          </button>
        )}
        {title && (
          <h3 className="pr-8 text-center text-lg font-bold leading-snug" style={{ color: upsell.title_color }}>
            {title}
          </h3>
        )}
        {subtitle && <p className="mt-1 text-center text-sm text-gray-500">{subtitle}</p>}
      </div>

      <div className="space-y-4 px-5 pb-5">
        {/* Product image */}
        {product.image_url && (
          <div className="mx-auto h-44 w-44 overflow-hidden rounded-xl bg-gray-50">
            <img
              src={getImageUrl(product.image_url)}
              alt={productName}
              className="h-full w-full object-contain"
            />
          </div>
        )}

        <h4 className="text-center text-base font-semibold text-gray-800">{productName}</h4>

        {productDesc && <p className="text-center text-sm text-gray-500 line-clamp-3">{productDesc}</p>}

        {/* Price */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl font-bold" style={{ color: upsell.product_price_color }}>
            {formatPriceFn(finalPrice * qty, currency, country)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {formatPriceFn(basePrice * qty, currency, country)}
            </span>
          )}
        </div>

        {/* Variants */}
        {!upsell.hide_variant_selector && product.variants?.length > 0 && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Variante</label>
            <select
              value={selectedVariant?.id || ''}
              onChange={(e) => {
                const v = product.variants.find((vr) => String(vr.id) === e.target.value);
                setSelectedVariant(v || null);
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              {product.variants.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Quantity */}
        {upsell.show_quantity_selector && (
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="rounded-lg border border-gray-200 p-1.5">
              <IconMinus size={14} />
            </button>
            <span className="w-8 text-center font-semibold">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="rounded-lg border border-gray-200 p-1.5">
              <IconPlus size={14} />
            </button>
          </div>
        )}

        {/* Countdown */}
        {hasCountdown && (
          <CountdownTimer
            hours={upsell.countdown_hours}
            minutes={upsell.countdown_minutes}
            seconds={upsell.countdown_seconds}
            label={upsell.countdown_label}
          />
        )}

        {/* Add button */}
        <button
          onClick={handleAccept}
          className={`w-full py-3 font-semibold transition-all ${ANIMATIONS[upsell.add_button_animation] || ''}`}
          style={addBtnStyle}
        >
          {upsell.add_button_icon && BUTTON_ICONS[upsell.add_button_icon] && (() => {
            const BtnIcon = BUTTON_ICONS[upsell.add_button_icon];
            return <BtnIcon size={16} className="mr-2 inline" />;
          })()}
          {upsell.add_button_text}
        </button>

        {/* Decline button */}
        <button onClick={onDecline} className="w-full py-2.5 font-medium transition-all" style={decBtnStyle}>
          {upsell.decline_button_text}
        </button>
      </div>
    </div>
  );
}

/**
 * UpsellPopup — manages showing upsells one by one.
 */
export default function UpsellPopup({
  upsells = [],
  upsellConfig,
  customerName,
  slug,
  orderId,
  formatPriceFn,
  currency,
  country,
  onComplete,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [acceptedItems, setAcceptedItems] = useState([]);
  const API_BASE = import.meta.env.VITE_API_URL || '';

  const finish = useCallback(
    (items) => onComplete(items),
    [onComplete]
  );

  const moveNext = useCallback(
    (items) => {
      const nextIdx = currentIndex + 1;
      if (nextIdx >= upsells.length) {
        finish(items);
      } else {
        setCurrentIndex(nextIdx);
      }
    },
    [currentIndex, upsells.length, finish]
  );

  // Register impression for current upsell
  useEffect(() => {
    const u = upsells[currentIndex];
    if (u && slug) {
      fetch(`${API_BASE}/api/store/${slug}/upsells/${u.id}/impression`, { method: 'POST' }).catch(() => {});
    }
  }, [currentIndex, upsells, slug, API_BASE]);

  if (upsells.length === 0 || currentIndex >= upsells.length) return null;

  const current = upsells[currentIndex];
  const product = current.upsell_product;
  if (!product) {
    // Skip this upsell if no product
    setTimeout(() => moveNext(acceptedItems), 0);
    return null;
  }

  const isPostPurchase = upsellConfig?.upsell_type === 'post_purchase';

  const handleAccept = async (itemData) => {
    const newItems = [...acceptedItems, itemData];
    setAcceptedItems(newItems);

    // For post-purchase, immediately add item to the existing order
    if (isPostPurchase && orderId) {
      try {
        await fetch(`${API_BASE}/api/store/${slug}/order/${orderId}/upsell-item`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: itemData.product_id,
            variant_id: itemData.variant_id,
            quantity: itemData.quantity,
            upsell_id: itemData.upsell_id,
          }),
        });
      } catch {
        // Silently continue
      }
    }

    moveNext(newItems);
  };

  const handleDecline = () => {
    moveNext(acceptedItems);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(255,255,255,0.3); }
          50% { box-shadow: 0 0 20px rgba(255,255,255,0.6), 0 0 40px rgba(255,255,255,0.2); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-2deg); }
          75% { transform: rotate(2deg); }
        }
      `}</style>
      <UpsellCard
        upsell={current}
        product={product}
        onAccept={handleAccept}
        onDecline={handleDecline}
        customerName={customerName}
        formatPriceFn={formatPriceFn}
        currency={currency}
        country={country}
      />
    </div>
  );
}
