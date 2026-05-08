/**
 * Redirects legacy/alternate neighborhood & borough URL shapes to the
 * canonical `/custom-kitchen-cabinets-{slug}` format.
 *
 * Handles: /neighborhoods/:slug, /neighborhood/:slug, /borough/:slug,
 *          /boroughs/:slug, /custom-kitchen-cabinets/:slug (slash variant)
 */
import { Navigate, useParams } from "react-router-dom";

const LegacyRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <Navigate to="/" replace />;
  return <Navigate to={`/custom-kitchen-cabinets-${slug}`} replace />;
};

export default LegacyRedirect;
