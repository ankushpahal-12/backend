import {
    Box,
    Typography,
    TextField,
    Stack,
    Alert,
    Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import TelemetryNode from '../../components/common/TelemetryNode';
import { useForgot } from '../../hooks/useForgot';
import { initAuthSession } from '../../services/authService';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const { email, setEmail, error, isLoading, handleSubmit } = useForgot();
    const navigate = useNavigate();

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
                description="Secure password recovery portal. Advanced security protocols active."
            />
            <Card sx={{ p: { xs: 3, md: 5 } }}>
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
                        Forgot password?
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Enter your email address and we'll send you a 6-digit code to reset your password.
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            variant="outlined"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            required
                            disabled={isLoading}
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
                            {isLoading ? 'Sending...' : 'Send Reset Code'}
                        </Button>

                        <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
                            Remember your password?{' '}
                            <Link
                                component="button"
                                onClick={goToLogin}
                                sx={{ fontWeight: 700, textDecoration: 'none', color: 'primary.main', verticalAlign: 'baseline' }}
                            >
                                Back to login
                            </Link>
                        </Typography>
                    </Stack>
                </Box>
            </Card>
        </AuthLayout>
    );
};

export default ForgotPassword;
