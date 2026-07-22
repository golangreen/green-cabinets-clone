import { Component, type ErrorInfo, type ReactNode } from "react";
import { isModuleLoadError, recoverFromModuleLoadError } from "@/lib/moduleLoadRecovery";

type ChunkErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ChunkErrorBoundaryState = {
  error: unknown;
};

class ChunkErrorBoundary extends Component<ChunkErrorBoundaryProps, ChunkErrorBoundaryState> {
  state: ChunkErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ChunkErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    if (isModuleLoadError(error)) {
      recoverFromModuleLoadError("React module boundary caught a failed import");
      return;
    }

    // eslint-disable-next-line no-console
    console.error("Unhandled application error", error, errorInfo);
  }

  render() {
    if (!this.state.error) return this.props.children;

    if (isModuleLoadError(this.state.error)) {
      return this.props.fallback ?? null;
    }

    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6" role="alert">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-muted-foreground">Refresh the page to continue.</p>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </main>
    );
  }
}

export default ChunkErrorBoundary;