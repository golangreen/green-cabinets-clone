ALTER TABLE public.compatibility_rules
  DROP CONSTRAINT IF EXISTS compatibility_rules_scope_check;

ALTER TABLE public.compatibility_rules
  ADD CONSTRAINT compatibility_rules_scope_check
  CHECK (scope IN ('brand', 'tier', 'finish'));
