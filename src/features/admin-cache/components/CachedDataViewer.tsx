import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CacheEntry } from "@/services/cacheService";

interface CachedDataViewerProps {
  entries: CacheEntry[];
  onClearCache: (key: string) => void;
}

export function CachedDataViewer({ entries, onClearCache }: CachedDataViewerProps) {
  const [selectedEntry, setSelectedEntry] = useState<{ key: string; data: string } | null>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp?: number): string => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const getTypeBadgeVariant = (type: CacheEntry['type']) => {
    switch (type) {
      case 'product':
        return 'default';
      case 'cart':
        return 'secondary';
      case 'sync-queue':
        return 'destructive';
      case 'settings':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleViewData = (key: string) => {
    const data = localStorage.getItem(key);
    if (data) {
      setSelectedEntry({ key, data });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Cached Data</CardTitle>
          <CardDescription>
            View and manage individual cache entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No cached data found</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.key}>
                      <TableCell className="font-mono text-xs max-w-xs truncate">
                        {entry.key}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(entry.type)}>
                          {entry.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatBytes(entry.size)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatTimestamp(entry.timestamp)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewData(entry.key)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onClearCache(entry.key)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Cache Data</DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {selectedEntry?.key}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[500px]">
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
              {selectedEntry?.data && 
                JSON.stringify(JSON.parse(selectedEntry.data), null, 2)
              }
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
