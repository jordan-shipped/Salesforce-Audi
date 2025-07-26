import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for monitoring/debugging
    console.error('Error caught by boundary:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    this.setState({
      error,
      errorInfo
    });

    // TODO: Send to error reporting service (Sentry, LogRocket, etc.)
    // errorReportingService.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background-page flex items-center justify-center p-lg">
          <div className="card max-w-lg w-full text-center">
            <div className="mb-lg">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-md">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-h2 font-semibold text-text-primary mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-body-regular text-text-grey-600 mb-lg">
                We encountered an unexpected error. Our team has been notified and is working on a fix.
              </p>
            </div>

            <div className="flex gap-md justify-center">
              <button 
                onClick={this.handleRetry}
                className="btn-primary"
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="btn-secondary"
              >
                Go Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-lg text-left">
                <summary className="text-caption font-semibold text-text-grey-600 cursor-pointer mb-2">
                  Development Error Details
                </summary>
                <div className="bg-red-50 border border-red-200 rounded-sm p-md">
                  <pre className="text-xs text-red-800 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export const withErrorBoundary = (Component, fallbackComponent = null) => {
  return function WithErrorBoundaryComponent(props) {
    return (
      <ErrorBoundary fallback={fallbackComponent}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

export default ErrorBoundary;