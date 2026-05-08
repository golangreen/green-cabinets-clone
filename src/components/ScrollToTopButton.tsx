/**
 * ScrollToTopButton — floating, mobile-friendly "back to top" button.
 *
 * Appears once the user scrolls past ~400px and smoothly scrolls the
 * window to the top on tap. Needed because iOS Safari's "tap status bar
 * to scroll up" gesture does not reach iframed content (e.g. Lovable
 * preview) and can also fail when extra scroll containers exist.
 */
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);
  const { pathname } = useLocation();
  // Only show the green scroll-to-top arrow on the Finishes & Colors page.
  const enabled = pathname.startsWith("/finishes-colors");

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollUp}
      aria-label="Scroll to top"
      className={`fixed bottom-[60px] right-6 z-50 h-10 w-10 rounded-full bg-[#5C7650] text-white shadow-elegant flex items-center justify-center transition-all duration-300 hover:bg-[#445339] hover:shadow-xl active:scale-95 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
};

export default ScrollToTopButton;
