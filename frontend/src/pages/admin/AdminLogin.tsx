import {
    Box,
    Typography,
    TextField,
    Stack,
    IconButton,
    InputAdornment,
    Paper
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    AdminPanelSettings,
    Security,
    LockOpen,
} from '@mui/icons-material';
import { useState } from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/button';
import { Card } from '@/components/ui/card';
import TelemetryNode from '../../components/common/TelemetryNode';
import NetworkLoader from './components/ui/NetworkLoader';
import { useAdminLogin } from '../../hooks/useAdminLogin';

const AdminLogin = () => {
    const [networkError, setNetworkError] = useState<'network' | 'server' | null>(null);
    
    const {
        step,
        showPassword, setShowPassword,
        email, setEmail,
        password, setPassword,
        otp, setOtp,
        isLoading,
        preventDefault,
        handleLoginSubmit: originalHandleLoginSubmit,
        handle2FASubmit: originalHandle2FASubmit,
    } = useAdminLogin();

    const handleLoginSubmit = async (e: React.FormEvent) => {
        setNetworkError(null);
        try {
            await originalHandleLoginSubmit(e);
        } catch (error: unknown) {
            const axiosError = error as { response?: { status?: number } };
            if (!axiosError.response) {
                setNetworkError('network');
            } else if ((axiosError.response?.status ?? 0) >= 500) {
                setNetworkError('server');
            }
        }
    };

    const handle2FASubmit = async (e: React.FormEvent) => {
        setNetworkError(null);
        try {
            await originalHandle2FASubmit(e);
        } catch (error: unknown) {
            const axiosError = error as { response?: { status?: number } };
            if (!axiosError.response) {
                setNetworkError('network');
            } else if ((axiosError.response?.status ?? 0) >= 500) {
                setNetworkError('server');
            }
        }
    };

    const handleRetry = () => {
        setNetworkError(null);
    };

    return (
        <AuthLayout>
            <TelemetryNode title="Admin Portal" description="Admin access for MCQ Manager — manage tests, users and retakes." />
            
            {networkError && (
                <NetworkLoader
                    status={networkError === 'network' ? 'network-unavailable' : 'server-unavailable'}
                    message={networkError === 'network' ? 'Unable to connect to the network. Please check your connection.' : 'The admin server is currently unavailable. Please try again later.'}
                    onRetry={handleRetry}
                    showDetails={true}
                />
            )}

            {isLoading ? (
                <NetworkLoader
                    status="loading"
                    message={step === 1 ? 'Verifying admin credentials...' : 'Verifying 2FA code...'}
                    showDetails={false}
                />
            ) : (
                !networkError && (
                    /* 1. FIXED: Removed 'sx' styling object from shadcn Card, moved to clean Tailwind classes */
                    <Card className="p-6 md:p-10 border border-[rgba(0,97,255,0.2)] shadow-[0_0_40px_rgba(0,97,255,0.1)]">
                        <Box sx={{ mb: 4, textAlign: 'center' }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    width: 64,
                                    height: 64,
                                    bgcolor: 'rgba(0, 97, 255, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '16px',
                                    margin: '0 auto',
                                    mb: 2
                                }}
                            >
                                {step === 1 ? <AdminPanelSettings color="primary" sx={{ fontSize: 32 }} /> : <Security color="primary" sx={{ fontSize: 32 }} />}
                            </Paper>
                            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 800, color: '#0f172a' }}>
                                Admin Portal
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {step === 1 ? 'High-Level Administrative Access Required' : 'Secondary Security Verification'}
                            </Typography>
                        </Box>

                        {step === 1 ? (
                            <Box component="form" onSubmit={handleLoginSubmit}>
                                <Stack spacing={3}>
                                    <TextField
                                        fullWidth
                                        label="Admin Email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        onCopy={preventDefault}
                                        onPaste={preventDefault}
                                        onCut={preventDefault}
                                        placeholder="admin@finance.ai"
                                        slotProps={{
                                            htmlInput: {
                                                autoComplete: 'off',
                                                'data-lpignore': 'true'
                                            }
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        onCopy={preventDefault}
                                        onPaste={preventDefault}
                                        onCut={preventDefault}
                                        slotProps={{
                                            htmlInput: {
                                                autoComplete: 'new-password',
                                                'data-lpignore': 'true'
                                            },
                                            input: {
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }
                                        }}
                                    />
                                    {/* 2. FIXED: Removed variant="contained" and size="large" (MUI props) from shadcn Button */}
                                    <Button
                                        fullWidth
                                        type="submit"
                                        gradient
                                        disabled={isLoading}
                                        startIcon={<LockOpen />}
                                    >
                                        Identify Admin
                                    </Button>
                                </Stack>
                            </Box>
                        ) : (
                            <Box component="form" onSubmit={handle2FASubmit}>
                                <Stack spacing={3}>
                                    <TextField
                                        fullWidth
                                        label="2FA Verification Code"
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        placeholder="Enter 6-digit code"
                                    />
                                    <Button
                                        fullWidth
                                        type="submit"
                                        gradient
                                        disabled={isLoading}
                                    >
                                        Verify Code
                                    </Button>
                                </Stack>
                            </Box>
                        )}
                    </Card>
                )
            )}
        </AuthLayout>
    );
};

export default AdminLogin;
