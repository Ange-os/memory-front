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
      await actualizarPunto(puntoId, {
        texto: editData.texto,
        tipo: editData.tipo,
        subcategoria: editData.subcategoria,
      }, token);
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Documentos en Qdrant</h3>
        <button
          onClick={cargarPuntos}
          disabled={loading}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {loading && puntos.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-500">Cargando...</span>
        </div>
      ) : puntos.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No hay documentos en la colección</p>
      ) : (
        <div className="space-y-4">
          {puntos.map((punto) => (
            <div
              key={punto.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              {editingId === punto.id ? (
                // Modo edición
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
                    <input
                      type="text"
                      value={editData.tipo}
                      onChange={(e) => setEditData({ ...editData, tipo: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Subcategoría</label>
                    <input
                      type="text"
                      value={editData.subcategoria}
                      onChange={(e) => setEditData({ ...editData, subcategoria: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Texto</label>
                    <textarea
                      value={editData.texto}
                      onChange={(e) => setEditData({ ...editData, texto: e.target.value })}
                      rows={5}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelarEdicion}
                      disabled={saving}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </button>
                    <button
                      onClick={() => guardarEdicion(punto.id)}
                      disabled={saving}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                // Modo visualización
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {getTipo(punto.payload) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                              {getTipo(punto.payload)}
                            </span>
                          )}
                          {getSubcategoria(punto.payload) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {getSubcategoria(punto.payload)}
                            </span>
                          )}
                          {punto.payload.archivo && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              {punto.payload.archivo}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-4 whitespace-pre-wrap">
                          {getTexto(punto.payload) || 'Sin texto'}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">ID: {punto.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => iniciarEdicion(punto)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEliminar(punto.id)}
                        disabled={deletingId === punto.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Eliminar"
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
