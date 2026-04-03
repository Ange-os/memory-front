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
    content?: string;
    metadata?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

function getResultText(payload: Resultado['payload']): string {
  const meta = payload?.metadata as Record<string, string> | undefined;
  return (
    (payload?.texto as string) ||
    (payload?.content as string) ||
    (meta?.texto as string) ||
    (meta?.content as string) ||
    ''
  );
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
    <div className="bg-surface rounded-lg border border-border p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-fg mb-4">Buscar en Colección</h3>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué estás buscando?"
            className="flex-1 min-h-[44px] rounded-md border border-border bg-bg px-3 text-fg placeholder:opacity-50 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 text-base sm:text-sm"
            enterKeyHint="search"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-primary hover:opacity-90 disabled:opacity-50 touch-manipulation shrink-0"
          >
            <Search className="h-4 w-4 shrink-0" />
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 mb-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {resultados.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-fg opacity-60">
            {resultados.length} resultado(s) encontrado(s)
          </p>
          {resultados.map((resultado) => {
            const texto = getResultText(resultado.payload);
            return (
              <div
                key={resultado.id}
                className="border border-border rounded-lg p-4 bg-bg hover:bg-surface/80 transition-colors"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <FileText className="h-5 w-5 text-fg opacity-50 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {resultado.payload.tipo && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/15 text-primary">
                            {String(resultado.payload.tipo)}
                          </span>
                        )}
                        {resultado.payload.subcategoria && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface border border-border text-fg">
                            {String(resultado.payload.subcategoria)}
                          </span>
                        )}
                      </div>
                      {texto ? (
                        <p className="text-sm text-fg opacity-90 line-clamp-4 whitespace-pre-wrap break-words">
                          {texto}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <span className="text-xs text-fg opacity-50 shrink-0 sm:text-right">
                    Score: {resultado.score.toFixed(3)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
