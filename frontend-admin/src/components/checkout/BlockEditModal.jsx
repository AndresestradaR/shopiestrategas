import { useState } from 'react';
import { X } from 'lucide-react';
import SliderControl from './SliderControl';

const ICONS = [
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

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Icono</label>
                <select
                  value={local.icon || 'note'}
                  onChange={(e) => update('icon', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                >
                  {ICONS.map((ic) => (
                    <option key={ic.value} value={ic.value}>{ic.label}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={local.show_icon !== false}
                  onChange={(e) => update('show_icon', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#4DBEA4] focus:ring-[#4DBEA4]"
                />
                <span className="text-sm text-gray-700">Mostrar icono</span>
              </label>

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

          {/* Product card options */}
          {local.type === 'product_card' && (
            <p className="text-sm text-gray-500">
              Muestra la imagen, nombre y precio del producto. Usa el toggle "Mostrar imagen del producto" en Opciones para controlar la visibilidad.
            </p>
          )}

          {/* Variants options */}
          {local.type === 'variants' && (
            <p className="text-sm text-gray-500">
              Muestra el selector de variantes del producto. Se oculta automaticamente si el producto no tiene variantes.
            </p>
          )}

          {/* Price summary options */}
          {local.type === 'price_summary' && (
            <p className="text-sm text-gray-500">
              Muestra subtotal, envio y total. Usa el toggle "Mostrar resumen de precio" en Opciones para controlar la visibilidad.
            </p>
          )}

          {/* Trust badge options */}
          {local.type === 'trust_badge' && (
            <p className="text-sm text-gray-500">
              Muestra 3 sellos de confianza: Pago seguro, Envio gratis y Contraentrega. Usa el toggle en Opciones para controlar la visibilidad.
            </p>
          )}

          {/* Submit button options */}
          {local.type === 'submit_button' && (
            <p className="text-sm text-gray-500">
              El boton de envio. Su apariencia se configura en la seccion "Boton de compra (CTA)" arriba.
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
