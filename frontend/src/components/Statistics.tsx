import { FileText, Type, Hash } from 'lucide-react';
import { TextStats } from '@/types/grammar';

interface StatisticsProps {
  stats: TextStats;
}

export function Statistics({ stats }: StatisticsProps) {
  const statItems = [
    { label: 'Words', value: stats.wordCount, icon: FileText },
    { label: 'Characters', value: stats.charCount, icon: Type },
    { label: 'Sentences', value: stats.sentenceCount, icon: Hash },
  ];

  return (
    <div className="flex flex-wrap gap-4 text-sm" role="status" aria-live="polite">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <item.icon className="h-4 w-4" aria-hidden="true" />
          <span>
            <span className="font-medium text-foreground">{item.value}</span>{' '}
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
