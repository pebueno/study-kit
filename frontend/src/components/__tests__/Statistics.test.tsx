import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Statistics } from '../Statistics';

describe('Statistics', () => {
  it('renders word count', () => {
    const stats = { wordCount: 4, charCount: 24, sentenceCount: 1 };
    render(<Statistics stats={stats} />);

    expect(screen.getByText(/Words/i)).toBeInTheDocument();
    expect(screen.getByText(/24/)).toBeInTheDocument(); // char count
  });

  it('renders character count', () => {
    const stats = { wordCount: 1, charCount: 5, sentenceCount: 1 };
    render(<Statistics stats={stats} />);

    expect(screen.getByText(/5/)).toBeInTheDocument();
    expect(screen.getByText(/Characters/i)).toBeInTheDocument();
  });

  it('handles zero values', () => {
    const stats = { wordCount: 0, charCount: 0, sentenceCount: 0 };
    render(<Statistics stats={stats} />);

    expect(screen.getAllByText(/0/)).toHaveLength(3);
  });

  it('displays all statistics labels', () => {
    const stats = { wordCount: 10, charCount: 50, sentenceCount: 2 };
    render(<Statistics stats={stats} />);

    expect(screen.getByText(/Words/i)).toBeInTheDocument();
    expect(screen.getByText(/Characters/i)).toBeInTheDocument();
    expect(screen.getByText(/Sentences/i)).toBeInTheDocument();
  });
});
