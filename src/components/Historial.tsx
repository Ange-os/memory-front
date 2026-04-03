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
  pendiente: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  procesando: <Clock className="h-4 w-4 text-blue-500 animate-spin" />,
  completado: <CheckCircle className="h-4 w-4 text-green-500" />,
  fallido: <XCircle className="h-4 w-4 text-red-500" />,
};

const estadoColor = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  procesando: 'bg-blue-100 text-blue-800',
  completado: 'bg-green-100 text-green-800',
  fallido: 'bg-red-100 text-red-800',
};

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
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Historial de Documentos</h3>
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Historial de Documentos</h3>

      {documentos.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay documentos cargados aún</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Archivo
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Subcategoría
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documentos.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      {doc.nombre_archivo}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                      {doc.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{doc.subcategoria}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      {estadoIcon[doc.estado as keyof typeof estadoIcon]}
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          estadoColor[doc.estado as keyof typeof estadoColor]
                        }`}
                      >
                        {doc.estado}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
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
      )}
    </div>
  );
}
