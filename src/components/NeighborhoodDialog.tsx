import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getNeighborhoodInfo } from "@/data/neighborhoodFacts";

interface Props {
  neighborhood: string | null;
  boroughSlug?: string;
  onClose: () => void;
}

const NeighborhoodDialog = ({ neighborhood, boroughSlug, onClose }: Props) => {
  const open = !!neighborhood;
  const info = neighborhood ? getNeighborhoodInfo(neighborhood) : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-background">
        {info && (
          <>
            <div className="aspect-video w-full bg-[#d5d5d5]">
              <iframe
                title={`Map of ${info.name}, ${info.borough}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  info.mapQuery,
                )}&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="p-6">
              <DialogHeader className="space-y-2 text-left">
                <div className="inline-flex items-center gap-2 text-primary">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {info.borough}, NY
                  </span>
                </div>
                <DialogTitle className="font-display text-2xl text-[#1a1a1a]">
                  {info.name}
                </DialogTitle>
                <DialogDescription className="text-[#555555] leading-relaxed">
                  {info.fact}
                </DialogDescription>
              </DialogHeader>

              {boroughSlug && (
                <Link
                  to={`/custom-kitchen-cabinets-${boroughSlug}`}
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-[#445339] transition-colors"
                  onClick={onClose}
                >
                  Explore {info.borough} cabinetry
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NeighborhoodDialog;
