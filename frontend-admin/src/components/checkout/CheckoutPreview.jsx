const BLOCK_LABELS = {
  product_card: 'Imagen del producto',
  variants: 'Selector de variantes',
  price_summary: 'Resumen de precio',
  trust_badge: 'Sellos de confianza',
  submit_button: 'Boton de compra',
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
    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  phone: (
    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  ),
  'map-pin': (
    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
  mail: (
    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  ),
  note: (
    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
};

function PreviewField({ block }) {
  const icon = ICON_MAP[block.icon] || ICON_MAP.note;
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-gray-600">
        {block.label}
        {block.required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-0 flex h-8 w-8 items-center justify-center rounded-l bg-gray-100">
          {icon}
        </span>
        <div className="h-8 w-full rounded border border-gray-200 bg-white pl-9 text-xs leading-8 text-gray-400">
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
        <div className="flex gap-3 rounded-lg bg-white p-3 shadow-sm">
          <div className="h-14 w-14 flex-shrink-0 rounded-lg bg-gray-200" />
          <div className="flex-1">
            <div className="h-3 w-3/4 rounded bg-gray-200" />
            <div className="mt-1.5 h-2 w-1/2 rounded bg-gray-100" />
            <div className="mt-1.5 h-3 w-1/3 rounded bg-emerald-100" />
          </div>
        </div>
      );

    case 'variants':
      return (
        <div className="rounded-lg bg-white p-3 shadow-sm">
          <div className="mb-2 h-2 w-1/2 rounded bg-gray-200" />
          <div className="flex gap-1.5">
            {['S', 'M', 'L'].map((s, i) => (
              <div key={s} className={`rounded border-2 px-3 py-1 text-xs font-medium ${i === 0 ? 'border-emerald-400 bg-emerald-50 text-emerald-600' : 'border-gray-200 text-gray-500'}`}>
                {s}
              </div>
            ))}
          </div>
        </div>
      );

    case 'price_summary':
      if (!config.show_price_summary) return null;
      return (
        <div className="rounded-lg bg-white p-3 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Subtotal</span><span>$89,900</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Envio</span><span className="text-green-600 font-medium">Gratis</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-1.5 text-sm font-bold text-gray-800">
              <span>Total</span><span className="text-emerald-600">$89,900</span>
            </div>
          </div>
        </div>
      );

    case 'field':
      return <PreviewField block={block} />;

    case 'custom_text':
      return (
        <div className="rounded-lg bg-white p-3 shadow-sm">
          <p className="text-xs text-gray-500" style={{ textAlign: block.align || 'left', fontWeight: block.bold ? 'bold' : 'normal' }}>
            {block.text || 'Texto personalizado'}
          </p>
        </div>
      );

    case 'image':
      return (
        <div className="rounded-lg bg-white p-3 shadow-sm">
          {block.image_url ? (
            <img src={block.image_url} alt={block.alt || ''} className="mx-auto max-h-20 rounded" />
          ) : (
            <div className="mx-auto h-16 w-full rounded bg-gray-200 flex items-center justify-center text-xs text-gray-400">Imagen</div>
          )}
        </div>
      );

    case 'divider':
      return <hr className="border-gray-200 my-1" />;

    case 'spacer':
      return <div style={{ height: `${Math.min(block.height || 16, 24)}px` }} />;

    case 'trust_badge':
      if (!config.show_trust_badges) return null;
      return (
        <div className="flex items-center justify-center gap-3 py-1 text-[9px] text-gray-400">
          <div className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            Pago seguro
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5 0h7.5m-7.5 0-1-3m8.5 3h2.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-1.5m-16.5 0H1.5m16.5 0 1-3" />
            </svg>
            Envio gratis
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
            </svg>
            Contraentrega
          </div>
        </div>
      );

    // Backward compat: don't render removed block types
    case 'offers':
    case 'shipping_info':
    case 'payment_method':
      return null;

    case 'submit_button': {
      if (config.cta_sticky) return null;
      const animation = config.cta_animation || 'none';
      const animClass = animation !== 'none' ? `ck-anim-${animation}` : '';
      return (
        <div className={animClass}>
          <button
            type="button"
            style={{
              backgroundColor: config.cta_bg_color,
              color: config.cta_text_color,
              fontSize: `${Math.max(config.cta_font_size * 0.65, 10)}px`,
              fontFamily: config.cta_font_family || 'Inter, sans-serif',
              borderRadius: `${config.cta_border_radius}px`,
              borderWidth: `${config.cta_border_width}px`,
              borderColor: config.cta_border_color,
              borderStyle: config.cta_border_width > 0 ? 'solid' : 'none',
              boxShadow: SHADOW_CSS[config.cta_shadow] || SHADOW_CSS.lg,
            }}
            className="w-full py-2 font-bold"
          >
            <span className="flex flex-col items-center">
              <span>{(config.cta_text || 'Completar pedido').replace('{order_total}', '$89,900')}</span>
              {config.cta_subtitle && (
                <span className="mt-0.5 font-normal opacity-90" style={{ fontSize: `${Math.max((config.cta_subtitle_font_size || 12) * 0.65, 8)}px` }}>
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

export default function CheckoutPreview({ config }) {
  const blocks = [...(config.form_blocks || [])].filter((b) => b.enabled).sort((a, b) => a.position - b.position);

  const animation = config.cta_animation || 'none';
  const stickyAnimClass = animation !== 'none' ? `ck-anim-${animation}` : '';

  // Group consecutive fields
  const groups = [];
  let fieldGroup = [];
  for (const block of blocks) {
    if (block.type === 'field') {
      fieldGroup.push(block);
    } else {
      if (fieldGroup.length > 0) {
        groups.push({ type: '_field_group', fields: fieldGroup });
        fieldGroup = [];
      }
      groups.push(block);
    }
  }
  if (fieldGroup.length > 0) {
    groups.push({ type: '_field_group', fields: fieldGroup });
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <style>{ANIM_KEYFRAMES}</style>
      <h3 className="mb-3 text-base font-semibold text-gray-900">Vista previa</h3>
      {/* Phone frame */}
      <div className="mx-auto w-[375px] overflow-hidden rounded-[2rem] border-[3px] border-gray-800 bg-gray-50 shadow-xl">
        {/* Status bar */}
        <div className="flex items-center justify-between bg-white px-5 py-1.5">
          <span className="text-[10px] font-semibold text-gray-800">9:41</span>
          <div className="flex items-center gap-1">
            <div className="h-2 w-3 rounded-sm bg-gray-800" />
            <div className="h-2.5 w-2.5 rounded-full bg-gray-800" />
          </div>
        </div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500 text-[10px] font-bold text-white">T</div>
            <span className="text-xs font-bold text-gray-800">Mi Tienda</span>
          </div>
          <span className="text-[10px] text-gray-400">Compra segura</span>
        </div>
        {/* Content */}
        <div className="h-[580px] overflow-y-auto px-3 py-3" style={{ scrollbarWidth: 'thin' }}>
          <div className="space-y-2.5">
            {groups.map((item, idx) => {
              if (item.type === '_field_group') {
                return (
                  <div
                    key={`fg-${idx}`}
                    className="rounded-lg p-3 shadow-sm"
                    style={{
                      backgroundColor: config.form_bg_color,
                      borderRadius: `${config.form_border_radius}px`,
                      borderWidth: `${config.form_border_width}px`,
                      borderColor: config.form_border_color,
                      borderStyle: config.form_border_width > 0 ? 'solid' : 'none',
                    }}
                  >
                    <p className="mb-2 text-xs font-bold" style={{ color: config.form_text_color }}>
                      {config.form_title || 'Datos de envio'}
                    </p>
                    <div className="space-y-2">
                      {item.fields.map((f, fi) => (
                        <PreviewBlock key={`pf-${fi}`} block={f} config={config} />
                      ))}
                    </div>
                  </div>
                );
              }
              return <PreviewBlock key={`pb-${idx}`} block={item} config={config} />;
            })}
          </div>
        </div>
        {/* Sticky CTA */}
        {config.cta_sticky && (
          <div className="border-t border-gray-200 bg-white px-3 pb-3 pt-2">
            <div className={stickyAnimClass}>
              <button
                type="button"
                style={{
                  backgroundColor: config.cta_bg_color,
                  color: config.cta_text_color,
                  fontSize: `${Math.max(config.cta_font_size * 0.7, 10)}px`,
                  fontFamily: config.cta_font_family || 'Inter, sans-serif',
                  borderRadius: `${config.cta_border_radius}px`,
                  borderWidth: `${config.cta_border_width}px`,
                  borderColor: config.cta_border_color,
                  borderStyle: config.cta_border_width > 0 ? 'solid' : 'none',
                  boxShadow: SHADOW_CSS[config.cta_shadow] || SHADOW_CSS.lg,
                }}
                className="w-full py-2.5 font-bold"
              >
                <span className="flex flex-col items-center">
                  <span>{(config.cta_text || 'Completar pedido').replace('{order_total}', '$89,900')}</span>
                  {config.cta_subtitle && (
                    <span className="mt-0.5 font-normal opacity-90" style={{ fontSize: `${Math.max((config.cta_subtitle_font_size || 12) * 0.7, 8)}px` }}>
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
