'use client';

import { useEffect, useState } from 'react';
import { getHistorial } from '@/lib/api';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Props {
  token: string;
  refreshTrigger?: number;
}

interface Documento {
  id: number;
  nombre_archivo: string;
  tipo: string;
  subcategoria: string;
  estado: string;
  created_at: string;
}

const estadoIcon = {
  pendiente: <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />,
  procesando: <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />,
  completado: <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />,
  fallido: <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
};

function estadoPillClass(estado: string): string {
  const map: Record<string, string> = {
    pendiente: 'bg-yellow-500/15 text-yellow-900 dark:text-yellow-100',
    procesando: 'bg-blue-500/15 text-blue-900 dark:text-blue-100',
    completado: 'bg-green-500/15 text-green-900 dark:text-green-100',
    fallido: 'bg-red-500/15 text-red-900 dark:text-red-100',
  };
  return map[estado] ?? 'bg-surface text-fg opacity-80';
}

export default function Historial({ token, refreshTrigger }: Props) {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorial = async () => {
      setLoading(true);
      try {
        const data = await getHistorial(token);
        setDocumentos(data);
      } catch (err) {
        console.error('Error al cargar historial:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [token, refreshTrigger]);

  if (loading) {
    return (
      <div className="bg-surface rounded-lg border border-border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-fg mb-4">Historial de Documentos</h3>
        <p className="text-fg opacity-60">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-fg mb-4">Historial de Documentos</h3>

      {documentos.length === 0 ? (
        <p className="text-fg opacity-60 text-sm">No hay documentos cargados aún</p>
      ) : (
        <>
          {/* Móvil: tarjetas */}
          <ul className="md:hidden space-y-3" role="list">
            {documentos.map((doc) => (
              <li
                key={doc.id}
                className="rounded-lg border border-border bg-bg p-4 space-y-3 shadow-sm"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <FileText className="h-5 w-5 text-fg opacity-50 shrink-0 mt-0.5" aria-hidden />
                  <p className="text-sm font-medium text-fg break-words">{doc.nombre_archivo}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/15 text-primary">
                    {doc.tipo}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface border border-border text-fg">
                    {doc.subcategoria}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {estadoIcon[doc.estado as keyof typeof estadoIcon]}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${estadoPillClass(
                        doc.estado
                      )}`}
                    >
                      {doc.estado}
                    </span>
                  </div>
                  <time
                    className="text-xs text-fg opacity-60 whitespace-nowrap"
                    dateTime={doc.created_at}
                  >
                    {new Date(doc.created_at).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
              </li>
            ))}
          </ul>

          {/* Escritorio: tabla con scroll horizontal por si acaso */}
          <div className="hidden md:block overflow-x-auto -mx-1 px-1">
            <table className="min-w-full divide-y divide-border text-left">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-xs font-medium text-fg opacity-60 uppercase tracking-wide">
                    Archivo
                  </th>
                  <th className="px-3 py-2 text-xs font-medium text-fg opacity-60 uppercase tracking-wide">
                    Tipo
                  </th>
                  <th className="px-3 py-2 text-xs font-medium text-fg opacity-60 uppercase tracking-wide">
                    Subcategoría
                  </th>
                  <th className="px-3 py-2 text-xs font-medium text-fg opacity-60 uppercase tracking-wide">
                    Estado
                  </th>
                  <th className="px-3 py-2 text-xs font-medium text-fg opacity-60 uppercase tracking-wide whitespace-nowrap">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {documentos.map((doc) => (
                  <tr key={doc.id} className="hover:bg-bg/80 transition-colors">
                    <td className="px-3 py-3 text-sm">
                      <div className="flex items-center gap-2 min-w-0 max-w-xs lg:max-w-md">
                        <FileText className="h-4 w-4 text-fg opacity-50 shrink-0" />
                        <span className="truncate" title={doc.nombre_archivo}>
                          {doc.nombre_archivo}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/15 text-primary">
                        {doc.tipo}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-fg opacity-90 max-w-[10rem] truncate" title={doc.subcategoria}>
                      {doc.subcategoria}
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {estadoIcon[doc.estado as keyof typeof estadoIcon]}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${estadoPillClass(
                            doc.estado
                          )}`}
                        >
                          {doc.estado}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-fg opacity-70 whitespace-nowrap">
                      {new Date(doc.created_at).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
