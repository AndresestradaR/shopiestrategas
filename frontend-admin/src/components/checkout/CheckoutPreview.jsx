import { useEffect } from 'react';

const GOOGLE_FONT_MAP = {
  'Inter, sans-serif': 'Inter',
  'Poppins, sans-serif': 'Poppins',
  'Montserrat, sans-serif': 'Montserrat',
  'Roboto, sans-serif': 'Roboto',
  'Open Sans, sans-serif': 'Open+Sans',
  'Lato, sans-serif': 'Lato',
};

const SHADOW_CSS = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

const ANIM_KEYFRAMES = `
@keyframes ck-shake { 0%,100%{transform:translateX(0)} 10%,30%,50%,70%,90%{transform:translateX(-4px)} 20%,40%,60%,80%{transform:translateX(4px)} }
@keyframes ck-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
@keyframes ck-shine { 0%{background-position:-200%} 100%{background-position:200%} }
@keyframes ck-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
.ck-anim-shake { animation: ck-shake 2s ease-in-out infinite; }
.ck-anim-pulse { animation: ck-pulse 2s ease-in-out infinite; }
.ck-anim-shine { background-image:linear-gradient(90deg,transparent 40%,rgba(255,255,255,0.3) 50%,transparent 60%); background-size:200%; animation:ck-shine 3s linear infinite; }
.ck-anim-bounce { animation: ck-bounce 1.5s ease-in-out infinite; }
`;

const ICON_MAP = {
  user: (
    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  phone: (
    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  ),
  'map-pin': (
    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
  mail: (
    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  ),
  note: (
    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  hash: (
    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-6.3-19.5-3.9 19.5" />
    </svg>
  ),
  calendar: (
    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  ),
  building: (
    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  ),
  'id-card': (
    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 9.375a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.794 15.711a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
    </svg>
  ),
  globe: (
    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.919 17.919 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
};

function PreviewField({ block, inputStyle }) {
  const icon = ICON_MAP[block.icon] || ICON_MAP.note;
  const showIcon = block.show_icon !== false;
  const style = inputStyle || 'outline';

  const fieldClasses = {
    outline: 'rounded-lg border border-gray-200 bg-white',
    filled: 'rounded-lg border-0 bg-gray-100',
    underline: 'rounded-none border-0 border-b-2 border-gray-200 bg-transparent',
  };

  const iconClasses = {
    outline: 'rounded-l-lg bg-gray-100',
    filled: 'rounded-l-lg bg-gray-200',
    underline: 'bg-transparent',
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-gray-600">
        {block.label}
        {block.required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      <div className="relative flex items-center">
        {showIcon && (
          <span className={`pointer-events-none absolute left-0 flex h-10 w-10 items-center justify-center ${iconClasses[style]}`}>
            {icon}
          </span>
        )}
        <div className={`h-10 w-full ${showIcon ? 'pl-11' : 'pl-3'} text-sm leading-10 text-gray-400 ${fieldClasses[style]}`}>
          {block.placeholder}
        </div>
      </div>
    </div>
  );
}

function PreviewBlock({ block, config }) {
  switch (block.type) {
    case 'product_card':
      if (!config.show_product_image) return null;
      return (
        <div className="flex gap-3 rounded-lg bg-white p-4 shadow-sm">
          {config._productImage ? (
            <img src={config._productImage} alt="" className="h-16 w-16 flex-shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-gray-200" />
          )}
          <div className="flex-1">
            {config._productName ? (
              <>
                <p className="text-sm font-bold text-gray-800 leading-tight">{config._productName}</p>
                <p className="mt-1 text-sm font-bold text-emerald-600">
                  ${Math.round(config._productPrice || PREVIEW_PRICE).toLocaleString('es-CO')}
                </p>
              </>
            ) : (
              <>
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                <div className="mt-2 h-4 w-1/3 rounded bg-emerald-100" />
              </>
            )}
          </div>
        </div>
      );

    case 'variants':
      return (
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="mb-2 h-3 w-1/2 rounded bg-gray-200" />
          <div className="flex gap-2">
            {['S', 'M', 'L'].map((s, i) => (
              <div key={s} className={`rounded-lg border-2 px-4 py-1.5 text-sm font-medium ${i === 0 ? 'border-emerald-400 bg-emerald-50 text-emerald-600' : 'border-gray-200 text-gray-500'}`}>
                {s}
              </div>
            ))}
          </div>
        </div>
      );

    case 'price_summary': {
      if (!config.show_price_summary) return null;
      const displayPrice = config._productPrice ?? PREVIEW_PRICE;
      const formatted = `$${Math.round(displayPrice).toLocaleString('es-CO')}`;
      return (
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span><span>{formatted}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Envio</span><span className="text-green-600 font-medium">Gratis</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-gray-800">
              <span>Total</span><span className="text-emerald-600">{formatted}</span>
            </div>
          </div>
        </div>
      );
    }

    case 'field':
      return <PreviewField block={block} inputStyle={config.form_input_style} />;

    case 'custom_text':
      return (
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500" style={{ textAlign: block.align || 'left', fontWeight: block.bold ? 'bold' : 'normal' }}>
            {block.text || 'Texto personalizado'}
          </p>
        </div>
      );

    case 'image':
      return (
        <div className="rounded-lg bg-white p-4 shadow-sm">
          {block.image_url ? (
            <img src={block.image_url} alt={block.alt || ''} className="mx-auto max-h-24 rounded" />
          ) : (
            <div className="mx-auto h-20 w-full rounded bg-gray-200 flex items-center justify-center text-sm text-gray-400">Imagen</div>
          )}
        </div>
      );

    case 'divider':
      return <hr className="border-gray-200 my-1.5" />;

    case 'spacer':
      return <div style={{ height: `${Math.min(block.height || 16, 32)}px` }} />;

    case 'trust_badge':
      if (!config.show_trust_badges) return null;
      return (
        <div className="flex items-center justify-center gap-4 py-1.5 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            Pago seguro
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5 0h7.5m-7.5 0-1-3m8.5 3h2.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-1.5m-16.5 0H1.5m16.5 0 1-3" />
            </svg>
            Envio gratis
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
            </svg>
            Contraentrega
          </div>
        </div>
      );

    // Backward compat: don't render removed block types
    case 'offers':
      return null;
    case 'shipping_info':
    case 'payment_method':
      return null;

    case 'submit_button': {
      if (config.cta_sticky) return null;
      const animation = config.cta_animation || 'none';
      const animClass = animation !== 'none' ? `ck-anim-${animation}` : '';
      const btnPrice = config._productPrice || PREVIEW_PRICE;
      return (
        <div className={animClass}>
          <button
            type="button"
            style={{
              backgroundColor: config.cta_bg_color,
              color: config.cta_text_color,
              fontSize: `${Math.max(config.cta_font_size * 0.85, 12)}px`,
              fontFamily: config.cta_font_family || 'Inter, sans-serif',
              borderRadius: `${config.cta_border_radius}px`,
              borderWidth: `${config.cta_border_width}px`,
              borderColor: config.cta_border_color,
              borderStyle: config.cta_border_width > 0 ? 'solid' : 'none',
              boxShadow: SHADOW_CSS[config.cta_shadow] || SHADOW_CSS.lg,
            }}
            className="w-full py-3 font-bold"
          >
            <span className="flex flex-col items-center">
              <span>{(config.cta_text || 'Completar pedido').replace('{order_total}', `$${Math.round(btnPrice).toLocaleString('es-CO')}`)}</span>
              {config.cta_subtitle && (
                <span className="mt-0.5 font-normal opacity-90" style={{ fontSize: `${Math.max((config.cta_subtitle_font_size || 12) * 0.85, 10)}px` }}>
                  {config.cta_subtitle}
                </span>
              )}
            </span>
          </button>
        </div>
      );
    }

    default:
      return null;
  }
}

const PREVIEW_PRICE = 89900;

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

function QuantityOfferPreview({ offer, tiers, basePrice: basePriceProp, productImage }) {
  const price = basePriceProp || PREVIEW_PRICE;
  const sortedTiers = [...tiers].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const preselectedIdx = sortedTiers.findIndex((t) => t.is_preselected);
  const selectedIdx = preselectedIdx >= 0 ? preselectedIdx : 0;
  const showImage = !offer.hide_product_image && !!productImage;

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      {/* Header */}
      <div
        className="mb-3 rounded-lg px-3 py-2 text-center text-sm font-bold"
        style={{ backgroundColor: offer.header_bg_color, color: offer.header_text_color }}
      >
        {offer.header_text || 'Selecciona la cantidad'}
      </div>
      {/* Tier cards */}
      <div className="space-y-2.5">
        {sortedTiers.map((tier, idx) => {
          const isSelected = idx === selectedIdx;
          const discounted = calcDiscountedPrice(price, tier);
          const total = discounted * tier.quantity;
          const originalTotal = price * tier.quantity;
          const savings = originalTotal - total;
          const hasDiscount = savings > 0;
          const tierImage = tier.image_url || (showImage ? productImage : null);

          return (
            <div
              key={idx}
              className="relative flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all"
              style={{
                backgroundColor: offer.bg_color || '#FFFFFF',
                borderColor: isSelected
                  ? offer.selected_border_color || '#059669'
                  : offer.border_color || '#E5E7EB',
                boxShadow: isSelected ? `0 0 0 1px ${offer.selected_border_color || '#059669'}` : 'none',
              }}
            >
              {/* Top label badge */}
              {tier.label_text && (
                <span
                  className={`absolute -top-2.5 ${(tier.label_top_position === 'right') ? 'right-3' : 'left-3'} rounded-full px-2.5 py-0.5 text-[10px] font-bold`}
                  style={{ backgroundColor: tier.label_bg_color || '#F59E0B', color: tier.label_text_color || '#FFFFFF' }}
                >
                  {tier.label_text}
                </span>
              )}

              {/* Radio */}
              <div
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                style={{ borderColor: isSelected ? offer.selected_border_color || '#059669' : '#D1D5DB' }}
              >
                {isSelected && (
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: offer.selected_border_color || '#059669' }} />
                )}
              </div>

              {/* Product image */}
              {tierImage && (
                <img src={tierImage} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
              )}

              {/* Title + inner label + per unit */}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-gray-800 leading-tight block">
                  {tier.title || `${tier.quantity} ${tier.quantity === 1 ? 'unidad' : 'unidades'}`}
                </span>
                {tier.label_inner_text && (
                  <span
                    className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ backgroundColor: tier.label_inner_bg_color || '#6B7280', color: tier.label_inner_text_color || '#FFFFFF' }}
                  >
                    {tier.label_inner_text}
                  </span>
                )}
                {offer.show_per_unit && (
                  <div className="text-xs text-gray-400">
                    ${Math.round(discounted).toLocaleString('es-CO')} c/u
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="text-right shrink-0">
                {hasDiscount && !tier.hide_compare_price && (
                  <div className="text-xs text-gray-400 line-through">
                    ${Math.round(originalTotal).toLocaleString('es-CO')}
                  </div>
                )}
                <div className="text-lg font-bold" style={{ color: tier.price_color || '#059669' }}>
                  ${Math.round(total).toLocaleString('es-CO')}
                </div>
                {offer.show_savings && hasDiscount && (
                  <div className="text-[11px] font-semibold text-green-600">
                    Ahorras ${Math.round(savings).toLocaleString('es-CO')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CheckoutPreview({ config, quantityOffer = null, productImage = null, productName = null, productPrice = null }) {
  // Load Google Font dynamically for CTA
  useEffect(() => {
    const fontFamily = config.cta_font_family || 'Inter, sans-serif';
    const googleName = GOOGLE_FONT_MAP[fontFamily];
    if (!googleName) return;
    const id = `gfont-${googleName}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${googleName}:wght@400;600;700&display=swap`;
    document.head.appendChild(link);
  }, [config.cta_font_family]);

  // Load Google Font dynamically for form
  useEffect(() => {
    const family = config.form_font_family || 'Inter, sans-serif';
    const googleName = GOOGLE_FONT_MAP[family];
    if (!googleName) return;
    const linkId = `gfont-${googleName}`;
    if (document.getElementById(linkId)) return;
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${googleName}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }, [config.form_font_family]);

  // Merge product data into config for PreviewBlock access
  const cfgWithProduct = { ...config, _productImage: productImage, _productName: productName, _productPrice: productPrice };
  const basePrice = productPrice || PREVIEW_PRICE;

  const blocks = [...(config.form_blocks || [])].filter((b) => b.enabled).sort((a, b) => a.position - b.position);

  const animation = config.cta_animation || 'none';
  const stickyAnimClass = animation !== 'none' ? `ck-anim-${animation}` : '';

  // Group consecutive fields + insert quantity offer BEFORE price_summary
  const groups = [];
  let fieldGroup = [];
  let offerInserted = false;
  const hasOffer = quantityOffer && quantityOffer.tiers?.length > 0;

  for (const block of blocks) {
    if (block.type === 'field') {
      // Before the first field, insert offer if not yet inserted
      if (!offerInserted && hasOffer && fieldGroup.length === 0) {
        groups.push({ type: '_quantity_offer' });
        offerInserted = true;
      }
      fieldGroup.push(block);
    } else {
      // Flush field group
      if (fieldGroup.length > 0) {
        groups.push({ type: '_field_group', fields: fieldGroup });
        fieldGroup = [];
      }

      // Insert offer BEFORE price_summary
      if (block.type === 'price_summary' && !offerInserted && hasOffer) {
        groups.push({ type: '_quantity_offer' });
        offerInserted = true;
      }

      // Skip old 'offers' block type
      if (block.type === 'offers') continue;

      // Hide product_card and variants when quantity offer is active
      if (block.type === 'product_card' && hasOffer) continue;
      if (block.type === 'variants' && hasOffer) continue;

      groups.push(block);
    }
  }

  // Flush remaining fields
  if (fieldGroup.length > 0) {
    if (!offerInserted && hasOffer) {
      groups.push({ type: '_quantity_offer' });
      offerInserted = true;
    }
    groups.push({ type: '_field_group', fields: fieldGroup });
  }

  // Last resort: insert after variants
  if (!offerInserted && hasOffer) {
    const insertAfter = groups.findIndex((g) => g.type === 'variants');
    if (insertAfter >= 0) {
      groups.splice(insertAfter + 1, 0, { type: '_quantity_offer' });
    } else {
      groups.push({ type: '_quantity_offer' });
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <style>{ANIM_KEYFRAMES}</style>
      <h3 className="mb-3 text-base font-semibold text-gray-900">Vista previa</h3>
      {/* Preview panel */}
      <div className="mx-auto w-[440px] overflow-hidden rounded-2xl border-2 border-gray-300 bg-gray-50 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-xs font-bold text-white">T</div>
            <span className="text-sm font-bold text-gray-800">Mi Tienda</span>
          </div>
          <span className="text-xs text-gray-400">Compra segura</span>
        </div>
        {/* Content */}
        <div className="h-[640px] overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'thin', fontFamily: config.form_font_family || 'Inter, sans-serif' }}>
          <div className="space-y-3">
            {groups.map((item, idx) => {
              if (item.type === '_quantity_offer') {
                return (
                  <QuantityOfferPreview
                    key="qty-offer"
                    offer={quantityOffer}
                    tiers={quantityOffer.tiers}
                    basePrice={basePrice}
                    productImage={productImage}
                  />
                );
              }
              if (item.type === '_field_group') {
                return (
                  <div
                    key={`fg-${idx}`}
                    className="rounded-lg p-4 shadow-sm"
                    style={{
                      backgroundColor: config.form_bg_color,
                      borderRadius: `${config.form_border_radius}px`,
                      borderWidth: `${config.form_border_width}px`,
                      borderColor: config.form_border_color,
                      borderStyle: config.form_border_width > 0 ? 'solid' : 'none',
                      fontFamily: config.form_font_family || 'Inter, sans-serif',
                    }}
                  >
                    <p className="mb-3 text-sm font-bold" style={{ color: config.form_text_color }}>
                      {config.form_title || 'Datos de envio'}
                    </p>
                    <div className="space-y-3">
                      {item.fields.map((f, fi) => (
                        <PreviewBlock key={`pf-${fi}`} block={f} config={cfgWithProduct} />
                      ))}
                    </div>
                  </div>
                );
              }
              return <PreviewBlock key={`pb-${idx}`} block={item} config={cfgWithProduct} />;
            })}
          </div>
        </div>
        {/* Sticky CTA */}
        {config.cta_sticky && (
          <div className="border-t border-gray-200 bg-white px-4 pb-4 pt-3">
            <div className={stickyAnimClass}>
              <button
                type="button"
                style={{
                  backgroundColor: config.cta_bg_color,
                  color: config.cta_text_color,
                  fontSize: `${Math.max(config.cta_font_size * 0.85, 12)}px`,
                  fontFamily: config.cta_font_family || 'Inter, sans-serif',
                  borderRadius: `${config.cta_border_radius}px`,
                  borderWidth: `${config.cta_border_width}px`,
                  borderColor: config.cta_border_color,
                  borderStyle: config.cta_border_width > 0 ? 'solid' : 'none',
                  boxShadow: SHADOW_CSS[config.cta_shadow] || SHADOW_CSS.lg,
                }}
                className="w-full py-3 font-bold"
              >
                <span className="flex flex-col items-center">
                  <span>{(config.cta_text || 'Completar pedido').replace('{order_total}', `$${Math.round(basePrice).toLocaleString('es-CO')}`)}</span>
                  {config.cta_subtitle && (
                    <span className="mt-0.5 font-normal opacity-90" style={{ fontSize: `${Math.max((config.cta_subtitle_font_size || 12) * 0.85, 10)}px` }}>
                      {config.cta_subtitle}
                    </span>
                  )}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
