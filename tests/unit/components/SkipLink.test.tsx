import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SkipLink } from '@/components/accessibility/SkipLink';

describe('SkipLink', () => {
  it('should render skip link', () => {
    render(
      <BrowserRouter>
        <SkipLink />
      </BrowserRouter>
    );

    const link = screen.getByText('Skip to main content');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('should have sr-only class by default', () => {
    render(
      <BrowserRouter>
        <SkipLink />
      </BrowserRouter>
    );

    const link = screen.getByText('Skip to main content');
    expect(link).toHaveClass('sr-only');
  });

  it('should be keyboard focusable', () => {
    render(
      <BrowserRouter>
        <SkipLink />
      </BrowserRouter>
    );

    const link = screen.getByText('Skip to main content');
    link.focus();
    
    expect(link).toHaveFocus();
  });
});
