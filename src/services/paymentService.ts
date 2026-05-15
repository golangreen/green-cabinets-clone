import { supabase } from "@/integrations/supabase/client";

export interface CustomProductPayload {
  name: string;
  description: string;
  amount: number; // cents
  metadata?: Record<string, string | number | undefined>;
}

export interface PaymentSessionResult {
  url: string | null;
  error: Error | null;
}

async function invokeCreatePayment(body: Record<string, unknown>): Promise<PaymentSessionResult> {
  try {
    const { data, error } = await supabase.functions.invoke("create-payment", { body });
    if (error) throw error;
    return { url: data?.url ?? null, error: null };
  } catch (e) {
    const err = e instanceof Error ? e : new Error("Failed to create payment session");
    console.error("paymentService.createPayment error:", err);
    return { url: null, error: err };
  }
}

export const paymentService = {
  createTestPayment(): Promise<PaymentSessionResult> {
    return invokeCreatePayment({});
  },
  createCustomProductPayment(customProduct: CustomProductPayload): Promise<PaymentSessionResult> {
    return invokeCreatePayment({ customProduct });
  },
};
