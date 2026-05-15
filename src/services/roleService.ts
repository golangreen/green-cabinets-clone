import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export const roleService = {
  async hasRole(userId: string, role: AppRole): Promise<boolean> {
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: role,
    });
    if (error) {
      console.error("roleService.hasRole error:", error);
      return false;
    }
    return data ?? false;
  },
};
