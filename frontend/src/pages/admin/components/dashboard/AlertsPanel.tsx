import {
	Avatar,
	Chip,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Paper,
	Stack,
	Typography,
	alpha,
	useTheme,
} from '@mui/material';

export interface AlertItem {
	id: string;
	user: string;
	context: string;
	detection: string;
	risk: 'Low' | 'Medium' | 'High';
	timeAgo: string;
}

interface AlertsPanelProps {
	alerts: AlertItem[];
}

const AlertsPanel = ({ alerts }: AlertsPanelProps) => {
	const theme = useTheme();

	const riskColor = (risk: AlertItem['risk']) => {
		if (risk === 'High') {
			return {
				text: theme.palette.error.dark,
				bg: alpha(theme.palette.error.main, 0.16),
			};
		}
		if (risk === 'Medium') {
			return {
				text: theme.palette.warning.dark,
				bg: alpha(theme.palette.warning.main, 0.16),
			};
		}
		return {
			text: theme.palette.success.dark,
			bg: alpha(theme.palette.success.main, 0.16),
		};
	};

	return (
		<Paper
			sx={{
				p: 2.5,
				borderRadius: 0,
				border: `1px solid ${alpha(theme.palette.error.main, 0.16)}`,
				height: '100%',
				transition: 'transform .22s ease, box-shadow .22s ease',
				cursor: 'pointer',
				'&:hover': {
					transform: 'translateY(-6px)',
					boxShadow: `0 14px 30px ${alpha(theme.palette.error.main, 0.12)}, 0 0 20px ${alpha(
						theme.palette.error.main,
						0.06
					)}`,
				},
			}}
		>
			<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.4 }}>
				<Typography variant="h6" sx={{ fontWeight: 800 }}>
					Suspicious Activity Alerts
				</Typography>
				<Chip
					size="small"
					label={`${alerts.length} open`}
					sx={{
						bgcolor: alpha(theme.palette.error.main, 0.16),
						color: theme.palette.error.dark,
						fontWeight: 700,
					}}
				/>
			</Stack>

			<List disablePadding sx={{ mt: 0.4 }}>
				{alerts.map((alert) => {
					const colors = riskColor(alert.risk);

					return (
						<ListItem
							key={alert.id}
							divider
							disableGutters
							sx={{
								py: 1.2,
								borderColor: alpha(theme.palette.divider, 0.6),
							}}
						>
							<ListItemAvatar>
								<Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.14), color: theme.palette.primary.main }}>
									{alert.user.charAt(0)}
								</Avatar>
							</ListItemAvatar>
							<ListItemText
								primary={
									<Typography sx={{ fontWeight: 700, fontSize: 14 }}>
										{alert.user}
									</Typography>
								}
								secondary={
									<Stack spacing={0.2} sx={{ mt: 0.2 }}>
										<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
											{alert.context}
										</Typography>
										<Typography variant="caption" color="text.secondary">
											{alert.detection}
										</Typography>
									</Stack>
								}
							/>
							<Stack alignItems="flex-end" spacing={0.8}>
								<Typography variant="caption" color="text.secondary">
									{alert.timeAgo}
								</Typography>
								<Chip
									size="small"
									label={`${alert.risk} Risk`}
									sx={{
										bgcolor: colors.bg,
										color: colors.text,
										fontWeight: 700,
									}}
								/>
							</Stack>
						</ListItem>
					);
				})}
			</List>
		</Paper>
	);
};

export default AlertsPanel;
