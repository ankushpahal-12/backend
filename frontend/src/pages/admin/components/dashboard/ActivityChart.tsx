import { Box, Grid, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

export interface AttemptsOverviewPoint {
	day: string;
	attempts: number;
	uniqueUsers: number;
}

export interface ActivityTrendPoint {
	time: string;
	activeUsers: number;
}

interface ActivityChartProps {
	attemptsData: AttemptsOverviewPoint[];
	activityData: ActivityTrendPoint[];
}

const ActivityChart = ({ attemptsData, activityData }: ActivityChartProps) => {
	const theme = useTheme();

	return (
		<Grid container spacing={2.5}>
			<Grid size={{ xs: 12, lg: 8 }}>
				<Paper
					sx={{
						p: 2.5,
						borderRadius: 3,
						border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
						transition: 'transform .22s ease, box-shadow .22s ease',
						cursor: 'pointer',
						'&:hover': {
							transform: 'translateY(-6px)',
							boxShadow: `0 16px 36px ${alpha(theme.palette.primary.main, 0.12)}, 0 0 20px ${alpha(
								theme.palette.primary.main,
								0.06
							)}`,
						},
						height: 380,
					}}
				>
					<Stack spacing={0.5} sx={{ mb: 2 }}>
						<Typography variant="h6" sx={{ fontWeight: 800 }}>
							Attempts Overview
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Attempts vs unique users across the latest period
						</Typography>
					</Stack>

					<Box sx={{ width: '100%', height: 296 }}>
						<ResponsiveContainer>
							<LineChart data={attemptsData}>
								<CartesianGrid strokeDasharray="4 4" stroke={alpha(theme.palette.divider, 0.7)} />
								<XAxis dataKey="day" stroke={theme.palette.text.secondary} />
								<YAxis stroke={theme.palette.text.secondary} />
								<Tooltip
									contentStyle={{
										borderRadius: 12,
										border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
									}}
								/>
								<Legend />
								<Line
									type="monotone"
									dataKey="attempts"
									stroke={theme.palette.primary.main}
									strokeWidth={3}
									dot={{ r: 3 }}
									activeDot={{ r: 5 }}
									name="Attempts"
								/>
								<Line
									type="monotone"
									dataKey="uniqueUsers"
									stroke={theme.palette.success.main}
									strokeWidth={3}
									dot={{ r: 3 }}
									activeDot={{ r: 5 }}
									name="Unique Users"
								/>
							</LineChart>
						</ResponsiveContainer>
					</Box>
				</Paper>
			</Grid>

			<Grid size={{ xs: 12, lg: 4 }}>
				<Paper
					sx={{
						p: 2.5,
						borderRadius: 3,
						border: `1px solid ${alpha(theme.palette.info.main, 0.16)}`,
						transition: 'transform .22s ease, box-shadow .22s ease',
						cursor: 'pointer',
						'&:hover': {
							transform: 'translateY(-6px)',
							boxShadow: `0 16px 36px ${alpha(theme.palette.info.main, 0.12)}, 0 0 20px ${alpha(
								theme.palette.info.main,
								0.06
							)}`,
						},
						height: 380,
					}}
				>
					<Stack spacing={0.5} sx={{ mb: 2 }}>
						<Typography variant="h6" sx={{ fontWeight: 800 }}>
							User Activity Trends
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Current day engagement pattern
						</Typography>
					</Stack>

					<Box sx={{ width: '100%', height: 296 }}>
						<ResponsiveContainer>
							<AreaChart data={activityData}>
								<CartesianGrid strokeDasharray="4 4" stroke={alpha(theme.palette.divider, 0.7)} />
								<XAxis dataKey="time" stroke={theme.palette.text.secondary} />
								<YAxis stroke={theme.palette.text.secondary} />
								<Tooltip
									contentStyle={{
										borderRadius: 12,
										border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
									}}
								/>
								<Area
									type="monotone"
									dataKey="activeUsers"
									stroke={theme.palette.info.main}
									fill={alpha(theme.palette.info.main, 0.28)}
									strokeWidth={3}
									name="Active Users"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</Box>
				</Paper>
			</Grid>
		</Grid>
	);
};

export default ActivityChart;
