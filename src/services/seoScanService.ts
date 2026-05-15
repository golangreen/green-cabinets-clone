import { supabase } from "@/integrations/supabase/client";

export interface SeoScan {
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
}

export interface GscInspectionResult {
  url: string;
  ok: boolean;
  verdict?: string;
  coverageState?: string;
  indexingState?: string;
  lastCrawlTime?: string;
  googleCanonical?: string;
  userCanonical?: string;
  pageFetchState?: string;
  robotsTxtState?: string;
  inspectionResultLink?: string;
  status?: number;
  error?: unknown;
}

export type DeepTestStatus = "idle" | "running" | "pass" | "warn" | "fail";

export interface DeepTestResponse {
  status?: DeepTestStatus;
  message?: string;
  details?: string;
}

export const seoScanService = {
  async listScans(limit = 40): Promise<{ scans: SeoScan[]; error: Error | null }> {
    const { data, error } = await supabase
      .from("seo_scans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    return {
      scans: ((data ?? []) as unknown) as SeoScan[],
      error: error ? new Error(error.message) : null,
    };
  },

  async runScan(url: string): Promise<{ resultsCount: number }> {
    const { data, error } = await supabase.functions.invoke("run-seo-scan", { body: { url } });
    if (error) throw error;
    return { resultsCount: (data as any)?.results?.length ?? 0 };
  },

  async deepTest(check: string, origin: string): Promise<DeepTestResponse> {
    const { data, error } = await supabase.functions.invoke("seo-deep-test", {
      body: { check, origin },
    });
    if (error) throw error;
    return (data ?? {}) as DeepTestResponse;
  },

  async gscInspect(token: string, siteUrl: string, urls: string[]): Promise<GscInspectionResult[]> {
    const { data, error } = await supabase.functions.invoke("gsc-inspect", {
      body: { token, siteUrl, urls },
    });
    if (error) throw error;
    return (data?.results ?? []) as GscInspectionResult[];
  },
};
