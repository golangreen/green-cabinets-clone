import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Settings } from 'lucide-react';

interface ResendConfigurationProps {
  apiKeyConfigured: boolean;
  webhookConfigured: boolean;
}

export const ResendConfiguration = ({ apiKeyConfigured, webhookConfigured }: ResendConfigurationProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <CardTitle>Resend Configuration</CardTitle>
        </div>
        <CardDescription>
          Current email service configuration status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">API Key</p>
            <p className="text-sm text-muted-foreground">RESEND_API_KEY secret</p>
          </div>
          {apiKeyConfigured ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Configured
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              Missing
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Webhook Secret</p>
            <p className="text-sm text-muted-foreground">RESEND_WEBHOOK_SECRET secret</p>
          </div>
          {webhookConfigured ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Configured
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <XCircle className="h-3 w-3" />
              Not Set
            </Badge>
          )}
        </div>

        <div className="rounded-md bg-muted p-3 text-sm">
          <p className="font-medium mb-2">Setup Instructions:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Create account at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com</a></li>
            <li>Add and verify your domain at <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com/domains</a></li>
            <li>Create API key at <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com/api-keys</a></li>
            <li>Configure webhook at <a href="https://resend.com/webhooks" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com/webhooks</a></li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
