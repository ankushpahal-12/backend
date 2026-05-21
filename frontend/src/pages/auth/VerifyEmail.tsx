import {
    Box,
    Typography,
    TextField,
    Stack,
    Alert,
    Paper,
    IconButton,
    Tooltip,
    Divider,
    Grid,
    alpha
} from '@mui/material';
import {
    ContentCopy,
    CheckCircleOutline,
    AutoAwesome,
    VerifiedUser,
    Hub,
    Security,
    Visibility,
    VisibilityOff,
    KeyboardBackspace
} from '@mui/icons-material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import Button from '../../components/ui/Button';
import TelemetryNode from '../../components/common/TelemetryNode';
import NetworkLoader from '../../pages/admin/components/ui/NetworkLoader';
import { useVerify } from '../../hooks/useUserSignGlobal';

const AuthGraphic = () => (
    <Box sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: 6,
        background: 'radial-gradient(circle at 100% 100%, #0f172a 0%, #020617 100%)',
        position: 'relative',
        overflow: 'hidden',
        color: 'white'
    }}>
        <Box sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            opacity: 0.1,
            backgroundImage: `radial-gradient(${alpha('#10B981', 0.5)} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            zIndex: 0
        }} />

        <Box sx={{
            position: 'absolute',
            bottom: -150, right: -150,
            width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
            zIndex: 0,
            animation: 'floatRev 12s infinite alternate ease-in-out'
        }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 6 }}>
                <Box sx={{
                    p: 1.2, bgcolor: 'primary.main', borderRadius: 2,
                    boxShadow: `0 0 30px ${alpha('#6366F1', 0.6)}`,
                    display: 'flex', border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <AutoAwesome sx={{ fontSize: 28, color: 'white' }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                    FinTrack AI
                </Typography>
            </Stack>

            <Typography variant="h3" sx={{ fontWeight: 900, mb: 3, lineHeight: 1.1, letterSpacing: '-0.04em' }}>
                Verify <br />
                <Box component="span" sx={{
                    background: 'linear-gradient(90deg, #10B981 0%, #6EE7B7 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>Identity</Box>
            </Typography>

            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 8, maxWidth: 350, lineHeight: 1.8, fontSize: '1.05rem' }}>
                Secure multi-node email verification. Your access keys are encrypted with quantum-resistant protocols.
            </Typography>

            <Stack spacing={4}>
                {[
                    { icon: <VerifiedUser color="primary" />, label: 'Zero-Knowledge Privacy' },
                    { icon: <Hub color="secondary" />, label: 'Multi-Node Redundancy' },
                    { icon: <Security color="success" />, label: 'Institutional Security' }
                ].map((item, i) => (
                    <Stack key={i} direction="row" spacing={2.5} alignItems="center">
                        <Box sx={{
                            p: 1.2, bgcolor: alpha('#FFF', 0.04), borderRadius: 2,
                            border: '1px solid rgba(255,255,255,0.1)', display: 'flex', backdropFilter: 'blur(10px)'
                        }}>
                            {item.icon}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>{item.label}</Typography>
                    </Stack>
                ))}
            </Stack>
        </Box>

        <style>
            {`
                @keyframes floatRev {
                    from { transform: translate(0, 0); }
                    to { transform: translate(-10%, -10%); }
                }
            `}
        </style>
    </Box>
);

const VerifyEmail = () => {
    const [networkError, setNetworkError] = useState<'network' | 'server' | null>(null);
    
    const {
        email,
        initialApiKey,
        otpValues,
        showOtp, setShowOtp,
        inputRefs,
        resendTimer,
        resendAttempts,
        lockoutTime,
        isVerified,
        copied,
        isLockedOut,
        isLoading,
        handleOtpChange,
        handleKeyDown,
        handlePaste,
        handleVerify: originalHandleVerify,
        handleResend: originalHandleResend,
        copyToClipboard,
    } = useVerify();

    const handleVerify = async (e: React.FormEvent) => {
        setNetworkError(null);
        try {
            await originalHandleVerify(e);
        } catch (error: any) {
            if (!error.response) {
                setNetworkError('network');
            } else if (error.response?.status >= 500) {
                setNetworkError('server');
            }
        }
    };

    const handleResend = async (e: React.FormEvent) => {
        setNetworkError(null);
        try {
            await originalHandleResend(e);
        } catch (error: any) {
            if (!error.response) {
                setNetworkError('network');
            } else if (error.response?.status >= 500) {
                setNetworkError('server');
            }
        }
    };

    const handleRetry = () => {
        setNetworkError(null);
    };

    if (isVerified && initialApiKey) {
        return (
            <AuthLayout>
                <TelemetryNode title="Identity Confirmed" description="Verification successful. Access token provisioned." />
                <Paper
                    className="glass-card"
                    sx={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.12) !important',
                        boxShadow: '0 50px 100px -20px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)',
                        animation: 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'rgba(15, 23, 42, 0.8) !important',
                        backdropFilter: 'blur(20px)',
                        p: { xs: 4, md: 6 },
                        textAlign: 'center',
                        maxWidth: 600,
                        mx: 'auto'
                    }}
                >
                    <CheckCircleOutline sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: 'white' }}>
                        Verification Complete!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Your account is now active. Below is your unique API Access Key.
                        <strong style={{ color: alpha('#FFF', 0.9) }}> Save this key safely; it won't be shown again.</strong>
                    </Typography>

                    <Paper
                        elevation={0}
                        sx={{
                            p: 2, mb: 4,
                            bgcolor: alpha('#FFF', 0.02),
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            borderRadius: 2
                        }}
                    >
                        <Typography sx={{
                            wordBreak: 'break-all', fontFamily: 'monospace',
                            fontSize: '0.9rem', color: 'primary.light', fontWeight: 600,
                            textAlign: 'left', mr: 2
                        }}>
                            {initialApiKey}
                        </Typography>
                        <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                            <IconButton onClick={copyToClipboard} color="primary">
                                <ContentCopy fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Paper>

                    <Divider sx={{ mb: 4, borderColor: alpha('#FFF', 0.05) }} />

                    <Button
                        fullWidth
                        onClick={() => window.location.href = '/user/dashboard'}
                        variant="contained"
                        sx={{
                            py: 2, borderRadius: 2, fontWeight: 900, fontSize: '1rem', textTransform: 'none',
                            background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
                            '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 12px 20px ${alpha('#6366F1', 0.35)}` }
                        }}
                    >
                        Go to Dashboard
                    </Button>
                </Paper>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <TelemetryNode
                title="Verify Identity"
                description="Secure multi-node email verification. Advanced security protocols active."
            />

            {networkError && (
                <NetworkLoader
                    status={networkError === 'network' ? 'network-unavailable' : 'server-unavailable'}
                    message={networkError === 'network' ? 'Unable to connect to the network. Please check your connection.' : 'The verification server is currently unavailable. Please try again later.'}
                    onRetry={handleRetry}
                    showDetails={true}
                />
            )}

            {!networkError && (
            <Paper
                className="glass-card"
                sx={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.12) !important',
                    boxShadow: '0 50px 100px -20px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)',
                    animation: 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                    height: { md: '650px' },
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(15, 23, 42, 0.8) !important',
                    backdropFilter: 'blur(20px)'
                }}
            >
                <Grid container sx={{ flexGrow: 1 }}>
                    {/* Left: Graphic */}
                    <Grid size={{ xs: 0, md: 5, lg: 6.5 }} sx={{ display: { xs: 'none', md: 'block' } }}>
                        <AuthGraphic />
                    </Grid>

                    {/* Right: Form */}
                    <Grid size={{ xs: 12, md: 7, lg: 5.5 }}>
                        <Box sx={{ p: { xs: 4, sm: 6, lg: 8 }, height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                            <Box sx={{ my: 'auto' }}>
                                <IconButton
                                    component={RouterLink}
                                    to="/user/login"
                                    sx={{ mb: 4, color: 'text.secondary', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}
                                >
                                    <KeyboardBackspace />
                                </IconButton>

                                <Stack spacing={1} sx={{ mb: 4 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: 'white' }}>
                                        Verify OTP
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Secure code sent to <span style={{ color: alpha('#6366F1', 0.9), fontWeight: 700 }}>{email}</span>
                                    </Typography>
                                </Stack>

                                {isLockedOut && (
                                    <Alert
                                        severity="error"
                                        sx={{
                                            mb: 3, borderRadius: 2,
                                            bgcolor: alpha('#EF4444', 0.1),
                                            color: '#FCA5A5',
                                            border: '1px solid rgba(239, 68, 68, 0.2)'
                                        }}
                                    >
                                        Protocol Lockout: Try again after {Math.ceil((lockoutTime - Date.now()) / 60000)} minutes.
                                    </Alert>
                                )}

                                <Box component="form" onSubmit={handleVerify} sx={{ width: '100%' }}>
                                    <Stack spacing={4}>
                                        <Box>
                                            <Stack direction="row" spacing={1.5} justifyContent="space-between" sx={{ mb: 2 }}>
                                                {otpValues.map((value, index) => (
                                                    <TextField
                                                        key={index}
                                                        inputRef={el => inputRefs.current[index] = el}
                                                        value={value}
                                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                                        onPaste={handlePaste}
                                                        type={showOtp ? 'text' : 'password'}
                                                        disabled={isLoading || isLockedOut}
                                                        slotProps={{
                                                            htmlInput: {
                                                                style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 900, padding: '12px 0' },
                                                                'data-lpignore': 'true'
                                                            },
                                                            input: {
                                                                sx: {
                                                                    width: '100%', height: '60px', borderRadius: 2,
                                                                    bgcolor: alpha('#FFF', 0.02),
                                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                                    '&:hover': { border: '1px solid rgba(255,255,255,0.25)' },
                                                                    '&.Mui-focused': { border: `1px solid ${alpha('#6366F1', 0.5)}` }
                                                                }
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </Stack>

                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <IconButton
                                                    onClick={() => setShowOtp(!showOtp)}
                                                    size="small"
                                                    sx={{ color: 'text.secondary', '&:hover': { color: 'primary.light' } }}
                                                >
                                                    {showOtp ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                    <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 700 }}>{showOtp ? 'Hide' : 'Show'}</Typography>
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        <Button
                                            fullWidth size="large" type="submit" variant="contained"
                                            disabled={isLoading || otpValues.some(v => !v) || isLockedOut}
                                            sx={{
                                                py: 2, borderRadius: 2, fontWeight: 900, fontSize: '1rem', textTransform: 'none',
                                                background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
                                                boxShadow: `0 8px 16px ${alpha('#6366F1', 0.25)}`,
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: `0 12px 20px ${alpha('#6366F1', 0.35)}`
                                                },
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {isLoading ? 'Decrypting...' : 'Verify Identity'}
                                        </Button>

                                        <Box sx={{ textAlign: 'center' }}>
                                            {resendAttempts >= 3 ? (
                                                <Typography variant="body2" color="#FCA5A5" sx={{ fontWeight: 700, p: 1, borderRadius: 1, bgcolor: alpha('#EF4444', 0.1) }}>
                                                    Security Threshold Reached: Reload required.
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Missed the transmission?{' '}
                                                    <Button
                                                        type="button"
                                                        variant="text"
                                                        onClick={handleResend}
                                                        disabled={resendTimer > 0 || isLockedOut}
                                                        sx={{
                                                            fontWeight: 800, fontSize: 'inherit', minWidth: 'auto', padding: 0,
                                                            color: (resendTimer > 0 || isLockedOut) ? 'text.disabled' : 'primary.light',
                                                            '&:hover': { background: 'transparent', textDecoration: 'underline' }
                                                        }}
                                                    >
                                                        {resendTimer > 0 ? `Retry in ${resendTimer}s` : 'Resend Code'}
                                                    </Button>
                                                </Typography>
                                            )}
                                        </Box>
                                    </Stack>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
            )}
        </AuthLayout>
    );
};

export default VerifyEmail;
