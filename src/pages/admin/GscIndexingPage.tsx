import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { seoScanService, type GscInspectionResult } from "@/services/seoScanService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const SITE_URL_DEFAULT = "sc-domain:greencabinetsny.com";

const PILLAR_URLS = [
  "https://greencabinetsny.com/best-wood-for-kitchen-cabinets",
  "https://greencabinetsny.com/cabinet-wood-types-and-costs",
  "https://greencabinetsny.com/natural-wood-kitchen-cabinets",
  "https://greencabinetsny.com/double-sink-vanity-guide",
  "https://greencabinetsny.com/floating-bathroom-vanity",
  "https://greencabinetsny.com/small-bathroom-vanity-ideas",
  "https://greencabinetsny.com/reach-in-closet-systems-nyc",
];

type InspectionResult = GscInspectionResult;

const verdictColor = (v?: string) => {
  switch (v) {
    case "PASS": return "bg-green-600 text-white";
    case "PARTIAL": return "bg-yellow-500 text-black";
    case "FAIL": return "bg-red-600 text-white";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function GscIndexingPage() {
  const [token, setToken] = useState("");
  const [siteUrl, setSiteUrl] = useState(SITE_URL_DEFAULT);
  const [urlsText, setUrlsText] = useState(PILLAR_URLS.join("\n"));
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<InspectionResult[] | null>(null);

  const run = async () => {
    if (!token.trim()) {
      toast.error("Paste a valid OAuth access token");
      return;
    }
    const urls = urlsText.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!urls.length) {
      toast.error("Add at least one URL");
      return;
    }

    setLoading(true);
    setResults(null);
    try {
      const results = await seoScanService.gscInspect(token.trim(), siteUrl.trim(), urls);
      setResults(results);
      toast.success(`Inspected ${urls.length} URL${urls.length === 1 ? "" : "s"}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Inspection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>GSC Indexing Status | Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="container mx-auto max-w-5xl py-10 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Google Search Console — URL Indexing</h1>
          <p className="text-muted-foreground mt-1">
            Paste an OAuth access token with the <code>webmasters.readonly</code> scope.
            The token is sent only to the inspection function and never stored.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Inspect URLs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">OAuth Access Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="ya29...."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Get one fast from{" "}
                <a
                  href="https://developers.google.com/oauthplayground/?scope=https://www.googleapis.com/auth/webmasters.readonly"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  OAuth 2.0 Playground
                </a>{" "}
                (select Search Console API → webmasters.readonly → Authorize → Exchange for tokens → copy access_token).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="site">Site URL (Search Console property)</Label>
              <Input
                id="site"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use <code>sc-domain:greencabinetsny.com</code> for a Domain property,
                or <code>https://greencabinetsny.com/</code> for a URL-prefix property.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urls">URLs (one per line, max 50)</Label>
              <Textarea
                id="urls"
                rows={9}
                value={urlsText}
                onChange={(e) => setUrlsText(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            <Button onClick={run} disabled={loading}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Inspecting…</>
              ) : (
                <><RefreshCw className="mr-2 h-4 w-4" /> Check indexing status</>
              )}
            </Button>
          </CardContent>
        </Card>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Results ({results.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground border-b">
                    <tr>
                      <th className="py-2 pr-3">URL</th>
                      <th className="py-2 pr-3">Verdict</th>
                      <th className="py-2 pr-3">Coverage</th>
                      <th className="py-2 pr-3">Last crawl</th>
                      <th className="py-2 pr-3">Robots</th>
                      <th className="py-2 pr-3">Fetch</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.url} className="border-b last:border-0 align-top">
                        <td className="py-2 pr-3 font-mono text-xs break-all max-w-[260px]">
                          {r.url.replace("https://greencabinetsny.com", "")}
                        </td>
                        <td className="py-2 pr-3">
                          {r.ok ? (
                            <Badge className={verdictColor(r.verdict)}>
                              {r.verdict ?? "—"}
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              ERR {r.status ?? ""}
                            </Badge>
                          )}
                        </td>
                        <td className="py-2 pr-3">{r.coverageState ?? "—"}</td>
                        <td className="py-2 pr-3 text-xs">
                          {r.lastCrawlTime
                            ? new Date(r.lastCrawlTime).toLocaleString()
                            : "—"}
                        </td>
                        <td className="py-2 pr-3 text-xs">{r.robotsTxtState ?? "—"}</td>
                        <td className="py-2 pr-3 text-xs">{r.pageFetchState ?? "—"}</td>
                        <td className="py-2">
                          {r.inspectionResultLink && (
                            <a
                              href={r.inspectionResultLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-primary underline text-xs"
                            >
                              GSC <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          )}
                          {!r.ok && (
                            <details className="text-xs text-destructive">
                              <summary className="cursor-pointer">error</summary>
                              <pre className="whitespace-pre-wrap break-all max-w-[260px]">
                                {JSON.stringify(r.error, null, 2)}
                              </pre>
                            </details>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
