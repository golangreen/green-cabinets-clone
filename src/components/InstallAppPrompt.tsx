import { useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { InstallPWADialog } from "@/components/InstallPWADialog";

export const InstallAppPrompt = () => {
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem("install-prompt-dismissed") === "true";
  });
  const { isInstallable, promptInstall } = usePWAInstall();

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setShowInstallDialog(false);
      setDismissed(true);
      localStorage.setItem("install-prompt-dismissed", "true");
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("install-prompt-dismissed", "true");
  };

  if (!isInstallable || dismissed) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-background border border-border shadow-lg rounded-lg p-3 max-w-sm">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-full shrink-0">
              <Download className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium mb-1">Install Our App</p>
              <p className="text-xs text-muted-foreground mb-3">
                Quick access from your home screen
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => setShowInstallDialog(true)}
                  className="text-xs h-8"
                >
                  Install
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleDismiss}
                  className="text-xs h-8"
                >
                  Not now
                </Button>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 shrink-0"
              onClick={handleDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <InstallPWADialog 
        open={showInstallDialog} 
        onOpenChange={setShowInstallDialog}
        onInstall={handleInstall}
      />
    </>
  );
};
