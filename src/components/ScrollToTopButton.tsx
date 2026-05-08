/**
 * ScrollToTopButton — floating, mobile-friendly "back to top" button.
 *
 * Appears once the user scrolls past ~400px and smoothly scrolls the
 * window to the top on tap. Needed because iOS Safari's "tap status bar
 * to scroll up" gesture does not reach iframed content (e.g. Lovable
 * preview) and can also fail when extra scroll containers exist.
 */
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollUp}
      aria-label="Scroll to top"
      className={`fixed bottom-5 right-5 z-50 h-12 w-12 rounded-full bg-[#5C7650] text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-[#445339] hover:shadow-xl active:scale-95 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
};

export default ScrollToTopButton;
