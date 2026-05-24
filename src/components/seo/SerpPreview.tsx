import { useMemo } from "react";

interface SerpPreviewProps {
  url: string;
  title: string;
  description: string;
}

// Google SERP approximate pixel widths (desktop)
const TITLE_PX_LIMIT = 600;
const DESC_PX_LIMIT = 990; // ~158-160 chars typical

// Rough character width estimates for Arial-like SERP fonts
function estimatePx(text: string, avgChar = 7.5) {
  return Math.round(text.length * avgChar);
}

function statusColor(value: number, min: number, max: number) {
  if (value < min) return "text-amber-600";
  if (value > max) return "text-red-600";
  return "text-green-600";
}

export const SerpPreview = ({ url, title, description }: SerpPreviewProps) => {
  const titlePx = useMemo(() => estimatePx(title, 8.2), [title]);
  const descPx = useMemo(() => estimatePx(description, 6.6), [description]);

  const titleTruncated = titlePx > TITLE_PX_LIMIT;
  const descTruncated = descPx > DESC_PX_LIMIT;

  const displayHost = url.replace(/^https?:\/\//, "").split("/")[0];
  const breadcrumb = url.replace(/^https?:\/\//, "").split("/").slice(1).join(" › ");

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      {/* Google-style preview */}
      <div className="max-w-2xl font-sans">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
            G
          </div>
          <div className="text-xs leading-tight">
            <div className="text-foreground font-medium">{displayHost}</div>
            <div className="text-muted-foreground">
              {displayHost}
              {breadcrumb && <> › {breadcrumb}</>}
            </div>
          </div>
        </div>
        <h3
          className="text-[#1a0dab] dark:text-blue-400 text-xl leading-7 font-normal hover:underline cursor-pointer truncate"
          style={{ maxWidth: TITLE_PX_LIMIT }}
        >
          {title}
        </h3>
        <p className="text-sm text-[#4d5156] dark:text-muted-foreground leading-snug mt-1 line-clamp-2">
          {description}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border text-sm">
        <div>
          <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
            Title
          </div>
          <div className="font-mono">
            <span className={statusColor(title.length, 30, 60)}>
              {title.length} chars
            </span>
            {" · "}
            <span className={statusColor(titlePx, 200, TITLE_PX_LIMIT)}>
              ~{titlePx}px
            </span>
            {titleTruncated && (
              <span className="text-red-600 ml-2">⚠ truncated</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Target: 50–60 chars / ≤{TITLE_PX_LIMIT}px
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
            Description
          </div>
          <div className="font-mono">
            <span className={statusColor(description.length, 120, 160)}>
              {description.length} chars
            </span>
            {" · "}
            <span className={statusColor(descPx, 400, DESC_PX_LIMIT)}>
              ~{descPx}px
            </span>
            {descTruncated && (
              <span className="text-red-600 ml-2">⚠ truncated</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Target: 120–158 chars / ≤{DESC_PX_LIMIT}px
          </div>
        </div>
      </div>
    </div>
  );
};

export default SerpPreview;
