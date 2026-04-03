'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { login } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/Logo';

export default function LoginForm() {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login({ nombre_usuario: nombreUsuario, password });
      authLogin(data.access_token, {
        cliente_id: data.cliente_id,
        nombre: data.nombre,
        qdrant_collection: data.qdrant_collection,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-fg py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
        <div className="flex flex-col items-center gap-3">
          <Logo compact />
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight px-1">
            memory-bot
          </h2>
          <p className="text-center text-sm opacity-70">
            Iniciá sesión para cargar documentos
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="nombre_usuario" className="sr-only">
                Nombre de usuario
              </label>
              <input
                id="nombre_usuario"
                name="nombre_usuario"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full min-h-[48px] px-3 py-2.5 border border-border bg-surface placeholder:opacity-60 text-fg text-base rounded-t-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Nombre de usuario"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full min-h-[48px] px-3 py-2.5 border border-border bg-surface placeholder:opacity-60 text-fg text-base rounded-b-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center min-h-[48px] py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 touch-manipulation"
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
