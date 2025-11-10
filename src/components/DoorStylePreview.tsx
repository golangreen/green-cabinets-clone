interface DoorStylePreviewProps {
  styleId: string;
  className?: string;
}

export function DoorStylePreview({ styleId, className = "" }: DoorStylePreviewProps) {
  // Parse style and frame type from ID
  const [baseStyle, frameType] = styleId.split('-') as [string, string];
  
  const renderFramedStyle = () => {
    switch (baseStyle) {
      case "flat":
        return (
          <svg viewBox="0 0 100 100" className={className}>
            {/* Cabinet box */}
            <rect x="5" y="5" width="90" height="90" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" />
            {/* Flat door (simple overlay) */}
            <rect x="10" y="10" width="80" height="80" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2" />
            {/* Handle */}
            <rect x="75" y="45" width="3" height="10" fill="hsl(var(--foreground))" rx="1" />
          </svg>
        );
      
      case "shaker":
        return (
          <svg viewBox="0 0 100 100" className={className}>
            {/* Cabinet box */}
            <rect x="5" y="5" width="90" height="90" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" />
            {/* Shaker door outer frame */}
            <rect x="10" y="10" width="80" height="80" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2" />
            {/* Shaker frame rail (wider frame) */}
            <rect x="17" y="17" width="66" height="66" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2.5" />
            {/* Center panel */}
            <rect x="24" y="24" width="52" height="52" fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth="1" />
            {/* Handle */}
            <rect x="75" y="45" width="3" height="10" fill="hsl(var(--foreground))" rx="1" />
          </svg>
        );
      
      case "slim":
        return (
          <svg viewBox="0 0 100 100" className={className}>
            {/* Cabinet box */}
            <rect x="5" y="5" width="90" height="90" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" />
            {/* Slim shaker door */}
            <rect x="10" y="10" width="80" height="80" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2" />
            {/* Slim frame (narrower) */}
            <rect x="15" y="15" width="70" height="70" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
            {/* Center panel */}
            <rect x="20" y="20" width="60" height="60" fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth="1" />
            {/* Handle */}
            <rect x="75" y="45" width="3" height="10" fill="hsl(var(--foreground))" rx="1" />
          </svg>
        );
      
      default:
        return null;
    }
  };

  const renderFramelessStyle = () => {
    switch (baseStyle) {
      case "flat":
        return (
          <svg viewBox="0 0 100 100" className={className}>
            {/* No visible cabinet box (frameless) */}
            {/* Full overlay flat door */}
            <rect x="2" y="2" width="96" height="96" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2" />
            {/* Minimal reveal line */}
            <line x1="50" y1="2" x2="50" y2="98" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" opacity="0.3" />
            {/* Handle (integrated) */}
            <rect x="85" y="45" width="2" height="10" fill="hsl(var(--foreground))" rx="1" />
          </svg>
        );
      
      case "shaker":
        return (
          <svg viewBox="0 0 100 100" className={className}>
            {/* Full overlay shaker door */}
            <rect x="2" y="2" width="96" height="96" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2" />
            {/* Shaker frame */}
            <rect x="10" y="10" width="80" height="80" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2.5" />
            {/* Center panel */}
            <rect x="17" y="17" width="66" height="66" fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth="1" />
            {/* Minimal reveal */}
            <line x1="50" y1="2" x2="50" y2="98" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" opacity="0.3" />
            {/* Handle */}
            <rect x="85" y="45" width="2" height="10" fill="hsl(var(--foreground))" rx="1" />
          </svg>
        );
      
      case "slim":
        return (
          <svg viewBox="0 0 100 100" className={className}>
            {/* Full overlay slim shaker */}
            <rect x="2" y="2" width="96" height="96" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2" />
            {/* Slim frame */}
            <rect x="8" y="8" width="84" height="84" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
            {/* Center panel */}
            <rect x="13" y="13" width="74" height="74" fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth="1" />
            {/* Minimal reveal */}
            <line x1="50" y1="2" x2="50" y2="98" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" opacity="0.3" />
            {/* Handle */}
            <rect x="85" y="45" width="2" height="10" fill="hsl(var(--foreground))" rx="1" />
          </svg>
        );
      
      default:
        return null;
    }
  };

  const renderInsetStyle = () => {
    switch (baseStyle) {
      case "flat":
        return (
          <svg viewBox="0 0 100 100" className={className}>
            {/* Face frame (visible) */}
            <rect x="5" y="5" width="90" height="90" fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth="2" />
            {/* Frame opening */}
            <rect x="12" y="12" width="76" height="76" fill="hsl(var(--background))" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
            {/* Inset flat door (sits inside frame) */}
            <rect x="14" y="14" width="72" height="72" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2" />
            {/* Reveal gap */}
            <rect x="13" y="13" width="74" height="74" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" opacity="0.5" />
            {/* Handle */}
            <rect x="78" y="45" width="3" height="10" fill="hsl(var(--foreground))" rx="1" />
          </svg>
        );
      
      case "shaker":
        return (
          <svg viewBox="0 0 100 100" className={className}>
            {/* Face frame */}
            <rect x="5" y="5" width="90" height="90" fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth="2" />
            {/* Frame opening */}
            <rect x="12" y="12" width="76" height="76" fill="hsl(var(--background))" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
            {/* Inset shaker door */}
            <rect x="14" y="14" width="72" height="72" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2" />
            {/* Shaker frame detail */}
            <rect x="20" y="20" width="60" height="60" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2" />
            {/* Center panel */}
            <rect x="26" y="26" width="48" height="48" fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth="1" />
            {/* Reveal gap */}
            <rect x="13" y="13" width="74" height="74" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" opacity="0.5" />
            {/* Handle */}
            <rect x="78" y="45" width="3" height="10" fill="hsl(var(--foreground))" rx="1" />
          </svg>
        );
      
      case "slim":
        return (
          <svg viewBox="0 0 100 100" className={className}>
            {/* Face frame */}
            <rect x="5" y="5" width="90" height="90" fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth="2" />
            {/* Frame opening */}
            <rect x="12" y="12" width="76" height="76" fill="hsl(var(--background))" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
            {/* Inset slim shaker */}
            <rect x="14" y="14" width="72" height="72" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2" />
            {/* Slim frame */}
            <rect x="18" y="18" width="64" height="64" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
            {/* Center panel */}
            <rect x="23" y="23" width="54" height="54" fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth="1" />
            {/* Reveal gap */}
            <rect x="13" y="13" width="74" height="74" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" opacity="0.5" />
            {/* Handle */}
            <rect x="78" y="45" width="3" height="10" fill="hsl(var(--foreground))" rx="1" />
          </svg>
        );
      
      default:
        return null;
    }
  };

  // Render based on frame type
  if (frameType === "frameless") {
    return renderFramelessStyle();
  } else if (frameType === "inset") {
    return renderInsetStyle();
  } else {
    return renderFramedStyle();
  }
}
