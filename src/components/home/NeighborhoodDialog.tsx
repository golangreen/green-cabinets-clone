import { useEffect, useState } from "react";
import { MapPin, Images, MessageSquare, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getNeighborhoodInfo } from "@/data/neighborhoodFacts";
import { NEIGHBORHOOD_LIST } from "@/data/neighborhoodSeo";

interface Props {
  neighborhood: string | null;
  boroughSlug?: string;
  onClose: () => void;
}

const NeighborhoodDialog = ({ neighborhood, boroughSlug, onClose }: Props) => {
  const open = !!neighborhood;
  const info = neighborhood ? getNeighborhoodInfo(neighborhood) : null;
  const dedicatedPage = neighborhood
    ? NEIGHBORHOOD_LIST.find((n) => n.name === neighborhood)
    : undefined;
  const [isNight, setIsNight] = useState(false);
  useEffect(() => {
    const check = () => {
      const h = new Date().getHours();
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      setIsNight(h >= 22 || h < 6 || prefersDark);
    };
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);


  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-background">
        {info && (
          <>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                info.mapQuery,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-video w-full bg-muted relative group"
              aria-label={`Open ${info.name} in Google Maps`}
            >
              <iframe
                title={`Map of ${info.name}, ${info.borough}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  info.mapQuery,
                )}&z=14&output=embed`}
                className={`w-full h-full border-0 pointer-events-none transition-[filter] duration-500 ${isNight ? "[filter:invert(0.92)_hue-rotate(180deg)_brightness(0.95)_contrast(0.9)]" : ""}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <span className="absolute bottom-2 right-2 text-[10px] font-semibold uppercase tracking-wide bg-background/90 text-foreground px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Open in Maps ↗
              </span>
            </a>
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

              {dedicatedPage && (
                <Link
                  to={`/custom-kitchen-cabinets-${dedicatedPage.slug}`}
                  onClick={onClose}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-[#445339] transition-colors"
                >
                  Read more about cabinetry in {dedicatedPage.name}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      document
                        .getElementById("gallery")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 50);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-[#445339] transition-colors"
                >
                  <Images className="w-4 h-4" />
                  See recent {info.borough} kitchens
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      document
                        .getElementById("contact")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 50);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-[#1a1a1a]/15 text-sm font-semibold text-[#1a1a1a] hover:border-primary hover:text-primary transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Get a free quote
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NeighborhoodDialog;
