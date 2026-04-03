'use client';

import { useState } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import LoginForm from '@/components/LoginForm';
import DocumentUpload from '@/components/DocumentUpload';
import SearchBox from '@/components/SearchBox';
import Historial from '@/components/Historial';
import PuntosQdrant from '@/components/PuntosQdrant';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/Logo';
import { LogOut, Upload, Search, List, Database } from 'lucide-react';

function Dashboard() {
  const { token, cliente, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'search' | 'history' | 'puntos'>('upload');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-bg text-fg">
      {/* Header */}
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

      {/* Main */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-8">
        {/* Tabs: scroll horizontal en pantallas chicas */}
        <div className="mb-4 sm:mb-6 border-b border-border -mx-3 px-3 sm:mx-0 sm:px-0">
          <nav
            className="-mb-px flex gap-1 sm:gap-4 overflow-x-auto scrollbar-none pb-px snap-x snap-mandatory"
            role="tablist"
            aria-label="Secciones"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'upload'}
              onClick={() => setActiveTab('upload')}
              className={`inline-flex items-center gap-1.5 sm:gap-2 pb-3 px-2 sm:px-1 border-b-2 font-medium text-sm transition shrink-0 snap-start min-h-[44px] touch-manipulation ${
                activeTab === 'upload'
                  ? 'border-primary text-primary'
                  : 'border-transparent opacity-70 hover:opacity-100 hover:border-border'
              }`}
            >
              <Upload className="h-4 w-4 shrink-0" />
              Cargar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'search'}
              onClick={() => setActiveTab('search')}
              className={`inline-flex items-center gap-1.5 sm:gap-2 pb-3 px-2 sm:px-1 border-b-2 font-medium text-sm transition shrink-0 snap-start min-h-[44px] touch-manipulation ${
                activeTab === 'search'
                  ? 'border-primary text-primary'
                  : 'border-transparent opacity-70 hover:opacity-100 hover:border-border'
              }`}
            >
              <Search className="h-4 w-4 shrink-0" />
              Buscar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center gap-1.5 sm:gap-2 pb-3 px-2 sm:px-1 border-b-2 font-medium text-sm transition shrink-0 snap-start min-h-[44px] touch-manipulation ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent opacity-70 hover:opacity-100 hover:border-border'
              }`}
            >
              <List className="h-4 w-4 shrink-0" />
              Historial
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'puntos'}
              onClick={() => setActiveTab('puntos')}
              className={`inline-flex items-center gap-1.5 sm:gap-2 pb-3 px-2 sm:px-1 border-b-2 font-medium text-sm transition shrink-0 snap-start min-h-[44px] touch-manipulation ${
                activeTab === 'puntos'
                  ? 'border-primary text-primary'
                  : 'border-transparent opacity-70 hover:opacity-100 hover:border-border'
              }`}
            >
              <Database className="h-4 w-4 shrink-0" />
              Qdrant
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="grid gap-6">
          {activeTab === 'upload' && (
            <>
              <DocumentUpload token={token!} onUploadComplete={handleUploadComplete} />
              <Historial token={token!} refreshTrigger={refreshTrigger} />
            </>
          )}

          {activeTab === 'search' && <SearchBox token={token!} />}

          {activeTab === 'history' && <Historial token={token!} refreshTrigger={refreshTrigger} />}

          {activeTab === 'puntos' && <PuntosQdrant token={token!} />}
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
