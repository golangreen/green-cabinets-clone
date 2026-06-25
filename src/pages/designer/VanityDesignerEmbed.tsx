import { Helmet } from "react-helmet-async";

const VanityDesignerEmbed = () => (
  <>
    <Helmet>
      <title>Design Your Vanity | Green Cabinets NY</title>
      <meta name="description" content="Interactive 3D bathroom vanity designer. Configure dimensions, finishes, and hardware in real time." />
      <meta name="robots" content="index,follow" />
    </Helmet>
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
