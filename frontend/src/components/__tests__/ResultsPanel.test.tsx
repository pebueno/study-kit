import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ResultsPanel } from '../ResultsPanel';

describe('ResultsPanel', () => {
  it('renders with grammar errors', () => {
    const errors = [
      {
        type: 'grammar' as const,
        position: { start: 0, end: 5 },
        word: 'wrng',
        suggestion: 'wrong',
        message: 'Grammar error'
      }
    ];

    const result = {
        errors,
        stats: { spellingErrors: 0, grammarErrors: 1, styleErrors: 0 }
    };
    const { container } = render(
        <ResultsPanel 
            result={result as any} 
            highlightedError={null}
            onFixError={() => {}}
            onHighlightError={() => {}}
        />
    );
    expect(container).toBeTruthy();
  });

  it('renders with empty errors', () => {
    const result = {
        errors: [],
        stats: { spellingErrors: 0, grammarErrors: 0, styleErrors: 0 }
    };
    const { container } = render(
        <ResultsPanel 
            result={result as any} 
            highlightedError={null}
            onFixError={() => {}}
            onHighlightError={() => {}}
        />
    );
    expect(container).toBeTruthy();
  });

  it('renders multiple errors', () => {
    const errors = [
      {
        id: '1',
        type: 'spelling' as const,
        position: { start: 0, end: 3 },
        word: 'teh',
        suggestion: 'the',
        message: 'Spelling mistake'
      },
      {
        id: '2',
        type: 'grammar' as const,
        position: { start: 10, end: 15 },
        word: 'goed',
        suggestion: 'went',
        message: 'Grammar error'
      }
    ];
    
    const result = {
        errors,
        stats: { spellingErrors: 1, grammarErrors: 1, styleErrors: 0 }
    };

    const { container } = render(
        <ResultsPanel 
            result={result as any} 
            highlightedError={null}
            onFixError={() => {}}
            onHighlightError={() => {}}
        />
    );
    expect(container).toBeTruthy();
  });
});
