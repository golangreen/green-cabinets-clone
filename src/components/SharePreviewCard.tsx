import { forwardRef } from "react";

interface SharePreviewCardProps {
  brand: string;
  finish: string;
  dimensions: string;
  doorStyle: string;
  countertop: string;
  sink: string;
  price: string;
}

export const SharePreviewCard = forwardRef<HTMLDivElement, SharePreviewCardProps>(
  ({ brand, finish, dimensions, doorStyle, countertop, sink, price }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[1200px] h-[630px] bg-gradient-to-br from-primary/20 via-background to-accent/20 p-12 flex flex-col justify-between relative overflow-hidden"
        style={{ position: 'absolute', left: '-9999px' }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-foreground">GC</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Green Cabinets</h1>
              <p className="text-xl text-muted-foreground">Custom Vanity Design</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border">
            <h2 className="text-5xl font-bold mb-6 text-foreground">
              Custom Vanity Configuration
            </h2>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Dimensions</p>
                  <p className="text-2xl font-semibold text-foreground">{dimensions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Materials</p>
                  <p className="text-2xl font-semibold text-foreground">{brand} - {finish}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Cabinet Style</p>
                  <p className="text-2xl font-semibold text-foreground">{doorStyle}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Countertop</p>
                  <p className="text-2xl font-semibold text-foreground">{countertop}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Sink</p>
                  <p className="text-2xl font-semibold text-foreground">{sink}</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary/30">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Total Estimate</p>
                  <p className="text-4xl font-bold text-primary">{price}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex justify-between items-end">
          <div className="text-muted-foreground">
            <p className="text-xl">Visit us at</p>
            <p className="text-2xl font-semibold text-foreground">greencabinetsny.com</p>
          </div>
          <div className="text-right">
            <p className="text-lg text-muted-foreground">Custom Cabinet Solutions</p>
            <p className="text-lg text-muted-foreground">Premium Quality Since 2020</p>
          </div>
        </div>
      </div>
    );
  }
);

SharePreviewCard.displayName = "SharePreviewCard";
