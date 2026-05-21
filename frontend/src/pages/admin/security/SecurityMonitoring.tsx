import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Stack,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Button,
    useTheme,
    alpha,
    TextField,
    MenuItem,
    Tooltip,
    IconButton,
} from '@mui/material';
import {
    Refresh,
    Warning,
    ErrorOutline,
    Info,
    Block,
    ContentCopy,
} from '@mui/icons-material';
import { useEffect, useState, useCallback } from 'react';
import * as securityService from '../../../services/securityService';

interface SecurityEvent {
    id: string;
    type: string;
    detail: string;
    url?: string;
    ip: string;
    ua?: string;
    ts: string;
}

interface SecurityStats {
    total_events: number;
    critical_events: number;
    unique_ips: number;
    events_by_type: Record<string, number>;
}

const SecurityMonitoring = () => {
    const theme = useTheme();

    const [events, setEvents] = useState<SecurityEvent[]>([]);
    const [stats, setStats] = useState<SecurityStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
    const [filterType, setFilterType] = useState<string>('all');

    // Fetch data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [logsRes, statsRes] = await Promise.all([
                securityService.getSecurityLog(),
                securityService.getSecurityStats(),
            ]);

            setEvents(logsRes.data || []);
            setStats(statsRes.data || null);
        } catch (error) {
            console.error('Failed to fetch security data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-refresh effect
    useEffect(() => {
        fetchData();

        if (!autoRefresh) return;

        const interval = setInterval(fetchData, refreshInterval);
        return () => clearInterval(interval);
    }, [fetchData, autoRefresh, refreshInterval]);

    // Filter events
    const filteredEvents = filterType === 'all'
        ? events
        : events.filter(event => event.type === filterType);

    // Get risk level color
    const getRiskColor = (eventType: string) => {
        const riskLevel = securityService.getRiskLevel(eventType);
        switch (riskLevel) {
            case 'critical':
                return theme.palette.error.main;
            case 'high':
                return theme.palette.warning.main;
            case 'medium':
                return theme.palette.info.main;
            default:
                return theme.palette.success.main;
        }
    };

    // Get risk icon
    const getRiskIcon = (eventType: string) => {
        const riskLevel = securityService.getRiskLevel(eventType);
        switch (riskLevel) {
            case 'critical':
            case 'high':
                return <ErrorOutline fontSize="small" />;
            case 'medium':
                return <Warning fontSize="small" />;
            default:
                return <Info fontSize="small" />;
        }
    };

    // Get unique event types
    const eventTypes = ['all', ...new Set(events.map(e => e.type))];

    return (
        <Box sx={{ width: '100%' }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                            Security Monitoring
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                            Real-time threat detection and event tracking
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={fetchData}
                            disabled={loading}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant={autoRefresh ? 'contained' : 'outlined'}
                            onClick={() => setAutoRefresh(!autoRefresh)}
                        >
                            {autoRefresh ? '🔴 Live' : '⚪ Manual'}
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            {/* Statistics Cards */}
            {stats && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card
                            sx={{
                                bgcolor: alpha(theme.palette.error.main, 0.08),
                                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                            }}
                        >
                            <CardContent>
                                <Stack spacing={1}>
                                    <Typography color="text.secondary" variant="body2">
                                        Critical Events
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                                        {stats.critical_events}
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card
                            sx={{
                                bgcolor: alpha(theme.palette.warning.main, 0.08),
                                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                            }}
                        >
                            <CardContent>
                                <Stack spacing={1}>
                                    <Typography color="text.secondary" variant="body2">
                                        Total Events
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                                        {stats.total_events}
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card
                            sx={{
                                bgcolor: alpha(theme.palette.info.main, 0.08),
                                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                            }}
                        >
                            <CardContent>
                                <Stack spacing={1}>
                                    <Typography color="text.secondary" variant="body2">
                                        Unique IPs
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                                        {stats.unique_ips}
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card
                            sx={{
                                bgcolor: alpha(theme.palette.success.main, 0.08),
                                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                            }}
                        >
                            <CardContent>
                                <Stack spacing={1}>
                                    <Typography color="text.secondary" variant="body2">
                                        Safe Sessions
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                                        {Math.max(0, stats.total_events - stats.critical_events)}
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Event Type Distribution */}
            {stats && (
                <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                        📊 Event Distribution
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {Object.entries(stats.events_by_type)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 8)
                            .map(([type, count]) => (
                                <Chip
                                    key={type}
                                    label={`${type}: ${count}`}
                                    size="small"
                                    icon={getRiskIcon(type)}
                                    sx={{
                                        color: getRiskColor(type),
                                        borderColor: getRiskColor(type),
                                        bgcolor: alpha(getRiskColor(type), 0.1),
                                    }}
                                    variant="outlined"
                                />
                            ))}
                    </Stack>
                </Paper>
            )}

            {/* Filters */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <TextField
                    select
                    label="Filter by Event Type"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    size="small"
                    sx={{ minWidth: 250 }}
                >
                    {eventTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                            {type === 'all' ? 'All Events' : securityService.getEventDescription(type)}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label="Refresh Interval"
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    size="small"
                    disabled={!autoRefresh}
                >
                    <MenuItem value={2000}>2 seconds</MenuItem>
                    <MenuItem value={5000}>5 seconds</MenuItem>
                    <MenuItem value={10000}>10 seconds</MenuItem>
                    <MenuItem value={30000}>30 seconds</MenuItem>
                </TextField>
            </Stack>

            {/* Events Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {!loading && filteredEvents.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            No security events detected
                        </Typography>
                    </Box>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Event Type</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>IP Address</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Risk</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredEvents.slice(0, 50).map((event, index) => {
                                const riskLevel = securityService.getRiskLevel(event.type);
                                return (
                                    <TableRow
                                        key={event.id || index}
                                        sx={{
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.04),
                                            },
                                        }}
                                    >
                                        <TableCell variant="body" sx={{ fontSize: '0.85rem' }}>
                                            {new Date(event.ts).toLocaleTimeString()}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={event.detail}>
                                                <Chip
                                                    label={securityService.getEventDescription(event.type)}
                                                    size="small"
                                                    icon={getRiskIcon(event.type)}
                                                    sx={{
                                                        color: getRiskColor(event.type),
                                                        fontWeight: 600,
                                                    }}
                                                    variant="filled"
                                                />
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell variant="body" sx={{ fontSize: '0.85rem', maxWidth: 250 }}>
                                            <Tooltip title={event.detail}>
                                                <span>{event.detail.substring(0, 40)}...</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell variant="body" sx={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                            {event.ip}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={riskLevel.toUpperCase()}
                                                size="small"
                                                color={
                                                    riskLevel === 'critical'
                                                        ? 'error'
                                                        : riskLevel === 'high'
                                                            ? 'warning'
                                                            : riskLevel === 'medium'
                                                                ? 'info'
                                                                : 'success'
                                                }
                                                sx={{ fontWeight: 700 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={0.5}>
                                                <Tooltip title="Copy IP">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => navigator.clipboard.writeText(event.ip)}
                                                    >
                                                        <ContentCopy fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                {riskLevel === 'critical' && (
                                                    <Tooltip title="Block IP">
                                                        <IconButton size="small" color="error">
                                                            <Block fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>

            {/* Footer Info */}
            {filteredEvents.length > 50 && (
                <Typography color="text.secondary" variant="body2" sx={{ mt: 2 }}>
                    Showing 50 of {filteredEvents.length} events. Latest events are displayed first.
                </Typography>
            )}
        </Box>
    );
};

export default SecurityMonitoring;
