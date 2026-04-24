import { Block, ExportPayload, Subtopic, Topic } from '@/types/memory';

const MEMORY_API_URL = process.env.NEXT_PUBLIC_MEMORY_API_URL?.replace(/\/+$/, '') || '';
const MEMORY_API_PREFIX = process.env.NEXT_PUBLIC_MEMORY_API_PREFIX || '/api/memory';

function authHeaders(token: string): HeadersInit {
  if (!token || token === 'null' || token === 'undefined') {
    throw new Error('Sesion invalida. Volve a iniciar sesion.');
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  if (!MEMORY_API_URL) {
    throw new Error(
      'Falta configurar NEXT_PUBLIC_MEMORY_API_URL en frontend/.env (por ejemplo https://api-memory.xia.ar)'
    );
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    Object.assign(headers, authHeaders(token));
  }

  const url = `${MEMORY_API_URL}${MEMORY_API_PREFIX}${path}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const detail =
      (errorBody as { detail?: string; error?: string }).detail ||
      (errorBody as { detail?: string; error?: string }).error ||
      `Error de API (${response.status}) en ${url}`;
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export const memoryApi = {
  getTopics(token: string) {
    return request<Topic[]>('/topics', { method: 'GET' }, token);
  },

  createTopic(token: string, payload: { name: string; description?: string }) {
    return request<Topic>(
      '/topics',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token
    );
  },

  deleteTopic(token: string, topicId: number) {
    return request<{ success: boolean }>(`/topics/${topicId}`, { method: 'DELETE' }, token);
  },

  getSubtopics(token: string, topicId: number) {
    return request<Subtopic[]>(`/topics/${topicId}/subtopics`, { method: 'GET' }, token);
  },

  createSubtopic(
    token: string,
    payload: { topic_id: number; name: string; description?: string }
  ) {
    return request<Subtopic>(
      '/subtopics',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token
    );
  },

  deleteSubtopic(token: string, subtopicId: number) {
    return request<{ success: boolean }>(`/subtopics/${subtopicId}`, { method: 'DELETE' }, token);
  },

  getBlocks(token: string, subtopicId: number) {
    return request<Block[]>(`/subtopics/${subtopicId}/content`, { method: 'GET' }, token);
  },

  createBlock(token: string, payload: { subtopic_id: number; title?: string; content?: string }) {
    return request<Block>(
      '/content',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token
    );
  },

  updateBlock(
    token: string,
    blockId: number,
    payload: Partial<Pick<Block, 'title' | 'content' | 'content_type' | 'order_index'>>
  ) {
    return request<{ success: boolean; version: number }>(
      `/content/${blockId}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      token
    );
  },

  deleteBlock(token: string, blockId: number) {
    return request<{ success: boolean }>(`/content/${blockId}`, { method: 'DELETE' }, token);
  },

  exportJson(token: string) {
    return request<ExportPayload>('/export/json', { method: 'GET' }, token);
  },
};
