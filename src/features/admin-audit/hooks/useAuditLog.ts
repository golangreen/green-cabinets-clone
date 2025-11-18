import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '@/services';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { RoleChangeAudit } from '@/types';

export const useAuditLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch audit logs
  const { data: auditLogs, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => fetchAuditLogs(500) as Promise<RoleChangeAudit[]>,
  });

  // Filter logs
  const filteredLogs = auditLogs?.filter((log) => {
    const matchesSearch =
      log.target_user_email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      log.performed_by_email.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || log.role === roleFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesRole && matchesAction;
  });

  // Clear all filters
  const clearFilters = () => {
    setRoleFilter('all');
    setActionFilter('all');
    setSearchTerm('');
  };

  // Check if any filters are active
  const hasActiveFilters =
    roleFilter !== 'all' || actionFilter !== 'all' || debouncedSearch !== '';

  // Export to CSV
  const exportToCSV = () => {
    if (!filteredLogs || filteredLogs.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Date', 'Action', 'Role', 'Target User', 'Performed By', 'Method'];
    const csvData = filteredLogs.map((log) => [
      format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      log.action,
      log.role,
      log.target_user_email,
      log.performed_by_email,
      (log.details as any)?.method || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `role-audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredLogs.length} audit log entries`);
  };

  return {
    // State
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    actionFilter,
    setActionFilter,
    debouncedSearch,

    // Data
    auditLogs,
    filteredLogs,
    isLoading,

    // Actions
    clearFilters,
    exportToCSV,
    refetch,

    // Computed
    hasActiveFilters,
  };
};
