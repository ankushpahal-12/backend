/**
 * Zero Trust UI Component
 * Handles MFA input, device management, and security dashboard
 */

import React, { useState, useEffect } from 'react';
import { useZeroTrust } from '../../hooks/useZeroTrust';
import type { MFAChallengeDialogProps, MFAChallengeDetail } from '../../hooks/useZeroTrust';
import { LockIcon, CheckmarkIcon, HourglassIcon, WarningIcon, getDeviceIcon } from './Icons';

/**
 * MFA Challenge Dialog Component
 * Displays when high-risk request is detected
 */
export const MFAChallengeDialog: React.FC<MFAChallengeDialogProps> = ({ isOpen, challengeId, riskLevel, onSubmit, onCancel }) => {
    const { verifyMFA, loading, error } = useZeroTrust();
    const [code, setCode] = useState<string>('');
    const [localError, setLocalError] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes

    // Timer countdown
    useEffect(() => {
        if (!isOpen) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    onCancel?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, onCancel]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (code.length !== 6 || !/^\d+$/.test(code)) {
            setLocalError('Please enter a 6-digit code');
            return;
        }

        setLocalError(null);

        try {
            const verified = await verifyMFA(challengeId, code);
            if (verified) {
                onSubmit?.(code);
                setCode('');
                setTimeLeft(600);
            } else {
                setLocalError(error || 'Verification failed');
            }
        } catch {
            setLocalError('Failed to verify code. Please try again.');
        }
    };

    if (!isOpen) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const displayError = localError || error;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                         Security Verification
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        A high-risk request was detected on your account
                    </p>
                </div>

                {/* Risk Level Badge */}
                <div className={`mb-6 p-3 rounded-lg ${
                    riskLevel === 'critical' ? 'bg-red-50 border border-red-200' :
                    riskLevel === 'high' ? 'bg-orange-50 border border-orange-200' :
                    'bg-yellow-50 border border-yellow-200'
                }`}>
                    <p className="text-sm font-medium text-gray-700">
                        Risk Level: <span className="font-bold uppercase">{riskLevel}</span>
                    </p>
                </div>

                {/* Error Message */}
                {displayError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{displayError}</p>
                    </div>
                )}

                {/* MFA Code Input */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Verification Code
                        </label>
                        <p className="text-xs text-gray-600 mb-3">
                            A 6-digit code was sent to your email address
                        </p>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            className="w-full px-4 py-2 text-center text-2xl tracking-widest font-mono border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    {/* Timer */}
                    <div className="text-center text-sm text-gray-600">
                        Code expires in: <span className="font-mono font-bold">
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || code.length !== 6}
                            className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <HourglassIcon className="w-4 h-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <CheckmarkIcon className="w-4 h-4" />
                                    Verify
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Help Text */}
                <p className="mt-6 text-xs text-gray-500 text-center">
                    Didn't receive a code? Check your spam folder or{' '}
                    <button className="text-blue-600 hover:underline">resend</button>
                </p>
            </div>
        </div>
    );
};

/**
 * Device Management Component
 * Shows list of trusted devices and their trust scores
 */
export const DeviceManagement: React.FC = () => {
    const { trustedDevices, dashboardLoading, dashboardError, fetchTrustedDevices, revokeDevice, getTrustBadgeColorClass } = useZeroTrust();

    useEffect(() => {
        fetchTrustedDevices();
    }, [fetchTrustedDevices]);

    const handleRevokeDevice = async (deviceId: string): Promise<void> => {
        if (!confirm('Are you sure? This will require MFA on future logins from this device.')) {
            return;
        }
        await revokeDevice(deviceId);
    };

    if (dashboardLoading) {
        return <div className="text-center py-8">Loading devices...</div>;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Trusted Devices</h3>
            
            {dashboardError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {dashboardError}
                </div>
            )}

            {trustedDevices.length === 0 ? (
                <p className="text-gray-600 text-sm">No trusted devices yet</p>
            ) : (
                <div className="space-y-3">
                    {trustedDevices.map(device => (
                        <div
                            key={device.id}
                            className="p-4 border border-gray-200 rounded-lg hover:border-gray-300"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="text-blue-600">
                                            {getDeviceIcon(device.userAgent, "w-6 h-6")}
                                        </div>
                                        <span className="font-medium text-gray-900 truncate">
                                            {device.userAgent.slice(0, 50)}...
                                        </span>
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${getTrustBadgeColorClass(device.trustScore)}`}>
                                            {device.trustScore}% Trust
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-600 space-y-1">
                                        <p>Fingerprint: {device.fingerprint}</p>
                                        <p>IPs: {device.ips.join(', ')}</p>
                                        <p>Last seen: {new Date(device.lastSeen).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRevokeDevice(device.id)}
                                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded border border-red-200"
                                >
                                    Revoke
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * Security Dashboard Component
 * Shows risk assessment and recommendations
 */
export const SecurityDashboard: React.FC = () => {
    const { riskSummary, dashboardLoading, dashboardError, fetchRiskSummary, getRiskColorClass } = useZeroTrust();

    useEffect(() => {
        fetchRiskSummary();
    }, [fetchRiskSummary]);

    if (dashboardLoading) {
        return <div className="text-center py-8">Loading security data...</div>;
    }

    if (!riskSummary) return null;

    return (
        <div className="space-y-6">
            {dashboardError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {dashboardError}
                </div>
            )}

            {/* Overall Risk */}
            <div className={`p-6 rounded-lg border-2 ${getRiskColorClass(riskSummary.overallRiskLevel)}`}>
                <h3 className="text-lg font-bold mb-2">Overall Risk Level</h3>
                <p className="text-3xl font-bold uppercase">{riskSummary.overallRiskLevel}</p>
            </div>

            {/* Device Metrics */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Device Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Devices</p>
                        <p className="text-3xl font-bold text-gray-900">{riskSummary.deviceMetrics.totalDevices}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Trusted</p>
                        <p className="text-3xl font-bold text-green-600">{riskSummary.deviceMetrics.trustedDevices}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Compromised</p>
                        <p className="text-3xl font-bold text-red-600">{riskSummary.deviceMetrics.compromisedDevices}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Avg Trust Score</p>
                        <p className="text-3xl font-bold text-blue-600">{riskSummary.deviceMetrics.averageTrustScore}%</p>
                    </div>
                </div>
            </div>

            {/* Behavior Metrics */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Behavior Metrics</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Recent Requests</span>
                        <span className="font-bold text-gray-900">{riskSummary.behaviorMetrics.recentRequests}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Critical Anomalies</span>
                        <span className={`font-bold ${riskSummary.behaviorMetrics.criticalAnomalies > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {riskSummary.behaviorMetrics.criticalAnomalies}
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">High Risk Requests</span>
                        <span className={`font-bold ${riskSummary.behaviorMetrics.highRiskRequests > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            {riskSummary.behaviorMetrics.highRiskRequests}
                        </span>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recommendations</h3>
                <div className="space-y-2">
                    {riskSummary.recommendations.map((rec, idx) => (
                        <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-sm">
                            {rec}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/**
 * Complete Zero Trust Settings Page Component
 */
export const ZeroTrustSettings: React.FC = () => {
    const { trustStatus, riskLevel } = useZeroTrust();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'devices'>('dashboard');
    const [mfaChallenge, setMfaChallenge] = useState<MFAChallengeDetail | null>(null);

    useEffect(() => {
        // Listen for MFA challenges
        const handleMFARequired = (event: Event): void => {
            if (event instanceof CustomEvent) {
                setMfaChallenge(event.detail);
            }
        };

        const handleMFAVerified = (): void => {
            setMfaChallenge(null);
        };

        window.addEventListener('zeroTrust:mfaRequired', handleMFARequired);
        window.addEventListener('zeroTrust:mfaVerified', handleMFAVerified);

        return () => {
            window.removeEventListener('zeroTrust:mfaRequired', handleMFARequired);
            window.removeEventListener('zeroTrust:mfaVerified', handleMFAVerified);
        };
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* MFA Challenge Dialog */}
            {mfaChallenge && (
                <MFAChallengeDialog
                    isOpen={true}
                    challengeId={mfaChallenge.mfaChallengeId}
                    riskLevel={mfaChallenge.riskLevel}
                    onCancel={() => setMfaChallenge(null)}
                />
            )}

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <LockIcon className="w-8 h-8 text-blue-600" />
                    Zero Trust Security Settings
                </h1>
                <p className="text-gray-600 mt-2">
                    Manage your devices and security settings with continuous verification
                </p>
            </div>

            {/* Status Bar */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">Current Risk Level</p>
                    <p className="text-lg font-bold text-gray-900">{riskLevel || 'low'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">Device Status</p>
                    <div className="flex items-center gap-2">
                        {trustStatus === 'trusted' ? (
                            <>
                                <CheckmarkIcon className="w-5 h-5 text-green-600" />
                                <p className="text-lg font-bold text-green-600">Trusted</p>
                            </>
                        ) : (
                            <>
                                <WarningIcon className="w-5 h-5 text-orange-600" />
                                <p className="text-lg font-bold text-orange-600">Unverified</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-4 py-2 font-medium border-b-2 transition ${
                        activeTab === 'dashboard'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Security Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('devices')}
                    className={`px-4 py-2 font-medium border-b-2 transition ${
                        activeTab === 'devices'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Device Management
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                {activeTab === 'dashboard' && <SecurityDashboard />}
                {activeTab === 'devices' && <DeviceManagement />}
            </div>
        </div>
    );
};

export default ZeroTrustSettings;
