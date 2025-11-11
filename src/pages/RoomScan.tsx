import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RoomScanner } from '@/components/RoomScanner';
import { ScanSession } from '@/utils/roomScanner';
import { toast } from 'sonner';
import { ArrowLeft, Tablet, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeviceType } from '@/hooks/useDeviceType';
import { ROUTES } from '@/constants/routes';

const RoomScan = () => {
  const navigate = useNavigate();
  const { isMobile } = useDeviceType();

  const handleScanComplete = (scan: ScanSession) => {
    toast.success('Scan completed! Open on tablet or desktop to design your cabinets.');
    
    // Store the scan data for use in the designer
    sessionStorage.setItem('current_scan', JSON.stringify(scan));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.HOME)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">3D Room Scanner</h1>
            <p className="text-lg text-muted-foreground">
              {isMobile 
                ? "Scan your space with your phone's camera. Design your cabinets later on a tablet or desktop."
                : "Scan your space with your device's camera to capture precise measurements for your custom cabinet design"
              }
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <RoomScanner onScanComplete={handleScanComplete} />
        </div>

        <div className="max-w-3xl mx-auto mt-8 space-y-6">
          {isMobile && (
            <div className="p-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Tablet className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Next Step: Design on a Larger Screen
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                    After scanning your room, open this website on a tablet or desktop computer to access the full cabinet designer tool. Your scan will be saved and ready to use.
                  </p>
                  <div className="flex gap-2 text-xs text-green-700 dark:text-green-300">
                    <Monitor className="h-4 w-4" />
                    <span>Desktop & Tablet only for designing</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="p-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              How to Get the Best Scan Results
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>• Ensure good lighting in the room</li>
              <li>• Move slowly and steadily while scanning</li>
              <li>• Point your camera at walls, corners, windows, and doors</li>
              <li>• LiDAR devices (iPhone 12 Pro+) provide the most accurate results</li>
              <li>• Keep the camera at waist height for best detection</li>
              <li>• Scan in a circular motion around the room</li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RoomScan;
