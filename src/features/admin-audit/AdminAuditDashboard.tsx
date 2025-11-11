import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useAuditLog } from './hooks/useAuditLog';
import { AuditLogFilters } from './components/AuditLogFilters';
import { AuditLogTable } from './components/AuditLogTable';

export const AdminAuditDashboard = () => {
  const {
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    actionFilter,
    setActionFilter,
    auditLogs,
    filteredLogs,
    clearFilters,
    exportToCSV,
    hasActiveFilters,
  } = useAuditLog();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <CardTitle>Role Change Audit Log</CardTitle>
          </div>
          <CardDescription>
            Complete history of all role assignments and removals with filtering and export
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <AuditLogFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              roleFilter={roleFilter}
              onRoleFilterChange={setRoleFilter}
              actionFilter={actionFilter}
              onActionFilterChange={setActionFilter}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              totalCount={auditLogs?.length || 0}
              filteredCount={filteredLogs?.length || 0}
              onExport={exportToCSV}
              canExport={!!filteredLogs && filteredLogs.length > 0}
            />
          </div>

          <AuditLogTable
            logs={filteredLogs || []}
            searchTerm={searchTerm}
            roleFilter={roleFilter}
            actionFilter={actionFilter}
          />
        </CardContent>
      </Card>
    </div>
  );
};
