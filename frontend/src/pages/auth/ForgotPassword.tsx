import {
    Box,
    Typography,
    TextField,
    Stack,
    Alert,
    Link,
    Paper,
    Grid,
    alpha
} from '@mui/material';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AutoAwesome, VerifiedUser, Hub, Security } from '@mui/icons-material';
import AuthLayout from '../../components/auth/AuthLayout';
import {Button }from '../../components/ui/button';
import TelemetryNode from '../../components/common/TelemetryNode';
import NetworkLoader from '../../pages/admin/components/ui/NetworkLoader';
import { initAuthSession } from '../../services/authService';
import toast from 'react-hot-toast';
import { useForgot } from '../../hooks/useForgot';
import { useThemeContext } from '../../context/ThemeContext';

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
                    Recover <br />
                    <Box component="span" sx={{
                        background: 'linear-gradient(90deg, #6366F1 0%, #A5B4FC 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>Access</Box>
                </Typography>

                <Typography variant="body1" sx={{ color: mode === 'light' ? 'rgba(15,23,42,0.72)' : 'rgba(255,255,255,0.6)', mb: 8, maxWidth: 350, lineHeight: 1.8, fontSize: '1.05rem' }}>
                    Securely reset your password and regain access to your MCQ test account.
                </Typography>
            </motion.div>

            <Stack spacing={4}>
                {[
                    { icon: <VerifiedUser color="primary" />, label: 'Secure Email Verification' },
                    { icon: <Hub color="secondary" />, label: 'Multi-Step Recovery' },
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
const ForgotPassword = () => {
    const { mode } = useThemeContext();
    const isLightMode = mode === 'light';
    const [networkError, setNetworkError] = useState<'network' | 'server' | null>(null);
    const { email, setEmail, error, isLoading, handleSubmit: originalHandleSubmit } = useForgot();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        setNetworkError(null);
        try {
            await originalHandleSubmit(e);
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

    const goToLogin = async () => {
        try {
            const sid = await initAuthSession('login');
            navigate(`/user/login?sid=${sid}`);
        } catch {
            toast.error('Failed to initialize session.');
        }
    };

    return (
        <AuthLayout>
            <TelemetryNode
                title="Forgot Password"
                description="Online MCQ test management — password recovery for students and instructors."
            />
            
            {networkError && (
                <NetworkLoader
                    status={networkError === 'network' ? 'network-unavailable' : 'server-unavailable'}
                    message={networkError === 'network' ? 'Unable to connect to the network. Please check your connection.' : 'The password recovery server is currently unavailable. Please try again later.'}
                    onRetry={handleRetry}
                    showDetails={true}
                />
            )}

            {isLoading ? (
                <NetworkLoader
                    status="loading"
                    message="Sending password reset code..."
                    showDetails={false}
                />
            ) : !networkError ? (
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
                                <Box sx={{ p: { xs: 3, sm: 6, lg: 8 }, height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                                    <Box sx={{ my: 'auto' }}>
                                        <Stack spacing={1} sx={{ mb: 4 }}>
                                            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                                                Forgot password?
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                                                Enter your email and we'll send you a 6-digit code to reset your password.
                                            </Typography>
                                        </Stack>

                                        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                                        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                                            <Stack spacing={3}>
                                                <TextField
                                                    fullWidth
                                                    label="Email Address"
                                                    variant="outlined"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="your@email.com"
                                                    required
                                                    disabled={isLoading}
                                                    slotProps={{
                                                        htmlInput: { 'data-lpignore': 'true' }
                                                    }}
                                                />

                                                <Button
                                                    fullWidth
                                                    size="large"
                                                    type="submit"
                                                    variant="contained"
                                                    color="primary"
                                                    gradient
                                                    disabled={isLoading || !email}
                                                    sx={{ py: 1.5 }}
                                                >
                                                    Send Reset Code
                                                </Button>

                                                <Typography variant="body2" align="center" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                                                    Remember your password?{' '}
                                                    <Link
                                                        component="button"
                                                        type="button"
                                                        onClick={goToLogin}
                                                        sx={{ fontWeight: 700, textDecoration: 'none', color: 'primary.main', verticalAlign: 'baseline', '&:hover': { textDecoration: 'underline' } }}
                                                    >
                                                        Back to login
                                                    </Link>
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </motion.div>
            ) : null}
        </AuthLayout>
    );
}

export default ForgotPassword;
