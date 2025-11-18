import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RoomScanner } from '@/components/RoomScanner';
import { ScanSession } from '@/utils/roomScanner';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RoomScan = () => {
  const navigate = useNavigate();

  const handleScanComplete = (scan: ScanSession) => {
    toast.success('Scan completed! You can now use these measurements in the designer.');
    
    // Store the scan data for use in the designer
    sessionStorage.setItem('current_scan', JSON.stringify(scan));
    
    // Optionally navigate to the designer
    // navigate('/designer');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">3D Room Scanner</h1>
            <p className="text-lg text-muted-foreground">
              Scan your space with your device's camera to capture precise measurements for your custom cabinet design
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <RoomScanner onScanComplete={handleScanComplete} />
        </div>

        <div className="max-w-3xl mx-auto mt-8 p-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
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
      </main>
      
      <Footer />
    </div>
  );
};

export default RoomScan;
