import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-display font-bold text-text-main mb-2">Something went wrong</h1>
          <p className="text-text-muted mb-6 max-w-md">
            We're sorry, but an unexpected error has occurred. Our team has been notified.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
