import {
    Box,
    Typography,
    TextField,
    Link,
    IconButton,
    InputAdornment,
    Stack,
    Paper,
    alpha,
    Grid,
    Divider,
    FormControlLabel,
    Checkbox,
    Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Visibility,
    VisibilityOff,
    Google as GoogleIcon,
    Security,
    KeyboardBackspace,
    Devices,
    Login as LoginIcon,
    AutoAwesome,
    VerifiedUser,
    Hub
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import AuthLayout from '../../components/auth/AuthLayout';
import {Button} from '../../components/ui/button';
import TelemetryNode from '../../components/common/TelemetryNode';
import NetworkLoader from '../../pages/admin/components/ui/NetworkLoader';
import ConcurrentSessionModal from '../../components/auth/ConcurrentSessionModal';
import { useLogin } from '../../hooks/useUserSignGlobal';
import { useThemeContext } from '../../context/ThemeContext';
import { initAuthSession } from '../../services/authService';
import toast from 'react-hot-toast';

const MobileAuthPanel = ({ mode }: { mode: 'light' | 'dark' }) => (
    <Box sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: 3,
        background: mode === 'light'
            ? 'linear-gradient(135deg, #F3F7FF 0%, #E8F0FF 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        color: mode === 'light' ? '#0F172A' : 'white',
        textAlign: 'center'
    }}>
        <Stack spacing={2} sx={{ zIndex: 1 }}>
            <AutoAwesome sx={{ fontSize: 48, margin: '0 auto', color: mode === 'light' ? '#4F46E5' : 'white' }} />
            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                MCQManager
            </Typography>
            <Typography variant="body2" sx={{ color: mode === 'light' ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                Create, assign, and take MCQ tests with secure sessions and instant grading.
            </Typography>
        </Stack>
    </Box>
);

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
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `radial-gradient(${alpha('#6366F1', 0.5)} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            zIndex: 0
        }} />

        {/* Animated Orbs */}
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
                        p: 1.2,
                        bgcolor: 'primary.main',
                        borderRadius: 2,
                        boxShadow: `0 0 30px ${alpha('#6366F1', mode === 'light' ? 0.24 : 0.6)}`,
                        display: 'flex',
                        border: mode === 'light' ? '1px solid rgba(79,70,229,0.18)' : '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <AutoAwesome sx={{ fontSize: 28, color: 'white' }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em', color: mode === 'light' ? '#0F172A' : 'white', textShadow: mode === 'light' ? 'none' : '0 2px 10px rgba(0,0,0,0.5)' }}>
                        FinTrack AI
                    </Typography>
                </Stack>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
            >
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 3, lineHeight: 1.1, letterSpacing: '-0.04em', color: mode === 'light' ? '#0F172A' : 'inherit' }}>
                    Secure <br />
                    <Box component="span" sx={{
                        background: 'linear-gradient(90deg, #6366F1 0%, #A5B4FC 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>Telemetry</Box> Access.
                </Typography>

                <Typography variant="body1" sx={{ color: mode === 'light' ? 'rgba(15,23,42,0.72)' : 'rgba(255,255,255,0.6)', mb: 8, maxWidth: 350, lineHeight: 1.8, fontSize: '1.05rem' }}>
                    Initialize your personal neural wealth engine. Full biometric and quantum-grade encryption protocols active.
                </Typography>
            </motion.div>

            <Stack spacing={4}>
                {[
                    { icon: <VerifiedUser color="primary" />, label: 'Standardized AES-256' },
                    { icon: <Hub color="secondary" />, label: 'Neural Mesh Integrity' },
                    { icon: <Security color="success" />, label: 'Adaptive Bot Defense' }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + (i * 0.1) }}
                    >
                        <Stack direction="row" spacing={2.5} alignItems="center">
                            <Box sx={{
                                p: 1.2,
                                bgcolor: mode === 'light' ? alpha('#4F46E5', 0.06) : alpha('#FFF', 0.04),
                                borderRadius: 2,
                                border: mode === 'light' ? '1px solid rgba(79,70,229,0.16)' : '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                backdropFilter: 'blur(10px)'
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


const Login = () => {
    const { mode } = useThemeContext();
    const isLightMode = mode === 'light';
    const navigate = useNavigate();
    const [networkError, setNetworkError] = useState<'network' | 'server' | null>(null);

    const goToRegister = async () => {
        try {
            const sid = await initAuthSession('signup');
            navigate(`/user/register?sid=${sid}`);
        } catch {
            toast.error('Failed to initialize session.');
        }
    };

    const {
        authMethod, setAuthMethod,
        step, setStep,
        showPassword,
        conflictOpen, setConflictOpen,
        activeCount,
        honeypot, setHoneypot,
        lockoutSeconds,
        remainingAttempts,
        email, setEmail,
        password, setPassword,
        otp, setOtp,
        totpCode, setTotpCode,
        trustDevice, setTrustDevice,
        isLoading,
        preventDefault,
        handleClickShowPassword,
        handleCredentialsSubmit: originalHandleCredentialsSubmit,
        handleForceLogin: originalHandleForceLogin,
        handleOTPSubmit: originalHandleOTPSubmit,
        handleTOTPSubmit: originalHandleTOTPSubmit,
        handleGoogleLoginSuccess,
        handleGoogleLoginError,
    } = useLogin();

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        setNetworkError(null);
        try {
            await originalHandleCredentialsSubmit(e);
        } catch (err: unknown) {
            const error = err as { response?: { status?: number } };
            if (!error.response) {
                setNetworkError('network');
            } else if (typeof error.response.status === 'number' && error.response.status >= 500) {
                setNetworkError('server');
            }
        }
    };

    const handleForceLogin = async () => {
        setNetworkError(null);
        try {
            await originalHandleForceLogin();
        } catch (err: unknown) {
            const error = err as { response?: { status?: number } };
            if (!error.response) {
                setNetworkError('network');
            } else if (typeof error.response.status === 'number' && error.response.status >= 500) {
                setNetworkError('server');
            }
        }
    };

    const handleOTPSubmit = async (e: React.FormEvent) => {
        setNetworkError(null);
        try {
            await originalHandleOTPSubmit(e);
        } catch (err: unknown) {
            const error = err as { response?: { status?: number } };
            if (!error.response) {
                setNetworkError('network');
            } else if (typeof error.response.status === 'number' && error.response.status >= 500) {
                setNetworkError('server');
            }
        }
    };

    const handleTOTPSubmit = async (e: React.FormEvent) => {
        setNetworkError(null);
        try {
            await originalHandleTOTPSubmit(e);
        } catch (err: unknown) {
            const error = err as { response?: { status?: number } };
            if (!error.response) {
                setNetworkError('network');
            } else if (typeof error.response.status === 'number' && error.response.status >= 500) {
                setNetworkError('server');
            }
        }
    };

    const handleRetry = () => {
        setNetworkError(null);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    const stepVariants = {
        initial: { opacity: 0, x: 20 },
        enter: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <AuthLayout>
            <TelemetryNode title="Login" description="Online MCQ test management platform — sign in to manage or take tests." />
            
            {networkError && (
                <NetworkLoader
                    status={networkError === 'network' ? 'network-unavailable' : 'server-unavailable'}
                    message={networkError === 'network' ? 'Unable to connect to the network. Please check your connection.' : 'The authentication server is currently unavailable. Please try again later.'}
                    onRetry={handleRetry}
                    showDetails={true}
                />
            )}

            {isLoading && !networkError && (
                <NetworkLoader
                    status="loading"
                    message="Authenticating your credentials..."
                    showDetails={false}
                />
            )}

            {!networkError && !isLoading && (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                style={{ height: '100%', width: '100%', maxWidth: '1380px', margin: '0 auto' }}
            >
                <Paper
                    className="glass-card"
                    sx={{
                        borderRadius: '24px',
                        overflow: 'hidden',
                        border: isLightMode ? '1px solid rgba(79, 70, 229, 0.18) !important' : '1px solid rgba(255,255,255,0.1) !important',
                        boxShadow: isLightMode
                            ? '0 35px 80px -35px rgba(15, 23, 42, 0.24), 0 8px 18px rgba(59, 130, 246, 0.08)'
                            : '0 50px 100px -20px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.05)',
                        height: { md: '690px' },
                        display: 'flex',
                        flexDirection: 'column',
                        background: isLightMode ? 'rgba(255,255,255,0.88) !important' : 'rgba(15, 23, 42, 0.7) !important',
                        backdropFilter: 'blur(32px)'
                    }}
                >

                <Grid container sx={{ flexGrow: 1 }}>
                    {/* Left: Graphic - Desktop */}
                    <Grid size={{ xs: 0, md: 5, lg: 6.5 }} sx={{ display: { xs: 'none', md: 'block' } }}>
                        <AuthGraphic mode={mode} />
                    </Grid>

                    {/* Left: Mobile Panel - Mobile Only */}
                    <Grid size={{ xs: 12, sm: 0, md: 0 }} sx={{ display: { xs: 'block', sm: 'none', md: 'none' } }}>
                        <MobileAuthPanel mode={mode} />
                    </Grid>

                    {/* Right: Form */}
                    <Grid size={{ xs: 12, md: 7, lg: 5.5 }}>
                        <Box sx={{ p: { xs: 3, sm: 6, lg: 8 }, height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                            <AnimatePresence mode="wait">
                                {authMethod === 'selection' ? (
                                    <motion.div
                                        key="selection"
                                        variants={stepVariants}
                                        initial="initial"
                                        animate="enter"
                                        exit="exit"
                                        style={{ marginTop: 'auto', marginBottom: 'auto' }}
                                    >
                                        <Box>
                                            <Stack spacing={1} sx={{ mb: 6 }}>
                                                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: isLightMode ? 'text.primary' : 'white', fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                                                    Login
                                                </Typography>
                                                <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                                    Choose your preferred authentication gateway.
                                                </Typography>
                                            </Stack>

                                            <Stack spacing={3}>
                                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                    <Button
                                                        fullWidth
                                                        size="large"
                                                        variant="contained"
                                                        onClick={() => setAuthMethod('email')}
                                                        startIcon={<LoginIcon />}
                                                        sx={{
                                                            py: 2,
                                                            borderRadius: 2,
                                                            fontWeight: 900,
                                                            fontSize: { xs: '0.9rem', sm: '1rem' },
                                                            textTransform: 'none',
                                                            background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
                                                            boxShadow: `0 8px 16px ${alpha('#6366F1', 0.25)}`,
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        Login with Email
                                                    </Button>
                                                </motion.div>

                                                <Divider sx={{ borderColor: isLightMode ? alpha('#1E293B', 0.12) : alpha('#FFF', 0.05) }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5 }}>or</Typography>
                                                </Divider>

                                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                    <Button
                                                        fullWidth
                                                        variant="outlined"
                                                        startIcon={<GoogleIcon />}
                                                        sx={{
                                                            py: 2,
                                                            borderRadius: 2,
                                                            borderColor: isLightMode ? alpha('#1E293B', 0.18) : alpha('#FFF', 0.1),
                                                            color: isLightMode ? 'text.primary' : 'white',
                                                            fontWeight: 700,
                                                            bgcolor: isLightMode ? alpha('#1E293B', 0.02) : alpha('#FFF', 0.02),
                                                            fontSize: { xs: '0.9rem', sm: '1rem' },
                                                            textTransform: 'none',
                                                            backdropFilter: 'blur(5px)',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        Login with Google
                                                    </Button>
                                                </motion.div>
                                            </Stack>

                                            <Typography variant="body2" align="center" sx={{ mt: 8, color: 'text.secondary', fontWeight: 500, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                                New user? <Link component="button" onClick={goToRegister} sx={{ color: 'primary.light', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' }, verticalAlign: 'baseline' }}>Initialize Account</Link>
                                            </Typography>
                                        </Box>
                                    </motion.div>
                                ) : authMethod === 'email' ? (
                                    <motion.div
                                        key="email"
                                        variants={stepVariants}
                                        initial="initial"
                                        animate="enter"
                                        exit="exit"
                                        style={{ marginTop: 'auto', marginBottom: 'auto' }}
                                    >
                                        <Box>
                                            <IconButton
                                                onClick={() => setAuthMethod('selection')}
                                                sx={{ mb: 4, color: 'text.secondary', border: isLightMode ? '1px solid rgba(15,23,42,0.14)' : '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}
                                            >
                                                <KeyboardBackspace />
                                            </IconButton>

                                            {step === 1 ? (
                                                <Box component="form" onSubmit={handleCredentialsSubmit} sx={{ width: '100%' }}>
                                                    <div style={{ display: 'none' }} aria-hidden="true">
                                                        <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} />
                                                    </div>

                                                    <Stack spacing={1} sx={{ mb: 4 }}>
                                                        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: isLightMode ? 'text.primary' : 'white', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                                                            Login
                                                        </Typography>
                                                    </Stack>

                                                    {lockoutSeconds > 0 && (
                                                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: alpha('#EF4444', 0.1), color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                                                Account locked. Try again in {Math.floor(lockoutSeconds / 60)}:{String(lockoutSeconds % 60).padStart(2, '0')}
                                                            </Alert>
                                                        </motion.div>
                                                    )}

                                                    {remainingAttempts !== null && remainingAttempts <= 3 && lockoutSeconds === 0 && (
                                                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                                            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2, bgcolor: alpha('#F59E0B', 0.1), color: '#FDE68A', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                                                {remainingAttempts} login attempt{remainingAttempts !== 1 ? 's' : ''} remaining before lockout.
                                                            </Alert>
                                                        </motion.div>
                                                    )}

                                                    <Stack spacing={3}>
                                                        <motion.div variants={itemVariants}>
                                                            <TextField
                                                                fullWidth
                                                                label="Email Identity"
                                                                value={email}
                                                                onChange={(e) => setEmail(e.target.value)}
                                                                required
                                                                disabled={isLoading}
                                                                onCopy={preventDefault}
                                                                onPaste={preventDefault}
                                                                onCut={preventDefault}
                                                                slotProps={{
                                                                    htmlInput: {
                                                                        autoComplete: 'off',
                                                                        'data-lpignore': 'true',
                                                                        'data-form-type': 'other'
                                                                    },
                                                                    input: {
                                                                        sx: {
                                                                            borderRadius: 2,
                                                                            bgcolor: isLightMode ? alpha('#0F172A', 0.015) : alpha('#FFF', 0.01),
                                                                            border: isLightMode ? '1px solid rgba(15, 23, 42, 0.14)' : '1px solid rgba(255,255,255,0.05)',
                                                                            '&:hover': { border: isLightMode ? '1px solid rgba(79, 70, 229, 0.36)' : '1px solid rgba(255,255,255,0.15)' },
                                                                            '&.Mui-focused': { border: `1px solid ${alpha('#6366F1', 0.5)}` }
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        </motion.div>

                                                        <motion.div variants={itemVariants}>
                                                            <Box>
                                                                <TextField
                                                                    fullWidth
                                                                    label="Security Key"
                                                                    type={showPassword ? 'text' : 'password'}
                                                                    value={password}
                                                                    onChange={(e) => setPassword(e.target.value)}
                                                                    required
                                                                    disabled={isLoading}
                                                                    onCopy={preventDefault}
                                                                    onPaste={preventDefault}
                                                                    onCut={preventDefault}
                                                                    slotProps={{
                                                                        htmlInput: {
                                                                            autoComplete: 'new-password',
                                                                            'data-lpignore': 'true',
                                                                            'data-form-type': 'other'
                                                                        },
                                                                        input: {
                                                                            sx: {
                                                                                borderRadius: 2,
                                                                                bgcolor: isLightMode ? alpha('#0F172A', 0.015) : alpha('#FFF', 0.01),
                                                                                border: isLightMode ? '1px solid rgba(15, 23, 42, 0.14)' : '1px solid rgba(255,255,255,0.05)',
                                                                                '&.Mui-focused': { 
                                                                                    border: `1px solid ${alpha('#6366F1', 0.5)}`,
                                                                                    boxShadow: `0 0 20px ${alpha('#6366F1', 0.15)}`
                                                                                }
                                                                            },
                                                                            endAdornment: (
                                                                                <InputAdornment position="end">
                                                                                    <IconButton onClick={handleClickShowPassword} edge="end" sx={{ color: isLightMode ? 'rgba(15,23,42,0.55)' : 'rgba(255,255,255,0.5)' }}>
                                                                                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                                                    </IconButton>
                                                                                </InputAdornment>
                                                                            ),
                                                                        }
                                                                    }}
                                                                />
                                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                                                    <Link component={RouterLink} to="/user/forgot-password" variant="body2" sx={{ fontWeight: 700, textDecoration: 'none', color: 'primary.light', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                                        Forgot Password ?
                                                                    </Link>
                                                                </Box>
                                                            </Box>
                                                        </motion.div>

                                                        <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                                            <Button
                                                                fullWidth
                                                                size="large"
                                                                type="submit"
                                                                variant="contained"
                                                                disabled={isLoading}
                                                                startIcon={<LoginIcon />}
                                                                sx={{
                                                                    py: 2,
                                                                    borderRadius: 2,
                                                                        fontWeight: 900,
                                                                        fontSize: { xs: '0.9rem', sm: '1rem' },
                                                                        textTransform: 'none',
                                                                        background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
                                                                        boxShadow: `0 8px 16px ${alpha('#6366F1', 0.25)}`,
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                >
                                                                    Login
                                                                </Button>
                                                        </motion.div>

                                                        <motion.div variants={itemVariants} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                                            <Box sx={{ width: '100%', display: 'none', '& > div': { width: '100% !important' }, '& iframe': { width: '100% !important' } }}>
                                                                <GoogleLogin
                                                                    onSuccess={handleGoogleLoginSuccess}
                                                                    onError={handleGoogleLoginError}
                                                                    theme="filled_black"
                                                                    shape="rectangular"
                                                                    width="320"
                                                                    text="continue_with"
                                                                />
                                                            </Box>
                                                        </motion.div>
                                                    </Stack>

                                                    <Typography variant="body2" align="center" sx={{ mt: 6, color: 'text.secondary', fontWeight: 500, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                                        Unregistered matrix?{' '}
                                                        <Link component="button" onClick={goToRegister} sx={{ fontWeight: 900, textDecoration: 'none', color: 'primary.light', verticalAlign: 'baseline' }}>
                                                            Initialize Account
                                                        </Link>
                                                    </Typography>
                                                </Box>
                                            ) : step === 2 ? (
                                                <Box component="form" onSubmit={handleOTPSubmit} sx={{ width: '100%' }}>
                                                    <Box sx={{ mb: 6, textAlign: 'center' }}>
                                                        <motion.div
                                                            initial={{ scale: 0.8, rotate: -10 }}
                                                            animate={{ scale: 1, rotate: 0 }}
                                                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                        >
                                                            <Box sx={{
                                                                width: 72,
                                                                height: 72,
                                                                bgcolor: alpha('#6366F1', 0.1),
                                                                color: 'primary.main',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                borderRadius: 3,
                                                                margin: '0 auto',
                                                                mb: 4,
                                                                border: '1px solid',
                                                                borderColor: alpha('#6366F1', 0.2),
                                                                boxShadow: `0 0 30px ${alpha('#6366F1', 0.15)}`
                                                            }}>
                                                                <Security sx={{ fontSize: 36 }} />
                                                            </Box>
                                                        </motion.div>
                                                        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: isLightMode ? 'text.primary' : 'white' }}>
                                                            Identity Sync
                                                        </Typography>
                                                        <Typography variant="body1" color="text.secondary">
                                                            Confirm secondary shard authentication.
                                                        </Typography>
                                                    </Box>

                                                    <Stack spacing={5}>
                                                        <TextField
                                                            fullWidth
                                                            label="Validation Key"
                                                            value={otp}
                                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                            required
                                                            slotProps={{
                                                                htmlInput: {
                                                                    sx: { textAlign: 'center', letterSpacing: 12, fontSize: '1.8rem', fontWeight: 900, color: 'primary.light' }
                                                                },
                                                                input: { sx: { borderRadius: 3, bgcolor: isLightMode ? alpha('#0F172A', 0.02) : alpha('#FFF', 0.02) } }
                                                            }}
                                                        />

                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={trustDevice}
                                                                    onChange={(e) => setTrustDevice(e.target.checked)}
                                                                    checkedIcon={<Devices color="primary" />}
                                                                />
                                                            }
                                                            label={
                                                                <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.secondary' }}>Authorize this matrix</Typography>
                                                            }
                                                        />

                                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                            {isLoading ? (
                                                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                                                    <NetworkLoader status="loading" message="Verifying..." showDetails={false} />
                                                                </Box>
                                                            ) : (
                                                                <Button
                                                                    fullWidth
                                                                    size="large"
                                                                    type="submit"
                                                                    variant="contained"
                                                                    disabled={isLoading || otp.length < 6}
                                                                    sx={{ py: 2.5, borderRadius: 3, fontWeight: 900, fontSize: '1.1rem' }}
                                                                >
                                                                    Finalize Sync
                                                                </Button>
                                                            )}
                                                        </motion.div>

                                                        <Box sx={{ textAlign: 'center' }}>
                                                            <Button
                                                                variant="text"
                                                                onClick={() => setStep(1)}
                                                                startIcon={<KeyboardBackspace />}
                                                                sx={{ color: 'text.secondary', fontWeight: 700, '&:hover': { color: isLightMode ? 'text.primary' : 'white' } }}
                                                            >
                                                                Back to Primary Login
                                                            </Button>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                            ) : step === 3 ? (
                                                <Box component="form" onSubmit={handleTOTPSubmit} sx={{ width: '100%' }}>
                                                    <Box sx={{ mb: 6, textAlign: 'center' }}>
                                                        <motion.div
                                                            initial={{ scale: 0.8, rotate: 10 }}
                                                            animate={{ scale: 1, rotate: 0 }}
                                                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                        >
                                                            <Box sx={{
                                                                width: 72, height: 72,
                                                                bgcolor: alpha('#10B981', 0.1),
                                                                color: 'success.main',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                borderRadius: 3, margin: '0 auto', mb: 4,
                                                                border: '1px solid', borderColor: alpha('#10B981', 0.2),
                                                                boxShadow: `0 0 30px ${alpha('#10B981', 0.15)}`
                                                            }}>
                                                                <Security sx={{ fontSize: 36 }} />
                                                            </Box>
                                                        </motion.div>
                                                        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: isLightMode ? 'text.primary' : 'white' }}>
                                                            Authenticator Code
                                                        </Typography>
                                                        <Typography variant="body1" color="text.secondary">
                                                            Open Google Authenticator and enter the 6-digit code for this account.
                                                        </Typography>
                                                    </Box>

                                                    <Stack spacing={5}>
                                                        <TextField
                                                            fullWidth
                                                            label="Authenticator Code"
                                                            value={totpCode}
                                                            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                            required
                                                            autoFocus
                                                            slotProps={{
                                                                htmlInput: {
                                                                    sx: { textAlign: 'center', letterSpacing: 12, fontSize: '1.8rem', fontWeight: 900, color: 'success.light' },
                                                                    inputMode: 'numeric',
                                                                    maxLength: 6,
                                                                },
                                                                input: { sx: { borderRadius: 3, bgcolor: isLightMode ? alpha('#0F172A', 0.02) : alpha('#FFF', 0.02) } }
                                                            }}
                                                        />

                                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                            {isLoading ? (
                                                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                                                    <NetworkLoader status="loading" message="Verifying..." showDetails={false} />
                                                                </Box>
                                                            ) : (
                                                                <Button
                                                                    fullWidth size="large" type="submit" variant="contained"
                                                                    disabled={isLoading || totpCode.length < 6}
                                                                    sx={{
                                                                        py: 2.5, borderRadius: 3, fontWeight: 900, fontSize: '1.1rem',
                                                                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                                                        boxShadow: `0 8px 16px ${alpha('#10B981', 0.25)}`,
                                                                    }}
                                                                >
                                                                    Verify Code
                                                                </Button>
                                                            )}
                                                        </motion.div>

                                                        <Box sx={{ textAlign: 'center' }}>
                                                            <Button
                                                                variant="text" onClick={() => setStep(1)}
                                                                startIcon={<KeyboardBackspace />}
                                                                sx={{ color: 'text.secondary', fontWeight: 700, '&:hover': { color: isLightMode ? 'text.primary' : 'white' } }}
                                                            >
                                                                Back to Login
                                                            </Button>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                            ) : null}
                                        </Box>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </Box>
                    </Grid>
                </Grid>
                </Paper>
            </motion.div>
            )}

            <ConcurrentSessionModal
                open={conflictOpen}
                onClose={() => setConflictOpen(false)}
                onConfirm={handleForceLogin}
                activeSessionsCount={activeCount}
            />
        </AuthLayout>
    );
};

export default Login;
