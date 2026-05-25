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
import {
    Visibility,
    VisibilityOff,
    PersonAdd,
    EmailOutlined,
    PersonOutlined,
    LockOutlined,
    AutoAwesome,
    VerifiedUser,
    Hub,
    Security,
    KeyboardBackspace
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import {Button }from '../../components/ui/button';
import Loader from '../admin/components/ui/NetworkLoader';
import TelemetryNode from '../../components/common/TelemetryNode';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter';
import { useSignup } from '../../hooks/useUserSignGlobal';
import { useThemeContext } from '../../context/ThemeContext';
import { initAuthSession } from '../../services/authService';
import toast from 'react-hot-toast';

const AuthGraphic = ({ mode }: { mode: 'light' | 'dark' }) => (
    <Box sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: 6,
        background: mode === 'light'
            ? 'linear-gradient(135deg, #F3F7FF 0%, #E8F0FF 50%, #DDE9FF 100%)'
            : 'radial-gradient(circle at 100% 100%, #0f172a 0%, #020617 100%)',
        position: 'relative',
        overflow: 'hidden',
        color: mode === 'light' ? '#0F172A' : 'white'
    }}>
        {/* Advanced Background Patterns */}
        <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `radial-gradient(${alpha('#10B981', 0.5)} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            zIndex: 0
        }} />

        <Box sx={{
            position: 'absolute',
            bottom: -150,
            right: -150,
            width: 400,
            height: 400,
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
            zIndex: 0,
            animation: 'floatRev 12s infinite alternate ease-in-out'
        }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 6 }}>
                <Box sx={{
                    p: 1.2,
                    bgcolor: 'primary.main',
                    borderRadius: 2,
                    boxShadow: `0 0 30px ${alpha('#6366F1', mode === 'light' ? 0.24 : 0.6)}`,
                    display: 'flex',
                    border: mode === 'light' ? '1px solid rgba(79, 70, 229, 0.18)' : '1px solid rgba(255,255,255,0.2)'
                }}>
                    <AutoAwesome sx={{ fontSize: 28, color: 'white' }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em', color: mode === 'light' ? '#0F172A' : 'white', textShadow: mode === 'light' ? 'none' : '0 2px 10px rgba(0,0,0,0.5)' }}>
                    MCQManager
                </Typography>
            </Stack>

            <Typography variant="h3" sx={{ fontWeight: 900, mb: 3, lineHeight: 1.1, letterSpacing: '-0.04em', color: mode === 'light' ? '#0F172A' : 'inherit' }}>
                Create your <br />
                <Box component="span" sx={{
                    background: mode === 'light'
                        ? 'linear-gradient(90deg, #4F46E5 0%, #6366F1 100%)'
                        : 'linear-gradient(90deg, #10B981 0%, #6EE7B7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>MCQ</Box> profile.
            </Typography>

            <Typography variant="body1" sx={{ color: mode === 'light' ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.6)', mb: 8, maxWidth: 350, lineHeight: 1.8, fontSize: '1.05rem' }}>
                Sign up to create or take MCQ tests, manage question banks, and track results.
            </Typography>

            <Stack spacing={4}>
                {[
                    { icon: <VerifiedUser color="primary" />, label: 'Zero-Knowledge Privacy' },
                    { icon: <Hub color="secondary" />, label: 'Multi-Node Redundancy' },
                    { icon: <Security color="success" />, label: 'Institutional Security' }
                ].map((item, i) => (
                    <Stack key={i} direction="row" spacing={2.5} alignItems="center">
                        <Box sx={{
                            p: 1.2,
                            bgcolor: mode === 'light' ? alpha('#4F46E5', 0.08) : alpha('#FFF', 0.04),
                            borderRadius: 2,
                            border: mode === 'light' ? '1px solid rgba(79, 70, 229, 0.16)' : '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            backdropFilter: 'blur(10px)'
                        }}>
                            {item.icon}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: mode === 'light' ? 'rgba(15, 23, 42, 0.74)' : 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>{item.label}</Typography>
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

const renderLoginLink = (isSelection: boolean, onLoginClick: () => void) => (
    <Typography variant="body2" align="center" sx={{ mt: isSelection ? 8 : 4, color: 'text.secondary', fontWeight: 500 }}>
        {isSelection ? 'Already a member? ' : 'Already documented? '}
        <Link component="button" onClick={onLoginClick} sx={{ color: 'primary.light', fontWeight: isSelection ? 700 : 900, textDecoration: 'none', '&:hover': { textDecoration: 'underline' }, verticalAlign: 'baseline' }}>
            Restore Access
        </Link>
    </Typography>
);

const Register = () => {
    const { mode } = useThemeContext();
    const isLightMode = mode === 'light';
    const navigate = useNavigate();

    const goToLogin = async () => {
        try {
            const sid = await initAuthSession('login');
            navigate(`/user/login?sid=${sid}`);
        } catch {
            toast.error('Failed to initialize session.');
        }
    };

    const {
        authMethod, setAuthMethod,
        showPassword,
        isBreached,
        honeypot, setHoneypot,
        termsAccepted, setTermsAccepted,
        formData,
        isEmailRegistered,
        isLoading,
        preventDefault,
        handleClickShowPassword,
        handleChange,
        handleSubmit,
        handleGoogleLoginSuccess,
        handleGoogleLoginError,
    } = useSignup();

    const [isTypingPassword, setIsTypingPassword] = React.useState(false);
    const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e);
        setIsTypingPassword(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setIsTypingPassword(false);
        }, 1000);
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (


        <AuthLayout>
            <TelemetryNode title="Join MCQ Manager" description="Create an account for the Online MCQ test management platform" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
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

                    {/* Right: Form */}
                    <Grid size={{ xs: 12, md: 7, lg: 5.5 }}>
                        <Box sx={{ p: { xs: 4, sm: 6, lg: 8 }, height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                            {authMethod === 'selection' ? (
                                <Box sx={{ my: 'auto' }}>
                                    <Stack spacing={1} sx={{ mb: 6 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: isLightMode ? 'text.primary' : 'white' }}>
                                            Signup
                                        </Typography>
                                        <Typography variant="body1" color={isLightMode ? 'text.primary' : 'text.secondary'} sx={{ color: isLightMode ? 'rgba(15,23,42,0.72)' : 'inherit' }}>
                                            Choose your preferred identity gateway.
                                        </Typography>
                                    </Stack>

                                    <Stack spacing={3}>
                                        <Button
                                            onClick={() => setAuthMethod('email')}
                                            style={{
                                                padding: '1rem',
                                                borderRadius: '0.5rem',
                                                fontWeight: 900,
                                                fontSize: '1rem',
                                                textTransform: 'none',
                                                background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
                                                boxShadow: `0 8px 16px ${alpha('#6366F1', 0.25)}`,
                                                transition: 'all 0.2s ease',
                                                color: 'white'
                                            }}
                                        >
                                            <PersonAdd style={{ marginRight: '0.5rem' }} />
                                            Signup with Email
                                        </Button>

                                        <Divider sx={{ borderColor: alpha(isLightMode ? '#1E293B' : '#FFF', 0.05) }}>
                                            <Typography variant="caption" color={isLightMode ? 'text.primary' : 'text.secondary'} sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: isLightMode ? 'rgba(15,23,42,0.6)' : 'inherit' }}>or</Typography>
                                        </Divider>

                                        <Box sx={{
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            '& > div': { width: '100% !important' },
                                            '& iframe': { width: '100% !important' }
                                        }}>
                                            <GoogleLogin
                                                onSuccess={handleGoogleLoginSuccess}
                                                onError={handleGoogleLoginError}
                                                theme="filled_black"
                                                shape="rectangular"
                                                width="320"
                                                text="signup_with"
                                            />
                                        </Box>
                                    </Stack>

                                    {renderLoginLink(true, goToLogin)}
                                </Box>
                            ) : (
                                <Box sx={{ my: 'auto' }}>
                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4, animation: 'slideInDown 0.4s ease-out' }}>
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <IconButton
                                                onClick={() => setAuthMethod('selection')}
                                                sx={{
                                                    color: 'text.secondary',
                                                    border: isLightMode ? '1px solid rgba(15,23,42,0.14)' : '1px solid rgba(255,255,255,0.05)',
                                                    borderRadius: 2,
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        bgcolor: alpha('#6366F1', 0.1),
                                                        borderColor: alpha('#6366F1', 0.3),
                                                        transform: 'translateX(-2px)'
                                                    }
                                                }}
                                            >
                                                <KeyboardBackspace />
                                            </IconButton>
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: 0.1 }}
                                        >
                                            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: isLightMode ? 'text.primary' : 'white' }}>
                                                Signup
                                            </Typography>
                                        </motion.div>
                                    </Stack>

                                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                                        <div style={{ display: 'none' }} aria-hidden="true">
                                            <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} />
                                        </div>

                                        <Stack spacing={2.5}>
                                            <TextField
                                                fullWidth
                                                label="Full Name"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                required
                                                disabled={isLoading}
                                                onCopy={preventDefault}
                                                onPaste={preventDefault}
                                                onCut={preventDefault}
                                                slotProps={{
                                                    htmlInput: {
                                                        autoComplete: 'off',
                                                        'data-lpignore': 'true'
                                                    },
                                                    input: {
                                                        sx: {
                                                            borderRadius: 2,
                                                            bgcolor: isLightMode ? alpha('#0F172A', 0.015) : alpha('#FFF', 0.01),
                                                            border: isLightMode ? '1px solid rgba(15, 23, 42, 0.14)' : '1px solid rgba(255,255,255,0.05)',
                                                            '&:hover': { border: isLightMode ? '1px solid rgba(79, 70, 229, 0.36)' : '1px solid rgba(255,255,255,0.15)' },
                                                            '&.Mui-focused': { border: `1px solid ${alpha('#6366F1', 0.5)}` }
                                                        },
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <PersonOutlined color="primary" sx={{ opacity: 0.7 }} />
                                                            </InputAdornment>
                                                        ),
                                                    }
                                                }}
                                            />

                                            <TextField
                                                fullWidth
                                                label="Email Core"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                disabled={isLoading}
                                                onCopy={preventDefault}
                                                onPaste={preventDefault}
                                                onCut={preventDefault}
                                                slotProps={{
                                                    htmlInput: {
                                                        autoComplete: 'off',
                                                        'data-lpignore': 'true'
                                                    },
                                                    input: {
                                                        sx: {
                                                            borderRadius: 2,
                                                            bgcolor: isLightMode ? alpha('#0F172A', 0.015) : alpha('#FFF', 0.01),
                                                            border: isLightMode ? '1px solid rgba(15, 23, 42, 0.14)' : '1px solid rgba(255,255,255,0.05)',
                                                            '&:hover': { border: isLightMode ? '1px solid rgba(79, 70, 229, 0.36)' : '1px solid rgba(255,255,255,0.15)' },
                                                            '&.Mui-focused': { border: `1px solid ${alpha('#6366F1', 0.5)}` }
                                                        },
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <EmailOutlined color="primary" sx={{ opacity: 0.7 }} />
                                                            </InputAdornment>
                                                        ),
                                                    }
                                                }}
                                            />
                                            <Box>
                                                <TextField
                                                    fullWidth
                                                    label="Access Key"
                                                    name="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={formData.password}
                                                    onChange={handlePasswordChange}
                                                    required
                                                    disabled={isLoading}
                                                    onCopy={preventDefault}
                                                    onPaste={preventDefault}
                                                    onCut={preventDefault}
                                                    slotProps={{
                                                        htmlInput: {
                                                            autoComplete: 'new-password',
                                                            'data-lpignore': 'true'
                                                        },
                                                        input: {
                                                            sx: {
                                                                borderRadius: 2,
                                                                bgcolor: isLightMode ? alpha('#0F172A', 0.015) : alpha('#FFF', 0.01),
                                                                border: isLightMode ? '1px solid rgba(15, 23, 42, 0.14)' : '1px solid rgba(255,255,255,0.05)',
                                                                '&:hover': { border: isLightMode ? '1px solid rgba(79, 70, 229, 0.36)' : '1px solid rgba(255,255,255,0.15)' },
                                                                '&.Mui-focused': { border: `1px solid ${alpha('#6366F1', 0.5)}` }
                                                            },
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <LockOutlined color="primary" sx={{ opacity: 0.7 }} />
                                                                </InputAdornment>
                                                            ),
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton onClick={handleClickShowPassword} edge="end" sx={{ color: isLightMode ? 'rgba(15,23,42,0.55)' : 'rgba(255,255,255,0.5)' }}>
                                                                        {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            ),
                                                        }
                                                    }}
                                                />
                                                {isBreached && (
                                                    <AnimatePresence mode="wait">
                                                        <motion.div
                                                            key="breach-notification"
                                                            initial={{ opacity: 0, y: -400 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -400 }}
                                                            transition={{ duration: 0.5, ease: 'easeOut' }}
                                                        >
                                                            <Alert
                                                                severity="error"
                                                                sx={{ mt: 1.5, borderRadius: 2, bgcolor: alpha('#EF4444', 0.1), color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                                            >
                                                                This password was identified in a data breach. Use a different one for security.
                                                            </Alert>
                                                        </motion.div>
                                                    </AnimatePresence>
                                                )}
                                                <PasswordStrengthMeter password={formData.password} showRules={isTypingPassword} />
                                            </Box>

                                            <TextField
                                                fullWidth
                                                label="Confirm Access Key"
                                                name="confirmPassword"
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                required
                                                disabled={isLoading}
                                                onCopy={preventDefault}
                                                onPaste={preventDefault}
                                                onCut={preventDefault}
                                                slotProps={{
                                                    htmlInput: {
                                                        autoComplete: 'new-password',
                                                        'data-lpignore': 'true'
                                                    },
                                                    input: {
                                                        sx: {
                                                            borderRadius: 2,
                                                            bgcolor: isLightMode ? alpha('#0F172A', 0.015) : alpha('#FFF', 0.01),
                                                            border: isLightMode ? '1px solid rgba(15, 23, 42, 0.14)' : '1px solid rgba(255,255,255,0.05)',
                                                            '&:hover': { border: isLightMode ? '1px solid rgba(79, 70, 229, 0.36)' : '1px solid rgba(255,255,255,0.15)' },
                                                            '&.Mui-focused': { border: `1px solid ${alpha('#6366F1', 0.5)}` }
                                                        },
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <LockOutlined color="primary" sx={{ opacity: 0.7 }} />
                                                            </InputAdornment>
                                                        ),
                                                    }
                                                }}
                                            />

                                            <FormControlLabel
                                                    control={
                                                    <Checkbox
                                                        checked={termsAccepted}
                                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                                        size="small"
                                                        sx={{ color: isLightMode ? alpha('#0F172A', 0.3) : alpha('#FFF', 0.3), '&.Mui-checked': { color: '#6366F1' } }}
                                                    />
                                                }
                                                label={
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                                        I agree to the Terms of Service and Privacy Policy
                                                    </Typography>
                                                }
                                            />

                                            {isLoading ? (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                                    <Loader status="loading" message="Processing..." showDetails={false} />
                                                </Box>
                                            ) : (
                                                <Button
                                                    type="submit"
                                                    variant="default"
                                                    disabled={isLoading || isBreached || isEmailRegistered || !termsAccepted}
                                                    style={{
                                                        padding: '0.75rem 1.5rem',
                                                        borderRadius: '0.5rem',
                                                        fontWeight: 900,
                                                        fontSize: '0.85rem',
                                                        textTransform: 'none',
                                                        background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
                                                        boxShadow: `0 8px 16px ${alpha('#6366F1', 0.25)}`,
                                                        color: 'white'
                                                    }}
                                                >
                                                    <PersonAdd style={{ fontSize: 18, marginRight: '0.5rem' }} />
                                                    Sign Up
                                                </Button>
                                            )}

                                            <Divider sx={{ borderColor: isLightMode ? alpha('#1E293B', 0.12) : alpha('#FFF', 0.05), my: 2, display: authMethod === 'email' ? 'none' : 'block' }}>
                                                <Typography variant="caption" color={isLightMode ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.4)'} sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.65rem' }}>or</Typography>
                                            </Divider>

                                            <motion.div variants={itemVariants} style={{ width: '100%', display: authMethod === 'email' ? 'none' : 'flex', justifyContent: 'center' }}>
                                                <Box sx={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    p: 2,
                                                    bgcolor: isLightMode ? alpha('#0F172A', 0.02) : alpha('#FFF', 0.02),
                                                    borderRadius: 2,
                                                    border: isLightMode ? `1px solid ${alpha('#1E293B', 0.12)}` : `1px solid ${alpha('#FFF', 0.05)}`,
                                                    backdropFilter: 'blur(5px)',
                                                    '& > div': { width: '100% !important' },
                                                    '& iframe': { width: '100% !important' }
                                                }}>
                                                    <GoogleLogin
                                                        onSuccess={handleGoogleLoginSuccess}
                                                        onError={handleGoogleLoginError}
                                                        theme="filled_black"
                                                        shape="rectangular"
                                                        width="320"
                                                        text="signup_with"
                                                    />
                                                </Box>
                                            </motion.div>

                                            {renderLoginLink(false, goToLogin)}
                                        </Stack>

                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                    </Grid>
                </Paper>
            </motion.div>

            {isEmailRegistered && (
                <Alert
                    severity="error"
                    sx={{
                        position: 'fixed',
                        bottom: 20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 9999,
                        borderRadius: 2,
                        bgcolor: isLightMode ? alpha('#EF4444', 0.08) : alpha('#EF4444', 0.1),
                        color: isLightMode ? '#DC2626' : '#FCA5A5',
                        border: isLightMode ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(239, 68, 68, 0.2)',
                        maxWidth: '90%'
                    }}
                >
                    This email id has been already registered. Use a different email id.
                </Alert>
            )}
        </AuthLayout>
    );
};

export default Register;
