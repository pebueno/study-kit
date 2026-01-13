import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { NavLink } from '../NavLink';

describe('NavLink', () => {
  it('renders link text', () => {
    render(
      <BrowserRouter>
        <NavLink to="/">Home</NavLink>
      </BrowserRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders with correct href', () => {
    render(
      <BrowserRouter>
        <NavLink to="/about">About</NavLink>
      </BrowserRouter>
    );

    const link = screen.getByText('About');
    expect(link.closest('a')).toHaveAttribute('href', '/about');
  });

  it('renders multiple nav links', () => {
    render(
      <BrowserRouter>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/grammar">Grammar</NavLink>
        <NavLink to="/summarize">Summarize</NavLink>
      </BrowserRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Grammar')).toBeInTheDocument();
    expect(screen.getByText('Summarize')).toBeInTheDocument();
  });
});
