import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share, MoreVertical } from "lucide-react";

interface InstallPWADialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInstall: () => void;
}

export const InstallPWADialog = ({ open, onOpenChange, onInstall }: InstallPWADialogProps) => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isChrome = !!(window as any).chrome;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Install Green Cabinets</DialogTitle>
          <DialogDescription>
            Get quick access to our app right from your home screen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Desktop/Android Chrome */}
          {!isIOS && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Download className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <h4 className="font-semibold">Quick Install</h4>
                  <p className="text-sm text-muted-foreground">
                    Click the button below to install the app
                  </p>
                </div>
              </div>
              <Button onClick={onInstall} className="w-full" size="lg">
                <Download className="mr-2 h-5 w-5" />
                Install App
              </Button>
            </div>
          )}

          {/* iOS Safari Instructions */}
          {isIOS && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    Tap the <Share className="inline h-4 w-4 mx-1" /> <strong>Share</strong> button at the bottom of your browser
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    Scroll down and tap <strong>"Add to Home Screen"</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    Tap <strong>"Add"</strong> to confirm
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Android non-Chrome */}
          {isAndroid && !isChrome && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    Tap the <MoreVertical className="inline h-4 w-4 mx-1" /> menu button in your browser
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    Select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              The app will work offline and load faster once installed
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
