/**
 * SuspiciousActivityAlert Component
 * 
 * Alerts user of suspicious account activity
 * - Unusual login location
 * - Multiple concurrent sessions
 * - Impossible travel detection
 */

import React, { useState, useEffect } from 'react';

interface SuspiciousActivity {
    type: 'impossible-travel' | 'concurrent-sessions' | 'unusual-location' | 'new-device';
    message: string;
    severity: 'warning' | 'error' | 'critical';
    action?: {
        label: string;
        onClick: () => void;
    };
    dismissible?: boolean;
}

interface SuspiciousActivityAlertProps {
    activity: SuspiciousActivity | null;
    onDismiss?: () => void;
}

export const SuspiciousActivityAlert: React.FC<SuspiciousActivityAlertProps> = ({
    activity,
    onDismiss,
}) => {
    const [isVisible, setIsVisible] = useState(!!activity);

    useEffect(() => {
        setIsVisible(!!activity);
    }, [activity]);

    if (!isVisible || !activity) return null;

    const bgColor = {
        warning: 'bg-yellow-50',
        error: 'bg-orange-50',
        critical: 'bg-red-50',
    }[activity.severity];

    const borderColor = {
        warning: 'border-yellow-400',
        error: 'border-orange-400',
        critical: 'border-red-400',
    }[activity.severity];

    const iconColor = {
        warning: 'text-yellow-600',
        error: 'text-orange-600',
        critical: 'text-red-600',
    }[activity.severity];

    const textColor = {
        warning: 'text-yellow-800',
        error: 'text-orange-800',
        critical: 'text-red-800',
    }[activity.severity];

    const severityLabel = {
        warning: 'Warning',
        error: 'Security Alert',
        critical: 'Critical Alert',
    }[activity.severity];

    const handleDismiss = () => {
        setIsVisible(false);
        onDismiss?.();
    };

    return (
        <div className={`${bgColor} border-l-4 ${borderColor} p-4 mb-4`}>
            <div className="flex items-start">
                {/* Icon */}
                <div className={`flex-shrink-0 ${iconColor}`}>
                    {activity.severity === 'warning' && (
                        <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    )}
                    {activity.severity === 'error' && (
                        <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 2.523a6 6 0 008.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    )}
                    {activity.severity === 'critical' && (
                        <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 2.523a6 6 0 008.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>

                {/* Content */}
                <div className="ml-3 flex-1">
                    <p className={`font-semibold ${textColor}`}>
                        {severityLabel}
                    </p>
                    <p className={`text-sm mt-1 ${textColor}`}>
                        {activity.message}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                        {activity.action && (
                            <button
                                onClick={activity.action.onClick}
                                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                    activity.severity === 'warning'
                                        ? 'bg-yellow-200 hover:bg-yellow-300 text-yellow-900'
                                        : activity.severity === 'error'
                                        ? 'bg-orange-200 hover:bg-orange-300 text-orange-900'
                                        : 'bg-red-200 hover:bg-red-300 text-red-900'
                                }`}
                            >
                                {activity.action.label}
                            </button>
                        )}

                        {activity.dismissible && (
                            <button
                                onClick={handleDismiss}
                                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                    activity.severity === 'warning'
                                        ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                                        : activity.severity === 'error'
                                        ? 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                                        : 'bg-red-100 hover:bg-red-200 text-red-700'
                                }`}
                            >
                                Dismiss
                            </button>
                        )}
                    </div>
                </div>

                {/* Close button */}
                {activity.dismissible && (
                    <button
                        onClick={handleDismiss}
                        className={`flex-shrink-0 ml-3 inline-flex ${iconColor} hover:opacity-75`}
                    >
                        <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default SuspiciousActivityAlert;
