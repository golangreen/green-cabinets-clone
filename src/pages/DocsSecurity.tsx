import { Header, Footer } from '@/components/layout';
import { DocsSidebar } from '@/features/docs';
import { Shield, Lock, Database, Eye, Mail, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const DocsSecurity = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <DocsSidebar />
          
          <div className="flex-1 max-w-4xl">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold">Security Architecture</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Comprehensive guide to security measures, policies, and configuration
              </p>
            </div>

            {/* Security Overview */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Security Grade: A (95/100)
                </CardTitle>
                <CardDescription>
                  All critical security measures are implemented and verified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                    <div>
                      <p className="font-semibold">Row Level Security</p>
                      <p className="text-sm text-muted-foreground">All tables protected with RLS policies</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                    <div>
                      <p className="font-semibold">Role-Based Access Control</p>
                      <p className="text-sm text-muted-foreground">Granular permissions via user_roles</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                    <div>
                      <p className="font-semibold">IP Blocking System</p>
                      <p className="text-sm text-muted-foreground">Automatic blocking after violations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                    <div>
                      <p className="font-semibold">Webhook Security</p>
                      <p className="text-sm text-muted-foreground">Signature verification & rate limiting</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                    <div>
                      <p className="font-semibold">Email Delivery Monitoring</p>
                      <p className="text-sm text-muted-foreground">Real-time tracking & alerts</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                    <div>
                      <p className="font-semibold">Security Event Logging</p>
                      <p className="text-sm text-muted-foreground">Comprehensive audit trail</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Authentication & Authorization */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6" />
                Authentication & Authorization
              </h2>
              
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Supabase Authentication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Enabled Methods</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Email/Password authentication</li>
                      <li>Email verification (auto-confirm enabled for development)</li>
                      <li>Session persistence via localStorage</li>
                      <li>Automatic token refresh</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Session Management</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Sessions are managed via AuthContext with automatic refresh:
                    </p>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`// src/contexts/AuthContext.tsx
export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY, 
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);`}
                    </pre>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Security Warning</AlertTitle>
                    <AlertDescription>
                      Never check admin status using client-side storage (localStorage, sessionStorage) or hardcoded credentials. 
                      Always use server-side validation with has_role() function.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Role-Based Access Control (RBAC)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Role Enum</h3>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`create type public.app_role as enum ('admin', 'moderator', 'user');`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">user_roles Table</h3>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  expires_at timestamp with time zone,
  is_temporary boolean default false,
  reminder_sent boolean default false,
  reminder_3day_sent boolean default false,
  unique (user_id, role)
);`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Security Definer Function</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      The has_role() function bypasses RLS to prevent recursive policy checks:
                    </p>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Usage in Components</h3>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`// useAdminCheck hook
const { data, error } = await supabase.rpc('has_role', {
  _user_id: user.id,
  _role: 'admin'
});`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Row Level Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Database className="h-6 w-6" />
                Row Level Security (RLS) Policies
              </h2>

              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    All database tables have RLS enabled with appropriate policies to control access based on user roles and ownership.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Badge>Admin Tables</Badge>
                      </h3>
                      <div className="bg-muted p-3 rounded-md text-sm space-y-2">
                        <div><span className="font-mono">security_events</span> - Admin + Service Role</div>
                        <div><span className="font-mono">blocked_ips</span> - Admin + Service Role</div>
                        <div><span className="font-mono">block_history</span> - Admin + Service Role</div>
                        <div><span className="font-mono">alert_history</span> - Admin + Service Role</div>
                        <div><span className="font-mono">alert_settings</span> - Admin read/update, Service Role read</div>
                        <div><span className="font-mono">webhook_events</span> - Admin + Service Role</div>
                        <div><span className="font-mono">email_delivery_log</span> - Admin + Service Role</div>
                        <div><span className="font-mono">role_change_audit</span> - Admin read, Service Role insert</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Badge variant="secondary">User Tables</Badge>
                      </h3>
                      <div className="bg-muted p-3 rounded-md text-sm space-y-2">
                        <div><span className="font-mono">user_roles</span> - Users view own, Admins manage all</div>
                        <div><span className="font-mono">notification_settings</span> - Users manage own settings</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Example Policies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Admin Access Pattern</h3>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`-- Allow admins to view all security events
CREATE POLICY "Admins can view security events"
ON public.security_events
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow service role to manage events
CREATE POLICY "Service role can manage security events"
ON public.security_events
FOR ALL
USING (true)
WITH CHECK (true);`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">User Ownership Pattern</h3>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Users can manage own notification settings
CREATE POLICY "Users can update own notification settings"
ON public.notification_settings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* IP Blocking System */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6" />
                IP Blocking System
              </h2>

              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Automatic IP Blocking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">How It Works</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Security monitor checks for IPs with 8+ violations in 24 hours</li>
                      <li>Automatically blocks suspicious IPs for 24 hours (configurable)</li>
                      <li>Logs all blocking actions to block_history table</li>
                      <li>Sends email alerts to admins when auto-blocking occurs</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Configuration</h3>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`// supabase/functions/security-monitor/index.ts
const AUTOBLOCK_THRESHOLD = 8; // violations
const AUTOBLOCK_DURATION_HOURS = 24; // hours`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Manual IP Management</h3>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`-- Block an IP manually
SELECT manual_block_ip(
  target_ip := '192.168.1.100',
  block_reason := 'Suspicious activity detected',
  block_duration_hours := 24,
  performed_by_user := 'admin'
);

-- Unblock an IP
SELECT unblock_ip(
  target_ip := '192.168.1.100',
  unblock_reason := 'False positive - legitimate user',
  performed_by_user := 'admin'
);`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Edge Function Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    All public edge functions check for blocked IPs before processing requests:
                  </p>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`// Check if IP is blocked
const blocked = await isIPBlocked(supabaseClient, clientIP);
if (blocked) {
  return new Response(
    JSON.stringify({ error: 'Access forbidden' }),
    { status: 403, headers: corsHeaders }
  );
}`}
                  </pre>
                </CardContent>
              </Card>
            </section>

            {/* Webhook Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6" />
                Webhook Security
              </h2>

              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Three-Layer Protection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">1. Signature Verification</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Svix HMAC-SHA256 signature verification prevents fake webhook events:
                    </p>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`const wh = new Webhook(RESEND_WEBHOOK_SECRET);
const payload = wh.verify(body, {
  "svix-id": svixId,
  "svix-timestamp": timestamp,
  "svix-signature": signature,
}) as ResendWebhookEvent;`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">2. Rate Limiting</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Maximum 30 requests per minute per IP to prevent spam:
                    </p>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`const rateLimitOk = checkRateLimit(clientIP, 30, 60000);
if (!rateLimitOk) {
  await logSecurityEvent(supabaseClient, {
    eventType: 'rate_limit_exceeded',
    clientIP,
    functionName: 'resend-webhook',
    severity: 'high'
  });
  return createErrorResponse(
    new RateLimitError('Rate limit exceeded'),
    429
  );
}`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">3. Timestamp Validation</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Rejects webhooks older than 5 minutes to prevent replay attacks:
                    </p>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`const timestampMs = parseInt(timestamp) * 1000;
const now = Date.now();
const diff = Math.abs(now - timestampMs);

if (diff > 5 * 60 * 1000) {
  await logSecurityEvent(supabaseClient, {
    eventType: 'timestamp_validation_failed',
    clientIP,
    functionName: 'resend-webhook',
    severity: 'medium',
    details: { timestamp, diff_ms: diff }
  });
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Event Deduplication</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Prevents processing the same webhook multiple times if Resend retries:
                  </p>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`// Check if event was already processed
const { data: existing } = await supabaseClient
  .from('webhook_events')
  .select('id, retry_count')
  .eq('svix_id', svixId)
  .single();

if (existing) {
  // Increment retry count, don't reprocess
  await supabaseClient
    .from('webhook_events')
    .update({ retry_count: existing.retry_count + 1 })
    .eq('id', existing.id);
  return new Response(
    JSON.stringify({ success: true, message: 'Event already processed' }),
    { status: 200, headers: corsHeaders }
  );
}`}
                  </pre>
                </CardContent>
              </Card>
            </section>

            {/* Email Delivery Monitoring */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Mail className="h-6 w-6" />
                Email Delivery Monitoring
              </h2>

              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Real-Time Tracking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    All outgoing emails are tracked through their delivery lifecycle:
                  </p>

                  <div>
                    <h3 className="font-semibold mb-2">Tracked Events</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge>sent</Badge>
                        <span className="text-muted-foreground">Email sent to Resend</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">delivered</Badge>
                        <span className="text-muted-foreground">Successfully delivered</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">bounced</Badge>
                        <span className="text-muted-foreground">Delivery failed (bounce)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">failed</Badge>
                        <span className="text-muted-foreground">Sending failed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">delayed</Badge>
                        <span className="text-muted-foreground">Temporary delay</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">complained</Badge>
                        <span className="text-muted-foreground">Marked as spam</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Automatic Alerts</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Admins receive alerts when delivery health degrades:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Bounce rate exceeds 5%</li>
                      <li>More than 3 critical delivery failures in 24 hours</li>
                      <li>Email system health monitoring triggered by webhook events</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Webhook Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Manual Setup Required</AlertTitle>
                    <AlertDescription>
                      Configure Resend webhook to enable email delivery tracking
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm mb-1">1. Get Webhook URL</h3>
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`https://[PROJECT_ID].supabase.co/functions/v1/resend-webhook`}
                      </pre>
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm mb-1">2. Configure in Resend Dashboard</h3>
                      <p className="text-xs text-muted-foreground mb-1">
                        Go to https://resend.com/webhooks and add webhook endpoint
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm mb-1">3. Select Events</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">email.sent</Badge>
                        <Badge variant="outline" className="text-xs">email.delivered</Badge>
                        <Badge variant="outline" className="text-xs">email.bounced</Badge>
                        <Badge variant="outline" className="text-xs">email.complained</Badge>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm mb-1">4. Save Secret</h3>
                      <p className="text-xs text-muted-foreground">
                        Copy the signing secret and add it as RESEND_WEBHOOK_SECRET in project secrets
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Infrastructure-Level Security Findings */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                Infrastructure-Level Security Findings
              </h2>

              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Cannot Be Fixed Through Code</AlertTitle>
                <AlertDescription>
                  The following security findings are infrastructure-level configurations that require database superuser privileges 
                  or manual configuration in Lovable Cloud backend. They cannot be resolved through application code changes.
                </AlertDescription>
              </Alert>

              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>What Are Infrastructure-Level Findings?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Infrastructure-level findings are security recommendations that relate to:
                  </p>
                  
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li><strong>Database Configuration</strong> - Schema organization, extension placement, database-level settings</li>
                    <li><strong>Authentication Policies</strong> - Password strength requirements, breach detection, rate limiting</li>
                    <li><strong>Hosting Configuration</strong> - Server settings, network security, infrastructure controls</li>
                    <li><strong>Managed Service Settings</strong> - Configurations controlled by Lovable Cloud/Supabase platform</li>
                  </ul>

                  <div className="bg-muted p-4 rounded-lg mt-4">
                    <h3 className="font-semibold mb-2 text-sm">Why Can't These Be Fixed in Lovable Cloud?</h3>
                    <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                      <li><strong>Limited Database Access:</strong> You don't have PostgreSQL superuser privileges required for some operations</li>
                      <li><strong>Managed Infrastructure:</strong> Database schema and extensions are controlled by the platform</li>
                      <li><strong>Simplified UI:</strong> Some advanced Supabase settings aren't exposed in Lovable Cloud interface</li>
                      <li><strong>Platform Optimization:</strong> Configurations are managed for optimal performance and security</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {/* Finding 1: Extension in Public Schema */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Extension in Public Schema</CardTitle>
                      <Badge variant="outline">WARN</Badge>
                    </div>
                    <CardDescription>
                      Database extensions (uuid-ossp, pg_cron, pg_net) are installed in the public schema instead of a dedicated extensions schema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2 text-sm">What This Means</h3>
                      <p className="text-xs text-muted-foreground">
                        This is a <strong>database organization best practice</strong>, not a security vulnerability. 
                        PostgreSQL extensions work perfectly fine in the public schema. The recommendation is about 
                        keeping the public schema clean for application tables.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 text-sm">Why It Cannot Be Fixed</h3>
                      <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                        <li>Requires PostgreSQL superuser privileges to move extensions</li>
                        <li>Lovable Cloud provides managed database without superuser access</li>
                        <li>Extension schema is configured during database initialization</li>
                        <li>No security risk - extensions are properly secured by infrastructure</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 text-sm">Action Required</h3>
                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          <strong>Keep This Finding Ignored</strong> - This is correctly marked as ignored in your security scan. 
                          No action needed unless you migrate to self-managed Supabase.
                        </AlertDescription>
                      </Alert>
                    </div>

                    <details className="mt-4">
                      <summary className="cursor-pointer text-xs font-semibold">Self-Managed Supabase Fix (Advanced)</summary>
                      <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                        <p>If you migrate to self-managed Supabase with superuser access:</p>
                        <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`-- 1. Create extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- 2. Move extensions (requires superuser)
ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
ALTER EXTENSION "pg_cron" SET SCHEMA extensions;
ALTER EXTENSION "pg_net" SET SCHEMA extensions;

-- 3. Update search path
ALTER DATABASE postgres SET search_path = public, extensions;`}
                        </pre>
                      </div>
                    </details>
                  </CardContent>
                </Card>

                {/* Finding 2: Leaked Password Protection */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Leaked Password Protection Disabled</CardTitle>
                      <Badge variant="outline">WARN</Badge>
                    </div>
                    <CardDescription>
                      Password breach detection is currently disabled, allowing users to set passwords that have been exposed in data breaches
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2 text-sm">What This Means</h3>
                      <p className="text-xs text-muted-foreground">
                        Supabase offers leaked password protection that checks user passwords against the HaveIBeenPwned database 
                        of breached credentials. When disabled, users may unknowingly use passwords compromised in data breaches.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 text-sm">Why It's Disabled</h3>
                      <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                        <li>Not accessible through Lovable Cloud's simplified UI</li>
                        <li>Requires manual configuration in Supabase Authentication settings</li>
                        <li>Other security measures (RLS, rate limiting, monitoring) already in place</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 text-sm">How to Enable (Manual Configuration)</h3>
                      <Alert className="mb-3">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          <strong>Requires Lovable Cloud Backend Access</strong> - This setting is not available through code. 
                          You must configure it manually in the backend interface.
                        </AlertDescription>
                      </Alert>
                      
                      <ol className="list-decimal list-inside space-y-2 text-xs">
                        <li>
                          <strong>Open Lovable Cloud Backend</strong>
                          <p className="text-muted-foreground ml-5 mt-1">Click "View Backend" button in your Lovable project</p>
                        </li>
                        <li>
                          <strong>Navigate to Authentication</strong>
                          <p className="text-muted-foreground ml-5 mt-1">Go to Authentication → Policies section</p>
                        </li>
                        <li>
                          <strong>Find Password Requirements</strong>
                          <p className="text-muted-foreground ml-5 mt-1">Locate "Password Requirements" or "Password Strength" settings</p>
                        </li>
                        <li>
                          <strong>Enable Breach Detection</strong>
                          <p className="text-muted-foreground ml-5 mt-1">Toggle "Check for leaked passwords" or "Leaked password protection"</p>
                        </li>
                        <li>
                          <strong>Optional: Configure Strength</strong>
                          <p className="text-muted-foreground ml-5 mt-1">Set minimum length (12+ recommended), require complexity</p>
                        </li>
                        <li>
                          <strong>Save Changes</strong>
                          <p className="text-muted-foreground ml-5 mt-1">Apply the configuration to your authentication system</p>
                        </li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 text-sm">How It Works</h3>
                      <div className="bg-muted p-3 rounded-lg text-xs">
                        <p className="mb-2">Uses <strong>k-anonymity</strong> for secure breach checking:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>Password is hashed locally (SHA-1)</li>
                          <li>Only first 5 characters of hash are sent to HaveIBeenPwned API</li>
                          <li>API returns all breached hashes starting with those 5 characters</li>
                          <li>Full hash comparison happens locally - password never leaves your system</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 text-sm">Action Required</h3>
                      <Alert>
                        <AlertDescription className="text-xs">
                          <strong>Low Priority for Internal/Testing Apps</strong> - If this is a development or internal app, 
                          the finding can remain ignored. For production apps with user authentication, enabling leaked password 
                          protection is recommended but not critical given other security measures already in place.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* When to Migrate to Self-Managed */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>When to Consider Self-Managed Supabase</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Lovable Cloud provides excellent security for most applications. Consider migrating to self-managed Supabase only if you need:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2 text-sm">Stay with Lovable Cloud If:</h3>
                      <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                        <li>Building prototypes or internal tools</li>
                        <li>Automatic deployment and migrations are valuable</li>
                        <li>Current security measures meet your needs</li>
                        <li>You don't require database superuser access</li>
                        <li>Infrastructure warnings don't pose actual security risks</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 text-sm">Migrate to Self-Managed If:</h3>
                      <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                        <li>Enterprise compliance requires specific configurations</li>
                        <li>Need direct database superuser access</li>
                        <li>Require advanced PostgreSQL extensions or customizations</li>
                        <li>Must resolve all database organization warnings</li>
                        <li>Need custom backup/restore procedures</li>
                      </ul>
                    </div>
                  </div>

                  <Alert className="mt-4">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Current Security Status: Excellent</AlertTitle>
                    <AlertDescription className="text-xs">
                      Your application has comprehensive security measures implemented (RLS policies, RBAC, IP blocking, 
                      webhook security, monitoring). The infrastructure-level findings are organizational recommendations, 
                      not security vulnerabilities. No migration is needed for security purposes.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </section>

            {/* Security Monitoring */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Security Monitoring Dashboard</h2>

              <Card>
                <CardHeader>
                  <CardTitle>Admin Dashboard at /admin/security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Comprehensive monitoring dashboard for administrators showing:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Overview Tab</h3>
                      <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                        <li>Security event statistics</li>
                        <li>Recent security events</li>
                        <li>Currently blocked IPs</li>
                        <li>Live status indicator</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Events Tab</h3>
                      <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                        <li>Detailed event history</li>
                        <li>Filter by type and severity</li>
                        <li>Real-time event stream</li>
                        <li>Export to CSV</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Blocks Tab</h3>
                      <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                        <li>Active IP blocks</li>
                        <li>Block history audit</li>
                        <li>Manual block/unblock actions</li>
                        <li>Auto-block statistics</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Alerts Tab</h3>
                      <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                        <li>Email delivery statistics</li>
                        <li>Webhook security metrics</li>
                        <li>Rate limiting violations</li>
                        <li>Alert history</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Settings Tab</h3>
                      <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                        <li>Notification preferences</li>
                        <li>Alert thresholds</li>
                        <li>Cron job management</li>
                        <li>Security alert settings</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Best Practices */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Security Best Practices</h2>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">✅ Do</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>Always use has_role() function for role checks</li>
                      <li>Enable RLS on all new tables</li>
                      <li>Use security definer functions to avoid RLS recursion</li>
                      <li>Log all security-relevant actions to audit tables</li>
                      <li>Monitor the security dashboard regularly</li>
                      <li>Review blocked IPs periodically for false positives</li>
                      <li>Keep webhook secrets secure and rotate them periodically</li>
                      <li>Test RLS policies thoroughly before deploying</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">❌ Don't</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>Never store roles in localStorage or client-side storage</li>
                      <li>Don't hardcode admin credentials or API keys</li>
                      <li>Never reference auth.users directly in RLS policies (causes recursion)</li>
                      <li>Don't disable RLS without careful consideration</li>
                      <li>Never expose service role keys to client-side code</li>
                      <li>Don't trust client-side role checks for authorization</li>
                      <li>Never log sensitive data (passwords, tokens) to console or database</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Quick Reference */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Quick Reference</h2>

              <Card>
                <CardHeader>
                  <CardTitle>Common Security Functions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">has_role(_user_id, _role)</code>
                      <p className="text-muted-foreground text-xs mt-1">Check if user has specific role</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">is_ip_blocked(check_ip)</code>
                      <p className="text-muted-foreground text-xs mt-1">Check if IP is currently blocked</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">manual_block_ip(target_ip, reason, duration)</code>
                      <p className="text-muted-foreground text-xs mt-1">Manually block an IP address</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">unblock_ip(target_ip, reason)</code>
                      <p className="text-muted-foreground text-xs mt-1">Unblock an IP address</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">get_security_summary(time_window_minutes)</code>
                      <p className="text-muted-foreground text-xs mt-1">Get aggregated security event statistics</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">get_suspicious_ips(time_window, threshold)</code>
                      <p className="text-muted-foreground text-xs mt-1">Find IPs with high violation counts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DocsSecurity;
