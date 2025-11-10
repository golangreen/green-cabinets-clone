import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Scan, 
  Camera, 
  Ruler, 
  Check, 
  AlertCircle,
  Smartphone,
  Tablet,
  Download,
  Trash2
} from 'lucide-react';
import { roomScanner, ScanSession } from '@/utils/roomScanner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RoomScannerProps {
  onScanComplete?: (scan: ScanSession) => void;
}

export const RoomScanner = ({ onScanComplete }: RoomScannerProps) => {
  const [capabilities, setCapabilities] = useState({
    hasLiDAR: false,
    hasARKit: false,
    hasARCore: false,
    canScan: false
  });
  const [isScanning, setIsScanning] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [savedScans, setSavedScans] = useState<ScanSession[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanSession | null>(null);

  useEffect(() => {
    checkDeviceCapabilities();
    loadSavedScans();
  }, []);

  const checkDeviceCapabilities = async () => {
    const caps = await roomScanner.checkCapabilities();
    setCapabilities(caps);
  };

  const loadSavedScans = () => {
    const scans = roomScanner.getSavedScans();
    setSavedScans(scans);
  };

  const handleStartScan = async () => {
    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    const hasPermission = await roomScanner.requestPermissions();
    if (!hasPermission) {
      toast.error('Camera permission is required for scanning');
      return;
    }

    setIsScanning(true);
    toast.info('Starting room scan...');

    try {
      // Start the scanning process
      const scan = await roomScanner.startScan(roomName);
      
      // Simulate scanning progress
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save the scan
      roomScanner.saveScanToStorage(scan);
      loadSavedScans();
      
      toast.success('Room scan completed successfully!');
      
      if (onScanComplete) {
        onScanComplete(scan);
      }
      
      setRoomName('');
      setSelectedScan(scan);
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to complete scan');
    } finally {
      setIsScanning(false);
    }
  };

  const handleDeleteScan = (scanId: string) => {
    roomScanner.deleteScan(scanId);
    loadSavedScans();
    if (selectedScan?.id === scanId) {
      setSelectedScan(null);
    }
    toast.success('Scan deleted');
  };

  const handleUseScan = (scan: ScanSession) => {
    if (onScanComplete) {
      onScanComplete(scan);
    }
    toast.success(`Using measurements from ${scan.roomName}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5" />
                3D Room Scanner
              </CardTitle>
              <CardDescription>
                Scan your room with your device's camera to capture accurate measurements
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Device Info
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Device Capabilities</DialogTitle>
                  <DialogDescription>
                    Your device's 3D scanning capabilities
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">LiDAR Scanner</span>
                    <Badge variant={capabilities.hasLiDAR ? 'default' : 'secondary'}>
                      {capabilities.hasLiDAR ? 'Available' : 'Not Available'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">ARKit (iOS)</span>
                    <Badge variant={capabilities.hasARKit ? 'default' : 'secondary'}>
                      {capabilities.hasARKit ? 'Available' : 'Not Available'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">ARCore (Android)</span>
                    <Badge variant={capabilities.hasARCore ? 'default' : 'secondary'}>
                      {capabilities.hasARCore ? 'Available' : 'Not Available'}
                    </Badge>
                  </div>
                  {capabilities.hasLiDAR && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        <Check className="h-4 w-4 inline mr-2" />
                        Your device supports high-precision LiDAR scanning for millimeter-accurate measurements!
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!capabilities.canScan && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-900 dark:text-amber-100">
                    Mobile Device Required
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 mt-1">
                    3D room scanning requires a mobile device with a camera. Please open this app on your smartphone or tablet.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="room-name">Room Name</Label>
              <Input
                id="room-name"
                placeholder="e.g., Kitchen, Master Bathroom"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                disabled={isScanning || !capabilities.canScan}
              />
            </div>

            <Button
              onClick={handleStartScan}
              disabled={isScanning || !capabilities.canScan || !roomName.trim()}
              className="w-full"
              size="lg"
            >
              {isScanning ? (
                <>
                  <Scan className="h-5 w-5 mr-2 animate-pulse" />
                  Scanning...
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5 mr-2" />
                  Start 3D Scan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="scans" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scans">
            Saved Scans ({savedScans.length})
          </TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedScan}>
            Scan Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scans" className="space-y-3">
          {savedScans.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Ruler className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No saved scans yet</p>
                <p className="text-sm mt-1">Start your first room scan above</p>
              </CardContent>
            </Card>
          ) : (
            savedScans.map((scan) => (
              <Card key={scan.id} className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1" onClick={() => setSelectedScan(scan)}>
                      <h3 className="font-semibold">{scan.roomName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {roomScanner.formatMeasurement(scan.measurements.width)} × {roomScanner.formatMeasurement(scan.measurements.depth)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUseScan(scan)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Use
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteScan(scan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="details">
          {selectedScan && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedScan.roomName}</CardTitle>
                <CardDescription>
                  Scanned on {new Date(selectedScan.createdAt).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Width</p>
                    <p className="text-2xl font-bold">
                      {roomScanner.formatMeasurement(selectedScan.measurements.width)}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Depth</p>
                    <p className="text-2xl font-bold">
                      {roomScanner.formatMeasurement(selectedScan.measurements.depth)}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Height</p>
                    <p className="text-2xl font-bold">
                      {roomScanner.formatMeasurement(selectedScan.measurements.height)}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Floor Area</p>
                    <p className="text-2xl font-bold">
                      {selectedScan.measurements.area.toFixed(1)} m²
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Detected Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">Walls</span>
                      <Badge>{selectedScan.measurements.walls.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">Windows</span>
                      <Badge>{selectedScan.measurements.windows.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">Doors</span>
                      <Badge>{selectedScan.measurements.doors.length}</Badge>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => handleUseScan(selectedScan)}
                  className="w-full"
                >
                  Use These Measurements
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
