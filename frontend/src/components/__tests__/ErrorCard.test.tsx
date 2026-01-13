import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorCard from '../ErrorCard';

describe('ErrorCard', () => {
  it('renders error message', () => {
    const error = {
      type: 'grammar',
      position: { start: 0, end: 5 },
      suggestion: 'Hello',
      message: 'Spelling error detected'
    };

    render(<ErrorCard error={error} />);

    expect(screen.getByText('Spelling error detected')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('displays error type', () => {
    const error = {
      type: 'spelling',
      position: { start: 0, end: 5 },
      suggestion: 'correct',
      message: 'Misspelled word'
    };

    render(<ErrorCard error={error} />);

    expect(screen.getByText(/spelling/i)).toBeInTheDocument();
  });
});
