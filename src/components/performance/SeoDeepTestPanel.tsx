import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, ExternalLink, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { seoScanService } from '@/services/seoScanService';

type Status = 'idle' | 'running' | 'pass' | 'warn' | 'fail';
type Check = { id: string; label: string; status: Status; message?: string; details?: string };

const CHECKS: Omit<Check, 'status'>[] = [
  { id: 'robots', label: 'robots.txt' },
  { id: 'sitemap', label: 'sitemap.xml' },
  { id: 'llms', label: 'llms.txt (GEO)' },
  { id: 'home-meta', label: 'Homepage meta tags' },
  { id: 'jsonld', label: 'Structured data (JSON-LD)' },
  { id: 'noindex', label: 'Indexability' },
  { id: 'pillars', label: 'Pillar pages reachable' },
  { id: 'geo-citations', label: 'GEO citations (NAP + LocalBusiness)' },
];

const StatusIcon = ({ s }: { s: Status }) => {
  if (s === 'running') return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  if (s === 'pass') return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (s === 'warn') return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  if (s === 'fail') return <XCircle className="h-4 w-4 text-red-600" />;
  return <div className="h-4 w-4 rounded-full border border-muted" />;
};

const SeoDeepTestPanel = () => {
  const [checks, setChecks] = useState<Check[]>(CHECKS.map((c) => ({ ...c, status: 'idle' })));
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);

  const lovablePanelUrl = 'https://lovable.dev/projects/90bce6da-512b-48f1-874c-7d0142de1705?tab=seo';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const runAll = async () => {
    setRunning(true);
    setCompleted(0);
    setChecks(CHECKS.map((c) => ({ ...c, status: 'idle' })));

    for (let i = 0; i < CHECKS.length; i++) {
      const c = CHECKS[i];
      setChecks((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: 'running' } : x)));
      try {
        const data = await seoScanService.deepTest(c.id, origin);
        setChecks((prev) =>
          prev.map((x) =>
            x.id === c.id
              ? { ...x, status: (data?.status as Status) ?? 'fail', message: data?.message, details: data?.details }
              : x,
          ),
        );
      } catch (e) {
        setChecks((prev) =>
          prev.map((x) => (x.id === c.id ? { ...x, status: 'fail', message: (e as Error).message } : x)),
        );
      }
      setCompleted(i + 1);
    }
    setRunning(false);
  };

  const summary = {
    pass: checks.filter((c) => c.status === 'pass').length,
    warn: checks.filter((c) => c.status === 'warn').length,
    fail: checks.filter((c) => c.status === 'fail').length,
  };
  const progress = (completed / CHECKS.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <CardTitle>SEO + GEO Deep Test</CardTitle>
            <CardDescription>
              Runs sitemap, robots, structured data, and GEO citation checks against the live site.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={runAll} disabled={running} className="gap-2">
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {running ? 'Running…' : 'Run deep test'}
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <a href={lovablePanelUrl} target="_blank" rel="noreferrer">
                Lovable SEO panel <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{completed} / {CHECKS.length} checks</span>
            <span className="flex gap-3">
              <Badge variant="outline" className="text-green-600">{summary.pass} pass</Badge>
              <Badge variant="outline" className="text-yellow-600">{summary.warn} warn</Badge>
              <Badge variant="outline" className="text-red-600">{summary.fail} fail</Badge>
            </span>
          </div>
          <Progress value={progress} />
        </div>

        <ul className="divide-y border rounded-md">
          {checks.map((c) => (
            <li key={c.id} className="flex items-start gap-3 p-3">
              <StatusIcon s={c.status} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{c.label}</div>
                {c.message && <div className="text-xs text-muted-foreground mt-0.5">{c.message}</div>}
                {c.details && <div className="text-xs text-muted-foreground/70 mt-0.5 truncate">{c.details}</div>}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default SeoDeepTestPanel;
