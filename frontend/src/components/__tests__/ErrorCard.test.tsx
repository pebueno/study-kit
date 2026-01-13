import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorCard } from '../ErrorCard';

describe('ErrorCard', () => {
  it('renders error message', () => {
    const error = {
      type: 'grammar' as const,
      position: { start: 0, end: 5 },
      word: 'Helo',
      suggestion: 'Hello',
      message: 'Spelling error detected'
    };

    const mockOnFix = vi.fn();
    const mockOnHighlight = vi.fn();

    render(
      <ErrorCard
        error={error}
        isHighlighted={false}
        onFix={mockOnFix}
        onHighlight={mockOnHighlight}
      />
    );

    expect(screen.getByText('Spelling error detected')).toBeInTheDocument();
    expect(screen.getByText(/Hello/)).toBeInTheDocument();
  });

  it('displays error type', () => {
    const error = {
      type: 'spelling' as const,
      position: { start: 0, end: 5 },
      word: 'teh',
      suggestion: 'the',
      message: 'Misspelled word'
    };

    const mockOnFix = vi.fn();
    const mockOnHighlight = vi.fn();

    render(
      <ErrorCard
        error={error}
        isHighlighted={false}
        onFix={mockOnFix}
        onHighlight={mockOnHighlight}
      />
    );

    expect(screen.getByText(/Spelling/i)).toBeInTheDocument();
  });
});
