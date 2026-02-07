import { useEffect } from 'react';
import ColorPicker from './ColorPicker';
import SliderControl from './SliderControl';

const GOOGLE_FONT_MAP = {
  'Inter, sans-serif': 'Inter',
  'Poppins, sans-serif': 'Poppins',
  'Montserrat, sans-serif': 'Montserrat',
  'Roboto, sans-serif': 'Roboto',
  'Open Sans, sans-serif': 'Open+Sans',
  'Lato, sans-serif': 'Lato',
};

const ANIMATIONS = [
  { value: 'none', label: 'Sin animacion' },
  { value: 'shake', label: 'Sacudir' },
  { value: 'pulse', label: 'Pulso' },
  { value: 'shine', label: 'Brillo' },
  { value: 'bounce', label: 'Rebote' },
];

const SHADOWS = [
  { value: 'none', label: 'Sin sombra' },
  { value: 'sm', label: 'Pequena' },
  { value: 'md', label: 'Mediana' },
  { value: 'lg', label: 'Grande' },
  { value: 'xl', label: 'Extra grande' },
];

const SHADOW_CSS = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

const FONTS = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'system-ui, sans-serif', label: 'Sistema' },
];

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

export default function CTAButtonEditor({ config, onChange }) {
  const update = (field, value) => onChange({ [field]: value });

  const animation = config.cta_animation || 'none';
  const animClass = animation !== 'none' ? `ck-anim-${animation}` : '';

  // BUG 1: Load Google Font dynamically
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

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <style>{ANIM_KEYFRAMES}</style>
      <h3 className="mb-4 text-base font-semibold text-gray-900">Boton de compra (CTA)</h3>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Texto del boton</label>
          <input
            type="text"
            value={config.cta_text || ''}
            onChange={(e) => update('cta_text', e.target.value)}
            placeholder="Completar pedido - {order_total}"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
          />
          <p className="mt-1 text-xs text-gray-400">Usa {'{order_total}'} para mostrar el precio</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Subtexto (dentro del boton)</label>
          <input
            type="text"
            value={config.cta_subtitle || ''}
            onChange={(e) => update('cta_subtitle', e.target.value || null)}
            placeholder="Envio gratis - Pagas al recibir"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
          />
          <p className="mt-1 text-xs text-gray-400">Se muestra debajo del texto principal dentro del boton</p>
        </div>

        <SliderControl label="Tamano subtexto" value={config.cta_subtitle_font_size || 12} onChange={(v) => update('cta_subtitle_font_size', v)} min={8} max={18} unit="px" />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tipografia</label>
          <select
            value={config.cta_font_family || 'Inter, sans-serif'}
            onChange={(e) => update('cta_font_family', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
          >
            {FONTS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ColorPicker label="Color de fondo" color={config.cta_bg_color} onChange={(v) => update('cta_bg_color', v)} />
          <ColorPicker label="Color de texto" color={config.cta_text_color} onChange={(v) => update('cta_text_color', v)} />
        </div>

        <SliderControl label="Tamano de fuente" value={config.cta_font_size || 18} onChange={(v) => update('cta_font_size', v)} min={12} max={28} unit="px" />
        <SliderControl label="Borde redondeado" value={config.cta_border_radius || 12} onChange={(v) => update('cta_border_radius', v)} min={0} max={30} unit="px" />
        <SliderControl label="Grosor del borde" value={config.cta_border_width || 0} onChange={(v) => update('cta_border_width', v)} min={0} max={5} unit="px" />

        {config.cta_border_width > 0 && (
          <ColorPicker label="Color del borde" color={config.cta_border_color} onChange={(v) => update('cta_border_color', v)} />
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Animacion</label>
          <select
            value={config.cta_animation || 'none'}
            onChange={(e) => update('cta_animation', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
          >
            {ANIMATIONS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Sombra</label>
          <select
            value={config.cta_shadow || 'lg'}
            onChange={(e) => update('cta_shadow', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
          >
            {SHADOWS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-medium text-gray-700">Boton fijo (sticky)</span>
              <p className="text-xs text-gray-400">El boton permanece visible al hacer scroll</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={config.cta_sticky}
              onClick={() => update('cta_sticky', !config.cta_sticky)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${config.cta_sticky ? 'bg-[#4DBEA4]' : 'bg-gray-200'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${config.cta_sticky ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </label>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-medium text-gray-700">Sticky solo en movil</span>
              <p className="text-xs text-gray-400">En escritorio el boton aparece dentro del formulario</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={config.cta_sticky_mobile}
              onClick={() => update('cta_sticky_mobile', !config.cta_sticky_mobile)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${config.cta_sticky_mobile ? 'bg-[#4DBEA4]' : 'bg-gray-200'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${config.cta_sticky_mobile ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </label>
        </div>

        {/* Live preview */}
        <div className="mt-4 overflow-visible rounded-lg bg-gray-50 p-6">
          <p className="mb-2 text-xs font-medium text-gray-500">Vista previa</p>
          <div className={animClass}>
            <button
              type="button"
              style={{
                backgroundColor: config.cta_bg_color,
                color: config.cta_text_color,
                fontSize: `${config.cta_font_size}px`,
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
                <span>{(config.cta_text || 'Completar pedido - {order_total}').replace('{order_total}', '$89,900')}</span>
                {config.cta_subtitle && (
                  <span className="mt-0.5 font-normal opacity-90" style={{ fontSize: `${config.cta_subtitle_font_size || 12}px` }}>
                    {config.cta_subtitle}
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
