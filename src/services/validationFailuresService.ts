import { supabase } from '@/integrations/supabase/client';
import { getFinishById } from '@/lib/estimator/finishes-data';
import { checkCompatibility, getFinishTier } from '@/lib/estimator/compatibility';

const SESSION_KEY = 'estimator_session_id';
const LOGGED_KEY = 'estimator_logged_failures';

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

function alreadyLogged(combo: string): boolean {
  try {
    const raw = sessionStorage.getItem(LOGGED_KEY);
    const set: string[] = raw ? JSON.parse(raw) : [];
    if (set.includes(combo)) return true;
    set.push(combo);
    sessionStorage.setItem(LOGGED_KEY, JSON.stringify(set));
    return false;
  } catch {
    return false;
  }
}

/** Fire-and-forget log of an incompatible door/finish pick. Dedupes per session. */
export async function logValidationFailure(doorStyleId: string, finishId: string): Promise<void> {
  if (!doorStyleId || !finishId) return;
  const compat = checkCompatibility(doorStyleId, finishId);
  if (compat.ok) return;
  const combo = `${doorStyleId}|${finishId}`;
  if (alreadyLogged(combo)) return;

  const finish = getFinishById(finishId);
  const tier = finish ? getFinishTier(finish) : compat.tier ?? null;

  try {
    await supabase.from('estimator_validation_failures').insert({
      door_style: doorStyleId,
      finish_id: finishId,
      finish_brand: finish?.brand ?? null,
      material_tier: tier ?? null,
      reason: compat.reason ?? null,
      session_id: getSessionId(),
    });
  } catch (err) {
    // Telemetry must never break UX
    console.warn('[validationFailures] log failed', err);
  }
}

export interface ValidationFailureRow {
  id: string;
  door_style: string;
  finish_id: string;
  finish_brand: string | null;
  material_tier: string | null;
  reason: string | null;
  session_id: string | null;
  created_at: string;
}

export interface FailureAggregate {
  door_style: string;
  finish_id: string;
  finish_brand: string | null;
  material_tier: string | null;
  count: number;
  unique_sessions: number;
  last_seen: string;
  sample_reason: string | null;
}

export async function fetchValidationFailures(daysBack = 30): Promise<ValidationFailureRow[]> {
  const since = new Date(Date.now() - daysBack * 86400_000).toISOString();
  const { data, error } = await supabase
    .from('estimator_validation_failures')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(5000);
  if (error) throw error;
  return (data ?? []) as ValidationFailureRow[];
}

export function aggregateFailures(rows: ValidationFailureRow[]): FailureAggregate[] {
  const map = new Map<string, FailureAggregate & { _sessions: Set<string> }>();
  for (const r of rows) {
    const key = `${r.door_style}|${r.finish_id}`;
    let agg = map.get(key);
    if (!agg) {
      agg = {
        door_style: r.door_style,
        finish_id: r.finish_id,
        finish_brand: r.finish_brand,
        material_tier: r.material_tier,
        count: 0,
        unique_sessions: 0,
        last_seen: r.created_at,
        sample_reason: r.reason,
        _sessions: new Set<string>(),
      };
      map.set(key, agg);
    }
    agg.count += 1;
    if (r.session_id) agg._sessions.add(r.session_id);
    if (r.created_at > agg.last_seen) agg.last_seen = r.created_at;
  }
  return Array.from(map.values())
    .map(a => ({ ...a, unique_sessions: a._sessions.size }))
    .sort((a, b) => b.count - a.count);
}
