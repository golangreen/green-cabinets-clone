import { supabase } from '@/integrations/supabase/client';
import type { DoorStyleId, MaterialTier } from '@/lib/estimator/compatibility';
import type { MaterialBrand } from '@/types/materials';

export type RuleScope = 'brand' | 'tier' | 'finish';

export interface CompatibilityRuleRow {
  id: string;
  scope: RuleScope;
  key: string;
  allowed_door_styles: string[];
  notes: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export const compatibilityRulesService = {
  async list(): Promise<CompatibilityRuleRow[]> {
    const { data, error } = await supabase
      .from('compatibility_rules')
      .select('*')
      .order('scope', { ascending: true })
      .order('key', { ascending: true });
    if (error) throw error;
    return (data ?? []) as CompatibilityRuleRow[];
  },

  async upsert(input: {
    scope: RuleScope;
    key: string;
    allowed_door_styles: DoorStyleId[];
    notes?: string | null;
  }): Promise<CompatibilityRuleRow> {
    const { data: auth } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('compatibility_rules')
      .upsert(
        {
          scope: input.scope,
          key: input.key,
          allowed_door_styles: input.allowed_door_styles,
          notes: input.notes ?? null,
          updated_by: auth.user?.id ?? null,
        },
        { onConflict: 'scope,key' },
      )
      .select()
      .single();
    if (error) throw error;
    return data as CompatibilityRuleRow;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('compatibility_rules').delete().eq('id', id);
    if (error) throw error;
  },

  /** Group rows into the shape expected by `applyCompatibilityOverrides`. */
  toOverrides(rows: CompatibilityRuleRow[]) {
    const tiers: Partial<Record<MaterialTier, DoorStyleId[]>> = {};
    const brands: Partial<Record<MaterialBrand, DoorStyleId[]>> = {};
    const finishes: Record<string, DoorStyleId[]> = {};
    for (const r of rows) {
      const doors = r.allowed_door_styles as DoorStyleId[];
      if (r.scope === 'tier') tiers[r.key as MaterialTier] = doors;
      else if (r.scope === 'brand') brands[r.key as MaterialBrand] = doors;
      else if (r.scope === 'finish') finishes[r.key] = doors;
    }
    return { tiers, brands, finishes };
  },
};

