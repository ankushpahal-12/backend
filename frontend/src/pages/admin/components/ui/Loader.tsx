import { Box, Typography, Paper, Stack, LinearProgress, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import './Loader.css';

interface LoaderProps {
  message?: string;
  isVisible?: boolean;
  progress?: number;
  status?: 'loading' | 'processing' | 'submitting' | 'success' | 'error';
  subMessage?: string;
}

const Loader = ({ 
  message = 'Processing...', 
  isVisible = true, 
  progress = 0,
  status = 'loading',
  subMessage 
}: LoaderProps) => {
  if (!isVisible) return null;

  const getStatusColor = () => {
    switch (status) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'processing': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success': return '✓ Completed';
      case 'error': return '✗ Error';
      case 'processing': return '⟳ Processing';
      default: return '⟳ Loading';
    }
  };

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
            minWidth: 320,
            maxWidth: 400,
          }}
        >
          <div className="loader"></div>
          
          <Stack direction="column" spacing={1} sx={{ width: '100%', alignItems: 'center' }}>
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
            
            {subMessage && (
              <Typography
                variant="body2"
                sx={{
                  color: '#6b7280',
                  fontSize: '13px',
                  textAlign: 'center'
                }}
              >
                {subMessage}
              </Typography>
            )}
          </Stack>

          {progress > 0 && (
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Progress
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{
                  borderRadius: 1,
                  height: 6,
                  backgroundColor: '#e5e7eb',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 1,
                    backgroundColor: getStatusColor()
                  }
                }}
              />
            </Box>
          )}

          <Chip
            size="small"
            label={getStatusMessage()}
            sx={{
              backgroundColor: getStatusColor(),
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '11px'
            }}
          />

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
