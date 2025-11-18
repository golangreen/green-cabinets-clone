import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface HistoryState {
  id: number;
  thumbnail: string;
  timestamp: Date;
  description: string;
}

interface HistoryTimelineProps {
  history: HistoryState[];
  currentIndex: number;
  onSelectState: (index: number) => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function HistoryTimeline({ 
  history, 
  currentIndex, 
  onSelectState,
  canUndo,
  canRedo
}: HistoryTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (history.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <Card className={`bg-background/95 backdrop-blur shadow-lg border transition-all duration-300 ${
        isExpanded ? 'w-[600px]' : 'w-[200px]'
      }`}>
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">History</span>
              <span className="text-xs text-muted-foreground">
                {currentIndex + 1} / {history.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          </div>

          {isExpanded && (
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {history.map((state, index) => {
                  const isCurrent = index === currentIndex;
                  const isFuture = index > currentIndex;
                  
                  return (
                    <button
                      key={state.id}
                      onClick={() => onSelectState(index)}
                      className={`flex-shrink-0 group relative ${
                        isCurrent ? 'ring-2 ring-primary' : ''
                      }`}
                      disabled={isFuture}
                    >
                      <div className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                        isCurrent 
                          ? 'border-primary' 
                          : isFuture 
                            ? 'border-muted opacity-50' 
                            : 'border-border hover:border-primary/50'
                      }`}>
                        <img 
                          src={state.thumbnail} 
                          alt={`State ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap ${
                        isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'
                      }`}>
                        {state.description}
                      </div>
                      {isCurrent && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {!isExpanded && (
            <div className="flex items-center justify-center gap-2 py-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectState(currentIndex - 1)}
                disabled={!canUndo}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="w-12 h-12 rounded border-2 border-primary overflow-hidden">
                {history[currentIndex] && (
                  <img 
                    src={history[currentIndex].thumbnail} 
                    alt="Current state"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectState(currentIndex + 1)}
                disabled={!canRedo}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
