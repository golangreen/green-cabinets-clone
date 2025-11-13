import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Save, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useEmailSettings } from '../hooks/useEmailSettings';

interface SenderEmailConfigProps {
  hasVerifiedDomain?: boolean;
}

export const SenderEmailConfig = ({ hasVerifiedDomain = false }: SenderEmailConfigProps) => {
  const { settings, isLoading, updateSettings, isUpdating } = useEmailSettings();
  const [senderEmail, setSenderEmail] = useState('');
  const [senderName, setSenderName] = useState('');

  // Update local state when settings are loaded
  useState(() => {
    if (settings) {
      setSenderEmail(settings.sender_email);
      setSenderName(settings.sender_name);
    }
  });

  const handleSave = () => {
    if (!senderEmail || !senderName) {
      return;
    }

    updateSettings({ senderEmail, senderName });
  };

  const isDefaultSender = settings?.sender_email === 'onboarding@resend.dev';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-brand" />
          <CardTitle>Sender Email Configuration</CardTitle>
        </div>
        <CardDescription>
          Configure the sender email address and name for all outgoing emails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasVerifiedDomain && (
          <Alert variant="default" className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm">
              <strong>Domain Verification Required:</strong> To use a custom sender email, you must verify your domain at{' '}
              <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline text-brand">
                resend.com/domains
              </a>. Currently using default Resend sender.
            </AlertDescription>
          </Alert>
        )}

        {isDefaultSender && hasVerifiedDomain && (
          <Alert variant="default" className="border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm">
              <strong>Domain Verified:</strong> You can now configure a custom sender email using your verified domain.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="sender-name">Sender Name</Label>
          <Input
            id="sender-name"
            type="text"
            placeholder="Green Cabinets"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            disabled={isLoading || isUpdating}
          />
          <p className="text-xs text-muted-foreground">
            The name that will appear in recipients' inboxes
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sender-email">Sender Email</Label>
          <Input
            id="sender-email"
            type="email"
            placeholder={hasVerifiedDomain ? "noreply@yourdomain.com" : "onboarding@resend.dev"}
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            disabled={isLoading || isUpdating || !hasVerifiedDomain}
            title={!hasVerifiedDomain ? 'Domain verification required to use custom sender' : ''}
          />
          <p className="text-xs text-muted-foreground">
            {hasVerifiedDomain 
              ? 'Must use an email address from your verified domain'
              : 'Using default Resend sender until domain is verified'}
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={!senderEmail || !senderName || isLoading || isUpdating}
          className="w-full"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>

        {settings && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Current Configuration:</strong>
            </p>
            <div className="mt-2 p-3 bg-muted rounded-md text-sm">
              <p><strong>Name:</strong> {settings.sender_name}</p>
              <p><strong>Email:</strong> {settings.sender_email}</p>
              <p className="text-xs mt-2 text-muted-foreground">
                Last updated: {new Date(settings.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
