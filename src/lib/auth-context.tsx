'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ClienteInfo {
  cliente_id: number;
  nombre: string;
  email?: string;
  qdrant_collection: string;
}

interface AuthContextType {
  token: string | null;
  cliente: ClienteInfo | null;
  login: (token: string, cliente: ClienteInfo) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [cliente, setCliente] = useState<ClienteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar datos guardados en localStorage
    const storedToken = localStorage.getItem('token');
    const storedCliente = localStorage.getItem('cliente');

    const tokenValida =
      storedToken &&
      storedToken !== 'null' &&
      storedToken !== 'undefined' &&
      storedToken.trim().length > 0;

    if (tokenValida && storedCliente) {
      setToken(storedToken);
      try {
        setCliente(JSON.parse(storedCliente));
      } catch {
        localStorage.removeItem('cliente');
      }
    } else {
      // Evitar quedar "logueado" con un token inválido en storage
      if (storedToken) localStorage.removeItem('token');
      if (storedCliente) localStorage.removeItem('cliente');
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, clienteInfo: ClienteInfo) => {
    setToken(newToken);
    setCliente(clienteInfo);
    localStorage.setItem('token', newToken);
    localStorage.setItem('cliente', JSON.stringify(clienteInfo));
  };

  const logout = () => {
    setToken(null);
    setCliente(null);
    localStorage.removeItem('token');
    localStorage.removeItem('cliente');
  };

  return (
    <AuthContext.Provider value={{ token, cliente, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
