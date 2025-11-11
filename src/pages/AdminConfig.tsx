import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Header, Footer } from '@/components/layout';
import { AdminRoute } from '@/components/auth';
import { Settings, Clock, Shield, Zap, Smartphone, Info, CheckCircle2, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { CACHE_CONFIG, SECURITY_CONFIG, PERFORMANCE_CONFIG, PWA_CONFIG, APP_CONFIG, CONFIG_PRESETS, compareWithPreset, type ConfigPreset } from '@/config';
import { toast } from 'sonner';

interface ConfigValue {
  key: string;
  value: any;
  source: 'default' | 'environment';
  envVar?: string;
  description: string;
}

const AdminConfig = () => {
  const [testValues, setTestValues] = useState<Record<string, any>>({});
  const [selectedPreset, setSelectedPreset] = useState<ConfigPreset | null>(null);

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

  const simulateConfig = (key: string) => {
    const testValue = testValues[key];
    if (!testValue) {
      toast.error('Please enter a test value');
      return;
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

  const applyPreset = (preset: ConfigPreset) => {
    // Apply all preset values to test values
    const newTestValues = { ...preset.values };
    setTestValues(newTestValues);
    setSelectedPreset(preset);
    
    toast.success(`Applied ${preset.name} preset`, {
      description: `${Object.keys(preset.values).length} configuration values loaded`,
    });
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
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Configuration Presets</CardTitle>
              </div>
              <CardDescription>
                Apply pre-configured settings optimized for different deployment environments
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
                          onClick={() => applyPreset(preset)}
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
            <TabsList className="grid w-full grid-cols-5">
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
      </div>
    </AdminRoute>
  );
};

export default AdminConfig;
