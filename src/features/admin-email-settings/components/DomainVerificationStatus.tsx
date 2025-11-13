import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Globe, AlertCircle } from 'lucide-react';
import type { ResendDomain } from '../hooks/useResendHealth';

interface DomainVerificationStatusProps {
  domains: ResendDomain[];
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'verified':
    case 'success':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'failed':
    case 'not_started':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'verified':
    case 'success':
      return <CheckCircle2 className="h-3 w-3" />;
    case 'pending':
      return <AlertCircle className="h-3 w-3" />;
    case 'failed':
    case 'not_started':
      return <XCircle className="h-3 w-3" />;
    default:
      return <AlertCircle className="h-3 w-3" />;
  }
};

export const DomainVerificationStatus = ({ domains }: DomainVerificationStatusProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <CardTitle>Domain Verification</CardTitle>
        </div>
        <CardDescription>
          DNS records and domain verification status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {domains.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No domains configured. Add a domain in Resend to start sending emails.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {domains.map((domain) => (
              <div key={domain.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{domain.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Region: {domain.region} • Created: {new Date(domain.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(domain.status)} className="gap-1">
                    {getStatusIcon(domain.status)}
                    {domain.status}
                  </Badge>
                </div>

                {domain.records && domain.records.length > 0 && (
                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2 font-medium">Type</th>
                            <th className="text-left p-2 font-medium">Name</th>
                            <th className="text-left p-2 font-medium">Value</th>
                            <th className="text-left p-2 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {domain.records.map((record, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">
                                <Badge variant="outline">{record.type}</Badge>
                              </td>
                              <td className="p-2 font-mono text-xs">{record.name || '-'}</td>
                              <td className="p-2 font-mono text-xs max-w-xs truncate" title={record.value}>
                                {record.value}
                              </td>
                              <td className="p-2">
                                <Badge variant={getStatusColor(record.status)} className="gap-1">
                                  {getStatusIcon(record.status)}
                                  {record.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
