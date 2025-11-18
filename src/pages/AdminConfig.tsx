import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { logger } from '@/lib/logger';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Header, Footer } from '@/components/layout';
import { AdminRoute } from '@/components/auth';
import { Settings, Clock, Shield, Zap, Smartphone, Info, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, Download, Upload, History, FileText, Filter, X } from 'lucide-react';
import { CACHE_CONFIG, SECURITY_CONFIG, PERFORMANCE_CONFIG, PWA_CONFIG, APP_CONFIG, CONFIG_PRESETS, compareWithPreset, type ConfigPreset } from '@/config';
import { toast } from 'sonner';
import { fetchConfigAuditLogs, logConfigChange } from '@/services';
import { ConfigChangeAudit } from '@/types/config';
import { formatDistanceToNow } from 'date-fns';
import { ConfigDiffViewer } from '@/features/admin-config';

interface ConfigValue {
  key: string;
  value: any;
  source: 'default' | 'environment';
  envVar?: string;
  description: string;
}

interface ConfigDiff {
  key: string;
  currentValue: any;
  newValue: any;
  status: 'unchanged' | 'modified' | 'added';
  description?: string;
}

const AdminConfig = () => {
  const [testValues, setTestValues] = useState<Record<string, any>>({});
  const [selectedPreset, setSelectedPreset] = useState<ConfigPreset | null>(null);
  const [auditLogs, setAuditLogs] = useState<ConfigChangeAudit[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [showDiffDialog, setShowDiffDialog] = useState(false);
  const [pendingDiff, setPendingDiff] = useState<ConfigDiff[]>([]);
  const [pendingAction, setPendingAction] = useState<'preset' | 'import' | 'rollback' | null>(null);
  const [pendingPreset, setPendingPreset] = useState<ConfigPreset | null>(null);
  const [pendingImportData, setPendingImportData] = useState<Record<string, any> | null>(null);
  const [pendingRollbackLog, setPendingRollbackLog] = useState<ConfigChangeAudit | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audit log filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [changeTypeFilter, setChangeTypeFilter] = useState('all');
  const [configKeyFilter, setConfigKeyFilter] = useState('');

  // Fetch audit logs on mount
  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await fetchConfigAuditLogs(50);
      setAuditLogs(logs);
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Filter audit logs based on criteria
  const filteredAuditLogs = auditLogs.filter((log) => {
    // Date range filter
    if (startDate && new Date(log.created_at) < new Date(startDate)) {
      return false;
    }
    if (endDate && new Date(log.created_at) > new Date(endDate + 'T23:59:59')) {
      return false;
    }

    // User filter
    if (userFilter && !log.user_email.toLowerCase().includes(userFilter.toLowerCase())) {
      return false;
    }

    // Change type filter
    if (changeTypeFilter !== 'all' && log.change_type !== changeTypeFilter) {
      return false;
    }

    // Config key filter
    if (configKeyFilter && !log.config_key.toLowerCase().includes(configKeyFilter.toLowerCase())) {
      return false;
    }

    return true;
  });

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setUserFilter('');
    setChangeTypeFilter('all');
    setConfigKeyFilter('');
    toast.info('Filters cleared');
  };

  const hasActiveFilters = startDate || endDate || userFilter || changeTypeFilter !== 'all' || configKeyFilter;

  const exportAuditLogToCSV = () => {
    const logsToExport = hasActiveFilters ? filteredAuditLogs : auditLogs;
    
    if (logsToExport.length === 0) {
      toast.error('No audit logs to export');
      return;
    }

    // CSV headers
    const headers = [
      'Timestamp',
      'User Email',
      'Configuration Key',
      'Change Type',
      'Preset Name',
      'Old Value',
      'New Value'
    ];

    // Convert logs to CSV rows
    const rows = logsToExport.map(log => [
      new Date(log.created_at).toLocaleString(),
      log.user_email,
      log.config_key,
      log.change_type,
      log.preset_name || 'N/A',
      log.old_value || 'N/A',
      log.new_value
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `config-audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Audit log exported', {
      description: `${logsToExport.length} records exported to CSV${hasActiveFilters ? ' (filtered)' : ''}`,
    });
  };

  // Cache configuration
  const cacheConfig: ConfigValue[] = [
    {
      key: 'PRODUCT_CACHE_DURATION',
      value: CACHE_CONFIG.PRODUCT_CACHE_DURATION,
      source: import.meta.env.VITE_PRODUCT_CACHE_DURATION ? 'environment' : 'default',
      envVar: 'VITE_PRODUCT_CACHE_DURATION',
      description: 'Product cache duration in milliseconds',
    },
    {
      key: 'PRELOAD_COUNT',
      value: CACHE_CONFIG.PRELOAD_COUNT,
      source: import.meta.env.VITE_PRELOAD_COUNT ? 'environment' : 'default',
      envVar: 'VITE_PRELOAD_COUNT',
      description: 'Number of products to prefetch on app load',
    },
    {
      key: 'PRELOAD_REFRESH_INTERVAL',
      value: CACHE_CONFIG.PRELOAD_REFRESH_INTERVAL,
      source: import.meta.env.VITE_PRELOAD_INTERVAL ? 'environment' : 'default',
      envVar: 'VITE_PRELOAD_INTERVAL',
      description: 'Auto-refresh interval for preloaded products (ms)',
    },
    {
      key: 'MAX_PRELOAD_COUNT',
      value: CACHE_CONFIG.MAX_PRELOAD_COUNT,
      source: 'default',
      description: 'Maximum products that can be prefetched (safety limit)',
    },
    {
      key: 'MIN_REFRESH_INTERVAL',
      value: CACHE_CONFIG.MIN_REFRESH_INTERVAL,
      source: 'default',
      description: 'Minimum refresh interval (5 minutes)',
    },
  ];

  // Security configuration
  const securityConfig: ConfigValue[] = [
    {
      key: 'MAX_RETRIES',
      value: SECURITY_CONFIG.MAX_RETRIES,
      source: import.meta.env.VITE_MAX_RETRIES ? 'environment' : 'default',
      envVar: 'VITE_MAX_RETRIES',
      description: 'Maximum retry attempts for background sync',
    },
    {
      key: 'DEFAULT_RETRY_THRESHOLD',
      value: SECURITY_CONFIG.DEFAULT_RETRY_THRESHOLD,
      source: import.meta.env.VITE_RETRY_THRESHOLD ? 'environment' : 'default',
      envVar: 'VITE_RETRY_THRESHOLD',
      description: 'Default retry threshold for webhook alerts',
    },
    {
      key: 'DEFAULT_RETRY_TIME_WINDOW_MINUTES',
      value: SECURITY_CONFIG.DEFAULT_RETRY_TIME_WINDOW_MINUTES,
      source: import.meta.env.VITE_RETRY_TIME_WINDOW ? 'environment' : 'default',
      envVar: 'VITE_RETRY_TIME_WINDOW',
      description: 'Default time window for retry monitoring (minutes)',
    },
    {
      key: 'WEBHOOK_MAX_TIMESTAMP_AGE',
      value: SECURITY_CONFIG.WEBHOOK_MAX_TIMESTAMP_AGE,
      source: 'default',
      description: 'Maximum webhook signature timestamp age (ms)',
    },
    {
      key: 'WEBHOOK_EVENT_RETENTION_DAYS',
      value: SECURITY_CONFIG.WEBHOOK_EVENT_RETENTION_DAYS,
      source: 'default',
      description: 'Webhook event retention period (days)',
    },
  ];

  // Performance configuration
  const performanceConfig: ConfigValue[] = [
    {
      key: 'NETWORK_TIMEOUT',
      value: PERFORMANCE_CONFIG.NETWORK_TIMEOUT,
      source: import.meta.env.VITE_NETWORK_TIMEOUT ? 'environment' : 'default',
      envVar: 'VITE_NETWORK_TIMEOUT',
      description: 'Network request timeout (ms)',
    },
    {
      key: 'SEARCH_DEBOUNCE_MS',
      value: PERFORMANCE_CONFIG.SEARCH_DEBOUNCE_MS,
      source: import.meta.env.VITE_SEARCH_DEBOUNCE ? 'environment' : 'default',
      envVar: 'VITE_SEARCH_DEBOUNCE',
      description: 'Debounce delay for search inputs (ms)',
    },
    {
      key: 'TOAST_DURATION_MS',
      value: PERFORMANCE_CONFIG.TOAST_DURATION_MS,
      source: 'default',
      description: 'Toast notification duration (ms)',
    },
    {
      key: 'SPLASH_SCREEN_DURATION_MS',
      value: PERFORMANCE_CONFIG.SPLASH_SCREEN_DURATION_MS,
      source: 'default',
      description: 'Splash screen display duration (ms)',
    },
  ];

  // PWA configuration
  const pwaConfig: ConfigValue[] = [
    {
      key: 'SHOPIFY_API_MAX_AGE_SECONDS',
      value: PWA_CONFIG.CACHE.SHOPIFY_API_MAX_AGE_SECONDS,
      source: 'default',
      description: 'Shopify API cache duration (seconds)',
    },
    {
      key: 'SHOPIFY_IMAGES_MAX_AGE_SECONDS',
      value: PWA_CONFIG.CACHE.SHOPIFY_IMAGES_MAX_AGE_SECONDS,
      source: 'default',
      description: 'Shopify images cache duration (seconds)',
    },
    {
      key: 'NETWORK_TIMEOUT_SECONDS',
      value: PWA_CONFIG.NETWORK.TIMEOUT_SECONDS,
      source: 'default',
      description: 'Network timeout for NetworkFirst strategy (seconds)',
    },
    {
      key: 'MAX_RETRY_ATTEMPTS',
      value: PWA_CONFIG.NETWORK.MAX_RETRY_ATTEMPTS,
      source: 'default',
      description: 'Retry attempts for failed requests',
    },
  ];

  // App configuration
  const appConfig: ConfigValue[] = [
    {
      key: 'APP_NAME',
      value: APP_CONFIG.APP_NAME,
      source: 'default',
      description: 'Application name',
    },
    {
      key: 'APP_VERSION',
      value: APP_CONFIG.APP_VERSION,
      source: 'default',
      description: 'Application version',
    },
    {
      key: 'IS_PRODUCTION',
      value: APP_CONFIG.IS_PRODUCTION,
      source: 'environment',
      description: 'Production mode flag',
    },
    {
      key: 'SUPABASE_URL',
      value: APP_CONFIG.API.SUPABASE_URL ? '***configured***' : 'not set',
      source: 'environment',
      envVar: 'VITE_SUPABASE_URL',
      description: 'Supabase API URL',
    },
    {
      key: 'SUPABASE_ANON_KEY',
      value: APP_CONFIG.API.SUPABASE_ANON_KEY ? '***configured***' : 'not set',
      source: 'environment',
      envVar: 'VITE_SUPABASE_PUBLISHABLE_KEY',
      description: 'Supabase anon key',
    },
  ];

  const handleTestValue = (key: string, value: string) => {
    setTestValues({ ...testValues, [key]: value });
  };

  const simulateConfig = async (key: string) => {
    const testValue = testValues[key];
    if (!testValue) {
      toast.error('Please enter a test value');
      return;
    }

    // Get current value
    const config = [...cacheConfig, ...securityConfig, ...performanceConfig].find(
      (c) => c.key === key
    );
    const oldValue = config?.value?.toString() || null;

    // Log the change
    try {
      await logConfigChange({
        configKey: key,
        oldValue,
        newValue: testValue.toString(),
        changeType: 'test',
      });
      
      // Reload audit logs
      loadAuditLogs();
    } catch (error) {
      // Don't block the test simulation if logging fails
      logger.error('Failed to log config change', error, { page: 'AdminConfig' });
    }

    toast.success(`Test simulation for ${key}`, {
      description: `Would use value: ${testValue}`,
    });
  };

  const resetTestValue = (key: string) => {
    const newValues = { ...testValues };
    delete newValues[key];
    setTestValues(newValues);
    toast.info(`Reset test value for ${key}`);
  };

  const generateDiff = (newValues: Record<string, any>): ConfigDiff[] => {
    const currentValues = getCurrentValues();
    const allConfigs = [...cacheConfig, ...securityConfig, ...performanceConfig];
    
    const diffs: ConfigDiff[] = [];
    
    // Check all keys in new values
    Object.entries(newValues).forEach(([key, newValue]) => {
      const config = allConfigs.find((c) => c.envVar === key);
      const currentValue = currentValues[key];
      
      if (currentValue === undefined) {
        diffs.push({
          key,
          currentValue: null,
          newValue,
          status: 'added',
          description: config?.description,
        });
      } else if (String(currentValue) !== String(newValue)) {
        diffs.push({
          key,
          currentValue,
          newValue,
          status: 'modified',
          description: config?.description,
        });
      } else {
        diffs.push({
          key,
          currentValue,
          newValue,
          status: 'unchanged',
          description: config?.description,
        });
      }
    });
    
    return diffs;
  };

  const showPresetDiff = (preset: ConfigPreset) => {
    const diffs = generateDiff(preset.values);
    setPendingDiff(diffs);
    setPendingAction('preset');
    setPendingPreset(preset);
    setShowDiffDialog(true);
  };

  const confirmApplyPreset = async () => {
    if (!pendingPreset) return;
    
    const newTestValues = { ...pendingPreset.values };
    setTestValues(newTestValues);
    setSelectedPreset(pendingPreset);
    
    // Log all preset changes
    try {
      const currentValues = getCurrentValues();
      const logPromises = Object.entries(pendingPreset.values).map(([key, value]) => 
        logConfigChange({
          configKey: key,
          oldValue: currentValues[key]?.toString() || null,
          newValue: value.toString(),
          changeType: 'preset_applied',
          presetName: pendingPreset.name,
        })
      );
      await Promise.all(logPromises);
      
      // Reload audit logs
      loadAuditLogs();
    } catch (error) {
      logger.error('Failed to log preset changes', error, { page: 'AdminConfig' });
    }
    
    toast.success(`Applied ${pendingPreset.name} preset`, {
      description: `${Object.keys(pendingPreset.values).length} configuration values loaded`,
    });
    
    setShowDiffDialog(false);
    setPendingPreset(null);
    setPendingDiff([]);
    setPendingAction(null);
  };

  const getCurrentValues = () => {
    const current: Record<string, any> = {};
    [...cacheConfig, ...securityConfig, ...performanceConfig].forEach((config) => {
      if (config.envVar) {
        current[config.envVar] = config.value;
      }
    });
    return current;
  };

  const exportConfig = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      environment: APP_CONFIG.IS_PRODUCTION ? 'production' : 'development',
      values: getCurrentValues(),
      testValues: Object.keys(testValues).length > 0 ? testValues : undefined,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config-snapshot-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Configuration exported', {
      description: 'Configuration snapshot saved to file',
    });
  };

  const importConfig = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);

        // Validate structure
        if (!importData.values || typeof importData.values !== 'object') {
          throw new Error('Invalid configuration file structure');
        }

        // Validate keys
        const validKeys = [...cacheConfig, ...securityConfig, ...performanceConfig]
          .map((c) => c.envVar)
          .filter(Boolean);

        const importKeys = Object.keys(importData.values);
        const invalidKeys = importKeys.filter((key) => !validKeys.includes(key));

        if (invalidKeys.length > 0) {
          toast.warning('Some configuration keys are invalid', {
            description: `Invalid keys: ${invalidKeys.join(', ')}`,
          });
        }

        // Apply valid values
        const validValues: Record<string, any> = {};
        importKeys.forEach((key) => {
          if (validKeys.includes(key)) {
            validValues[key] = importData.values[key];
          }
        });

        // Show diff before applying
        const diffs = generateDiff(validValues);
        setPendingDiff(diffs);
        setPendingAction('import');
        setPendingImportData(validValues);
        setShowDiffDialog(true);
      } catch (error) {
        toast.error('Failed to import configuration', {
          description: error instanceof Error ? error.message : 'Invalid JSON file',
        });
      }
    };

    reader.readAsText(file);
    
    // Reset input so the same file can be imported again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmImportConfig = async () => {
    if (!pendingImportData) return;

    setTestValues(pendingImportData);
    setSelectedPreset(null);

    // Log all imported changes
    try {
      const currentValues = getCurrentValues();
      const logPromises = Object.entries(pendingImportData).map(([key, value]) => 
        logConfigChange({
          configKey: key,
          oldValue: currentValues[key]?.toString() || null,
          newValue: value.toString(),
          changeType: 'import',
        })
      );
      await Promise.all(logPromises);
      
      // Reload audit logs
      loadAuditLogs();
    } catch (error) {
      logger.error('Failed to log import changes', error, { page: 'AdminConfig' });
    }

    toast.success('Configuration imported', {
      description: `Loaded ${Object.keys(pendingImportData).length} configuration values`,
    });

    setShowDiffDialog(false);
    setPendingImportData(null);
    setPendingDiff([]);
    setPendingAction(null);
  };

  const showRollbackDiff = (log: ConfigChangeAudit) => {
    const currentValues = getCurrentValues();
    const currentValue = currentValues[log.config_key];
    
    const diffs: ConfigDiff[] = [{
      key: log.config_key,
      currentValue: currentValue,
      newValue: log.old_value,
      status: String(currentValue) !== String(log.old_value) ? 'modified' : 'unchanged',
    }];

    setPendingDiff(diffs);
    setPendingAction('rollback');
    setPendingRollbackLog(log);
    setShowDiffDialog(true);
  };

  const confirmRollback = async () => {
    if (!pendingRollbackLog) return;

    const rollbackValue = { [pendingRollbackLog.config_key]: pendingRollbackLog.old_value };
    setTestValues({ ...testValues, ...rollbackValue });

    try {
      const currentValues = getCurrentValues();
      await logConfigChange({
        configKey: pendingRollbackLog.config_key,
        oldValue: currentValues[pendingRollbackLog.config_key]?.toString() || null,
        newValue: pendingRollbackLog.old_value,
        changeType: 'rollback',
      });
      
      loadAuditLogs();
    } catch (error) {
      logger.error('Failed to log rollback', error, { page: 'AdminConfig' });
    }

    toast.success('Configuration rolled back', {
      description: `Reverted ${pendingRollbackLog.config_key} to previous value`,
    });

    setShowDiffDialog(false);
    setPendingRollbackLog(null);
    setPendingDiff([]);
    setPendingAction(null);
  };

  const renderConfigSection = (title: string, icon: React.ReactNode, configs: ConfigValue[]) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>

      {configs.map((config) => (
        <Card key={config.key}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-mono">{config.key}</CardTitle>
              <Badge variant={config.source === 'environment' ? 'default' : 'outline'}>
                {config.source === 'environment' ? 'ENV' : 'Default'}
              </Badge>
            </div>
            <CardDescription>{config.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Current Value</p>
                <p className="font-semibold">{String(config.value)}</p>
                {config.envVar && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {config.envVar}
                  </p>
                )}
              </div>
              {config.source === 'environment' && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>

            {config.source !== 'default' && (
              <div className="space-y-2">
                <Label htmlFor={`test-${config.key}`}>Test Value</Label>
                <div className="flex gap-2">
                  <Input
                    id={`test-${config.key}`}
                    placeholder="Enter test value"
                    value={testValues[config.key] || ''}
                    onChange={(e) => handleTestValue(config.key, e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => simulateConfig(config.key)}
                    disabled={!testValues[config.key]}
                  >
                    Test
                  </Button>
                  {testValues[config.key] && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => resetTestValue(config.key)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Test how the app would behave with this value (simulation only)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Settings className="h-8 w-8" />
              Configuration Panel
            </h1>
            <p className="text-muted-foreground text-lg">
              View and test application configuration settings
            </p>
          </div>

          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Configuration Management</AlertTitle>
            <AlertDescription>
              This panel displays current configuration values from environment variables and defaults. 
              Test values are simulated only and do not persist. To change actual configuration, 
              update environment variables in your .env file.
            </AlertDescription>
          </Alert>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle>Configuration Presets</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportConfig}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={importConfig}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>
              <CardDescription>
                Apply pre-configured settings optimized for different deployment environments, or export/import custom configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {CONFIG_PRESETS.map((preset) => {
                  const comparison = compareWithPreset(getCurrentValues(), preset);
                  const isActive = selectedPreset?.environment === preset.environment;
                  const matchPercentage = Math.round((comparison.matches / comparison.total) * 100);

                  return (
                    <Card key={preset.environment} className={isActive ? 'border-primary' : ''}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{preset.name}</CardTitle>
                          <Badge variant={isActive ? 'default' : 'outline'}>
                            {matchPercentage}% Match
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {preset.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium mb-2">Optimizations:</p>
                          <ul className="space-y-1 text-xs">
                            <li>• Cache: {preset.values.VITE_PRELOAD_COUNT} products</li>
                            <li>• Security: {preset.values.VITE_MAX_RETRIES} retries</li>
                            <li>• Timeout: {preset.values.VITE_NETWORK_TIMEOUT}ms</li>
                            <li>• Debounce: {preset.values.VITE_SEARCH_DEBOUNCE}ms</li>
                          </ul>
                        </div>
                        <Button
                          className="w-full"
                          variant={isActive ? 'default' : 'outline'}
                          onClick={() => showPresetDiff(preset)}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Applied
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Apply Preset
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {selectedPreset && (
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Preset Applied</AlertTitle>
                  <AlertDescription>
                    The {selectedPreset.name} preset has been loaded into test values. 
                    Scroll down to review the changes. To persist these settings, update your .env file with the new values.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="cache" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="cache">
                <Clock className="h-4 w-4 mr-2" />
                Cache
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="performance">
                <Zap className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="pwa">
                <Smartphone className="h-4 w-4 mr-2" />
                PWA
              </TabsTrigger>
              <TabsTrigger value="app">
                <Settings className="h-4 w-4 mr-2" />
                App
              </TabsTrigger>
              <TabsTrigger value="audit">
                <History className="h-4 w-4 mr-2" />
                Audit Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cache" className="space-y-4">
              {renderConfigSection(
                'Cache Configuration',
                <Clock className="h-5 w-5 text-primary" />,
                cacheConfig
              )}
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              {renderConfigSection(
                'Security Configuration',
                <Shield className="h-5 w-5 text-primary" />,
                securityConfig
              )}
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              {renderConfigSection(
                'Performance Configuration',
                <Zap className="h-5 w-5 text-primary" />,
                performanceConfig
              )}
            </TabsContent>

            <TabsContent value="pwa" className="space-y-4">
              {renderConfigSection(
                'PWA Configuration',
                <Smartphone className="h-5 w-5 text-primary" />,
                pwaConfig
              )}
            </TabsContent>

            <TabsContent value="app" className="space-y-4">
              {renderConfigSection(
                'Application Configuration',
                <Settings className="h-5 w-5 text-primary" />,
                appConfig
              )}
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      <CardTitle>Configuration Audit Log</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={exportAuditLogToCSV}
                        disabled={filteredAuditLogs.length === 0}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                      <Button variant="outline" size="sm" onClick={loadAuditLogs} disabled={isLoadingLogs}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Complete history of all configuration changes made through this panel
                    {hasActiveFilters && (
                      <span className="text-primary ml-2">
                        ({filteredAuditLogs.length} of {auditLogs.length} records shown)
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters Section */}
                  {auditLogs.length > 0 && (
                    <div className="mb-6 p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold">Filters</h4>
                        </div>
                        {hasActiveFilters && (
                          <Button variant="ghost" size="sm" onClick={clearFilters}>
                            <X className="h-4 w-4 mr-2" />
                            Clear All
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Date Range Filters */}
                        <div className="space-y-2">
                          <Label htmlFor="start-date">Start Date</Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="end-date">End Date</Label>
                          <Input
                            id="end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>

                        {/* User Filter */}
                        <div className="space-y-2">
                          <Label htmlFor="user-filter">User Email</Label>
                          <Input
                            id="user-filter"
                            placeholder="Filter by user..."
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                          />
                        </div>

                        {/* Change Type Filter */}
                        <div className="space-y-2">
                          <Label htmlFor="change-type">Change Type</Label>
                          <Select value={changeTypeFilter} onValueChange={setChangeTypeFilter}>
                            <SelectTrigger id="change-type">
                              <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="preset_applied">Preset</SelectItem>
                              <SelectItem value="import">Import</SelectItem>
                              <SelectItem value="rollback">Rollback</SelectItem>
                              <SelectItem value="test">Test</SelectItem>
                              <SelectItem value="manual">Manual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Config Key Filter */}
                        <div className="space-y-2">
                          <Label htmlFor="config-key">Config Key</Label>
                          <Input
                            id="config-key"
                            placeholder="Filter by key..."
                            value={configKeyFilter}
                            onChange={(e) => setConfigKeyFilter(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {isLoadingLogs ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : auditLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No configuration changes recorded yet</p>
                    </div>
                  ) : filteredAuditLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No logs match the current filters</p>
                      <Button variant="link" onClick={clearFilters} className="mt-2">
                        Clear filters
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredAuditLogs.map((log) => (
                        <Card key={log.id} className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={
                                  log.change_type === 'preset_applied' ? 'default' :
                                  log.change_type === 'import' ? 'secondary' :
                                  log.change_type === 'rollback' ? 'outline' :
                                  'outline'
                                }>
                                  {log.change_type === 'preset_applied' ? 'Preset' :
                                   log.change_type === 'import' ? 'Import' :
                                   log.change_type === 'rollback' ? 'Rollback' :
                                   log.change_type === 'test' ? 'Test' : 'Manual'}
                                </Badge>
                                {log.preset_name && (
                                  <Badge variant="outline">{log.preset_name}</Badge>
                                )}
                              </div>
                              <p className="font-mono text-sm font-semibold">{log.config_key}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                by {log.user_email}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                            <div className="p-2 bg-muted rounded">
                              <p className="text-xs text-muted-foreground mb-1">Old Value</p>
                              <p className="font-mono">{log.old_value || 'N/A'}</p>
                            </div>
                            <div className="p-2 bg-muted rounded">
                              <p className="text-xs text-muted-foreground mb-1">New Value</p>
                              <p className="font-mono">{log.new_value}</p>
                            </div>
                          </div>
                          {log.old_value && log.change_type !== 'rollback' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => showRollbackDiff(log)}
                              className="mt-3 w-full"
                            >
                              <RefreshCw className="h-3 w-3 mr-2" />
                              Rollback to this state
                            </Button>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator className="my-8" />

          <Card>
            <CardHeader>
              <CardTitle>Configuration Summary</CardTitle>
              <CardDescription>Overview of all configuration sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <p className="font-semibold">Environment Variables</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {[...cacheConfig, ...securityConfig, ...performanceConfig, ...appConfig].filter(
                      (c) => c.source === 'environment'
                    ).length}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <p className="font-semibold">Default Values</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {[...cacheConfig, ...securityConfig, ...performanceConfig, ...pwaConfig, ...appConfig].filter(
                      (c) => c.source === 'default'
                    ).length}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-5 w-5 text-primary" />
                    <p className="font-semibold">Total Settings</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {cacheConfig.length + securityConfig.length + performanceConfig.length + pwaConfig.length + appConfig.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />

        {/* Configuration Diff Dialog */}
        <Dialog open={showDiffDialog} onOpenChange={setShowDiffDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Review Configuration Changes</DialogTitle>
              <DialogDescription>
                {pendingAction === 'preset' && pendingPreset && (
                  <>Review the changes that will be applied from the <strong>{pendingPreset.name}</strong> preset</>
                )}
                {pendingAction === 'import' && (
                  <>Review the changes from the imported configuration file</>
                )}
                {pendingAction === 'rollback' && pendingRollbackLog && (
                  <>Rolling back <strong>{pendingRollbackLog.config_key}</strong> to its previous value from {new Date(pendingRollbackLog.created_at).toLocaleString()}</>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto py-4">
              <ConfigDiffViewer diffs={pendingDiff} />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDiffDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={
                  pendingAction === 'preset' ? confirmApplyPreset :
                  pendingAction === 'import' ? confirmImportConfig :
                  confirmRollback
                }
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {pendingAction === 'rollback' ? 'Rollback' : 'Apply Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminRoute>
  );
};

export default AdminConfig;
