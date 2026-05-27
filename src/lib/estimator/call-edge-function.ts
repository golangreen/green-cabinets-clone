import { supabase } from "@/integrations/supabase/client";

export async function callEdgeFunction<T = any>(name: string, body: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw new Error(`${name} failed: ${error.message}`);
  if (data?.error) throw new Error(data.error);
  return data as T;
}
