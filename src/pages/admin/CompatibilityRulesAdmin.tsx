import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, RotateCcw, Save, Trash2, ShieldCheck } from 'lucide-react';
import {
  compatibilityRulesService,
  type CompatibilityRuleRow,
  type RuleScope,
} from '@/services/compatibilityRulesService';
import { useCompatibilityRulesSync } from '@/hooks/useCompatibilityRulesSync';
import {
  getEffectiveCompatibilityRules,
  getTierLabel,
  type DoorStyleId,
  type MaterialTier,
} from '@/lib/estimator/compatibility';
import { DOOR_STYLES } from '@/lib/estimator/finishes-data';
import { PANELS_BY_BRAND } from '@/data/finishes';
import type { MaterialBrand } from '@/types/materials';

const TIERS: MaterialTier[] = ['painted', 'solid-wood', 'melamine', 'hpl', 'veneer', 'stone'];
const BRANDS = Object.keys(PANELS_BY_BRAND) as MaterialBrand[];
const DOORS = DOOR_STYLES.map(d => d.id as DoorStyleId);

interface RowState {
  rowId?: string;
  allowed: Set<DoorStyleId>;
  notes: string;
  dirty: boolean;
}

function makeKey(scope: RuleScope, key: string) {
  return `${scope}:${key}`;
}

export default function CompatibilityRulesAdmin() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading, refetch } = useCompatibilityRulesSync();
  const defaults = getEffectiveCompatibilityRules();

  // Build a local editable state map keyed by scope:key
  const initialState = useMemo<Record<string, RowState>>(() => {
    const m: Record<string, RowState> = {};
    const byKey = new Map(rows.map(r => [makeKey(r.scope, r.key), r]));

    for (const t of TIERS) {
      const r = byKey.get(makeKey('tier', t));
      m[makeKey('tier', t)] = {
        rowId: r?.id,
        allowed: new Set((r?.allowed_door_styles ?? defaults.defaults[t]) as DoorStyleId[]),
        notes: r?.notes ?? '',
        dirty: false,
      };
    }
    for (const b of BRANDS) {
      const r = byKey.get(makeKey('brand', b));
      m[makeKey('brand', b)] = {
        rowId: r?.id,
        allowed: new Set((r?.allowed_door_styles ?? []) as DoorStyleId[]),
        notes: r?.notes ?? '',
        dirty: false,
      };
    }
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const [state, setState] = useState<Record<string, RowState>>(initialState);

  // Sync local state when server data refreshes
  useMemo(() => {
    setState(initialState);
  }, [initialState]);

  const saveMutation = useMutation({
    mutationFn: (input: { scope: RuleScope; key: string; allowed: DoorStyleId[]; notes: string }) =>
      compatibilityRulesService.upsert({
        scope: input.scope,
        key: input.key,
        allowed_door_styles: input.allowed,
        notes: input.notes || null,
      }),
    onSuccess: () => {
      toast.success('Rule saved');
      qc.invalidateQueries({ queryKey: ['compatibility-rules'] });
    },
    onError: (e: any) => toast.error(e?.message ?? 'Failed to save rule'),
  });

  const removeMutation = useMutation({
    mutationFn: (rowId: string) => compatibilityRulesService.remove(rowId),
    onSuccess: () => {
      toast.success('Rule reset to default');
      qc.invalidateQueries({ queryKey: ['compatibility-rules'] });
    },
    onError: (e: any) => toast.error(e?.message ?? 'Failed to reset rule'),
  });

  const toggleDoor = (k: string, door: DoorStyleId) => {
    setState(prev => {
      const cur = prev[k];
      const next = new Set(cur.allowed);
      next.has(door) ? next.delete(door) : next.add(door);
      return { ...prev, [k]: { ...cur, allowed: next, dirty: true } };
    });
  };

  const setNotes = (k: string, notes: string) =>
    setState(prev => ({ ...prev, [k]: { ...prev[k], notes, dirty: true } }));

  const handleSave = (scope: RuleScope, key: string) => {
    const s = state[makeKey(scope, key)];
    if (!s) return;
    saveMutation.mutate({ scope, key, allowed: Array.from(s.allowed), notes: s.notes });
  };

  const handleReset = (scope: RuleScope, key: string) => {
    const s = state[makeKey(scope, key)];
    if (s?.rowId) removeMutation.mutate(s.rowId);
  };

  return (
    <>
      <Helmet>
        <title>Compatibility Rules — Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="text-primary" />
          <h1 className="text-3xl font-bold">Estimator Compatibility Rules</h1>
        </div>
        <p className="text-muted-foreground mb-8 text-sm">
          Toggle which door styles each material tier and supplier brand can be paired with.
          Changes take effect immediately for everyone — no code deploy needed.
          Empty brand rows inherit from their tier's rule.
        </p>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin" size={16} /> Loading rules…
          </div>
        ) : (
          <div className="space-y-10">
            <RulesSection
              title="Material Tiers"
              subtitle="Base rule applied when a finish's brand has no override."
              scope="tier"
              keys={TIERS}
              labelFor={t => getTierLabel(t as MaterialTier)}
              state={state}
              defaultsFor={t => defaults.defaults[t as MaterialTier]}
              onToggle={toggleDoor}
              onNotes={setNotes}
              onSave={handleSave}
              onReset={handleReset}
              saving={saveMutation.isPending}
              resetting={removeMutation.isPending}
            />

            <RulesSection
              title="Brand Overrides"
              subtitle="Override a brand's tier rule when a supplier offers something exceptional. Leave empty to inherit from tier."
              scope="brand"
              keys={BRANDS}
              labelFor={b => b}
              state={state}
              defaultsFor={() => []}
              onToggle={toggleDoor}
              onNotes={setNotes}
              onSave={handleSave}
              onReset={handleReset}
              saving={saveMutation.isPending}
              resetting={removeMutation.isPending}
              inheritedHint
            />
          </div>
        )}
      </div>
    </>
  );
}

interface SectionProps {
  title: string;
  subtitle: string;
  scope: RuleScope;
  keys: string[];
  labelFor: (key: string) => string;
  state: Record<string, RowState>;
  defaultsFor: (key: string) => DoorStyleId[];
  onToggle: (k: string, d: DoorStyleId) => void;
  onNotes: (k: string, n: string) => void;
  onSave: (scope: RuleScope, key: string) => void;
  onReset: (scope: RuleScope, key: string) => void;
  saving: boolean;
  resetting: boolean;
  inheritedHint?: boolean;
}

function RulesSection({
  title, subtitle, scope, keys, labelFor, state, defaultsFor,
  onToggle, onNotes, onSave, onReset, saving, resetting, inheritedHint,
}: SectionProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5 w-44">{scope === 'tier' ? 'Tier' : 'Brand'}</th>
              {DOORS.map(d => (
                <th key={d} className="px-2 py-2.5 text-center">
                  {DOOR_STYLES.find(s => s.id === d)?.name}
                </th>
              ))}
              <th className="text-left px-4 py-2.5 w-56">Notes</th>
              <th className="px-4 py-2.5 w-44"></th>
            </tr>
          </thead>
          <tbody>
            {keys.map(k => {
              const stateKey = makeKey(scope, k);
              const row = state[stateKey];
              if (!row) return null;
              const isInherited = scope === 'brand' && !row.rowId && row.allowed.size === 0;

              return (
                <tr key={k} className="border-t border-border hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-medium">
                    {labelFor(k)}
                    {scope === 'tier' && (
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                        default: {defaultsFor(k).join(', ') || '—'}
                      </div>
                    )}
                    {inheritedHint && isInherited && (
                      <div className="text-[10px] text-muted-foreground mt-0.5">inherits tier rule</div>
                    )}
                  </td>
                  {DOORS.map(d => (
                    <td key={d} className="px-2 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={row.allowed.has(d)}
                        onChange={() => onToggle(stateKey, d)}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={row.notes}
                      onChange={e => onNotes(stateKey, e.target.value)}
                      placeholder="Optional"
                      className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSave(scope, k)}
                      disabled={!row.dirty || saving}
                      className="inline-flex items-center gap-1 text-xs font-medium bg-primary text-primary-foreground px-2.5 py-1.5 rounded-md hover:opacity-90 disabled:opacity-40"
                    >
                      <Save size={12} /> Save
                    </button>
                    {row.rowId && (
                      <button
                        type="button"
                        onClick={() => onReset(scope, k)}
                        disabled={resetting}
                        title="Delete override and revert to default"
                        className="ml-1 inline-flex items-center gap-1 text-xs font-medium bg-muted text-foreground px-2 py-1.5 rounded-md hover:bg-muted/70 disabled:opacity-40"
                      >
                        {scope === 'tier' ? <RotateCcw size={12} /> : <Trash2 size={12} />}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
