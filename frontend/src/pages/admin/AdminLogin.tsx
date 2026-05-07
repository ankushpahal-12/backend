import {
    Box,
    Typography,
    TextField,
    Stack,
    IconButton,
    InputAdornment,
    Alert,
    Paper
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    AdminPanelSettings,
    Security,
    LockOpen,
    KeyboardBackspace,
} from '@mui/icons-material';
import AuthLayout from '../../components/auth/AuthLayout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import TelemetryNode from '../../components/common/TelemetryNode';
import { useAdminLogin } from '../../hooks/useAdminLogin';

const AdminLogin = () => {
    const {
        step, setStep,
        showPassword, setShowPassword,
        email, setEmail,
        password, setPassword,
        otp, setOtp,
        isLoading,
        preventDefault,
        handleLoginSubmit,
        handle2FASubmit,
    } = useAdminLogin();

    return (
        <AuthLayout>
            <TelemetryNode title="Admin Portal" description="High-Level Administrative Access" />
            <Card sx={{
                p: { xs: 3, md: 5 },
                border: '1px solid rgba(0, 97, 255, 0.2)',
                boxShadow: '0 0 40px rgba(0, 97, 255, 0.1)'
            }}>
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
                            <Button
                                fullWidth
                                size="large"
                                type="submit"
                                variant="contained"
                                gradient
                                disabled={isLoading}
                                startIcon={<LockOpen />}
                            >
                                {isLoading ? 'Authorizing...' : 'Identify Admin'}
                            </Button>
                        </Stack>
                    </Box>
                ) : (
                    <Box component="form" onSubmit={handle2FASubmit}>
                        <Stack spacing={3}>
                            <Alert severity="info" sx={{ borderRadius: 2 }}>
                                A 2FA code has been sent to your administrator email for verification.
                            </Alert>
                            <TextField
                                fullWidth
                                label="2FA Code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                required
                                onCopy={preventDefault}
                                onPaste={preventDefault}
                                onCut={preventDefault}
                                slotProps={{
                                    htmlInput: {
                                        sx: { textAlign: 'center', letterSpacing: 8, fontSize: '1.5rem', fontWeight: 700 },
                                        autoComplete: 'one-time-code'
                                    }
                                }}
                            />
                            <Button
                                fullWidth
                                size="large"
                                type="submit"
                                variant="contained"
                                gradient
                                disabled={isLoading || otp.length < 6}
                            >
                                {isLoading ? 'Verifying...' : 'Finalize Access'}
                            </Button>
                            <Box sx={{ textAlign: 'center' }}>
                                <Button
                                    type="button"
                                    variant="text"
                                    onClick={() => setStep(1)}
                                    startIcon={<KeyboardBackspace sx={{ fontSize: 16 }} />}
                                    sx={{
                                        color: 'text.secondary',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        '&:hover': { background: 'transparent', color: 'primary.main' }
                                    }}
                                >
                                    Back to Credentials
                                </Button>
                            </Box>
                        </Stack>
                    </Box>
                )}
            </Card>
        </AuthLayout>
    );
};

export default AdminLogin;
