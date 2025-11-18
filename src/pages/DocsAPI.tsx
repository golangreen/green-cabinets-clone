import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Terminal, Shield, Mail, ShoppingCart, AlertTriangle, Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DocsSidebar } from "@/components/DocsSidebar";

const DocsAPI = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <DocsSidebar />
        <main className="flex-1 px-8 py-16 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">API Reference</h1>
          <p className="text-muted-foreground text-lg">
            Complete documentation of available edge functions and their usage
          </p>
        </div>

        <Separator className="my-8" />

        {/* Overview */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Overview</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4">
                All edge functions are serverless functions deployed automatically with your application. 
                They handle backend logic, API integrations, and secure operations that cannot be performed client-side.
              </p>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Base URL</AlertTitle>
                <AlertDescription>
                  <code className="bg-muted px-2 py-1 rounded">
                    https://mczagaaiyzbhjvtrojia.supabase.co/functions/v1/
                  </code>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </section>

        {/* Authentication */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Authentication</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4">
                Most edge functions are public and do not require authentication. Functions that require authentication 
                will need an authorization header with a valid JWT token.
              </p>
              <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                <code>{`// For public endpoints (no auth required)
const response = await fetch(functionUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data)
});

// For authenticated endpoints
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase.functions.invoke('function-name', {
  body: { /* your data */ }
});`}</code>
              </pre>
            </CardContent>
          </Card>
        </section>

        {/* Security Features */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Security Features</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rate Limiting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All functions implement rate limiting (5-10 requests per hour per IP) to prevent abuse
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">IP Blocking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automatic IP blocking after 8 violations within 60 minutes, blocked for 24 hours
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Input Validation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All inputs validated with Zod schemas and sanitized to prevent injection attacks
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* API Endpoints */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Available Endpoints</h2>

          {/* create-checkout */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    create-checkout
                  </CardTitle>
                  <CardDescription>Create a Stripe checkout session for cart items</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">POST</Badge>
                  <Badge>Public</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Endpoint</h4>
                <code className="bg-muted px-2 py-1 rounded text-sm">
                  /functions/v1/create-checkout
                </code>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Request Body</h4>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code>{`{
  "items": [
    {
      "product": {
        "node": {
          "title": "Custom Bathroom Vanity",
          "description": "48\" vanity with marble countertop",
          "images": {
            "edges": [
              {
                "node": {
                  "url": "https://example.com/image.jpg"
                }
              }
            ]
          }
        }
      },
      "quantity": 1,
      "variantId": "gid://shopify/ProductVariant/123",
      "customAttributes": [
        { "key": "Brand", "value": "EGGER" },
        { "key": "Finish", "value": "White Oak" },
        { "key": "Total Estimate", "value": "$2,500.00" }
      ]
    }
  ],
  "customerEmail": "customer@example.com",
  "customerName": "John Doe"
}`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Response</h4>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code>{`// Success (200)
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "sessionId": "cs_test_..."
}

// Error (400/429/500)
{
  "error": "Error message",
  "retryAfter": 3600  // Only for rate limit errors
}`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Usage Example</h4>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code>{`const response = await fetch(
  'https://mczagaaiyzbhjvtrojia.supabase.co/functions/v1/create-checkout',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: cartItems,
      customerEmail: email,
      customerName: name
    })
  }
);

const { url } = await response.json();
window.location.href = url; // Redirect to Stripe checkout`}</code>
                </pre>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Rate Limits</AlertTitle>
                <AlertDescription>
                  Maximum 10 requests per hour per IP address. Blocked IPs cannot access this endpoint.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* send-quote-request */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    send-quote-request
                  </CardTitle>
                  <CardDescription>Send custom vanity quote request emails</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">POST</Badge>
                  <Badge>Public</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Endpoint</h4>
                <code className="bg-muted px-2 py-1 rounded text-sm">
                  /functions/v1/send-quote-request
                </code>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Request Body</h4>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code>{`{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1-555-123-4567",
  "brand": "EGGER",
  "finish": "White Oak",
  "width": "48",
  "height": "34",
  "depth": "21",
  "zipCode": "10001",
  "basePrice": "2100.00",
  "tax": "168.00",
  "shipping": "250.00",
  "totalPrice": "2518.00",
  "recaptchaToken": "03AGdBq2..." // Optional
}`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Response</h4>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code>{`// Success (200)
{
  "success": true,
  "ownerEmail": { "id": "..." },
  "customerEmail": { "id": "..." }
}

// Error (400/403/429/500)
{
  "error": "Error message",
  "retryAfter": 3600,  // For rate limit errors
  "blockedUntil": "..."  // For blocked IPs
}`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Usage Example</h4>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code>{`const response = await fetch(
  'https://mczagaaiyzbhjvtrojia.supabase.co/functions/v1/send-quote-request',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      brand: configuration.brand,
      finish: configuration.finish,
      width: configuration.width,
      height: configuration.height,
      depth: configuration.depth,
      zipCode: formData.zipCode,
      basePrice: pricing.base,
      tax: pricing.tax,
      shipping: pricing.shipping,
      totalPrice: pricing.total,
      recaptchaToken: token // If reCAPTCHA is enabled
    })
  }
);

const result = await response.json();
if (result.success) {
  // Show success message
}`}</code>
                </pre>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Rate Limits & Validation</AlertTitle>
                <AlertDescription>
                  Maximum 5 requests per hour per IP. All inputs validated with strict schemas. 
                  Optionally supports reCAPTCHA v3 for bot protection.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* email-vanity-config */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    email-vanity-config
                  </CardTitle>
                  <CardDescription>Email vanity configuration to customer</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">POST</Badge>
                  <Badge>Public</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Endpoint</h4>
                <code className="bg-muted px-2 py-1 rounded text-sm">
                  /functions/v1/email-vanity-config
                </code>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Request Body</h4>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code>{`{
  "recipientEmail": "customer@example.com",
  "recipientName": "John Doe",  // Optional
  "recaptchaToken": "03AGdBq2...",  // Optional
  "config": {
    "brand": "EGGER",
    "finish": "White Oak",
    "dimensions": "48\" x 34\" x 21\"",
    "doorStyle": "Slab",
    "countertop": "Marble",
    "sink": "Undermount",
    "pricing": {
      "vanity": "$2,100.00",
      "tax": "$168.00",
      "shipping": "$250.00",
      "total": "$2,518.00"
    }
  }
}`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Response</h4>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code>{`// Success (200)
{
  "success": true,
  "message": "Configuration emailed successfully",
  "emailId": "re_..."
}

// Error (400/403/429/500)
{
  "success": false,
  "error": "Error message"
}`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Usage Example</h4>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code>{`const response = await fetch(
  'https://mczagaaiyzbhjvtrojia.supabase.co/functions/v1/email-vanity-config',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipientEmail: email,
      recipientName: name,
      config: {
        brand: selectedBrand,
        finish: selectedFinish,
        dimensions: \`\${width}" x \${height}" x \${depth}"\`,
        doorStyle: selectedStyle,
        countertop: selectedCountertop,
        sink: selectedSink,
        pricing: calculatedPricing
      }
    })
  }
);

const result = await response.json();`}</code>
                </pre>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Security</AlertTitle>
                <AlertDescription>
                  Rate limited to 5 requests/hour per IP. All HTML output is sanitized to prevent XSS attacks.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* security-monitor */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    security-monitor
                  </CardTitle>
                  <CardDescription>Monitor security events and auto-block suspicious IPs</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">POST</Badge>
                  <Badge variant="secondary">Internal</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Endpoint</h4>
                <code className="bg-muted px-2 py-1 rounded text-sm">
                  /functions/v1/security-monitor
                </code>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Automated Function</AlertTitle>
                <AlertDescription>
                  This function runs automatically via cron job or can be triggered manually. 
                  It analyzes security events from the last 60 minutes and sends email alerts when threats are detected.
                </AlertDescription>
              </Alert>

              <div>
                <h4 className="font-semibold mb-2">Functionality</h4>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Queries <code>security_events</code> table for recent violations</li>
                  <li>Identifies suspicious IPs with 5+ violations</li>
                  <li>Auto-blocks IPs with 8+ violations for 24 hours</li>
                  <li>Sends detailed email alerts to administrators</li>
                  <li>Implements 1-hour cooldown between alerts to prevent spam</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Response</h4>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code>{`// Alert sent (200)
{
  "alert_sent": true,
  "summary": [
    {
      "event_type": "rate_limit_exceeded",
      "event_count": 15,
      "unique_ips": 3,
      "severity": "medium"
    }
  ],
  "suspicious_ips": [
    {
      "client_ip": "192.168.1.1",
      "violation_count": 10,
      "functions_affected": ["create-checkout", "send-quote-request"],
      "first_violation": "2024-01-01T10:00:00Z",
      "last_violation": "2024-01-01T10:45:00Z"
    }
  ]
}

// No alert needed (200)
{
  "alert_sent": false,
  "message": "No suspicious activity detected",
  "summary": []
}`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Manual Invocation</h4>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code>{`import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase.functions.invoke('security-monitor');

if (error) {
  console.error('Security monitor error:', error);
} else {
  console.log('Security check result:', data);
}`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* stripe-webhook */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    stripe-webhook
                  </CardTitle>
                  <CardDescription>Handle Stripe payment webhook events</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">POST</Badge>
                  <Badge variant="secondary">Webhook</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Endpoint</h4>
                <code className="bg-muted px-2 py-1 rounded text-sm">
                  /functions/v1/stripe-webhook
                </code>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Stripe Integration</AlertTitle>
                <AlertDescription>
                  This endpoint is called by Stripe when payment events occur. 
                  Configure this URL in your Stripe Dashboard → Webhooks settings.
                </AlertDescription>
              </Alert>

              <div>
                <h4 className="font-semibold mb-2">Handled Events</h4>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li><code>checkout.session.completed</code> - Payment successful</li>
                  <li><code>checkout.session.async_payment_succeeded</code> - Async payment completed</li>
                  <li><code>checkout.session.async_payment_failed</code> - Async payment failed</li>
                  <li>Verifies webhook signature for security</li>
                  <li>Logs events to database for order fulfillment</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Configuration</h4>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code>{`# Stripe Dashboard Setup
1. Go to Stripe Dashboard → Webhooks
2. Click "Add endpoint"
3. Enter URL: https://mczagaaiyzbhjvtrojia.supabase.co/functions/v1/stripe-webhook
4. Select events: checkout.session.*
5. Copy webhook signing secret to STRIPE_WEBHOOK_SECRET`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Error Handling */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Error Handling</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">HTTP Status Codes</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded">
                      <code className="font-semibold">200</code> - Success
                    </div>
                    <div className="p-4 border rounded">
                      <code className="font-semibold">400</code> - Invalid request/validation error
                    </div>
                    <div className="p-4 border rounded">
                      <code className="font-semibold">403</code> - IP blocked or reCAPTCHA failed
                    </div>
                    <div className="p-4 border rounded">
                      <code className="font-semibold">429</code> - Rate limit exceeded
                    </div>
                    <div className="p-4 border rounded">
                      <code className="font-semibold">500</code> - Internal server error
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Error Response Format</h4>
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                    <code>{`{
  "error": "Descriptive error message",
  "retryAfter": 3600,  // Only for 429 errors (seconds)
  "blocked_until": "2024-01-01T12:00:00Z",  // Only for 403 IP blocks
  "reason": "Security violation"  // Only for 403 IP blocks
}`}</code>
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Best Practices</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Always check response status before parsing JSON</li>
                    <li>Implement exponential backoff for rate limit errors</li>
                    <li>Display user-friendly error messages from the <code>error</code> field</li>
                    <li>Log errors for debugging but don't expose stack traces to users</li>
                    <li>Handle network errors and timeouts gracefully</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Need Help */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Terminal className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  If you have questions about API usage or need to report an issue, check the 
                  authentication documentation or contact the development team. All edge functions 
                  include detailed logging for troubleshooting.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DocsAPI;
