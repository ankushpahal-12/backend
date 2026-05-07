import { Box, Stack, Typography, alpha } from '@mui/material';
import { Shield, Lock, Verified } from '@mui/icons-material';

interface SecurityBadgeProps {
    variant?: 'standard' | 'admin' | 'encrypted';
    message?: string;
}

const CONFIG = {
    standard: {
        icon: <Lock sx={{ fontSize: 14 }} />,
        label: 'Encrypted Connection',
        color: '#10B981',
    },
    admin: {
        icon: <Shield sx={{ fontSize: 14 }} />,
        label: 'Restricted Access Zone',
        color: '#F59E0B',
    },
    encrypted: {
        icon: <Verified sx={{ fontSize: 14 }} />,
        label: 'End-to-End Encrypted',
        color: '#6366F1',
    },
};

const SecurityBadge: React.FC<SecurityBadgeProps> = ({ variant = 'standard', message }) => {
    const cfg = CONFIG[variant];

    return (
        <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 0.8,
            borderRadius: 2,
            bgcolor: alpha(cfg.color, 0.08),
            border: `1px solid ${alpha(cfg.color, 0.2)}`,
            backdropFilter: 'blur(8px)',
        }}>
            <Stack direction="row" spacing={0.8} alignItems="center">
                <Box sx={{ color: cfg.color, display: 'flex' }}>
                    {cfg.icon}
                </Box>
                <Typography variant="caption" sx={{
                    fontWeight: 700,
                    color: cfg.color,
                    letterSpacing: '0.05em',
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                }}>
                    {message || cfg.label}
                </Typography>
            </Stack>
        </Box>
    );
};

export default SecurityBadge;
