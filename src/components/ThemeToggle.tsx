'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Mode = 'light' | 'dark';

function applyMode(mode: Mode) {
  const root = document.documentElement;
  if (mode === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      setMode(stored);
      applyMode(stored);
    } else {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
      const initial: Mode = prefersDark ? 'dark' : 'light';
      setMode(initial);
      applyMode(initial);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('theme', mode);
    applyMode(mode);
  }, [mode, mounted]);

  const toggle = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center justify-center p-2 rounded-md border border-border bg-surface text-fg hover:opacity-90 transition shrink-0"
      title={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      aria-label={mode === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      {mode === 'light' ? (
        <Sun className="h-5 w-5" aria-hidden />
      ) : (
        <Moon className="h-5 w-5" aria-hidden />
      )}
    </button>
  );
}
