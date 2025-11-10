import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Activity, Shield, AlertTriangle } from "lucide-react";

const COLORS = ["hsl(var(--destructive))", "hsl(var(--warning))", "hsl(var(--primary))", "hsl(var(--secondary))"];

export const SecurityCharts = () => {
  const { data: eventStats } = useQuery({
    queryKey: ["security-event-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_events")
        .select("event_type, severity, created_at")
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Group by event type
      const eventTypeCounts = data.reduce((acc: Record<string, number>, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {});

      // Group by severity
      const severityCounts = data.reduce((acc: Record<string, number>, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1;
        return acc;
      }, {});

      return {
        eventTypes: Object.entries(eventTypeCounts).map(([name, value]) => ({ name, value })),
        severities: Object.entries(severityCounts).map(([name, value]) => ({ name, value })),
        total: data.length,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: blockedStats } = useQuery({
    queryKey: ["blocked-ip-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocked_ips")
        .select("auto_blocked");

      if (error) throw error;

      const autoBlocked = data.filter((ip) => ip.auto_blocked).length;
      const manualBlocked = data.filter((ip) => !ip.auto_blocked).length;

      return {
        total: data.length,
        auto: autoBlocked,
        manual: manualBlocked,
      };
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Events (24h)</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{eventStats?.total || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{blockedStats?.total || 0}</div>
          <p className="text-xs text-muted-foreground">
            {blockedStats?.auto || 0} auto, {blockedStats?.manual || 0} manual
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Events by Type (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={eventStats?.eventTypes || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Events by Severity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={eventStats?.severities || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="value"
              >
                {eventStats?.severities?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
