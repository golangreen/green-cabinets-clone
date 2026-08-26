import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface VanityActionsProps {
  onRequestQuote: () => void;
}

export const VanityActions = ({ onRequestQuote }: VanityActionsProps) => (
  <Button
    onClick={onRequestQuote}
    className="w-full touch-manipulation bg-[#5C7650] hover:bg-[#5C7650]/80"
    size="lg"
  >
    <Mail className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
    <span className="text-sm sm:text-base">Request Quote via Email</span>
  </Button>
);
