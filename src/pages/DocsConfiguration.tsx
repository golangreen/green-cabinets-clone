import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Settings, Clock, Shield, Zap, Smartphone, Info } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { DocsSidebar } from "@/features/docs";
import { CACHE_CONFIG, SECURITY_CONFIG, PERFORMANCE_CONFIG, PWA_CONFIG } from "@/config";

const DocsConfiguration = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <DocsSidebar />
        <main className="flex-1 px-8 py-16 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Configuration</h1>
            <p className="text-muted-foreground text-lg">
              Comprehensive guide to all configuration modules and environment variables
            </p>
          </div>

          <Separator className="my-8" />

          {/* Overview */}
          <section className="mb-12">
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertTitle>Centralized Configuration</AlertTitle>
              <AlertDescription>
                All application settings are centralized in <code className="bg-muted px-1 rounded">src/config/</code> with 
                environment variable support for flexible deployment across development, staging, and production environments.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Configuration Modules</CardTitle>
                <CardDescription>Four core modules organize all application settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">cache.ts</p>
                      <p className="text-sm text-muted-foreground">Cache durations, preload settings, cleanup intervals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">security.ts</p>
                      <p className="text-sm text-muted-foreground">Rate limits, retry thresholds, webhook validation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">performance.ts</p>
                      <p className="text-sm text-muted-foreground">Timeouts, debounce delays, animation durations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Smartphone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">pwa.ts</p>
                      <p className="text-sm text-muted-foreground">Service Worker settings, cache strategies, offline behavior</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Cache Configuration */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Cache Configuration</h2>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
                <CardDescription>Customize cache behavior via .env file</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <code className="font-mono font-semibold text-sm">VITE_PRODUCT_CACHE_DURATION</code>
                      <Badge variant="outline">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Product cache duration in milliseconds
                    </p>
                    <pre className="bg-muted p-3 rounded text-xs">
                      <code>Default: 300000 (5 minutes){'\n'}Example: VITE_PRODUCT_CACHE_DURATION=600000</code>
                    </pre>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <code className="font-mono font-semibold text-sm">VITE_PRELOAD_COUNT</code>
                      <Badge variant="outline">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Number of products to prefetch on app load
                    </p>
                    <pre className="bg-muted p-3 rounded text-xs">
                      <code>Default: 20{'\n'}Example: VITE_PRELOAD_COUNT=30{'\n'}Max: 50</code>
                    </pre>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <code className="font-mono font-semibold text-sm">VITE_PRELOAD_INTERVAL</code>
                      <Badge variant="outline">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Auto-refresh interval for preloaded products (milliseconds)
                    </p>
                    <pre className="bg-muted p-3 rounded text-xs">
                      <code>Default: 1800000 (30 minutes){'\n'}Example: VITE_PRELOAD_INTERVAL=3600000{'\n'}Min: 300000 (5 minutes)</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Example</CardTitle>
                <CardDescription>Import and use cache configuration in your code</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code>{`import { CACHE_CONFIG } from '@/config';

// Access cache settings
const cacheDuration = CACHE_CONFIG.PRODUCT_CACHE_DURATION;
const preloadCount = CACHE_CONFIG.PRELOAD_COUNT;
const refreshInterval = CACHE_CONFIG.PRELOAD_REFRESH_INTERVAL;

// Current values:
// - PRODUCT_CACHE_DURATION: ${CACHE_CONFIG.PRODUCT_CACHE_DURATION}ms
// - PRELOAD_COUNT: ${CACHE_CONFIG.PRELOAD_COUNT}
// - PRELOAD_REFRESH_INTERVAL: ${CACHE_CONFIG.PRELOAD_REFRESH_INTERVAL}ms`}</code>
                </pre>
              </CardContent>
            </Card>
          </section>

          {/* Security Configuration */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Security Configuration</h2>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
                <CardDescription>Customize security settings via .env file</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <code className="font-mono font-semibold text-sm">VITE_MAX_RETRIES</code>
                      <Badge variant="outline">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Maximum retry attempts for background sync operations
                    </p>
                    <pre className="bg-muted p-3 rounded text-xs">
                      <code>Default: 3{'\n'}Example: VITE_MAX_RETRIES=5</code>
                    </pre>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <code className="font-mono font-semibold text-sm">VITE_RETRY_THRESHOLD</code>
                      <Badge variant="outline">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Default retry threshold for webhook alerts
                    </p>
                    <pre className="bg-muted p-3 rounded text-xs">
                      <code>Default: 3{'\n'}Example: VITE_RETRY_THRESHOLD=5</code>
                    </pre>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <code className="font-mono font-semibold text-sm">VITE_RETRY_TIME_WINDOW</code>
                      <Badge variant="outline">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Default time window for retry monitoring (minutes)
                    </p>
                    <pre className="bg-muted p-3 rounded text-xs">
                      <code>Default: 10{'\n'}Example: VITE_RETRY_TIME_WINDOW=15</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Example</CardTitle>
                <CardDescription>Import and use security configuration in your code</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code>{`import { SECURITY_CONFIG } from '@/config';

// Access security settings
const maxRetries = SECURITY_CONFIG.MAX_RETRIES;
const retryThreshold = SECURITY_CONFIG.DEFAULT_RETRY_THRESHOLD;
const timeWindow = SECURITY_CONFIG.DEFAULT_RETRY_TIME_WINDOW_MINUTES;

// Webhook validation settings
const maxTimestampAge = SECURITY_CONFIG.WEBHOOK_MAX_TIMESTAMP_AGE;
const eventRetention = SECURITY_CONFIG.WEBHOOK_EVENT_RETENTION_DAYS;

// Current values:
// - MAX_RETRIES: ${SECURITY_CONFIG.MAX_RETRIES}
// - DEFAULT_RETRY_THRESHOLD: ${SECURITY_CONFIG.DEFAULT_RETRY_THRESHOLD}
// - DEFAULT_RETRY_TIME_WINDOW_MINUTES: ${SECURITY_CONFIG.DEFAULT_RETRY_TIME_WINDOW_MINUTES}`}</code>
                </pre>
              </CardContent>
            </Card>
          </section>

          {/* Performance Configuration */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Performance Configuration</h2>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
                <CardDescription>Customize performance settings via .env file</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <code className="font-mono font-semibold text-sm">VITE_NETWORK_TIMEOUT</code>
                      <Badge variant="outline">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Network request timeout in milliseconds
                    </p>
                    <pre className="bg-muted p-3 rounded text-xs">
                      <code>Default: 10000 (10 seconds){'\n'}Example: VITE_NETWORK_TIMEOUT=15000</code>
                    </pre>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <code className="font-mono font-semibold text-sm">VITE_SEARCH_DEBOUNCE</code>
                      <Badge variant="outline">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Debounce delay for search inputs (milliseconds)
                    </p>
                    <pre className="bg-muted p-3 rounded text-xs">
                      <code>Default: 300{'\n'}Example: VITE_SEARCH_DEBOUNCE=500</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Example</CardTitle>
                <CardDescription>Import and use performance configuration in your code</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code>{`import { PERFORMANCE_CONFIG } from '@/config';

// Access performance settings
const networkTimeout = PERFORMANCE_CONFIG.NETWORK_TIMEOUT;
const searchDebounce = PERFORMANCE_CONFIG.SEARCH_DEBOUNCE_MS;
const toastDuration = PERFORMANCE_CONFIG.TOAST_DURATION_MS;

// Auto-refresh intervals
const statsInterval = PERFORMANCE_CONFIG.AUTO_REFRESH.STATS_INTERVAL_MS;
const realtimeRetry = PERFORMANCE_CONFIG.AUTO_REFRESH.REALTIME_RETRY_MS;

// Current values:
// - NETWORK_TIMEOUT: ${PERFORMANCE_CONFIG.NETWORK_TIMEOUT}ms
// - SEARCH_DEBOUNCE_MS: ${PERFORMANCE_CONFIG.SEARCH_DEBOUNCE_MS}ms
// - TOAST_DURATION_MS: ${PERFORMANCE_CONFIG.TOAST_DURATION_MS}ms`}</code>
                </pre>
              </CardContent>
            </Card>
          </section>

          {/* PWA Configuration */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">PWA Configuration</h2>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Service Worker Settings</CardTitle>
                <CardDescription>Configure caching strategies and offline behavior</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Shopify API Cache</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      NetworkFirst strategy with 24-hour cache duration
                    </p>
                    <pre className="bg-muted p-3 rounded text-xs">
                      <code>{`Max Age: ${PWA_CONFIG.CACHE.SHOPIFY_API_MAX_AGE_SECONDS / 3600} hours
Max Entries: ${PWA_CONFIG.CACHE.SHOPIFY_API_MAX_ENTRIES}
Network Timeout: ${PWA_CONFIG.NETWORK.TIMEOUT_SECONDS} seconds`}</code>
                    </pre>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Shopify Images Cache</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      CacheFirst strategy with 30-day cache duration
                    </p>
                    <pre className="bg-muted p-3 rounded text-xs">
                      <code>{`Max Age: ${PWA_CONFIG.CACHE.SHOPIFY_IMAGES_MAX_AGE_SECONDS / (3600 * 24)} days
Max Entries: ${PWA_CONFIG.CACHE.SHOPIFY_IMAGES_MAX_ENTRIES}`}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Example</CardTitle>
                <CardDescription>Import and use PWA configuration in your code</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code>{`import { PWA_CONFIG, getCacheName } from '@/config';

// Access PWA settings
const apiMaxAge = PWA_CONFIG.CACHE.SHOPIFY_API_MAX_AGE_SECONDS;
const imagesMaxAge = PWA_CONFIG.CACHE.SHOPIFY_IMAGES_MAX_AGE_SECONDS;
const networkTimeout = PWA_CONFIG.NETWORK.TIMEOUT_SECONDS;

// Get cache names
const apiCache = getCacheName('api');
const imagesCache = getCacheName('images');

// Manifest settings
const appName = PWA_CONFIG.MANIFEST.NAME;
const themeColor = PWA_CONFIG.MANIFEST.THEME_COLOR;`}</code>
                </pre>
              </CardContent>
            </Card>
          </section>

          {/* Complete Example */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Complete .env.example</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Configuration Variables</CardTitle>
                <CardDescription>Copy this to your .env file and customize as needed</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code>{`# Supabase Configuration (Auto-generated by Lovable Cloud)
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=

# reCAPTCHA v3 Configuration
VITE_RECAPTCHA_SITE_KEY=6Lc4LggsAAAAAIKh6RThjKsHqdXOho5fa07hfTC5

# Cache Configuration
VITE_PRODUCT_CACHE_DURATION=300000  # 5 minutes in milliseconds
VITE_PRELOAD_COUNT=20
VITE_PRELOAD_INTERVAL=1800000  # 30 minutes in milliseconds

# Security Configuration
VITE_MAX_RETRIES=3
VITE_RETRY_THRESHOLD=3
VITE_RETRY_TIME_WINDOW=10  # minutes

# Performance Configuration
VITE_NETWORK_TIMEOUT=10000  # 10 seconds in milliseconds
VITE_SEARCH_DEBOUNCE=300  # milliseconds

# Feature Flags
VITE_ENABLE_PRELOAD=true
VITE_ENABLE_OFFLINE=true
VITE_ENABLE_ANALYTICS=false`}</code>
                </pre>
              </CardContent>
            </Card>
          </section>

          {/* Best Practices */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Best Practices</h2>
            
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Type Safety</AlertTitle>
                <AlertDescription>
                  All configuration modules export TypeScript types. Use them to ensure type safety when accessing config values.
                </AlertDescription>
              </Alert>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Environment-Specific Values</AlertTitle>
                <AlertDescription>
                  Use environment variables for values that differ between development, staging, and production. 
                  Keep defaults sensible for development.
                </AlertDescription>
              </Alert>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Validation Functions</AlertTitle>
                <AlertDescription>
                  Cache and security modules include validation functions to clamp values within safe ranges. 
                  Use <code className="bg-muted px-1 rounded">validatePrefetchCount()</code> and <code className="bg-muted px-1 rounded">validateRetryCount()</code> when accepting user input.
                </AlertDescription>
              </Alert>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DocsConfiguration;
