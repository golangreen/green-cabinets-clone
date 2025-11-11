import { useEffect, useState, useCallback } from 'react';
import { fetchAlertSettings, upsertAlertSettings } from '@/services';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, RefreshCw } from 'lucide-react';

interface WebhookRetrySettings {
  retry_threshold: number;
  time_window_minutes: number;
  enabled: boolean;
}

export function SecurityAlertSettings() {
  const [settings, setSettings] = useState<WebhookRetrySettings>({
    retry_threshold: 3,
    time_window_minutes: 10,
    enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAlertSettings('webhook_retry_alert');

      if (data) {
        setSettings(data.setting_value as unknown as WebhookRetrySettings);
      }
    } catch (error) {
      logger.dbError('fetch alert settings', error);
      setSettings({ retry_threshold: 3, time_window_minutes: 10, enabled: true });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertAlertSettings('webhook_retry_alert', settings as unknown as any);

      toast.success("Alert settings saved successfully");
    } catch (error) {
      logger.dbError('save alert settings', error);
      toast.error("Failed to save alert settings");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Webhook Retry Alert Settings</CardTitle>
          <CardDescription>Configure when webhook retry alerts are triggered</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={fetchSettings}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Loading settings...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enabled">Enable Webhook Retry Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Send email alerts when excessive retries are detected
                </p>
              </div>
              <Switch
                id="enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enabled: checked })
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="retry_threshold">Retry Threshold</Label>
                <Input
                  id="retry_threshold"
                  type="number"
                  min="1"
                  max="20"
                  value={settings.retry_threshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      retry_threshold: parseInt(e.target.value) || 3
                    })
                  }
                  disabled={!settings.enabled}
                />
                <p className="text-xs text-muted-foreground">
                  Number of retries before triggering an alert (1-20)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time_window">Time Window (minutes)</Label>
                <Input
                  id="time_window"
                  type="number"
                  min="1"
                  max="120"
                  value={settings.time_window_minutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      time_window_minutes: parseInt(e.target.value) || 10
                    })
                  }
                  disabled={!settings.enabled}
                />
                <p className="text-xs text-muted-foreground">
                  Time window for counting retries (1-120 minutes)
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h4 className="text-sm font-medium">Current Configuration</h4>
              <p className="text-sm text-muted-foreground">
                {settings.enabled ? (
                  <>
                    Alerts will be triggered when the same webhook event is retried{' '}
                    <strong className="text-foreground">{settings.retry_threshold}</strong> or more times
                    within a <strong className="text-foreground">{settings.time_window_minutes}</strong> minute period.
                  </>
                ) : (
                  <span className="text-warning">Webhook retry alerts are currently disabled.</span>
                )}
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
