import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";

const VanityDesignerEmbed = () => (
  <>
    <Helmet>
      <title>Design Your Vanity | Green Cabinets NY</title>
      <meta
        name="description"
        content="Interactive 3D bathroom vanity designer. Configure dimensions, finishes, and hardware in real time."
      />
      <meta name="robots" content="index,follow" />
    </Helmet>
    <div className="min-h-screen flex flex-col bg-[#d5d5d5]">
      <Header />
      <main className="flex-1 pt-[96px] sm:pt-[128px] md:pt-[160px] pb-6 sm:pb-8">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="mx-auto max-w-[1280px] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden">
            <iframe
              src="/vanity-designer.html"
              title="Vanity Designer"
              className="block w-full border-0"
              style={{ height: "calc(100vh - 180px)", minHeight: 640 }}
              allow="clipboard-write; fullscreen"
            />
          </div>
        </div>
      </main>
    </div>
  </>
);

export default VanityDesignerEmbed;
