import React from 'react';
import { Box, Typography, Backdrop, alpha, useTheme, LinearProgress } from '@mui/material';
import { useLoading } from '../../context/hooks/useLoading';
import { useSocket } from '../../context/useSocket';
import type { SignalStrength } from '../../context/SocketContext';

// ── Signal bars component ──────────────────────────────────────────────────────
const SIGNAL_COLORS: Record<SignalStrength, string> = {
    strong: '#10B981',
    moderate: '#F59E0B',
    weak: '#EF4444',
    offline: '#6B7280',
};

const SignalBars: React.FC<{ strength: SignalStrength; latencyMs: number | null }> = ({ strength, latencyMs }) => {
    const color = SIGNAL_COLORS[strength];
    const activeBars = strength === 'strong' ? 4 : strength === 'moderate' ? 3 : strength === 'weak' ? 2 : 1;

    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: 20 }}>
            {[1, 2, 3, 4].map(i => (
                <Box
                    key={i}
                    sx={{
                        width: 5,
                        height: 4 + i * 4,
                        borderRadius: '2px',
                        bgcolor: i <= activeBars ? color : 'rgba(255,255,255,0.12)',
                        transition: 'background-color 0.4s ease',
                    }}
                />
            ))}
            {latencyMs !== null && (
                <Typography variant="caption" sx={{
                    color,
                    fontWeight: 700,
                    fontSize: '10px',
                    ml: 0.5,
                    lineHeight: '20px',
                    letterSpacing: 0,
                    transition: 'color 0.4s ease',
                }}>
                    {latencyMs}ms
                </Typography>
            )}
        </Box>
    );
};

// ── Server load chip ───────────────────────────────────────────────────────────
const ServerLoadChip: React.FC<{ cpu: number; freeMemMb: number; totalMemMb: number }> = ({ cpu, freeMemMb, totalMemMb }) => {
    const memUsedPct = Math.round(((totalMemMb - freeMemMb) / totalMemMb) * 100);
    const cpuColor = cpu < 40 ? '#10B981' : cpu < 75 ? '#F59E0B' : '#EF4444';
    const cpuLabel = cpu < 40 ? 'Low' : cpu < 75 ? 'Medium' : 'High';

    return (
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                px: 1, py: 0.3,
                bgcolor: alpha(cpuColor, 0.08),
                border: `1px solid ${alpha(cpuColor, 0.25)}`,
                borderRadius: '20px',
            }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: cpuColor, boxShadow: `0 0 6px ${cpuColor}` }} />
                <Typography sx={{ fontSize: '10px', fontWeight: 700, color: cpuColor, letterSpacing: '0.02em' }}>
                    CPU {cpuLabel} · {cpu}%
                </Typography>
            </Box>
            <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                px: 1, py: 0.3,
                bgcolor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '20px',
            }}>
                <Typography sx={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.02em' }}>
                    MEM {memUsedPct}%
                </Typography>
            </Box>
        </Box>
    );
};

// ── Main overlay ───────────────────────────────────────────────────────────────
const LoadingOverlay: React.FC = () => {
    const theme = useTheme();
    const { isLoading, loadingText, progress, serverLoad } = useLoading();
    const { isConnected, latencyMs, signalStrength } = useSocket();

    // Hide entire overlay on auth and admin pages - they have their own loaders
    const isAuthOrAdminPage = /^\/(login|register|forgot-password|verify-email|admin-login|admin\/|auth\/)/i.test(window.location.pathname);
    const shouldShowOverlay = isLoading && !isAuthOrAdminPage;

    return (
        <Backdrop
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1000,
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0,
                bgcolor: alpha(theme.palette.background.default, 0.75),
                backdropFilter: 'blur(12px)',
                transition: 'all 0.4s ease'
            }}
            open={shouldShowOverlay}
        >
            {/* ── Central glow orb ── */}
            <Box sx={{ position: 'relative', width: 100, height: 100, mb: 3 }}>
                {/* Outer pulse ring */}
                <Box sx={{
                    position: 'absolute', inset: 0,
                    borderRadius: '50%',
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                    animation: 'ripple 2s ease-out infinite',
                }} />
                {/* Second ring */}
                <Box sx={{
                    position: 'absolute', inset: 8,
                    borderRadius: '50%',
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                    animation: 'ripple 2s ease-out 0.5s infinite',
                }} />
                {/* Core spinner */}
                <Box sx={{
                    position: 'absolute', inset: 18,
                    borderRadius: '50%',
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    borderTopColor: theme.palette.primary.main,
                    animation: 'spin 0.9s linear infinite',
                }} />
                {/* Inner dot */}
                <Box sx={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 28, height: 28,
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.main,
                    boxShadow: `0 0 24px ${alpha(theme.palette.primary.main, 0.6)}`,
                    animation: 'pulse 2s ease-in-out infinite',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Box sx={{ width: 10, height: 10, bgcolor: 'white', borderRadius: '50%' }} />
                </Box>
            </Box>

            {/* ── Status text ── */}
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'text.primary',
                    mb: 0.5,
                    fontSize: '0.8rem',
                }}
            >
                {loadingText}
            </Typography>

            {/* ── Progress bar ── */}
            <Box sx={{ width: 280, mt: 1.5, mb: 2.5 }}>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                        height: 3,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.light, 0.8)})`,
                            boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.5)}`,
                            transition: 'transform 0.6s ease',
                        }
                    }}
                />
            </Box>

            {/* ── Signal + connectivity row ── */}
            {!isAuthOrAdminPage && (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 0.8,
                    bgcolor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '40px',
                    mb: 1.5,
                }}>
                    {/* Connection dot */}
                    <Box sx={{
                        width: 7, height: 7, borderRadius: '50%',
                        bgcolor: isConnected ? '#10B981' : '#EF4444',
                        boxShadow: isConnected ? '0 0 8px #10B981' : '0 0 8px #EF4444',
                        animation: isConnected ? 'pulse 2s ease-in-out infinite' : 'none',
                        flexShrink: 0,
                    }} />
                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
                        {isConnected ? 'CONNECTED' : 'OFFLINE'}
                    </Typography>

                    <Box sx={{ width: '1px', height: 12, bgcolor: 'rgba(255,255,255,0.1)' }} />

                    <SignalBars strength={signalStrength} latencyMs={latencyMs} />
                </Box>
            )}

            {/* ── Server load row (only when real data present and not on auth/admin page) ── */}
            {!isAuthOrAdminPage && serverLoad && (
                <ServerLoadChip
                    cpu={serverLoad.cpuUsagePercent}
                    freeMemMb={serverLoad.freeMemMb}
                    totalMemMb={serverLoad.totalMemMb}
                />
            )}

            <style>
                {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    @keyframes pulse {
                        0% { transform: scale(0.95); opacity: 0.8; }
                        50% { transform: scale(1.05); opacity: 1; }
                        100% { transform: scale(0.95); opacity: 0.8; }
                    }
                    @keyframes ripple {
                        0% { transform: scale(0.8); opacity: 0.6; }
                        100% { transform: scale(1.6); opacity: 0; }
                    }
                `}
            </style>
        </Backdrop>
    );
};

export default LoadingOverlay;
