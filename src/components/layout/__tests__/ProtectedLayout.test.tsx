import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedLayout from '../ProtectedLayout';

// Mock child components
vi.mock('../Header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock('../Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('../FeatureErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

// Mock ProtectedRoute to simply render children for testing
vi.mock('@/components/auth', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('ProtectedLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot with default props', () => {
      const { container } = renderWithRouter(
        <ProtectedLayout>
          <div>Protected Content</div>
        </ProtectedLayout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with custom container className', () => {
      const { container } = renderWithRouter(
        <ProtectedLayout containerClassName="max-w-4xl mx-auto py-12">
          <div>Custom Container Content</div>
        </ProtectedLayout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot without container', () => {
      const { container } = renderWithRouter(
        <ProtectedLayout withContainer={false}>
          <div>Full Width Content</div>
        </ProtectedLayout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with error boundary', () => {
      const { container } = renderWithRouter(
        <ProtectedLayout
          errorBoundary={{
            featureName: 'Test Feature',
            featureTag: 'test-feature',
            fallbackRoute: '/home',
          }}
        >
          <div>Content With Error Boundary</div>
        </ProtectedLayout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with all custom props', () => {
      const { container } = renderWithRouter(
        <ProtectedLayout
          containerClassName="container mx-auto max-w-6xl p-8"
          withContainer={true}
          errorBoundary={{
            featureName: 'User Dashboard',
            featureTag: 'dashboard',
            fallbackRoute: '/',
          }}
        >
          <div>
            <h1>Dashboard</h1>
            <p>User content</p>
          </div>
        </ProtectedLayout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Structure Tests', () => {
    it('should render all layout components', () => {
      const { getByTestId } = renderWithRouter(
        <ProtectedLayout>
          <div>Content</div>
        </ProtectedLayout>
      );

      expect(getByTestId('protected-route')).toBeInTheDocument();
      expect(getByTestId('header')).toBeInTheDocument();
      expect(getByTestId('footer')).toBeInTheDocument();
    });

    it('should wrap content in container by default', () => {
      const { container } = renderWithRouter(
        <ProtectedLayout>
          <div data-testid="content">Content</div>
        </ProtectedLayout>
      );

      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      expect(main?.querySelector('[data-testid="content"]')).toBeInTheDocument();
    });

    it('should not wrap content in container when disabled', () => {
      const { container } = renderWithRouter(
        <ProtectedLayout withContainer={false}>
          <div data-testid="content">Full Width Content</div>
        </ProtectedLayout>
      );

      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass('flex-1');
    });

    it('should apply custom container className', () => {
      const { container } = renderWithRouter(
        <ProtectedLayout containerClassName="custom-container">
          <div>Content</div>
        </ProtectedLayout>
      );

      const containerDiv = container.querySelector('.custom-container');
      expect(containerDiv).toBeInTheDocument();
    });

    it('should render error boundary when configured', () => {
      const { getByTestId } = renderWithRouter(
        <ProtectedLayout
          errorBoundary={{
            featureName: 'Test',
            featureTag: 'test',
            fallbackRoute: '/',
          }}
        >
          <div>Content</div>
        </ProtectedLayout>
      );

      expect(getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('should render children content', () => {
      const { getByText } = renderWithRouter(
        <ProtectedLayout>
          <div>Protected User Content</div>
        </ProtectedLayout>
      );

      expect(getByText('Protected User Content')).toBeInTheDocument();
    });

    it('should maintain layout structure with background', () => {
      const { container } = renderWithRouter(
        <ProtectedLayout>
          <div>Content</div>
        </ProtectedLayout>
      );

      const layoutDiv = container.querySelector('.min-h-screen.flex.flex-col.bg-background');
      expect(layoutDiv).toBeInTheDocument();
    });
  });
});
