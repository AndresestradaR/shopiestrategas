import { X, Type, Image, MinusSquare, MoveVertical, FileText, Phone, Mail, Hash, Calendar, List, CheckSquare } from 'lucide-react';

const BLOCK_TYPES = [
  { type: 'field', label: 'Campo de texto', icon: Type, defaults: { field_key: '', label: '', placeholder: '', required: false, icon: 'note', input_type: 'text' } },
  { type: 'field', label: 'Campo telefono', icon: Phone, defaults: { field_key: '', label: '', placeholder: '', required: false, icon: 'phone', input_type: 'tel' } },
  { type: 'field', label: 'Campo email', icon: Mail, defaults: { field_key: '', label: '', placeholder: '', required: false, icon: 'mail', input_type: 'email' } },
  { type: 'field', label: 'Campo numerico', icon: Hash, defaults: { field_key: '', label: '', placeholder: '', required: false, icon: 'note', input_type: 'number' } },
  { type: 'field', label: 'Area de texto', icon: FileText, defaults: { field_key: '', label: '', placeholder: '', required: false, icon: 'note', input_type: 'textarea' } },
  { type: 'field', label: 'Lista desplegable', icon: List, defaults: { field_key: '', label: '', placeholder: 'Seleccionar...', required: false, icon: 'note', input_type: 'select', options: [] } },
  { type: 'field', label: 'Casilla de verificacion', icon: CheckSquare, defaults: { field_key: '', label: '', placeholder: '', required: false, icon: 'note', input_type: 'checkbox' } },
  { type: 'field', label: 'Campo de fecha', icon: Calendar, defaults: { field_key: '', label: '', placeholder: '', required: false, icon: 'calendar', input_type: 'date' } },
  { type: 'custom_text', label: 'Texto personalizado', icon: Type, defaults: { text: '', align: 'left', bold: false } },
  { type: 'image', label: 'Imagen / GIF', icon: Image, defaults: { image_url: '', alt: '' } },
  { type: 'divider', label: 'Divisor', icon: MinusSquare, defaults: { color: '#E5E7EB' } },
  { type: 'spacer', label: 'Espaciador', icon: MoveVertical, defaults: { height: 16 } },
];

export default function AddBlockModal({ onAdd, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm max-h-[80vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Agregar bloque</h3>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-1.5">
          {BLOCK_TYPES.map((bt, idx) => {
            const Icon = bt.icon;
            return (
              <button
                key={`${bt.type}-${idx}`}
                type="button"
                onClick={() => onAdd({ type: bt.type, ...bt.defaults })}
                className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Icon size={16} className="text-gray-400" />
                {bt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
