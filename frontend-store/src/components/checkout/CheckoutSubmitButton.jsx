import { useEffect } from 'react';
import './animations.css';

const GOOGLE_FONT_MAP = {
  'Inter, sans-serif': 'Inter',
  'Poppins, sans-serif': 'Poppins',
  'Montserrat, sans-serif': 'Montserrat',
  'Roboto, sans-serif': 'Roboto',
  'Open Sans, sans-serif': 'Open+Sans',
  'Lato, sans-serif': 'Lato',
};

const SHADOW_MAP = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

export default function CheckoutSubmitButton({ cfg, totalPriceFormatted, submitting, onSubmit }) {
  const text = (cfg.cta_text || 'Completar pedido - {order_total}')
    .replace('{order_total}', totalPriceFormatted);

  const animation = cfg.cta_animation || 'none';
  const animClass = animation !== 'none' ? `ck-anim-${animation}` : '';

  // Load Google Font dynamically
  useEffect(() => {
    const fontFamily = cfg.cta_font_family || 'Inter, sans-serif';
    const googleName = GOOGLE_FONT_MAP[fontFamily];
    if (!googleName) return;
    const id = `gfont-${googleName}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${googleName}:wght@400;600;700&display=swap`;
    document.head.appendChild(link);
  }, [cfg.cta_font_family]);

  return (
    <div className={animClass}>
      <button
        type="button"
        disabled={submitting}
        onClick={onSubmit}
        style={{
          backgroundColor: cfg.cta_bg_color,
          color: cfg.cta_text_color,
          fontSize: `${cfg.cta_font_size}px`,
          fontFamily: cfg.cta_font_family || 'Inter, sans-serif',
          borderRadius: `${cfg.cta_border_radius}px`,
          borderWidth: `${cfg.cta_border_width}px`,
          borderColor: cfg.cta_border_color,
          borderStyle: cfg.cta_border_width > 0 ? 'solid' : 'none',
          boxShadow: SHADOW_MAP[cfg.cta_shadow] || SHADOW_MAP.lg,
        }}
        className="w-full py-4 font-bold transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
          <span className="flex flex-col items-center">
            <span>{text}</span>
            {cfg.cta_subtitle && (
              <span
                className="mt-0.5 font-normal opacity-90"
                style={{ fontSize: `${cfg.cta_subtitle_font_size || 12}px` }}
              >
                {cfg.cta_subtitle}
              </span>
            )}
          </span>
        )}
      </button>
    </div>
  );
}
