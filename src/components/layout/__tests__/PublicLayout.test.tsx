import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PublicLayout from '../PublicLayout';

// Mock child components
vi.mock('../Header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock('../Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('../OfflineBanner', () => ({
  default: () => <div data-testid="offline-banner">Offline Banner</div>,
}));

vi.mock('../SyncStatusIndicator', () => ({
  default: () => <div data-testid="sync-indicator">Sync Indicator</div>,
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('PublicLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot with default props', () => {
      const { container } = renderWithRouter(
        <PublicLayout>
          <div>Test Content</div>
        </PublicLayout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with custom className', () => {
      const { container } = renderWithRouter(
        <PublicLayout className="custom-class bg-gradient">
          <div>Custom Styled Content</div>
        </PublicLayout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot without offline indicators', () => {
      const { container } = renderWithRouter(
        <PublicLayout showOfflineIndicators={false}>
          <div>Content Without Indicators</div>
        </PublicLayout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with complex children', () => {
      const { container } = renderWithRouter(
        <PublicLayout>
          <section>
            <h1>Hero Section</h1>
            <p>Description</p>
          </section>
          <section>
            <h2>Features</h2>
            <ul>
              <li>Feature 1</li>
              <li>Feature 2</li>
            </ul>
          </section>
        </PublicLayout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Structure Tests', () => {
    it('should render all layout components by default', () => {
      const { getByTestId } = renderWithRouter(
        <PublicLayout>
          <div>Content</div>
        </PublicLayout>
      );

      expect(getByTestId('offline-banner')).toBeInTheDocument();
      expect(getByTestId('sync-indicator')).toBeInTheDocument();
      expect(getByTestId('header')).toBeInTheDocument();
      expect(getByTestId('footer')).toBeInTheDocument();
    });

    it('should not render offline indicators when disabled', () => {
      const { queryByTestId } = renderWithRouter(
        <PublicLayout showOfflineIndicators={false}>
          <div>Content</div>
        </PublicLayout>
      );

      expect(queryByTestId('offline-banner')).not.toBeInTheDocument();
      expect(queryByTestId('sync-indicator')).not.toBeInTheDocument();
    });

    it('should apply custom className to root div', () => {
      const { container } = renderWithRouter(
        <PublicLayout className="test-class">
          <div>Content</div>
        </PublicLayout>
      );

      expect(container.firstChild).toHaveClass('test-class');
    });

    it('should render children content', () => {
      const { getByText } = renderWithRouter(
        <PublicLayout>
          <div>Test Content</div>
        </PublicLayout>
      );

      expect(getByText('Test Content')).toBeInTheDocument();
    });
  });
});
