import { Link } from "react-router-dom";

/**
 * Skip link for keyboard navigation
 * Allows keyboard users to skip to main content
 */
export function SkipLink() {
  return (
    <Link
      to="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
    >
      Skip to main content
    </Link>
  );
}
