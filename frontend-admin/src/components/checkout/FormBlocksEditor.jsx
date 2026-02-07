import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import BlockEditModal from './BlockEditModal';
import AddBlockModal from './AddBlockModal';

const BLOCK_LABELS = {
  field: 'Campo',
  custom_text: 'Texto personalizado',
  image: 'Imagen / GIF',
  divider: 'Divisor',
  spacer: 'Espaciador',
  price_summary: 'Resumen de precio',
};

// Block types hidden from the sortable list (kept in JSON for store rendering)
const HIDDEN_BLOCKS = [
  'offers', 'shipping_info', 'payment_method',
  'product_card', 'variants', 'trust_badge', 'submit_button',
];

function SortableBlock({ block, index, onToggle, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: block._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const label = block.type === 'field'
    ? `${BLOCK_LABELS.field}: ${block.label || block.field_key}`
    : BLOCK_LABELS[block.type] || block.type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors ${
        block.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
      }`}
    >
      <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
        <GripVertical size={16} />
      </button>
      <span className="flex-1 text-sm font-medium text-gray-700 truncate">{label}</span>
      <button
        type="button"
        onClick={() => onToggle(index)}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        title={block.enabled ? 'Desactivar' : 'Activar'}
      >
        {block.enabled ? <Eye size={15} /> : <EyeOff size={15} />}
      </button>
      <button
        type="button"
        onClick={() => onEdit(index)}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        title="Editar"
      >
        <Pencil size={15} />
      </button>
      <button
        type="button"
        onClick={() => onDelete(index)}
        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
        title="Eliminar"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

export default function FormBlocksEditor({ blocks, onChange }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Separate hidden blocks (kept in data) from visible ones
  const allBlocks = blocks || [];
  const hiddenBlocks = allBlocks.filter((b) => HIDDEN_BLOCKS.includes(b.type));
  const filteredBlocks = allBlocks.filter((b) => !HIDDEN_BLOCKS.includes(b.type));

  // Ensure each block has a stable _id for dnd-kit
  const blocksWithIds = filteredBlocks.map((b, i) => ({
    ...b,
    _id: b._id || `block-${i}-${b.type}-${b.field_key || b.position}`,
  }));

  // Merge visible blocks back with hidden ones when saving
  const emitChange = (visibleBlocks) => {
    const merged = [...hiddenBlocks, ...visibleBlocks].map((b, i) => ({ ...b, position: i }));
    onChange(merged);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocksWithIds.findIndex((b) => b._id === active.id);
    const newIndex = blocksWithIds.findIndex((b) => b._id === over.id);
    const reordered = arrayMove(blocksWithIds, oldIndex, newIndex);
    emitChange(reordered);
  };

  const handleToggle = (index) => {
    const updated = [...blocksWithIds];
    updated[index] = { ...updated[index], enabled: !updated[index].enabled };
    emitChange(updated);
  };

  const handleDelete = (index) => {
    const updated = blocksWithIds.filter((_, i) => i !== index);
    emitChange(updated);
  };

  const handleBlockUpdate = (index, updates) => {
    const updated = [...blocksWithIds];
    updated[index] = { ...updated[index], ...updates };
    emitChange(updated);
    setEditingIndex(null);
  };

  const handleAddBlock = (newBlock) => {
    const updated = [
      ...blocksWithIds,
      { ...newBlock, position: blocksWithIds.length, enabled: true, _id: `block-new-${Date.now()}` },
    ];
    emitChange(updated);
    setShowAddModal(false);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Bloques del formulario</h3>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#4DBEA4] px-3 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus size={14} />
          Agregar bloque
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocksWithIds.map((b) => b._id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {blocksWithIds.map((block, index) => (
              <SortableBlock
                key={block._id}
                block={block}
                index={index}
                onToggle={handleToggle}
                onEdit={setEditingIndex}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {editingIndex !== null && blocksWithIds[editingIndex] && (
        <BlockEditModal
          block={blocksWithIds[editingIndex]}
          onSave={(updates) => handleBlockUpdate(editingIndex, updates)}
          onClose={() => setEditingIndex(null)}
        />
      )}

      {showAddModal && (
        <AddBlockModal
          onAdd={handleAddBlock}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
