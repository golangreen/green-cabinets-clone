import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';

interface MetricFiltersProps {
  onFilterChange: (filters: {
    startDate: Date;
    endDate: Date;
    metricName?: string;
    url?: string;
  }) => void;
}

export function MetricFilters({ onFilterChange }: MetricFiltersProps) {
  const [timeRange, setTimeRange] = useState('24h');
  const [metricName, setMetricName] = useState<string>('');
  const [url, setUrl] = useState('');

  const getDateRange = (range: string) => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '1h':
        startDate.setHours(endDate.getHours() - 1);
        break;
      case '24h':
        startDate.setHours(endDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      default:
        startDate.setHours(endDate.getHours() - 24);
    }
    
    return { startDate, endDate };
  };

  const handleApplyFilters = () => {
    const { startDate, endDate } = getDateRange(timeRange);
    onFilterChange({
      startDate,
      endDate,
      metricName: metricName || undefined,
      url: url || undefined,
    });
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    const { startDate, endDate } = getDateRange(value);
    onFilterChange({
      startDate,
      endDate,
      metricName: metricName || undefined,
      url: url || undefined,
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-[#2dd4bf]" />
        <h3 className="text-lg font-semibold">Filters</h3>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="time-range">Time Range</Label>
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger id="time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="metric">Metric Type</Label>
          <Select value={metricName} onValueChange={setMetricName}>
            <SelectTrigger id="metric">
              <SelectValue placeholder="All Metrics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Metrics</SelectItem>
              <SelectItem value="LCP">LCP (Largest Contentful Paint)</SelectItem>
              <SelectItem value="CLS">CLS (Cumulative Layout Shift)</SelectItem>
              <SelectItem value="TTFB">TTFB (Time to First Byte)</SelectItem>
              <SelectItem value="INP">INP (Interaction to Next Paint)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">URL Filter</Label>
          <Input
            id="url"
            placeholder="Filter by URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <Button
            onClick={handleApplyFilters}
            className="w-full bg-[#2dd4bf]/20 hover:bg-[#2dd4bf]/40 text-[#2dd4bf] border border-[#2dd4bf]/60 hover:border-[#2dd4bf]"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </Card>
  );
}
