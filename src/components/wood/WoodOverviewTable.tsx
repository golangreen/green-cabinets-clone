/**
 * Static "all species at a glance" comparison table.
 * Renders the full WOOD_SPECIES list with the headline specs.
 * Mobile: collapses into stacked cards. Desktop: wide table.
 */
import { Link } from "react-router-dom";
import { WOOD_SPECIES } from "@/data/woodSpecies";
import { ArrowRight } from "lucide-react";

const WoodOverviewTable = () => {
  return (
    <div className="w-full">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-[#5C7650] text-white">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Species</th>
              <th className="text-left px-4 py-3 font-semibold">Color</th>
              <th className="text-left px-4 py-3 font-semibold">Grain</th>
              <th className="text-right px-4 py-3 font-semibold">Hardness (Janka)</th>
              <th className="text-center px-4 py-3 font-semibold">Cost</th>
              <th className="text-center px-4 py-3 font-semibold">Best For</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {WOOD_SPECIES.map((w, i) => (
              <tr key={w.slug} className={i % 2 === 0 ? "bg-background" : "bg-muted/40"}>
                <td className="px-4 py-3 font-semibold text-[#1a1a1a] flex items-center gap-3">
                  <span
                    className="inline-block w-5 h-5 rounded-full border border-border shrink-0"
                    style={{ backgroundColor: w.swatch }}
                    aria-hidden="true"
                  />
                  {w.name}
                </td>
                <td className="px-4 py-3 text-[#555555]">{w.color}</td>
                <td className="px-4 py-3 text-[#555555]">{w.grain}</td>
                <td className="px-4 py-3 text-right tabular-nums">{w.jankaHardness.toLocaleString()} lbf</td>
                <td className="px-4 py-3 text-center font-mono text-[#5C7650]">{w.costTier}</td>
                <td className="px-4 py-3 text-[#555555]">{w.uses[0]}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/wood-species/${w.slug}`}
                    className="inline-flex items-center gap-1 text-[#5C7650] hover:text-[#445339] font-medium"
                  >
                    Details <ArrowRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="md:hidden space-y-3">
        {WOOD_SPECIES.map((w) => (
          <Link
            key={w.slug}
            to={`/wood-species/${w.slug}`}
            className="block rounded-lg border border-border bg-background p-4 hover:border-[#5C7650] transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <span
                className="inline-block w-7 h-7 rounded-full border border-border shrink-0"
                style={{ backgroundColor: w.swatch }}
                aria-hidden="true"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-[#1a1a1a]">{w.name}</h3>
                <p className="text-xs text-[#999999]">{w.tagline}</p>
              </div>
              <span className="font-mono text-sm text-[#5C7650]">{w.costTier}</span>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-xs text-[#555555]">
              <div><dt className="text-[#999999]">Hardness</dt><dd>{w.jankaHardness.toLocaleString()} lbf</dd></div>
              <div><dt className="text-[#999999]">Best for</dt><dd>{w.uses[0]}</dd></div>
            </dl>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WoodOverviewTable;
