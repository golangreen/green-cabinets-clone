import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Send, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { emailService } from '@/services';
import { toast } from '@/hooks/use-toast';

interface EmailTestPanelProps {
  hasVerifiedDomain?: boolean;
  accountEmail?: string;
}

export const EmailTestPanel = ({ hasVerifiedDomain = false, accountEmail = 'greencabinets@gmail.com' }: EmailTestPanelProps) => {
  const [email, setEmail] = useState(accountEmail);
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSendTest = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    setLastResult(null);

    try {
      await emailService.sendTestEmail({ toEmail: email });

      setLastResult({
        success: true,
        message: 'Test email sent successfully!',
      });

      toast({
        title: 'Success',
        description: 'Test email sent successfully!',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send test email';
      
      setLastResult({
        success: false,
        message: errorMessage,
      });

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-brand" />
          <CardTitle>Email Testing</CardTitle>
        </div>
        <CardDescription>
          Send a test email to verify your Resend configuration is working correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasVerifiedDomain && (
          <Alert variant="default" className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm">
              <strong>Domain Verification Required:</strong> Without a verified domain, test emails can only be sent to your Resend account email ({accountEmail}).
              To send to other recipients, verify a domain at{' '}
              <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline text-brand">
                resend.com/domains
              </a>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="test-email">Recipient Email</Label>
          <div className="flex gap-2">
            <Input
              id="test-email"
              type="email"
              placeholder={hasVerifiedDomain ? "test@example.com" : accountEmail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSending || !hasVerifiedDomain}
              title={!hasVerifiedDomain ? `Test emails restricted to ${accountEmail} without verified domain` : ''}
            />
            <Button
              onClick={handleSendTest}
              disabled={isSending || !email}
              className="shrink-0"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test
                </>
              )}
            </Button>
          </div>
          {!hasVerifiedDomain && (
            <p className="text-xs text-muted-foreground">
              Currently restricted to: {accountEmail}
            </p>
          )}
        </div>

        {lastResult && (
          <Alert variant={lastResult.success ? 'default' : 'destructive'}>
            {lastResult.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>{lastResult.message}</AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Test emails use the default onboarding@resend.dev sender</p>
          <p>• Check your spam folder if you don't receive the email</p>
          {hasVerifiedDomain ? (
            <p>• ✓ Domain verified - can send to any email address</p>
          ) : (
            <p>• ⚠ No verified domain - restricted to account email only</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
