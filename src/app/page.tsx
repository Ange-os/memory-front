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
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4 min-w-0">
            <Logo />
            <p className="text-sm font-medium text-fg truncate">
              {cliente?.nombre ?? ''}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm font-medium bg-bg text-fg hover:bg-surface transition"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <nav className="-mb-px flex gap-4">
            <button
              onClick={() => setActiveTab('upload')}
              className={`inline-flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'upload'
                  ? 'border-primary text-primary'
                  : 'border-transparent opacity-70 hover:opacity-100 hover:border-border'
              }`}
            >
              <Upload className="h-4 w-4" />
              Cargar
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`inline-flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'search'
                  ? 'border-primary text-primary'
                  : 'border-transparent opacity-70 hover:opacity-100 hover:border-border'
              }`}
            >
              <Search className="h-4 w-4" />
              Buscar
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent opacity-70 hover:opacity-100 hover:border-border'
              }`}
            >
              <List className="h-4 w-4" />
              Historial
            </button>
            <button
              onClick={() => setActiveTab('puntos')}
              className={`inline-flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'puntos'
                  ? 'border-primary text-primary'
                  : 'border-transparent opacity-70 hover:opacity-100 hover:border-border'
              }`}
            >
              <Database className="h-4 w-4" />
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!token) {
    return <LoginForm />;
  }

  return <Dashboard />;
}
