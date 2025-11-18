import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, Code, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DocsSidebar } from "@/components/DocsSidebar";
import { ROUTES } from "@/constants/routes";

const DocsAuth = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <DocsSidebar />
        <main className="flex-1 px-8 py-16 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Authentication Documentation</h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive guide to the role-based authentication system
          </p>
        </div>

        <Separator className="my-8" />

        {/* Overview */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">System Overview</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4">
                This application uses a secure, server-side role-based authentication system built on Supabase. 
                The architecture prevents privilege escalation attacks through proper separation of concerns and 
                security definer functions.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Email/Password Auth</h3>
                  <p className="text-sm text-muted-foreground">Standard authentication with signup and login flows</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Role-Based Access</h3>
                  <p className="text-sm text-muted-foreground">Separate user_roles table with enum types</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">RLS Policies</h3>
                  <p className="text-sm text-muted-foreground">Row-level security on all protected tables</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Architecture */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Code className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Role System Architecture</h2>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>1. Role Enum Type</CardTitle>
              <CardDescription>Define available roles as a PostgreSQL enum</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{`CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');`}</code>
              </pre>
              <p className="text-sm text-muted-foreground mt-3">
                The enum ensures type safety and prevents invalid role assignments.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>2. User Roles Table</CardTitle>
              <CardDescription>Store user-role mappings separately from user profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;`}</code>
              </pre>
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Critical Security Rule</AlertTitle>
                <AlertDescription>
                  <strong>NEVER</strong> store roles on the profiles or users table. This creates privilege 
                  escalation risks. Always use a separate user_roles table.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>3. Security Definer Function</CardTitle>
              <CardDescription>Prevent RLS recursion with SECURITY DEFINER</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
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
$$;`}</code>
              </pre>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold">Why SECURITY DEFINER?</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Executes with owner privileges, bypassing RLS</li>
                  <li>Prevents infinite recursion in RLS policies</li>
                  <li>Centralizes role checking logic</li>
                  <li>Ensures consistent security checks</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. RLS Policies</CardTitle>
              <CardDescription>Apply row-level security using the has_role function</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage all roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));`}</code>
              </pre>
            </CardContent>
          </Card>
        </section>

        {/* Adding New Roles */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Adding New Roles</h2>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Step-by-Step Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">1</Badge>
                <div>
                  <h4 className="font-semibold mb-1">Update the Enum Type</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                    <code>{`ALTER TYPE public.app_role ADD VALUE 'editor';`}</code>
                  </pre>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add the new role to the app_role enum. Note: Enum values cannot be removed, only added.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex gap-3">
                <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">2</Badge>
                <div>
                  <h4 className="font-semibold mb-1">Assign Role to Users</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                    <code>{`INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'editor');`}</code>
                  </pre>
                </div>
              </div>

              <Separator />

              <div className="flex gap-3">
                <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">3</Badge>
                <div>
                  <h4 className="font-semibold mb-1">Create RLS Policies</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                    <code>{`CREATE POLICY "Editors can update content"
ON public.content
FOR UPDATE
USING (public.has_role(auth.uid(), 'editor'));`}</code>
                  </pre>
                </div>
              </div>

              <Separator />

              <div className="flex gap-3">
                <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">4</Badge>
                <div>
                  <h4 className="font-semibold mb-1">Update Frontend Auth Checks</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                    <code>{`const { data: hasEditorRole } = await supabase.rpc('has_role', {
  _user_id: user.id,
  _role: 'editor'
});`}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Best Practice</AlertTitle>
            <AlertDescription>
              Always test role changes in development first. Use database transactions when modifying 
              multiple policies to ensure consistency.
            </AlertDescription>
          </Alert>
        </section>

        {/* Security Best Practices */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Security Best Practices</h2>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <CardTitle>DO: Server-Side Validation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{`// ✅ CORRECT: Check roles on the server
const { data: isAdmin } = await supabase.rpc('has_role', {
  _user_id: user.id,
  _role: 'admin'
});

if (!isAdmin) {
  throw new Error('Admin access required');
}`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <CardTitle>DON'T: Client-Side Role Storage</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{`// ❌ WRONG: Never store roles in localStorage
localStorage.setItem('userRole', 'admin'); // Can be manipulated!

// ❌ WRONG: Never hardcode credentials
if (email === 'admin@example.com') { // Insecure!
  grantAdminAccess();
}`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <CardTitle>DO: Use Security Definer Functions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">
                  Always use SECURITY DEFINER when checking roles in RLS policies to prevent recursion:
                </p>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{`-- ✅ CORRECT: Using security definer function
CREATE POLICY "Admin access"
ON table_name
USING (public.has_role(auth.uid(), 'admin'));

-- ❌ WRONG: Direct table query causes recursion
CREATE POLICY "Admin access"
ON table_name
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <CardTitle>DO: Enable RLS on All Tables</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">
                  Every table with sensitive data must have RLS enabled:
                </p>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{`ALTER TABLE public.sensitive_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
ON public.sensitive_data
FOR SELECT
USING (auth.uid() = user_id);`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <CardTitle>DO: Validate Input</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">
                  Always validate and sanitize user input using libraries like Zod:
                </p>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{`import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100)
});

const result = authSchema.safeParse({ email, password });
if (!result.success) {
  throw new Error('Invalid input');
}`}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Common Pitfalls */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <h2 className="text-3xl font-bold">Common Pitfalls</h2>
          </div>

          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Session Not Persisting</AlertTitle>
              <AlertDescription>
                <strong>Problem:</strong> User gets logged out on page refresh.<br />
                <strong>Solution:</strong> Store complete session object, not just user. Use onAuthStateChange listener.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>RLS Recursion Errors</AlertTitle>
              <AlertDescription>
                <strong>Problem:</strong> "infinite recursion detected in policy"<br />
                <strong>Solution:</strong> Use SECURITY DEFINER functions instead of querying the same table in policies.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Email Redirect Failures</AlertTitle>
              <AlertDescription>
                <strong>Problem:</strong> Auth emails redirect to wrong URL.<br />
                <strong>Solution:</strong> Always include emailRedirectTo: window.location.origin in signup options.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Privilege Escalation</AlertTitle>
              <AlertDescription>
                <strong>Problem:</strong> Users can modify their own roles.<br />
                <strong>Solution:</strong> Never store roles in profiles table. Use separate user_roles table with proper RLS.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Code Examples */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Code className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Complete Code Examples</h2>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Authentication Hook</CardTitle>
              <CardDescription>Example useAdminCheck hook for protected routes</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <code>{`import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (error) throw error;

        if (!data) {
          navigate('/');
          return;
        }

        setIsAdmin(data);
      } catch (error) {
        console.error('Error checking admin role:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminRole();
  }, [navigate]);

  return { isAdmin, isLoading };
};`}</code>
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Auth Page Component</CardTitle>
              <CardDescription>Login and signup with session persistence</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <code>{`const [session, setSession] = useState<Session | null>(null);
const [user, setUser] = useState<User | null>(null);

useEffect(() => {
  // Set up listener FIRST
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate('/');
      }
    }
  );

  // THEN check for existing session
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}, []);

const handleSignUp = async (email: string, password: string) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin
    }
  });
  
  if (error) {
    toast({ title: "Error", description: error.message });
  }
};`}</code>
              </pre>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  For additional support or questions about implementing authentication and roles, 
                  consult the project's security documentation or contact the development team.
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

export default DocsAuth;
