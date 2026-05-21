/**
 * SessionTimeoutWarning Component
 * 
 * Displays warning when session is about to expire
 * - Shows countdown timer
 * - Offers option to extend session or logout
 */

import React from 'react';

interface SessionTimeoutWarningProps {
    show: boolean;
    remainingTime: number;
    onExtend: () => void;
    onLogout: () => void;
}

export const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
    show,
    remainingTime,
    onExtend,
    onLogout,
}) => {
    if (!show) return null;

    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="bg-yellow-100 text-yellow-600 rounded-full p-4">
                        <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">
                    Session Expiring Soon
                </h2>

                {/* Message */}
                <p className="text-center text-gray-600 mb-6">
                    Your session will expire due to inactivity. Click below to extend your session.
                </p>

                {/* Timer */}
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                    <p className="text-sm text-red-700">
                        <strong>Time remaining:</strong>{' '}
                        <span className="font-mono text-lg">
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </span>
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={onLogout}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        Logout
                    </button>
                    <button
                        onClick={onExtend}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                        Stay Logged In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionTimeoutWarning;
