import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Supabase API endpoints
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      user: { id: 'mock-user-id', email: 'test@example.com' },
    });
  }),

  http.get('*/rest/v1/security_events', () => {
    return HttpResponse.json([
      {
        id: '1',
        event_type: 'login_attempt',
        severity: 'low',
        function_name: 'auth',
        client_ip: '192.168.1.1',
        created_at: new Date().toISOString(),
      },
    ]);
  }),

  http.get('*/rest/v1/blocked_ips', () => {
    return HttpResponse.json([
      {
        id: '1',
        ip_address: '192.168.1.100',
        reason: 'Too many failed attempts',
        violation_count: 5,
        auto_blocked: true,
        blocked_at: new Date().toISOString(),
        blocked_until: new Date(Date.now() + 3600000).toISOString(),
        created_at: new Date().toISOString(),
      },
    ]);
  }),
];
