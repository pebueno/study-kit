import { AlertCircle, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';
import { CheckResult, GrammarError } from '@/types/grammar';
import { ErrorCard } from './ErrorCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResultsPanelProps {
  result: CheckResult;
  highlightedError: GrammarError | null;
  onFixError: (error: GrammarError) => void;
  onHighlightError: (error: GrammarError) => void;
}

export function ResultsPanel({
  result,
  highlightedError,
  onFixError,
  onHighlightError,
}: ResultsPanelProps) {
  const { stats, errors } = result;
  const totalErrors = stats.spellingErrors + stats.grammarErrors + stats.styleErrors;

  const summaryItems = [
    {
      label: 'Spelling',
      count: stats.spellingErrors,
      icon: AlertCircle,
      colorClass: 'text-error-spelling',
      bgClass: 'bg-error-spelling/10',
    },
    {
      label: 'Grammar',
      count: stats.grammarErrors,
      icon: AlertTriangle,
      colorClass: 'text-error-grammar',
      bgClass: 'bg-error-grammar/10',
    },
    {
      label: 'Style',
      count: stats.styleErrors,
      icon: Lightbulb,
      colorClass: 'text-error-style',
      bgClass: 'bg-error-style/10',
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Summary Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">Analysis Results</h2>
          {totalErrors === 0 ? (
            <span className="flex items-center gap-1 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              Perfect!
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              {totalErrors} issue{totalErrors !== 1 ? 's' : ''} found
            </span>
          )}
        </div>

        {/* Error Summary */}
        <div className="grid grid-cols-3 gap-2">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className={`p-3 rounded-lg ${item.bgClass} text-center`}
            >
              <item.icon
                className={`h-5 w-5 ${item.colorClass} mx-auto mb-1`}
                aria-hidden="true"
              />
              <div className={`text-lg font-bold ${item.colorClass}`}>
                {item.count}
              </div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Error List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {errors.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-1">No Issues Found!</h3>
              <p className="text-sm text-muted-foreground">
                Your text looks great. Keep up the good work!
              </p>
            </div>
          ) : (
            errors.map((error) => (
              <ErrorCard
                key={error.id}
                error={error}
                isHighlighted={highlightedError?.id === error.id}
                onFix={onFixError}
                onHighlight={onHighlightError}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
