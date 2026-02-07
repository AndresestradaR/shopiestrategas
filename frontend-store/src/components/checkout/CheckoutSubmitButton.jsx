export default function CheckoutSubmitButton({ cfg, totalPriceFormatted, submitting, onSubmit }) {
  const text = (cfg.cta_text || 'Completar pedido - {order_total}')
    .replace('{order_total}', totalPriceFormatted);

  const shadowMap = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  return (
    <button
      type="button"
      disabled={submitting}
      onClick={onSubmit}
      style={{
        backgroundColor: cfg.cta_bg_color,
        color: cfg.cta_text_color,
        fontSize: `${cfg.cta_font_size}px`,
        borderRadius: `${cfg.cta_border_radius}px`,
        borderWidth: `${cfg.cta_border_width}px`,
        borderColor: cfg.cta_border_color,
        borderStyle: cfg.cta_border_width > 0 ? 'solid' : 'none',
      }}
      className={`w-full py-4 font-bold transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${shadowMap[cfg.cta_shadow] || 'shadow-lg'}`}
    >
      {submitting ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Procesando...
        </span>
      ) : (
        text
      )}
    </button>
  );
}
