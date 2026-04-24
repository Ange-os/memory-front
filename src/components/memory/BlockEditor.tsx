'use client';

import { Block } from '@/types/memory';

interface BlockEditorProps {
  block: Block;
  isSaving: boolean;
  onChange: (next: Block) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function BlockEditor({ block, isSaving, onChange, onSave, onCancel }: BlockEditorProps) {
  return (
    <div className="border border-border rounded-lg p-4 bg-surface">
      <h3 className="text-sm font-semibold mb-3">Editor de bloque</h3>
      <div className="space-y-3">
        <input
          className="w-full rounded border border-border bg-bg px-3 py-2 text-sm"
          value={block.title}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          placeholder="Titulo del bloque"
        />

        <textarea
          className="w-full min-h-[180px] rounded border border-border bg-bg px-3 py-2 text-sm"
          value={block.content}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          placeholder="Contenido"
        />

        <select
          className="w-full rounded border border-border bg-bg px-3 py-2 text-sm"
          value={block.content_type}
          onChange={(e) => onChange({ ...block, content_type: e.target.value })}
        >
          <option value="text">Texto</option>
          <option value="faq">FAQ</option>
          <option value="steps">Pasos</option>
          <option value="legal">Legal</option>
        </select>

        <div className="flex gap-2">
          <button
            type="button"
            className="px-3 py-2 text-sm rounded bg-primary text-white disabled:opacity-60"
            disabled={isSaving}
            onClick={onSave}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            className="px-3 py-2 text-sm rounded border border-border"
            disabled={isSaving}
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
