import ColorPicker from './ColorPicker';
import SliderControl from './SliderControl';

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

export default function CTAButtonEditor({ config, onChange }) {
  const update = (field, value) => onChange({ [field]: value });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
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
          <label className="mb-1 block text-sm font-medium text-gray-700">Subtexto</label>
          <input
            type="text"
            value={config.cta_subtitle || ''}
            onChange={(e) => update('cta_subtitle', e.target.value || null)}
            placeholder="Envio gratis - Pagas al recibir"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
          />
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

        <label className="flex items-center gap-2 cursor-pointer">
          <button
            type="button"
            role="switch"
            aria-checked={config.cta_sticky}
            onClick={() => update('cta_sticky', !config.cta_sticky)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${config.cta_sticky ? 'bg-[#4DBEA4]' : 'bg-gray-200'}`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${config.cta_sticky ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className="text-sm text-gray-700">Boton fijo (sticky)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <button
            type="button"
            role="switch"
            aria-checked={config.cta_sticky_mobile}
            onClick={() => update('cta_sticky_mobile', !config.cta_sticky_mobile)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${config.cta_sticky_mobile ? 'bg-[#4DBEA4]' : 'bg-gray-200'}`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${config.cta_sticky_mobile ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className="text-sm text-gray-700">Sticky en movil</span>
        </label>

        {/* Live preview */}
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <p className="mb-2 text-xs font-medium text-gray-500">Vista previa</p>
          <button
            type="button"
            style={{
              backgroundColor: config.cta_bg_color,
              color: config.cta_text_color,
              fontSize: `${config.cta_font_size}px`,
              borderRadius: `${config.cta_border_radius}px`,
              borderWidth: `${config.cta_border_width}px`,
              borderColor: config.cta_border_color,
              borderStyle: config.cta_border_width > 0 ? 'solid' : 'none',
            }}
            className="w-full py-3 font-bold shadow-lg"
          >
            {(config.cta_text || 'Completar pedido - {order_total}').replace('{order_total}', '$89,900')}
          </button>
          {config.cta_subtitle && (
            <p className="mt-1 text-center text-xs text-gray-500">{config.cta_subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
