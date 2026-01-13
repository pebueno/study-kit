import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResultsPanel from '../ResultsPanel';

describe('ResultsPanel', () => {
  it('renders with grammar errors', () => {
    const errors = [
      {
        type: 'grammar',
        position: { start: 0, end: 5 },
        suggestion: 'correct',
        message: 'Grammar error'
      }
    ];

    render(<ResultsPanel errors={errors} summary="" synonyms={[]} />);

    expect(screen.getByText('Grammar error')).toBeInTheDocument();
  });

  it('renders with summary', () => {
    render(<ResultsPanel errors={[]} summary="This is a summary" synonyms={[]} />);

    expect(screen.getByText('This is a summary')).toBeInTheDocument();
  });

  it('renders with synonyms', () => {
    const synonyms = ['happy', 'glad', 'joyful'];

    render(<ResultsPanel errors={[]} summary="" synonyms={synonyms} />);

    expect(screen.getByText('happy')).toBeInTheDocument();
    expect(screen.getByText('glad')).toBeInTheDocument();
    expect(screen.getByText('joyful')).toBeInTheDocument();
  });

  it('handles empty results', () => {
    render(<ResultsPanel errors={[]} summary="" synonyms={[]} />);

    // Component should render without crashing
    expect(screen.getByTestId('results-panel') || screen.getByRole('region')).toBeDefined();
  });
});
