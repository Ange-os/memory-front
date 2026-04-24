'use client';

import { Block } from '@/types/memory';
import BlockEditor from '@/components/memory/BlockEditor';

interface BlocksPanelProps {
  blocks: Block[];
  selectedBlockId: number | null;
  editingBlock: Block | null;
  loading: boolean;
  saving: boolean;
  onSelectBlock: (block: Block) => void;
  onDeleteBlock: (blockId: number) => void;
  onCreateBlock: () => void;
  onEditingBlockChange: (next: Block) => void;
  onSaveBlock: () => void;
  onCancelEdit: () => void;
}

export default function BlocksPanel({
  blocks,
  selectedBlockId,
  editingBlock,
  loading,
  saving,
  onSelectBlock,
  onDeleteBlock,
  onCreateBlock,
  onEditingBlockChange,
  onSaveBlock,
  onCancelEdit,
}: BlocksPanelProps) {
  return (
    <section className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Bloques</h2>
        <button
          type="button"
          className="px-3 py-2 text-sm rounded border border-border hover:bg-bg"
          onClick={onCreateBlock}
        >
          Nuevo bloque
        </button>
      </div>

      {loading && <p className="text-sm opacity-70">Cargando bloques...</p>}
      {!loading && blocks.length === 0 && <p className="text-sm opacity-70">Sin bloques en este subtema.</p>}

      {!loading && blocks.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <ul className="space-y-2">
            {blocks.map((block) => (
              <li key={block.id} className="flex items-center gap-2">
                <button
                  type="button"
                  className={`text-left flex-1 px-3 py-2 rounded border text-sm ${
                    selectedBlockId === block.id
                      ? 'border-primary text-primary'
                      : 'border-border hover:bg-bg'
                  }`}
                  onClick={() => onSelectBlock(block)}
                >
                  {block.title || '(sin titulo)'}
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-xs rounded border border-border hover:bg-bg"
                  onClick={() => onDeleteBlock(block.id)}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>

          {editingBlock ? (
            <BlockEditor
              block={editingBlock}
              isSaving={saving}
              onChange={onEditingBlockChange}
              onSave={onSaveBlock}
              onCancel={onCancelEdit}
            />
          ) : (
            <p className="text-sm opacity-70">Selecciona un bloque para editar.</p>
          )}
        </div>
      )}
    </section>
  );
}
