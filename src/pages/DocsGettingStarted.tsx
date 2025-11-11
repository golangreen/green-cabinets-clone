import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rocket, Database, Key, BookOpen, CheckCircle2, Terminal, GitBranch, Shield } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DocsSidebar } from "@/components/DocsSidebar";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

const DocsGettingStarted = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <DocsSidebar />
        <main className="flex-1 px-8 py-16 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Getting Started</h1>
          <p className="text-muted-foreground text-lg">
            Complete guide to setting up and developing with this project
          </p>
        </div>

        <Separator className="my-8" />

        {/* Quick Start */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Quick Start</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Prerequisites</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Node.js 18+ installed</li>
                    <li>Package manager (npm, yarn, or bun)</li>
                    <li>Git for version control</li>
                    <li>Code editor (VS Code recommended)</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Installation Steps</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">1</Badge>
                      <div className="flex-1">
                        <p className="font-medium mb-2">Clone the repository</p>
                        <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                          <code>git clone [repository-url]
cd [project-directory]</code>
                        </pre>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">2</Badge>
                      <div className="flex-1">
                        <p className="font-medium mb-2">Install dependencies</p>
                        <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                          <code>npm install
# or
yarn install
# or
bun install</code>
                        </pre>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">3</Badge>
                      <div className="flex-1">
                        <p className="font-medium mb-2">Configure environment variables</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          Environment variables are automatically managed by Lovable Cloud. No manual setup required.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">4</Badge>
                      <div className="flex-1">
                        <p className="font-medium mb-2">Start development server</p>
                        <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                          <code>npm run dev
# or
yarn dev
# or
bun dev</code>
                        </pre>
                        <p className="text-sm text-muted-foreground mt-2">
                          The app will be available at <code className="bg-muted px-1 rounded">http://localhost:5173</code>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Environment Variables */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Key className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Environment Variables</h2>
          </div>

          <Alert className="mb-6">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Automatically Managed</AlertTitle>
            <AlertDescription>
              This project uses Lovable Cloud, which automatically manages all environment variables. 
              You don't need to create or configure a <code>.env</code> file manually.
            </AlertDescription>
          </Alert>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Available Environment Variables</CardTitle>
              <CardDescription>These are automatically provided by Lovable Cloud</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <code className="font-mono font-semibold">VITE_SUPABASE_URL</code>
                  <p className="text-sm text-muted-foreground mt-1">
                    The backend API endpoint URL
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <code className="font-mono font-semibold">VITE_SUPABASE_PUBLISHABLE_KEY</code>
                  <p className="text-sm text-muted-foreground mt-1">
                    Public API key for client-side requests
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <code className="font-mono font-semibold">VITE_SUPABASE_PROJECT_ID</code>
                  <p className="text-sm text-muted-foreground mt-1">
                    Unique project identifier
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Secrets</CardTitle>
              <CardDescription>For API keys and sensitive data</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                For third-party API keys (Stripe, Shopify, etc.), use the Lovable Cloud secrets management system. 
                These secrets are securely stored and accessible in edge functions.
              </p>
              <div className="flex gap-3">
                <Terminal className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">Current Secrets:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• SHOPIFY_ACCESS_TOKEN</li>
                    <li>• STRIPE_SECRET_KEY</li>
                    <li>• RECAPTCHA_SECRET_KEY</li>
                    <li>• RESEND_API_KEY</li>
                    <li>• LOVABLE_API_KEY</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Database Schema */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Database Schema Overview</h2>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tables</CardTitle>
              <CardDescription>Core database tables and their purposes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">user_roles</h4>
                    <Badge variant="outline">Security</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Stores user role assignments for role-based access control
                  </p>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                    <code>{`id: UUID (primary key)
user_id: UUID (references auth.users)
role: app_role (enum: 'admin', 'moderator', 'user')
created_at: TIMESTAMPTZ`}</code>
                  </pre>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">security_events</h4>
                    <Badge variant="outline">Monitoring</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Logs security-related events for monitoring and auditing
                  </p>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                    <code>{`id: UUID (primary key)
event_type: TEXT (rate_limit_exceeded, validation_failed, etc.)
function_name: TEXT
client_ip: TEXT
severity: TEXT
details: JSONB
created_at: TIMESTAMPTZ`}</code>
                  </pre>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">blocked_ips</h4>
                    <Badge variant="outline">Security</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Tracks IP addresses blocked due to security violations
                  </p>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                    <code>{`id: UUID (primary key)
ip_address: TEXT (unique)
reason: TEXT
blocked_at: TIMESTAMPTZ
blocked_until: TIMESTAMPTZ
auto_blocked: BOOLEAN
violation_count: INTEGER
details: JSONB`}</code>
                  </pre>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">block_history</h4>
                    <Badge variant="outline">Audit</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Historical log of IP blocking/unblocking actions
                  </p>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                    <code>{`id: UUID (primary key)
ip_address: TEXT
action: TEXT (blocked/unblocked)
reason: TEXT
blocked_until: TIMESTAMPTZ
auto_blocked: BOOLEAN
performed_by: TEXT
created_at: TIMESTAMPTZ`}</code>
                  </pre>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">alert_history</h4>
                    <Badge variant="outline">Monitoring</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Records of security alerts sent to administrators
                  </p>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                    <code>{`id: UUID (primary key)
alert_type: TEXT
details: JSONB
sent_at: TIMESTAMPTZ`}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Row Level Security (RLS)</CardTitle>
              <CardDescription>Security policies protect all tables</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>All Tables Protected</AlertTitle>
                <AlertDescription>
                  Every table has RLS enabled with policies that restrict access based on user roles and ownership. 
                  Admin users can access all data, while regular users can only access their own records.
                </AlertDescription>
              </Alert>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(ROUTES.DOCS_AUTH)}
                  className="w-full"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  View Authentication & Security Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Project Structure */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Project Structure</h2>
          </div>

          <Card>
            <CardContent className="pt-6">
              <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                <code>{`project-root/
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # Shadcn UI components
│   │   └── ...            # Feature components
│   ├── pages/             # Route pages
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions & configs
│   ├── integrations/      # External service integrations
│   │   └── supabase/      # Backend client & types
│   ├── stores/            # State management (Zustand)
│   ├── assets/            # Images, fonts, etc.
│   └── styles/            # CSS files
│
├── supabase/
│   ├── functions/         # Edge functions (serverless)
│   ├── migrations/        # Database migrations (auto-managed)
│   └── config.toml        # Backend configuration
│
├── public/                # Static assets
├── index.html            # Entry HTML file
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind CSS config
└── package.json          # Dependencies`}</code>
              </pre>

              <div className="mt-6 space-y-3">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Components</p>
                    <p className="text-sm text-muted-foreground">
                      Reusable UI components following atomic design principles. 
                      Shadcn UI components in <code>src/components/ui/</code>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Pages</p>
                    <p className="text-sm text-muted-foreground">
                      Route-level components in <code>src/pages/</code>. 
                      Each page corresponds to a route in <code>App.tsx</code>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Edge Functions</p>
                    <p className="text-sm text-muted-foreground">
                      Serverless functions in <code>supabase/functions/</code>. 
                      Deploy automatically on push.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Integrations</p>
                    <p className="text-sm text-muted-foreground">
                      Backend client in <code>src/integrations/supabase/client.ts</code>. 
                      Auto-generated types in <code>types.ts</code>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Key Technologies */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Tech Stack</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Frontend</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span><strong>React 18</strong> - UI library</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span><strong>TypeScript</strong> - Type safety</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span><strong>Vite</strong> - Build tool</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span><strong>Tailwind CSS</strong> - Styling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span><strong>Shadcn UI</strong> - Component library</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span><strong>React Router</strong> - Routing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span><strong>TanStack Query</strong> - Data fetching</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span><strong>Zustand</strong> - State management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Backend</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span><strong>Lovable Cloud</strong> - Full-stack platform</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span><strong>PostgreSQL</strong> - Database</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span><strong>Authentication</strong> - User management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span><strong>Edge Functions</strong> - Serverless APIs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span><strong>Row Level Security</strong> - Data protection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span><strong>Stripe</strong> - Payment processing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span><strong>Shopify</strong> - E-commerce integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span><strong>reCAPTCHA</strong> - Bot protection</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Next Steps */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Next Steps</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate(ROUTES.DOCS_AUTH)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Authentication Guide
                </CardTitle>
                <CardDescription>
                  Learn about role-based auth, RLS policies, and security best practices
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  API Reference
                </CardTitle>
                <CardDescription>
                  Detailed edge function documentation (Coming Soon)
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Developer Guide
                </CardTitle>
                <CardDescription>
                  Component patterns and development workflows (Coming Soon)
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Troubleshooting
                </CardTitle>
                <CardDescription>
                  Common issues and solutions (Coming Soon)
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Help Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Rocket className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Ready to Start Building?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You now have everything you need to start developing. Check out the authentication guide 
                  to understand how user management and security work, or dive straight into the code!
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => navigate(ROUTES.DOCS_AUTH)}>
                    Authentication Guide
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = ROUTES.HOME}>
                    Back to Home
                  </Button>
                </div>
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

export default DocsGettingStarted;
