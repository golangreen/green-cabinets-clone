import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Bell, Settings, Shield, AlertTriangle, RefreshCw, Copy, Volume2 } from 'lucide-react';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

export function NotificationSettingsPanel() {
  const { settings, isLoading, updateSettings, isUpdating } = useNotificationSettings();

  const handleToggle = (field: string, value: boolean) => {
    updateSettings(
      { [field]: value } as any,
      {
        onSuccess: () => {
          toast({
            title: 'Settings Updated',
            description: 'Your notification preferences have been saved.',
          });
        },
        onError: () => {
          toast({
            title: 'Update Failed',
            description: 'Failed to save notification preferences.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleSeverityChange = (value: string) => {
    updateSettings(
      { severity_threshold: value as any },
      {
        onSuccess: () => {
          toast({
            title: 'Severity Threshold Updated',
            description: `Now showing notifications with ${value} severity or higher.`,
          });
        },
      }
    );
  };

  const handleRetryThresholdChange = (value: number[]) => {
    updateSettings(
      { retry_threshold: value[0] },
      {
        onSuccess: () => {
          toast({
            title: 'Retry Threshold Updated',
            description: `Now showing notifications for ${value[0]}+ retry attempts.`,
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notification Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!settings) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Customize which events trigger toast notifications
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Event Type Toggles */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Event Types</h4>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="webhook-security" className="text-sm font-normal">
                Webhook Security Events
              </Label>
            </div>
            <Switch
              id="webhook-security"
              checked={settings.webhook_security_enabled}
              onCheckedChange={(checked) => handleToggle('webhook_security_enabled', checked)}
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="rate-limit" className="text-sm font-normal">
                Rate Limit Violations
              </Label>
            </div>
            <Switch
              id="rate-limit"
              checked={settings.rate_limit_enabled}
              onCheckedChange={(checked) => handleToggle('rate_limit_enabled', checked)}
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="webhook-retry" className="text-sm font-normal">
                Webhook Retries
              </Label>
            </div>
            <Switch
              id="webhook-retry"
              checked={settings.webhook_retry_enabled}
              onCheckedChange={(checked) => handleToggle('webhook_retry_enabled', checked)}
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center gap-2">
              <Copy className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="webhook-duplicate" className="text-sm font-normal">
                Duplicate Webhook Events
              </Label>
            </div>
            <Switch
              id="webhook-duplicate"
              checked={settings.webhook_duplicate_enabled}
              onCheckedChange={(checked) => handleToggle('webhook_duplicate_enabled', checked)}
              disabled={isUpdating}
            />
          </div>
        </div>

        {/* Severity Threshold */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Severity Threshold</h4>
          <div className="space-y-2">
            <Label htmlFor="severity" className="text-sm text-muted-foreground">
              Only show notifications with this severity or higher
            </Label>
            <Select
              value={settings.severity_threshold}
              onValueChange={handleSeverityChange}
              disabled={isUpdating}
            >
              <SelectTrigger id="severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (All notifications)</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Retry Threshold */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Retry Threshold</h4>
          <div className="space-y-2">
            <Label htmlFor="retry-threshold" className="text-sm text-muted-foreground">
              Show retry notifications after {settings.retry_threshold} attempts
            </Label>
            <Slider
              id="retry-threshold"
              min={1}
              max={10}
              step={1}
              value={[settings.retry_threshold]}
              onValueChange={handleRetryThresholdChange}
              disabled={isUpdating}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 attempt</span>
              <span>10+ attempts</span>
            </div>
          </div>
        </div>

        {/* Sound Notifications */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Sound Alerts</h4>
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="sound" className="text-sm font-normal">
                Play sound for critical events
              </Label>
            </div>
            <Switch
              id="sound"
              checked={settings.sound_enabled}
              onCheckedChange={(checked) => handleToggle('sound_enabled', checked)}
              disabled={isUpdating}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Browser must grant audio permission for sound alerts to work
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
