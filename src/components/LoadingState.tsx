import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingState = ({ message = "Loading...", fullScreen = false }: LoadingStateProps) => {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-40 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
    : "flex flex-col items-center justify-center py-12";

  return (
    <div className={containerClasses}>
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <p className="text-muted-foreground text-lg animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingState;
