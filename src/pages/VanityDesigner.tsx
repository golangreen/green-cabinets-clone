import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2, Share2, Mail, Download, Save, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Vanity3DPreview } from "@/components/Vanity3DPreview";
import { toast } from "sonner";

type TabType = "design" | "details" | "share" | "help";

const VanityDesigner = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("design");
  
  // Configuration state
  const [width, setWidth] = useState(48);
  const [depth, setDepth] = useState(21);
  const [height, setHeight] = useState(34);
  const [brand, setBrand] = useState("EGGER");
  const [finish, setFinish] = useState("White Oak");
  const [doorStyle, setDoorStyle] = useState("Shaker");
  const [countertop, setCountertop] = useState("Quartz White");
  const [sinkStyle, setSinkStyle] = useState("Undermount");
  const [sinkShape, setSinkShape] = useState("Rectangular");
  const [numDrawers, setNumDrawers] = useState(3);
  const [handleStyle, setHandleStyle] = useState("Modern Bar");

  const handleSaveConfig = () => {
    toast.success("Configuration saved!");
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      {/* Top Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Vanity Designer</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveConfig}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="default" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <nav className="h-12 border-b border-border bg-card flex items-center px-4 gap-1">
        <Button
          variant={activeTab === "design" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("design")}
          className="rounded-md"
        >
          Design
        </Button>
        <Button
          variant={activeTab === "details" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("details")}
          className="rounded-md"
        >
          Details
        </Button>
        <Button
          variant={activeTab === "share" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("share")}
          className="rounded-md"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button
          variant={activeTab === "help" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("help")}
          className="rounded-md"
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Help
        </Button>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Configuration Panel */}
        <aside className="w-80 border-r border-border bg-card overflow-y-auto">
          <div className="p-6 space-y-6">
            {activeTab === "design" && (
              <>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Dimensions</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Width (inches)
                      </label>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                        min="24"
                        max="96"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Depth (inches)
                      </label>
                      <input
                        type="number"
                        value={depth}
                        onChange={(e) => setDepth(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                        min="18"
                        max="24"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Height (inches)
                      </label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                        min="30"
                        max="36"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Material Brand</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {["EGGER", "TAFISA"].map((b) => (
                      <Button
                        key={b}
                        variant={brand === b ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBrand(b)}
                        className="justify-start"
                      >
                        {b}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Finish</h3>
                  <div className="space-y-2">
                    {["White Oak", "Walnut", "Casella Oak", "White"].map((f) => (
                      <Button
                        key={f}
                        variant={finish === f ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFinish(f)}
                        className="w-full justify-start"
                      >
                        {f}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Door Style</h3>
                  <div className="space-y-2">
                    {["Shaker", "Flat Panel", "Raised Panel"].map((style) => (
                      <Button
                        key={style}
                        variant={doorStyle === style ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDoorStyle(style)}
                        className="w-full justify-start"
                      >
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "details" && (
              <>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Countertop</h3>
                  <div className="space-y-2">
                    {["Quartz White", "Granite Black", "Marble Carrara", "Solid Surface"].map((ct) => (
                      <Button
                        key={ct}
                        variant={countertop === ct ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCountertop(ct)}
                        className="w-full justify-start"
                      >
                        {ct}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Sink Style</h3>
                  <div className="space-y-2">
                    {["Undermount", "Vessel", "Drop-in"].map((style) => (
                      <Button
                        key={style}
                        variant={sinkStyle === style ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSinkStyle(style)}
                        className="w-full justify-start"
                      >
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Sink Shape</h3>
                  <div className="space-y-2">
                    {["Rectangular", "Round", "Oval"].map((shape) => (
                      <Button
                        key={shape}
                        variant={sinkShape === shape ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSinkShape(shape)}
                        className="w-full justify-start"
                      >
                        {shape}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "share" && (
              <>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Export Options</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Download Configuration
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Configuration
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share on Social Media
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Preview Image</h3>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download Share Image
                  </Button>
                </div>
              </>
            )}

            {activeTab === "help" && (
              <>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Getting Started</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use the Design tab to set your vanity dimensions and choose materials. 
                    Switch to Details to customize countertop and sink options.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Tips</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Standard vanity height is 34 inches</li>
                    <li>• Recommended depth is 21 inches</li>
                    <li>• Minimum width is 24 inches</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Support</h3>
                  <Button variant="outline" className="w-full justify-start">
                    Contact Support
                  </Button>
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Center - 3D Preview */}
        <main className="flex-1 bg-muted/10 flex items-center justify-center p-8">
          <div className="w-full h-full max-w-5xl">
            <Vanity3DPreview
              width={width}
              depth={depth}
              height={height}
              brand={brand}
              finish={finish}
              doorStyle={doorStyle}
              numDrawers={numDrawers}
              handleStyle={handleStyle}
            />
          </div>
        </main>

        {/* Right Sidebar - Properties */}
        <aside className="w-64 border-l border-border bg-card p-6">
          <h3 className="text-sm font-semibold mb-4">Configuration</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Width:</span>
              <span className="font-medium">{width}"</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Depth:</span>
              <span className="font-medium">{depth}"</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Height:</span>
              <span className="font-medium">{height}"</span>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Brand:</span>
                <span className="font-medium">{brand}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Finish:</span>
                <span className="font-medium">{finish}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Door:</span>
                <span className="font-medium">{doorStyle}</span>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex justify-between text-base font-semibold">
                <span>Estimated Price:</span>
                <span className="text-primary">${(width * 50).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default VanityDesigner;
