import React from 'react';
import { Box, Typography, Stack, Paper, Button } from '@mui/material';
import { CloudOff, Refresh, SignalCellularOff } from '@mui/icons-material';

interface NetworkLoaderProps {
  status?: 'loading' | 'network-unavailable' | 'server-unavailable';
  message?: string;
  onRetry?: () => void;
  showDetails?: boolean;
}

const NetworkLoader = ({ 
  status = 'loading', 
  message, 
  onRetry,
  showDetails = true 
}: NetworkLoaderProps) => {
  const isNetworkUnavailable = status === 'network-unavailable';
  const isServerUnavailable = status === 'server-unavailable';
  const isLoading = status === 'loading';

  if (isLoading) {
    return (
      <div className="flex-col gap-4 w-full flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full">
          <div className="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full" />
        </div>
        {message && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
            {message}
          </Typography>
        )}
      </div>
    );
  }

  if (isNetworkUnavailable) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6,
          px: 3,
          textAlign: 'center',
          minHeight: '400px'
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'rgba(244, 63, 94, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            mb: 3,
            border: '2px solid rgba(244, 63, 94, 0.2)'
          }}
        >
          <SignalCellularOff sx={{ fontSize: 40, color: 'error.main' }} />
        </Paper>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
          No Network Connection
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, maxWidth: 300 }}>
          {message || 'Please check your internet connection and try again.'}
        </Typography>
        {showDetails && (
          <Stack spacing={2} sx={{ width: '100%', maxWidth: 300 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              • Check your WiFi or mobile connection
              <br />• Verify you are connected to the internet
              <br />• Try again in a few moments
            </Typography>
          </Stack>
        )}
        {onRetry && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Refresh />}
            onClick={onRetry}
            sx={{ mt: 4 }}
          >
            Try Again
          </Button>
        )}
      </Box>
    );
  }

  if (isServerUnavailable) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6,
          px: 3,
          textAlign: 'center',
          minHeight: '400px'
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'rgba(251, 146, 60, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            mb: 3,
            border: '2px solid rgba(251, 146, 60, 0.2)'
          }}
        >
          <CloudOff sx={{ fontSize: 40, color: 'warning.main' }} />
        </Paper>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
          Server Unavailable
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, maxWidth: 300 }}>
          {message || 'The server is temporarily unavailable. Please try again shortly.'}
        </Typography>
        {showDetails && (
          <Stack spacing={2} sx={{ width: '100%', maxWidth: 300 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              Status: Maintenance in progress
              <br />• We're working on this issue
              <br />• Service will be restored soon
            </Typography>
          </Stack>
        )}
        {onRetry && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Refresh />}
            onClick={onRetry}
            sx={{ mt: 4 }}
          >
            Retry Connection
          </Button>
        )}
      </Box>
    );
  }

  return null;
};

export default NetworkLoader;
