import { useMemo, useState } from 'react';
import {
	Box,
	Button,
	Chip,
	Divider,
	Grid,
	Paper,
	Stack,
	Typography,
	alpha,
	useTheme,
} from '@mui/material';
import {
	VerifiedUser,
	ReportGmailerrorred,
	GroupOff,
	Security,
	Refresh,
	Shield,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LineChart, Line, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from 'recharts';
import MainLayout from '../../../components/layouts/MainLayout';
import ThreatDetection from '../components/security/ThreatDetection';
import IPBlockList from '../components/security/IPBlockList';
import RateLimitMonitor from '../components/security/RateLimitMonitor';
import DeviceTracking from '../components/security/DeviceTracking';
import ServerLoadCard from '../components/security/ServerLoadCard';
import ActiveSessionsCard from '../components/security/ActiveSessionsCard';
import RecentThreatsCard from '../components/security/RecentThreatsCard';

const trendData = [
	{ day: '12 May', high: 38, medium: 22, low: 12 },
	{ day: '13 May', high: 44, medium: 24, low: 13 },
	{ day: '14 May', high: 67, medium: 39, low: 17 },
	{ day: '15 May', high: 86, medium: 51, low: 24 },
	{ day: '16 May', high: 77, medium: 39, low: 21 },
	{ day: '17 May', high: 60, medium: 32, low: 16 },
	{ day: '18 May', high: 66, medium: 40, low: 18 },
];

const threatBreakdown = [
	{ name: 'Suspicious Login', value: 34, color: '#ef4444' },
	{ name: 'Multiple Login Failures', value: 28, color: '#f97316' },
	{ name: 'Unusual IP Access', value: 22, color: '#f59e0b' },
	{ name: 'Cheating Detected', value: 20, color: '#22c55e' },
	{ name: 'Session Hijacking', value: 12, color: '#3b82f6' },
	{ name: 'Other', value: 8, color: '#8b5cf6' },
];

const metrics = [
	{ label: 'Security Score', value: '78 / 100', hint: 'Good', icon: <Security />, tone: '#ef4444', bg: '#fff1f2' },
	{ label: 'Total Threats', value: '124', hint: '↑ 18.2% from last 7 days', icon: <ReportGmailerrorred />, tone: '#f59e0b', bg: '#fff7ed' },
	{ label: 'Blocked Users', value: '16', hint: '↑ 6.7% from last 7 days', icon: <GroupOff />, tone: '#ef4444', bg: '#fff1f2' },
	{ label: 'Security Events', value: '532', hint: '↓ 12.4% from last 7 days', icon: <VerifiedUser />, tone: '#16a34a', bg: '#f0fdf4' },
];

const SecurityPage = () => {
	const theme = useTheme();
	const [timeWindow, setTimeWindow] = useState<'7d' | '30d'>('7d');

	const scoreColor = useMemo(() => {
		if (metrics[0].value.startsWith('78')) return theme.palette.success.main;
		return theme.palette.warning.main;
	}, [theme.palette.success.main, theme.palette.warning.main]);

	return (
		<MainLayout>
			<Box sx={{ minHeight: '100vh', bgcolor: '#f6f8fc' }}>
				<Box sx={{ mb: 3 }}>
					<Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2}>
						<Box>
							<Typography sx={{ fontWeight: 900, fontSize: 30, lineHeight: 1.1 }}>Security</Typography>
							<Typography color="text.secondary" sx={{ mt: 0.5 }}>
								Monitor system security, threats and suspicious activities.
							</Typography>
						</Box>
						<Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
							<Button variant="outlined" startIcon={<Refresh />} sx={{ textTransform: 'none', borderRadius: 0 }}>
								Refresh
							</Button>
							<Button variant="contained" startIcon={<Shield />} sx={{ textTransform: 'none', borderRadius: 0, boxShadow: 'none' }}>
								Run Security Scan
							</Button>
						</Stack>
					</Stack>
				</Box>

				<Grid container spacing={2.5} sx={{ mb: 3 }} alignItems="stretch">
					{metrics.map((metric) => (
						<Grid key={metric.label} size={{ xs: 12, sm: 6, md: 3 }}>
							<motion.div whileHover={{ y: -6, scale: 1.01 }} whileTap={{ scale: 0.99 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
								<Paper
									sx={{
										borderRadius: 0,
										border: '1px solid #e2e8f0',
										p: 2.2,
										height: '100%',
										boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
										background: `linear-gradient(180deg, ${metric.bg} 0%, #ffffff 60%)`,
									}}
								>
									<Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
											<Box sx={{ width: 52, height: 52, borderRadius: 0, display: 'grid', placeItems: 'center', bgcolor: metric.bg, color: metric.tone }}>
												{metric.icon}
											</Box>
											<Box>
												<Typography sx={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{metric.label}</Typography>
												<Typography sx={{ fontSize: 26, fontWeight: 900, lineHeight: 1.1, color: '#0f172a' }}>{metric.value}</Typography>
												<Typography sx={{ fontSize: 12, fontWeight: 700, color: metric.tone }}>{metric.hint}</Typography>
											</Box>
										</Box>
										<Chip size="small" label="Live" sx={{ borderRadius: 0, fontWeight: 700, bgcolor: alpha(metric.tone, 0.12), color: metric.tone }} />
									</Stack>
								</Paper>
							</motion.div>
						</Grid>
					))}
				</Grid>

				<Grid container spacing={2.5} sx={{ mb: 2.5 }} alignItems="stretch">
					<Grid size={{ xs: 12, md: 12 }}>
						<motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 240, damping: 20 }}>
							<Paper sx={{ borderRadius: 0, border: '1px solid #e2e8f0', p: 2.5, height: '100%' }}>
								<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
									<Typography sx={{ fontWeight: 800 }}>Threats Over Time</Typography>
									<Button size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 0 }}>
										{timeWindow === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
									</Button>
								</Stack>
								<Box sx={{ height: 290 }}>
									<ResponsiveContainer width="100%" height="100%">
										<LineChart data={trendData}>
											<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
											<XAxis dataKey="day" tick={{ fontSize: 12 }} />
											<YAxis tick={{ fontSize: 12 }} />
											<Tooltip />
											<Line type="monotone" dataKey="high" stroke="#ef4444" strokeWidth={3} dot={{ r: 3 }} />
											<Line type="monotone" dataKey="medium" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3 }} />
											<Line type="monotone" dataKey="low" stroke="#22c55e" strokeWidth={3} dot={{ r: 3 }} />
										</LineChart>
									</ResponsiveContainer>
								</Box>
							</Paper>
						</motion.div>
					</Grid>
				</Grid>

				<Grid container spacing={2.5} alignItems="stretch">
					<Grid size={{ xs: 12, md: 8 }}>
						<ThreatDetection />
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<IPBlockList />
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<RateLimitMonitor />
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<DeviceTracking />
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<ServerLoadCard />
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<ActiveSessionsCard />
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<RecentThreatsCard />
					</Grid>
				</Grid>
			</Box>
		</MainLayout>
	);
};

export default SecurityPage;
