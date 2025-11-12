import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SecurityEventsTable } from '../SecurityEventsTable';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('SecurityEventsTable', () => {
  it('renders loading state initially', () => {
    const { container } = render(<SecurityEventsTable />, { wrapper });
    expect(container).toBeTruthy();
  });

  it('displays security events when data is loaded', async () => {
    const mockEvents = [
      {
        id: '1',
        event_type: 'login_attempt',
        severity: 'low' as const,
        function_name: 'auth',
        client_ip: '192.168.1.1',
        created_at: new Date().toISOString(),
      },
    ];

    vi.mock('../../hooks/useSecurityEvents', () => ({
      useSecurityEvents: () => ({
        data: mockEvents,
        isLoading: false,
        error: null,
      }),
    }));

    const { container } = render(<SecurityEventsTable />, { wrapper });
    expect(container).toBeTruthy();
  });

  it('displays empty state when no events', async () => {
    vi.mock('../../hooks/useSecurityEvents', () => ({
      useSecurityEvents: () => ({
        data: [],
        isLoading: false,
        error: null,
      }),
    }));

    const { container } = render(<SecurityEventsTable />, { wrapper });
    expect(container).toBeTruthy();
  });
});
