import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-lg font-semibold text-charcoal">Something went wrong</h1>
          <p className="max-w-md text-sm text-muted">
            An unexpected error occurred. Refresh the page or try again in a moment.
          </p>
          <Button type="button" onClick={() => window.location.reload()}>
            Refresh page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
