import { render, screen, fireEvent } from '@testing-library/react';
import { TextEditor } from '../TextEditor';
import { describe, it, expect, vi } from 'vitest';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn(),
  },
  writable: true,
});

describe('TextEditor', () => {
  it('renders text area and buttons', () => {
    render(
      <TooltipProvider>
        <TextEditor />
      </TooltipProvider>
    );
    expect(screen.getByPlaceholderText(/Paste or type your text here/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fix Grammar/i })).toBeInTheDocument();
  });

  it('updates text input', () => {
    render(
      <TooltipProvider>
        <TextEditor />
      </TooltipProvider>
    );
    const textarea = screen.getByPlaceholderText(/Paste or type your text here/i);
    fireEvent.change(textarea, { target: { value: 'Hello world' } });
    expect(textarea).toHaveValue('Hello world');
  });

  it('shows example text when example button is clicked', () => {
    render(
      <TooltipProvider>
        <>
          <Toaster />
          <TextEditor />
        </>
      </TooltipProvider>
    );
    // Find tooltip trigger for example
    const exampleBtn = screen.getByRole('button', { name: /example/i }); // Using accessible name
    fireEvent.click(exampleBtn);
    
    expect(screen.getByDisplayValue(/Their are many mistake/i)).toBeInTheDocument();
  });
});
