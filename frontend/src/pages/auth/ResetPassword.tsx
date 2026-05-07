import {
    Box,
    Typography,
    TextField,
    Stack,
    IconButton,
    InputAdornment,
    FormControlLabel,
    Checkbox,
    Grid,
    Paper,
    alpha,
    Dialog,
    DialogContent,
    DialogActions,
    CircularProgress
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    AutoAwesome,
    VerifiedUser,
    Hub,
    Security,
    CheckCircleOutline,
    KeyboardBackspace
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import Button from '../../components/ui/Button';
import TelemetryNode from '../../components/common/TelemetryNode';
import { useReset } from '../../hooks/useReset';

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
                    boxShadow: `0 0 30px ${alpha('#6366F1', 0.6)}`,
                    display: 'flex',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <AutoAwesome sx={{ fontSize: 28, color: 'white' }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                    FinTrack AI
                </Typography>
            </Stack>

            <Typography variant="h3" sx={{ fontWeight: 900, mb: 3, lineHeight: 1.1, letterSpacing: '-0.04em' }}>
                Recover <br />
                <Box component="span" sx={{
                    background: 'linear-gradient(90deg, #10B981 0%, #6EE7B7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>Access</Box>
            </Typography>

            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 8, maxWidth: 350, lineHeight: 1.8, fontSize: '1.05rem' }}>
                Securely reset your neural access keys. Multi-layered verification active.
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
                            bgcolor: alpha('#FFF', 0.04),
                            borderRadius: 2,
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            backdropFilter: 'blur(10px)'
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

const SuccessModal = ({ open, countdown }: { open: boolean, countdown: number }) => {
    const navigate = useNavigate();
    return (
        <Dialog
            open={open}
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    p: 2,
                    bgcolor: '#0f172a',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }
            }}
        >
            <DialogContent sx={{ textAlign: 'center', p: 4 }}>
                <CheckCircleOutline sx={{ fontSize: 80, color: '#10B981', mb: 3 }} />
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
                    Update Successful
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 4 }}>
                    Your security credentials have been successfully rotated. Initializing portal redirection...
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                    <CircularProgress
                        variant="determinate"
                        value={(countdown / 10) * 100}
                        size={80}
                        thickness={4}
                        sx={{ color: '#10B981' }}
                    />
                    <Box
                        sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography variant="h5" component="div" sx={{ fontWeight: 800 }}>
                            {countdown}
                        </Typography>
                    </Box>
                </Box>
                <Typography variant="caption" display="block" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                    Auto-redirecting in {countdown}s
                </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
                <Button
                    onClick={() => navigate('/user/login')}
                    variant="contained"
                    fullWidth
                    sx={{
                        mx: 4,
                        py: 1.5,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        fontWeight: 900,
                        textTransform: 'none'
                    }}
                >
                    Manual Redirection (Login)
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const ResetPassword = () => {
    const {
        otp, setOtp,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        logoutAll, setLogoutAll,
        showPassword, setShowPassword,
        showSuccess,
        countdown,
        email,
        isLoading,
        handleReset,
    } = useReset();

    return (
        <AuthLayout>
            <TelemetryNode
                title="Reset Access"
                description="Secure credential rotation. Bot protection and 2FA active."
            />

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
                                    onClick={() => history.back()}
                                    sx={{ mb: 4, color: 'text.secondary', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}
                                >
                                    <KeyboardBackspace />
                                </IconButton>

                                <Stack spacing={1} sx={{ mb: 4 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: 'white' }}>
                                        Reset Password
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Rotate your keys for <span style={{ color: alpha('#6366F1', 0.9), fontWeight: 700 }}>{email}</span>
                                    </Typography>
                                </Stack>

                                <Box component="form" onSubmit={handleReset} sx={{ width: '100%' }}>
                                    <Stack spacing={3}>
                                        <TextField
                                            fullWidth
                                            label="Reset Code"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="000000"
                                            required
                                            disabled={isLoading}
                                            slotProps={{
                                                htmlInput: {
                                                    sx: { textAlign: 'center', letterSpacing: 8, fontSize: '1.5rem', fontWeight: 900, color: 'primary.light' },
                                                    'data-lpignore': 'true'
                                                },
                                                input: {
                                                    sx: {
                                                        borderRadius: 2,
                                                        bgcolor: alpha('#FFF', 0.02),
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        '&:hover': { border: '1px solid rgba(255,255,255,0.25)' },
                                                        '&.Mui-focused': { border: `1px solid ${alpha('#6366F1', 0.5)}` }
                                                    }
                                                }
                                            }}
                                        />

                                        <TextField
                                            fullWidth
                                            label="New Access Key"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            slotProps={{
                                                htmlInput: { 'data-lpignore': 'true' },
                                                input: {
                                                    sx: {
                                                        borderRadius: 2,
                                                        bgcolor: alpha('#FFF', 0.02),
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                    },
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }
                                            }}
                                        />

                                        <TextField
                                            fullWidth
                                            label="Confirm New Key"
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            slotProps={{
                                                htmlInput: { 'data-lpignore': 'true' },
                                                input: {
                                                    sx: {
                                                        borderRadius: 2,
                                                        bgcolor: alpha('#FFF', 0.02),
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                    }
                                                }
                                            }}
                                        />

                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={logoutAll}
                                                    onChange={(e) => setLogoutAll(e.target.checked)}
                                                    sx={{ color: 'rgba(255,255,255,0.2)', '&.Mui-checked': { color: 'primary.light' } }}
                                                />
                                            }
                                            label={
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Flush all active nodes</Typography>
                                            }
                                        />

                                        <Button
                                            fullWidth
                                            size="large"
                                            type="submit"
                                            variant="contained"
                                            disabled={isLoading || otp.length < 6 || !password}
                                            sx={{
                                                py: 2,
                                                borderRadius: 2,
                                                fontWeight: 900,
                                                fontSize: '1rem',
                                                textTransform: 'none',
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
                                            {isLoading ? 'Rotating Keys...' : 'Sync New Credentials'}
                                        </Button>
                                    </Stack>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            <SuccessModal open={showSuccess} countdown={countdown} />
        </AuthLayout>
    );
};

export default ResetPassword;
