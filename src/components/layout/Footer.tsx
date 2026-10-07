import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import ObfuscatedPhone from "@/components/privacy/ObfuscatedPhone";
import ObfuscatedEmail from "@/components/privacy/ObfuscatedEmail";
import logoWhite from "@/assets/logos/logo-white.svg";

const COLUMNS = [
  {
    title: "Work",
    links: [
      { label: "Kitchen cabinets", to: "/gallery?category=kitchens" },
      { label: "Bathroom vanities", to: "/gallery?category=vanities" },
      { label: "Closets & storage", to: "/gallery?category=closets" },
      { label: "Design to reality", to: "/gallery?category=design-to-reality" },
      { label: "Case studies", to: "/case-studies" },
    ],
  },
  {
    title: "Plan",
    links: [
      { label: "Services", to: "/#services" },
      { label: "How it works", to: "/#process" },
      { label: "Pricing", to: "/#pricing" },
      { label: "Cost estimator", to: "/estimator" },
      { label: "Design a vanity", to: "/designer" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Wood species guide", to: "/wood-species" },
      { label: "Finishes & colors", to: "/finishes-colors" },
      { label: "Guides & blog", to: "/blog" },
      { label: "About", to: "/about" },
    ],
  },
  {
    title: "Areas",
    links: [
      { label: "Brooklyn", to: "/custom-kitchen-cabinets-brooklyn" },
      { label: "Manhattan", to: "/custom-kitchen-cabinets-manhattan" },
      { label: "Queens", to: "/custom-kitchen-cabinets-queens" },
      { label: "Staten Island", to: "/kitchen-cabinets-staten-island" },
    ],
  },
];

const Footer = () => (
  <footer className="border-t border-white/10 bg-ink text-ivory">
    <div className="mx-auto max-w-[1440px] px-4 pt-20 pb-28 sm:px-6 md:pb-12 lg:px-10">
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link to="/" aria-label="Green Cabinets NY, home" className="inline-flex items-center gap-3">
            <img src={logoWhite} alt="" className="h-12 w-auto" width={62} height={48} />
            <span className="font-lux text-2xl leading-none">Green Cabinets</span>
          </Link>
          <p className="lux-body mt-6 max-w-sm text-sm text-ivory/70">
            Custom kitchen cabinets, vanities, closets and millwork. Designed in Bushwick since 2009.
            Appointment only: there is no walk-in shop or showroom, so we bring the samples to you.
          </p>
          <ul className="mt-6 space-y-2 font-display text-sm text-ivory/80">
            <li>
              <ObfuscatedEmail encoded="b3JkZXJzQGdyZWVuY2FiaW5ldHNueS5jb20=" className="hover:text-ivory" />
            </li>
            <li>
              <ObfuscatedPhone encoded="NzE4ODA0NTQ4OA==" type="tel" className="hover:text-ivory" />
            </li>
            <li>
              <a
                href="https://instagram.com/green_cabinets_"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 hover:text-ivory"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" /> @green_cabinets_
              </a>
            </li>
          </ul>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-8">
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <p className="lux-eyebrow mb-5">{c.title}</p>
              <ul className="space-y-1">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="inline-flex min-h-[36px] items-center font-display text-sm text-ivory/70 transition-colors hover:text-ivory"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-6 font-display text-xs text-stone sm:flex-row sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} Green Cabinets NY. All rights reserved. ·{" "}
          <Link to="/privacy" className="hover:text-ivory">
            Privacy
          </Link>
        </p>
        <p>Serving Brooklyn, Manhattan &amp; Queens by appointment</p>
      </div>
    </div>
  </footer>
);

export default Footer;
