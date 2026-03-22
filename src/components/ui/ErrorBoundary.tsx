"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Bug, Copy } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showStack: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showStack: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    console.error('[ErrorBoundary] Error caught:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log détaillé pour le diagnostic
    console.group('[ErrorBoundary] Detailed Error Report');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // Log pour Vercel Analytics
    if (typeof window !== 'undefined') {
      try {
        // Envoyer à un service de monitoring si configuré
        const errorData = {
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        };
        
        console.log('[ErrorBoundary] Error data for monitoring:', errorData);
        
        // Stocker dans localStorage pour debug
        localStorage.setItem('lastError', JSON.stringify(errorData));
      } catch (e) {
        console.error('[ErrorBoundary] Failed to log error data:', e);
      }
    }
  }

  private copyErrorToClipboard = async () => {
    if (!this.state.error) return;
    
    const errorText = `
Erreur: ${this.state.error.message}
Stack: ${this.state.error.stack}
Component Stack: ${this.state.errorInfo?.componentStack || 'N/A'}
URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}
Timestamp: ${new Date().toISOString()}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      console.log('[ErrorBoundary] Error copied to clipboard');
    } catch (e) {
      console.error('[ErrorBoundary] Failed to copy error:', e);
    }
  };

  private handleRetry = () => {
    console.log('[ErrorBoundary] Retrying...');
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null, 
      showStack: false 
    });
  };

  private toggleStack = () => {
    this.setState(prev => ({ showStack: !prev.showStack }));
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback;

      const isDev = process.env.NODE_ENV === 'development';
      const showDetails = this.props.showDetails !== false;

      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center max-w-2xl mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          
          <div className="mb-4">
            <p className="text-sm font-medium text-red-800 mb-1">
              Une erreur est survenue
            </p>
            <p className="text-xs text-red-600 mb-2">
              {this.state.error.message}
            </p>
          </div>

          {(isDev || showDetails) && (
            <div className="mb-4 text-left">
              <button
                onClick={this.toggleStack}
                className="flex items-center gap-1 text-xs text-red-700 hover:text-red-800 mb-2 mx-auto"
              >
                <Bug className="w-3 h-3" />
                {this.state.showStack ? 'Masquer' : 'Voir'} les détails
              </button>
              
              {this.state.showStack && (
                <div className="bg-red-100 border border-red-200 rounded p-3 text-xs font-mono">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-red-700 font-bold">Stack Trace:</span>
                    <button
                      onClick={this.copyErrorToClipboard}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      title="Copier l'erreur"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <pre className="text-red-800 whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                    {this.state.error.stack}
                  </pre>
                  
                  {this.state.errorInfo?.componentStack && (
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <div className="text-red-700 font-bold mb-1">Component Stack:</div>
                      <pre className="text-red-800 whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={this.handleRetry}
              className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Réessayer
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="btn-primary text-xs px-3 py-1.5 inline-flex items-center justify-center gap-1"
            >
              Recharger la page
            </button>
          </div>

          {typeof window !== 'undefined' && (
            <p className="text-xs text-red-500 mt-3">
              Erreur sauvegardée dans la console pour diagnostic
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}