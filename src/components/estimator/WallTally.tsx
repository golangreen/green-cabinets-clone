import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Ruler } from 'lucide-react';
import type { WallCheckRow } from '@/lib/estimator/types';

const STATUS = {
  ok:      { icon: '✅', label: 'Match',   color: 'text-emerald-600' },
  warning: { icon: '⚠️', label: 'Gap',     color: 'text-amber-600'  },
  missing: { icon: '❌', label: 'Missing', color: 'text-destructive' },
  over:    { icon: '⚠️', label: 'Extra',   color: 'text-blue-600'   },
};

interface WallTallyProps {
  rows: WallCheckRow[];
}

const WallTally: React.FC<WallTallyProps> = ({ rows }) => {
  const [open, setOpen] = useState(false);

  if (!rows || rows.length === 0) return null;

  const issues = rows.filter(r => r.status !== 'ok').length;

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent/40 transition-colors text-left"
      >
        <Ruler size={13} className="text-muted-foreground shrink-0" />
        <span className="text-xs font-semibold text-foreground flex-1">Wall Tally</span>
        {issues > 0
          ? <span className="text-[10px] font-medium text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full">{issues} wall{issues > 1 ? 's' : ''} need review</span>
          : <span className="text-[10px] text-emerald-600">All walls match</span>
        }
        {open ? <ChevronDown size={13} className="text-muted-foreground" /> : <ChevronRight size={13} className="text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-1">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-3 items-center text-[10px] font-medium text-muted-foreground uppercase tracking-wide px-2 py-1">
            <span>Wall</span>
            <span className="text-right">Measured</span>
            <span className="text-right">Extracted</span>
            <span className="text-right">Gap</span>
            <span className="text-center">Status</span>
          </div>
          {rows.map((row, i) => {
            const s = STATUS[row.status] ?? STATUS.warning;
            return (
              <div
                key={i}
                className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-3 items-center rounded-lg px-2 py-1.5 text-xs ${
                  row.status === 'ok'
                    ? 'bg-emerald-500/5'
                    : row.status === 'missing'
                    ? 'bg-destructive/5 border border-destructive/15 border-dashed'
                    : 'bg-amber-500/5 border border-amber-500/15 border-dashed'
                }`}
              >
                <span className="font-medium text-foreground capitalize truncate">{row.wall}</span>
                <span className="text-muted-foreground text-right tabular-nums">{row.measured}"</span>
                <span className={`text-right tabular-nums ${s.color}`}>{row.extracted}"</span>
                <span className={`text-right tabular-nums text-[10px] ${row.gap === 0 ? 'text-muted-foreground' : s.color}`}>
                  {row.gap === 0 ? '—' : row.gap > 0 ? `+${row.gap}"` : `${row.gap}"`}
                </span>
                <span className="text-center text-sm">{s.icon}</span>
              </div>
            );
          })}
          <p className="text-[10px] text-muted-foreground pt-1 px-1">
            Gap ≤ 6" = fillers/appliances ✅ · Gap 6–24" = possible missing cabinet ⚠️ · Gap &gt; 24" = cabinet(s) missing ❌
          </p>
        </div>
      )}
    </div>
  );
};

export default WallTally;
