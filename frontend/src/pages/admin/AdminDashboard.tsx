import {
    Box,
    Typography,
    Paper,
    Stack,
    alpha,
    useTheme,
    Grid,
    Tabs,
    Tab
} from '@mui/material';
import {
    People,
    AccountBalance,
    Security,
    TrendingUp,
    Dashboard,
    Shield
} from '@mui/icons-material';
import MainLayout from '../../components/layouts/MainLayout';
import { useLoading } from '../../context/LoadingContext';
import { useEffect, useState } from 'react';
import * as dataService from '../../services/dataService';
import SecurityMonitoring from '../../components/admin/SecurityMonitoring';

const AdminDashboard = () => {
    const theme = useTheme();
    const { startLoading, stopLoading } = useLoading();
    const [tabValue, setTabValue] = useState(0);

    interface StatsData {
        totalUsers?: number;
        verifiedUsers?: number;
        financialVolume?: string;
        [key: string]: unknown;
    }
    const [statsData, setStatsData] = useState<StatsData | null>(null);

    useEffect(() => {
        const initDashboard = async () => {
            startLoading('general', 'Accessing Command Center. Generating system analytics...');
            try {
                const response = await dataService.getAdminStats();
                setStatsData(response.data.stats);
            } catch (error) {
                console.error('Failed to fetch admin stats', error);
            } finally {
                stopLoading();
            }
        };
        initDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const stats = [
        { label: 'Total Users', value: statsData?.totalUsers?.toLocaleString() || '0', icon: <People />, color: theme.palette.primary.main },
        { label: 'Verified Users', value: statsData?.verifiedUsers?.toLocaleString() || '0', icon: <Security />, color: theme.palette.success.main },
        { label: 'Financial Volume', value: statsData?.financialVolume || '₹0', icon: <AccountBalance />, color: theme.palette.info.main },
    ];

    return (
        <MainLayout>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                    🎛️ Admin Command Center
                </Typography>
                <Typography color="text.secondary">
                    System monitoring, security alerts, and user administration
                </Typography>
            </Box>

            {/* Tab Navigation */}
            <Paper sx={{ mb: 3, borderRadius: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, value) => setTabValue(value)}
                    sx={{
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        '& .MuiTab-root': {
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '1rem',
                        },
                    }}
                >
                    <Tab
                        icon={<Dashboard sx={{ mr: 1 }} />}
                        iconPosition="start"
                        label="Overview"
                    />
                    <Tab
                        icon={<Shield sx={{ mr: 1 }} />}
                        iconPosition="start"
                        label="Security Monitoring"
                    />
                </Tabs>
            </Paper>

            {/* Tab: Overview */}
            {tabValue === 0 && (
                <Grid container spacing={3}>
                    {stats.map((stat, index) => (
                        <Grid size={{ xs: 12, md: 4 }} key={index}>
                            <Paper
                                sx={{
                                    p: 3,
                                    borderRadius: 4,
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.divider, 0.1),
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: `0 12px 24px ${alpha(stat.color, 0.08)}`
                                    }
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{
                                        p: 1.5,
                                        borderRadius: 3,
                                        bgcolor: alpha(stat.color, 0.1),
                                        color: stat.color,
                                        display: 'flex'
                                    }}>
                                        {stat.icon}
                                    </Box>
                                    <Box>
                                        <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>
                                            {stat.label}
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                            {stat.value}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>
                    ))}

                    <Grid size={{ xs: 12 }}>
                        <Paper sx={{
                            p: 8,
                            borderRadius: 6,
                            textAlign: 'center',
                            border: '2px dashed',
                            borderColor: alpha(theme.palette.divider, 0.2),
                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                            backdropFilter: 'blur(10px)'
                        }}>
                            <Box sx={{
                                width: 64,
                                height: 64,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 3,
                                color: 'primary.main'
                            }}>
                                <TrendingUp fontSize="large" />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                📊 System Analytics
                            </Typography>
                            <Typography color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                                Real-time system metrics and user engagement analytics are being processed.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Tab: Security Monitoring */}
            {tabValue === 1 && (
                <Box sx={{ bgcolor: 'background.paper' }}>
                    <SecurityMonitoring />
                </Box>
            )}
        </MainLayout>
    );
};

export default AdminDashboard;
