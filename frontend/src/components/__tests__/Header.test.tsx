import { render, screen } from '@testing-library/react';
import { Header } from '../Header';
import { describe, it, expect } from 'vitest';
import { TooltipProvider } from '@/components/ui/tooltip';

describe('Header', () => {
  it('renders logo and title', () => {
    render(
      <TooltipProvider>
        <Header />
      </TooltipProvider>
    );
    expect(screen.getByText('StudyKit')).toBeInTheDocument();
    expect(screen.getByText('Your Complete Study Toolkit')).toBeInTheDocument();
  });

  it('renders navigation items', () => {
    render(
      <TooltipProvider>
        <Header />
      </TooltipProvider>
    );
    expect(screen.getByText('Grammar Checker')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });
});
