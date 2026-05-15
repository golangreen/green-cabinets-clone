import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Scan = {
  id: string;
  url: string;
  strategy: "mobile" | "desktop";
  performance_score: number | null;
  accessibility_score: number | null;
  best_practices_score: number | null;
  seo_score: number | null;
  lcp_ms: number | null;
  cls: number | null;
  inp_ms: number | null;
  fcp_ms: number | null;
  tbt_ms: number | null;
  failing_audits: Array<{ id: string; title: string; score: number; displayValue?: string | null }> | null;
  error: string | null;
  created_at: string;
};

const scoreColor = (s: number | null) => {
  if (s == null) return "bg-muted text-muted-foreground";
  if (s >= 90) return "bg-green-600 text-white";
  if (s >= 50) return "bg-amber-500 text-white";
  return "bg-red-600 text-white";
};

const fmtMs = (n: number | null) => (n == null ? "—" : `${Math.round(n)}ms`);
const fmtCls = (n: number | null) => (n == null ? "—" : n.toFixed(3));

const ScoreCell = ({ value }: { value: number | null }) => (
  <Badge className={scoreColor(value)}>{value == null ? "—" : Math.round(value)}</Badge>
);

const SeoDashboard = () => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [url, setUrl] = useState("https://greencabinetsny.com/");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("seo_scans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(40);
    if (error) toast({ title: "Failed to load scans", description: error.message, variant: "destructive" });
    setScans((data as Scan[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const runScan = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("run-seo-scan", { body: { url } });
      if (error) throw error;
      toast({ title: "Scan complete", description: `${(data as any)?.results?.length ?? 0} results saved` });
      await load();
    } catch (e) {
      toast({ title: "Scan failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  const latest = scans.slice(0, 2);
  const history = scans;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>SEO Dashboard | Green Cabinets</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Header />
      <main className="flex-1 container max-w-6xl py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">SEO &amp; Lighthouse Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Run after each publish to verify performance, accessibility, best-practices and SEO.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="border rounded px-3 py-2 text-sm bg-background min-w-[260px]"
            />
            <Button onClick={runScan} disabled={running} className="gap-2">
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {running ? "Running…" : "Run scan"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {latest.map((s) => (
            <Card key={s.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="capitalize">{s.strategy}</CardTitle>
                  <span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</span>
                </div>
                <CardDescription className="truncate">{s.url}</CardDescription>
              </CardHeader>
              <CardContent>
                {s.error ? (
                  <p className="text-sm text-red-600">{s.error}</p>
                ) : (
                  <>
                    <div className="grid grid-cols-4 gap-3 text-center">
                      {[
                        ["Perf", s.performance_score],
                        ["A11y", s.accessibility_score],
                        ["BP", s.best_practices_score],
                        ["SEO", s.seo_score],
                      ].map(([label, val]) => (
                        <div key={label as string}>
                          <ScoreCell value={val as number | null} />
                          <div className="text-xs text-muted-foreground mt-1">{label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-5 gap-2 mt-4 text-xs text-center">
                      <div><div className="font-medium">{fmtMs(s.lcp_ms)}</div><div className="text-muted-foreground">LCP</div></div>
                      <div><div className="font-medium">{fmtCls(s.cls)}</div><div className="text-muted-foreground">CLS</div></div>
                      <div><div className="font-medium">{fmtMs(s.inp_ms)}</div><div className="text-muted-foreground">INP</div></div>
                      <div><div className="font-medium">{fmtMs(s.fcp_ms)}</div><div className="text-muted-foreground">FCP</div></div>
                      <div><div className="font-medium">{fmtMs(s.tbt_ms)}</div><div className="text-muted-foreground">TBT</div></div>
                    </div>
                    {s.failing_audits && s.failing_audits.length > 0 && (
                      <div className="mt-4">
                        <div className="text-xs font-medium mb-2">Failing audits ({s.failing_audits.length})</div>
                        <ul className="text-xs space-y-1 max-h-48 overflow-auto">
                          {s.failing_audits.slice(0, 10).map((a) => (
                            <li key={a.id} className="flex justify-between gap-2 border-b py-1">
                              <span className="truncate">{a.title}</span>
                              <span className="text-muted-foreground shrink-0">{a.displayValue ?? `${Math.round((a.score ?? 0) * 100)}`}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
          {!loading && latest.length === 0 && (
            <Card className="md:col-span-2">
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                No scans yet. Click "Run scan" to start.
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
            <CardDescription>Last 40 scans across all URLs and strategies.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Perf</TableHead>
                    <TableHead>A11y</TableHead>
                    <TableHead>BP</TableHead>
                    <TableHead>SEO</TableHead>
                    <TableHead>LCP</TableHead>
                    <TableHead>CLS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="whitespace-nowrap text-xs">{new Date(s.created_at).toLocaleString()}</TableCell>
                      <TableCell className="max-w-[180px] truncate text-xs">
                        <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                          {s.url.replace(/^https?:\/\//, "")}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell className="capitalize text-xs">{s.strategy}</TableCell>
                      <TableCell><ScoreCell value={s.performance_score} /></TableCell>
                      <TableCell><ScoreCell value={s.accessibility_score} /></TableCell>
                      <TableCell><ScoreCell value={s.best_practices_score} /></TableCell>
                      <TableCell><ScoreCell value={s.seo_score} /></TableCell>
                      <TableCell className="text-xs">{fmtMs(s.lcp_ms)}</TableCell>
                      <TableCell className="text-xs">{fmtCls(s.cls)}</TableCell>
                    </TableRow>
                  ))}
                  {!loading && history.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground text-sm py-6">No history yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default SeoDashboard;
