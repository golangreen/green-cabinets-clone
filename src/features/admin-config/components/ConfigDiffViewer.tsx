import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface ConfigDiff {
  key: string;
  currentValue: any;
  newValue: any;
  status: 'unchanged' | 'modified' | 'added';
  description?: string;
}

interface ConfigDiffViewerProps {
  diffs: ConfigDiff[];
}

export const ConfigDiffViewer = ({ diffs }: ConfigDiffViewerProps) => {
  const modifiedCount = diffs.filter((d) => d.status === 'modified').length;
  const addedCount = diffs.filter((d) => d.status === 'added').length;
  const unchangedCount = diffs.filter((d) => d.status === 'unchanged').length;

  const getStatusColor = (status: ConfigDiff['status']) => {
    switch (status) {
      case 'modified':
        return 'bg-amber-500/10 border-amber-500/30';
      case 'added':
        return 'bg-green-500/10 border-green-500/30';
      case 'unchanged':
        return 'bg-muted/50 border-border';
      default:
        return 'bg-muted border-border';
    }
  };

  const getStatusIcon = (status: ConfigDiff['status']) => {
    switch (status) {
      case 'modified':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'added':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'unchanged':
        return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: ConfigDiff['status']) => {
    switch (status) {
      case 'modified':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
            Modified
          </Badge>
        );
      case 'added':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30">
            New
          </Badge>
        );
      case 'unchanged':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Unchanged
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-medium">Modified</p>
              </div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{modifiedCount}</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <p className="text-sm font-medium">Added</p>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{addedCount}</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Unchanged</p>
              </div>
              <p className="text-2xl font-bold text-muted-foreground">{unchangedCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diff List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        {diffs.map((diff) => (
          <Card key={diff.key} className={`${getStatusColor(diff.status)} transition-colors`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                  {getStatusIcon(diff.status)}
                  <div>
                    <p className="font-mono text-sm font-semibold">{diff.key}</p>
                    {diff.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{diff.description}</p>
                    )}
                  </div>
                </div>
                {getStatusBadge(diff.status)}
              </div>

              {diff.status !== 'unchanged' && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-3 rounded-lg bg-background/50 border">
                    <p className="text-xs text-muted-foreground mb-1">Current</p>
                    <p className="font-mono text-sm break-all">
                      {diff.currentValue !== null && diff.currentValue !== undefined
                        ? String(diff.currentValue)
                        : <span className="text-muted-foreground italic">Not set</span>}
                    </p>
                  </div>

                  <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

                  <div className="flex-1 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">New</p>
                    <p className="font-mono text-sm font-semibold break-all">
                      {String(diff.newValue)}
                    </p>
                  </div>
                </div>
              )}

              {diff.status === 'unchanged' && (
                <div className="p-3 rounded-lg bg-background/50 border">
                  <p className="text-xs text-muted-foreground mb-1">Value</p>
                  <p className="font-mono text-sm">{String(diff.currentValue)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
