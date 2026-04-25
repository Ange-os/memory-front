'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import LoginForm from '@/components/LoginForm';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/Logo';
import PuntosQdrant from '@/components/PuntosQdrant';
import { AlertTriangle, ArrowLeft, LogOut } from 'lucide-react';

function QdrantContent() {
  const { isLoading, token, cliente, logout } = useAuth();
  const [acceptedWarning, setAcceptedWarning] = useState(false);

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
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-3 py-2 border border-border rounded-md text-sm font-medium bg-bg text-fg hover:bg-surface transition touch-manipulation"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Volver</span>
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
        {!acceptedWarning ? (
          <section className="max-w-2xl mx-auto rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-300 mt-0.5 shrink-0" aria-hidden />
              <div className="space-y-3">
                <h2 className="text-base sm:text-lg font-semibold text-amber-200">Aviso importante</h2>
                <p className="text-sm leading-relaxed text-amber-100/90">
                  La seccion <strong>Editar directo</strong> modifica directamente los datos en Qdrant
                  que alimentan la memoria del bot. Los cambios impactan en las respuestas del asistente.
                </p>
                <p className="text-sm leading-relaxed text-amber-100/90">
                  Continua solo si estas seguro de que queres editar contenido en produccion.
                </p>
                <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-medium rounded-md border border-border bg-bg text-fg hover:bg-surface transition"
                  >
                    Volver
                  </Link>
                  <button
                    type="button"
                    onClick={() => setAcceptedWarning(true)}
                    className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:opacity-90 transition"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <PuntosQdrant token={token} />
        )}
      </main>
    </div>
  );
}

export default function QdrantPage() {
  return (
    <AuthProvider>
      <QdrantContent />
    </AuthProvider>
  );
}
