export interface Topic {
  id: number;
  name: string;
  description: string | null;
}

export interface Subtopic {
  id: number;
  topic_id: number;
  name: string;
  description: string | null;
  order_index: number;
}

export interface Block {
  id: number;
  subtopic_id: number;
  title: string;
  content: string;
  content_type: string;
  order_index: number;
  version: number;
}

export interface ExportPayload {
  topics: Array<{
    name: string;
    description: string | null;
    subtopics: Array<{
      name: string;
      description: string | null;
      blocks: Array<{
        id: number;
        title: string;
        content: string;
        type: string;
      }>;
    }>;
  }>;
  exportedAt: string;
}
