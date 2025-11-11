import { Shield } from 'lucide-react';
import { SecurityTabs } from './components/SecurityTabs';

export const SecurityDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Security Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Monitor security events, manage IP blocks, and review system alerts
        </p>
      </div>

      <SecurityTabs />
    </div>
  );
};
