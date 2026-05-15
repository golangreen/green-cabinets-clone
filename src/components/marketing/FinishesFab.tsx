/**
 * FinishesFab — sticky floating action button for /finishes-colors.
 * Always-visible entry point so the materials catalog is never buried
 * inside the wood library or any other page. Hidden on /finishes-colors
 * itself (already there) and on /designer (full-screen tool).
 */
import { Link, useLocation } from "react-router-dom";
import { Palette } from "lucide-react";

const HIDDEN_ROUTES = ["/finishes-colors", "/designer"];

const FinishesFab = () => {
  const { pathname } = useLocation();
  if (HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) return null;

  return (
    <Link
      to="/finishes-colors"
      aria-label="Browse finishes and colors"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 inline-flex items-center gap-2 bg-[#5C7650] hover:bg-[#445339] text-white font-semibold px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl transition-all hover:scale-105 hover:shadow-[0_10px_40px_-10px_rgba(92,118,80,0.6)]"
    >
      <Palette className="h-5 w-5" aria-hidden />
      <span className="text-sm sm:text-base">Finishes &amp; Colors</span>
    </Link>
  );
};

export default FinishesFab;
