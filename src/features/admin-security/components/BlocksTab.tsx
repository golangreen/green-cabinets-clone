import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BlockedIPsTable } from '@/components/admin/BlockedIPsTable';

export const BlocksTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>IP Block Management</CardTitle>
      </CardHeader>
      <CardContent>
        <BlockedIPsTable />
      </CardContent>
    </Card>
  );
};
