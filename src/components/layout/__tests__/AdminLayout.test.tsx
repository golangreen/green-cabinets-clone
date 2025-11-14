import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminLayout from '../AdminLayout';

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

// Mock AdminRoute to simply render children for testing
vi.mock('@/components/auth', () => ({
  AdminRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="admin-route">{children}</div>
  ),
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot with default props', () => {
      const { container } = renderWithRouter(
        <AdminLayout>
          <div>Admin Content</div>
        </AdminLayout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with custom container className', () => {
      const { container } = renderWithRouter(
        <AdminLayout containerClassName="max-w-7xl mx-auto px-6 py-10">
          <div>Custom Admin Container</div>
        </AdminLayout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot without container', () => {
      const { container } = renderWithRouter(
        <AdminLayout withContainer={false}>
          <div>Full Width Dashboard</div>
        </AdminLayout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with error boundary', () => {
      const { container } = renderWithRouter(
        <AdminLayout
          errorBoundary={{
            featureName: 'Admin Security',
            featureTag: 'admin-security',
            fallbackRoute: '/admin',
          }}
        >
          <div>Security Dashboard</div>
        </AdminLayout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with all custom props', () => {
      const { container } = renderWithRouter(
        <AdminLayout
          containerClassName="container mx-auto px-8 py-12"
          withContainer={true}
          errorBoundary={{
            featureName: 'User Management',
            featureTag: 'admin-users',
            fallbackRoute: '/admin/dashboard',
          }}
        >
          <div>
            <h1>User Management</h1>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
            </table>
          </div>
        </AdminLayout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with dashboard layout', () => {
      const { container } = renderWithRouter(
        <AdminLayout
          containerClassName="container mx-auto px-4 py-8"
          errorBoundary={{
            featureName: 'Performance Dashboard',
            featureTag: 'admin-performance',
            fallbackRoute: '/admin/security',
          }}
        >
          <div className="grid grid-cols-3 gap-6">
            <div>Metric 1</div>
            <div>Metric 2</div>
            <div>Metric 3</div>
          </div>
        </AdminLayout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Structure Tests', () => {
    it('should render all layout components', () => {
      const { getByTestId } = renderWithRouter(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      expect(getByTestId('admin-route')).toBeInTheDocument();
      expect(getByTestId('header')).toBeInTheDocument();
      expect(getByTestId('footer')).toBeInTheDocument();
    });

    it('should wrap content in container by default', () => {
      const { container } = renderWithRouter(
        <AdminLayout>
          <div data-testid="content">Admin Content</div>
        </AdminLayout>
      );

      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      expect(main?.querySelector('[data-testid="content"]')).toBeInTheDocument();
    });

    it('should not wrap content in container when disabled', () => {
      const { container } = renderWithRouter(
        <AdminLayout withContainer={false}>
          <div data-testid="content">Full Width Dashboard</div>
        </AdminLayout>
      );

      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass('flex-1');
      expect(main?.firstChild).toHaveAttribute('data-testid', 'content');
    });

    it('should apply default container className', () => {
      const { container } = renderWithRouter(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      const containerDiv = container.querySelector('.container.mx-auto.px-4.py-8');
      expect(containerDiv).toBeInTheDocument();
    });

    it('should apply custom container className', () => {
      const { container } = renderWithRouter(
        <AdminLayout containerClassName="custom-admin-container">
          <div>Content</div>
        </AdminLayout>
      );

      const containerDiv = container.querySelector('.custom-admin-container');
      expect(containerDiv).toBeInTheDocument();
    });

    it('should render error boundary when configured', () => {
      const { getByTestId } = renderWithRouter(
        <AdminLayout
          errorBoundary={{
            featureName: 'Test Admin Feature',
            featureTag: 'test-admin',
            fallbackRoute: '/admin',
          }}
        >
          <div>Content</div>
        </AdminLayout>
      );

      expect(getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('should render children content', () => {
      const { getByText } = renderWithRouter(
        <AdminLayout>
          <div>Admin Dashboard Content</div>
        </AdminLayout>
      );

      expect(getByText('Admin Dashboard Content')).toBeInTheDocument();
    });

    it('should maintain admin layout structure with background', () => {
      const { container } = renderWithRouter(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      const layoutDiv = container.querySelector('.min-h-screen.flex.flex-col.bg-background');
      expect(layoutDiv).toBeInTheDocument();
    });

    it('should handle complex nested content', () => {
      const { getByText } = renderWithRouter(
        <AdminLayout>
          <div>
            <header>
              <h1>Dashboard</h1>
            </header>
            <section>
              <p>Content Section</p>
            </section>
          </div>
        </AdminLayout>
      );

      expect(getByText('Dashboard')).toBeInTheDocument();
      expect(getByText('Content Section')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Integration', () => {
    it('should pass error boundary without configuration', () => {
      const { queryByTestId } = renderWithRouter(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      );

      expect(queryByTestId('error-boundary')).not.toBeInTheDocument();
    });

    it('should wrap in error boundary when provided', () => {
      const { getByTestId } = renderWithRouter(
        <AdminLayout
          errorBoundary={{
            featureName: 'Test',
            featureTag: 'test',
            fallbackRoute: '/',
          }}
        >
          <div>Content</div>
        </AdminLayout>
      );

      expect(getByTestId('error-boundary')).toBeInTheDocument();
    });
  });
});
