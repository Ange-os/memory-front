'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import LoginForm from '@/components/LoginForm';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/Logo';
import TopicsTree from '@/components/memory/TopicsTree';
import SelectionInfo from '@/components/memory/SelectionInfo';
import BlocksPanel from '@/components/memory/BlocksPanel';
import { memoryApi } from '@/lib/memoryApi';
import { Block, Subtopic, Topic } from '@/types/memory';
import { Download, LogOut } from 'lucide-react';

function Dashboard() {
  const { token, cliente, logout } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopicsByTopic, setSubtopicsByTopic] = useState<Record<number, Subtopic[]>>({});
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Record<number, boolean>>({});
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [savingBlock, setSavingBlock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const selectedTopicId = selectedTopic?.id ?? null;
  const selectedSubtopicId = selectedSubtopic?.id ?? null;

  const selectedTopicSubtopics = useMemo(() => {
    if (!selectedTopicId) {
      return [];
    }
    return subtopicsByTopic[selectedTopicId] || [];
  }, [selectedTopicId, subtopicsByTopic]);

  const resetEditor = () => {
    setSelectedBlockId(null);
    setEditingBlock(null);
  };

  const loadInitialData = async () => {
    if (!token) {
      return;
    }

    setLoadingTopics(true);
    setError(null);
    try {
      const nextTopics = await memoryApi.getTopics(token);
      const subtopicEntries = await Promise.all(
        nextTopics.map(async (topic) => [topic.id, await memoryApi.getSubtopics(token, topic.id)] as const)
      );

      const nextSubtopicsByTopic = Object.fromEntries(subtopicEntries) as Record<number, Subtopic[]>;
      const nextExpanded = nextTopics.reduce<Record<number, boolean>>((acc, topic) => {
        acc[topic.id] = expandedTopics[topic.id] ?? false;
        return acc;
      }, {});

      setTopics(nextTopics);
      setSubtopicsByTopic(nextSubtopicsByTopic);
      setExpandedTopics(nextExpanded);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar temas');
    } finally {
      setLoadingTopics(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const selectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setSelectedSubtopic(null);
    setBlocks([]);
    resetEditor();
  };

  const selectSubtopic = async (subtopic: Subtopic) => {
    if (!token) {
      return;
    }

    setSelectedSubtopic(subtopic);
    setLoadingBlocks(true);
    setError(null);
    resetEditor();

    try {
      const nextBlocks = await memoryApi.getBlocks(token, subtopic.id);
      setBlocks(nextBlocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar bloques');
    } finally {
      setLoadingBlocks(false);
    }
  };

  const toggleTopic = (topicId: number) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  const createTopic = async () => {
    if (!token) {
      return;
    }

    const name = window.prompt('Nombre del tema');
    if (!name) {
      return;
    }

    try {
      const newTopic = await memoryApi.createTopic(token, { name });
      setTopics((prev) => [...prev, newTopic]);
      setSubtopicsByTopic((prev) => ({ ...prev, [newTopic.id]: [] }));
      setExpandedTopics((prev) => ({ ...prev, [newTopic.id]: true }));
      setInfo('Tema creado');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el tema');
    }
  };

  const deleteTopic = async () => {
    if (!token || !selectedTopic) {
      return;
    }

    const confirmed = window.confirm(`Eliminar tema "${selectedTopic.name}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await memoryApi.deleteTopic(token, selectedTopic.id);
      setTopics((prev) => prev.filter((t) => t.id !== selectedTopic.id));
      setSubtopicsByTopic((prev) => {
        const next = { ...prev };
        delete next[selectedTopic.id];
        return next;
      });
      setSelectedTopic(null);
      setSelectedSubtopic(null);
      setBlocks([]);
      resetEditor();
      setInfo('Tema eliminado');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el tema');
    }
  };

  const createSubtopic = async () => {
    if (!token || !selectedTopic) {
      return;
    }

    const name = window.prompt('Nombre del subtema');
    if (!name) {
      return;
    }

    try {
      const newSubtopic = await memoryApi.createSubtopic(token, {
        topic_id: selectedTopic.id,
        name,
      });
      setSubtopicsByTopic((prev) => ({
        ...prev,
        [selectedTopic.id]: [...(prev[selectedTopic.id] || []), newSubtopic],
      }));
      setExpandedTopics((prev) => ({ ...prev, [selectedTopic.id]: true }));
      setInfo('Subtema creado');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el subtema');
    }
  };

  const deleteSubtopic = async () => {
    if (!token || !selectedSubtopic || !selectedTopic) {
      return;
    }

    const confirmed = window.confirm(`Eliminar subtema "${selectedSubtopic.name}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await memoryApi.deleteSubtopic(token, selectedSubtopic.id);
      setSubtopicsByTopic((prev) => ({
        ...prev,
        [selectedTopic.id]: (prev[selectedTopic.id] || []).filter((s) => s.id !== selectedSubtopic.id),
      }));
      setSelectedSubtopic(null);
      setBlocks([]);
      resetEditor();
      setInfo('Subtema eliminado');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el subtema');
    }
  };

  const createBlock = async () => {
    if (!token || !selectedSubtopic) {
      return;
    }

    try {
      const created = await memoryApi.createBlock(token, {
        subtopic_id: selectedSubtopic.id,
        title: 'Nuevo bloque',
        content: '',
      });
      const nextBlocks = [...blocks, created];
      setBlocks(nextBlocks);
      setSelectedBlockId(created.id);
      setEditingBlock(created);
      setInfo('Bloque creado');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el bloque');
    }
  };

  const handleSelectBlock = (block: Block) => {
    setSelectedBlockId(block.id);
    setEditingBlock({ ...block });
  };

  const saveBlock = async () => {
    if (!token || !editingBlock) {
      return;
    }

    setSavingBlock(true);
    setError(null);
    try {
      const result = await memoryApi.updateBlock(token, editingBlock.id, {
        title: editingBlock.title,
        content: editingBlock.content,
        content_type: editingBlock.content_type,
        order_index: editingBlock.order_index,
      });

      const updated = { ...editingBlock, version: result.version };
      setBlocks((prev) => prev.map((block) => (block.id === updated.id ? updated : block)));
      setEditingBlock(updated);
      setInfo('Bloque guardado');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el bloque');
    } finally {
      setSavingBlock(false);
    }
  };

  const deleteBlock = async (blockId: number) => {
    if (!token) {
      return;
    }

    const confirmed = window.confirm('Eliminar bloque?');
    if (!confirmed) {
      return;
    }

    try {
      await memoryApi.deleteBlock(token, blockId);
      setBlocks((prev) => prev.filter((block) => block.id !== blockId));
      if (selectedBlockId === blockId) {
        resetEditor();
      }
      setInfo('Bloque eliminado');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el bloque');
    }
  };

  const exportJson = async () => {
    if (!token) {
      return;
    }

    try {
      const data = await memoryApi.exportJson(token);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.download = `memory-export-${new Date().toISOString().split('T')[0]}.json`;
      anchor.click();
      URL.revokeObjectURL(href);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo exportar');
    }
  };

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Logo />
            <p className="text-sm font-medium text-fg truncate min-w-0" title={cliente?.nombre}>
              {cliente?.nombre ?? ''}
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
            <ThemeToggle />
            <button
              onClick={exportJson}
              type="button"
              aria-label="Exportar JSON"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-3 py-2 border border-border rounded-md text-sm font-medium bg-bg text-fg hover:bg-surface transition touch-manipulation"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Exportar JSON</span>
            </button>
            <Link
              href="/qdrant"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-3 py-2 border border-border rounded-md text-sm font-medium bg-bg text-fg hover:bg-surface transition touch-manipulation"
            >
              <span className="hidden sm:inline">Editar directo</span>
              <span className="sm:hidden">Editar</span>
            </Link>
            <button
              onClick={logout}
              type="button"
              aria-label="Cerrar sesión"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-3 py-2 border border-border rounded-md text-sm font-medium bg-bg text-fg hover:bg-surface transition touch-manipulation"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            className="px-3 py-2 text-sm rounded border border-border hover:bg-surface"
            onClick={createTopic}
          >
            Nuevo tema
          </button>
          <button
            type="button"
            disabled={!selectedTopic}
            className="px-3 py-2 text-sm rounded border border-border disabled:opacity-60"
            onClick={deleteTopic}
          >
            Eliminar tema
          </button>
          <button
            type="button"
            disabled={!selectedTopic}
            className="px-3 py-2 text-sm rounded border border-border disabled:opacity-60"
            onClick={createSubtopic}
          >
            Nuevo subtema
          </button>
          <button
            type="button"
            disabled={!selectedSubtopic}
            className="px-3 py-2 text-sm rounded border border-border disabled:opacity-60"
            onClick={deleteSubtopic}
          >
            Eliminar subtema
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {info}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <TopicsTree
            topics={topics}
            subtopicsByTopic={subtopicsByTopic}
            expandedTopics={expandedTopics}
            selectedTopicId={selectedTopicId}
            selectedSubtopicId={selectedSubtopicId}
            onToggleTopic={toggleTopic}
            onSelectTopic={selectTopic}
            onSelectSubtopic={selectSubtopic}
          />

          <div className="space-y-4">
            <SelectionInfo selectedTopic={selectedTopic} selectedSubtopic={selectedSubtopic} />
            {loadingTopics ? (
              <p className="text-sm opacity-70">Cargando temas...</p>
            ) : (
              <BlocksPanel
                blocks={blocks}
                selectedBlockId={selectedBlockId}
                editingBlock={editingBlock}
                loading={loadingBlocks}
                saving={savingBlock}
                onSelectBlock={handleSelectBlock}
                onDeleteBlock={deleteBlock}
                onCreateBlock={createBlock}
                onEditingBlockChange={setEditingBlock}
                onSaveBlock={saveBlock}
                onCancelEdit={() => {
                  if (!selectedBlockId) {
                    setEditingBlock(null);
                    return;
                  }
                  const original = blocks.find((block) => block.id === selectedBlockId) || null;
                  setEditingBlock(original ? { ...original } : null);
                }}
              />
            )}
            {selectedTopic && selectedTopicSubtopics.length === 0 && (
              <p className="text-xs opacity-70">
                Este tema aun no tiene subtemas. Crea uno para empezar a editar bloques.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}

function HomeContent() {
  const { isLoading, token } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-4">
        <p className="text-fg opacity-60">Cargando...</p>
      </div>
    );
  }

  if (!token) {
    return <LoginForm />;
  }

  return <Dashboard />;
}
