import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { WarningAmber, InfoOutlined, CheckCircleOutline, ErrorOutline } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface ToggleNotificationProps {
    open: boolean;
    message: string;
    severity?: 'error' | 'warning' | 'info' | 'success';
    autoCloseDuration?: number; // Duration in milliseconds before auto-closing
    onClose?: () => void; // Callback when auto-close happens
}

const ToggleNotification: React.FC<ToggleNotificationProps> = ({ open, message, severity = 'info', autoCloseDuration, onClose }) => {
    React.useEffect(() => {
        if (open && autoCloseDuration) {
            const timer = setTimeout(() => {
                onClose?.();
            }, autoCloseDuration);
            return () => clearTimeout(timer);
        }
    }, [open, autoCloseDuration, onClose]);

    const getColors = () => {
        switch (severity) {
            case 'error':
                return {
                    bg: alpha('#EF4444', 0.95),
                    border: 'rgba(239, 68, 68, 0.4)',
                    text: '#FFF',
                    icon: <ErrorOutline fontSize="small" sx={{ color: 'white' }} />
                };
            case 'warning':
                return {
                    bg: alpha('#F59E0B', 0.95),
                    border: 'rgba(245, 158, 11, 0.4)',
                    text: '#FFF',
                    icon: <WarningAmber fontSize="small" sx={{ color: 'white' }} />
                };
            case 'success':
                return {
                    bg: alpha('#10B981', 0.95),
                    border: 'rgba(16, 185, 129, 0.4)',
                    text: '#FFF',
                    icon: <CheckCircleOutline fontSize="small" sx={{ color: 'white' }} />
                };
            default:
                return {
                    bg: alpha('#6366F1', 0.95),
                    border: 'rgba(99, 102, 241, 0.4)',
                    text: '#FFF',
                    icon: <InfoOutlined fontSize="small" sx={{ color: 'white' }} />
                };
        }
    };

    const colors = getColors();

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0, y: -50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -50, x: '-50%' }}
                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    style={{
                        position: 'fixed',
                        top: '40px',
                        left: '50%',
                        zIndex: 9999,
                        width: 'auto',
                        minWidth: '320px',
                        maxWidth: '90vw'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            py: 1.8,
                            px: 3,
                            borderRadius: 3,
                            bgcolor: colors.bg,
                            border: `1px solid ${colors.border}`,
                            backdropFilter: 'blur(16px)',
                            boxShadow: `0 20px 40px ${alpha('#000', 0.4)}, 0 0 20px ${alpha(colors.bg, 0.2)}`,
                        }}
                    >
                        {colors.icon}
                        <Typography variant="body2" sx={{ color: colors.text, fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.01em' }}>
                            {message}
                        </Typography>
                    </Box>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ToggleNotification;
