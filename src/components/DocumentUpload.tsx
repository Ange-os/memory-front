'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadDocumento } from '@/lib/api';
import { FileUp, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Props {
  token: string;
  onUploadComplete: () => void;
}

export default function DocumentUpload({ token, onUploadComplete }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [tipo, setTipo] = useState('tramite');
  const [subcategoria, setSubcategoria] = useState('');
  const [customSubcategoria, setCustomSubcategoria] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const subcategoriasTramite = ['asociarse', 'pedir la baja', 'modificar datos', 'consulta'];
  const subcategoriasInformacion = ['costos', 'precios', 'presupuestos', 'faq'];

  const getSubcategoriaFinal = () => {
    if (subcategoria === '__custom__' || showCustomInput) {
      return customSubcategoria.trim();
    }
    return subcategoria;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setMessage(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const subcategoriaFinal = getSubcategoriaFinal();
    if (!file || !subcategoriaFinal) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await uploadDocumento(file, tipo, subcategoriaFinal, token);
      setMessage({
        type: 'success',
        text: `Documento "${file.name}" procesado exitosamente. ID: ${result.documento_id}`,
      });
      setFile(null);
      setSubcategoria('');
      setCustomSubcategoria('');
      setShowCustomInput(false);
      onUploadComplete();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al subir el documento',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-fg mb-4">Cargar Nuevo Documento</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-bg'
              : 'border-border hover:border-primary'
          }`}
        >
          <input {...getInputProps()} />
          <FileUp className="mx-auto h-12 w-12 opacity-60 text-fg" />
          {isDragActive ? (
            <p className="mt-2 text-sm text-primary">Soltá el PDF acá...</p>
          ) : (
            <p className="mt-2 text-sm opacity-80 text-fg">
              Arrastrá un PDF aquí o hacé clic para seleccionar
            </p>
          )}
          {file && (
            <p className="mt-2 text-sm font-medium text-fg">{file.name}</p>
          )}
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium opacity-80 text-fg">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value);
              setSubcategoria('');
            }}
            className="mt-1 block w-full rounded-md border-border bg-bg shadow-sm focus:border-primary focus:ring-primary/30 sm:text-sm"
          >
            <option value="tramite">Trámite</option>
            <option value="informacion">Información</option>
          </select>
        </div>

        {/* Subcategoría */}
        <div>
          <label className="block text-sm font-medium opacity-80 text-fg">Subcategoría</label>
          <select
            value={subcategoria}
            onChange={(e) => {
              const val = e.target.value;
              setSubcategoria(val);
              setShowCustomInput(val === '__custom__');
              if (val !== '__custom__') {
                setCustomSubcategoria('');
              }
            }}
            className="mt-1 block w-full rounded-md border-border bg-bg shadow-sm focus:border-primary focus:ring-primary/30 sm:text-sm"
          >
            <option value="">Seleccionar...</option>
            {(tipo === 'tramite' ? subcategoriasTramite : subcategoriasInformacion).map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
            <option value="__custom__">+ Otra (escribir manualmente)</option>
          </select>
        </div>

        {/* Campo personalizado */}
        {(showCustomInput || subcategoria === '__custom__') && (
          <div>
            <label className="block text-sm font-medium opacity-80 text-fg">
              Subcategoría personalizada
            </label>
            <input
              type="text"
              value={customSubcategoria}
              onChange={(e) => setCustomSubcategoria(e.target.value)}
              placeholder="Escribí la subcategoría..."
              className="mt-1 block w-full rounded-md border-border bg-bg shadow-sm focus:border-primary focus:ring-primary/30 sm:text-sm"
              required
            />
          </div>
        )}

        {/* Mensaje */}
        {message && (
          <div
            className={`rounded-md p-4 flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!file || (!subcategoria && !customSubcategoria.trim()) || loading}
          className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Procesando...' : 'Cargar Documento'}
        </button>
      </form>
    </div>
  );
}
