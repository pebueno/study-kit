import { Fragment } from 'react';
import { GrammarError, ErrorType } from '@/types/grammar';
import { cn } from '@/lib/utils';

interface HighlightedTextProps {
  text: string;
  errors: GrammarError[];
  highlightedError: GrammarError | null;
  onErrorClick: (error: GrammarError) => void;
}

const errorClassMap: Record<ErrorType, string> = {
  spelling: 'error-spelling',
  grammar: 'error-grammar',
  style: 'error-style',
};

export function HighlightedText({
  text,
  errors,
  highlightedError,
  onErrorClick,
}: HighlightedTextProps) {
  if (errors.length === 0) {
    return <span>{text}</span>;
  }

  // Sort errors by start index
  const sortedErrors = [...errors].sort((a, b) => a.startIndex - b.startIndex);

  const segments: JSX.Element[] = [];
  let lastIndex = 0;

  sortedErrors.forEach((error, idx) => {
    // Add text before this error
    if (error.startIndex > lastIndex) {
      segments.push(
        <span key={`text-${idx}`}>
          {text.slice(lastIndex, error.startIndex)}
        </span>
      );
    }

    // Add the error span
    const isHighlighted = highlightedError?.id === error.id;
    segments.push(
      <span
        key={error.id}
        className={cn(
          errorClassMap[error.type],
          'cursor-pointer transition-all duration-200 rounded px-0.5',
          isHighlighted && 'bg-primary/20 ring-2 ring-primary ring-offset-1'
        )}
        onClick={() => onErrorClick(error)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onErrorClick(error)}
        aria-label={`${error.type} error: ${error.word}. Click for suggestions.`}
      >
        {text.slice(error.startIndex, error.endIndex)}
      </span>
    );

    lastIndex = error.endIndex;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push(
      <span key="text-end">{text.slice(lastIndex)}</span>
    );
  }

  return <>{segments}</>;
}
