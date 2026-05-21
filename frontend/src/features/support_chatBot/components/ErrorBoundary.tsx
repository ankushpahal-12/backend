import React, { ReactNode, ReactElement } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactElement;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SupportWidgetErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Support Widget Error:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center gap-4 p-6 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="text-red-600" size={24} />
            <div className="text-center">
              <p className="font-semibold text-red-900">Something went wrong</p>
              <p className="text-sm text-red-700 mt-1">The support widget encountered an error</p>
            </div>
            <button
              onClick={this.reset}
              className="text-xs px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
