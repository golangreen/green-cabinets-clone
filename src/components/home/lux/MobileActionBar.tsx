import { useEffect, useState } from "react";
import { openQuote } from "@/lib/quote";

/**
 * Phone-only bottom bar: one thumb-reach path to a quote. Slides in once the
 * hero (with its own button) is gone, and steps aside at the contact section
 * so the same action is never on screen twice.
 */
const MobileActionBar = () => {
  const [pastHero, setPastHero] = useState(false);
  const [atContact, setAtContact] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    const contact = document.getElementById("contact");
    if (!hero || !contact || !("IntersectionObserver" in window)) return;
    const heroIo = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting), { threshold: 0 });
    const contactIo = new IntersectionObserver(([e]) => setAtContact(e.isIntersecting), { threshold: 0.15 });
    heroIo.observe(hero);
    contactIo.observe(contact);
    return () => {
      heroIo.disconnect();
      contactIo.disconnect();
    };
  }, []);

  const shown = pastHero && !atContact;

  return (
    <div
      aria-hidden={!shown}
      className="lux-bar lux-material fixed inset-x-0 bottom-0 z-40 border-t border-white/10 px-4 pt-3 md:hidden"
      style={{
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        transform: shown ? "translateY(0)" : "translateY(100%)",
        transition: `transform ${shown ? 420 : 240}ms var(--ease-drawer)`,
      }}
    >
      <div className="flex items-center gap-3">
        <p className="flex-1 font-display text-xs leading-snug text-stone">
          Free in-home consult
          <br />
          <span className="text-ivory/90">Brooklyn, Manhattan &amp; Queens</span>
        </p>
        <button type="button" tabIndex={shown ? 0 : -1} onClick={openQuote} className="lux-btn">
          Request a quote
        </button>
      </div>
    </div>
  );
};

export default MobileActionBar;
