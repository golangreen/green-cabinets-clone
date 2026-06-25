import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo-new.png";


const VanityDesignerEmbed = () => (
  <>
    <Helmet>
      <title>Design Your Vanity | Green Cabinets NY</title>
      <meta name="description" content="Interactive 3D bathroom vanity designer. Configure dimensions, finishes, and hardware in real time." />
      <meta name="robots" content="index,follow" />
    </Helmet>
    <Link
      to="/"
      aria-label="Back to Green Cabinets NY"
      style={{
        position: "fixed",
        top: "max(12px, env(safe-area-inset-top))",
        left: "max(12px, env(safe-area-inset-left))",
        zIndex: 2147483647,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px 8px 10px",
        borderRadius: 999,
        background: "rgba(30,27,22,0.78)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(168,133,79,0.45)",
        color: "#EDE6D8",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        fontSize: 12.5,
        fontWeight: 600,
        letterSpacing: "0.03em",
        textDecoration: "none",
        boxShadow: "0 6px 20px rgba(20,17,12,0.35)",
      }}
    >
      <ArrowLeft size={14} strokeWidth={2.5} />
      Back to site
    </Link>
    <Link
      to="/"
      aria-label="Green Cabinets NY home"
      style={{
        position: "fixed",
        top: "max(12px, env(safe-area-inset-top))",
        right: "max(12px, env(safe-area-inset-right))",
        zIndex: 2147483647,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 12px",
        borderRadius: 999,
        background: "rgba(30,27,22,0.78)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(168,133,79,0.45)",
        boxShadow: "0 6px 20px rgba(20,17,12,0.35)",
      }}
    >
      <img src={logo} alt="Green Cabinets NY" style={{ height: 22, width: "auto", display: "block" }} />
    </Link>
    <iframe
      src="/vanity-designer.html"
      title="Vanity Designer"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: "none",
        margin: 0,
        padding: 0,
        display: "block",
      }}
      allow="clipboard-write; fullscreen"
    />
  </>
);

export default VanityDesignerEmbed;
