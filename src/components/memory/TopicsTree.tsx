'use client';

import { Subtopic, Topic } from '@/types/memory';

interface TopicsTreeProps {
  topics: Topic[];
  subtopicsByTopic: Record<number, Subtopic[]>;
  expandedTopics: Record<number, boolean>;
  selectedTopicId: number | null;
  selectedSubtopicId: number | null;
  onToggleTopic: (topicId: number) => void;
  onSelectTopic: (topic: Topic) => void;
  onSelectSubtopic: (subtopic: Subtopic) => void;
}

export default function TopicsTree({
  topics,
  subtopicsByTopic,
  expandedTopics,
  selectedTopicId,
  selectedSubtopicId,
  onToggleTopic,
  onSelectTopic,
  onSelectSubtopic,
}: TopicsTreeProps) {
  return (
    <aside className="bg-surface border border-border rounded-lg p-4">
      <h2 className="font-semibold mb-3">Temas</h2>

      {topics.length === 0 && <p className="text-sm opacity-70">No hay temas todavia.</p>}

      <div className="space-y-2">
        {topics.map((topic) => {
          const isExpanded = Boolean(expandedTopics[topic.id]);
          const topicSubtopics = subtopicsByTopic[topic.id] || [];
          const isTopicSelected = selectedTopicId === topic.id;

          return (
            <div key={topic.id} className="rounded border border-border">
              <div className="flex items-center gap-2 p-2">
                <button
                  type="button"
                  className="text-xs px-2 py-1 border border-border rounded"
                  onClick={() => onToggleTopic(topic.id)}
                  aria-label={isExpanded ? 'Colapsar tema' : 'Expandir tema'}
                >
                  {isExpanded ? 'v' : '>'}
                </button>
                <button
                  type="button"
                  className={`text-left flex-1 text-sm px-2 py-1 rounded ${
                    isTopicSelected ? 'bg-bg border border-border' : 'hover:bg-bg'
                  }`}
                  onClick={() => onSelectTopic(topic)}
                >
                  {topic.name}
                </button>
              </div>

              {isExpanded && (
                <div className="px-2 pb-2 space-y-1">
                  {topicSubtopics.length === 0 && (
                    <p className="text-xs opacity-70 px-2 py-1">Sin subtemas.</p>
                  )}
                  {topicSubtopics.map((subtopic) => (
                    <button
                      key={subtopic.id}
                      type="button"
                      onClick={() => onSelectSubtopic(subtopic)}
                      className={`block w-full text-left text-sm px-2 py-1 rounded border ${
                        selectedSubtopicId === subtopic.id
                          ? 'border-primary text-primary'
                          : 'border-border hover:bg-bg'
                      }`}
                    >
                      {subtopic.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
