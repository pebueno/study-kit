import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer } from '../Footer';

describe('Footer', () => {
  it('renders footer text', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
  });

  it('renders copyright information', () => {
    render(<Footer />);

    const elements = screen.getAllByText(/StudyKit/i);
    expect(elements.length).toBeGreaterThan(0);
  });
});
