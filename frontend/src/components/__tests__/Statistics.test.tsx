import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Statistics from '../Statistics';

describe('Statistics', () => {
  it('renders word count', () => {
    render(<Statistics text="Hello world from testing" />);

    expect(screen.getByText(/4/)).toBeInTheDocument(); // 4 words
  });

  it('renders character count', () => {
    render(<Statistics text="Hello" />);

    expect(screen.getByText(/5/)).toBeInTheDocument(); // 5 characters
  });

  it('handles empty text', () => {
    render(<Statistics text="" />);

    expect(screen.getByText(/0/)).toBeInTheDocument();
  });

  it('displays statistics labels', () => {
    render(<Statistics text="test" />);

    expect(screen.getByText(/words/i)).toBeInTheDocument();
    expect(screen.getByText(/characters/i)).toBeInTheDocument();
  });
});
