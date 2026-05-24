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
import { useState,useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import {Button} from '../../components/ui/button';
import TelemetryNode from '../../components/common/TelemetryNode';
import NetworkLoader from '../../pages/admin/components/ui/NetworkLoader';
import { useVerify } from '../../hooks/useUserSignGlobal';
import { useThemeContext } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const AuthGraphic = ({ mode }: { mode: 'light' | 'dark' }) => (
    <Box sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: 6,
        background: mode === 'light'
            ? 'linear-gradient(135deg, #F3F7FF 0%, #E8F0FF 50%, #DDE9FF 100%)'
            : 'radial-gradient(circle at 0% 0%, #0f172a 0%, #020617 100%)',
        position: 'relative',
        overflow: 'hidden',
        color: mode === 'light' ? '#0F172A' : 'white'
    }}>
        <Box sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            opacity: 0.1,
            backgroundImage: `radial-gradient(${alpha('#6366F1', 0.5)} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            zIndex: 0
        }} />

        <motion.div
            animate={{
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                y: [0, 30, 0],
            }}
            transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
            }}
            style={{
                position: 'absolute',
                top: -150,
                left: -150,
                width: 400,
                height: 400,
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
                filter: 'blur(80px)',
                zIndex: 0,
            }}
        />

        <motion.div
            animate={{
                scale: [1, 1.1, 1],
                x: [0, -40, 0],
                y: [0, -60, 0],
            }}
            transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
            }}
            style={{
                position: 'absolute',
                bottom: -100,
                right: -100,
                width: 300,
                height: 300,
                background: 'radial-gradient(circle, rgba(165, 180, 252, 0.15) 0%, transparent 70%)',
                filter: 'blur(60px)',
                zIndex: 0,
            }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 6 }}>
                    <Box sx={{
                        p: 1.2, bgcolor: 'primary.main', borderRadius: 2,
                        boxShadow: `0 0 30px ${alpha('#6366F1', mode === 'light' ? 0.24 : 0.6)}`,
                        display: 'flex', border: mode === 'light' ? '1px solid rgba(79,70,229,0.18)' : '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <AutoAwesome sx={{ fontSize: 28, color: 'white' }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em', color: mode === 'light' ? '#0F172A' : 'white', textShadow: mode === 'light' ? 'none' : '0 2px 10px rgba(0,0,0,0.5)' }}>
                        MCQManager
                    </Typography>
                </Stack>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
            >
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 3, lineHeight: 1.1, letterSpacing: '-0.04em', color: mode === 'light' ? '#0F172A' : 'inherit' }}>
                    Verify <br />
                    <Box component="span" sx={{
                        background: 'linear-gradient(90deg, #6366F1 0%, #A5B4FC 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>Identity</Box>
                </Typography>

                <Typography variant="body1" sx={{ color: mode === 'light' ? 'rgba(15,23,42,0.72)' : 'rgba(255,255,255,0.6)', mb: 8, maxWidth: 350, lineHeight: 1.8, fontSize: '1.05rem' }}>
                    Confirm your email address to activate your MCQ test account and start taking tests.
                </Typography>
            </motion.div>

            <Stack spacing={4}>
                {[
                    { icon: <VerifiedUser color="primary" />, label: 'Secure Email Verification' },
                    { icon: <Hub color="secondary" />, label: 'Instant Account Activation' },
                    { icon: <Security color="success" />, label: 'Protected Access' }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + (i * 0.1) }}
                    >
                        <Stack direction="row" spacing={2.5} alignItems="center">
                            <Box sx={{
                                p: 1.2, bgcolor: mode === 'light' ? alpha('#4F46E5', 0.06) : alpha('#FFF', 0.04), borderRadius: 2,
                                border: mode === 'light' ? '1px solid rgba(79,70,229,0.16)' : '1px solid rgba(255,255,255,0.1)', display: 'flex', backdropFilter: 'blur(10px)'
                            }}>
                                {item.icon}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: mode === 'light' ? 'rgba(15,23,42,0.74)' : 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>{item.label}</Typography>
                        </Stack>
                    </motion.div>
                ))}
            </Stack>
        </Box>
    </Box>
);

const VerifyEmail = () => {
    const { mode } = useThemeContext();
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

    const [minutesLeft, setMinutesLeft] = useState(() => Math.ceil(lockoutTime - Date.now())/60000);
    useEffect(()=>{
        if(!lockoutTime||lockoutTime <= Date.now()) return;
        const timer=setInterval(()=>{
           const remaining = Math.ceil((lockoutTime - Date.now()) / 60000);
           if(remaining <= 0){
            setMinutesLeft(0);
            clearInterval(timer);
           }
           else{
            setMinutesLeft(remaining);
           }
        },1000);
        return ()=>clearInterval(timer);
    },[lockoutTime]);

    const handleVerify = async (e: React.FormEvent) => {
        setNetworkError(null);
        try {
            await originalHandleVerify(e);
        } catch (err: unknown) {
            const error = err as { response?: { status?: number } };
            if (!error.response) {
                setNetworkError('network');
            } else if (error.response?.status && error.response.status >= 500) {
                setNetworkError('server');
            }
        }
    };
    
    const handleResend = async () => {
        setNetworkError(null);
        try {
            await originalHandleResend();
        } catch (err: unknown) {
            const error = err as { response?: { status?: number } };
            if (!error.response) {
                setNetworkError('network');
            } else if (error.response?.status && error.response.status >= 500) {
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
                    title="Verify Email"
                    description="Verify your email to activate access to the Online MCQ test platform."
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
                        <AuthGraphic mode={mode} />
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
                                        Protocol Lockout: Try again after{minutesLeft} minutes.
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
                                            {isLoading ? 'Verifying...' : 'Verify Identity'}
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
