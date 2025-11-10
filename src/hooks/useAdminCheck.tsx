import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminCheck = () => {
  return useQuery({
    queryKey: ["admin-check"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { isAdmin: false, loading: false };
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Error checking admin role:", error);
        return { isAdmin: false, loading: false };
      }

      return { isAdmin: !!data, loading: false };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
