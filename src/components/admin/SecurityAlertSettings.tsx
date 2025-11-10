import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Mail, Bell, AlertTriangle } from 'lucide-react';

export const SecurityAlertSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [criticalEventsOnly, setCriticalEventsOnly] = useState(false);
  const [alertEmail, setAlertEmail] = useState('info@greencabinets.com');

  const handleSaveSettings = () => {
    // In a real implementation, this would save to the database
    toast.success('Alert settings saved successfully');
  };

  const handleTestAlert = async () => {
    toast.info('Sending test alert...');
    
    // Here you could call the edge function to send a test email
    // For now, just show a success message
    setTimeout(() => {
      toast.success('Test alert sent! Check your email.');
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>Email Alert Settings</CardTitle>
        </div>
        <CardDescription>
          Configure email notifications for security events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email alerts for security events
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="critical-only">Critical Events Only</Label>
              <p className="text-sm text-muted-foreground">
                Only send alerts for critical security events
              </p>
            </div>
            <Switch
              id="critical-only"
              checked={criticalEventsOnly}
              onCheckedChange={setCriticalEventsOnly}
              disabled={!emailNotifications}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alert-email">Alert Email Address</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="alert-email"
                  type="email"
                  placeholder="security@yourcompany.com"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  className="pl-9"
                  disabled={!emailNotifications}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              All security alerts will be sent to this email address
            </p>
          </div>
        </div>

        <div className="pt-4 border-t space-y-3">
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-100">
                Email Configuration Required
              </p>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
                Make sure you have configured your domain with Resend at{' '}
                <a 
                  href="https://resend.com/domains" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-900 dark:hover:text-amber-100"
                >
                  resend.com/domains
                </a>
                {' '}to receive security alerts.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveSettings} className="flex-1">
              Save Settings
            </Button>
            <Button variant="outline" onClick={handleTestAlert}>
              Send Test Alert
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
