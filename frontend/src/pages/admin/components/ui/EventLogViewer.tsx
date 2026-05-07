import { Box, Paper, Stack, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserEventLog, UserEvent } from '../../hooks/useUserManagement';

interface EventLogViewerProps {
  events: UserEventLog[];
  onClear: () => void;
  maxHeight?: string;
  compact?: boolean;
}

const EventLogViewer = ({
  events,
  onClear,
  maxHeight = '400px',
  compact = false,
}: EventLogViewerProps) => {
  const [expanded, setExpanded] = useState(!compact);

  const getEventIcon = (type: UserEvent) => {
    if (type.includes('error') || type === 'error') {
      return <ErrorIcon sx={{ fontSize: 18, color: '#ef4444' }} />;
    }
    if (type.includes('ed')) {
      // Events ending with 'ed' are completed actions
      return <CheckIcon sx={{ fontSize: 18, color: '#10b981' }} />;
    }
    return <InfoIcon sx={{ fontSize: 18, color: '#3b82f6' }} />;
  };

  const getEventBg = (type: UserEvent) => {
    if (type === 'error') {
      return '#fef2f2';
    }
    if (type.includes('ed')) {
      return '#f0fdf4';
    }
    return '#eff6ff';
  };

  const getEventBorder = (type: UserEvent) => {
    if (type === 'error') {
      return '#fca5a5';
    }
    if (type.includes('ed')) {
      return '#86efac';
    }
    return '#93c5fd';
  };

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 1.5,
        overflow: 'hidden',
        bgcolor: '#ffffff',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          cursor: compact ? 'pointer' : 'default',
        }}
        onClick={() => compact && setExpanded(!expanded)}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1f2937' }}>
            Event Log ({events.length})
          </Typography>
          {events.length > 0 && (
            <Chip
              label={events[0].type.replace(/_/g, ' ')}
              size="small"
              sx={{
                height: 24,
                fontSize: '11px',
                fontWeight: 600,
                bgcolor: getEventBg(events[0].type),
                color: getEventBorder(events[0].type),
              }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={0.5}>
          {compact && (
            <Tooltip title={expanded ? 'Collapse' : 'Expand'}>
              <IconButton size="small" onClick={() => setExpanded(!expanded)}>
                {expanded ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
          {events.length > 0 && (
            <Tooltip title="Clear all events">
              <IconButton size="small" onClick={onClear}>
                <DeleteIcon fontSize="small" sx={{ color: '#9ca3af' }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>

      {/* Events List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Box
              sx={{
                maxHeight,
                overflow: 'auto',
                bgcolor: '#fafbfc',
              }}
            >
              {events.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    No events yet
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={0}>
                  {events.map((event, index) => (
                    <motion.div
                      key={`${event.timestamp.getTime()}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                      <Paper
                        variant="outlined"
                        sx={{
                          m: 1,
                          p: 1.5,
                          bgcolor: getEventBg(event.type),
                          border: `1px solid ${getEventBorder(event.type)}`,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1.5,
                        }}
                      >
                        <Box sx={{ pt: 0.25 }}>{getEventIcon(event.type)}</Box>

                        <Stack spacing={0.25} sx={{ flex: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 600,
                                color: '#1f2937',
                                textTransform: 'capitalize',
                              }}
                            >
                              {event.type.replace(/_/g, ' ')}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#9ca3af',
                                fontSize: '10px',
                              }}
                            >
                              {event.timestamp.toLocaleTimeString()}
                            </Typography>
                          </Stack>

                          <Typography
                            variant="caption"
                            sx={{
                              color: '#4b5563',
                              fontSize: '12px',
                            }}
                          >
                            {event.message}
                          </Typography>

                          {event.userId && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#6b7280',
                                fontSize: '10px',
                              }}
                            >
                              User: {event.userId}
                            </Typography>
                          )}

                          {event.error && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#dc2626',
                                fontSize: '10px',
                                fontFamily: 'monospace',
                              }}
                            >
                              {event.error.message}
                            </Typography>
                          )}
                        </Stack>
                      </Paper>
                    </motion.div>
                  ))}
                </Stack>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Paper>
  );
};

export default EventLogViewer;
