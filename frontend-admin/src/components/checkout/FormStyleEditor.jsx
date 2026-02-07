import { useEffect } from 'react';
import ColorPicker from './ColorPicker';
import SliderControl from './SliderControl';

const INPUT_STYLES = [
  { value: 'outline', label: 'Borde (outline)' },
  { value: 'filled', label: 'Relleno (filled)' },
  { value: 'underline', label: 'Subrayado (underline)' },
];

const FONTS = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'system-ui, sans-serif', label: 'Sistema' },
];

const GOOGLE_FONT_MAP = {
  'Inter, sans-serif': 'Inter',
  'Poppins, sans-serif': 'Poppins',
  'Montserrat, sans-serif': 'Montserrat',
  'Roboto, sans-serif': 'Roboto',
  'Open Sans, sans-serif': 'Open+Sans',
  'Lato, sans-serif': 'Lato',
};

export default function FormStyleEditor({ config, onChange }) {
  const update = (field, value) => onChange({ [field]: value });

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

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-gray-900">Estilo del formulario</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <ColorPicker label="Color de fondo" color={config.form_bg_color} onChange={(v) => update('form_bg_color', v)} />
          <ColorPicker label="Color de texto" color={config.form_text_color} onChange={(v) => update('form_text_color', v)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ColorPicker label="Color del borde" color={config.form_border_color} onChange={(v) => update('form_border_color', v)} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Sombra</label>
            <select
              value={config.form_shadow || 'sm'}
              onChange={(e) => update('form_shadow', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
            >
              <option value="none">Sin sombra</option>
              <option value="sm">Pequena</option>
              <option value="md">Mediana</option>
              <option value="lg">Grande</option>
            </select>
          </div>
        </div>

        <SliderControl label="Tamano de fuente" value={config.form_font_size || 14} onChange={(v) => update('form_font_size', v)} min={12} max={20} unit="px" />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tipografia del formulario</label>
          <select
            value={config.form_font_family || 'Inter, sans-serif'}
            onChange={(e) => update('form_font_family', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
          >
            {FONTS.map((f) => (
              <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-400">Aplica a labels, placeholders y textos del formulario</p>
        </div>

        <SliderControl label="Borde redondeado" value={config.form_border_radius || 12} onChange={(v) => update('form_border_radius', v)} min={0} max={24} unit="px" />
        <SliderControl label="Grosor del borde" value={config.form_border_width || 1} onChange={(v) => update('form_border_width', v)} min={0} max={4} unit="px" />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Estilo de inputs</label>
          <select
            value={config.form_input_style || 'outline'}
            onChange={(e) => update('form_input_style', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
          >
            {INPUT_STYLES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
