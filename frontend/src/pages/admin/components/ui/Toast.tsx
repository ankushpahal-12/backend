import { Box, Typography, IconButton, Paper, Stack } from '@mui/material';
import { Close as CloseIcon, CheckCircle as CheckIcon, Error as ErrorIcon, Info as InfoIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'processing';

interface ToastNotification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastProps extends ToastNotification {
  onClose: (id: string) => void;
}

const Toast = ({ id, type, message, title, duration = 5000, onClose }: ToastProps) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (duration > 0 && type !== 'processing') {
      const timer = setTimeout(() => {
        setIsClosing(true);
        setTimeout(() => onClose(id), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose, type]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckIcon sx={{ color: '#10b981', fontSize: 24 }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#ef4444', fontSize: 24 }} />;
      case 'processing':
        return <InfoIcon sx={{ color: '#3b82f6', fontSize: 24 }} />;
      default:
        return <InfoIcon sx={{ color: '#6b7280', fontSize: 24 }} />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return '#f0fdf4';
      case 'error':
        return '#fef2f2';
      case 'processing':
        return '#eff6ff';
      default:
        return '#f9fafb';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return '#86efac';
      case 'error':
        return '#fca5a5';
      case 'processing':
        return '#93c5fd';
      default:
        return '#e5e7eb';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 400, y: 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 400, y: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Paper
        elevation={6}
        sx={{
          bgcolor: getBgColor(),
          border: `1px solid ${getBorderColor()}`,
          borderRadius: 1.5,
          p: 2.5,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          minWidth: 340,
          maxWidth: 480,
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box sx={{ pt: 0.5 }}>{getIcon()}</Box>

        <Stack spacing={0.5} sx={{ flex: 1 }}>
          {title && (
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '14px',
                color: '#1f2937',
              }}
            >
              {title}
            </Typography>
          )}
          <Typography
            sx={{
              fontSize: '13px',
              color: '#4b5563',
              lineHeight: 1.5,
            }}
          >
            {message}
          </Typography>
        </Stack>

        <IconButton
          size="small"
          onClick={() => {
            setIsClosing(true);
            setTimeout(() => onClose(id), 300);
          }}
          sx={{
            color: '#9ca3af',
            '&:hover': { color: '#6b7280' },
            mt: -0.5,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Paper>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: ToastNotification[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'bottom-right' | 'top-center';
}

const ToastContainer = ({
  toasts,
  onRemove,
  position = 'top-right',
}: ToastContainerProps) => {
  const getPosition = () => {
    switch (position) {
      case 'top-right':
        return { top: 20, right: 20 };
      case 'bottom-right':
        return { bottom: 20, right: 20 };
      case 'top-center':
        return { top: 20, left: '50%', transform: 'translateX(-50%)' };
      default:
        return { top: 20, right: 20 };
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        ...getPosition(),
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <Toast {...toast} onClose={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </Box>
  );
};

export { Toast, ToastContainer };
export type { ToastNotification, ToastProps, ToastContainerProps };
