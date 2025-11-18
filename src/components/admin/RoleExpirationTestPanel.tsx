import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { TestTube, Send, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RoleExpirationTestPanel = () => {
  const [reminderType, setReminderType] = useState<'3day' | '1day' | 'expired' | 'all'>('all');
  const [previewEmail, setPreviewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewResults, setPreviewResults] = useState<any>(null);
  const [triggerResults, setTriggerResults] = useState<any>(null);

  const handlePreview = async () => {
    try {
      setIsLoading(true);
      setPreviewResults(null);

      const { data, error } = await supabase.functions.invoke('test-role-expiration', {
        body: {
          action: 'preview',
          reminder_type: reminderType,
          preview_email: previewEmail || undefined
        }
      });

      if (error) throw error;

      setPreviewResults(data);
      toast.success('Email previews generated');
    } catch (error: any) {
      console.error('Error generating previews:', error);
      toast.error(error.message || 'Failed to generate previews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrigger = async () => {
    try {
      setIsLoading(true);
      setTriggerResults(null);

      const { data, error } = await supabase.functions.invoke('test-role-expiration', {
        body: {
          action: 'trigger',
          reminder_type: reminderType
        }
      });

      if (error) throw error;

      setTriggerResults(data);
      toast.success('Role expiration check triggered successfully');
    } catch (error: any) {
      console.error('Error triggering check:', error);
      toast.error(error.message || 'Failed to trigger check');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-primary" />
          <CardTitle>Role Expiration Testing</CardTitle>
        </div>
        <CardDescription>
          Test role expiration notifications and preview email templates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="trigger" className="gap-2">
              <Send className="h-4 w-4" />
              Trigger
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email Type</Label>
                <RadioGroup value={reminderType} onValueChange={(v: any) => setReminderType(v)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all-preview" />
                    <Label htmlFor="all-preview" className="font-normal cursor-pointer">
                      All Types
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3day" id="3day-preview" />
                    <Label htmlFor="3day-preview" className="font-normal cursor-pointer">
                      3-Day Reminder
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1day" id="1day-preview" />
                    <Label htmlFor="1day-preview" className="font-normal cursor-pointer">
                      24-Hour Final Reminder
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expired" id="expired-preview" />
                    <Label htmlFor="expired-preview" className="font-normal cursor-pointer">
                      Expired Notification
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preview-email">Preview Email (Optional)</Label>
                <Input
                  id="preview-email"
                  type="email"
                  placeholder="your@email.com"
                  value={previewEmail}
                  onChange={(e) => setPreviewEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to use your account email
                </p>
              </div>

              <Button onClick={handlePreview} disabled={isLoading} className="w-full">
                <Eye className="mr-2 h-4 w-4" />
                Generate Preview
              </Button>
            </div>

            {previewResults && (
              <div className="space-y-3 mt-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Generated {previewResults.previews?.length || 0} email preview(s)
                  </AlertDescription>
                </Alert>

                {previewResults.previews?.map((preview: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{preview.type.toUpperCase()}</span>
                      <span className="text-xs text-muted-foreground">To: {preview.to}</span>
                    </div>
                    <p className="text-sm font-medium">{preview.subject}</p>
                    <details className="text-xs">
                      <summary className="cursor-pointer text-primary">View HTML</summary>
                      <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto max-h-48">
                        {preview.html}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trigger" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will send actual emails to users with expiring roles
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Reminder Type</Label>
                <RadioGroup value={reminderType} onValueChange={(v: any) => setReminderType(v)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all-trigger" />
                    <Label htmlFor="all-trigger" className="font-normal cursor-pointer">
                      All Types
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3day" id="3day-trigger" />
                    <Label htmlFor="3day-trigger" className="font-normal cursor-pointer">
                      3-Day Reminders Only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1day" id="1day-trigger" />
                    <Label htmlFor="1day-trigger" className="font-normal cursor-pointer">
                      24-Hour Reminders Only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expired" id="expired-trigger" />
                    <Label htmlFor="expired-trigger" className="font-normal cursor-pointer">
                      Expired Roles Only
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button onClick={handleTrigger} disabled={isLoading} variant="destructive" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Trigger Role Expiration Check
              </Button>
            </div>

            {triggerResults && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Check completed successfully:</p>
                    <ul className="text-sm list-disc list-inside">
                      <li>{triggerResults.results?.three_day_reminders || 0} 3-day reminders sent</li>
                      <li>{triggerResults.results?.one_day_reminders || 0} 24-hour reminders sent</li>
                      <li>{triggerResults.results?.expired_notifications || 0} expiration notifications sent</li>
                      <li>{triggerResults.results?.roles_removed || 0} roles removed</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
