import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Database, Lock, Code, RefreshCw, Bug } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DocsSidebar } from "@/components/DocsSidebar";

const DocsTroubleshooting = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <DocsSidebar />
        <main className="flex-1 px-8 py-16 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Troubleshooting Guide</h1>
            <p className="text-muted-foreground text-lg">
              Common issues, error messages, and solutions for quick resolution
            </p>
          </div>

          <Separator className="my-8" />

          {/* Authentication Issues */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Authentication Issues</h2>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle>Error: "requested path is invalid"</CardTitle>
                </div>
                <CardDescription>Login redirects to wrong URL or shows invalid path error</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Problem</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    The Site URL and Redirect URL are not properly configured in your backend authentication settings.
                    This can cause login failures or redirects to localhost:3000.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Solution</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">1</Badge>
                      <p>Open your backend dashboard to access auth settings</p>
                    </div>
                    <div className="flex gap-3">
                      <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">2</Badge>
                      <p>Navigate to Authentication → URL Configuration</p>
                    </div>
                    <div className="flex gap-3">
                      <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">3</Badge>
                      <div className="flex-1">
                        <p className="mb-2">Set the <strong>Site URL</strong> to your application URL:</p>
                        <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                          <code>https://yourapp.lovable.app</code>
                        </pre>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">4</Badge>
                      <div className="flex-1">
                        <p className="mb-2">Add all redirect URLs (preview + production):</p>
                        <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                          <code>{`https://yourapp.lovable.app/*
https://preview.lovable.app/*
https://yourdomain.com/*  (if using custom domain)`}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Automatic Configuration</AlertTitle>
                  <AlertDescription>
                    Lovable Cloud automatically manages these settings, but you can customize them in the backend dashboard if needed.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle>Session Not Persisting</CardTitle>
                </div>
                <CardDescription>User gets logged out on page refresh</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Problem</h4>
                  <p className="text-sm text-muted-foreground">
                    Session is not properly stored or the auth state listener is not set up correctly.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Solution</h4>
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                    <code>{`// ✅ CORRECT: Store complete session and use onAuthStateChange
import { supabase } from '@/integrations/supabase/client';

useEffect(() => {
  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
  });

  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    }
  );

  return () => subscription.unsubscribe();
}, []);`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Database Issues */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Database Issues</h2>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle>Error: "infinite recursion detected in policy"</CardTitle>
                </div>
                <CardDescription>RLS policy causes infinite loop</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Problem</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    RLS policy contains a query that references the same table the policy is applied to, causing infinite recursion.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Wrong Approach</h4>
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                    <code>{`-- ❌ This causes recursion
CREATE POLICY "Admins can view all profiles" 
ON public.profiles
FOR SELECT USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);`}</code>
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Correct Solution</h4>
                  <div className="space-y-3 text-sm">
                    <p className="font-medium">Use a SECURITY DEFINER function:</p>
                    <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                      <code>{`-- Step 1: Create security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 2: Update policy to use the function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));`}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle>Error: "No rows found" with .single()</CardTitle>
                </div>
                <CardDescription>Query fails when no data is returned</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Problem</h4>
                  <p className="text-sm text-muted-foreground">
                    Using <code>.single()</code> when there's a risk that no rows will be returned causes an error.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Solution</h4>
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                    <code>{`// ❌ WRONG: .single() throws error if no data
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// ✅ CORRECT: Use .maybeSingle() instead
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .maybeSingle();

// Then handle the case when data is null
if (!data) {
  console.log('No profile found for user');
  // Show meaningful UI feedback
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle>RLS Blocking All Access</CardTitle>
                </div>
                <CardDescription>No data returned even for authenticated users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Problem</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    RLS is enabled but no policies allow access, or policies are too restrictive.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Checklist</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <p>Verify RLS policies exist for the table: <code>SELECT * FROM pg_policies WHERE tablename = 'your_table';</code></p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <p>Check if user is authenticated: <code>SELECT auth.uid();</code> should return user ID</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <p>Test policies manually with user ID in SQL editor</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <p>Ensure policies use correct operation (SELECT, INSERT, UPDATE, DELETE)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Build & Deployment Issues */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Build & Deployment Issues</h2>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle>"Build errors truncated: too large to display"</CardTitle>
                </div>
                <CardDescription>Misleading message that looks like an error</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Not Actually an Error!</AlertTitle>
                  <AlertDescription>
                    This message is misleading. It indicates a <strong>successful build</strong> with many assets that was truncated for display purposes. 
                    Look for "✓ X modules transformed" to confirm success.
                  </AlertDescription>
                </Alert>

                <div>
                  <h4 className="font-semibold mb-2">How to Identify Real Build Errors</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>❌ Real errors show: <code>error TS2345</code>, <code>SyntaxError</code>, <code>Module not found</code></p>
                    <p>✅ Successful build shows: <code>✓ 4331 modules transformed</code></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle>Shopify Build Failures</CardTitle>
                </div>
                <CardDescription>Build fails due to Shopify API calls during SSR</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Problem</h4>
                  <p className="text-sm text-muted-foreground">
                    Shopify API calls execute during build/SSR time, causing failures when Shopify is not configured.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Solution</h4>
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                    <code>{`// Add SSR check before any Shopify API calls
useEffect(() => {
  if (typeof window === 'undefined') return; // Skip during SSR/build
  
  // Safe to call Shopify API now
  fetchProducts();
}, []);

// In library functions:
export async function fetchProducts() {
  if (typeof window === 'undefined') {
    return []; // Return safe default during build
  }
  
  try {
    // Make Shopify API call
  } catch (error) {
    return []; // Fail gracefully
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* React & Code Issues */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Code className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">React & Code Issues</h2>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle>TypeScript Errors</CardTitle>
                </div>
                <CardDescription>Common TypeScript issues and fixes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="border-l-4 border-primary pl-4">
                    <p className="font-semibold mb-1">Type 'X' is not assignable to type 'Y'</p>
                    <p className="text-muted-foreground mb-2">Ensure variable types match interface definitions. Add proper type annotations.</p>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                      <code>{`// Define proper interfaces
interface User {
  id: string;
  email: string;
  name?: string; // Optional
}

const user: User = { id: '1', email: 'user@example.com' };`}</code>
                    </pre>
                  </div>

                  <div className="border-l-4 border-primary pl-4">
                    <p className="font-semibold mb-1">Cannot find module or type definitions</p>
                    <p className="text-muted-foreground mb-2">Check import paths and ensure types are properly exported.</p>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                      <code>{`// Use correct import paths with @/ alias
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';`}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle>React Hook Errors</CardTitle>
                </div>
                <CardDescription>Invalid hook usage patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Hooks called conditionally</h4>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                      <code>{`// ❌ WRONG: Conditional hook
if (user) {
  const [count, setCount] = useState(0);
}

// ✅ CORRECT: Always call hooks at top level
const [count, setCount] = useState(0);
if (user) {
  // Use the state here
}`}</code>
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-sm">useEffect dependency warnings</h4>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                      <code>{`// ✅ CORRECT: Include all dependencies
useEffect(() => {
  fetchData(userId, filter);
}, [userId, filter]); // Add all used variables

// Or use useCallback for functions
const fetchData = useCallback(() => {
  // fetch logic
}, [dependency]);`}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Performance Issues */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Bug className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Performance Issues</h2>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Infinite Render Loop</CardTitle>
                <CardDescription>Component keeps re-rendering</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Common Causes</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>State update inside render (not in useEffect or event handler)</li>
                    <li>Missing dependency array in useEffect causing it to run on every render</li>
                    <li>Object/array created in render used as useEffect dependency</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Solutions</h4>
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                    <code>{`// ❌ WRONG: Creates infinite loop
function Component() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData().then(setData);
  }); // No dependency array = runs every render
}

// ✅ CORRECT: Add dependency array
function Component() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData().then(setData);
  }, []); // Empty array = run once
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Slow Page Load</CardTitle>
                <CardDescription>Application takes too long to load</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Optimize images</p>
                      <p className="text-muted-foreground">Use WebP format, compress images, implement lazy loading</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Code splitting</p>
                      <p className="text-muted-foreground">Use React.lazy() and Suspense for route-based code splitting</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Reduce bundle size</p>
                      <p className="text-muted-foreground">Remove unused dependencies, use tree-shaking effectively</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Getting Help */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-sm">
                    If you're still experiencing issues after trying these solutions:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <p>Check the console logs for detailed error messages</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <p>Review your recent changes in the History view</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <p>Search for the specific error message online</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <p>Ask for help in the Lovable community Discord</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DocsTroubleshooting;
