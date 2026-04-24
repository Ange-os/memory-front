import { Subtopic, Topic } from '@/types/memory';

interface SelectionInfoProps {
  selectedTopic: Topic | null;
  selectedSubtopic: Subtopic | null;
}

export default function SelectionInfo({ selectedTopic, selectedSubtopic }: SelectionInfoProps) {
  return (
    <section className="bg-surface border border-border rounded-lg p-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide opacity-70">Tema</p>
          <p className="text-sm font-medium">{selectedTopic?.name || '-'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide opacity-70">Subtema</p>
          <p className="text-sm font-medium">{selectedSubtopic?.name || '-'}</p>
        </div>
      </div>
    </section>
  );
}
