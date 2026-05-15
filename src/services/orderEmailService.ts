import { supabase } from "@/integrations/supabase/client";

export const orderEmailService = {
  async sendOrderConfirmation(sessionId: string) {
    const { data, error } = await supabase.functions.invoke("send-order-confirmation", {
      body: { sessionId },
    });
    if (error) throw error;
    return data;
  },
};
