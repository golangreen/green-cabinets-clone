import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { LiveRegion } from '@/components/accessibility/LiveRegion';

describe('LiveRegion', () => {
  it('should render with polite priority by default', () => {
    const { container } = render(<LiveRegion message="Test message" />);
    const region = container.querySelector('[role="status"]');
    
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-atomic', 'true');
  });

  it('should render with assertive priority when specified', () => {
    const { container } = render(
      <LiveRegion message="Urgent message" priority="assertive" />
    );
    const region = container.querySelector('[role="status"]');
    
    expect(region).toHaveAttribute('aria-live', 'assertive');
  });

  it('should be screen reader only', () => {
    const { container } = render(<LiveRegion message="Test" />);
    const region = container.querySelector('[role="status"]');
    
    expect(region).toHaveClass('sr-only');
  });

  it('should update message content', () => {
    vi.useFakeTimers();
    
    const { container, rerender } = render(<LiveRegion message="First message" />);
    const region = container.querySelector('[role="status"]');
    
    rerender(<LiveRegion message="Second message" />);
    
    vi.advanceTimersByTime(150);
    
    expect(region?.textContent).toBe('Second message');
    
    vi.useRealTimers();
  });
});
