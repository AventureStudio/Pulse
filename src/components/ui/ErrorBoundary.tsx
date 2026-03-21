"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log navigation and execution context errors
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Handle specific navigation errors
    if (error.message?.includes("Execution context was destroyed") || 
        error.message?.includes("navigation")) {
      console.warn("Navigation error detected, attempting recovery");
      
      // Delay retry to allow navigation to complete
      this.retryTimeoutId = setTimeout(() => {
        this.setState({ hasError: false, error: null, errorInfo: null });
      }, 1000);
    }

    this.setState({
      errorInfo: errorInfo.componentStack || "Informations non disponibles"
    });
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    // Clear any pending timeouts
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // For navigation errors, try to reload the page
    if (this.state.error?.message?.includes("Execution context was destroyed") ||
        this.state.error?.message?.includes("navigation")) {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
      return;
    }

    // Standard retry
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const isNavigationError = this.state.error?.message?.includes("Execution context was destroyed") ||
                               this.state.error?.message?.includes("navigation");

      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center max-w-md mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-red-800 mb-1">
            {isNavigationError ? "Erreur de navigation" : "Une erreur est survenue"}
          </p>
          <p className="text-xs text-red-600 mb-4 break-words">
            {isNavigationError 
              ? "La page a été interrompue pendant la navigation. Veuillez recharger la page."
              : this.state.error?.message || "Erreur inconnue"
            }
          </p>
          <button
            onClick={this.handleRetry}
            className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1 hover:bg-red-100 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            {isNavigationError ? "Recharger" : "Réessayer"}
          </button>
          {process.env.NODE_ENV === "development" && this.state.errorInfo && (
            <details className="mt-4 text-left">
              <summary className="text-xs text-red-700 cursor-pointer hover:text-red-800">
                Détails techniques
              </summary>
              <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap bg-red-100 p-2 rounded border">
                {this.state.errorInfo}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}