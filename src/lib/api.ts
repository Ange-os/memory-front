const API_URL = process.env.API_URL || 'http://localhost:8000/api';

function requireToken(token: string) {
  if (!token || token === 'null' || token === 'undefined') {
    throw new Error('Sesión inválida. Volvé a iniciar sesión.');
  }
}

interface LoginData {
  nombre_usuario: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  cliente_id: number;
  nombre: string;
  qdrant_collection: string;
}

export async function login(data: LoginData): Promise<TokenResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error al iniciar sesión' }));
    throw new Error(error.detail || 'Error al iniciar sesión');
  }

  return response.json();
}

export async function uploadDocumento(
  file: File,
  tipo: string,
  subcategoria: string,
  token: string
): Promise<{ mensaje: string; documento_id: number; estado: string }> {
  requireToken(token);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tipo', tipo);
  formData.append('subcategoria', subcategoria);

  const response = await fetch(`${API_URL}/documentos/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error al subir el documento' }));
    throw new Error(error.detail || 'Error al subir el documento');
  }

  return response.json();
}

export async function getHistorial(token: string): Promise<any[]> {
  requireToken(token);
  const response = await fetch(`${API_URL}/documentos/historial`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener el historial');
  }

  return response.json();
}

export async function buscarEnQdrant(
  query: string,
  token: string,
  limit: number = 10
): Promise<{ resultados: any[]; total: number }> {
  requireToken(token);
  const response = await fetch(`${API_URL}/search/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query, limit }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error al buscar' }));
    throw new Error(error.detail || 'Error al buscar');
  }

  return response.json();
}

export async function getColeccion(token: string): Promise<any[]> {
  requireToken(token);
  const response = await fetch(`${API_URL}/search/colecciones`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener la colección');
  }

  return response.json();
}

export async function buscarPuntosPayload(
  token: string,
  data: { q?: string; field?: string; limit?: number }
): Promise<{ resultados: any[]; total: number }> {
  requireToken(token);
  const response = await fetch(`${API_URL}/search/puntos/buscar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error al buscar puntos' }));
    throw new Error(error.detail || 'Error al buscar puntos');
  }

  return response.json();
}

export async function actualizarPunto(
  pointId: string,
  data: { texto?: string; tipo?: string; subcategoria?: string; metadata?: Record<string, any> },
  token: string
): Promise<{ success: boolean; message: string }> {
  requireToken(token);
  const response = await fetch(`${API_URL}/search/puntos/${pointId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error al actualizar punto' }));
    throw new Error(error.detail || 'Error al actualizar punto');
  }

  return response.json();
}

export async function eliminarPunto(
  pointId: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  requireToken(token);
  const response = await fetch(`${API_URL}/search/puntos/${pointId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error al eliminar punto' }));
    throw new Error(error.detail || 'Error al eliminar punto');
  }

  return response.json();
}

export async function actualizarBloqueQdrant(
  blockId: number,
  data: { content?: string; metadata?: Record<string, any> },
  token: string
): Promise<{ success: boolean; message: string; block_id: number; point_id: string }> {
  requireToken(token);
  const response = await fetch(`${API_URL}/search/bloques/${blockId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error al actualizar bloque' }));
    throw new Error(error.detail || 'Error al actualizar bloque');
  }

  return response.json();
}
