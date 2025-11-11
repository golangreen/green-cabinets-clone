import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SecurityEventsTable } from '@/components/admin/SecurityEventsTable';

export const EventsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Events Log</CardTitle>
      </CardHeader>
      <CardContent>
        <SecurityEventsTable />
      </CardContent>
    </Card>
  );
};
