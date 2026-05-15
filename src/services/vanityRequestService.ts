import { supabase } from "@/integrations/supabase/client";

export interface VanityQuotePayload {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  brand: string;
  finish: string;
  width: number;
  height?: number;
  depth?: number;
  zipCode: string;
  state: string;
  basePrice: number;
  tax: number;
  shipping: number;
  totalPrice: number;
  additionalNotes?: string;
}

export const vanityRequestService = {
  async sendQuote(payload: VanityQuotePayload) {
    const { error } = await supabase.functions.invoke("send-vanity-quote", { body: payload });
    if (error) throw error;
  },
};
