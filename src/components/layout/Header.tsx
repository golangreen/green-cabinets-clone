import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import QuoteForm from "@/components/marketing/QuoteForm";
import { QUOTE_EVENT, openQuote } from "@/lib/quote";
import logoWhite from "@/assets/logos/logo-white.svg";

const NAV = [
  { label: "Work", to: "/gallery" },
  { label: "Services", to: "/services" },
  { label: "Process", to: "/#process" },
  { label: "Pricing", to: "/#pricing" },
  { label: "Materials", to: "/wood-species" },
  { label: "Guides", to: "/blog" },
];

const MENU_GROUPS = [
  {
    title: "Our work",
    links: [
      { label: "Kitchens", to: "/gallery?category=kitchens" },
      { label: "Vanities", to: "/gallery?category=vanities" },
      { label: "Closets", to: "/gallery?category=closets" },
      { label: "Design to reality", to: "/gallery?category=design-to-reality" },
      { label: "Case studies", to: "/case-studies" },
    ],
  },
  {
    title: "Plan your project",
    links: [
      { label: "Services", to: "/services" },
      { label: "Scan your room", to: "/scan" },
      { label: "How it works", to: "/#process" },
      { label: "Pricing", to: "/#pricing" },
      { label: "Cost estimator", to: "/estimator" },
      { label: "Design a vanity", to: "/designer" },
      { label: "Wood species", to: "/wood-species" },
      { label: "Finishes & colors", to: "/finishes-colors" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Guides & blog", to: "/blog" },
      { label: "Contact", to: "/#contact" },
    ],
  },
];

const Header = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  // Which top-level section the current page belongs to (anchors on the homepage never are)
  const sectionOf = (to: string) => {
    if (to.includes("#")) return false;
    if (to === "/wood-species") return pathname.startsWith("/wood-species") || pathname === "/finishes-colors";
    if (to === "/blog") return pathname.startsWith("/blog");
    return pathname === to || pathname.startsWith(to + "/");
  };
  const [atTop, setAtTop] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // One quote form for the whole site; any button can open it via openQuote()
  useEffect(() => {
    const open = () => setQuoteOpen(true);
    window.addEventListener(QUOTE_EVENT, open);
    return () => window.removeEventListener(QUOTE_EVENT, open);
  }, []);

  // Over the homepage hero the bar is clear; everywhere else it is a material
  const clear = isHome && atTop;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
        clear ? "bg-transparent border-b border-transparent" : "lux-material border-b border-white/10"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 md:h-20 max-w-[1440px] items-center justify-between gap-6 px-[max(1rem,env(safe-area-inset-left))] sm:px-6 lg:px-10"
      >
        <Link to="/" aria-label="Green Cabinets NY, home" className="flex min-w-0 items-center gap-3">
          <img src={logoWhite} alt="" className="h-10 md:h-12 w-auto" width={52} height={40} />
          <span className="hidden min-[360px]:inline font-lux text-[1.35rem] md:text-2xl leading-none tracking-tight text-ivory whitespace-nowrap">
            Green Cabinets
          </span>
        </Link>

        <ul className="hidden lg:flex items-center gap-8 font-display text-[0.92rem] text-ivory/80">
          {NAV.map((n) => (
            <li key={n.label}>
              <Link
                to={n.to}
                aria-current={sectionOf(n.to) ? "page" : undefined}
                className="lux-link lux-link-quiet py-2 transition-colors hover:text-ivory aria-[current=page]:text-ivory"
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-2">
          {/* Homepage phones already have the bottom quote bar; don't show the action twice */}
          <button
            type="button"
            onClick={openQuote}
            className={`lux-btn !min-h-[44px] !px-5 text-sm ${isHome ? "max-md:!hidden" : ""}`}
          >
            <span className="sm:hidden">Quote</span>
            <span className="hidden sm:inline">Request a quote</span>
          </button>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-full text-ivory transition-transform duration-150 active:scale-95"
              >
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(88vw,380px)] border-l border-white/10 bg-ink-2 p-0 text-ivory [&>button]:hidden data-[state=open]:duration-[350ms] data-[state=closed]:duration-200 [transition-timing-function:var(--ease-drawer)]"
            >
              <div className="flex h-16 items-center justify-between px-6" style={{ marginTop: "env(safe-area-inset-top, 0px)" }}>
                <SheetTitle className="font-lux text-2xl font-medium text-ivory">Menu</SheetTitle>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ivory/80 active:scale-95"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="h-[calc(100dvh-4rem-env(safe-area-inset-top,0px))] overflow-y-auto overscroll-contain px-6 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]">
                {MENU_GROUPS.map((g) => (
                  <div key={g.title} className="border-t border-white/10 py-5">
                    <p className="lux-eyebrow mb-3">{g.title}</p>
                    <ul>
                      {g.links.map((l) => (
                        <li key={l.label}>
                          <Link
                            to={l.to}
                            onClick={() => setMenuOpen(false)}
                            aria-current={l.to === pathname ? "page" : undefined}
                            className="block py-2 font-lux text-[1.6rem] leading-tight text-ivory/90 hover:text-ivory aria-[current=page]:text-brass"
                          >
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <button
                  type="button"
                  className="lux-btn mt-4 w-full"
                  onClick={() => {
                    setMenuOpen(false);
                    openQuote();
                  }}
                >
                  Request a quote
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <QuoteForm isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} />
    </header>
  );
};

export default Header;
