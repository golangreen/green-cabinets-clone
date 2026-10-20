import { Link } from "react-router-dom";
import { ArrowRight, Box, FileScan, Ruler, ScanLine } from "lucide-react";
import { isApp } from "@/lib/platform";

const TOOLS = [
  { to: "/ar", icon: Box, k: "Cabinets in your room", v: "Place real-size cabinets with the camera and try every finish." },
  { to: "/measure", icon: Ruler, k: "Measure with the camera", v: "Walls, gaps and windows. Send us the lengths." },
  { to: "/scan", icon: ScanLine, k: "Scan the whole room", v: "A measured 3D room on iPhone Pro and iPad Pro." },
  { to: "/drawings", icon: FileScan, k: "Scan your drawings", v: "Plans or a sketch, straightened and sent for a price." },
];

/** App home, right under the hero: the four tools only the app has. */
const AppTools = () => {
  if (!isApp()) return null;
  return (
    <section aria-labelledby="tools-title" className="bg-ink px-4 py-14 text-ivory sm:px-6">
      <div className="mx-auto max-w-[1200px]">
        <p className="lux-eyebrow mb-4">In the app</p>
        <h2 id="tools-title" className="lux-display text-[clamp(2rem,5vw,3.2rem)]">
          Start from your own room.
        </h2>
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TOOLS.map(({ to, icon: Icon, k, v }) => (
            <li key={to}>
              <Link
                to={to}
                className="flex min-h-[88px] items-center gap-4 border border-white/12 bg-white/[0.03] px-5 py-4 transition-colors duration-150 active:scale-[0.99] active:bg-white/[0.06]"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brass/50 text-brass">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-lux text-[1.45rem] leading-tight">{k}</span>
                  <span className="lux-body mt-0.5 block text-sm text-ivory/65">{v}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-ivory/50" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default AppTools;
