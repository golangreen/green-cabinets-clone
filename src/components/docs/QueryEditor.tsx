import { Button } from "@/components/ui/button";
import { Copy, Check, Bookmark, Play, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { autocompletion } from '@codemirror/autocomplete';

interface QueryEditorProps {
  query: string;
  onQueryChange: (query: string) => void;
  onExecute: () => void;
  onSaveBookmark: (name: string) => void;
  isExecuting: boolean;
  sqlCompletions: (context: any) => any;
  exampleQueries: Array<{ name: string; query: string }>;
}

export function QueryEditor({
  query,
  onQueryChange,
  onExecute,
  onSaveBookmark,
  isExecuting,
  sqlCompletions,
  exampleQueries
}: QueryEditorProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [bookmarkName, setBookmarkName] = useState("");
  const [isBookmarkDialogOpen, setIsBookmarkDialogOpen] = useState(false);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode('query');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSaveBookmark = () => {
    if (!bookmarkName.trim()) return;
    onSaveBookmark(bookmarkName);
    setBookmarkName("");
    setIsBookmarkDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Example Queries */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">Example Queries</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {exampleQueries.map((example) => (
            <Button
              key={example.name}
              variant="outline"
              size="sm"
              onClick={() => onQueryChange(example.query)}
              className="justify-start text-xs"
            >
              {example.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">SQL Query</label>
          <div className="flex gap-2">
            <Dialog open={isBookmarkDialogOpen} onOpenChange={setIsBookmarkDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Query as Bookmark</DialogTitle>
                  <DialogDescription>
                    Give your query a memorable name for quick access later
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="bookmark-name">Bookmark Name</Label>
                    <Input
                      id="bookmark-name"
                      placeholder="e.g., Check admin users"
                      value={bookmarkName}
                      onChange={(e) => setBookmarkName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveBookmark();
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Query Preview</Label>
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-[150px]">
                      {query}
                    </pre>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBookmarkDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveBookmark} disabled={!bookmarkName.trim()}>
                    <Star className="h-4 w-4 mr-2" />
                    Save Bookmark
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(query)}
            >
              {copiedCode === 'query' ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="border rounded-md overflow-hidden">
          <CodeMirror
            value={query}
            height="150px"
            extensions={[
              sql(),
              autocompletion({
                override: [sqlCompletions]
              })
            ]}
            onChange={onQueryChange}
            theme="light"
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightActiveLine: true,
              foldGutter: true,
              autocompletion: true,
            }}
            className="text-sm"
          />
        </div>
      </div>

      {/* Execute Button */}
      <Button
        onClick={onExecute}
        disabled={isExecuting || !query.trim()}
        className="w-full"
      >
        {isExecuting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Executing...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Execute Query
          </>
        )}
      </Button>
    </div>
  );
}

import { useState } from "react";
import { Star } from "lucide-react";
