import { Component, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="glass-panel p-6 max-w-md w-full">
            <div className="flex items-center gap-2 text-red-400 font-semibold">
              <AlertCircle size={18} />
              Something went wrong
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Try reloading the app. If it persists, check the console for details.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 h-10 px-4 rounded-xl bg-red-500/15 border border-red-500/25 text-red-200 text-sm font-medium hover:bg-red-500/20 transition-colors"
            >
              Reload
            </button>
            <details className="mt-4 text-xs text-[var(--text-tertiary)]">
              <summary className="cursor-pointer">Error details</summary>
              <pre className="mt-2 whitespace-pre-wrap break-all">{this.state.error.message}</pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

