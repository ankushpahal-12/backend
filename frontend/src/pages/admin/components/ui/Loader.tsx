import { Box, Typography, Paper, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import './Loader.css';

interface LoaderProps {
  message?: string;
  isVisible?: boolean;
}

const Loader = ({ message = 'Processing...', isVisible = true }: LoaderProps) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          backdropFilter: 'blur(4px)',
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 2,
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2.5,
            minWidth: 280,
          }}
        >
          <div className="loader"></div>
          <Typography
            variant="h6"
            sx={{
              color: '#1f2937',
              fontWeight: 600,
              textAlign: 'center',
              fontSize: '16px',
            }}
          >
            {message}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#6b7280',
              fontSize: '12px',
            }}
          >
            Please wait...
          </Typography>
        </Paper>
      </Box>
    </motion.div>
  );
};

export default Loader;
