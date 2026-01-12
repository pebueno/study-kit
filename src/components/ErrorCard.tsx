import { AlertCircle, AlertTriangle, Lightbulb, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GrammarError, ErrorType } from '@/types/grammar';
import { cn } from '@/lib/utils';

interface ErrorCardProps {
  error: GrammarError;
  isHighlighted: boolean;
  onFix: (error: GrammarError) => void;
  onHighlight: (error: GrammarError) => void;
}

const errorConfig: Record<ErrorType, {
  icon: typeof AlertCircle;
  label: string;
  colorClass: string;
  bgClass: string;
}> = {
  spelling: {
    icon: AlertCircle,
    label: 'Spelling',
    colorClass: 'text-error-spelling',
    bgClass: 'bg-error-spelling/10',
  },
  grammar: {
    icon: AlertTriangle,
    label: 'Grammar',
    colorClass: 'text-error-grammar',
    bgClass: 'bg-error-grammar/10',
  },
  style: {
    icon: Lightbulb,
    label: 'Style',
    colorClass: 'text-error-style',
    bgClass: 'bg-error-style/10',
  },
};

export function ErrorCard({ error, isHighlighted, onFix, onHighlight }: ErrorCardProps) {
  const config = errorConfig[error.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-soft',
        isHighlighted ? 'border-primary shadow-glow bg-primary/5' : 'border-border bg-card',
      )}
      onClick={() => onHighlight(error)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onHighlight(error)}
      aria-label={`${config.label} error: ${error.message}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={cn('p-2 rounded-lg', config.bgClass)}>
            <Icon className={cn('h-4 w-4', config.colorClass)} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('text-xs font-medium', config.colorClass)}>
                {config.label}
              </span>
            </div>
            <p className="text-sm text-foreground font-medium mb-1 truncate">
              "{error.word}"
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {error.message}
            </p>
            {error.suggestion && (
              <p className="text-xs text-success mt-2 flex items-center gap-1">
                <span className="font-medium">Suggestion:</span> {error.suggestion}
              </p>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onFix(error);
          }}
          className="shrink-0 gap-1 hover:bg-success hover:text-success-foreground transition-colors"
          aria-label={`Fix: replace "${error.word}" with "${error.suggestion}"`}
        >
          <Check className="h-3 w-3" />
          Fix
        </Button>
      </div>
    </div>
  );
}
