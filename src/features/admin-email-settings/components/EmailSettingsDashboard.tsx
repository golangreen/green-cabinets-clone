import { ResendConfiguration } from './ResendConfiguration';
import { DomainVerificationStatus } from './DomainVerificationStatus';
import { EmailTestPanel } from './EmailTestPanel';
import { EmailDeliveryStats } from '@/features/admin-security/components/EmailDeliveryStats';
import { useResendHealth } from '../hooks/useResendHealth';
import { LoadingState } from '@/components/layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const EmailSettingsDashboard = () => {
  const { data, isLoading, error } = useResendHealth();

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load email settings: {error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Email Settings</h1>
        <p className="text-muted-foreground">
          Manage Resend configuration, domain verification, and monitor email delivery
        </p>
      </div>

      <ResendConfiguration 
        apiKeyConfigured={data?.api_key_configured ?? false}
        webhookConfigured={data?.webhook_configured ?? false}
      />

      <DomainVerificationStatus 
        domains={data?.domains ?? []} 
        domainsError={data?.domainsError}
      />

      <EmailTestPanel 
        hasVerifiedDomain={data?.domains?.some(d => d.status === 'verified') ?? false}
        accountEmail="greencabinets@gmail.com"
      />

      <EmailDeliveryStats />
    </div>
  );
};
