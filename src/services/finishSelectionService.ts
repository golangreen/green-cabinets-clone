import { supabase } from "@/integrations/supabase/client";

export interface FinishSelectionPick {
  id: string;
  brand: string;
  name: string;
  codes: string[];
  thumb: string;
  detailUrl: string;
}

export interface SendFinishSelectionPayload {
  kind: "self" | "shop";
  name: string | null;
  email: string;
  phone: string | null;
  note: string | null;
  shareUrl: string;
  picks: FinishSelectionPick[];
}

export const finishSelectionService = {
  async send(payload: SendFinishSelectionPayload) {
    const { error } = await supabase.functions.invoke("send-finish-selection", { body: payload });
    if (error) throw error;
  },
};
