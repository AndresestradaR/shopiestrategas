import { useState } from 'react';
import { X } from 'lucide-react';
import SliderControl from './SliderControl';

const ICON_SVGS = {
  user: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />,
  phone: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />,
  'map-pin': <><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></>,
  mail: <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />,
  note: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />,
  hash: <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-6.3-19.5-3.9 19.5" />,
  calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />,
  building: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />,
  'id-card': <><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 9.375a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M11.794 15.711a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" /></>,
  globe: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.919 17.919 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />,
};

const ICON_LIST = [
  { value: 'user', label: 'Usuario' },
  { value: 'phone', label: 'Telefono' },
  { value: 'map-pin', label: 'Ubicacion' },
  { value: 'mail', label: 'Correo' },
  { value: 'note', label: 'Nota' },
  { value: 'hash', label: 'Numero' },
  { value: 'calendar', label: 'Calendario' },
  { value: 'building', label: 'Edificio' },
  { value: 'id-card', label: 'Cedula' },
  { value: 'globe', label: 'Pais' },
];

const INPUT_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'tel', label: 'Telefono' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Numero' },
  { value: 'textarea', label: 'Area de texto' },
  { value: 'select', label: 'Lista desplegable' },
  { value: 'checkbox', label: 'Casilla de verificacion' },
  { value: 'date', label: 'Fecha' },
];

const BLOCK_TITLES = {
  field: 'Editar campo',
  custom_text: 'Editar texto',
  image: 'Editar imagen',
  divider: 'Editar divisor',
  spacer: 'Editar espaciador',
  product_card: 'Imagen del producto',
  variants: 'Selector de variantes',
  price_summary: 'Resumen de precio',
  trust_badge: 'Sellos de confianza',
  submit_button: 'Boton de compra',
};

export default function BlockEditModal({ block, onSave, onClose }) {
  const [local, setLocal] = useState({ ...block });

  const update = (field, value) => setLocal((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    const { _id, ...rest } = local;
    onSave(rest);
  };

  const title = BLOCK_TITLES[local.type] || 'Editar bloque';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Field-specific options */}
          {local.type === 'field' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Etiqueta</label>
                <input
                  type="text"
                  value={local.label || ''}
                  onChange={(e) => update('label', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Placeholder</label>
                <input
                  type="text"
                  value={local.placeholder || ''}
                  onChange={(e) => update('placeholder', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Clave del campo</label>
                <input
                  type="text"
                  value={local.field_key || ''}
                  onChange={(e) => update('field_key', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tipo de input</label>
                <select
                  value={local.input_type || 'text'}
                  onChange={(e) => update('input_type', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                >
                  {INPUT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Select options */}
              {local.input_type === 'select' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Opciones (una por linea)</label>
                  <textarea
                    value={(local.options || []).join('\n')}
                    onChange={(e) => update('options', e.target.value.split('\n'))}
                    rows={4}
                    placeholder="Opcion 1&#10;Opcion 2&#10;Opcion 3"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                  />
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={local.show_icon !== false}
                  onChange={(e) => update('show_icon', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#4DBEA4] focus:ring-[#4DBEA4]"
                />
                <span className="text-sm text-gray-700">Mostrar icono</span>
              </label>

              {local.show_icon !== false && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Icono</label>
                  <div className="grid grid-cols-5 gap-2">
                    {ICON_LIST.map((ic) => (
                      <button
                        key={ic.value}
                        type="button"
                        onClick={() => update('icon', ic.value)}
                        title={ic.label}
                        className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-colors ${
                          (local.icon || 'note') === ic.value
                            ? 'border-[#4DBEA4] bg-[#4DBEA4]/10 text-[#4DBEA4]'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          {ICON_SVGS[ic.value]}
                        </svg>
                        <span className="text-[10px] leading-tight">{ic.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={local.required || false}
                  onChange={(e) => update('required', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#4DBEA4] focus:ring-[#4DBEA4]"
                />
                <span className="text-sm text-gray-700">Campo obligatorio</span>
              </label>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Prefijo (opcional)</label>
                <input
                  type="text"
                  value={local.prefix || ''}
                  onChange={(e) => update('prefix', e.target.value)}
                  placeholder="Ej: +57"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Min caracteres</label>
                  <input
                    type="number"
                    value={local.min_length || ''}
                    onChange={(e) => update('min_length', e.target.value ? Number(e.target.value) : null)}
                    min={0}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Max caracteres</label>
                  <input
                    type="number"
                    value={local.max_length || ''}
                    onChange={(e) => update('max_length', e.target.value ? Number(e.target.value) : null)}
                    min={0}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Texto de error personalizado</label>
                <input
                  type="text"
                  value={local.error_text || ''}
                  onChange={(e) => update('error_text', e.target.value)}
                  placeholder="Ej: Este campo es obligatorio"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                />
              </div>
            </>
          )}

          {/* Custom text options */}
          {local.type === 'custom_text' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Texto</label>
                <textarea
                  value={local.text || ''}
                  onChange={(e) => update('text', e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">HTML (opcional)</label>
                <textarea
                  value={local.html || ''}
                  onChange={(e) => update('html', e.target.value)}
                  rows={3}
                  className="w-full font-mono rounded-lg border border-gray-300 px-3 py-2 text-xs outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Alineacion</label>
                <select
                  value={local.align || 'left'}
                  onChange={(e) => update('align', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                >
                  <option value="left">Izquierda</option>
                  <option value="center">Centro</option>
                  <option value="right">Derecha</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Color de texto</label>
                <input
                  type="text"
                  value={local.text_color || ''}
                  onChange={(e) => update('text_color', e.target.value)}
                  placeholder="#6B7280"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                />
              </div>
              <SliderControl label="Tamano de fuente" value={local.font_size || 14} onChange={(v) => update('font_size', v)} min={10} max={24} unit="px" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={local.bold || false}
                  onChange={(e) => update('bold', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#4DBEA4] focus:ring-[#4DBEA4]"
                />
                <span className="text-sm text-gray-700">Negrita</span>
              </label>
            </>
          )}

          {/* Image options */}
          {local.type === 'image' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">URL de la imagen</label>
                <input
                  type="text"
                  value={local.image_url || ''}
                  onChange={(e) => update('image_url', e.target.value)}
                  placeholder="https://... o /uploads/..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Texto alternativo</label>
                <input
                  type="text"
                  value={local.alt || ''}
                  onChange={(e) => update('alt', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ancho maximo</label>
                <select
                  value={local.max_width || 'full'}
                  onChange={(e) => update('max_width', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                >
                  <option value="full">Completo</option>
                  <option value="sm">Pequeno (200px)</option>
                  <option value="md">Mediano (300px)</option>
                  <option value="lg">Grande (400px)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Link (opcional)</label>
                <input
                  type="text"
                  value={local.link_url || ''}
                  onChange={(e) => update('link_url', e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                />
              </div>
            </>
          )}

          {/* Divider options */}
          {local.type === 'divider' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Color</label>
                <input
                  type="text"
                  value={local.color || '#E5E7EB'}
                  onChange={(e) => update('color', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                />
              </div>
              <SliderControl label="Grosor" value={local.thickness || 1} onChange={(v) => update('thickness', v)} min={1} max={4} unit="px" />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Estilo</label>
                <select
                  value={local.style || 'solid'}
                  onChange={(e) => update('style', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                >
                  <option value="solid">Solido</option>
                  <option value="dashed">Guiones</option>
                  <option value="dotted">Puntos</option>
                </select>
              </div>
            </>
          )}

          {/* Spacer options */}
          {local.type === 'spacer' && (
            <SliderControl label="Altura" value={local.height || 16} onChange={(v) => update('height', v)} min={4} max={100} unit="px" />
          )}

          {/* Price summary info */}
          {local.type === 'price_summary' && (
            <p className="text-sm text-gray-500">
              Muestra subtotal, envio y total. Usa el toggle "Mostrar resumen de precio" en Opciones para controlar la visibilidad.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-[#4DBEA4] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
