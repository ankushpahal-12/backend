import React, { ReactNode } from 'react';
import { useErrorBoundaryLogic } from '../../hooks/useErrorBoundaryLogic';
import { useAutoLogoutLogic } from '../../hooks/useAutoLogoutLogic';
import { useSessionTimeoutWarning } from '../../hooks/useSessionTimeoutWarning';
import { useSuspiciousActivityAlert } from '../../hooks/useSuspiciousActivityAlert';

interface ErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Error UI Component
 * Displays error message and recovery options
 */
const ErrorUI: React.FC<{
  error: Error | null;
  onReset: () => void;
}> = ({ error, onReset }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-900 text-center mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 text-center mb-4">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm">
            <p className="font-mono text-red-800 break-words">
              {error.message}
            </p>
          </div>
        )}

        <button
          onClick={onReset}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

/**
 * Error Boundary Component
 * Catches and displays errors gracefully using hooks for logic
 */
export class ZeroTrustErrorBoundary extends React.Component<ErrorBoundaryProps> {
  private errorLogicHook: ReturnType<typeof useErrorBoundaryLogic> | null = null;
  private hasError = false;
  private error: Error | null = null;
  private errorInfo: { componentStack: string } | null = null;

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    this.hasError = true;
    this.error = error;
    this.errorInfo = errorInfo;

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // Emit custom event for error tracking
    window.dispatchEvent(
      new CustomEvent('zeroTrust:error', {
        detail: { error: error.message, type: 'boundary' },
      })
    );

    // Force re-render
    this.forceUpdate();
  }

  handleReset = () => {
    this.hasError = false;
    this.error = null;
    this.errorInfo = null;
    this.forceUpdate();
  };

  render() {
    if (this.hasError) {
      return <ErrorUI error={this.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

/**
 * Auto-Logout Manager Component
 * Wrapper component that uses useAutoLogoutLogic hook
 */
export const AutoLogoutManager: React.FC<{
  timeoutMinutes?: number;
  children: ReactNode;
  onLogout?: () => void;
}> = ({ timeoutMinutes = 15, children, onLogout }) => {
  const { isLoggedOut } = useAutoLogoutLogic({
    timeoutMinutes,
    onSessionTimeout: onLogout,
  });

  if (isLoggedOut) {
    // Redirect will be handled by parent component
    return null;
  }

  return <>{children}</>;
};

/**
 * Session Timeout Warning Dialog Component
 * Pure UI component using useSessionTimeoutWarning hook
 */
export const SessionTimeoutWarning: React.FC<{
  isVisible: boolean;
  timeRemaining?: number;
  onContinue: () => void;
  onLogout: () => void;
}> = ({ isVisible, timeRemaining, onContinue, onLogout }) => {
  if (!isVisible) return null;

  const minutesRemaining = Math.floor((timeRemaining ?? 60) / 60);
  const secondsRemaining = (timeRemaining ?? 60) % 60;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
          <svg
            className="w-6 h-6 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 className="text-lg font-bold text-gray-900 text-center mb-2">
          Session Expiring Soon
        </h2>
        <p className="text-gray-600 text-center mb-2">
          Your session will expire in {minutesRemaining}m {secondsRemaining}s due to inactivity.
        </p>
        <p className="text-sm text-gray-500 text-center mb-6">
          Click "Continue" to stay logged in.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onLogout}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Logout
          </button>
          <button
            onClick={onContinue}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Suspicious Activity Alert Component
 * Pure UI component using useSuspiciousActivityAlert hook
 */
export const SuspiciousActivityAlert: React.FC<{
  isVisible: boolean;
  message?: string;
  type?: 'warning' | 'error' | 'info';
  onDismiss: () => void;
}> = ({ isVisible, message = 'Suspicious activity detected. Please verify your identity.', type = 'warning', onDismiss }) => {
  if (!isVisible) return null;

  const bgColor = type === 'error' ? 'bg-red-50' : type === 'info' ? 'bg-blue-50' : 'bg-yellow-50';
  const borderColor = type === 'error' ? 'border-red-200' : type === 'info' ? 'border-blue-200' : 'border-yellow-200';
  const textColor = type === 'error' ? 'text-red-600' : type === 'info' ? 'text-blue-600' : 'text-yellow-600';
  const iconPath = type === 'error' 
    ? 'M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    : type === 'info'
    ? 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    : 'M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';

  return (
    <div className={`fixed top-4 right-4 max-w-sm ${bgColor} border ${borderColor} rounded-lg shadow-lg p-4 z-40 animate-in`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className={`w-5 h-5 ${textColor}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
          </svg>
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className={`flex-shrink-0 text-opacity-40 hover:text-opacity-60 ${textColor}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default {
  ZeroTrustErrorBoundary,
  AutoLogoutManager,
  useAutoLogoutLogic,
  useErrorBoundaryLogic,
  useSessionTimeoutWarning,
  useSuspiciousActivityAlert,
  SessionTimeoutWarning,
  SuspiciousActivityAlert,
};
