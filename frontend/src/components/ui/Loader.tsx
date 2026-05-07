import { Box, CircularProgress, Typography, styled, Chip, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const LoaderWrapper = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    gap: '16px',
}));

const SecurityStatus = styled(Stack)(({ theme }) => ({
    marginTop: '16px',
    padding: '12px 16px',
    borderRadius: '8px',
    background: 'rgba(16, 185, 129, 0.1)',
    border: `1px solid ${theme.palette.success.light}`,
}));

interface LoaderProps {
    message?: string;
    size?: number;
    showSecurityStatus?: boolean;
}

interface SecurityStatusType {
    signatureReady: boolean;
    hmacInitialized: boolean;
    signatureMechanism: string;
}

const Loader = ({ 
    message = 'Loading...', 
    size = 40,
    showSecurityStatus = true 
}: LoaderProps) => {
    const [securityStatus, setSecurityStatus] = useState<SecurityStatusType>({
        signatureReady: false,
        hmacInitialized: false,
        signatureMechanism: 'initializing'
    });

    useEffect(() => {
        const checkSecurityStatus = () => {
            try {
                const hmacSecret = sessionStorage.getItem('__hmac_secret');
                const hmacReady = (window as any).__hmacSecretReady;
                const signatureReady = (window as any).__signatureReady;

                setSecurityStatus({
                    signatureReady: !!signatureReady || !!hmacSecret,
                    hmacInitialized: !!hmacSecret,
                    signatureMechanism: hmacSecret ? 'HMAC-SHA256' : 'fallback-hash'
                });
            } catch (error) {
                // Silently fail if sessionStorage is not available
                setSecurityStatus(prev => ({ ...prev, signatureMechanism: 'error' }));
            }
        };

        // Check status immediately
        checkSecurityStatus();

        // Poll for security status every 500ms
        const interval = setInterval(checkSecurityStatus, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <LoaderWrapper>
            <CircularProgress size={size} thickness={4} sx={{ color: 'primary.main' }} />
            {message && (
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {message}
                </Typography>
            )}

            {showSecurityStatus && (
                <SecurityStatus direction="column" spacing={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <SecurityIcon sx={{ fontSize: 18, color: 'success.main' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            Security Initialization
                        </Typography>
                    </Box>

                    <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip
                            icon={securityStatus.signatureReady ? <CheckCircleIcon /> : undefined}
                            label={securityStatus.signatureMechanism === 'HMAC-SHA256' ? 
                                'HMAC-SHA256 Active' : 
                                'Signature Ready'}
                            size="small"
                            color={securityStatus.signatureReady ? 'success' : 'default'}
                            variant="outlined"
                        />
                        
                        <Chip
                            icon={securityStatus.hmacInitialized ? <CheckCircleIcon /> : undefined}
                            label="HMAC Secret"
                            size="small"
                            color={securityStatus.hmacInitialized ? 'success' : 'default'}
                            variant="outlined"
                        />
                    </Box>

                    <Typography 
                        variant="caption" 
                        sx={{ 
                            color: 'text.secondary',
                            fontSize: '11px',
                            marginTop: '4px'
                        }}
                    >
                        {securityStatus.signatureMechanism === 'error' 
                            ? '⚠️ Security check unavailable' 
                            : securityStatus.hmacInitialized 
                            ? '✓ All security systems active'
                            : '⏳ Initializing security...'}
                    </Typography>
                </SecurityStatus>
            )}
        </LoaderWrapper>
    );
};

export default Loader;
