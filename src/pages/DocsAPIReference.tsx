import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocsSidebar } from "@/features/docs";
import Header from "@/components/layout/Header";
import { Code, Lock, Shield, Mail, ShoppingCart, AlertTriangle } from "lucide-react";

export default function DocsAPIReference() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          <DocsSidebar />
          
          <main id="main-content" className="flex-1">
            <div className="max-w-4xl">
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">API Reference</h1>
                <p className="text-muted-foreground">
                  Complete reference for all edge function endpoints, parameters, and responses.
                </p>
              </div>

              <Tabs defaultValue="quote" className="space-y-8">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                  <TabsTrigger value="quote">Quote</TabsTrigger>
                  <TabsTrigger value="vanity">Vanity</TabsTrigger>
                  <TabsTrigger value="checkout">Checkout</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                </TabsList>

                {/* Quote Endpoints */}
                <TabsContent value="quote" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Code className="h-5 w-5 text-primary" />
                          <CardTitle>POST /send-quote-request</CardTitle>
                        </div>
                        <Badge>Public</Badge>
                      </div>
                      <CardDescription>Submit a customer quote request</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Request Body</h3>
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "name": "string (required)",
  "email": "string (required)",
  "phone": "string (required)", 
  "message": "string (optional)",
  "pdfData": "string (optional, base64)",
  "recaptchaToken": "string (required)"
}`}
                        </pre>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Response (200 OK)</h3>
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "message": "Quote request sent successfully"
}`}
                        </pre>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Security Features</h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          <li>Rate limiting: 10 requests per 10 minutes per IP</li>
                          <li>reCAPTCHA v3 verification</li>
                          <li>Input validation with Zod schemas</li>
                          <li>XSS sanitization</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Vanity Endpoints */}
                <TabsContent value="vanity" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-5 w-5 text-primary" />
                          <CardTitle>POST /email-vanity-config</CardTitle>
                        </div>
                        <Badge variant="secondary">
                          <Lock className="h-3 w-3 mr-1" />
                          Auth Required
                        </Badge>
                      </div>
                      <CardDescription>Email vanity designer configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Authentication</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Requires either service role key or admin user JWT token:
                        </p>
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`Authorization: Bearer YOUR_JWT_TOKEN`}
                        </pre>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Request Body</h3>
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "to": "customer@example.com",
  "config": {
    "brand": "Egger",
    "finish": "Walnut Wood",
    "dimensions": {
      "width": 48,
      "height": 36,
      "depth": 21
    }
  }
}`}
                        </pre>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Response (200 OK)</h3>
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "message": "Configuration email sent"
}`}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Checkout Endpoints */}
                <TabsContent value="checkout" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5 text-primary" />
                          <CardTitle>POST /create-checkout</CardTitle>
                        </div>
                        <Badge>Public</Badge>
                      </div>
                      <CardDescription>Create Stripe checkout session</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Request Body</h3>
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "items": [
    {
      "priceId": "price_1234567890",
      "quantity": 2
    }
  ],
  "recaptchaToken": "string (required)"
}`}
                        </pre>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Response (200 OK)</h3>
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "url": "https://checkout.stripe.com/..."
}`}
                        </pre>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Security Features</h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          <li>Rate limiting: 5 requests per 10 minutes per IP</li>
                          <li>reCAPTCHA v3 verification</li>
                          <li>Stripe price ID validation</li>
                          <li>Amount validation</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Endpoints */}
                <TabsContent value="security" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          <CardTitle>POST /send-security-alert</CardTitle>
                        </div>
                        <Badge variant="secondary">
                          <Lock className="h-3 w-3 mr-1" />
                          Auth Required
                        </Badge>
                      </div>
                      <CardDescription>Send security alert to admins</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Alert Types</h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          <li><code>rate_limit_spike</code> - Unusual rate limit violations</li>
                          <li><code>blocked_ip_threshold</code> - Many IPs blocked</li>
                          <li><code>webhook_security_issue</code> - Webhook signature failures</li>
                          <li><code>email_delivery_issues</code> - High bounce rate</li>
                          <li><code>webhook_retry_excessive</code> - Too many retries</li>
                          <li><code>performance_degradation</code> - Metrics exceed budgets</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Request Body</h3>
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "alertType": "rate_limit_spike",
  "data": {
    "violations": 150,
    "timeWindow": "1 hour"
  }
}`}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Admin Endpoints */}
                <TabsContent value="admin" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-primary" />
                          <CardTitle>POST /check-performance</CardTitle>
                        </div>
                        <Badge variant="secondary">
                          <Lock className="h-3 w-3 mr-1" />
                          Admin Only
                        </Badge>
                      </div>
                      <CardDescription>Analyze performance metrics and send alerts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Scheduled Execution</h3>
                        <p className="text-sm text-muted-foreground">
                          Runs automatically every hour via pg_cron. Can also be triggered manually by admins.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Response (200 OK)</h3>
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "metricsFound": 245,
  "alertsSent": 1,
  "summary": {
    "avgLCP": 2850,
    "avgCLS": 0.05,
    "avgINP": 180
  }
}`}
                        </pre>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Performance Budgets</h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          <li>LCP (Largest Contentful Paint): 2.5s</li>
                          <li>CLS (Cumulative Layout Shift): 0.1</li>
                          <li>INP (Interaction to Next Paint): 200ms</li>
                          <li>Checkout operation: 3s</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          <CardTitle>POST /check-role-expiration</CardTitle>
                        </div>
                        <Badge variant="secondary">
                          <Lock className="h-3 w-3 mr-1" />
                          Admin Only
                        </Badge>
                      </div>
                      <CardDescription>Check for expiring user roles</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Reminder System</h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          <li>3-day advance warning email</li>
                          <li>1-day advance warning email</li>
                          <li>Automatic role removal on expiration</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Response (200 OK)</h3>
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "reminders3DaySent": 2,
  "reminders1DaySent": 1,
  "rolesRemoved": 0
}`}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Email Endpoints */}
                <TabsContent value="email" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-5 w-5 text-primary" />
                          <CardTitle>POST /resend-webhook</CardTitle>
                        </div>
                        <Badge>Webhook</Badge>
                      </div>
                      <CardDescription>Handle Resend email delivery webhooks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Webhook Events</h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          <li><code>email.sent</code> - Email sent successfully</li>
                          <li><code>email.delivered</code> - Email delivered to recipient</li>
                          <li><code>email.bounced</code> - Email bounced</li>
                          <li><code>email.complained</code> - Spam complaint</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Security Features</h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          <li>Svix HMAC-SHA256 signature verification</li>
                          <li>Timestamp validation (5-minute window)</li>
                          <li>IP-based rate limiting (30 req/min)</li>
                          <li>Event deduplication via svix_id</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>OpenAPI Specification</CardTitle>
                  <CardDescription>
                    Download the complete OpenAPI 3.0 specification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a
                    href="/docs/api/openapi.yaml"
                    download
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    Download openapi.yaml
                  </a>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
