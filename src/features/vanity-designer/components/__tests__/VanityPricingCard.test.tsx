import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { VanityPricingCard } from '../VanityPricingCard';

describe('VanityPricingCard', () => {
  it('renders pricing breakdown correctly', () => {
    const { container } = render(
      <VanityPricingCard
        basePrice={1200}
        wallPrice={150}
        floorPrice={75}
        totalPrice={1425}
      />
    );

    expect(container.textContent).toContain('Vanity');
    expect(container.textContent).toContain('Walls');
    expect(container.textContent).toContain('Flooring');
  });

  it('displays total price prominently', () => {
    const { container } = render(
      <VanityPricingCard
        basePrice={1200}
        wallPrice={150}
        floorPrice={75}
        totalPrice={1425}
      />
    );

    expect(container.textContent).toContain('Total');
  });

  it('hides zero prices', () => {
    const { container } = render(
      <VanityPricingCard
        basePrice={1200}
        wallPrice={0}
        floorPrice={0}
        totalPrice={1200}
      />
    );

    expect(container.textContent).not.toContain('Walls');
    expect(container.textContent).not.toContain('Flooring');
  });

  it('returns null when base price is zero', () => {
    const { container } = render(
      <VanityPricingCard
        basePrice={0}
        wallPrice={0}
        floorPrice={0}
        totalPrice={0}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
