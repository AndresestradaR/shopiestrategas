import { useState } from 'react';
import { X } from 'lucide-react';

export default function BlockEditModal({ block, onSave, onClose }) {
  const [local, setLocal] = useState({ ...block });

  const update = (field, value) => setLocal((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    const { _id, ...rest } = local;
    onSave(rest);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Editar bloque</h3>
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
                <label className="mb-1 block text-sm font-medium text-gray-700">Icono</label>
                <select
                  value={local.icon || 'note'}
                  onChange={(e) => update('icon', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                >
                  <option value="user">Usuario</option>
                  <option value="phone">Telefono</option>
                  <option value="map-pin">Ubicacion</option>
                  <option value="mail">Correo</option>
                  <option value="note">Nota</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tipo de input</label>
                <select
                  value={local.input_type || 'text'}
                  onChange={(e) => update('input_type', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
                >
                  <option value="text">Texto</option>
                  <option value="tel">Telefono</option>
                  <option value="email">Email</option>
                  <option value="number">Numero</option>
                  <option value="textarea">Area de texto</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={local.required || false}
                  onChange={(e) => update('required', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#4DBEA4] focus:ring-[#4DBEA4]"
                />
                <span className="text-sm text-gray-700">Campo obligatorio</span>
              </label>
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
            </>
          )}

          {/* Divider options */}
          {local.type === 'divider' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Color</label>
              <input
                type="text"
                value={local.color || '#E5E7EB'}
                onChange={(e) => update('color', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
              />
            </div>
          )}

          {/* Spacer options */}
          {local.type === 'spacer' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Altura (px)</label>
              <input
                type="number"
                value={local.height || 16}
                onChange={(e) => update('height', Number(e.target.value))}
                min={4}
                max={100}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
              />
            </div>
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
