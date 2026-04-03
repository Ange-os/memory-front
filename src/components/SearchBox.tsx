'use client';

import { useState } from 'react';
import { buscarEnQdrant } from '@/lib/api';
import { Search, FileText } from 'lucide-react';

interface Props {
  token: string;
}

interface Resultado {
  id: string;
  score: number;
  payload: {
    tipo?: string;
    subcategoria?: string;
    texto?: string;
    [key: string]: any;
  };
}

export default function SearchBox({ token }: Props) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const data = await buscarEnQdrant(query, token, 10);
      setResultados(data.resultados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar');
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Buscar en Colección</h3>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué estás buscando?"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {resultados.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            {resultados.length} resultado(s) encontrado(s)
          </p>
          {resultados.map((resultado) => (
            <div
              key={resultado.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="flex gap-2 mb-1">
                      {resultado.payload.tipo && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                          {resultado.payload.tipo}
                        </span>
                      )}
                      {resultado.payload.subcategoria && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {resultado.payload.subcategoria}
                        </span>
                      )}
                    </div>
                    {resultado.payload.texto && (
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {resultado.payload.texto}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  Score: {resultado.score.toFixed(3)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
