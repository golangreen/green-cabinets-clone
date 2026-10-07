/**
 * "Skip to content" for keyboard users: first tab stop on every page. Pages
 * don't all wrap content in <main>, so it focuses the first of main / h1.
 */
const SkipLink = () => (
  <a
    href="#main"
    className="skip-link"
    onClick={(e) => {
      const target = document.querySelector<HTMLElement>("main, h1");
      if (!target) return;
      e.preventDefault();
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: "start" });
    }}
  >
    Skip to content
  </a>
);

export default SkipLink;
