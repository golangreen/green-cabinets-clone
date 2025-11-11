import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle2, Database, Lock, Code, RefreshCw, Bug, Copy, Play, Check, Terminal, Loader2, History, Trash2, Clock, Bookmark, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DocsSidebar } from "@/components/DocsSidebar";
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { ScrollArea } from "@/components/ui/scroll-area";

interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  success: boolean;
  rowCount?: number;
  error?: string;
}

interface BookmarkItem {
  id: string;
  name: string;
  query: string;
  createdAt: number;
}

const DocsTroubleshooting = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ type: string; message: string } | null>(null);
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM user_roles LIMIT 5;");
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [bookmarkName, setBookmarkName] = useState("");
  const [isBookmarkDialogOpen, setIsBookmarkDialogOpen] = useState(false);
  const { toast } = useToast();

  // Load query history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('sql-query-history');
    if (savedHistory) {
      try {
        setQueryHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse query history:', e);
      }
    }
  }, []);

  // Save query history to localStorage whenever it changes
  useEffect(() => {
    if (queryHistory.length > 0) {
      localStorage.setItem('sql-query-history', JSON.stringify(queryHistory));
    }
  }, [queryHistory]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('sql-query-bookmarks');
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error('Failed to parse bookmarks:', e);
      }
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (bookmarks.length > 0) {
      localStorage.setItem('sql-query-bookmarks', JSON.stringify(bookmarks));
    }
  }, [bookmarks]);

  const addToHistory = (query: string, success: boolean, rowCount?: number, error?: string) => {
    const historyItem: QueryHistoryItem = {
      id: Date.now().toString(),
      query,
      timestamp: Date.now(),
      success,
      rowCount,
      error
    };
    setQueryHistory(prev => [historyItem, ...prev].slice(0, 20)); // Keep last 20 queries
  };

  const loadFromHistory = (item: QueryHistoryItem) => {
    setSqlQuery(item.query);
    toast({
      title: "Query loaded",
      description: "Query loaded from history",
    });
  };

  const clearHistory = () => {
    setQueryHistory([]);
    localStorage.removeItem('sql-query-history');
    toast({
      title: "History cleared",
      description: "Query history has been cleared",
    });
  };

  const saveBookmark = () => {
    if (!bookmarkName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your bookmark",
        variant: "destructive",
      });
      return;
    }

    const bookmark: BookmarkItem = {
      id: Date.now().toString(),
      name: bookmarkName.trim(),
      query: sqlQuery,
      createdAt: Date.now(),
    };

    setBookmarks(prev => [bookmark, ...prev]);
    setBookmarkName("");
    setIsBookmarkDialogOpen(false);
    toast({
      title: "Bookmark saved",
      description: `Query saved as "${bookmark.name}"`,
    });
  };

  const loadBookmark = (bookmark: BookmarkItem) => {
    setSqlQuery(bookmark.query);
    toast({
      title: "Bookmark loaded",
      description: `Loaded query: ${bookmark.name}`,
    });
  };

  const deleteBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
    if (bookmarks.length === 1) {
      localStorage.removeItem('sql-query-bookmarks');
    }
    toast({
      title: "Bookmark deleted",
      description: "Bookmark has been removed",
    });
  };

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const testAuthConnection = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setTestResult({
          type: "success",
          message: `✅ Auth working! User: ${session.user.email}`
        });
      } else {
        setTestResult({
          type: "info",
          message: "ℹ️ No active session. Try logging in first."
        });
      }
    } catch (error: any) {
      setTestResult({
        type: "error",
        message: `❌ Auth error: ${error.message}`
      });
    }
  };

  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      
      setTestResult({
        type: "success",
        message: "✅ Database connection successful!"
      });
    } catch (error: any) {
      setTestResult({
        type: "error",
        message: `❌ Database error: ${error.message}`
      });
    }
  };

  const testRLSPolicies = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTestResult({
          type: "info",
          message: "ℹ️ Please log in to test RLS policies"
        });
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('*');
      
      if (error && error.code === 'PGRST301') {
        setTestResult({
          type: "error",
          message: "❌ RLS blocking access. Check your policies!"
        });
      } else if (error) {
        throw error;
      } else {
        setTestResult({
          type: "success",
          message: `✅ RLS policies working! Retrieved ${data?.length || 0} rows`
        });
      }
    } catch (error: any) {
      setTestResult({
        type: "error",
        message: `❌ RLS test error: ${error.message}`
      });
    }
  };

  const executeQuery = async () => {
    setIsExecuting(true);
    setQueryResult(null);

    try {
      // Basic safety check - only allow SELECT queries
      const trimmedQuery = sqlQuery.trim().toUpperCase();
      if (!trimmedQuery.startsWith("SELECT")) {
        setQueryResult({
          error: "Only SELECT queries are allowed for safety. Use the backend dashboard for data modifications.",
          type: "error"
        });
        setIsExecuting(false);
        return;
      }

      // Parse table name from query (basic parsing)
      const tableMatch = sqlQuery.match(/FROM\s+(\w+)/i);
      if (!tableMatch) {
        setQueryResult({
          error: "Could not parse table name from query. Use format: SELECT * FROM table_name",
          type: "error"
        });
        setIsExecuting(false);
        return;
      }

      const tableName = tableMatch[1];
      const limitMatch = sqlQuery.match(/LIMIT\s+(\d+)/i);
      const limit = limitMatch ? parseInt(limitMatch[1]) : 10;

      // Execute query using Supabase client (with type casting for dynamic table)
      const { data, error } = await (supabase as any)
        .from(tableName)
        .select('*')
        .limit(limit);

      if (error) {
        setQueryResult({
          error: error.message,
          hint: error.hint || "Check your table name and RLS policies",
          type: "error"
        });
        addToHistory(sqlQuery, false, undefined, error.message);
      } else {
        const rowCount = Array.isArray(data) ? data.length : 0;
        setQueryResult({
          data: data || [],
          type: "success",
          rowCount
        });
        addToHistory(sqlQuery, true, rowCount);
        toast({
          title: "Query executed successfully",
          description: `Retrieved ${rowCount} rows from ${tableName}`,
        });
      }
    } catch (err: any) {
      setQueryResult({
        error: err.message || "Failed to execute query",
        type: "error"
      });
      addToHistory(sqlQuery, false, undefined, err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const exampleQueries = [
    {
      name: "View User Roles",
      query: "SELECT * FROM user_roles LIMIT 5;"
    },
    {
      name: "Check Security Events",
      query: "SELECT event_type, COUNT(*) as count FROM security_events GROUP BY event_type;"
    },
    {
      name: "View Blocked IPs",
      query: "SELECT ip_address, reason, blocked_until FROM blocked_ips WHERE blocked_until > now();"
    },
    {
      name: "Test has_role Function",
      query: "SELECT public.has_role(auth.uid(), 'admin'::app_role) as is_admin;"
    }
  ];
  
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

          {/* Interactive Testing Section */}
          <section className="mb-12">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Interactive Testing Tools
                </CardTitle>
                <CardDescription>
                  Test your setup with these interactive demos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button
                    onClick={testAuthConnection}
                    variant="outline"
                    className="w-full"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Test Auth
                  </Button>
                  <Button
                    onClick={testDatabaseConnection}
                    variant="outline"
                    className="w-full"
                  >
                    <Database className="mr-2 h-4 w-4" />
                    Test Database
                  </Button>
                  <Button
                    onClick={testRLSPolicies}
                    variant="outline"
                    className="w-full"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Test RLS
                  </Button>
                </div>

                {testResult && (
                  <Alert className={`mt-4 ${
                    testResult.type === 'success' ? 'border-green-500 bg-green-50' :
                    testResult.type === 'error' ? 'border-destructive bg-destructive/10' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <AlertDescription className="font-mono text-sm">
                      {testResult.message}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </section>

          {/* SQL Query Editor */}
          <section className="mb-12">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-primary" />
                  Live SQL Query Editor
                </CardTitle>
                <CardDescription>
                  Test database queries directly in your browser (SELECT only)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Read-Only Mode</AlertTitle>
                  <AlertDescription>
                    Only SELECT queries are allowed for safety. Use the backend dashboard for INSERT, UPDATE, or DELETE operations.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Example Queries</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {exampleQueries.map((example) => (
                      <Button
                        key={example.name}
                        variant="outline"
                        size="sm"
                        onClick={() => setSqlQuery(example.query)}
                        className="justify-start text-xs"
                      >
                        {example.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">SQL Query</label>
                    <div className="flex gap-2">
                      <Dialog open={isBookmarkDialogOpen} onOpenChange={setIsBookmarkDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Save Query as Bookmark</DialogTitle>
                            <DialogDescription>
                              Give your query a memorable name for quick access later
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="bookmark-name">Bookmark Name</Label>
                              <Input
                                id="bookmark-name"
                                placeholder="e.g., Check admin users"
                                value={bookmarkName}
                                onChange={(e) => setBookmarkName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    saveBookmark();
                                  }
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Query Preview</Label>
                              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-[150px]">
                                {sqlQuery}
                              </pre>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsBookmarkDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={saveBookmark}>
                              <Star className="h-4 w-4 mr-2" />
                              Save Bookmark
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(sqlQuery, 'sql-query')}
                      >
                        {copiedCode === 'sql-query' ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-md overflow-hidden">
                    <CodeMirror
                      value={sqlQuery}
                      height="150px"
                      extensions={[sql()]}
                      onChange={(value) => setSqlQuery(value)}
                      theme="light"
                      basicSetup={{
                        lineNumbers: true,
                        highlightActiveLineGutter: true,
                        highlightActiveLine: true,
                        foldGutter: true,
                      }}
                      className="text-sm"
                    />
                  </div>
                </div>

                <Button
                  onClick={executeQuery}
                  disabled={isExecuting || !sqlQuery.trim()}
                  className="w-full"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Execute Query
                    </>
                  )}
                </Button>

                {queryResult && (
                  <div className="space-y-3">
                    {queryResult.type === "error" ? (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Query Error</AlertTitle>
                        <AlertDescription className="space-y-1">
                          <p className="font-mono text-sm">{queryResult.error}</p>
                          {queryResult.hint && (
                            <p className="text-xs mt-2">Hint: {queryResult.hint}</p>
                          )}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <>
                        <Alert className="border-green-500 bg-green-50">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertDescription>
                            Query executed successfully. Retrieved {queryResult.rowCount} {queryResult.rowCount === 1 ? 'row' : 'rows'}.
                          </AlertDescription>
                        </Alert>

                        {queryResult.data && queryResult.data.length > 0 ? (
                          <div className="border rounded-lg overflow-hidden">
                            <div className="max-h-[400px] overflow-auto">
                              <Table>
                                <TableHeader className="bg-muted sticky top-0">
                                  <TableRow>
                                    {Object.keys(queryResult.data[0]).map((key) => (
                                      <TableHead key={key} className="font-semibold">
                                        {key}
                                      </TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {queryResult.data.map((row: any, idx: number) => (
                                    <TableRow key={idx}>
                                      {Object.values(row).map((value: any, cellIdx: number) => (
                                        <TableCell key={cellIdx} className="font-mono text-xs">
                                          {typeof value === 'object' && value !== null
                                            ? JSON.stringify(value)
                                            : value?.toString() || '-'}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        ) : (
                          <Alert>
                            <AlertDescription>
                              Query executed successfully but returned no rows.
                            </AlertDescription>
                          </Alert>
                        )}
                      </>
                    )}
                  </div>
                )}

                <Alert>
                  <Code className="h-4 w-4" />
                  <AlertTitle>Available Tables</AlertTitle>
                  <AlertDescription className="space-y-1">
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary">user_roles</Badge>
                      <Badge variant="secondary">security_events</Badge>
                      <Badge variant="secondary">blocked_ips</Badge>
                      <Badge variant="secondary">block_history</Badge>
                      <Badge variant="secondary">alert_history</Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </section>

          {/* Bookmarks */}
          {bookmarks.length > 0 && (
            <section className="mb-12">
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    <CardTitle>Saved Bookmarks</CardTitle>
                  </div>
                  <CardDescription>
                    Quick access to your favorite queries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {bookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id}
                        className="border rounded-lg p-3 hover:bg-accent transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Bookmark className="h-4 w-4 text-primary shrink-0" />
                            <h4 className="font-semibold text-sm">{bookmark.name}</h4>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => loadBookmark(bookmark)}
                              className="h-8 px-3"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Load
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteBookmark(bookmark.id);
                              }}
                              className="h-8 px-3 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto font-mono">
                          {bookmark.query}
                        </pre>
                        <p className="text-xs text-muted-foreground mt-2">
                          Created: {new Date(bookmark.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Query History */}
          {queryHistory.length > 0 && (
            <section className="mb-12">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      <CardTitle>Query History</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearHistory}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear History
                    </Button>
                  </div>
                  <CardDescription>
                    Click on any query to reuse it (last 20 queries saved)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {queryHistory.map((item) => (
                        <div
                          key={item.id}
                          className="border rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => loadFromHistory(item)}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <Badge
                                variant={item.success ? "default" : "destructive"}
                                className="shrink-0"
                              >
                                {item.success ? (
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                ) : (
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                )}
                                {item.success ? 'Success' : 'Error'}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {new Date(item.timestamp).toLocaleString()}
                              </div>
                            </div>
                            {item.success && item.rowCount !== undefined && (
                              <Badge variant="outline" className="shrink-0">
                                {item.rowCount} {item.rowCount === 1 ? 'row' : 'rows'}
                              </Badge>
                            )}
                          </div>
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto font-mono">
                            {item.query}
                          </pre>
                          {item.error && (
                            <p className="text-xs text-destructive mt-2 truncate">
                              Error: {item.error}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </section>
          )}

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
                  <Tabs defaultValue="code" className="w-full">
                    <TabsList>
                      <TabsTrigger value="code">Code Example</TabsTrigger>
                      <TabsTrigger value="explanation">Explanation</TabsTrigger>
                    </TabsList>
                    <TabsContent value="code">
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute right-2 top-2"
                          onClick={() => copyToClipboard(`// ✅ CORRECT: Store complete session and use onAuthStateChange
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
}, []);`, 'session-persist')}
                        >
                          {copiedCode === 'session-persist' ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
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
                    </TabsContent>
                    <TabsContent value="explanation">
                      <div className="space-y-3 text-sm bg-muted p-4 rounded">
                        <p><strong>Key points:</strong></p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>Call <code>getSession()</code> on mount to retrieve existing session</li>
                          <li>Use <code>onAuthStateChange</code> listener to handle auth events</li>
                          <li>Store complete session object, not just user</li>
                          <li>Clean up subscription on unmount to prevent memory leaks</li>
                        </ul>
                      </div>
                    </TabsContent>
                  </Tabs>
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

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="wrong">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                      ❌ Wrong Approach (Causes Recursion)
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute right-2 top-2 z-10"
                          onClick={() => copyToClipboard(`-- ❌ This causes recursion
CREATE POLICY "Admins can view all profiles" 
ON public.profiles
FOR SELECT USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);`, 'rls-wrong')}
                        >
                          {copiedCode === 'rls-wrong' ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                          <code>{`-- ❌ This causes recursion
CREATE POLICY "Admins can view all profiles" 
ON public.profiles
FOR SELECT USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);`}</code>
                        </pre>
                      </div>
                      <Alert className="mt-3" variant="destructive">
                        <AlertDescription className="text-xs">
                          The policy queries the <code>profiles</code> table, which triggers the same policy again, creating an infinite loop.
                        </AlertDescription>
                      </Alert>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="correct">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                      ✅ Correct Solution (Use SECURITY DEFINER)
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Step 1: Create security definer function</p>
                        <div className="relative">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute right-2 top-2 z-10"
                            onClick={() => copyToClipboard(`CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
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
$$;`, 'rls-function')}
                          >
                            {copiedCode === 'rls-function' ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
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
                        </div>

                        <p className="text-sm font-medium">Step 2: Use function in policy</p>
                        <div className="relative">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute right-2 top-2 z-10"
                            onClick={() => copyToClipboard(`CREATE POLICY "Admins can view all profiles" 
ON public.profiles
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));`, 'rls-policy')}
                          >
                            {copiedCode === 'rls-policy' ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                            <code>{`CREATE POLICY "Admins can view all profiles" 
ON public.profiles
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));`}</code>
                          </pre>
                        </div>

                        <Alert className="mt-3">
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertTitle className="text-sm">Why this works</AlertTitle>
                          <AlertDescription className="text-xs">
                            SECURITY DEFINER executes with owner privileges, bypassing RLS and preventing recursion. The function queries a separate <code>user_roles</code> table instead of the table being protected.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
