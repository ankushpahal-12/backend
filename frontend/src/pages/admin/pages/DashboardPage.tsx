import { useState } from 'react';
import {
	Avatar,
	Badge,
	Box,
	Collapse,
	Divider,
	Grid,
	IconButton,
	MenuItem,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Typography,
	alpha,
} from '@mui/material';
import {
	AttachMoney,
	BugReport,
	Groups,
	Hub,
	MailOutline,
	Notifications,
	Search,
	Security,
	Storage,
	TrendingDown,
	TrendingUp,
	VerifiedUser,
	WarningAmber,
} from '@mui/icons-material';
import {
	Cell,
	CartesianGrid,
	Legend,
	Line,
	LineChart,
 	Pie,
 	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import AlertsPanel, { type AlertItem } from '../components/dashboard/AlertsPanel';
import RiskScoreCard, { type RiskMetric } from '../components/dashboard/RiskScoreCard';
import SecurityOverview, { type SecurityStatusItem } from '../components/dashboard/SecurityOverview';
import Sidebar from '../../../components/layouts/SideBar';
const riskMetrics: RiskMetric[] = [
	{
		id: 'total-revenue',
		title: 'Total Revenue',
		value: '₹2,45,000',
		delta: '18.2%',
		deltaDirection: 'up',
		icon: <AttachMoney fontSize="small" />,
		color: '#16a34a',
		trend: [120, 150, 180, 160, 210, 245, 230, 280],
	},
	{
		id: 'active-subscriptions',
		title: 'Active Users',
		value: '1,248',
		delta: '12.5%',
		deltaDirection: 'up',
		icon: <Groups fontSize="small" />,
		color: '#2563eb',
		trend: [8, 10, 12, 9, 11, 13, 12, 15],
	},
	{
		id: 'new-signups',
		title: 'New Signups',
		value: '342',
		delta: '8.1%',
		deltaDirection: 'up',
		icon: <TrendingUp fontSize="small" />,
		color: '#7c3aed',
		trend: [6, 8, 7, 9, 10, 9, 11, 12],
	},
	{
		id: 'churn-rate',
		title: 'Churn Rate',
		value: '4.2%',
		delta: '1.4%',
		deltaDirection: 'down',
		icon: <TrendingDown fontSize="small" />,
		color: '#f59e0b',
		trend: [5, 4, 4.5, 4.2, 4, 3.8, 4.2, 4],
	},
	{
		id: 'failed-payments',
		title: 'Failed Payments',
		value: '12',
		delta: '20.0%',
		deltaDirection: 'down',
		icon: <WarningAmber fontSize="small" />,
		color: '#ef4444',
		trend: [15, 12, 14, 10, 13, 11, 12, 10],
	},
];

const attemptsOverviewData = [
	{ day: '12 May', revenue: 15200, subscriptions: 180 },
	{ day: '13 May', revenue: 18300, subscriptions: 210 },
	{ day: '14 May', revenue: 32200, subscriptions: 360 },
	{ day: '15 May', revenue: 47700, subscriptions: 540 },
	{ day: '16 May', revenue: 41600, subscriptions: 410 },
	{ day: '17 May', revenue: 31500, subscriptions: 330 },
	{ day: '18 May', revenue: 38100, subscriptions: 390 },
];

const registrationBreakdownData = [
	{ name: 'Basic Plan', value: 40, color: '#2563eb', description: 'Users on the entry-level essential plan.' },
	{ name: 'Pro Plan', value: 35, color: '#10b981', description: 'Power users on our most popular professional tier.' },
	{ name: 'Premium Plan', value: 25, color: '#7c3aed', description: 'Enterprise and high-demand users with full access.' },
	{ name: 'Free Trial', value: 15, color: '#f59e0b', description: 'Users currently exploring the platform features.' },
];

const recentTests = [
	{ id: 'r1', iconColor: '#22c55e', name: 'Rohan Mehta', plan: 'Pro Plan', amount: '₹599', status: 'Success', date: '18 May 2024' },
	{ id: 'r2', iconColor: '#3b82f6', name: 'Priya Sharma', plan: 'Premium Plan', amount: '₹999', status: 'Success', date: '17 May 2024' },
	{ id: 'r3', iconColor: '#8b5cf6', name: 'Arjun Singh', plan: 'Basic Plan', amount: '₹299', status: 'Pending', date: '16 May 2024' },
	{ id: 'r4', iconColor: '#f59e0b', name: 'Sneha Patel', plan: 'Pro Plan', amount: '₹599', status: 'Success', date: '15 May 2024' },
	{ id: 'r5', iconColor: '#ec4899', name: 'Vikram Rao', plan: 'Premium Plan', amount: '₹999', status: 'Failed', date: '14 May 2024' },
];

const topPerformingTests = [
	{ id: 't1', rank: 1, name: 'Pro Plan', attempts: 124500, score: 85, color: '#10b981' },
	{ id: 't2', rank: 2, name: 'Premium Plan', attempts: 98400, score: 72, color: '#7c3aed' },
	{ id: 't3', rank: 3, name: 'Basic Plan', attempts: 22100, score: 58, color: '#2563eb' },
];

const alertsData: AlertItem[] = [
	{
		id: 'a-1',
		user: 'Rahul Khanna',
		context: 'Payment Failed',
		detection: 'Insufficient funds',
		risk: 'High',
		timeAgo: '5 min ago',
	},
	{
		id: 'a-2',
		user: 'Anita Desai',
		context: 'Subscription Canceled',
		detection: 'User request',
		risk: 'Medium',
		timeAgo: '45 min ago',
	},
	{
		id: 'a-3',
		user: 'Karan Mehra',
		context: 'Refund Requested',
		detection: 'Duplicate charge',
		risk: 'Medium',
		timeAgo: '2 hours ago',
	},
	{
		id: 'a-4',
		user: 'Sanya Gupta',
		context: 'Plan Upgrade',
		detection: 'Basic to Pro',
		risk: 'Low',
		timeAgo: '4 hours ago',
	},
];

const securityData: SecurityStatusItem[] = [
	{
		id: 'server',
		label: 'Server Status',
		value: 'Online',
		status: 'online',
		icon: <Hub fontSize="small" />,
	},
	{
		id: 'storage',
		label: 'Total Storage',
		value: '256 GB / 1 TB',
		status: 'healthy',
		icon: <BugReport fontSize="small" />,
	},
	{
		id: 'database',
		label: 'Database',
		value: 'Healthy',
		status: 'healthy',
		icon: <Storage fontSize="small" />,
	},
	{
		id: 'backup',
		label: 'Backup Status',
		value: 'Up to date',
		status: 'healthy',
		icon: <VerifiedUser fontSize="small" />,
	},
	{
		id: 'sessions',
		label: 'Active Sessions',
		value: '562',
		status: 'warning',
		icon: <Security fontSize="small" />,
	},
];

const DashboardPage = () => {
	const [searchOpen, setSearchOpen] = useState(false);
	const sidebarWidth = 248;

	return (
		<Box sx={{ minHeight: '100vh', bgcolor: '#f4f6fb', overflow: 'hidden' }}>
			<Box sx={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, bgcolor: '#f4f6fb' }} />
			<Sidebar open onClose={() => undefined} width={sidebarWidth} />

			<Box
				sx={{
					position: 'relative',
					zIndex: 1,
					ml: { xs: 0, lg: `${sidebarWidth}px` },
					height: '100vh',
					overflowY: 'auto',
					px: { xs: 2, md: 3 },
					py: { xs: 2, md: 3 },
				}}
			>
				<Stack spacing={2.2}>
					<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 0.4 }}>
						<Typography sx={{ fontWeight: 800, fontSize: { xs: 24, md: 34 }, color: '#111827' }}>Dashboard</Typography>

						<Stack direction="row" spacing={1} alignItems="center">
							<Collapse in={searchOpen} orientation="horizontal" collapsedSize={0}>
								<TextField
									size="small"
									autoFocus
									placeholder="Search anything..."
									sx={{ minWidth: 260, '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
								/>
							</Collapse>
							<IconButton
								onClick={() => setSearchOpen((prev) => !prev)}
								sx={{ border: '1px solid #dbe3f4', bgcolor: '#fff' }}
							>
								<Search fontSize="small" />
							</IconButton>
							<IconButton sx={{ border: '1px solid #dbe3f4', bgcolor: '#fff' }}>
								<Badge badgeContent={5} color="error">
									<Notifications fontSize="small" />
								</Badge>
							</IconButton>
							<IconButton sx={{ border: '1px solid #dbe3f4', bgcolor: '#fff' }}>
								<Badge badgeContent={2} color="error">
									<MailOutline fontSize="small" />
								</Badge>
							</IconButton>
							<Stack direction="row" spacing={1} alignItems="center" sx={{ pl: 1 }}>
								<Avatar sx={{ width: 34, height: 34 }}>A</Avatar>
								<Box sx={{ display: { xs: 'none', md: 'block' } }}>
									<Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Admin User</Typography>
									<Typography sx={{ fontSize: 11, color: '#64748b' }}>Super Admin</Typography>
								</Box>
							</Stack>
						</Stack>
					</Stack>

					<RiskScoreCard metrics={riskMetrics} />

					<Grid container spacing={2}>
						<Grid size={{ xs: 12, lg: 6.6 }}>
							<Paper
								sx={{
									p: 2,
									borderRadius: 0,
									border: '1px solid #e6ecf7',
									transition: 'transform .22s ease, box-shadow .22s ease',
									cursor: 'pointer',
									'&:hover': {
										transform: 'translateY(-6px)',
										boxShadow: '0 16px 36px rgba(37,99,235,0.08), 0 0 20px rgba(37,99,235,0.04)',
									},
								}}
							>
								<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
									<Typography sx={{ fontWeight: 700, color: '#1f2937' }}>Revenue & Subscriptions Overview</Typography>
									<TextField select size="small" defaultValue="week" sx={{ width: 112 }}>
										<MenuItem value="week">This Week</MenuItem>
										<MenuItem value="month">This Month</MenuItem>
									</TextField>
								</Stack>
								<Box sx={{ height: 240 }}>
									<ResponsiveContainer>
										<LineChart data={attemptsOverviewData}>
											<CartesianGrid strokeDasharray="4 4" stroke="#edf2fc" />
											<XAxis dataKey="day" stroke="#7b879a" />
											<YAxis stroke="#7b879a" tickFormatter={(value) => `₹${value / 1000}k`} />
											<Tooltip formatter={(value, name) => [name === 'Revenue' ? `₹${value}` : value, name]} />
											<Legend />
											<Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} name="Revenue" dot={false} />
											<Line type="monotone" dataKey="subscriptions" stroke="#10b981" strokeWidth={3} name="New Subscriptions" dot={false} />
										</LineChart>
									</ResponsiveContainer>
								</Box>
							</Paper>
						</Grid>

						<Grid size={{ xs: 12, lg: 5.4 }}>
							<Paper
								sx={{
									p: 2,
									borderRadius: 0,
									border: '1px solid #e6ecf7',
									height: '100%',
									transition: 'transform .22s ease, box-shadow .22s ease',
									cursor: 'pointer',
									'&:hover': {
										transform: 'translateY(-6px)',
										boxShadow: '0 16px 36px rgba(37,99,235,0.06), 0 0 18px rgba(37,99,235,0.03)',
									},
								}}
							>
								<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
									<Typography sx={{ fontWeight: 700, color: '#1f2937' }}>Recent Transactions</Typography>
									<Typography sx={{ color: '#2563eb', fontWeight: 700, fontSize: 13 }}>View All</Typography>
								</Stack>
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell sx={{ color: '#667085', fontWeight: 700 }}>Customer</TableCell>
											<TableCell sx={{ color: '#667085', fontWeight: 700 }}>Plan</TableCell>
											<TableCell sx={{ color: '#667085', fontWeight: 700 }}>Amount</TableCell>
											<TableCell sx={{ color: '#667085', fontWeight: 700 }}>Status</TableCell>
											<TableCell sx={{ color: '#667085', fontWeight: 700 }}>Date</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{recentTests.map((txn) => (
											<TableRow key={txn.id}>
												<TableCell>
													<Stack direction="row" spacing={1} alignItems="center">
														<Box
															sx={{ width: 16, height: 16, borderRadius: 1, bgcolor: alpha(txn.iconColor, 0.18), border: `1px solid ${alpha(txn.iconColor, 0.5)}` }}
														/>
														<Typography sx={{ fontSize: 13, color: '#1e293b', fontWeight: 600 }}>{txn.name}</Typography>
													</Stack>
												</TableCell>
												<TableCell sx={{ color: '#475569' }}>{txn.plan}</TableCell>
												<TableCell sx={{ color: '#334155', fontWeight: 700 }}>{txn.amount}</TableCell>
												<TableCell>
													<Badge 
														sx={{ 
															'& .MuiBadge-badge': { 
																bgcolor: txn.status === 'Success' ? '#ecfdf5' : txn.status === 'Pending' ? '#fffbeb' : '#fef2f2',
																color: txn.status === 'Success' ? '#059669' : txn.status === 'Pending' ? '#d97706' : '#dc2626',
																fontSize: 10,
																fontWeight: 700,
																position: 'relative',
																transform: 'none',
																px: 1
															} 
														}}
														badgeContent={txn.status}
													/>
												</TableCell>
												<TableCell sx={{ color: '#64748b' }}>{txn.date}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</Paper>
						</Grid>
					</Grid>

					<Grid container spacing={2}>
						<Grid size={{ xs: 12, lg: 4.8 }}>
							<Paper
								sx={{
									p: 2,
									borderRadius: 0,
									border: '1px solid #e6ecf7',
									transition: 'transform .22s ease, box-shadow .22s ease',
									cursor: 'pointer',
									'&:hover': {
										transform: 'translateY(-6px)',
										boxShadow: '0 14px 30px rgba(37,99,235,0.06), 0 0 16px rgba(37,99,235,0.03)',
									},
								}}
							>
								<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.2 }}>
									<Typography sx={{ fontWeight: 700, color: '#1f2937' }}>Subscription Plan Breakdown</Typography>
									<TextField select size="small" defaultValue="month" sx={{ width: 112 }}>
										<MenuItem value="month">This Month</MenuItem>
										<MenuItem value="week">This Week</MenuItem>
									</TextField>
								</Stack>
								<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
									<Box sx={{ width: '100%', maxWidth: 250, height: 200 }}>
										<ResponsiveContainer>
											<PieChart>
												<Pie
													data={registrationBreakdownData}
													dataKey="value"
													nameKey="name"
													innerRadius={45}
													outerRadius={78}
													paddingAngle={3}
												>
													{registrationBreakdownData.map((entry) => (
														<Cell key={entry.name} fill={entry.color} />
													))}
												</Pie>
												<Tooltip formatter={(value) => `${value}%`} />
											</PieChart>
										</ResponsiveContainer>
									</Box>
 
									<Stack spacing={1} sx={{ flex: 1 }}>
										<Typography sx={{ fontSize: 13, color: '#475569', fontWeight: 700 }}>
											Revenue Distribution
										</Typography>
										<Typography sx={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
											This chart shows the percentage of your total subscriber base across each pricing tier.
										</Typography>
										<Stack spacing={1}>
											{registrationBreakdownData.map((slice) => (
												<Stack key={slice.name} direction="row" spacing={1} alignItems="flex-start">
													<Box sx={{ width: 10, height: 10, mt: 0.5, bgcolor: slice.color, flexShrink: 0 }} />
													<Box>
														<Typography sx={{ fontSize: 12, fontWeight: 700, color: '#1f2937' }}>{slice.name} ({slice.value}%)</Typography>
														<Typography sx={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>{slice.description}</Typography>
													</Box>
												</Stack>
											))}
										</Stack>
									</Stack>
								</Stack>
							</Paper>
						</Grid>

						<Grid size={{ xs: 12, lg: 3.2 }}>
							<Paper
								sx={{
									p: 2,
									borderRadius: 0,
									border: '1px solid #e6ecf7',
									height: '100%',
									transition: 'transform .22s ease, box-shadow .22s ease',
									cursor: 'pointer',
									'&:hover': {
										transform: 'translateY(-6px)',
										boxShadow: '0 14px 30px rgba(37,99,235,0.06), 0 0 16px rgba(37,99,235,0.03)',
									},
								}}
							>
								<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.2 }}>
									<Typography sx={{ fontWeight: 700, color: '#1f2937' }}>Top Performing Plans</Typography>
									<Typography sx={{ color: '#2563eb', fontWeight: 700, fontSize: 13 }}>View All</Typography>
								</Stack>
								<Stack spacing={1.1}>
									{topPerformingTests.map((plan) => (
										<Box key={plan.id}>
											<Stack direction="row" justifyContent="space-between" alignItems="center">
												<Stack direction="row" spacing={0.8} alignItems="center">
													<Box sx={{ width: 18, height: 18, borderRadius: 1, bgcolor: alpha(plan.color, 0.14), display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: plan.color }}>
														{plan.rank}
													</Box>
													<Box>
														<Typography sx={{ fontSize: 13, color: '#1f2937', fontWeight: 600 }}>{plan.name}</Typography>
														<Typography sx={{ fontSize: 11, color: '#64748b' }}>₹{plan.attempts.toLocaleString()} revenue</Typography>
													</Box>
												</Stack>
												<Typography sx={{ fontWeight: 700, color: '#334155', fontSize: 13 }}>{plan.score}% share</Typography>
											</Stack>
											<Box sx={{ height: 4, borderRadius: 99, bgcolor: '#eef2fb', mt: 0.7 }}>
												<Box sx={{ height: '100%', width: `${plan.score}%`, borderRadius: 99, bgcolor: plan.color }} />
											</Box>
											<Divider sx={{ mt: 1 }} />
										</Box>
									))}
								</Stack>
							</Paper>
						</Grid>

						<Grid size={{ xs: 12, lg: 4 }}>
							<AlertsPanel alerts={alertsData} />
						</Grid>
					</Grid>

					<SecurityOverview items={securityData} />
				</Stack>
			</Box>
		</Box>
	);
};

export default DashboardPage;
