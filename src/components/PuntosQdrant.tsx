'use client';

import { useState, useEffect } from 'react';
import { getColeccion, actualizarPunto, eliminarPunto } from '@/lib/api';
import { FileText, Edit2, Trash2, X, Save, Loader2, RefreshCw } from 'lucide-react';

interface Props {
  token: string;
}

interface Punto {
  id: string;
  payload: {
    texto?: string;
    content?: string;
    tipo?: string;
    subcategoria?: string;
    archivo?: string;
    metadata?: Record<string, any>;
    [key: string]: any;
  };
}

function getTexto(payload: Punto['payload']): string {
  return (
    payload?.texto ||
    payload?.content ||
    (payload?.metadata && (payload.metadata['texto'] || payload.metadata['content'])) ||
    ''
  );
}

function getTipo(payload: Punto['payload']): string {
  return payload?.tipo || (payload?.metadata ? (payload.metadata['tipo'] as string) : '') || '';
}

function getSubcategoria(payload: Punto['payload']): string {
  return (
    payload?.subcategoria ||
    (payload?.metadata
      ? ((payload.metadata['subcategoria'] ||
          payload.metadata['información'] ||
          payload.metadata['informacion']) as string)
      : '') ||
    ''
  );
}

const inputClass =
  'w-full min-h-[44px] rounded-md border border-border bg-bg px-3 text-fg shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 text-base sm:text-sm';

export default function PuntosQdrant({ token }: Props) {
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ texto: '', tipo: '', subcategoria: '' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const cargarPuntos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getColeccion(token);
      setPuntos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar puntos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPuntos();
  }, [token]);

  const iniciarEdicion = (punto: Punto) => {
    setEditingId(punto.id);
    setEditData({
      texto: getTexto(punto.payload),
      tipo: getTipo(punto.payload),
      subcategoria: getSubcategoria(punto.payload),
    });
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    setEditData({ texto: '', tipo: '', subcategoria: '' });
  };

  const guardarEdicion = async (puntoId: string) => {
    setSaving(true);
    try {
      await actualizarPunto(
        puntoId,
        {
          texto: editData.texto,
          tipo: editData.tipo,
          subcategoria: editData.subcategoria,
        },
        token
      );
      setEditingId(null);
      cargarPuntos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (puntoId: string) => {
    if (!confirm('¿Estás seguro de eliminar este punto?')) return;

    setDeletingId(puntoId);
    try {
      await eliminarPunto(puntoId, token);
      cargarPuntos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="text-lg font-semibold text-fg">Documentos en Qdrant</h3>
        <button
          type="button"
          onClick={cargarPuntos}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-3 py-2 text-sm font-medium text-primary border border-primary/30 rounded-md hover:bg-primary/10 disabled:opacity-50 touch-manipulation self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 mb-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {loading && puntos.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-fg opacity-60">Cargando...</span>
        </div>
      ) : puntos.length === 0 ? (
        <p className="text-fg opacity-60 text-center py-8">No hay documentos en la colección</p>
      ) : (
        <div className="space-y-4">
          {puntos.map((punto) => (
            <div
              key={punto.id}
              className="border border-border rounded-lg p-4 bg-bg hover:bg-surface/50 transition-colors"
            >
              {editingId === punto.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-fg opacity-70 mb-1">Tipo</label>
                    <input
                      type="text"
                      value={editData.tipo}
                      onChange={(e) => setEditData({ ...editData, tipo: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-fg opacity-70 mb-1">
                      Subcategoría
                    </label>
                    <input
                      type="text"
                      value={editData.subcategoria}
                      onChange={(e) => setEditData({ ...editData, subcategoria: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-fg opacity-70 mb-1">Texto</label>
                    <textarea
                      value={editData.texto}
                      onChange={(e) => setEditData({ ...editData, texto: e.target.value })}
                      rows={5}
                      className={`${inputClass} min-h-[8rem] py-2 resize-y`}
                    />
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelarEdicion}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 text-sm text-fg border border-border rounded-md hover:bg-surface touch-manipulation"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => guardarEdicion(punto.id)}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 text-sm text-white bg-primary hover:opacity-90 rounded-md disabled:opacity-50 touch-manipulation"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <FileText className="h-5 w-5 text-fg opacity-50 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {getTipo(punto.payload) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/15 text-primary">
                              {getTipo(punto.payload)}
                            </span>
                          )}
                          {getSubcategoria(punto.payload) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface border border-border text-fg">
                              {getSubcategoria(punto.payload)}
                            </span>
                          )}
                          {punto.payload.archivo && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/15 text-fg">
                              {punto.payload.archivo}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-fg opacity-90 line-clamp-4 sm:line-clamp-6 whitespace-pre-wrap break-words">
                          {getTexto(punto.payload) || 'Sin texto'}
                        </p>
                        <p className="text-xs text-fg opacity-50 mt-2 break-all">ID: {punto.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 sm:ml-2 justify-end shrink-0">
                      <button
                        type="button"
                        onClick={() => iniciarEdicion(punto)}
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 text-fg opacity-60 hover:text-primary hover:opacity-100 transition-colors touch-manipulation rounded-md"
                        title="Editar"
                        aria-label="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEliminar(punto.id)}
                        disabled={deletingId === punto.id}
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 text-fg opacity-60 hover:text-red-600 hover:opacity-100 transition-colors disabled:opacity-50 touch-manipulation rounded-md"
                        title="Eliminar"
                        aria-label="Eliminar"
                      >
                        {deletingId === punto.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
